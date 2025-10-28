# Backend Integration Guide - Daily Report Endpoint

## Overview

This guide explains how to implement the backend endpoint for daily report submission, which is required to complete the Technician UX enhancement feature.

## Current State

The frontend has a complete **Daily Report Modal** that:
- Collects technician work data (hours, minutes, completed tasks, notes)
- Validates all input fields
- Displays success/error messages
- **Currently simulates** the API call (no actual submission)

## Required Backend Implementation

### Endpoint Specification

```
HTTP Method: POST
URL: /api/v1/reports/
Content-Type: application/json
Authentication: Bearer <JWT_TOKEN>
```

### Request Body

```json
{
  "technician_id": 1,
  "date": "2024-01-15",
  "tasks_completed": 5,
  "time_spent_seconds": 28800,
  "notes": "Weather delayed job site access. All tasks completed except one postponed.",
  "task_ids": [12, 13, 14, 15, 16]
}
```

### Response (Success - 201)

```json
{
  "id": 42,
  "technician_id": 1,
  "date": "2024-01-15",
  "tasks_completed": 5,
  "time_spent_seconds": 28800,
  "time_spent_minutes": 480,
  "time_spent_hours": 8.0,
  "notes": "Weather delayed job site access...",
  "task_ids": [12, 13, 14, 15, 16],
  "created_at": "2024-01-15T17:45:30.123456Z",
  "status": "submitted"
}
```

### Response (Error - 400)

```json
{
  "error": "Invalid request",
  "details": {
    "time_spent_seconds": ["Value must be greater than 0"],
    "tasks_completed": ["At least one task must be completed"]
  }
}
```

## Django Implementation

### 1. Create the Model

**File**: `core/models.py`

```python
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class DailyReport(models.Model):
    STATUS_CHOICES = [
        ('submitted', 'Submitted'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]
    
    technician = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_reports')
    date = models.DateField()
    tasks_completed = models.IntegerField()
    time_spent_seconds = models.IntegerField()
    notes = models.TextField(blank=True, null=True)
    task_ids = models.JSONField(default=list, blank=True)  # List of task IDs
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='submitted')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-date', '-created_at']
        unique_together = ['technician', 'date']  # One report per day per technician
        verbose_name = 'Daily Report'
        verbose_name_plural = 'Daily Reports'
    
    def __str__(self):
        return f"{self.technician.username} - {self.date}"
    
    @property
    def time_spent_minutes(self):
        return self.time_spent_seconds // 60
    
    @property
    def time_spent_hours(self):
        return self.time_spent_seconds / 3600
```

### 2. Create Serializer

**File**: `core/serializers.py`

```python
from rest_framework import serializers
from .models import DailyReport

class DailyReportSerializer(serializers.ModelSerializer):
    technician_id = serializers.IntegerField(source='technician.id', read_only=True)
    time_spent_minutes = serializers.SerializerMethodField()
    time_spent_hours = serializers.SerializerMethodField()
    
    class Meta:
        model = DailyReport
        fields = [
            'id',
            'technician_id',
            'date',
            'tasks_completed',
            'time_spent_seconds',
            'time_spent_minutes',
            'time_spent_hours',
            'notes',
            'task_ids',
            'status',
            'created_at',
        ]
        read_only_fields = ['id', 'status', 'created_at']
    
    def get_time_spent_minutes(self, obj):
        return obj.time_spent_minutes
    
    def get_time_spent_hours(self, obj):
        return round(obj.time_spent_hours, 2)
    
    def validate_time_spent_seconds(self, value):
        if value <= 0:
            raise serializers.ValidationError("Time spent must be greater than 0 seconds")
        if value > 86400:  # 24 hours
            raise serializers.ValidationError("Time spent cannot exceed 24 hours")
        return value
    
    def validate_tasks_completed(self, value):
        if value < 0:
            raise serializers.ValidationError("Tasks completed cannot be negative")
        return value
    
    def validate(self, data):
        # Check for duplicate report on same day
        technician = self.context['request'].user
        date = data.get('date')
        
        if self.instance is None:  # Creating new report
            if DailyReport.objects.filter(technician=technician, date=date).exists():
                raise serializers.ValidationError(
                    "You already submitted a report for this day"
                )
        
        return data
```

### 3. Create ViewSet

**File**: `core/views.py`

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import DailyReport
from .serializers import DailyReportSerializer

class DailyReportViewSet(viewsets.ModelViewSet):
    serializer_class = DailyReportSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return only reports for the current user"""
        return DailyReport.objects.filter(technician=self.request.user)
    
    def perform_create(self, serializer):
        """Automatically set the technician to the current user"""
        serializer.save(technician=self.request.user)
    
    def create(self, request, *args, **kwargs):
        """Create a new daily report with validation"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['get'])
    def today(self, request):
        """Get today's report if exists"""
        today = timezone.now().date()
        report = DailyReport.objects.filter(
            technician=request.user,
            date=today
        ).first()
        
        if report:
            serializer = self.get_serializer(report)
            return Response(serializer.data)
        return Response({'detail': 'No report for today'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'])
    def monthly(self, request):
        """Get all reports for current month"""
        today = timezone.now().date()
        start_of_month = today.replace(day=1)
        reports = DailyReport.objects.filter(
            technician=request.user,
            date__gte=start_of_month,
            date__lte=today
        ).order_by('-date')
        serializer = self.get_serializer(reports, many=True)
        return Response(serializer.data)
```

### 4. Register in Router

**File**: `joddb_backend/urls.py`

```python
from rest_framework.routers import DefaultRouter
from core.views import DailyReportViewSet

router = DefaultRouter()
# ... existing registrations ...
router.register(r'reports', DailyReportViewSet, basename='daily-report')

urlpatterns = [
    # ... existing paths ...
    path('api/v1/', include(router.urls)),
]
```

### 5. Run Migrations

```bash
# Create migration
python manage.py makemigrations

# Apply migration
python manage.py migrate
```

## Frontend Integration

### Update API Service

**File**: `frontend/src/services/api.ts`

```typescript
// Add to api object
reports: {
  submitDailyReport: (data: {
    date: string;
    tasks_completed: number;
    time_spent_seconds: number;
    notes?: string;
    task_ids?: number[];
  }): Promise<any> => {
    return api.post('/reports/', data).then(res => res.data);
  },
  
  getTodayReport: (): Promise<any> => {
    return api.get('/reports/today/').then(res => res.data);
  },
  
  getMonthlyReports: (): Promise<any[]> => {
    return api.get('/reports/monthly/')
      .then(res => handlePaginatedResponse(res.data));
  },
},
```

### Update DailyReportModal

**File**: `frontend/src/components/technician/DailyReportModal.tsx`

In `handleSubmitDailyReport`:

```typescript
const handleSubmitDailyReport = async (reportData: {
  tasksCompleted: number;
  totalTimeMinutes: number;
  notes: string;
}) => {
  setReportSubmitting(true);
  try {
    await api.reports.submitDailyReport({
      date: new Date().toISOString().split('T')[0],
      tasks_completed: reportData.tasksCompleted,
      time_spent_seconds: reportData.totalTimeMinutes * 60,
      notes: reportData.notes,
      task_ids: getTasksForReport().map(t => t.id),
    });
    
    setShowDailyReport(false);
    alert('Daily report submitted successfully!');
  } catch (err: any) {
    console.error('Failed to submit report:', err);
    alert(err.response?.data?.detail || 'Failed to submit report');
  } finally {
    setReportSubmitting(false);
  }
};
```

## Database Schema

```sql
-- Table created by Django model
CREATE TABLE core_dailyreport (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    technician_id BIGINT NOT NULL REFERENCES auth_user(id),
    date DATE NOT NULL,
    tasks_completed INT NOT NULL,
    time_spent_seconds INT NOT NULL,
    notes TEXT,
    task_ids JSON,
    status VARCHAR(20) DEFAULT 'submitted',
    created_at TIMESTAMP AUTO_CURRENT_TIMESTAMP,
    updated_at TIMESTAMP AUTO_CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE(technician_id, date),
    INDEX(technician_id),
    INDEX(date)
);
```

## Admin Interface

Add to **`core/admin.py`**:

```python
from django.contrib import admin
from .models import DailyReport

@admin.register(DailyReport)
class DailyReportAdmin(admin.ModelAdmin):
    list_display = ['technician', 'date', 'tasks_completed', 'time_spent_hours', 'status']
    list_filter = ['status', 'date', 'created_at']
    search_fields = ['technician__username', 'technician__first_name']
    readonly_fields = ['created_at', 'updated_at', 'technician']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        if not request.user.is_superuser:
            qs = qs.filter(technician=request.user)
        return qs
```

## API Endpoints Summary

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/v1/reports/` | Submit daily report | ✅ |
| GET | `/api/v1/reports/` | List user's reports | ✅ |
| GET | `/api/v1/reports/{id}/` | Get specific report | ✅ |
| PATCH | `/api/v1/reports/{id}/` | Update report | ✅ |
| DELETE | `/api/v1/reports/{id}/` | Delete report | ✅ |
| GET | `/api/v1/reports/today/` | Get today's report | ✅ |
| GET | `/api/v1/reports/monthly/` | Get monthly reports | ✅ |

## Testing the Endpoint

### Using cURL

```bash
curl -X POST http://localhost:8000/api/v1/reports/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "tasks_completed": 5,
    "time_spent_seconds": 28800,
    "notes": "All tasks completed successfully",
    "task_ids": [12, 13, 14, 15, 16]
  }'
```

### Using Python

```python
import requests

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

data = {
    'date': '2024-01-15',
    'tasks_completed': 5,
    'time_spent_seconds': 28800,
    'notes': 'All completed',
    'task_ids': [12, 13, 14, 15, 16]
}

response = requests.post(
    'http://localhost:8000/api/v1/reports/',
    headers=headers,
    json=data
)

print(response.json())
```

## Validation Rules

| Field | Rules | Error Message |
|-------|-------|---|
| `date` | Required, valid date format | "Invalid date format" |
| `tasks_completed` | Required, ≥ 0, integer | "Must be a non-negative integer" |
| `time_spent_seconds` | Required, > 0, ≤ 86400 | "Must be between 0 and 86400" |
| `notes` | Optional, max 1000 chars | "Max 1000 characters" |
| `task_ids` | Optional, list of integers | "Must be a list of integers" |
| **One per day** | Unique technician + date | "You already submitted a report for this day" |

## Permissions & Security

- ✅ Only authenticated users can submit reports
- ✅ Users can only access their own reports
- ✅ Superadmins can view all reports
- ✅ Admins can edit report status (approve/reject)
- ✅ Task IDs should be validated against actual completed tasks

## Future Enhancements

1. **Batch Reports**: Allow supervisor to review multiple technician reports
2. **Report Analytics**: Generate team productivity metrics
3. **Approval Workflow**: Add supervisor approval before finalization
4. **Notifications**: Email confirmations to supervisors
5. **Export**: Generate PDF/Excel reports
6. **History**: Track report modifications and audits

## Troubleshooting

### "Module not found" error
- Ensure `DailyReportViewSet` is imported in `urls.py`
- Check import path is correct

### "Migration fails" error
- Delete `.pyc` files in migrations folder
- Run `python manage.py migrate core --fake-initial` if needed

### "Permission denied" error
- Verify JWT token is valid
- Check user is authenticated
- Ensure user role has access

### "Date already exists" error
- User already submitted report for that date
- Frontend should check `/reports/today/` before showing modal

## Support

For implementation questions:
1. Review this guide completely
2. Check code comments in generated files
3. Test endpoints with cURL/Postman
4. Check Django debug toolbar for query issues
5. Review frontend console for API errors

---

**Version**: 1.0  
**Status**: Ready for Implementation  
**Priority**: High (Blocks feature completion)
