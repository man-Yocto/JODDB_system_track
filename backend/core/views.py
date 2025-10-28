# core/views.py

from rest_framework import viewsets, mixins, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from django.db import models # Import models for Q object
from core.serializers import JobOrderCreateSerializer, JobOrderSerializer, TaskSerializer , UserRegistrationSerializer , PrivilegedUserCreateSerializer , InspectionSerializer, SupervisorReviewSerializer
from core.permissions import IsRoleRequired , IsPlanningEngineer, IsSupervisor # Import the custom permission
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from core.models import User, JobOrder, Device, Task , Inspection, SupervisorReview
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
#### Import for notifications
from core.notifications.utils import create_notification
from django.db import transaction

# Import our new calculation functions
from core.metrics import calculations

import datetime
import pandas as pd
import csv
from django.http import HttpResponse
from io import BytesIO

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
    
# -----------------------------------------------------------
# 4. Quality Inspection ViewSet (QI Use)
# -----------------------------------------------------------

class InspectionViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Viewset for Quality Inspector to perform inspections.
    """
    serializer_class = InspectionSerializer

    def get_queryset(self):
        """
        Show all inspections AND all tasks that are ready for inspection ('done' or 'pending_qa').
        NOTE: For simplicity, listing all inspections here.
        A proper list should filter based on user role/scope.
        """
        if self.request.user.role in ['quality', 'admin']:
            return Inspection.objects.all().select_related('task', 'task__device', 'inspector')
        return Inspection.objects.none()

    def get_permissions(self):
        """QI only for create, QI/Supervisor for list."""
        if self.action == 'create':
            self.permission_classes = [IsAuthenticated, IsRoleRequired(['quality', 'admin'])]
        else:
            self.permission_classes = [IsAuthenticated, IsRoleRequired(['quality', 'supervisor', 'admin'])]
        return [permission() for permission in self.permission_classes]

    def perform_create(self, serializer):
        """
        Saves the inspection and updates the Task status based on the decision,
        and triggers a notification upon rejection.
        """
        decision = serializer.validated_data['decision']
        task = serializer.validated_data['task_id']
        
        with transaction.atomic():
            # 1. Save the Inspection record
            inspection = serializer.save(inspector=self.request.user, device=task.device)
            
            # 2. Update Task status
            if decision == 'accepted':
                # Task moves to the next stage
                task_new_status = 'pending_supervisor'
                task.status = task_new_status
                task.save(update_fields=['status', 'updated_at'])
            
            elif decision == 'rejected':
                # Task goes back to the Technician
                task_new_status = 'rejected' 
                task.status = task_new_status
                task.device.current_status = 'rejected' # Update device status
                task.save(update_fields=['status', 'updated_at'])
                task.device.save(update_fields=['current_status', 'last_updated'])

                # 3. TRIGGER NOTIFICATION TO TECHNICIAN
                if task.technician:
                    message = f"Task {task.id} on device {task.device.serial_number} was rejected by QI: {inspection.comments[:50]}..."
                    create_notification( # <--- هنا يتم استخدام الدالة
                        user_id=task.technician.id,
                        type='task_rejected',
                        message=message,
                        payload={'task_id': task.id, 'job_order_code': task.job_order.order_code}
                    )
                
            # If the task status changes, the JobOrder status might need to be updated as well
            # (Logic for JobOrder update is complex and left outside the scope of this prompt)


# -----------------------------------------------------------
# 5. Supervisor Review ViewSet (Supervisor Use)
# -----------------------------------------------------------

class SupervisorReviewViewSet(mixins.CreateModelMixin, mixins.ListModelMixin, viewsets.GenericViewSet):
    """
    Viewset for Supervisor to perform the final review of an inspection.
    """
    serializer_class = SupervisorReviewSerializer
    queryset = SupervisorReview.objects.all().select_related('inspection', 'supervisor')
    
    def get_permissions(self):
        """Supervisor only for create, Supervisor/PE for list."""
        if self.action == 'create':
            self.permission_classes = [IsAuthenticated, IsRoleRequired(['supervisor', 'admin'])]
        else:
            self.permission_classes = [IsAuthenticated, IsRoleRequired(['supervisor', 'planning', 'admin'])]
        return [permission() for permission in self.permission_classes]
    
    def perform_create(self, serializer):
        """
        Saves the review and updates the final Task status based on the decision.
        """
        decision = serializer.validated_data['decision']
        inspection = serializer.validated_data['inspection_id']
        task = inspection.task # Get the related Task
        
        with transaction.atomic():
            # 1. Save the Review record
            supervisor_review = serializer.save(supervisor=self.request.user)
            
            # 2. Update Task status
            if decision == 'accepted':
                # Task is fully completed and accepted
                task_new_status = 'completed' # Assumes 'completed' is an available choice
                device_new_status = 'completed'
            elif decision == 'rejected':
                # Final rejection, the task/device goes back to the rejected status for follow-up
                task_new_status = 'rejected' 
                device_new_status = 'rejected'

            task.status = task_new_status
            task.save(update_fields=['status', 'updated_at'])
            
            # Update Device status based on final review
            task.device.current_status = device_new_status
            task.device.save(update_fields=['current_status', 'last_updated'])
            
            return supervisor_review
        

from core.metrics.serializers import TechnicianMetricsSerializer

class TechnicianMetricsView(APIView):
    """
    Provides daily performance metrics (Productivity, Efficiency, Utilization)
    for a specific Technician.
    
    Access: Planning Engineer, Supervisor
    """
    permission_classes = [IsAuthenticated, (IsPlanningEngineer | IsSupervisor)]
    serializer_class = TechnicianMetricsSerializer

    def get(self, request, id, format=None):
        """
        GET /api/v1/metrics/technician/{id}/?date=YYYY-MM-DD
        
        If 'date' param is not provided, it defaults to the current date.
        """
        
        # 1. Validate Technician ID
        try:
            # Check that user exists and is a technician
            user = User.objects.get(id=id)
            if user.role != 'technician':
                return Response(
                    {"error": "Specified user is not a technician."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (User.DoesNotExist, ValueError):
            return Response(
                {"error": "Technician not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Validate Date Parameter
        date_str = request.query_params.get('date')
        if not date_str:
            target_date = timezone.now().date()
        else:
            try:
                target_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # 3. Calculate and Return Metrics
        metrics = calculations.calculate_technician_metrics(
            technician_id=id, 
            target_date=target_date
        )
        
        # 4. Serialize and return
        serializer = self.serializer_class(data=metrics)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


from core.metrics.serializers import JobOrderProgressSerializer

class JobOrderMetricsView(APIView):
    """
    Provides progress percentage, completion stats, and active alerts
    for a specific Job Order.
    
    Access: Planning Engineer, Supervisor
    """
    permission_classes = [IsAuthenticated, (IsPlanningEngineer | IsSupervisor)]
    serializer_class = JobOrderProgressSerializer

    def get(self, request, id, format=None):
        """
        GET /api/v1/metrics/job-order/{id}/
        
        Returns:
        - progress_percent: Overall completion percentage
        - total_completed: Count of completed devices
        - total_rejected: Count of rejected devices
        - total_devices: Total devices in job order
        - alerts: List of active alerts (efficiency/deadline)
        """
        
        # 1. Validate Job Order ID
        try:
            # Check that job order exists and is active
            job_order = JobOrder.objects.get(id=id)
            if job_order.status == 'archived':
                return Response(
                    {"error": "Cannot retrieve metrics for archived job orders."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except (JobOrder.DoesNotExist, ValueError):
            return Response(
                {"error": "Job Order not found."}, 
                status=status.HTTP_404_NOT_FOUND
            )

        # 2. Calculate Progress
        progress_data = calculations.calculate_job_order_progress(job_order_id=id)

        # 3. Check for Alerts
        alerts = calculations.check_alerts(job_order_id=id)
        
        # 4. Prepare Response Data
        response_data = {
            **progress_data,  # Unpacks the progress dict
            "alerts": alerts
        }
        
        # 5. Serialize and Return
        serializer = self.serializer_class(data=response_data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
# -----------------------------------------------------------
# 6. Excel Import View (Planning Engineer)
# -----------------------------------------------------------

class ExcelImportView(APIView):
    """
    Excel/CSV Import View for Planning Engineer to bulk create Job Orders.
    
    Endpoint: POST /api/v1/data/import/job-order/
    Role Access: Planning Engineer only
    """
    permission_classes = [IsAuthenticated, IsRoleRequired(['planning', 'admin'])]
    
    def post(self, request, format=None):
        """
        Handles file upload, processes Excel/CSV data, and creates Job Orders.
        
        Expected file format:
        - Columns: job_order_code, title, due_date, device_serial, standard_time_seconds
        - Multiple rows with same job_order_code will be grouped into one JO
        """
        # 1. Validate file upload
        if 'file' not in request.FILES:
            return Response(
                {"error": "No file provided. Please upload a CSV or Excel file."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        uploaded_file = request.FILES['file']
        file_extension = uploaded_file.name.split('.')[-1].lower()
        
        if file_extension not in ['csv', 'xlsx', 'xls']:
            return Response(
                {"error": "Invalid file format. Please upload CSV or Excel file."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # 2. Read file into DataFrame
            if file_extension == 'csv':
                df = pd.read_csv(uploaded_file)
            else:
                df = pd.read_excel(uploaded_file)
            
            # 3. Validate required columns
            required_columns = ['job_order_code', 'title', 'due_date', 'device_serial', 'standard_time_seconds']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            if missing_columns:
                return Response(
                    {"error": f"Missing required columns: {', '.join(missing_columns)}"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # 4. Process data and group by job_order_code
            job_orders_data = {}
            duplicates = []
            errors = []
            
            for index, row in df.iterrows():
                jo_code = str(row['job_order_code']).strip()
                device_serial = str(row['device_serial']).strip()
                
                # Check for duplicate device serials in DB
                if Device.objects.filter(serial_number=device_serial).exists():
                    duplicates.append(device_serial)
                    continue
                
                # Group by job order code
                if jo_code not in job_orders_data:
                    job_orders_data[jo_code] = {
                        'order_code': jo_code,
                        'title': str(row['title']).strip(),
                        'due_date': pd.to_datetime(row['due_date']).date(),
                        'standard_time_seconds': int(row['standard_time_seconds']),
                        'device_serials': []
                    }
                
                job_orders_data[jo_code]['device_serials'].append(device_serial)
            
            # 5. Create Job Orders using JobOrderCreateSerializer
            created_jos = []
            total_devices = 0
            
            with transaction.atomic():
                for jo_code, jo_data in job_orders_data.items():
                    # Check if JO already exists
                    if JobOrder.objects.filter(order_code=jo_code).exists():
                        errors.append(f"Job Order {jo_code} already exists")
                        continue
                    
                    # Use existing serializer for validation and creation
                    serializer = JobOrderCreateSerializer(
                        data=jo_data,
                        context={'request': request}
                    )
                    
                    if serializer.is_valid():
                        job_order = serializer.save()
                        created_jos.append(jo_code)
                        total_devices += len(jo_data['device_serials'])
                    else:
                        errors.append(f"Job Order {jo_code}: {serializer.errors}")
            
            # 6. Return structured summary
            return Response({
                "success": True,
                "summary": {
                    "total_job_orders_created": len(created_jos),
                    "total_devices_created": total_devices,
                    "created_job_orders": created_jos,
                    "duplicates": duplicates,
                    "errors": errors
                }
            }, status=status.HTTP_201_CREATED if created_jos else status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            return Response(
                {"error": f"Error processing file: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# -----------------------------------------------------------
# 7. Daily Report Export View (Planning Engineer & Supervisor)
# -----------------------------------------------------------

class DailyReportExportView(APIView):
    """
    Daily Report Export View for exporting completed tasks data.
    
    Endpoint: GET /api/v1/data/export/daily-report/?date=YYYY-MM-DD
    Role Access: Planning Engineer, Supervisor
    """
    permission_classes = [IsAuthenticated, (IsPlanningEngineer | IsSupervisor)]
    
    def get(self, request, format=None):
        """
        Exports daily report of completed and accepted tasks.
        
        Query Parameters:
        - date: YYYY-MM-DD format (optional, defaults to today)
        - format: 'csv' or 'excel' (optional, defaults to 'csv')
        """
        # 1. Validate and parse date parameter
        date_str = request.query_params.get('date')
        export_format = request.query_params.get('format', 'csv').lower()
        
        if not date_str:
            target_date = timezone.now().date()
        else:
            try:
                target_date = datetime.datetime.strptime(date_str, '%Y-%m-%d').date()
            except ValueError:
                return Response(
                    {"error": "Invalid date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # 2. Query completed tasks for the requested date
        # Filter tasks that were completed on the target date (using updated_at as completion date)
        tasks = Task.objects.filter(
            status__in=['done', 'pending_supervisor', 'completed'],
            updated_at__date=target_date
        ).select_related('job_order', 'device', 'technician')
        
        if not tasks.exists():
            return Response(
                {"message": f"No completed tasks found for {target_date}"},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # 3. Aggregate data into flat list
        report_data = []
        for task in tasks:
            efficiency = task.calculate_efficiency()
            
            report_data.append({
                'Job Order Code': task.job_order.order_code if task.job_order else 'N/A',
                'Device Serial': task.device.serial_number if task.device else 'N/A',
                'Technician Name': task.technician.full_name if task.technician else 'Unassigned',
                'Operation Name': task.operation_name,
                'Standard Time (seconds)': task.standard_time_seconds,
                'Actual Time (seconds)': task.actual_time_seconds if task.actual_time_seconds else 'N/A',
                'Efficiency (%)': f"{efficiency:.2f}" if efficiency else 'N/A',
                'Status': task.get_status_display(),
                'Start Time': task.start_time.strftime('%Y-%m-%d %H:%M:%S') if task.start_time else 'N/A',
                'End Time': task.end_time.strftime('%Y-%m-%d %H:%M:%S') if task.end_time else 'N/A',
            })
        
        # 4. Generate and serve the file response
        if export_format == 'excel':
            # Generate Excel file
            df = pd.DataFrame(report_data)
            output = BytesIO()
            
            with pd.ExcelWriter(output, engine='openpyxl') as writer:
                df.to_excel(writer, index=False, sheet_name='Daily Report')
            
            output.seek(0)
            
            response = HttpResponse(
                output.read(),
                content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            )
            response['Content-Disposition'] = f'attachment; filename="daily_report_{target_date}.xlsx"'
            
        else:  # CSV format (default)
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = f'attachment; filename="daily_report_{target_date}.csv"'
            
            writer = csv.DictWriter(response, fieldnames=report_data[0].keys())
            writer.writeheader()
            writer.writerows(report_data)
        
        return response