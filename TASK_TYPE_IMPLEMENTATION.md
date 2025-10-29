# Task Type Implementation - Backend Guide

## Overview
Tasks now have a `task_type` field that allows filtering tasks by role. Users only see tasks meant for their role.

## Database Changes

### 1. Task Model Update (`core/models.py`)
- Added `TASK_TYPE_CHOICES` to Task model:
  - `'technician'` - Tasks for technicians
  - `'quality'` - Tasks for quality inspectors
  - `'tester'` - Tasks for testers
- Added `task_type` field with default value `'technician'`

### 2. Migration Applied
```bash
cd /sgoinfre/amsaleh/hackathon/backend
python3 manage.py migrate
# Applied: core.0011_task_task_type_alter_user_role
```

## API Endpoint Changes

### Task Filtering by Role
The `/api/tasks/` endpoint now automatically filters tasks based on user role:

**Role → Task Type Mapping:**
- `technician` role → sees only `'technician'` type tasks
- `quality_inspector` role → sees only `'quality'` type tasks  
- `tester` role → sees only `'tester'` type tasks
- `planning`/`admin` roles → see all task types

**Example Requests:**

1. **Technician User (tech_1):**
   ```
   GET /api/tasks/
   Response: Only tasks with task_type='technician'
   ```

2. **Quality Inspector User (qi_1):**
   ```
   GET /api/tasks/
   Response: Only tasks with task_type='quality'
   ```

3. **Tester User (tester_1):**
   ```
   GET /api/tasks/
   Response: Only tasks with task_type='tester'
   ```

4. **Planning Engineer (pe_1):**
   ```
   GET /api/tasks/
   Response: All tasks regardless of type
   ```

## Creating Tasks with Types

### When Creating a Job Order
Pass the `task_type` field when creating a job order:

```bash
POST /api/job-orders/
{
  "order_code": "JO001",
  "title": "Assembly Job",
  "description": "Testing tasks",
  "due_date": "2025-12-31",
  "standard_time_seconds": 3600,
  "device_serials": ["DEVICE001", "DEVICE002"],
  "operation_name": "Testing",
  "task_type": "tester"  # NEW FIELD
}
```

**task_type Options:**
- `"technician"` (default) - For technician tasks
- `"quality"` - For quality inspection tasks
- `"tester"` - For testing tasks

## Serializer Updates

### TaskSerializer
Now includes:
- `task_type` - The task type code
- `task_type_display` - Human-readable task type

### JobOrderCreateSerializer
Now includes:
- `task_type` field for specifying task type when creating job orders

## Frontend Integration

The TesterDashboard (`frontend/src/components/tester/TesterDashboard.tsx`) automatically:
- Filters tasks by role via the backend API
- Shows only tester-type tasks to tester users
- Displays task information with type in the UI

## Testing

### Create Test Tasks
Run the seed command (optional):
```bash
cd /sgoinfre/amsaleh/hackathon/backend
python3 manage.py seed_tasks_with_types
```

### Test Filtering
1. Login as `tech_1` (technician) → See technician tasks only
2. Login as `qi_1` (quality) → See quality tasks only
3. Login as `tester_1` (tester) → See tester tasks only
4. Login as `pe_1` (planner) → See all tasks

## Benefits

✅ **Role-Based Access**: Users only see tasks for their role
✅ **Clear Task Classification**: Each task is clearly marked with its type
✅ **Scalable**: Easy to add new task types in the future
✅ **Flexible**: Planning engineers can still see all task types
✅ **Security**: Users cannot access tasks outside their role

## Example Response

```json
{
  "id": 1,
  "job_order_code": "JO001",
  "device_serial": "DEVICE001",
  "technician_username": null,
  "operation_name": "Testing Protocol",
  "task_type": "tester",
  "task_type_display": "Tester Task",
  "standard_time_seconds": 2400,
  "start_time": null,
  "end_time": null,
  "actual_time_seconds": null,
  "status": "available",
  "efficiency": null,
  "created_at": "2025-10-29T12:00:00Z"
}
```
