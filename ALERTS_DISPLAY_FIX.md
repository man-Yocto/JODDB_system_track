# Fix for JobOrderDetails Alerts Display

## Problem
When viewing a job order in the Planner Dashboard, the Alerts tab showed mock/hardcoded messages with NaN and missing values:

```
❌ Progress Behind Schedule
Expected NaN% by now, currently at %

❌ High Rejection Rate
devices rejected, above threshold
```

## Root Cause
The alerts section was using hardcoded mock data from non-existent fields on the `job` object:
- `job.progressPercent` - doesn't exist
- `job.devicesRejected` - doesn't exist

The actual alert data was already being fetched from the backend API in the `progress` object but wasn't being used.

## Solution
Replaced the hardcoded mock alerts with real data from the API response:

### Before (❌ Wrong)
```tsx
{activeTab === 'alerts' && (
  <div className="space-y-3">
    <div className="p-4 border-l-4 border-yellow-500 bg-yellow-50 rounded">
      <h4 className="font-semibold text-yellow-800">Progress Behind Schedule</h4>
      <p className="text-sm text-yellow-700 mt-1">
        Expected {job.progressPercent + 15}% by now, 
        currently at {job.progressPercent}%
      </p>
    </div>
    <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
      <h4 className="font-semibold text-red-800">High Rejection Rate</h4>
      <p className="text-sm text-red-700 mt-1">
        {job.devicesRejected} devices rejected, above threshold
      </p>
    </div>
  </div>
)}
```

### After (✅ Correct)
```tsx
{activeTab === 'alerts' && (
  <div className="space-y-3">
    {progress?.alerts && progress.alerts.length > 0 ? (
      progress.alerts.map((alert: any, idx: number) => (
        <div
          key={idx}
          className={`p-4 border-l-4 rounded ${
            alert.type === 'due_date_risk'
              ? 'border-yellow-500 bg-yellow-50'
              : 'border-red-500 bg-red-50'
          }`}
        >
          <h4 className={`font-semibold ${
            alert.type === 'due_date_risk'
              ? 'text-yellow-800'
              : 'text-red-800'
          }`}>
            {alert.type === 'due_date_risk' ? 'Due Date Alert' : 'Efficiency Alert'}
          </h4>
          <p className={`text-sm mt-1 ${
            alert.type === 'due_date_risk'
              ? 'text-yellow-700'
              : 'text-red-700'
          }`}>
            {alert.message}
          </p>
        </div>
      ))
    ) : (
      <div className="p-4 bg-green-50 border border-green-200 rounded text-center">
        <p className="text-sm text-green-700">✓ No active alerts</p>
      </div>
    )}
  </div>
)}
```

## Changes Made

1. **Use Real Alert Data**: Changed from hardcoded mock alerts to `progress.alerts` from the API
2. **Dynamic Alert Rendering**: Loop through actual alerts returned by backend
3. **Dynamic Styling**: Color-code alerts based on type:
   - 🟡 Yellow for `due_date_risk` alerts (Schedule concerns)
   - 🔴 Red for `low_efficiency` alerts (Performance concerns)
4. **No Alerts State**: Display "✓ No active alerts" when there are no issues
5. **Proper Alert Titles**: Use alert type to display appropriate title

## Alert Types from Backend

The backend returns alerts with these types:

| Type | Meaning | Color | Message |
|------|---------|-------|---------|
| `due_date_risk` | Job Order is due soon but not on track | Yellow 🟡 | "Job Order X is due on DATE but is only Y% complete" |
| `low_efficiency` | A technician's completed task had low efficiency | Red 🔴 | "Task X (Technician: NAME) has low efficiency: Y%" |

## Data Flow

```
Backend API
    ↓
GET /api/v1/metrics/job-order/{id}/
    ↓
Response includes:
{
    "progress_percent": 0,
    "total_completed": 0,
    "total_rejected": 0,
    "total_devices": 3,
    "alerts": [
        {
            "type": "due_date_risk",
            "message": "Job Order 1 is due on 2025-11-30 but is only 0% complete",
            "job_order_id": 1,
            "due_date": "2025-11-30",
            "progress": 0
        }
    ]
}
    ↓
Frontend JobOrderDetails.tsx
    ↓
Renders real alerts from progress.alerts
```

## Files Modified
- ✅ `frontend/src/components/planner/JobOrderDetails.tsx`

## Result
✅ Alerts now display real, actionable data from the backend  
✅ No more NaN or missing values  
✅ Different alert types show with appropriate styling  
✅ "No active alerts" displays when the job order is on track

