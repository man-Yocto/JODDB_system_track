# How to View A340 Job in Django Admin

## Problem
A340 job with 92 processes was seeded but not visible in Django admin.

## Solution
Added Job and Process models to Django admin registration.

---

## Access the Admin Panel

### 1. Make sure backend server is running:
```bash
cd backend
python3 manage.py runserver
```

### 2. Navigate to admin:
```
http://localhost:8000/admin/
```

### 3. Login with admin credentials:
- **Username:** admin
- **Password:** admin123

(Or whatever admin credentials were created)

---

## What You'll See

### Jobs Section:
- Click on **"Jobs"** in the admin sidebar
- You should see:
  - **A340** job
  - Created date
  - Number of processes (92)

### Process Details:
- Click on the **A340** job
- You'll see a table with all 92 processes:
  - Quality Assemblage I
  - Quality Assemblage II
  - Final inspection
  - Packing
  - Adjustment
  - Unit Test
  - Immersion
  - Plus 85 technician processes

### Process Breakdown:
- **Quality tasks:** 7 processes
- **Technician tasks:** 85 processes
- **Total:** 92 processes

---

## Admin Features Added

### Job Admin:
- ✅ List view with job name, description, process count
- ✅ Search by name or description
- ✅ Inline process editing (see all processes in one page)
- ✅ Sortable columns

### Process Admin:
- ✅ List view with operation name, job, task type, time
- ✅ Filter by job or task type
- ✅ Search by operation name or job name
- ✅ Ordered by job and process order

---

## Verify the Data

### From Django Shell:
```bash
python3 manage.py shell
```

```python
from core.models import Job, Process

# Get A340 job
job = Job.objects.get(name='A340')
print(f"Job: {job.name}")
print(f"Description: {job.description}")

# Count processes by type
quality_count = job.processes.filter(task_type='quality').count()
tech_count = job.processes.filter(task_type='technician').count()

print(f"Quality processes: {quality_count}")
print(f"Technician processes: {tech_count}")
print(f"Total: {job.processes.count()}")

# List first 5 processes
for process in job.processes.all()[:5]:
    print(f"  - {process.operation_name} ({process.task_type})")
```

Expected output:
```
Job: A340
Description: A340 aircraft maintenance job with comprehensive assembly and testing processes
Quality processes: 7
Technician processes: 85
Total: 92
  - Quality Assemblage I (quality)
  - Quality Assemblage II (quality)
  - Final inspection (quality)
  - Packing (quality)
  - Adjustment (quality)
```

---

## Database Verification

Already verified:
```
✅ A340 Job exists: True
✅ Process count: 92
```

---

## Troubleshooting

### Can't login to admin:
```bash
# Create superuser if needed
python3 manage.py createsuperuser
```

### Don't see Jobs section:
- Refresh the browser
- Check server logs for errors
- Verify admin.py was updated correctly

### Processes not showing:
- Click on the A340 job in the list
- Scroll down to see the inline processes table
- Or go to "Processes" section separately

---

## Quick Access URLs

- **Admin Home:** http://localhost:8000/admin/
- **Jobs List:** http://localhost:8000/admin/core/job/
- **A340 Job:** http://localhost:8000/admin/core/job/1/ (assuming ID=1)
- **Processes List:** http://localhost:8000/admin/core/process/

---

## What Changed

**File:** `backend/core/admin.py`

**Before:**
```python
# Job and Process models NOT registered
```

**After:**
```python
@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ['name', 'description', 'process_count', 'created_at']
    inlines = [ProcessInline]  # Shows all processes inline

@admin.register(Process)
class ProcessAdmin(admin.ModelAdmin):
    list_display = ['operation_name', 'job', 'task_type', 'standard_time_seconds', 'order']
    list_filter = ['job', 'task_type']
```

---

## Status: ✅ FIXED

You can now view the A340 job and all 92 processes in the Django admin interface!
