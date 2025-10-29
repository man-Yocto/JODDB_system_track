# Thunder Client Testing Guide - Tester API & Task Type System

## Base URL
```
http://localhost:8000/api/
```

---

## 1. AUTHENTICATION TESTS

### 1.1 Login as Tester
**Method:** POST  
**URL:** `http://localhost:8000/api/auth/login/`  
**Headers:** Content-Type: application/json  
**Body:**
```json
{
  "username": "tester_1",
  "password": "pass"
}
```
**Expected Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 4,
    "username": "tester_1",
    "role": "tester",
    "full_name": "Tester One"
  }
}
```
**✓ Save the `access` token for subsequent requests**

---

### 1.2 Login as Planning Engineer (to create job orders)
**Method:** POST  
**URL:** `http://localhost:8000/api/auth/login/`  
**Body:**
```json
{
  "username": "pe_1",
  "password": "pass"
}
```
**Expected Response:** Returns access token for PE

---

### 1.3 Login as Technician (for comparison)
**Method:** POST  
**URL:** `http://localhost:8000/api/auth/login/`  
**Body:**
```json
{
  "username": "tech_1",
  "password": "pass"
}
```

---

## 2. CREATE TEST DATA - JOB ORDERS WITH TASK TYPES

### 2.1 Create Job Order with TECHNICIAN Task Type (PE creates)
**Method:** POST  
**URL:** `http://localhost:8000/api/job-orders/`  
**Headers:**
```
Authorization: Bearer <PE_ACCESS_TOKEN>
Content-Type: application/json
```
**Body:**
```json
{
  "order_code": "JO-TECH-001",
  "title": "Technician Assembly Task",
  "description": "This is a technician assembly task for testing role-based filtering",
  "due_date": "2025-11-15",
  "total_devices": 2,
  "device_serials": ["DEV-TECH-001", "DEV-TECH-002"],
  "standard_time_seconds": 1800,
  "operation_name": "Standard Assembly",
  "task_type": "technician"
}
```
**Expected Response:** 201 Created  
**✓ Verify status: 201**

---

### 2.2 Create Job Order with TESTER Task Type (PE creates)
**Method:** POST  
**URL:** `http://localhost:8000/api/job-orders/`  
**Headers:**
```
Authorization: Bearer <PE_ACCESS_TOKEN>
Content-Type: application/json
```
**Body:**
```json
{
  "order_code": "JO-TESTER-001",
  "title": "Tester Inspection Task",
  "description": "This is a tester inspection task for quality testing",
  "due_date": "2025-11-15",
  "total_devices": 3,
  "device_serials": ["DEV-TESTER-001", "DEV-TESTER-002", "DEV-TESTER-003"],
  "standard_time_seconds": 900,
  "operation_name": "Quality Inspection",
  "task_type": "tester"
}
```
**Expected Response:** 201 Created  
**✓ Verify status: 201**

---

### 2.3 Create Job Order with QUALITY Task Type (PE creates)
**Method:** POST  
**URL:** `http://localhost:8000/api/job-orders/`  
**Headers:**
```
Authorization: Bearer <PE_ACCESS_TOKEN>
Content-Type: application/json
```
**Body:**
```json
{
  "order_code": "JO-QA-001",
  "title": "Quality Inspector Task",
  "description": "This is a quality inspection task",
  "due_date": "2025-11-15",
  "total_devices": 2,
  "device_serials": ["DEV-QA-001", "DEV-QA-002"],
  "standard_time_seconds": 1200,
  "operation_name": "Quality Review",
  "task_type": "quality"
}
```
**Expected Response:** 201 Created

---

## 3. ROLE-BASED TASK FILTERING TESTS

### 3.1 Tester Views ONLY Tester Tasks (MOST IMPORTANT TEST)
**Method:** GET  
**URL:** `http://localhost:8000/api/tasks/`  
**Headers:**
```
Authorization: Bearer <TESTER_ACCESS_TOKEN>
Content-Type: application/json
```
**Expected Response:** 200 OK
```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "operation_name": "Quality Inspection",
      "device_serial": "DEV-TESTER-001",
      "status": "available",
      "task_type": "tester",
      "task_type_display": "Tester Task",
      "standard_time_seconds": 900
    },
    {
      "id": 2,
      "operation_name": "Quality Inspection",
      "device_serial": "DEV-TESTER-002",
      "status": "available",
      "task_type": "tester",
      "task_type_display": "Tester Task",
      "standard_time_seconds": 900
    },
    {
      "id": 3,
      "operation_name": "Quality Inspection",
      "device_serial": "DEV-TESTER-003",
      "status": "available",
      "task_type": "tester",
      "task_type_display": "Tester Task",
      "standard_time_seconds": 900
    }
  ]
}
```
**✓ CRITICAL: Tester should see ONLY tasks with `task_type: "tester"`**  
**✓ Tester should NOT see technician or quality tasks**

---

### 3.2 Technician Views ONLY Technician Tasks
**Method:** GET  
**URL:** `http://localhost:8000/api/tasks/`  
**Headers:**
```
Authorization: Bearer <TECH_ACCESS_TOKEN>
Content-Type: application/json
```
**Expected Response:** 200 OK  
**✓ Technician should see ONLY tasks with `task_type: "technician"`**  
**✓ Should see DEV-TECH-001 and DEV-TECH-002 tasks**

---

### 3.3 Quality Inspector Views ONLY Quality Tasks (if available)
**Method:** GET  
**URL:** `http://localhost:8000/api/tasks/`  
**Headers:**
```
Authorization: Bearer <QA_ACCESS_TOKEN>
Content-Type: application/json
```
**Expected Response:** 200 OK  
**✓ QI should see ONLY tasks with `task_type: "quality"`**

---

### 3.4 Planning Engineer Views ALL Tasks
**Method:** GET  
**URL:** `http://localhost:8000/api/tasks/`  
**Headers:**
```
Authorization: Bearer <PE_ACCESS_TOKEN>
Content-Type: application/json
```
**Expected Response:** 200 OK  
**✓ PE should see ALL tasks (technician, quality, and tester tasks)**

---

## 4. TESTER INSPECTION WORKFLOW TESTS

### 4.1 Get Specific Task Detail
**Method:** GET  
**URL:** `http://localhost:8000/api/tasks/1/`  
**Headers:**
```
Authorization: Bearer <TESTER_ACCESS_TOKEN>
Content-Type: application/json
```
**Expected Response:** 200 OK
```json
{
  "id": 1,
  "operation_name": "Quality Inspection",
  "device_serial": "DEV-TESTER-001",
  "status": "available",
  "task_type": "tester",
  "task_type_display": "Tester Task",
  "standard_time_seconds": 900,
  "order_code": "JO-TESTER-001"
}
```

---

### 4.2 Start Testing (Update Task Status)
**Method:** PATCH  
**URL:** `http://localhost:8000/api/tasks/1/start/`  
**Headers:**
```
Authorization: Bearer <TESTER_ACCESS_TOKEN>
Content-Type: application/json
```
**Body:**
```json
{}
```
**Expected Response:** 200 OK
```json
{
  "id": 1,
  "status": "in_progress",
  "assigned_to": 4,
  "assigned_to_username": "tester_1"
}
```

---

### 4.3 Submit Inspection (Accept Task)
**Method:** POST  
**URL:** `http://localhost:8000/api/inspections/`  
**Headers:**
```
Authorization: Bearer <TESTER_ACCESS_TOKEN>
Content-Type: application/json
```
**Body:**
```json
{
  "task_id": 1,
  "decision": "accepted",
  "comments": "All tests passed successfully. Device is functioning correctly."
}
```
**Expected Response:** 201 Created
```json
{
  "id": 1,
  "task_id": 1,
  "task_operation_name": "Quality Inspection",
  "task_device_serial": "DEV-TESTER-001",
  "decision": "accepted",
  "decision_display": "Accepted",
  "comments": "All tests passed successfully. Device is functioning correctly.",
  "created_by_username": "tester_1",
  "created_at": "2025-10-29T15:30:45.123456Z"
}
```
**✓ Verify inspection created successfully**

---

### 4.4 Submit Inspection (Reject Task with Comments)
**Method:** POST  
**URL:** `http://localhost:8000/api/inspections/`  
**Headers:**
```
Authorization: Bearer <TESTER_ACCESS_TOKEN>
Content-Type: application/json
```
**Body:**
```json
{
  "task_id": 2,
  "decision": "rejected",
  "comments": "Found critical defect in power supply. Device needs rework."
}
```
**Expected Response:** 201 Created
```json
{
  "id": 2,
  "task_id": 2,
  "decision": "rejected",
  "decision_display": "Rejected",
  "comments": "Found critical defect in power supply. Device needs rework.",
  "created_by_username": "tester_1",
  "created_at": "2025-10-29T15:32:10.123456Z"
}
```
**✓ Verify rejection inspection with comments created**

---

### 4.5 Get All Inspections (Tester)
**Method:** GET  
**URL:** `http://localhost:8000/api/inspections/`  
**Headers:**
```
Authorization: Bearer <TESTER_ACCESS_TOKEN>
Content-Type: application/json
```
**Expected Response:** 200 OK
```json
{
  "count": 2,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "task_id": 1,
      "task_operation_name": "Quality Inspection",
      "task_device_serial": "DEV-TESTER-001",
      "decision": "accepted",
      "decision_display": "Accepted",
      "comments": "All tests passed successfully.",
      "created_by_username": "tester_1",
      "created_at": "2025-10-29T15:30:45.123456Z"
    },
    {
      "id": 2,
      "task_id": 2,
      "task_operation_name": "Quality Inspection",
      "task_device_serial": "DEV-TESTER-002",
      "decision": "rejected",
      "decision_display": "Rejected",
      "comments": "Found critical defect.",
      "created_by_username": "tester_1",
      "created_at": "2025-10-29T15:32:10.123456Z"
    }
  ]
}
```
**✓ Verify both inspections appear in history**

---

## 5. VALIDATION & ERROR TESTS

### 5.1 Reject Without Comments (Should Fail or Require Comments)
**Method:** POST  
**URL:** `http://localhost:8000/api/inspections/`  
**Headers:**
```
Authorization: Bearer <TESTER_ACCESS_TOKEN>
Content-Type: application/json
```
**Body:**
```json
{
  "task_id": 3,
  "decision": "rejected",
  "comments": ""
}
```
**Expected Response:** 400 Bad Request  
**✓ Verify backend requires comments for rejection**

---

### 5.2 Unauthorized Access (No Token)
**Method:** GET  
**URL:** `http://localhost:8000/api/tasks/`  
**Headers:** (No Authorization header)

**Expected Response:** 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

---

### 5.3 Forbidden Access (Technician tries to access Tester API)
**Method:** POST  
**URL:** `http://localhost:8000/api/inspections/`  
**Headers:**
```
Authorization: Bearer <TECH_ACCESS_TOKEN>
Content-Type: application/json
```
**Body:**
```json
{
  "task_id": 1,
  "decision": "accepted",
  "comments": "Test comment"
}
```
**Expected Response:** 403 Forbidden (or 400 if task_id doesn't exist for tech)

---

## 6. COMPLETE TEST FLOW CHECKLIST

### ✅ Test Sequence:
- [ ] **Test 1.1**: Login as tester_1 and save access token
- [ ] **Test 2.1**: PE creates technician task (JO-TECH-001)
- [ ] **Test 2.2**: PE creates tester task (JO-TESTER-001)
- [ ] **Test 2.3**: PE creates quality task (JO-QA-001)
- [ ] **Test 3.1**: Tester views tasks → **SHOULD ONLY SEE TESTER TASKS**
- [ ] **Test 3.2**: Technician views tasks → **SHOULD ONLY SEE TECHNICIAN TASKS**
- [ ] **Test 3.3**: QI views tasks → **SHOULD ONLY SEE QUALITY TASKS**
- [ ] **Test 3.4**: PE views tasks → **SHOULD SEE ALL TASKS**
- [ ] **Test 4.2**: Tester starts testing task 1
- [ ] **Test 4.3**: Tester accepts task with comments
- [ ] **Test 4.4**: Tester rejects task with comments
- [ ] **Test 4.5**: View inspection history → **SHOULD SHOW BOTH INSPECTIONS**
- [ ] **Test 5.1**: Try reject without comments → **SHOULD FAIL**
- [ ] **Test 5.2**: Request without auth → **SHOULD GET 401**

---

## 7. EXPECTED OUTCOMES

### ✅ Task Type System Working Correctly IF:
1. ✓ Each role sees ONLY their task type
2. ✓ Task creation includes `task_type` field
3. ✓ Task serializer returns `task_type` and `task_type_display`
4. ✓ Planning engineer sees all task types
5. ✓ Filtering works per user role

### ✅ Tester API Working Correctly IF:
1. ✓ Tester can view assigned tasks
2. ✓ Tester can start testing (update status to in_progress)
3. ✓ Tester can submit inspection with decision + comments
4. ✓ Inspection history shows all submissions
5. ✓ Acceptance/rejection tracking works
6. ✓ Comments properly stored and retrieved

---

## 8. TROUBLESHOOTING

### Issue: Tester sees technician tasks
**Solution:** Check `core/views.py` `TechnicianTaskViewSet.get_queryset()` for proper task_type filtering

### Issue: Tasks don't have task_type field
**Solution:** Run migrations: `python3 manage.py migrate`

### Issue: 403 Forbidden when creating inspection
**Solution:** Verify tester user exists and token is valid

### Issue: Comments validation failing
**Solution:** Check `InspectionSerializer` for required field validation

---

## 9. IMPORTANT NOTES

- **Base URL**: Ensure Django dev server is running on `http://localhost:8000`
- **Token Expiry**: Tokens may expire after time; re-login if getting 401 errors
- **Device Serials**: Must be unique across tests; use unique identifiers
- **Task IDs**: Adjust task IDs in requests based on actual database IDs
- **Headers**: Always include `Authorization: Bearer {token}` for authenticated endpoints

