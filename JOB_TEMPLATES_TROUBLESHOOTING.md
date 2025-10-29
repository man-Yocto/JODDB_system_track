# Job Templates - Troubleshooting Guide 🔧

## Error: 400 Bad Request when creating job

### Possible Causes & Solutions

#### 1. **Missing Required Fields**
**Error Message**: `"This field is required"`

**Solution**: Ensure all required fields are filled:
```json
{
  "name": "Required - cannot be empty",
  "description": "Optional",
  "processes": [
    {
      "operation_name": "Required",
      "standard_time_seconds": 60,  // Required, must be > 0
      "task_type": "technician",     // Required
      "order": 1                      // Required
    }
  ]
}
```

#### 2. **Invalid Process Data**
**Error Message**: Various validation errors

**Check**:
- `task_type` must be one of: `"technician"`, `"quality"`, `"tester"`
- `standard_time_seconds` must be a positive integer
- `order` must be a positive integer
- `operation_name` cannot be empty

**Fix in Frontend**: The validation in `JobTemplatesPage.tsx` already handles this:
```typescript
for (const proc of editingJob.processes) {
  if (!proc.operation_name) {
    alert('All processes must have an operation name.');
    return;
  }
  if (proc.standard_time_seconds <= 0) {
    alert('All processes must have a standard time greater than 0.');
    return;
  }
}
```

#### 3. **Duplicate Job Name**
**Error Message**: `"Job with this name already exists"`

**Solution**: Job names must be unique. Check if a job with the same name already exists.

**Fix**: Add uniqueness check before submitting:
```typescript
const existingJob = jobs.find(j => j.name.toLowerCase() === editingJob.name.toLowerCase());
if (existingJob && existingJob.id !== editingJob.id) {
  alert('A job with this name already exists.');
  return;
}
```

#### 4. **Process Order Issues**
**Error Message**: `"Processes with duplicate order numbers"`

**Solution**: The frontend automatically assigns order numbers (1, 2, 3...), but if manually testing the API, ensure each process has a unique order number.

---

## Error: Network Request Failed

### Possible Causes

#### 1. **Backend Not Running**
**Check**: Is Django server running on `http://localhost:8000`?

**Solution**:
```bash
cd backend
python3 manage.py runserver
```

#### 2. **CORS Issues**
**Symptom**: Console shows CORS policy errors

**Solution**: Verify `CORS_ALLOWED_ORIGINS` in `backend/joddb_backend/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",  # Alternative
]
```

#### 3. **Wrong API URL**
**Check**: `frontend/src/services/api.ts`
```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

**Solution**: Ensure `.env` file has correct URL or default is correct.

---

## Error: 403 Forbidden

### Possible Causes

#### 1. **Not Logged in as Planning Engineer**
**Solution**: Ensure you're logged in with a user that has `role = 'planning'`

**Verify**:
```javascript
// In browser console
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.role); // Should be 'planning'
```

#### 2. **Token Expired**
**Solution**: Logout and login again to get a fresh token.

#### 3. **Missing Authorization Header**
**Check**: API request includes `Authorization: Bearer <token>`

**Verify in DevTools**:
1. Open Network tab
2. Find the failed request
3. Check Headers section
4. Look for `Authorization` header

---

## Error: 500 Internal Server Error

### Debugging Steps

#### 1. **Check Backend Logs**
Look at Django server console for error traceback.

#### 2. **Common Issues**:

**Missing Migration**:
```bash
cd backend
python3 manage.py makemigrations
python3 manage.py migrate
```

**Database Lock** (SQLite):
```bash
# Stop all backend processes
# Restart server
python3 manage.py runserver
```

**Signal Not Loading**:
Check `backend/core/apps.py`:
```python
class CoreConfig(AppConfig):
    def ready(self):
        import core.signals  # This line must exist
```

---

## Frontend Issues

### Issue: Modal doesn't close after clicking "Create Job"

**Possible Causes**:
1. Validation error (check console for alerts)
2. API request failed (check Network tab)
3. Error response from backend

**Debug**:
```typescript
// Add in handleSaveJob:
console.log('Submitting job data:', jobData);
```

### Issue: Jobs list doesn't refresh after creating job

**Solution**: The `fetchJobs()` call should run after successful creation.

**Verify**:
```typescript
await api.jobs.createJob(jobData);
fetchJobs();  // This should be called
setIsModalOpen(false);
```

### Issue: Processes not showing in expanded view

**Check**:
1. Does the job have processes in the database?
2. Is `processes` array populated in the API response?

**Debug**:
```typescript
// In browser console after fetching jobs
const jobs = await api.jobs.getJobs();
console.log(jobs[0].processes); // Should be an array
```

---

## Backend Issues

### Issue: ProcessSerializer validation error

**Error**: `"This field is required"` for 'job' field when creating nested processes

**Solution**: Already fixed in serializer:
```python
class ProcessSerializer(serializers.ModelSerializer):
    class Meta:
        extra_kwargs = {
            'job': {'required': False}  # Make job optional for nested creation
        }
```

### Issue: Processes not created with job

**Check**: `JobSerializer.create()` method:
```python
def create(self, validated_data):
    processes_data = validated_data.pop('processes', [])
    job = Job.objects.create(**validated_data)
    
    for process_data in processes_data:
        process_data.pop('job', None)  # Remove job field if present
        Process.objects.create(job=job, **process_data)
    
    return job
```

---

## Testing & Verification

### Manual API Test (using cURL)

**1. Get Auth Token**:
```bash
curl -X POST http://localhost:8000/api/v1/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "planner", "password": "your-password"}'
```

**2. Create Job**:
```bash
curl -X POST http://localhost:8000/api/v1/jobs/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Test Job",
    "description": "Test description",
    "processes": [
      {
        "operation_name": "Step 1",
        "standard_time_seconds": 120,
        "task_type": "technician",
        "order": 1
      }
    ]
  }'
```

**Expected Response** (201 Created):
```json
{
  "id": 1,
  "name": "Test Job",
  "description": "Test description",
  "processes": [
    {
      "id": 1,
      "job": 1,
      "operation_name": "Step 1",
      "standard_time_seconds": 120,
      "task_type": "technician",
      "order": 1
    }
  ],
  "created_at": "2025-10-29T...",
  "updated_at": "2025-10-29T..."
}
```

### Frontend Console Test

Open browser console and run:
```javascript
// Test API connection
const testJob = {
  name: "Console Test Job",
  description: "Testing from console",
  processes: [
    {
      operation_name: "Test Process",
      standard_time_seconds: 60,
      task_type: "technician",
      order: 1
    }
  ]
};

// This will show the actual error if it fails
api.jobs.createJob(testJob)
  .then(response => console.log('Success:', response))
  .catch(error => {
    console.error('Error:', error);
    console.error('Response data:', error.response?.data);
  });
```

---

## Common Error Messages & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `"name": ["This field may not be blank."]` | Empty job name | Fill in job name |
| `"processes": ["This field is required."]` | Missing processes array | Add at least one process |
| `"task_type": ["Invalid choice."]` | Wrong task type value | Use: "technician", "quality", or "tester" |
| `"standard_time_seconds": ["Ensure this value is greater than or equal to 1."]` | Time <= 0 | Use positive number |
| `"job with this name already exists."` | Duplicate name | Use unique job name |
| `401 Unauthorized` | Not logged in | Login again |
| `403 Forbidden` | Not planning engineer | Login as planning role |
| `404 Not Found` | Wrong URL | Check API endpoint |
| `500 Internal Server Error` | Backend error | Check Django logs |

---

## Debugging Checklist

Before reporting an issue, verify:

- [ ] Backend server is running (`http://localhost:8000`)
- [ ] Frontend server is running (`http://localhost:5173`)
- [ ] Logged in as planning engineer
- [ ] Token is valid (try logout/login)
- [ ] Job name is not empty
- [ ] Job name is unique
- [ ] At least one process is defined
- [ ] All process fields are filled
- [ ] `task_type` is one of valid options
- [ ] `standard_time_seconds` is > 0
- [ ] Browser console shows no errors
- [ ] Network tab shows correct request data
- [ ] Django migrations are applied
- [ ] `core.signals` is imported in `apps.py`

---

## Getting Detailed Error Info

Add this to `JobTemplatesPage.tsx` temporarily:

```typescript
} catch (err: any) {
  console.error('Full error object:', err);
  console.error('Error response:', err.response);
  console.error('Error response data:', err.response?.data);
  console.error('Error response status:', err.response?.status);
  console.error('Request data was:', jobData);
  
  // Show detailed error to user
  const errorDetails = JSON.stringify(err.response?.data, null, 2);
  alert(`Error creating job:\n\n${errorDetails}`);
}
```

This will show you exactly what the backend is complaining about!

---

## Still Having Issues?

1. **Check the backend logs** - Most errors show there
2. **Test with cURL** - Isolate if it's frontend or backend issue
3. **Clear browser cache** - Old code might be cached
4. **Restart both servers** - Sometimes a fresh start helps
5. **Check the documentation**:
   - `JOB_TEMPLATES_MANAGEMENT_GUIDE.md`
   - `JOB_TEMPLATES_QUICK_START.md`
   - `JOB_TEMPLATES_VISUAL_GUIDE.md`
