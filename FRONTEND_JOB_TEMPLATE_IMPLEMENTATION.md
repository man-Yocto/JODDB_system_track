# Job Template System - Frontend Implementation Complete

## Overview
Successfully implemented the frontend components for the Job Template system, allowing planners to:
1. Select a job template (like A340) when creating a job order
2. Add tasks to a job order based on the selected job's processes
3. Create multiple tasks for multiple devices in bulk

## Components Modified/Created

### 1. **CreateJobOrderModal.tsx** ✅
**Location:** `frontend/src/components/planner/CreateJobOrderModal.tsx`

**Changes:**
- Added job template selection dropdown
- Fetches available jobs from API on modal open
- Displays job description when a template is selected
- Added `job` field to form data (optional)
- Shows process count for each job template (e.g., "A340 (92 processes)")

**New Features:**
```typescript
- useState for jobs list
- useEffect to fetch jobs when modal opens
- Select dropdown showing all available job templates
- Conditional "Add Tasks from Template" button in JobOrderDetails
```

**API Integration:**
- Uses `api.jobs.getJobs()` to fetch job templates
- Sends `job` field when creating job order (nullable)

---

### 2. **AddTasksFromJobModal.tsx** ✅ (NEW)
**Location:** `frontend/src/components/planner/AddTasksFromJobModal.tsx`

**Purpose:**
Modal for adding tasks to a job order based on its job template's processes.

**Features:**
- **Device Serial Input**: Multi-line textarea for entering device serials (comma or newline separated)
- **Process Selection Table**: 
  - Shows all processes from the job template
  - Checkbox selection (individual or select all)
  - Displays operation name, task type (quality/technician), and standard time
  - Color-coded task types (purple for quality, blue for technician)
- **Bulk Task Creation**: Creates tasks for each selected process × each device serial
- **Summary Display**: Shows total tasks to be created (e.g., "92 tasks will be created: 5 devices × 92 processes")

**Process:**
1. User enters device serial numbers (one per line or comma-separated)
2. User selects processes from the table
3. Modal shows summary of tasks to create
4. On submit, creates all tasks in parallel using Promise.all()

**API Integration:**
- Fetches processes: `api.processes.getProcesses(jobId)`
- Creates tasks: `api.tasks.createTask(taskData)` for each device × process combination

**Task Data Structure:**
```typescript
{
  job_order: number,
  process: number,
  device_serial: string,
  task_type: string,
  operation_name: string,
  estimated_time: number
}
```

---

### 3. **JobOrderDetails.tsx** ✅
**Location:** `frontend/src/components/planner/JobOrderDetails.tsx`

**Changes:**
- Imported `AddTasksFromJobModal` component
- Added state for modal visibility: `showAddTasksModal`
- Added "Add Tasks from Template" button in header (only shown if job order has a job template)
- Integrated modal with proper props:
  - `jobOrderId`: Current job order ID
  - `jobId`: Template job ID
  - `onSuccess`: Callback to refresh job details after adding tasks

**New Button:**
```tsx
<button onClick={() => setShowAddTasksModal(true)}>
  <Plus /> Add Tasks from Template
</button>
```

---

### 4. **api.ts** ✅
**Location:** `frontend/src/services/api.ts`

**Changes:**
- Added `Job` and `Process` interfaces
- Added `jobAPI` with methods:
  - `getJobs()`: Fetch all job templates
  - `getJob(id)`: Fetch single job template with processes
- Added `processAPI` with methods:
  - `getProcesses(jobId?)`: Fetch processes (optionally filtered by job)
  - `getProcess(id)`: Fetch single process
- Added `createTask()` method to task API:
  ```typescript
  createTask(taskData: {
    job_order: number;
    process?: number;
    device_serial: string;
    task_type: string;
    operation_name: string;
    estimated_time?: number;
  }): Promise<Task>
  ```

---

## Backend Updates

### 1. **views.py** ✅
**Location:** `backend/core/views.py`

**Changes:**
- Updated `TechnicianTaskViewSet` to include `CreateModelMixin`
- Added `get_serializer_class()` method to use `TaskSimpleCreateSerializer` for create action
- Allows planning role to create tasks

---

### 2. **serializers.py** ✅
**Location:** `backend/core/serializers.py`

**New Serializer: `TaskSimpleCreateSerializer`**
- Handles single task creation
- Accepts `device_serial` as string (not a list)
- Automatically creates device if it doesn't exist using `get_or_create`
- Links task to process and job order
- Sets default status to 'available'

**Fields:**
```python
fields = [
    'job_order',
    'process',
    'device_serial',
    'operation_name',
    'task_type',
    'estimated_time'
]
```

---

## User Workflow

### Creating a Job Order with Template:
1. Planner clicks "Create Job Order" in PlannerDashboard
2. Fills in order code, title, due date, total devices
3. **Selects a job template** (e.g., A340 with 92 processes) - OPTIONAL
4. Submits form
5. Job order is created with link to template

### Adding Tasks from Template:
1. Planner opens job order details
2. Clicks "Add Tasks from Template" button (only visible if job order has template)
3. Modal opens showing all 92 processes from A340
4. Planner enters device serial numbers:
   ```
   DEV-001
   DEV-002
   DEV-003
   DEV-004
   DEV-005
   ```
5. Planner selects processes to create (can select all 92 or subset)
6. Modal shows: "460 tasks will be created: 5 devices × 92 processes"
7. Clicks "Add 460 Tasks"
8. System creates all tasks in parallel
9. Tasks appear in technician and quality inspector dashboards

---

## API Endpoints Used

### Jobs:
- `GET /api/v1/jobs/` - List all job templates
- `GET /api/v1/jobs/{id}/` - Get single job with processes

### Processes:
- `GET /api/v1/processes/?job_id={id}` - List processes for a job
- `GET /api/v1/processes/{id}/` - Get single process

### Tasks:
- `POST /api/v1/tasks/` - Create a task (NEW - now supports individual task creation)

### Job Orders:
- `POST /api/v1/job-orders/` - Create job order (now accepts optional `job` field)
- `GET /api/v1/job-orders/{id}/` - Get job order details

---

## Example: A340 Job

The A340 job template contains **92 processes**:

**Quality Tasks (7):**
1. Quality Assemblage I
2. Quality Assemblage II
3. Final inspection
4. Packing
5. Adjustment
6. Unit Test
7. Immersion

**Technician Tasks (85):**
- Production processes (53 tasks)
- Sub-Assemblies processes (28 tasks)
- Troubleshooting processes (4 tasks)

When a planner creates a job order for A340 with 5 devices:
- Total tasks created: **5 devices × 92 processes = 460 tasks**
- 5 devices × 7 quality processes = 35 quality tasks
- 5 devices × 85 technician processes = 425 technician tasks

---

## Testing the Feature

### 1. Create Job Order with A340 Template:
```bash
# Frontend will call:
POST /api/v1/job-orders/
{
  "order_code": "JO-2024-A340-001",
  "title": "A340 Assembly Batch 1",
  "description": "First batch of A340 devices",
  "due_date": "2024-12-31",
  "total_devices": 5,
  "job": 1  # A340 job ID
}
```

### 2. Add Tasks from Template:
```bash
# Frontend will make 460 parallel calls like:
POST /api/v1/tasks/
{
  "job_order": 1,
  "process": 1,  # Quality Assemblage I
  "device_serial": "DEV-001",
  "task_type": "quality",
  "operation_name": "Quality Assemblage I",
  "estimated_time": 3600
}
```

### 3. Verify Tasks Created:
- Check Technician Dashboard: Should show 425 available technician tasks
- Check Quality Inspector Dashboard: Should show 35 available quality tasks
- Check Job Order Progress: Should show 0% complete, 460 total tasks

---

## Files Modified Summary

### Frontend:
1. `src/components/planner/CreateJobOrderModal.tsx` - Added job template selection
2. `src/components/planner/AddTasksFromJobModal.tsx` - **NEW** - Bulk task creation modal
3. `src/components/planner/JobOrderDetails.tsx` - Added "Add Tasks" button and modal integration
4. `src/services/api.ts` - Added Job/Process interfaces and API methods, task creation

### Backend:
1. `core/views.py` - Added create capability to TechnicianTaskViewSet
2. `core/serializers.py` - Added TaskSimpleCreateSerializer

---

## Benefits

✅ **Efficiency**: Create hundreds of tasks in seconds instead of manually entering each one
✅ **Consistency**: All tasks follow the standardized process template
✅ **Flexibility**: Planners can select which processes to include
✅ **Scalability**: Easily handle job orders with many devices and processes
✅ **Traceability**: Tasks are linked to their process template for reporting

---

## Next Steps (Optional Enhancements)

1. **Task Templates**: Pre-populate task descriptions/instructions from process templates
2. **Batch Device Import**: CSV import for device serial numbers
3. **Process Groups**: Allow selecting all quality tasks or all technician tasks at once
4. **Estimated Time Calculation**: Show total estimated time for selected tasks
5. **Duplicate Prevention**: Check if tasks already exist for device/process combinations
6. **Progress Indicator**: Show progress bar during bulk task creation

---

## Status: ✅ COMPLETE

All frontend and backend components are implemented and ready for testing!
