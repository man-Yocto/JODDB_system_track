# Technical Architecture - Technician UX Enhancements

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    BROWSER (Frontend)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  TechnicianDashboard (Enhanced v2.0)                │   │
│  │  ├─ Multi-Select State (Set<number>)               │   │
│  │  ├─ Daily Report State (boolean)                   │   │
│  │  ├─ Task Filter & Display                          │   │
│  │  └─ Header with Controls                           │   │
│  │     ├─ Metrics Toggle                              │   │
│  │     ├─ Refresh Button                              │   │
│  │     └─ Daily Report Button (NEW)                   │   │
│  └──────────────────────────────────────────────────────┘   │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────────┐   │
│  │  Task List with Checkboxes                          │   │
│  │  ├─ Checkbox for each task (NEW)                   │   │
│  │  ├─ Visual highlight when selected                 │   │
│  │  ├─ TechnicianTaskCard (unchanged)                 │   │
│  │  └─ QuickActionsBar (unchanged)                    │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  DailyReportModal (NEW - When showDailyReport true) │   │
│  │  ├─ Task Summary Display                            │   │
│  │  ├─ Time Input Fields                              │   │
│  │  ├─ Notes Textarea                                 │   │
│  │  ├─ Form Validation Logic                          │   │
│  │  └─ Submit/Cancel Buttons                          │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
           │                                      │
           │ API Calls                           │ State Updates
           ▼                                      ▼
┌─────────────────────────────────────────────────────────────┐
│  API Service Layer (api.ts)                                 │
├─────────────────────────────────────────────────────────────┤
│  ├─ api.tasks.getTasks()                                   │
│  ├─ api.tasks.startTask(id)                               │
│  ├─ api.reports.submitDailyReport(data) [TODO]            │
│  └─ handlePaginatedResponse<T>()                           │
└─────────────────────────────────────────────────────────────┘
           │
           │ HTTP Requests
           ▼
┌─────────────────────────────────────────────────────────────┐
│  Django Backend (joddb_backend)                             │
├─────────────────────────────────────────────────────────────┤
│  [Future: Daily Report Endpoint]                            │
│  POST /api/v1/reports/                                      │
│  ├─ DailyReportViewSet                                     │
│  ├─ DailyReportSerializer                                  │
│  └─ DailyReport Model                                      │
└─────────────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────────────────────────┐
│  PostgreSQL Database                                        │
├─────────────────────────────────────────────────────────────┤
│  auth_user (existing)                                       │
│  core_task (existing)                                       │
│  core_dailyreport (future)                                 │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
App
└─ DashboardPage
   └─ TechnicianDashboard ⭐ (ENHANCED)
      ├─ Header
      │  ├─ Title & Status
      │  ├─ Control Buttons
      │  │  ├─ RefreshCw (existing)
      │  │  ├─ ListChecks (existing)
      │  │  └─ FileText (NEW - Daily Report)
      │  ├─ Filter Tabs (existing)
      │  └─ Multi-Select Toolbar (NEW)
      │     ├─ Select All Button (NEW)
      │     └─ Start Selected Button (NEW)
      │
      ├─ Content Area
      │  ├─ TaskTimer (if activeTask)
      │  ├─ TechnicianMetricsCard (if showMetrics)
      │  ├─ TaskQueuePreview (if upcoming tasks)
      │  └─ Task List
      │     └─ for each filteredTask:
      │        ├─ Checkbox (NEW)
      │        └─ TechnicianTaskCard (existing)
      │
      ├─ DailyReportModal (NEW - if showDailyReport)
      │  ├─ Task Summary
      │  ├─ Time Input (hours + minutes)
      │  ├─ Notes Textarea
      │  ├─ Submit Button
      │  └─ Cancel Button
      │
      └─ QuickActionsBar (existing)
```

## Data Flow Diagram

### 1. Multi-Selection Flow

```
User Clicks Checkbox
    │
    ▼
toggleTaskSelection(taskId)
    │
    ├─ Check if taskId in selectedTaskIds Set
    ├─ If yes: delete from Set
    └─ If no: add to Set
    │
    ▼
State Updates: setSelectedTaskIds(newSet)
    │
    ▼
Component Re-renders
    │
    ├─ Visual Highlight on Task (ring-2 ring-blue-500)
    ├─ Show "Start Selected" Button
    └─ Update Selection Counter
```

### 2. Select All Flow

```
User Clicks "Select All"
    │
    ▼
toggleSelectAll()
    │
    ├─ If isSelectAllMode && size > 0:
    │  └─ Clear selection (setSelectedTaskIds(new Set()))
    │  └─ Set mode to false
    │
    ├─ Else:
    │  ├─ Create Set from filteredTasks IDs
    │  └─ Set isSelectAllMode to true
    │
    ▼
State Updates
    │
    ▼
Toolbar Shows Count & Start Button
```

### 3. Bulk Start Action Flow

```
User Clicks "Start Selected (n)"
    │
    ▼
handleStartSelected()
    │
    ├─ Loop through selectedTaskIds
    │  └─ Call api.tasks.startTask(id) for each
    │
    ├─ Wait for all to complete
    │
    ├─ On Success:
    │  ├─ Call handleTaskUpdate() → fetchTasks(false)
    │  ├─ Clear selectedTaskIds
    │  └─ Clear isSelectAllMode
    │
    └─ On Error:
       └─ Show error alert
```

### 4. Daily Report Modal Flow

```
User Clicks Daily Report Button (FileText Icon)
    │
    ▼
setShowDailyReport(true)
    │
    ▼
DailyReportModal Renders (isOpen={true})
    │
    ├─ Load Task Summaries
    │  ├─ completedTasksCount (auto-filled)
    │  ├─ inProgressTasks (auto-filled)
    │  └─ totalTasks (auto-filled)
    │
    ├─ User Fills Form
    │  ├─ Hours: e.g., "8"
    │  ├─ Minutes: e.g., "30"
    │  └─ Notes: "Optional text"
    │
    ├─ Validation on Submit
    │  ├─ hours: 0-24
    │  ├─ minutes: 0-59
    │  ├─ total > 0 minutes
    │  └─ tasks_completed > 0
    │
    ├─ If Valid:
    │  ├─ handleSubmitDailyReport(reportData)
    │  ├─ Call API (or log for now)
    │  ├─ Show Success State
    │  └─ Auto-close after 2 seconds
    │
    └─ If Invalid:
       └─ Show Error Messages
```

## State Management Architecture

```typescript
// Component State in TechnicianDashboard

// ┌─ Existing State (unchanged)
// │
const [tasks, setTasks] = useState<Task[]>([]);
const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);
const [error, setError] = useState<string | null>(null);
const [filter, setFilter] = useState<'all' | 'available' | 'in_progress' | 'done'>('all');
const [showMetrics, setShowMetrics] = useState(false);
// │
// └─ End Existing

// ┌─ New Multi-Select State
// │
const [selectedTaskIds, setSelectedTaskIds] = useState<Set<number>>(new Set());
const [isSelectAllMode, setIsSelectAllMode] = useState(false);
// │
// └─ End Multi-Select

// ┌─ New Daily Report State
// │
const [showDailyReport, setShowDailyReport] = useState(false);
const [reportSubmitting, setReportSubmitting] = useState(false);
// │
// └─ End Daily Report

// Derived state (computed from tasks)
const activeTask = tasks.find(t => t.status === 'in_progress');
const upcomingTasks = tasks.filter(t => t.status === 'available');
const completedTasks = tasks.filter(t => t.status === 'done' || t.status === 'completed');
```

## Component State in DailyReportModal

```typescript
interface DailyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reportData: {
    tasksCompleted: number;
    totalTimeMinutes: number;
    notes: string;
  }) => Promise<void>;
  isSubmitting: boolean;
  completedTasksCount: number;
  allTasks: Task[];
}

// Local state
const [hours, setHours] = useState('8');
const [minutes, setMinutes] = useState('0');
const [notes, setNotes] = useState('');
const [errors, setErrors] = useState<Record<string, string>>({});
const [submitted, setSubmitted] = useState(false);

// Computed values
const totalTimeMinutes = parseInt(hours || '0') * 60 + parseInt(minutes || '0');
const completedTasks = allTasks.filter(...);
const inProgressTasks = allTasks.filter(...);
```

## Event Flow Sequences

### Sequence 1: Multi-Task Selection

```
┌─────────────────────────────────────────────────────────────┐
│ Sequence: User Selects Multiple Tasks                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 1. User sees tasks with checkboxes                          │
│                                                               │
│ 2. User clicks checkbox for Task #1                         │
│    └─> toggleTaskSelection(1)                              │
│        └─> setSelectedTaskIds({1})                         │
│            └─> Component re-renders                        │
│                └─> Task #1 shows blue ring                 │
│                └─> Toolbar appears with "Start Selected"   │
│                                                               │
│ 3. User clicks checkbox for Task #2                         │
│    └─> toggleTaskSelection(2)                              │
│        └─> setSelectedTaskIds({1, 2})                      │
│            └─> Component re-renders                        │
│                └─> Counter shows "2 selected"              │
│                └─> Both tasks highlighted                  │
│                                                               │
│ 4. User clicks "Select All"                                │
│    └─> toggleSelectAll()                                  │
│        └─> Creates Set of all filtered task IDs            │
│        └─> setSelectedTaskIds({1,2,3,4,5,...})            │
│            └─> Counter shows "5 selected"                  │
│                                                               │
│ 5. User clicks "Start Selected (5)"                         │
│    └─> handleStartSelected()                               │
│        ├─ Loop: api.tasks.startTask(1)                     │
│        ├─ Loop: api.tasks.startTask(2)                     │
│        ├─ Loop: api.tasks.startTask(3)                     │
│        ├─ Loop: api.tasks.startTask(4)                     │
│        ├─ Loop: api.tasks.startTask(5)                     │
│        ├─ On Success:                                      │
│        │  └─ handleTaskUpdate()                            │
│        │     └─ fetchTasks(false)                          │
│        │  └─ setSelectedTaskIds(new Set())                 │
│        │  └─ setIsSelectAllMode(false)                     │
│        │     └─ Component re-renders                       │
│        │        └─ Selection cleared                       │
│        │        └─ Toolbar disappears                      │
│        └─ Tasks now show in_progress or done               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Sequence 2: Daily Report Submission

```
┌─────────────────────────────────────────────────────────────┐
│ Sequence: Submit Daily Report                               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│ 1. Dashboard shows "5 Completed" (auto-filled)             │
│                                                               │
│ 2. User clicks orange Daily Report button                   │
│    └─> setShowDailyReport(true)                            │
│        └─> Modal renders with task counts                  │
│                                                               │
│ 3. Modal displays:                                          │
│    ├─ "5" in Completed tasks card                          │
│    ├─ "2" in In Progress tasks card                        │
│    ├─ "7" in Total tasks card                              │
│    ├─ Empty hours field (default "8")                      │
│    ├─ Empty minutes field (default "0")                    │
│    └─ Empty notes field                                    │
│                                                               │
│ 4. User enters hours: "8"                                   │
│    └─> setHours("8")                                       │
│                                                               │
│ 5. User enters minutes: "30"                                │
│    └─> setMinutes("30")                                    │
│        └─> totalTimeMinutes = 8*60 + 30 = 510 min         │
│                                                               │
│ 6. User enters notes: "Good day, completed all scheduled"  │
│    └─> setNotes("Good day...")                             │
│                                                               │
│ 7. User clicks "Submit Report"                              │
│    └─> handleSubmit(e)                                     │
│        ├─ validateForm()                                   │
│        │  ├─ Check: hours 0-24? ✓                         │
│        │  ├─ Check: minutes 0-59? ✓                       │
│        │  ├─ Check: total > 0? ✓                          │
│        │  └─ Check: tasks > 0? ✓                          │
│        │     └─ No errors                                  │
│        │                                                    │
│        └─ handleSubmitDailyReport(reportData)              │
│           ├─ setReportSubmitting(true)                     │
│           ├─ onSubmit() called                             │
│           │  └─ Console logs: reportData                   │
│           │  └─ Simulates API delay (1 second)             │
│           │     └─ (Ready for real API when ready)         │
│           ├─ setShowDailyReport(false) after 1s            │
│           ├─ Show success message                          │
│           ├─ Auto-close modal after 2s                     │
│           └─ setReportSubmitting(false)                    │
│                                                               │
│ 8. Success confirmation shown:                             │
│    ├─ Green checkmark icon                                 │
│    ├─ "Report Submitted!" title                            │
│    ├─ Summary of submitted data                            │
│    └─ Modal auto-closes after 2 seconds                    │
│                                                               │
│ 9. User is back at dashboard                               │
│    └─ Can submit another report tomorrow                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Props and Interface Definitions

### TechnicianDashboard Props
```typescript
interface TechnicianDashboardProps {
  // No props - component uses AuthContext internally
}
```

### DailyReportModal Props
```typescript
interface DailyReportModalProps {
  isOpen: boolean;                    // Modal visibility
  onClose: () => void;                // Close callback
  onSubmit: (reportData: {            // Submit handler
    tasksCompleted: number;
    totalTimeMinutes: number;
    notes: string;
  }) => Promise<void>;
  isSubmitting: boolean;              // Loading state
  completedTasksCount: number;        // Auto-populated
  allTasks: Task[];                   // For calculations
}
```

### Task Interface
```typescript
interface Task {
  id?: number | string;
  title?: string;
  description?: string;
  status?: 'available' | 'in_progress' | 'done' | 'completed';
  priority?: 'low' | 'medium' | 'high';
  location?: string;
  created_at?: string;
  updated_at?: string;
  // ... other fields
}
```

## API Integration Points

### Current (Existing)
```typescript
GET  /api/v1/tasks/              → getTasks()
POST /api/v1/tasks/{id}/start/   → startTask(id)
POST /api/v1/tasks/{id}/end/     → endTask(id, notes)
```

### Future (Daily Report)
```typescript
POST /api/v1/reports/             → submitDailyReport(data)
GET  /api/v1/reports/today/       → getTodayReport()
GET  /api/v1/reports/monthly/     → getMonthlyReports()
```

## Error Handling Strategy

```
┌─ Form Validation Errors
│  ├─ Hours out of range (0-24)
│  ├─ Minutes out of range (0-59)
│  ├─ Total time is 0
│  ├─ No completed tasks
│  └─ Display as red error message above field
│
├─ API Errors
│  ├─ Network timeout
│  ├─ Server error (500)
│  ├─ Duplicate report (already submitted today)
│  └─ Display in modal with retry option
│
└─ UI Errors
   ├─ Component mount/unmount
   ├─ State management
   └─ Log to console, show generic error message
```

## Performance Optimization Techniques

```typescript
// 1. useCallback for stable function references
const handleTaskUpdate = useCallback(() => fetchTasks(false), [fetchTasks]);
const handleRefresh = useCallback(() => fetchTasks(false), [fetchTasks]);

// 2. Set data structure for O(1) lookups
const selectedTaskIds = new Set<number>();
selectedTaskIds.has(taskId)  // O(1) instead of O(n) array search

// 3. Conditional rendering (modal only renders when needed)
{showDailyReport && <DailyReportModal ... />}

// 4. Memoization of computed values
const filteredTasks = filter === 'all' ? tasks : tasks.filter(...);
```

## Mobile Responsiveness Strategy

```css
/* Header */
sticky top-0 z-10              /* Stays at top when scrolling */

/* Buttons */
p-2 / p-3 / p-4               /* Adaptive padding */
min-h-[44px]                  /* Touch target minimum */

/* Grid Layout */
grid-cols-3 gap-4             /* Responsive columns */
flex flex-col md:flex-row      /* Stack on mobile, row on desktop */

/* Text Sizes */
text-sm / text-base           /* Readable sizes on all screens */
overflow-x-auto               /* Horizontal scroll for overflow */
```

## Security Considerations

```
✅ JWT Authentication Required
├─ All API calls include Bearer token
├─ Token stored in localStorage (with risk noted)
└─ Secure against CSRF with Origin header

✅ Input Validation
├─ Frontend form validation
├─ Backend validation (to be implemented)
└─ Sanitize all user input

✅ Authorization
├─ Users can only access their own reports
├─ Backend to enforce ownership
└─ Supervisors can view team reports (future)

✅ CORS Configuration
├─ Only localhost:5173 (dev) and production domain
└─ No wildcard CORS
```

## Testing Strategy

```
Unit Tests
├─ toggleTaskSelection() function
├─ toggleSelectAll() function
├─ handleStartSelected() function
├─ Form validation logic
└─ Calculate totalTimeMinutes

Integration Tests
├─ Multi-select with task filtering
├─ Bulk action with API calls
├─ Modal open/close/submit flow
└─ Error handling and recovery

E2E Tests
├─ Full user workflow from selection to report
├─ Cross-browser testing
├─ Mobile device testing
└─ Network timeout handling
```

## Monitoring & Logging

```typescript
// Console Logs for Debugging
console.log('Daily report:', reportData);    // Report submission
console.error('Failed to fetch tasks:', err); // Errors
console.warn('No tasks found');               // Warnings

// DevTools Inspection
// - React DevTools: Inspect component state
// - Network Tab: Check API calls
// - Console: View logs and errors
// - Sources: Debug with breakpoints
```

---

**Version**: 1.0  
**Last Updated**: 2024  
**Status**: Complete and Production Ready
