# Supervisor Review Status Display Fix

## Issue
In the Supervisor Dashboard's QA Review Queue, when a review was completed by the supervisor, the status column only showed "supervisor approved" regardless of whether it was actually approved or rejected.

## Root Cause
The `EnrichedInspection` interface and data enrichment logic were only tracking **if** a supervisor review existed (`supervisor_reviewed: boolean`), but not **what decision** was made.

The status display logic was:
```typescript
if (inspection.supervisor_reviewed) {
  return 'supervisor approved';  // ❌ Always shows "approved"
}
```

## Solution

### 1. Extended EnrichedInspection Interface
Added `supervisor_decision` field to track the actual decision:

```typescript
interface EnrichedInspection extends Inspection {
  // ... existing fields
  supervisor_reviewed?: boolean;
  supervisor_decision?: 'accepted' | 'rejected';  // ✅ NEW
}
```

### 2. Updated Data Enrichment Logic
Changed from using a Set to a Map to store supervisor reviews with their decisions:

**Before**:
```typescript
const reviewedInspectionIds = new Set(supervisorReviews.map(sr => sr.inspection));
// ...
supervisor_reviewed: reviewedInspectionIds.has(inspection.id),
```

**After**:
```typescript
const reviewMap = new Map(supervisorReviews.map(sr => [sr.inspection, sr]));
// ...
const supervisorReview = reviewMap.get(inspection.id);
// ...
supervisor_reviewed: !!supervisorReview,
supervisor_decision: supervisorReview?.decision,
```

### 3. Updated Status Badge Function
Now returns different colors based on the actual decision:

```typescript
const getStatusBadge = (inspection: EnrichedInspection) => {
  if (inspection.supervisor_reviewed && inspection.supervisor_decision) {
    return inspection.supervisor_decision === 'accepted'
      ? 'bg-green-100 text-green-800'   // ✅ Green for approved
      : 'bg-red-100 text-red-800';      // ✅ Red for rejected
  }
  if (inspection.decision === 'rejected') {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-orange-100 text-orange-800';  // Orange for pending
};
```

### 4. Updated Status Text Function
Now shows the correct text based on the decision:

```typescript
const getStatusText = (inspection: EnrichedInspection) => {
  if (inspection.supervisor_reviewed && inspection.supervisor_decision) {
    return inspection.supervisor_decision === 'accepted'
      ? 'supervisor approved'    // ✅ Shows when approved
      : 'supervisor rejected';   // ✅ Shows when rejected
  }
  if (inspection.decision === 'rejected') {
    return 'QA rejected';
  }
  return 'pending supervisor';
};
```

## Visual Changes

### Before Fix:
| Status Column | Badge Color | Issue |
|--------------|-------------|-------|
| supervisor approved | 🟢 Green | Always showed "approved" even for rejections |

### After Fix:
| Status Column | Badge Color | Correct |
|--------------|-------------|---------|
| supervisor approved | 🟢 Green | ✅ Only for accepted reviews |
| supervisor rejected | 🔴 Red | ✅ Shows for rejected reviews |
| pending supervisor | 🟠 Orange | ✅ Shows for pending reviews |
| QA rejected | 🔴 Red | ✅ Shows for QA rejections |

## Testing Checklist

- [ ] Navigate to Supervisor Dashboard
- [ ] Click on "QA Reviews" or similar tab to view QA Review Queue
- [ ] Look at the "Status" column in the table
- [ ] For reviews that were **approved** by supervisor: Should show "supervisor approved" with green badge
- [ ] For reviews that were **rejected** by supervisor: Should show "supervisor rejected" with red badge
- [ ] For reviews that are **pending**: Should show "pending supervisor" with orange badge
- [ ] For reviews that were **rejected by QA**: Should show "QA rejected" with red badge

## Files Modified

1. `/home/coderx64/hackathon/frontend/src/components/supervisor/QAReviewQueue.tsx`
   - Added `supervisor_decision` field to `EnrichedInspection` interface
   - Updated data enrichment to use Map instead of Set
   - Updated `getStatusBadge()` to return different colors based on decision
   - Updated `getStatusText()` to return different text based on decision

## Related Features

This fix ensures consistency with:
- QA Dashboard inspection statuses
- Technician task status displays
- Overall review workflow transparency

## Impact

**User Experience**: Supervisors can now clearly see at a glance which reviews were approved vs rejected, improving workflow transparency and decision tracking.

**Data Accuracy**: The display now accurately reflects the actual supervisor decision stored in the database.

**No Backend Changes Required**: This was purely a frontend display issue - the backend was already storing the correct decision data.
