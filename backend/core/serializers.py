# core/serializers.py

from rest_framework import serializers
from core.notifications.utils import create_notification
from django.db import transaction
from django.core.validators import MinValueValidator
from rest_framework.exceptions import ValidationError
from core.models import JobOrder, Device, Task , Inspection, SupervisorReview # Assuming start_time/end_time/actual_time_seconds are added to Task model
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from core.models import User, JobOrder, Device, Task


# -----------------------------------------------------------
# 1. Job Order Serializers (PE Use)
# -----------------------------------------------------------

class JobOrderSerializer(serializers.ModelSerializer):
    """
    Standard serializer for JobOrder retrieval (list/detail).
    """
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = JobOrder
        fields = ['id', 'order_code', 'title', 'due_date', 'total_devices', 
                  'status', 'created_at', 'created_by_username']
        read_only_fields = fields


class JobOrderCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for Planning Engineer to create a JobOrder, Devices, and initial Tasks.
    Handles nested creation logic in the create() method.
    """
    # Custom field to accept a list of device serials (Write Only)
    device_serials = serializers.ListField(
        child=serializers.CharField(max_length=100), 
        write_only=True,
        min_length=1,
        help_text="List of unique serial numbers for devices in this job order."
    )
    # Field to pass standard time for tasks (Write Only)
    standard_time_seconds = serializers.IntegerField(
        validators=[MinValueValidator(1)],
        write_only=True,
        help_text="Standard time (in seconds) for the initial task of each device."
    )
    # Field for custom operation name (Write Only, optional)
    operation_name = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
        write_only=True,
        help_text="Name of the operation/task for this job order. If not provided, defaults to 'Initial Assembly for [OrderCode]'."
    )
    # Make description explicitly optional
    description = serializers.CharField(
        max_length=1000,
        required=False,
        allow_blank=True,
        help_text="Detailed description of the job order (optional)"
    )

    class Meta:
        model = JobOrder
        fields = ['order_code', 'title', 'description', 'due_date', 'standard_time_seconds', 'device_serials', 'operation_name']

    def validate_device_serials(self, value):
        """Check for unique serials within the input list and across the database."""
        if len(value) != len(set(value)):
            raise ValidationError("Device serial numbers must be unique within the request.")
        
        # Check for existence in the database (prevent duplicates)
        existing_serials = Device.objects.filter(serial_number__in=value).values_list('serial_number', flat=True)
        if existing_serials:
            raise ValidationError(f"The following serial numbers already exist: {', '.join(existing_serials)}")
        
        return value

    def create(self, validated_data):
        """
        Overrides create to handle nested JobOrder, Device, and Task creation.
        """
        device_serials = validated_data.pop('device_serials')
        standard_time = validated_data.pop('standard_time_seconds')
        # Get custom operation name, or use default
        operation_name = validated_data.pop('operation_name', None)
        if not operation_name or not operation_name.strip():
            operation_name = f"Initial Assembly for {validated_data.get('order_code')}"
        
        # Auto-calculated fields
        validated_data['total_devices'] = len(device_serials)
        validated_data['created_by'] = self.context['request'].user
        
        with transaction.atomic():
            # 1. Create JobOrder
            job_order = JobOrder.objects.create(**validated_data)
            
            devices_to_create = []
            tasks_to_create = []
            
            # 2. Prepare Devices
            for serial in device_serials:
                device = Device(job_order=job_order, serial_number=serial)
                devices_to_create.append(device)
            created_devices = Device.objects.bulk_create(devices_to_create)
            
            # 3. Prepare initial Tasks (one task per device)
            for device in created_devices:
                task = Task(
                    device=device,
                    job_order=job_order,
                    operation_name=operation_name,
                    standard_time_seconds=standard_time,
                    status='available',
                )
                tasks_to_create.append(task)
            Task.objects.bulk_create(tasks_to_create)

        return job_order


# -----------------------------------------------------------
# 2. Task Serializer (Technician Use)
# -----------------------------------------------------------

class TaskSerializer(serializers.ModelSerializer):
    """
    Serializer for general task retrieval and display.
    Includes calculated efficiency.
    """
    job_order_code = serializers.CharField(source='job_order.order_code', read_only=True)
    device_serial = serializers.CharField(source='device.serial_number', read_only=True)
    technician_username = serializers.CharField(source='technician.username', read_only=True)
    efficiency = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = ['id', 'job_order_code', 'device_serial', 'technician_username', 
                  'operation_name', 'standard_time_seconds', 'start_time', 
                  'end_time', 'actual_time_seconds', 'status', 'efficiency', 'created_at']
        read_only_fields = fields

    def get_efficiency(self, obj):
        """Calls the model method to calculate efficiency."""
        return obj.calculate_efficiency()
    

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
        fields = ('username', 'password', 'password2', 'email', 'full_name', 'role')
        extra_kwargs = {
            'email': {'required': True},
            'full_name': {'required': True},
            # 👇 CHANGE: Allow 'role' to be written and validated against choices
            # 'role': {'default': 'technician', 'read_only': True} # REMOVE OR COMMENT OUT THIS LINE
            'role': {'required': True} # You might enforce that a role is chosen
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
    

class PrivilegedUserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for Admin/PE to create users with any role.
    This replaces the self-registration serializer.
    """
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        # Allows setting all fields, including role
        fields = ('username', 'password', 'email', 'full_name', 'role')

    def create(self, validated_data):
        """
        Creates a user instance, respects the 'role' field in validated_data.
        """
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            role=validated_data['role'] 
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
    

class UserReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'role', 'is_active', 'date_joined']
        read_only_fields = fields


# -----------------------------------------------------------
# 4. Inspection and Review Serializers
# -----------------------------------------------------------

class InspectionSerializer(serializers.ModelSerializer):
    """
    Serializer for Quality Inspector to perform an Inspection.
    Validates that comments are mandatory upon rejection.
    """
    task_id = serializers.PrimaryKeyRelatedField(
        queryset=Task.objects.all(),
        write_only=True
    )

    class Meta:
        model = Inspection
        fields = ['id', 'task_id', 'decision', 'comments', 'created_at']
        read_only_fields = ['id', 'created_at']

    def validate(self, data):
        """
        Custom validation: If decision is 'rejected', comments must not be empty.
        """
        if data['decision'] == 'rejected' and not data.get('comments'):
            raise ValidationError(
                {"comments": "Comments are mandatory when rejecting an inspection."}
            )
        
        # Further validation: Task must be ready for QA
        task = data['task_id']
        # Assumes the task status after 'end' action is 'done' (or 'pending_qa')
        if task.status not in ['done', 'pending_qa']: 
             raise ValidationError(
                {"task_id": f"Task is not ready for inspection. Current status: {task.get_status_display()}."}
            )

        return data


class SupervisorReviewSerializer(serializers.ModelSerializer):
    """
    Serializer for Supervisor to perform the final Review.
    """
    inspection_id = serializers.PrimaryKeyRelatedField(
        queryset=Inspection.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = SupervisorReview
        fields = ['id', 'inspection_id', 'decision', 'comments', 'created_at']
        read_only_fields = ['id', 'created_at']

