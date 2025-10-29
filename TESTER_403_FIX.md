# Tester API 403 Forbidden Error - FIXED

## Problem
The tester was getting a 403 Forbidden error when trying to access the inspections endpoint at:
```
GET http://localhost:8000/api/v1/inspections/
```

## Root Cause
The `InspectionViewSet` in `/backend/core/views.py` only allowed access to users with roles `quality`, `supervisor`, or `admin`. The `tester` role was not included in the permission checks.

## Solution Applied
Updated the `InspectionViewSet` to include the `tester` role in both:

### 1. **Permissions** (`get_permissions()` method)
```python
def get_permissions(self):
    """
    Permissions based on action and user role:
    - Create: Quality Inspector or Tester
    - List: Quality Inspector, Tester, Supervisor, or Admin
    """
    if self.action == 'create':
        self.permission_classes = [IsAuthenticated, IsRoleRequired(['quality', 'tester', 'admin'])]
    else:
        # List action
        self.permission_classes = [IsAuthenticated, IsRoleRequired(['quality', 'tester', 'supervisor', 'admin'])]
    return [permission() for permission in self.permission_classes]
```

### 2. **Queryset Filtering** (`get_queryset()` method)
```python
def get_queryset(self):
    """
    Filter inspections based on user role:
    - Quality Inspectors: see all inspections
    - Testers: see only their own inspections
    - Supervisors: see all inspections
    - Admin: see all inspections
    """
    user = self.request.user
    
    if user.role in ['quality', 'supervisor', 'admin']:
        # QI, Supervisor, Admin see all inspections
        return Inspection.objects.all().select_related('task', 'task__device', 'inspector')
    elif user.role == 'tester':
        # Tester sees only their own inspections
        return Inspection.objects.filter(inspector=user).select_related('task', 'task__device', 'inspector')
    
    return Inspection.objects.none()
```

## Key Changes
✅ Added `'tester'` to create permissions  
✅ Added `'tester'` to list permissions  
✅ Testers can now create inspections (POST /api/v1/inspections/)  
✅ Testers can now view their own inspection history (GET /api/v1/inspections/)  
✅ Testers only see inspections they created (privacy preserved)  

## Testing the Fix

### Step 1: Restart Django Backend
```bash
cd /sgoinfre/amsaleh/hackathon/backend
python3 manage.py runserver
```

### Step 2: Test with Thunder Client
1. **Login as Tester**
   - POST `http://localhost:8000/api/v1/auth/login/`
   - Body: `{"username": "tester_1", "password": "pass"}`
   - Save the `access` token

2. **Get Inspection History**
   - GET `http://localhost:8000/api/v1/inspections/`
   - Header: `Authorization: Bearer {access_token}`
   - Expected: 200 OK (should now return list of inspections, even if empty)

3. **Create Inspection**
   - POST `http://localhost:8000/api/v1/inspections/`
   - Header: `Authorization: Bearer {access_token}`
   - Body: 
   ```json
   {
     "task_id": 1,
     "decision": "accepted",
     "comments": "Test passed"
   }
   ```
   - Expected: 201 Created

### Step 3: Verify Frontend
- Open browser to `http://localhost:5173`
- Login as tester_1 (password: pass)
- Navigate to `/tester` dashboard
- Should see KPI cards and testing queue without 403 errors

## Files Modified
- `/sgoinfre/amsaleh/hackathon/backend/core/views.py` - Updated `InspectionViewSet` class

## Status
✅ FIXED - Tester API is now accessible with proper permissions

