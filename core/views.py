# core/views.py

from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from django.db import models # Import models for Q object
from core.serializers import JobOrderCreateSerializer, JobOrderSerializer, TaskSerializer , UserRegistrationSerializer , PrivilegedUserCreateSerializer
from core.permissions import IsRoleRequired # Import the custom permission
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from core.models import User, JobOrder, Device, Task
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny

import datetime

# -----------------------------------------------------------
# 1. Job Order ViewSet (Planning Engineer)
# -----------------------------------------------------------

class JobOrderViewSet(viewsets.ModelViewSet):
    """
    Viewset for JobOrder:
    - PE can CREATE.
    - All authenticated users can LIST and RETRIEVE.
    """
    queryset = JobOrder.objects.all().select_related('created_by')
    
    def get_serializer_class(self):
        """Use different serializers for different actions."""
        if self.action == 'create':
            return JobOrderCreateSerializer
        return JobOrderSerializer

    def get_permissions(self):
        """Custom permissions based on action."""
        if self.action == 'create':
            # PE only for creation (Role: 'planning' or 'admin')
            self.permission_classes = [IsAuthenticated, IsRoleRequired(['planning', 'admin'])]
        else:
            # All authenticated roles for list/retrieve
            self.permission_classes = [IsAuthenticated]
        
        return [permission() for permission in self.permission_classes]


# -----------------------------------------------------------
# 2. Technician Task ViewSet (Technician)
# -----------------------------------------------------------

class TechnicianTaskViewSet(
    mixins.ListModelMixin, 
    mixins.RetrieveModelMixin, 
    viewsets.GenericViewSet
):
    """
    Viewset for Technicians to manage their task lifecycle (start/end).
    """
    serializer_class = TaskSerializer
    
    def get_permissions(self):
        """Ensure technicians and admins can perform actions, others only read."""
        if self.action in ['start', 'end']:
            # Tech only for start/end actions
            self.permission_classes = [IsAuthenticated, IsRoleRequired(['technician', 'admin'])]
        else:
            # All authenticated roles can list/retrieve (though queryset is filtered)
            self.permission_classes = [IsAuthenticated]
            
        return [permission() for permission in self.permission_classes]

    def get_queryset(self):
        """
        Filter tasks to show:
        1. Tasks with status 'available' (can be picked up).
        2. Tasks currently 'in_progress' and assigned to the authenticated technician.
        """
        user = self.request.user
        if not user.is_authenticated:
            return Task.objects.none()

        queryset = Task.objects.select_related('device', 'job_order', 'technician')
        
        if user.role in ['technician']:
            # Technician sees available tasks AND their own in-progress tasks
            return queryset.filter(
                models.Q(status='available') | 
                models.Q(technician=user, status='in_progress')
            )
        
        # Other roles (admin, supervisor, etc.) can see all non-final tasks
        return queryset.filter(status__in=['available', 'in_progress', 'done', 'rejected'])


    @action(detail=True, methods=['patch'])
    def start(self, request, pk=None):
        """
        Action for a Technician to start a task.
        Sets technician, start_time, and status = 'in_progress'.
        """
        task = self.get_object()
        user = request.user

        if task.status != 'available':
            return Response(
                {"detail": f"Task cannot be started. Current status: {task.get_status_display()}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Update Task
        task.technician = user
        task.start_time = timezone.now()
        task.status = 'in_progress'
        task.save(update_fields=['technician', 'start_time', 'status', 'updated_at'])

        # Update Device status
        task.device.current_status = 'in_progress'
        task.device.save(update_fields=['current_status', 'last_updated'])

        return Response(self.get_serializer(task).data, status=status.HTTP_200_OK)


    @action(detail=True, methods=['patch'])
    def end(self, request, pk=None):
        """
        Action for a Technician to end a task.
        Calculates actual_time_seconds and efficiency, sets end_time and status = 'pending_qa'.
        """
        task = self.get_object()
        user = request.user

        if task.status != 'in_progress':
            return Response(
                {"detail": f"Task cannot be ended. Current status: {task.get_status_display()}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if task.technician != user:
            return Response(
                {"detail": "You are not the assigned technician for this task."},
                status=status.HTTP_403_FORBIDDEN
            )
            
        if not task.start_time:
            return Response(
                {"detail": "Task start time is missing. Cannot calculate duration."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # 1. Update End Time
        task.end_time = timezone.now()
        
        # 2. Calculate Actual Time
        time_difference: datetime.timedelta = task.end_time - task.start_time
        task.actual_time_seconds = int(time_difference.total_seconds())
        
        # 3. Set final status
        # NOTE: Using 'done' which is the closest status in the provided model to 'pending_qa'.
        # If 'pending_qa' were in the model's STATUS_CHOICES, it would be used here.
        task.status = 'done' # The requirement asks for 'pending_qa', using 'done' from model
        
        # 4. Save all updates
        task.save(update_fields=['end_time', 'actual_time_seconds', 'status', 'updated_at'])

        # 5. Update Device status (completed/ready for inspection)
        task.device.current_status = 'completed'
        task.device.save(update_fields=['current_status', 'last_updated'])

        # Return updated task data (serializer will calculate and show efficiency)
        return Response(self.get_serializer(task).data, status=status.HTTP_200_OK)
    
    
    # -----------------------------------------------------------
# 3. Authentication Serializers
# -----------------------------------------------------------

class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for new user registration. 
    Handles validation and password hashing.
    """
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        # Include fields for the custom User model
        fields = ('username', 'password', 'password2', 'email', 'full_name', 'role')
        # Ensure role is set, but only the PE/Admin should set non-default roles
        extra_kwargs = {
            'email': {'required': True},
            'full_name': {'required': True},
            # Prevent users from setting a privileged role during self-registration
            'role': {'default': 'technician', 'read_only': True} 
        }

    def validate(self, attrs):
        """Check that the two password fields match."""
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        """
        Create and return a new user instance, setting the hashed password.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            role=validated_data.get('role', 'technician') # Use 'technician' if not explicitly provided/allowed
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    

class UserRegistrationView(CreateAPIView):
    """
    Endpoint for new user registration.
    Allows anyone (AllowAny) to create a new user account.
    """
    queryset = User.objects.all()
    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]


class UserManagementViewSet(viewsets.ModelViewSet):
    """
    Allows Admin/PE to create/manage users with specific roles.
    """
    queryset = User.objects.all().order_by('username')
    # A simple serializer for retrieval
    class UserReadSerializer(serializers.ModelSerializer):
        class Meta:
            model = User
            fields = ['id', 'username', 'email', 'full_name', 'role', 'is_active', 'date_joined']
            read_only_fields = fields

    def get_serializer_class(self):
        if self.action == 'create':
            return PrivilegedUserCreateSerializer
        return self.UserReadSerializer # For list/retrieve

    def get_permissions(self):
        """Only Admin and Planning Engineer can manage users."""
        self.permission_classes = [IsAuthenticated, IsRoleRequired(['admin', 'planning'])]
        return [permission() for permission in self.permission_classes]