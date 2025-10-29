# Fix for JobOrderMetrics 500 Error

## Problem
When accessing `/api/v1/metrics/job-order/{id}/`, the backend returned HTTP 500 (Internal Server Error).

**Error Location**: `frontend/src/components/planner/JobOrderDetails.tsx:33`

## Root Cause Analysis

The issue was in the `backend/core/metrics/calculations.py` file which contained multiple bugs:

### Issue 1: Incorrect Task Model Field References
**File**: `backend/core/metrics/calculations.py`

The code was using non-existent attributes and status choices:
```python
# ❌ WRONG - Non-existent fields
Task.objects.filter(
    status=Task.Status.COMPLETED,  # Task model has no Status enum
    ended_at__date=target_date     # Task has no 'ended_at' field
)
completed_tasks.aggregate(
    total_standard_time=Sum('standard_time'),  # Field is 'standard_time_seconds'
    total_actual_time=Sum('actual_time')       # Field is 'actual_time_seconds'
)
```

**Actual Task Model Fields**:
```python
class Task(models.Model):
    standard_time_seconds = IntegerField()      # ← Correct field name
    actual_time_seconds = IntegerField(null=True)
    start_time = DateTimeField(null=True)
    end_time = DateTimeField(null=True)         # ← Correct field name
    status = CharField(
        choices=[
            'available',
            'in_progress',
            'done',           # ← Status is string, not enum
            'rejected',
        ]
    )
```

### Issue 2: Incorrect Device Model Status References
```python
# ❌ WRONG
Count('id', filter=Q(status=Device.Status.COMPLETED))  # No Status enum

# ✅ FIXED
Count('id', filter=Q(current_status='completed'))       # Correct field and value
```

### Issue 3: Incorrect Permission Class Syntax
**File**: `backend/core/views.py`

```python
# ❌ WRONG - Pipe operator doesn't work with permission classes
permission_classes = [IsAuthenticated, (IsPlanningEngineer | IsSupervisor)]

# ✅ FIXED - Use IsRoleRequired with role list
permission_classes = [IsAuthenticated]

def get_permissions(self):
    self.permission_classes = [
        IsAuthenticated, 
        IsRoleRequired(['planning', 'supervisor', 'admin'])
    ]
    return [permission() for permission in self.permission_classes]
```

## Changes Made

### 1. Fixed `calculate_technician_metrics()` function
**Changes**:
- `Task.Status.COMPLETED` → `'done'` (string, not enum)
- `ended_at__date` → `end_time__date` (correct field name)
- `status=Task.Status.COMPLETED` → `status='done'`
- `Sum('standard_time')` → `Sum('standard_time_seconds')`
- `Sum('actual_time')` → `Sum('actual_time_seconds')`
- `task.standard_time.total_seconds()` → `task.standard_time_seconds` (already an integer)
- `task.actual_time.total_seconds()` → `task.actual_time_seconds`
- Added division by zero protection

### 2. Fixed `calculate_job_order_progress()` function
**Changes**:
- `status=Device.Status.COMPLETED` → `current_status='completed'` (correct field and value)
- `status=Device.Status.REJECTED` → `current_status='rejected'`

### 3. Fixed `check_alerts()` function
**Changes**:
- `device__job_order_id=job_order_id` → Direct `job_order_id=job_order_id`
- `Task.Status.COMPLETED` → `'done'`
- `actual_time__gt=timedelta(0)` → `actual_time_seconds__gt=0`
- `JobOrder.Status.COMPLETED` → `'done'`
- `task.standard_time.total_seconds()` → `task.standard_time_seconds`
- `task.actual_time.total_seconds()` → `task.actual_time_seconds`

### 4. Fixed Permission Classes in `views.py`
**Changes**:
- Replaced pipe operator syntax with proper `get_permissions()` method override
- Applied fix to both `TechnicianMetricsView` and `JobOrderMetricsView`
- Consolidated imports to top of file

### 5. Consolidated Imports
**Changes**:
- Moved metric serializer imports from middle of file to top
- Removed duplicate imports

## Result

✅ The metrics endpoint now correctly:
1. Queries tasks using the correct field names and status values
2. Filters devices by the correct `current_status` field
3. Calculates progress percentages based on device completion counts
4. Checks for efficiency and due date alerts
5. Respects role-based permissions

## Testing

To verify the fix works:

```bash
# 1. Create a Job Order (as Planning Engineer)
POST /api/v1/job-orders/
{
    "order_code": "JO-TEST-001",
    "title": "Test Job Order",
    "due_date": "2025-11-30",
    "standard_time_seconds": 3600,
    "device_serials": ["DEV-001", "DEV-002", "DEV-003"]
}

# 2. Access the metrics endpoint (should return 200 with progress data)
GET /api/v1/metrics/job-order/1/
# Expected Response:
{
    "progress_percent": 0.0,
    "total_completed": 0,
    "total_rejected": 0,
    "total_devices": 3,
    "alerts": []
}
```

## Files Modified

1. ✅ `backend/core/metrics/calculations.py` - Fixed all field references
2. ✅ `backend/core/views.py` - Fixed permissions and consolidated imports

---

## Summary of Model Field Names

| Component | Incorrect | Correct |
|-----------|-----------|---------|
| Task Status | `Task.Status.COMPLETED` | `'done'` |
| Task Field | `ended_at` | `end_time` |
| Task Field | `standard_time` | `standard_time_seconds` |
| Task Field | `actual_time` | `actual_time_seconds` |
| Device Field | `status` | `current_status` |
| Device Status | `Device.Status.COMPLETED` | `'completed'` |
| JobOrder Status | `JobOrder.Status.COMPLETED` | `'done'` |

