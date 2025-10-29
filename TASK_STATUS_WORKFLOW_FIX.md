# Task Status Workflow Fix - Completed Tasks & Review Pending ✅

## Problem Summary

**Two interconnected issues:**
1. ❌ Technicians couldn't see their completed tasks
2. ❌ Planners couldn't see tasks pending review (no 'pending-approval' status was shown)

## Root Causes

### Issue 1: Technician Completed Tasks Not Showing
- **File**: `backend/core/views.py` - `TechnicianTaskViewSet.get_queryset()`
- **Problem**: Filter only included `'available'` and `'in_progress'` statuses
- **Impact**: When technician ended a task, it was set to `'done'` but wasn't visible in the queryset filter

### Issue 2: Planner Doesn't Get Review Pending
- **File**: `backend/core/models.py` - `Task.STATUS_CHOICES`
- **Problem**: Task status options only had `['available', 'in_progress', 'done', 'rejected']`
- **No intermediate state** between technician finishing and final approval
- **Frontend expected**: `'pending-approval'` status but backend set to `'done'`

## Solutions Implemented

### Solution 1: Add New Task Status to Model

**File: `/backend/core/models.py` (Line 125-137)**

Updated Task STATUS_CHOICES to include intermediate states:
```python
STATUS_CHOICES = [
    ('available', 'Available'),           # Unassigned, ready for anyone
    ('in_progress', 'In Progress'),       # Technician is working
    ('pending-approval', 'Pending Approval'),  # ← NEW: Technician finished, waiting for planner
    ('approved', 'Approved'),             # ← NEW: Planner approved
    ('rejected', 'Rejected'),             # Planner rejected / redo required
    ('done', 'Done'),                     # ← NEW: Final completed state
]
```

### Solution 2: Change Task Status When Technician Ends Task

**File: `/backend/core/views.py` (Line 140-188)**

Updated `TechnicianTaskViewSet.end()` method:

**Before:**
```python
# Set final status (incorrectly set to 'done')
task.status = 'done'  # NOTE: Using 'done'...
```

**After:**
```python
# 3. Set status to pending-approval (waiting for planner review)
task.status = 'pending-approval'
```

Now when technician ends a task, it's set to `'pending-approval'` (waiting for planner to review).

### Solution 3: Update Backend Task Filters

**File: `/backend/core/views.py` (Line 87-110)**

Updated `TechnicianTaskViewSet.get_queryset()` to include all completed task statuses:

**For Technicians:**
```python
if user.role in ['technician']:
    return queryset.filter(
        Q(status='available') | Q(technician=user, status__in=['in_progress', 'pending-approval', 'approved', 'done'])
    )
```

**For Planners/Admin:**
```python
return queryset.filter(status__in=['available', 'in_progress', 'pending-approval', 'approved', 'rejected', 'done'])
```

### Solution 4: Update Frontend Task Filters

**File: `/frontend/src/components/technician/TechnicianDashboard.tsx`**

1. **Updated filter type** (Line 18):
```typescript
// Before
const [filter, setFilter] = useState<'all' | 'available' | 'in_progress' | 'done'>('all');

// After
const [filter, setFilter] = useState<'all' | 'available' | 'in_progress' | 'pending-approval'>('all');
```

2. **Updated completed tasks filter** (Line 24):
```typescript
// Before
const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed');

// After
const completedTasks = tasks.filter(t => t.status === 'pending-approval' || t.status === 'approved' || t.status === 'done');
```

3. **Updated filter button** (Line 165):
```typescript
// Before
{ value: 'done', label: 'Completed', count: completedTasks.length }

// After
{ value: 'pending-approval', label: 'Completed', count: completedTasks.length }
```

## Task Workflow After Fix

```
┌─────────────────────────────────────────────────────────────┐
│                    TASK LIFECYCLE                           │
└─────────────────────────────────────────────────────────────┘

1. CREATED (by Planner)
   status: 'available'
   technician: null
   ↓
2. ASSIGNED (Technician starts task)
   status: 'in_progress'
   technician: {assigned_to}
   ↓
3. COMPLETED (Technician ends task)
   status: 'pending-approval'  ← Waiting for planner review
   end_time: {calculated}
   actual_time_seconds: {calculated}
   ↓
4. REVIEWED (Planner action)
   ┌─────────────────────────┬─────────────────────────┐
   │                         │                         │
   v                         v                         v
   status: 'approved'      status: 'rejected'      status: 'rejected'
   (Approved)              (QA Issue)               (Redo Required)
   ↓                       ↓                        ↓
   status: 'done'          [Back to available]     [Send to technician]
   (Final)                 OR approval              OR rejected state
                          
   OR task might be:       OR task marked:
   'done' (final)          'rejected' (failed QA)
```

## Visibility After Fix

### Technician Dashboard Shows:
- ✅ **All tab**: All tasks (available, in_progress, pending-approval, approved, done)
- ✅ **Available tab**: Tasks waiting to be started
- ✅ **In Progress tab**: Currently working on
- ✅ **Completed tab** (renamed from 'done'): Tasks in pending-approval, approved, or done status

### Planner Dashboard Shows (TaskReviewQueue):
- ✅ **Pending Approval**: Tasks with `status='pending-approval'` (ready to review)
- ✅ **Approved**: Tasks with `status='approved'`
- ✅ **Rejected**: Tasks with `status='rejected'`

## Data Flow Diagram

```
Technician Flow:
┌──────────────────────────────────┐
│ End Task (calls PATCH /tasks/end) │
└──────────────────────────────────┘
          ↓
┌──────────────────────────────────────────────────┐
│ Backend: TechnicianTaskViewSet.end()              │
│ - Calculate actual_time_seconds                   │
│ - Set status = 'pending-approval'                 │
│ - Save task                                        │
└──────────────────────────────────────────────────┘
          ↓
┌──────────────────────────────────────────────────┐
│ Task now visible in API response with:            │
│ status: 'pending-approval'                        │
│ end_time: {set}                                   │
│ actual_time_seconds: {calculated}                 │
│ efficiency: {calculated}                          │
└──────────────────────────────────────────────────┘
          ↓
┌──────────────────────────────────────────────────┐
│ Frontend: TechnicianDashboard                     │
│ - Task appears in "Completed" tab                 │
│ - Status shown as 'pending-approval'              │
│ - Technician can see efficiency rating            │
└──────────────────────────────────────────────────┘

Planner Flow:
┌──────────────────────────────────────────────────┐
│ PlannerDashboard "Task Review" view               │
│ - Fetches tasks with status='pending-approval'    │
│ - Displays in TaskReviewQueue                     │
└──────────────────────────────────────────────────┘
          ↓
┌──────────────────────────────────────────────────┐
│ Planner Actions:                                  │
│ - Approve: Set status='approved'                  │
│ - Reject: Set status='rejected'                   │
└──────────────────────────────────────────────────┘
```

## Files Modified

### Backend
1. **`/backend/core/models.py`**
   - Lines 125-137: Updated Task.STATUS_CHOICES
   - Added: 'pending-approval', 'approved', 'done' as separate states

2. **`/backend/core/views.py`**
   - Lines 87-110: Updated TechnicianTaskViewSet.get_queryset()
   - Lines 140-188: Updated TechnicianTaskViewSet.end() method
   - Changed task status from 'done' to 'pending-approval'

### Frontend
1. **`/frontend/src/components/technician/TechnicianDashboard.tsx`**
   - Line 18: Updated filter type definition
   - Line 24: Updated completedTasks filter
   - Line 165: Updated filter button from 'done' to 'pending-approval'

## Migration Required

⚠️ **Database migration needed** to add new statuses to Task model:

```bash
# Generate migration
python manage.py makemigrations

# Apply migration
python manage.py migrate
```

After migration, existing 'done' tasks will remain as 'done', but new tasks will follow the new workflow.

## Testing Checklist

### Technician Perspective
- [ ] Create new task (status = 'available')
- [ ] Start task (status = 'in_progress')
- [ ] End task (status should become 'pending-approval')
- [ ] Task visible in "Completed" tab with 'pending-approval' badge
- [ ] Efficiency and timing metrics displayed correctly

### Planner Perspective
- [ ] Task with 'pending-approval' status visible in "Task Review" section
- [ ] Able to approve task (status → 'approved')
- [ ] Able to reject task (status → 'rejected')
- [ ] Approved tasks show different badge than pending

### Status Badges
- [ ] 'available' → Gray badge
- [ ] 'in_progress' → Blue badge
- [ ] 'pending-approval' → Yellow badge
- [ ] 'approved' → Green badge
- [ ] 'rejected' → Red badge

## Backward Compatibility

- Existing tasks with 'done' status remain unchanged
- Frontend displays 'done' tasks in "Completed" section
- New tasks follow the new workflow with 'pending-approval'
- No breaking changes to API response format

## Summary

The fix introduces a proper task approval workflow:
1. ✅ Technicians can now see their completed ('pending-approval') tasks
2. ✅ Planners can see tasks waiting for review ('pending-approval' status)
3. ✅ Clear visual distinction between workflow stages
4. ✅ Proper audit trail of task progression
5. ✅ Maintains backward compatibility with existing data
