# Quick Testing Guide: Job Template System

## Prerequisites
1. Backend server running: `cd backend && python manage.py runserver`
2. Frontend server running: `cd frontend && npm run dev`
3. A340 job seeded: `python manage.py seed_a340_job` (already done)
4. User with 'planning' role logged in

---

## Test 1: View Available Job Templates

**Goal:** Verify job templates are fetched correctly

**Steps:**
1. Login as planning user
2. Go to Planner Dashboard
3. Click "Create Job Order" button
4. Look for "Job Template" dropdown

**Expected Result:**
- Dropdown should show: "A340 (92 processes)"
- Template description should appear when selected

**API Call:**
```
GET /api/v1/jobs/
Response: [
  {
    "id": 1,
    "name": "A340",
    "description": "...",
    "processes": [...92 processes...],
    "created_at": "...",
    "updated_at": "..."
  }
]
```

---

## Test 2: Create Job Order with Template

**Goal:** Create a job order linked to A340 template

**Steps:**
1. In Create Job Order modal:
   - Order Code: `JO-TEST-001`
   - Title: `Test A340 Order`
   - Job Template: Select "A340 (92 processes)"
   - Description: `Testing job template system`
   - Due Date: Select any future date
   - Total Devices: `5`
2. Click "Create Job Order"
3. Wait for success message
4. Modal should close

**Expected Result:**
- Job order created successfully
- Appears in job orders list
- Has link to A340 template

**API Call:**
```
POST /api/v1/job-orders/
{
  "order_code": "JO-TEST-001",
  "title": "Test A340 Order",
  "description": "Testing job template system",
  "due_date": "2024-12-31",
  "total_devices": 5,
  "job": 1
}
```

---

## Test 3: View Job Order Details

**Goal:** Verify "Add Tasks from Template" button appears

**Steps:**
1. Click on the newly created job order
2. Look for "Add Tasks from Template" button in header
3. Button should be blue with a Plus icon

**Expected Result:**
- Button is visible (because job order has a template)
- Button is enabled and clickable

**If button doesn't appear:**
- Check browser console for errors
- Verify job order has `job` field set in API response

---

## Test 4: Open Add Tasks Modal

**Goal:** Verify processes are loaded correctly

**Steps:**
1. Click "Add Tasks from Template" button
2. Modal should open with title "Add Tasks from Job Template"
3. Scroll through the process table

**Expected Result:**
- Modal displays 92 processes
- Each row shows:
  - Checkbox
  - Operation name (e.g., "Quality Assemblage I")
  - Task type badge (purple for quality, blue for technician)
  - Standard time (e.g., "60m 0s")
- Counter shows "0 of 92 selected"

**API Call:**
```
GET /api/v1/processes/?job_id=1
Response: [...92 processes...]
```

---

## Test 5: Select Processes

**Goal:** Test process selection functionality

**Steps:**
1. Click "Select All" button
2. Counter should update to "92 of 92 selected"
3. All checkboxes should be checked
4. All rows should have blue background
5. Click "Deselect All"
6. Counter should show "0 of 92 selected"
7. Click a few individual checkboxes
8. Counter should update accordingly

**Expected Result:**
- Selection state updates correctly
- UI reflects selected state
- Counter is accurate

---

## Test 6: Enter Device Serials

**Goal:** Test device serial input parsing

**Steps:**
1. In "Device Serial Numbers" textarea, enter:
   ```
   TEST-DEV-001
   TEST-DEV-002
   TEST-DEV-003
   TEST-DEV-004
   TEST-DEV-005
   ```
2. Check counter below textarea

**Expected Result:**
- Shows "5 devices entered"

**Alternative formats to test:**
```
TEST-DEV-001, TEST-DEV-002, TEST-DEV-003
TEST-DEV-001;TEST-DEV-002;TEST-DEV-003
```

---

## Test 7: Create Tasks (Small Batch)

**Goal:** Verify task creation works

**Steps:**
1. Enter 2 device serials:
   ```
   TEST-A-001
   TEST-A-002
   ```
2. Select only 3 processes (e.g., first 3 quality tasks):
   - Quality Assemblage I
   - Quality Assemblage II
   - Final inspection
3. Summary should show: "6 tasks will be created: 2 devices × 3 processes"
4. Click "Add 6 Tasks"
5. Wait for success message
6. Modal should close

**Expected Result:**
- 6 API calls made (one per task)
- Success message: "Tasks created successfully!"
- Modal closes after 1.5 seconds
- Job order details refresh automatically

**API Calls (6 total):**
```javascript
// For each device × process combination
POST /api/v1/tasks/
{
  "job_order": 1,
  "process": 1,
  "device_serial": "TEST-A-001",
  "task_type": "quality",
  "operation_name": "Quality Assemblage I",
  "estimated_time": 3600
}
// ... 5 more similar calls
```

---

## Test 8: Verify Tasks in Dashboard

**Goal:** Confirm tasks appear in appropriate dashboards

**Steps:**
1. Navigate to Technician Dashboard (login as technician user)
2. Check "Available Tasks" section
3. Navigate to Quality Inspector Dashboard (login as quality_inspector user)
4. Check "Available Tasks" section

**Expected Result:**
- Technician sees: 0 tasks (we only created quality tasks)
- Quality Inspector sees: 6 tasks (2 devices × 3 quality processes)
- Each task shows:
  - Operation name
  - Device serial
  - Job order code
  - Status: "available"

---

## Test 9: Create Tasks (Full A340 Batch)

**Goal:** Test bulk creation with full template

**Steps:**
1. Open job order details again
2. Click "Add Tasks from Template"
3. Enter 5 device serials:
   ```
   A340-BATCH1-001
   A340-BATCH1-002
   A340-BATCH1-003
   A340-BATCH1-004
   A340-BATCH1-005
   ```
4. Click "Select All" (all 92 processes)
5. Summary: "460 tasks will be created: 5 devices × 92 processes"
6. Click "Add 460 Tasks"
7. **Wait patiently** (this creates 460 tasks in parallel)

**Expected Result:**
- Button shows "Creating 460 Tasks..." during creation
- After ~10-30 seconds (depending on server), success message appears
- Modal closes
- 460 tasks created in database

**Performance Note:**
- This makes 460 parallel POST requests
- May take 10-30 seconds depending on server performance
- Consider adding progress bar in future enhancement

---

## Test 10: Verify Full Batch

**Goal:** Confirm all 460 tasks were created

**Steps:**
1. Check Technician Dashboard
2. Check Quality Inspector Dashboard
3. Check Job Order Progress in Planner Dashboard

**Expected Result:**
- Technician Dashboard: 425 available tasks (5 devices × 85 technician processes)
- Quality Dashboard: 35 available tasks (5 devices × 7 quality processes)
- Job Order Progress: 
  - 0% complete
  - 0 completed / 460 total tasks
  - 5 devices

---

## Troubleshooting

### Modal doesn't open
- Check browser console for errors
- Verify `AddTasksFromJobModal` is properly imported
- Check if `job` field exists on job order

### Processes don't load
- Check Network tab for `/api/v1/processes/?job_id=1` call
- Verify response contains 92 processes
- Check backend: `Job.objects.get(name='A340').processes.count()`

### Tasks not created
- Check Network tab for failed POST requests
- Look for 400 Bad Request errors
- Verify `TaskSimpleCreateSerializer` is working:
  ```bash
  cd backend
  python manage.py shell
  >>> from core.serializers import TaskSimpleCreateSerializer
  >>> # Should not raise ImportError
  ```

### Devices not appearing
- Check if `Device` model allows auto-creation
- Verify `get_or_create` in serializer:
  ```python
  device, created = Device.objects.get_or_create(
      serial_number=device_serial,
      defaults={'job_order': validated_data['job_order']}
  )
  ```

### Permission errors (403)
- Ensure user has 'planning' role
- Check `IsRoleRequired` includes 'planning' in task creation

---

## Database Verification

### Check jobs and processes:
```bash
cd backend
python manage.py shell
```

```python
from core.models import Job, Process, Task, JobOrder, Device

# Verify A340 exists
job = Job.objects.get(name='A340')
print(f"Job: {job.name}")
print(f"Processes: {job.processes.count()}")

# Check process breakdown
quality_count = job.processes.filter(task_type='quality').count()
tech_count = job.processes.filter(task_type='technician').count()
print(f"Quality: {quality_count}, Technician: {tech_count}")

# Check tasks created
job_order = JobOrder.objects.filter(job=job).first()
if job_order:
    tasks = Task.objects.filter(job_order=job_order)
    print(f"Total tasks: {tasks.count()}")
    print(f"Available: {tasks.filter(status='available').count()}")
    print(f"Devices: {Device.objects.filter(job_order=job_order).count()}")
```

---

## Success Criteria

✅ Job templates load in dropdown
✅ Job order created with template link
✅ "Add Tasks" button appears for templated job orders
✅ Process table shows all 92 A340 processes
✅ Select/deselect all works correctly
✅ Device serial parsing handles multiple formats
✅ Small batch (6 tasks) creates successfully
✅ Full batch (460 tasks) creates without errors
✅ Tasks appear in appropriate dashboards (technician/quality)
✅ Job order progress updates correctly

---

## Performance Benchmarks

**Expected Creation Times:**
- 6 tasks: ~1-2 seconds
- 92 tasks (1 device): ~5-10 seconds
- 460 tasks (5 devices): ~15-30 seconds

**If slower:**
- Check database indexes
- Consider batch creation endpoint (future enhancement)
- Monitor server CPU/memory during creation

---

## Next Test: End-to-End Workflow

After all tasks are created, test the complete workflow:
1. Technician starts and completes a task
2. Quality inspector reviews and approves
3. Supervisor reviews if needed
4. Check job order progress updates
5. Verify efficiency calculations
6. Test notifications

---

## Clean Up After Testing

```bash
cd backend
python manage.py shell
```

```python
from core.models import Task, Device, JobOrder

# Delete test job orders
JobOrder.objects.filter(order_code__startswith='JO-TEST').delete()

# Delete test devices
Device.objects.filter(serial_number__startswith='TEST-').delete()
Device.objects.filter(serial_number__startswith='A340-BATCH').delete()

# Verify cleanup
print(f"Remaining tasks: {Task.objects.count()}")
print(f"Remaining devices: {Device.objects.count()}")
print(f"Remaining job orders: {JobOrder.objects.count()}")
```

---

**Ready to test! Start with Test 1 and work through sequentially. Good luck! 🚀**
