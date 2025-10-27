# JODDB MVP API Endpoints

## Authentication

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/auth/login/` | POST | All | JWT login - returns access and refresh tokens |
| `/api/auth/refresh/` | POST | All | Refresh access token |
| `/api/auth/logout/` | POST | All | Blacklist refresh token |

**Example Login Request:**
```json
{
  "username": "tech_1",
  "password": "pass"
}
```

**Example Login Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 4,
    "username": "tech_1",
    "role": "technician",
    "full_name": "Ali Technician"
  }
}
```

---

## Job Orders

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/job-orders/` | GET | All authenticated | List all job orders (filtered by role) |
| `/api/job-orders/` | POST | Planning | Create new job order |
| `/api/job-orders/{id}/` | GET | All authenticated | Get job order details |
| `/api/job-orders/{id}/` | PATCH | Planning | Update job order |
| `/api/job-orders/{id}/progress/` | GET | All | Get job order progress percentage |

**Example Create Job Order:**
```json
{
  "order_code": "JO-2025-1001",
  "title": "Assembly Batch A1",
  "description": "First production batch for Q4",
  "total_devices": 50,
  "due_date": "2025-11-15"
}
```

---

## Devices

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/devices/` | GET | All | List devices |
| `/api/devices/` | POST | Planning | Add device to job order |
| `/api/devices/{id}/` | GET | All | Device details |

---

## Tasks

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/tasks/` | GET | All | List tasks (filtered: technicians see only theirs) |
| `/api/tasks/` | POST | Planning/Technician | Create task |
| `/api/tasks/{id}/` | GET | All | Task details |
| `/api/tasks/{id}/` | PATCH | Technician | Update task (start/end times, status) |
| `/api/tasks/{id}/start/` | POST | Technician | Start a task |
| `/api/tasks/{id}/end/` | POST | Technician | End a task |
| `/api/tasks/my-tasks/` | GET | Technician | Get current user's tasks |

**Example Start Task:**
```json
POST /api/tasks/123/start/
{}
```

**Example End Task:**
```json
POST /api/tasks/123/end/
{
  "notes": "Completed successfully, minor delay due to part shortage"
}
```

---

## Reports (NEW - Critical Feature)

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/reports/` | GET | All | List reports (filtered by role) |
| `/api/reports/` | POST | Technician/Quality | Submit operation report |
| `/api/reports/{id}/` | GET | All | View specific report |
| `/api/reports/task/{task_id}/` | GET | All | Get all reports for a task |
| `/api/reports/job-order/{jo_id}/` | GET | Supervisor/Planning | Get all reports for a job order |

**Example Create Technician Report:**
```json
POST /api/reports/
{
  "task": 45,
  "job_order": 12,
  "role_type": "technician",
  "content": "Assembly completed. All components fitted correctly. Minor issue with connector B-3 required additional adjustment. Total time: 28 minutes."
}
```

**Example Create Quality Report:**
```json
POST /api/reports/
{
  "task": 45,
  "job_order": 12,
  "role_type": "quality",
  "content": "Visual inspection passed. Electrical continuity test: OK. Dimensions within tolerance. Device SN1001 approved for next stage."
}
```

---

## Inspections

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/inspections/` | GET | Quality/Supervisor | List inspections |
| `/api/inspections/` | POST | Quality | Create inspection (accept/reject task) |
| `/api/inspections/{id}/` | GET | Quality/Supervisor | Inspection details |

**Example Create Inspection:**
```json
{
  "task": 45,
  "decision": "accepted",
  "comments": "All quality checks passed"
}
```

---

## Supervisor Reviews

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/supervisor-reviews/` | GET | Supervisor | List reviews |
| `/api/supervisor-reviews/` | POST | Supervisor | Final approval/rejection |
| `/api/supervisor-reviews/{id}/` | GET | Supervisor/Planning | Review details |

---

## Metrics

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/metrics/job-order/{id}/` | GET | Planning/Supervisor | Job order KPIs |
| `/api/metrics/technician/{id}/` | GET | Planning/Supervisor | Technician performance |
| `/api/metrics/dashboard/` | GET | Planning | Overall dashboard metrics |

---

## Notifications

| Endpoint | Method | Role | Description |
|----------|--------|------|-------------|
| `/api/notifications/` | GET | All | User's notifications |
| `/api/notifications/{id}/read/` | POST | All | Mark notification as read |
| `/api/notifications/mark-all-read/` | POST | All | Mark all as read |

---

## Key Notes:

1. **All endpoints require authentication** via JWT Bearer token in header:
```
   Authorization: Bearer <access_token>
```

2. **Reports are critical** - both Technicians and Quality Inspectors must submit reports after completing operations.

3. **Role-based filtering** - Users only see data relevant to their role.

4. **Timestamps** - All timestamps are in UTC, converted to Asia/Amman timezone on the frontend.