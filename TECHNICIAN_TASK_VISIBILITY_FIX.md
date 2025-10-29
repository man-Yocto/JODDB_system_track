# Fix: Technicians Not Seeing Available Tasks

## Problem
When a Planning Engineer creates a new Job Order with tasks, technicians cannot see those new available tasks on their dashboard.

**What technician sees**: Empty task list (no available tasks)  
**What should happen**: Technician should see all available tasks to pick from

## Root Cause

The issue was in the `TechnicianTaskViewSet.get_queryset()` method in `backend/core/views.py` at line 98:

```python
# ❌ WRONG - Technician can only see their in-progress tasks
if user.role in ['technician']:
    return queryset.filter(technician=user, status='in_progress')
```

This filter only returns tasks that:
1. Are assigned to the technician (`technician=user`) **AND**
2. Are currently in-progress (`status='in_progress'`)

**But newly created tasks have:**
- `status = 'available'` (not 'in_progress')
- `technician = NULL` (not yet assigned)

So they don't match the filter! 🚫

## Solution

Change the filter to show **both** available tasks AND in-progress tasks:

```python
# ✅ CORRECT - Technician can see available tasks AND their own in-progress tasks
if user.role in ['technician']:
    return queryset.filter(
        Q(status='available') | Q(technician=user, status='in_progress')
    )
```

This returns tasks where:
1. Status is 'available' (anyone can see and start these), **OR**
2. Status is 'in_progress' **AND** technician is the current user

## Technical Explanation

### Task Lifecycle vs. Task Visibility

```
CREATE Task (by Planner)
    ↓
task.status = 'available'
task.technician = NULL
    ↓
[TECHNICIAN SHOULD SEE IT HERE] ← Was broken before fix
    ↓
Technician clicks "Start"
    ↓
task.status = 'in_progress'
task.technician = <current_user>
    ↓
[TECHNICIAN CAN NOW WORK ON IT]
    ↓
Technician clicks "End"
    ↓
task.status = 'done'
task.technician = <was working on it>
```

### Before vs. After

| Scenario | Before (❌) | After (✅) |
|----------|-----------|----------|
| Task status: 'available', technician: NULL | ❌ Not shown | ✅ Shown |
| Task status: 'in_progress', technician: Current User | ✅ Shown | ✅ Shown |
| Task status: 'in_progress', technician: Other User | ❌ Not shown | ❌ Not shown |
| Task status: 'done', technician: Anyone | ❌ Not shown | ❌ Not shown |

## The Q Object

The fix uses Django's `Q` object for complex filtering:

```python
from django.db.models import Q

queryset.filter(
    Q(status='available') | Q(technician=user, status='in_progress')
)
```

Translates to SQL:
```sql
WHERE (status = 'available') OR (technician_id = user_id AND status = 'in_progress')
```

## Changes Made

### File: `backend/core/views.py`

**1. Added Q import at top:**
```python
from django.db.models import Q
```

**2. Updated `get_queryset()` method in `TechnicianTaskViewSet`:**

```python
def get_queryset(self):
    """
    Filter tasks to show:
    1. All 'available' tasks (for technician to start)
    2. Tasks 'in_progress' assigned to the authenticated technician
    """
    user = self.request.user
    if not user.is_authenticated:
        return Task.objects.none()

    queryset = Task.objects.select_related('device', 'job_order', 'technician')
    
    if user.role in ['technician']:
        # Technician sees:
        # - Available tasks (anyone can start these)
        # - Their own in-progress tasks
        return queryset.filter(
            Q(status='available') | Q(technician=user, status='in_progress')
        )
    
    # Other roles (admin, supervisor, etc.) can see all non-final tasks
    return queryset.filter(status__in=['available', 'in_progress', 'done', 'rejected'])
```

## Testing

To verify the fix works:

### Step 1: Planning Engineer creates a Job Order
```bash
POST /api/v1/job-orders/
{
    "order_code": "JO-TEST-001",
    "title": "Test Job",
    "due_date": "2025-11-30",
    "standard_time_seconds": 3600,
    "device_serials": ["DEV-001", "DEV-002"]
}
```

Result: 2 tasks created with `status='available'`, `technician=NULL`

### Step 2: Technician fetches tasks
```bash
GET /api/v1/tasks/
Authorization: Bearer <technician_token>
```

**Before fix**: Returns empty list `[]`  
**After fix**: Returns 2 available tasks

### Step 3: Technician starts a task
```bash
PATCH /api/v1/tasks/1/start/
Authorization: Bearer <technician_token>
```

Result: Task 1 now has `status='in_progress'`, `technician=<current_technician>`

### Step 4: Fetch tasks again
```bash
GET /api/v1/tasks/
```

Returns: 
- Task 1 (in_progress, assigned to current technician)
- Task 2 (available, not assigned)

## Data Flow After Fix

```
Planning Engineer
    ↓
POST /api/v1/job-orders/
Creates Job Order + Devices + Tasks (all status='available')
    ↓
Technician Dashboard
    ↓
GET /api/v1/tasks/
Backend filters:
    Q(status='available') | Q(technician=user, status='in_progress')
    ↓
✓ Returns available tasks (status='available', technician=NULL)
✓ Returns in-progress tasks (status='in_progress', technician=current_user)
    ↓
Technician sees task list
    ↓
Technician clicks "Start Task"
    ↓
PATCH /api/v1/tasks/{id}/start/
Updates: status='in_progress', technician=current_user, start_time=now
```

## Files Modified
- ✅ `backend/core/views.py` - Updated task filtering for technicians

## Result
✅ Technicians can now see available tasks immediately after creation  
✅ Technicians can see their in-progress tasks  
✅ Technicians cannot see other technicians' tasks  
✅ Task self-assignment workflow works correctly

