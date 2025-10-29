# Technician Assignment to Tasks - Complete Flow

## Overview
In the JODDB system, technicians are **NOT pre-assigned** to tasks. Instead, tasks are created in an **"available"** status, and technicians **self-assign** themselves by starting a task. This is a pull-based system rather than push-based.

---

## Task Creation Process (Planning Engineer)

### 1. **When: Job Order Creation**
**Who**: Planning Engineer (role: `'planning'` or `'admin'`)  
**Where**: Frontend → Planner Dashboard → "New Job Order" button  
**API Endpoint**: `POST /api/v1/job-orders/`

### 2. **Data Provided by Planning Engineer**
- **Job Order Code** (e.g., "JO-2025-001")
- **Title** (e.g., "Assembly Batch for Devices")
- **Description** (optional)
- **Due Date**
- **Standard Time** (seconds per task - used as benchmark for efficiency)
- **Device Serial Numbers** (list of devices, one per line)

### 3. **Backend Task Creation Process**
**File**: `/home/coderx64/hackathon/backend/core/serializers.py` (JobOrderCreateSerializer)

```python
def create(self, validated_data):
    # 1. Extract data from the request
    device_serials = validated_data.pop('device_serials')
    standard_time = validated_data.pop('standard_time_seconds')
    
    # 2. Create JobOrder
    job_order = JobOrder.objects.create(**validated_data)
    
    # 3. Create Devices (one per serial number)
    for serial in device_serials:
        Device.objects.create(
            job_order=job_order,
            serial_number=serial
        )
    
    # 4. Create Tasks (one task per device, ALL in 'available' status)
    for device in created_devices:
        Task.objects.create(
            device=device,
            job_order=job_order,
            operation_name=f"Initial Assembly for {job_order.order_code}",
            standard_time_seconds=standard_time,
            status='available',  # ← KEY: Tasks start as available
            # technician = None   # ← NO technician assigned yet!
        )
```

**Result**: N devices → N tasks, all with:
- ✅ `status = 'available'`
- ✅ `technician = NULL` (no technician assigned)
- ✅ `start_time = NULL`
- ✅ `operation_name = "Initial Assembly for [JobOrder]"`

---

## Technician Self-Assignment Process

### 1. **Technician Views Available Tasks**
**Where**: Frontend → Technician Dashboard  
**API Endpoint**: `GET /api/v1/tasks/`

**Backend Filtering** (`views.py`, TechnicianTaskViewSet):
```python
def get_queryset(self):
    user = self.request.user
    
    if user.role == 'technician':
        # Technician sees their IN-PROGRESS tasks
        return Task.objects.filter(
            technician=user, 
            status='in_progress'
        )
```

**Note**: Technicians see tasks in two ways:
1. **In their dashboard**: Tasks they have already started (status='in_progress', technician=themselves)
2. **Via API list**: All available tasks can be queried (though the main view filters to show their own)

### 2. **Technician Starts a Task**
**User Action**: Clicks "Start Task" button on an available task  
**API Endpoint**: `PATCH /api/v1/tasks/{taskId}/start/`

**Frontend Code** (`frontend/src/components/technician/TechnicianTaskCard.tsx`):
```tsx
const handleStart = async () => {
    if (task.status !== 'available') {
        setError('Task cannot be started from current status');
        return;
    }
    
    try {
        await api.tasks.startTask(task.id);
        // Task now shows the technician as assigned
        onTaskUpdate(); // Refresh task list
    } catch (err) {
        console.error('Start task error:', err);
    }
};
```

### 3. **Backend Assigns Technician**
**File**: `/home/coderx64/hackathon/backend/core/views.py` (TechnicianTaskViewSet.start action)

```python
@action(detail=True, methods=['patch'])
def start(self, request, pk=None):
    """
    Action for a Technician to start a task.
    Sets technician, start_time, and status = 'in_progress'.
    """
    task = self.get_object()
    user = request.user
    
    # Validation: Task must be available
    if task.status != 'available':
        return Response(
            {"detail": f"Task cannot be started. Current status: {task.get_status_display()}."},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # *** ASSIGNMENT HAPPENS HERE ***
    task.technician = user  # ← Assign current user as technician
    task.start_time = timezone.now()
    task.status = 'in_progress'
    task.save(update_fields=['technician', 'start_time', 'status', 'updated_at'])
    
    # Update device status
    task.device.current_status = 'in_progress'
    task.device.save(update_fields=['current_status', 'last_updated'])
    
    return Response(self.get_serializer(task).data)
```

**Result**: 
- ✅ `task.technician = <authenticated_user>`
- ✅ `task.status = 'in_progress'`
- ✅ `task.start_time = <current_datetime>`
- ✅ Device status → `'in_progress'`

---

## Task Completion & Submission

### 1. **Technician Ends Task**
**API Endpoint**: `PATCH /api/v1/tasks/{taskId}/end/`

```python
@action(detail=True, methods=['patch'])
def end(self, request, pk=None):
    task = self.get_object()
    user = request.user
    
    # Verify the authenticated user is the assigned technician
    if task.technician != user:
        return Response(
            {"detail": "You are not the assigned technician for this task."},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Calculate actual time spent
    task.end_time = timezone.now()
    task.actual_time_seconds = (task.end_time - task.start_time).total_seconds()
    
    # Move to next status (pending_qa or done depending on system config)
    task.status = 'pending_qa'  # or 'done'
    task.save()
    
    # Update device status
    task.device.current_status = 'completed'
    task.device.save()
```

### 2. **Data Recorded**
- ✅ `end_time`: When technician ended the task
- ✅ `actual_time_seconds`: Duration of work
- ✅ `efficiency`: (standard_time / actual_time) × 100
- ✅ `status`: Moves to 'done' or sent for inspection

---

## Key Data Model Fields

### Task Model
```python
class Task(models.Model):
    device = ForeignKey(Device)                    # Which device
    job_order = ForeignKey(JobOrder)              # Which job order
    technician = ForeignKey(User, null=True)      # ← ASSIGNED TECHNICIAN (nullable!)
    
    operation_name = CharField()                   # "Initial Assembly for JO-2025-001"
    standard_time_seconds = IntegerField()        # Benchmark: e.g., 3600 (1 hour)
    
    start_time = DateTimeField(null=True)         # When tech started ← SET ON START
    end_time = DateTimeField(null=True)           # When tech finished ← SET ON END
    actual_time_seconds = IntegerField(null=True) # Duration ← CALCULATED
    
    status = CharField(
        choices=[
            'available',      # ← NEW: Waiting for technician
            'in_progress',    # ← ASSIGNED: Technician is working
            'done',           # ← COMPLETED: Technician finished
            'rejected',       # ← FAILED: QA rejected it
        ],
        default='available'
    )
```

---

## Task Status Lifecycle

```
┌─────────────────────────────────────────────────┐
│           TASK LIFECYCLE IN SYSTEM              │
├─────────────────────────────────────────────────┤
│                                                 │
│  1. CREATED (by Planning Engineer)              │
│     ↓                                           │
│  2. 'available'                                 │
│     ↓ (Technician clicks "Start")              │
│  3. 'in_progress' (technician assigned here)    │
│     ↓ (Technician works on device)             │
│  4. 'in_progress' (same status, time passes)    │
│     ↓ (Technician clicks "End")                │
│  5. 'done' or 'pending_qa'                      │
│     ├─ If QA Approved → 'done'                 │
│     └─ If QA Rejected → 'rejected'             │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Assignment Summary

| Aspect | Details |
|--------|---------|
| **WHO assigns?** | Technician themselves (self-assignment) |
| **WHEN?** | When technician clicks "Start Task" |
| **HOW?** | `PATCH /api/v1/tasks/{id}/start/` endpoint |
| **WHO authorizes?** | No authorization needed - any technician can start any available task |
| **Can task be reassigned?** | NO - once technician starts (assigned), only that technician can end it |
| **Who can see assignments?** | Planner sees all; Technician sees only their own in-progress tasks |

---

## Frontend Components Involved

### 1. **Planner Dashboard** (`PlannerDashboard.tsx`)
- Creates job orders with device serials and standard time
- All tasks are created in 'available' status

### 2. **Technician Dashboard** (`TechnicianDashboard.tsx`)
- Shows available tasks (filtered from backend)
- Shows in-progress tasks assigned to the technician
- Task selection and start/end actions

### 3. **Task Card** (`TechnicianTaskCard.tsx`)
- Displays task details
- "Start" button → calls `api.tasks.startTask(taskId)`
- "End" button → calls `api.tasks.endTask(taskId, notes)`

### 4. **Task Queue Preview** (`TaskQueuePreview.tsx`)
- Shows upcoming available tasks for the technician

---

## API Endpoints Summary

| Endpoint | Method | Role | Purpose |
|----------|--------|------|---------|
| `/api/v1/job-orders/` | POST | Planning | Create job order (creates tasks) |
| `/api/v1/tasks/` | GET | All | List tasks (filtered by role) |
| `/api/v1/tasks/{id}/start/` | PATCH | Technician | Assign themselves & start |
| `/api/v1/tasks/{id}/end/` | PATCH | Technician | Submit completed task |
| `/api/v1/tasks/{id}/` | GET | All | Get task details |

---

## Example Flow

### Step 1: Planning Engineer Creates Job Order
```bash
POST /api/v1/job-orders/
{
    "order_code": "JO-2025-001",
    "title": "Assembly Batch 01",
    "due_date": "2025-11-15",
    "standard_time_seconds": 3600,
    "device_serials": ["DEV-001", "DEV-002", "DEV-003"]
}
```

**Result**: 
- 1 Job Order created
- 3 Devices created
- 3 Tasks created (all with status='available', technician=NULL)

### Step 2: Technician A Checks Available Tasks
```bash
GET /api/v1/tasks/
```

**Response**: Shows Task 1, 2, 3 all available

### Step 3: Technician A Starts Task 1
```bash
PATCH /api/v1/tasks/1/start/
```

**Backend Updates**:
- Task 1: technician=Technician A, status='in_progress', start_time=<now>
- Other technicians can still see Tasks 2 & 3 as available

### Step 4: Technician B Starts Task 2
```bash
PATCH /api/v1/tasks/2/start/
```

**Result**: Task 2 now assigned to Technician B

### Step 5: Technician A Ends Task 1
```bash
PATCH /api/v1/tasks/1/end/
{
    "notes": "Completed successfully"
}
```

**Result**:
- Task 1: status='done', end_time=<now>
- actual_time_seconds = 3500 seconds
- efficiency = (3600/3500) × 100 = 102.86%

---

## Key Design Decisions

1. **Pull-based Assignment**: Technicians pull tasks, not pushed
2. **No Pre-assignment**: Tasks created without assigned technicians
3. **First-come-first-served**: Any available technician can start any task
4. **Exclusive Assignment**: Once started, only that technician can finish it
5. **Automatic Tracking**: Timestamps auto-recorded on start/end
6. **Efficiency Calculated**: (Standard / Actual) × 100 for performance metrics

---

## Security & Validation

### Validation Rules
- ✅ Only authenticated users can start/end tasks
- ✅ Only technicians can start/end their own tasks
- ✅ Task must be 'available' to be started
- ✅ Task must be 'in_progress' to be ended
- ✅ Only assigned technician can end their task
- ✅ Assigned technician cannot be changed mid-task

### Authorization
- Planning Engineers: Can create job orders (and thus tasks)
- Technicians: Can only manage their own assigned tasks
- Supervisors/QA: Can view all tasks for review/inspection

