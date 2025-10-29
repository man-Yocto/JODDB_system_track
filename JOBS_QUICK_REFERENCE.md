# 🚀 Job Templates - Quick Reference Card

## Access
**URL**: `http://localhost:5173/jobs`  
**Who**: Planning Engineers only  
**From**: Planner Dashboard → "Jobs" tab (📦)

---

## Create Job

**Button**: "Add New Job"

**Required Fields**:
- ✅ Job Name (unique)
- ✅ At least 1 process

**Process Fields**:
- ✅ Operation Name
- ✅ Standard Time (seconds)
- ✅ Task Type: Technician / Quality / Tester
- ✅ Order (auto-assigned)

**Action**: Click "Create Job"

---

## View Jobs

**Collapsed**: Shows name, description, process count  
**Expanded**: Click card to see full process workflow  
**Process Info**: Order, name, type, time

---

## Edit Job

**Button**: ✏️ Edit icon  
**Can Change**: Name, description, processes  
**Action**: Click "Update Job"

---

## Delete Job

**Button**: 🗑️ Delete icon  
**Warning**: Requires confirmation  
**Effect**: Removes job and all processes

---

## Integration

**When**: Create Job Order  
**Select**: Job template from dropdown  
**Result**: Auto-generates:
- All devices (based on quantity)
- All tasks (for each device)
- Correct operation names & times
- Proper task types assigned

---

## API Testing

```bash
# Get token
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"planner","password":"yourpass"}'

# Create job
curl -X POST http://localhost:8000/api/v1/jobs/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Job",
    "processes": [{
      "operation_name": "Step 1",
      "standard_time_seconds": 60,
      "task_type": "technician",
      "order": 1
    }]
  }'
```

---

## Troubleshooting

**Error 400**: Check browser console for details  
**Error 403**: Not logged in as planning engineer  
**Error 500**: Check Django server logs  
**Jobs not showing**: Check backend is running  
**Modal won't close**: Check for validation errors

---

## Quick Checks

```bash
# Backend health
cd backend && python3 manage.py check

# View in browser console
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role); // Should be 'planning'

# Test API
api.jobs.getJobs().then(console.log);
```

---

## Validation Rules

❌ Empty job name  
❌ Duplicate job name  
❌ No processes  
❌ Empty operation name  
❌ Time ≤ 0  
❌ Invalid task type  

---

## Files to Know

**Frontend UI**: `frontend/src/pages/JobTemplatesPage.tsx`  
**API Service**: `frontend/src/services/api.ts`  
**Backend Views**: `backend/core/views.py`  
**Serializers**: `backend/core/serializers.py`  
**Auto Tasks**: `backend/core/signals.py`

---

## Key Features

✅ Full CRUD operations  
✅ Real-time updates  
✅ Auto task generation  
✅ Role-based security  
✅ Input validation  
✅ Error handling  
✅ Beautiful UI  

---

**That's it! You're ready to manage job templates! 🎉**
