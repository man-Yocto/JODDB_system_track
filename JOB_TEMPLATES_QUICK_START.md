# Job Templates - Quick Start Testing Guide 🚀

## Prerequisites
- Backend server running on `http://localhost:8000`
- Frontend server running on `http://localhost:5173` (or configured port)
- User account with `planning` role

---

## Test Scenario 1: View Existing Jobs

### Steps:
1. Login as planning engineer
2. Navigate to Planner Dashboard
3. Click **"Jobs"** tab (with 📦 icon)
4. Observe the list of job templates
5. Click on a job card to expand and see processes

### Expected Result:
- ✅ Page loads with all job templates
- ✅ Each job shows name, description, and process count
- ✅ Clicking expands to show ordered process list
- ✅ Each process shows order, name, type, and standard time

---

## Test Scenario 2: Create a New Simple Job

### Steps:
1. Click **"Add New Job"** button
2. Enter the following:
   ```
   Job Name: Laptop Assembly
   Description: Complete laptop assembly workflow
   ```
3. For Process #1:
   ```
   Operation Name: Install Motherboard
   Standard Time: 300
   Task Type: Technician
   ```
4. Click **"Add Process"**
5. For Process #2:
   ```
   Operation Name: Quality Check
   Standard Time: 120
   Task Type: Quality Inspector
   ```
6. Click **"Create Job"**

### Expected Result:
- ✅ Modal closes
- ✅ New "Laptop Assembly" appears in the job list
- ✅ Shows "2 processes"
- ✅ Expanding shows both processes in correct order

### API Request:
```http
POST /api/v1/jobs/
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Laptop Assembly",
  "description": "Complete laptop assembly workflow",
  "processes": [
    {
      "operation_name": "Install Motherboard",
      "standard_time_seconds": 300,
      "task_type": "technician",
      "order": 1
    },
    {
      "operation_name": "Quality Check",
      "standard_time_seconds": 120,
      "task_type": "quality",
      "order": 2
    }
  ]
}
```

---

## Test Scenario 3: Edit Existing Job

### Steps:
1. Find the "Laptop Assembly" job created above
2. Click the **Edit (✏️)** icon
3. Change:
   ```
   Job Name: Laptop Final Assembly
   Description: Updated assembly process for final stage
   ```
4. Click **"Update Job"**

### Expected Result:
- ✅ Modal closes
- ✅ Job name updated to "Laptop Final Assembly"
- ✅ Description updated
- ✅ Processes remain unchanged

### API Request:
```http
PATCH /api/v1/jobs/{job_id}/
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "Laptop Final Assembly",
  "description": "Updated assembly process for final stage"
}
```

---

## Test Scenario 4: Delete a Job

### Steps:
1. Find the "Laptop Final Assembly" job
2. Click the **Delete (🗑️)** icon
3. Confirm deletion in the popup

### Expected Result:
- ✅ Confirmation dialog appears
- ✅ After confirming, job disappears from list
- ✅ All associated processes also deleted

### API Request:
```http
DELETE /api/v1/jobs/{job_id}/
Authorization: Bearer <token>
```

---

## Test Scenario 5: Create Complex Job (Many Processes)

### Steps:
1. Click **"Add New Job"**
2. Enter:
   ```
   Job Name: Aircraft Wing Assembly
   Description: Complete wing assembly process for commercial aircraft
   ```
3. Add 5 processes:
   - Process 1: "Frame Installation" - 1800s - Technician
   - Process 2: "Hydraulic System" - 2400s - Technician
   - Process 3: "Quality Inspection" - 600s - Quality Inspector
   - Process 4: "Electrical Wiring" - 3600s - Technician
   - Process 5: "Final Testing" - 1200s - Tester

4. Click **"Create Job"**

### Expected Result:
- ✅ Job created with all 5 processes
- ✅ Processes numbered 1-5 in order
- ✅ Each process has correct type and time

---

## Test Scenario 6: Validation Testing

### Test 6a: Empty Job Name
1. Click "Add New Job"
2. Leave job name empty
3. Click "Create Job"
4. **Expected**: Alert "Job name is required"

### Test 6b: No Processes
1. Click "Add New Job"
2. Enter job name
3. Remove all processes
4. Click "Create Job"
5. **Expected**: Alert "At least one process is required"

### Test 6c: Empty Process Name
1. Click "Add New Job"
2. Enter job name
3. Leave process operation name empty
4. Click "Create Job"
5. **Expected**: Alert "All processes must have an operation name"

### Test 6d: Invalid Standard Time
1. Click "Add New Job"
2. Enter job name
3. Set process standard time to 0 or negative
4. Click "Create Job"
5. **Expected**: Alert "All processes must have a standard time greater than 0"

---

## Test Scenario 7: Integration with Job Orders

### Steps:
1. Create a new job template (e.g., "Test Assembly - 3 Steps")
2. Navigate back to Planner Dashboard
3. Click "New Job Order"
4. Select the newly created job from dropdown
5. Fill in:
   ```
   Job Order Code: TEST-001
   Title: Test Order
   Total Devices: 2
   Due Date: (any future date)
   ```
6. Click "Create Job Order"
7. Navigate to Job Order Details

### Expected Result:
- ✅ Job order created
- ✅ 2 devices auto-generated
- ✅ Each device has all 3 tasks (from the job template)
- ✅ Tasks have correct operation names, times, and types
- ✅ Tasks are in "available" status

### Verification Query (Optional - Backend):
```python
# Django shell
job_order = JobOrder.objects.get(order_code='TEST-001')
devices = job_order.devices.all()
for device in devices:
    tasks = device.tasks.all()
    print(f"{device.serial_number}: {tasks.count()} tasks")
    for task in tasks:
        print(f"  - {task.operation_name} ({task.task_type})")
```

---

## Test Scenario 8: Permission Testing (Non-Planning User)

### Steps:
1. Logout
2. Login as a **Technician** or **Quality Inspector**
3. Try to access `/jobs` route directly

### Expected Result:
- ✅ Redirected to unauthorized page OR
- ✅ Jobs navigation not visible in their dashboard

### API Test (Technician Token):
```http
POST /api/v1/jobs/
Authorization: Bearer <technician_token>

{
  "name": "Unauthorized Job",
  "processes": []
}
```
**Expected Response**: 403 Forbidden

---

## Test Scenario 9: Process Management

### Test 9a: Add Process to Existing Job
1. Edit an existing job
2. Click "Add Process"
3. Fill in new process details
4. Click "Update Job"
5. **Expected**: New process appears in the workflow

### Test 9b: Remove Process from Job
1. Edit an existing job
2. Click trash icon on one of the processes
3. Click "Update Job"
4. **Expected**: Process removed, remaining processes renumbered

### Test 9c: Reorder Processes
1. Edit an existing job
2. Note current process order
3. Remove process #2
4. **Expected**: Process #3 becomes #2, etc.

---

## Browser Console Testing

### Check Network Requests:
1. Open browser DevTools (F12)
2. Go to Network tab
3. Create a new job
4. Look for:
   ```
   POST /api/v1/jobs/
   Status: 201 Created
   Response: { id, name, description, processes, ... }
   ```

### Check for Errors:
1. Open Console tab
2. Perform any action
3. **Expected**: No red error messages

---

## Quick Verification Checklist

- [ ] Can view all existing jobs
- [ ] Can expand/collapse job cards
- [ ] Can create new job with processes
- [ ] Can edit job name and description
- [ ] Can delete jobs with confirmation
- [ ] Can add multiple processes to a job
- [ ] Can remove processes from a job
- [ ] Process validation works (required fields)
- [ ] Jobs integrate with Job Order creation
- [ ] Tasks auto-generate when Job Order created
- [ ] Non-planning users cannot access
- [ ] Backend returns proper error codes
- [ ] UI shows loading states
- [ ] UI shows error messages when needed
- [ ] Back button navigates to Planner Dashboard

---

## Common Issues & Solutions

### Issue: Jobs not loading
**Solution**: Check backend server is running, check browser console for CORS errors

### Issue: "403 Forbidden" when creating job
**Solution**: Ensure logged in as planning engineer, check token validity

### Issue: Processes not showing after creation
**Solution**: Refresh page, check if job was actually created in backend

### Issue: Modal doesn't close after save
**Solution**: Check for validation errors, ensure all required fields filled

### Issue: Tasks not auto-generated for Job Order
**Solution**: Ensure signals.py is loaded (check apps.py), ensure Job has processes

---

## Success Criteria ✅

A successful test means:
1. ✅ Planning Engineers can perform all CRUD operations on jobs
2. ✅ All validations work correctly
3. ✅ UI is responsive and user-friendly
4. ✅ Integration with Job Orders works seamlessly
5. ✅ Non-planning users are properly restricted
6. ✅ No console errors
7. ✅ All network requests return expected responses
8. ✅ Data persists across page refreshes

---

## Need Help?

Check these files for reference:
- Frontend: `frontend/src/pages/JobTemplatesPage.tsx`
- API Service: `frontend/src/services/api.ts`
- Backend Views: `backend/core/views.py`
- Serializers: `backend/core/serializers.py`
- Documentation: `JOB_TEMPLATES_MANAGEMENT_GUIDE.md`
