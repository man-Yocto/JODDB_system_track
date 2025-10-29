# Job and Process Management System Implementation

## Overview
Successfully implemented a job template and process management system that allows planners to:
1. Define job templates (e.g., "A340") with predefined processes
2. Select a job when creating a job order
3. Add tasks based on predefined processes

## Database Schema

### 1. Job Model
```python
- id (PK)
- name (unique)
- description
- created_at
- updated_at
```
Represents a job template like "A340 Assembly"

### 2. Process Model
```python
- id (PK)
- job_id (FK to Job)
- operation_name
- standard_time_seconds
- task_type (technician/quality/tester)
- order (sequence number)
```
Represents a process/step within a job (e.g., "Quality Assemblage I")

### 3. JobOrder Model (Updated)
```python
- job_id (FK to Job) - NEW FIELD
- ... (existing fields)
```
Now linked to a Job template

### 4. Task Model (Updated)
```python
- process_id (FK to Process) - NEW FIELD
- ... (existing fields)
```
Now linked to a Process template for identification

## API Endpoints

### Jobs
- `GET /api/v1/jobs/` - List all job templates
- `GET /api/v1/jobs/{id}/` - Get specific job with all processes

### Processes
- `GET /api/v1/processes/` - List all processes
- `GET /api/v1/processes/?job_id={id}` - Filter processes by job

### Job Orders (Updated)
- `POST /api/v1/job-orders/` - Now accepts `job` field
- `GET /api/v1/job-orders/` - Now includes `job_name` in response

## Seeded Data: A340 Job

Successfully seeded the A340 job with 92 processes:

### Quality Processes (7 tasks)
All marked as task_type='quality':
1. Quality Assemblage I (18 min)
2. Quality Assemblage II (10 min)
3. Final inspection (13 min)
4. Packing (10 min)
5. Adjustment (37 min)
6. Unit Test (20 min)
7. Immersion (3 min)

### Production Processes (11 tasks)
Marked as task_type='technician':
- Assemblage I (32 min)
- Assemblage II (30 min)
- Assemblage II tubeless (13 min)
- Final Touch processes (3 variants)
- Focus processes (A340 & A360)
- Lens Cleaning (35 min)
- Objective and Doublet (24 min)
- Nitrogen (10 min)

### Sub-Assemblies (9 tasks)
- Battery assemblies
- Beam Combiner Assy.
- Focus Assy. (A340 & A360)
- And more...

### Troubleshooting (65 tasks)
Comprehensive troubleshooting procedures including:
- Installation procedures
- Cleaning procedures
- Repair procedures
- Testing procedures
- And many more...

## Management Command

Created a reusable management command to seed the A340 job:
```bash
python manage.py seed_a340_job
```

This command:
- Creates the A340 job if it doesn't exist
- Clears existing processes to avoid duplicates
- Bulk creates all 92 processes
- Provides a summary of created processes

## Next Steps for Frontend

To complete this feature, the frontend needs:

1. **Update API Types** (`frontend/src/services/api.ts`)
   - Add Job and Process types
   - Add API functions to fetch jobs and processes

2. **Update Create Job Order Modal**
   - Add dropdown to select a Job
   - Display job description when selected
   - Update form submission to include job_id

3. **Create "Add Tasks from Job" Feature**
   - Show list of processes for selected job
   - Allow planner to select which processes to create tasks for
   - Generate tasks based on selected processes and device serials

## Benefits

1. **Standardization**: Processes are predefined and consistent
2. **Efficiency**: No need to manually enter operation names and times
3. **Traceability**: Tasks are linked to their process templates
4. **Flexibility**: Can create different jobs with different processes
5. **Scalability**: Easy to add new jobs and processes

## Files Modified

### Backend
- `backend/core/models.py` - Added Job and Process models
- `backend/core/serializers.py` - Added Job and Process serializers
- `backend/core/views.py` - Added Job and Process viewsets
- `backend/joddb_backend/urls.py` - Registered new endpoints
- `backend/core/management/commands/seed_a340_job.py` - NEW seeding command
- Migration: `core/migrations/0012_job_joborder_job_process_task_process.py`

### Frontend (Pending)
- `frontend/src/services/api.ts` - Add Job/Process API functions
- `frontend/src/components/planner/CreateJobOrderModal.tsx` - Add job selector
- `frontend/src/components/planner/AddTasksFromJobModal.tsx` - NEW component needed

## Usage Example

### Backend (Already Working)
```bash
# Seed the A340 job
python manage.py seed_a340_job

# Start server
python manage.py runserver

# Test API
curl http://localhost:8000/api/v1/jobs/
curl http://localhost:8000/api/v1/jobs/1/
curl http://localhost:8000/api/v1/processes/?job_id=1
```

### Frontend (To Be Implemented)
```typescript
// Fetch all jobs
const jobs = await api.jobs.getJobs();

// Fetch processes for a specific job
const processes = await api.processes.getProcesses(jobId);

// Create job order with job
await api.jobOrders.createJobOrder({
  job: jobId,
  order_code: 'JO-001',
  title: 'A340 Assembly Batch 1',
  total_devices: 100,
  due_date: '2025-12-31'
});
```
