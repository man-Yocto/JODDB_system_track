# Job Order Title Field Usage

## Summary
**Yes**, the `title` field in job orders **is actively used by the backend** and is essential for displaying job order information throughout the system.

## Backend Usage

### 1. **Database Model** (`backend/core/models.py`)
```python
class JobOrder(models.Model):
    order_code = models.CharField(max_length=100, unique=True, db_index=True)
    title = models.CharField(max_length=255)  # ← Required field, max 255 chars
    description = models.TextField(blank=True)
    ...
    
    def __str__(self):
        return f"{self.order_code} - {self.title}"  # Used in Django admin
```

**Characteristics:**
- Required field (no `blank=True` or `null=True`)
- Max length: 255 characters
- Used in string representation for logging and admin interface

### 2. **API Serializers** (`backend/core/serializers.py`)

**JobOrderSerializer** (List/Retrieve responses):
```python
class JobOrderSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    
    class Meta:
        model = JobOrder
        fields = ['id', 'order_code', 'title', 'due_date', 'total_devices', 
                  'status', 'created_at', 'created_by_username']
```

**JobOrderCreateSerializer** (Creation):
```python
class JobOrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobOrder
        fields = ['order_code', 'title', 'description', 'due_date', 
                  'standard_time_seconds', 'device_serials', 'operation_name']
```

### 3. **Data Import** (`backend/core/views.py`)
When importing job orders from Excel/CSV:
```python
# Line 533-534: Documentation of required columns
- Columns: job_order_code, title, due_date, device_serial, standard_time_seconds

# Line 560: Validation of required columns
required_columns = ['job_order_code', 'title', 'due_date', 'device_serial', 'standard_time_seconds']

# Line 587: Data extraction from CSV
'title': str(row['title']).strip(),
```

## Frontend Usage

### 1. **Planner Dashboard** (`JobOrdersPanel.tsx`)
```tsx
<h3 className="font-semibold text-gray-800 mb-1">{job.title}</h3>
```
Displays job title in the job order list panel.

### 2. **Job Order Details** (`JobOrderDetails.tsx`)
```tsx
<h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
```
Shows title as main heading in job order detail view.

### 3. **Analytics Dashboard** (`AnalyticsDashboard.tsx`)
```tsx
{job.order_code} - {job.title}
```
Displays title in analytics/reporting views.

### 4. **Supervisor Dashboard** (`SupervisorDashboard.tsx`)
```tsx
job.title.toLowerCase().includes(query) ||  // Search filter
```
Title is searchable when filtering job orders.

### 5. **Job Orders View** (`JobOrdersView.tsx`)
```tsx
job.title.toLowerCase().includes(query) ||  // Search functionality
<h1 className="text-3xl font-bold text-gray-800 mb-2">{activeJob.title}</h1>
```
Used in search and main display.

### 6. **Job Item Component** (`JobItem.tsx`)
```tsx
<h3 className="text-sm font-semibold text-gray-800">{job.title}</h3>
```
Displays title in job item cards.

### 7. **Supervisor Job Order Details** (`supervisor/JobOrderDetails.tsx`)
```tsx
<h1 className="text-2xl font-bold text-gray-800">{job.title}</h1>
```
Shows in supervisor view.

### 8. **Creation Form** (`CreateJobOrderModal.tsx`)
```tsx
if (!formData.title.trim()) return 'Title is required';  // Validation
title: formData.title.trim(),  // Sent to API
```
Required field when creating job orders.

## Data Flow

```
Planner
  ↓
CreateJobOrderModal (form)
  ├─ title: "Assembly Project Alpha"
  ↓
API POST /api/v1/job-orders/
  ├─ JobOrderCreateSerializer validates title
  ├─ Creates JobOrder with title
  ↓
Database (Job Order record)
  ├─ title: "Assembly Project Alpha"
  ↓
API GET /api/v1/job-orders/
  ├─ JobOrderSerializer serializes title
  ↓
Frontend Components
  ├─ JobOrdersPanel (displays title in list)
  ├─ JobOrderDetails (displays as main heading)
  ├─ AnalyticsDashboard (shows title in analytics)
  ├─ SupervisorDashboard (searchable by title)
  └─ JobOrdersView (displays in overview)
```

## Key Characteristics

| Aspect | Details |
|--------|---------|
| **Required** | Yes (must be provided during creation) |
| **Max Length** | 255 characters |
| **Data Type** | CharField (text string) |
| **Editable After Creation** | No (only readable in current implementation) |
| **Searchable** | Yes (by supervisor dashboard filters) |
| **Displayed In** | List views, detail views, analytics, supervisor dashboard |
| **Export/Import** | Included in CSV exports and imports |

## Backend Validation Rules

1. **Required**: Title must be provided when creating job order
2. **Max Length**: Cannot exceed 255 characters
3. **Unique?**: No, multiple job orders can have the same title
4. **Format**: No specific format restrictions (accepts any text)

## Frontend Validation Rules

```typescript
// CreateJobOrderModal.tsx
const validateForm = (): string | null => {
  if (!formData.order_code.trim()) return 'Job Order Code is required';
  if (!formData.title.trim()) return 'Title is required';  // ← Title validation
  if (!formData.due_date) return 'Due Date is required';
  if (!formData.standard_time_seconds) return 'Standard Time is required';
  if (parseInt(formData.standard_time_seconds) <= 0) return 'Standard Time must be greater than 0';
  if (!formData.device_serials.trim()) return 'At least one device serial is required';
  
  return null;
};
```

## Difference from Other Fields

| Field | Required | Searchable | Display Location | Max Length |
|-------|----------|-----------|------------------|-----------|
| **order_code** | Yes | Yes (Unique index) | List, Details, Analytics | 100 |
| **title** | Yes | Yes (Filters) | List, Details, Analytics, Search | 255 |
| **description** | No | No | Details page only | Unlimited |
| **operation_name** | No | No | Task display | 200 |
| **due_date** | Yes | No | List, Details, Analytics | - |

## Example API Request/Response

### Request to Create Job Order
```json
POST /api/v1/job-orders/
{
  "order_code": "JO-2025-001",
  "title": "Assembly Project Alpha",
  "description": "Complete assembly of unit components",
  "due_date": "2025-11-15",
  "standard_time_seconds": 3600,
  "device_serials": ["DEV-001", "DEV-002"],
  "operation_name": "Quality Inspection"
}
```

### Response (201 Created)
```json
{
  "id": 1,
  "order_code": "JO-2025-001",
  "title": "Assembly Project Alpha",
  "due_date": "2025-11-15",
  "total_devices": 2,
  "status": "available",
  "created_at": "2025-10-29T10:30:00Z",
  "created_by_username": "planner_user"
}
```

## Conclusion

**Yes, `title` is actively used by the backend** and is one of the core fields for job orders:

1. ✅ Stored as required field in database
2. ✅ Returned in all API responses
3. ✅ Used for display in UI components
4. ✅ Searchable/filterable by supervisors
5. ✅ Exported/imported with CSV files
6. ✅ Validated during creation

The `title` field is essential for identifying and describing job orders throughout the system. It's complementary to the `order_code` (unique identifier) and provides human-readable context about the job order's purpose.
