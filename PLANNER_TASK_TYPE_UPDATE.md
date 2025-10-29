# Planner Create Job Order - Task Type Update ✅

## Overview
The Planner's "Create Job Order" modal has been updated to support the new `task_type` field. Planners can now specify which role type the tasks are for when creating a job order.

## Changes Made

### Frontend: CreateJobOrderModal.tsx

#### 1. Form State Update
Added `task_type` to formData state with default value `'technician'`:
```tsx
const [formData, setFormData] = useState({
  order_code: '',
  title: '',
  description: '',
  operation_name: '',
  task_type: 'technician',  // NEW
  due_date: '',
  standard_time_seconds: '',
  device_serials: '',
});
```

#### 2. Event Handler Update
Updated `handleChange` function to support select elements:
```tsx
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { id, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [id]: value
  }));
  setError(null);
};
```

#### 3. Form Reset
Updated form reset logic to include task_type:
```tsx
setFormData({
  order_code: '',
  title: '',
  description: '',
  operation_name: '',
  task_type: 'technician',  // NEW - reset to default
  due_date: '',
  standard_time_seconds: '',
  device_serials: '',
});
```

#### 4. API Request
Added `task_type` to the request payload:
```tsx
const requestData: any = {
  order_code: formData.order_code.trim(),
  title: formData.title.trim(),
  due_date: formData.due_date,
  standard_time_seconds: parseInt(formData.standard_time_seconds),
  device_serials: deviceSerials,
  task_type: formData.task_type,  // NEW
};
```

#### 5. Form UI
Added a new select dropdown field between "Operation Name" and "Standard Time":

```tsx
<div>
  <label className="block text-sm font-medium text-gray-700 mb-1">
    Task Type *
  </label>
  <select
    id="task_type"
    value={formData.task_type}
    onChange={handleChange}
    disabled={loading}
    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
  >
    <option value="technician">Technician Task</option>
    <option value="quality">Quality Inspection Task</option>
    <option value="tester">Tester Task</option>
  </select>
  <p className="text-xs text-gray-500 mt-1">
    Select the task type for all tasks in this job order
  </p>
</div>
```

## User Flow

### When Creating a Job Order:

1. **Planner opens** "Create New Job Order" modal
2. **Fills in fields:**
   - Job Order Code: e.g., `"JO-TESTER-001"`
   - Title: e.g., `"Final Testing Batch"`
   - Description (optional)
   - Operation Name (optional)
   - **Task Type** (NEW): Select from dropdown
     - `Technician Task` - Tasks for technicians
     - `Quality Inspection Task` - Tasks for quality inspectors
     - `Tester Task` - Tasks for testers
   - Due Date
   - Standard Time (seconds)
   - Device Serials
3. **Clicks "Create Job Order"**
4. **Backend creates:**
   - Job Order
   - Devices
   - Tasks with specified `task_type`
5. **Users see filtered tasks:**
   - Technicians see only `'technician'` type tasks
   - Quality inspectors see only `'quality'` type tasks
   - Testers see only `'tester'` type tasks

## Example API Request

```json
POST /api/job-orders/
{
  "order_code": "JO-TESTER-001",
  "title": "Final Testing Batch",
  "description": "Final testing for prototypes",
  "due_date": "2025-12-31",
  "standard_time_seconds": 2400,
  "device_serials": ["TEST001", "TEST002"],
  "operation_name": "Complete System Testing",
  "task_type": "tester"
}
```

## Form Field Position

The form fields are now arranged as follows:
1. Job Order Code | Due Date
2. Title
3. Description
4. Operation Name
5. **Task Type** (NEW) ← Position
6. Standard Time per Task
7. Device Serials (textarea)

## Files Modified

✅ `/frontend/src/components/planner/CreateJobOrderModal.tsx`
- Added task_type to form state
- Updated handleChange to support select elements
- Added form field for task type selection
- Updated form reset logic
- Updated API request payload

## Testing

1. **Open Planner Dashboard**
   - Login as `pe_1` (password: `pass`)

2. **Click "New Job Order"**
   - Modal opens with all fields

3. **Test Task Type Dropdown**
   - Verify all three options appear:
     - Technician Task
     - Quality Inspection Task
     - Tester Task
   - Default value should be "Technician Task"

4. **Create a Tester Job Order**
   - Select "Tester Task" from dropdown
   - Fill other required fields
   - Submit form

5. **Verify in Backend**
   - Login as `tester_1`
   - Navigate to `/tester` dashboard
   - Should see only the tester-type tasks

## Benefits

✅ **Role-Based Task Assignment**: Planners can specify which role type the tasks are for
✅ **Better Organization**: Clear distinction between task types
✅ **Flexible Workflow**: Easy to create tasks for different roles
✅ **User Experience**: Simple dropdown selection with helper text

## Rollback Instructions

If needed to revert changes:
1. Remove task_type field from formData state
2. Remove task_type from handleChange check
3. Remove task_type from form reset
4. Remove task_type from API request
5. Remove the select dropdown UI
6. Update handleChange back to original signature

All changes are backward compatible with existing code.
