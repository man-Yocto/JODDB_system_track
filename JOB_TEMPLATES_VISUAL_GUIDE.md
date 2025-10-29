# Job Templates Page - Visual Guide 📸

## Navigation Flow

```
Login (Planning Engineer)
    ↓
Planner Dashboard
    ↓
Click "Jobs" Tab (with Package icon 📦)
    ↓
Job Templates Page
```

---

## Main Page View

```
┌─────────────────────────────────────────────────────────────────┐
│  aselsan Middle East                           [User Menu ▼]    │
│                                                                   │
│  Job Templates                                                    │
│  Manage job templates and their process workflows                │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  [← Back to Dashboard]               [➕ Add New Job]           │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  ▶ 📦 iPhone 15 Assembly                    [✏️ Edit] [🗑️ Delete]│
│     Complete iPhone assembly process                             │
│     5 processes                                                   │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│  ▼ 📦 A340 Aircraft Maintenance             [✏️ Edit] [🗑️ Delete]│
│     Full maintenance workflow for A340                           │
│     92 processes                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Process Workflow:                                         │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │  ① Remove Wing Panel                     ⏱️ 3600s   │ │  │
│  │  │     Type: Technician                                  │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │  ┌──────────────────────────────────────────────────────┐ │  │
│  │  │  ② Inspect Wing Structure               ⏱️ 1800s   │ │  │
│  │  │     Type: Quality Inspector                           │ │  │
│  │  └──────────────────────────────────────────────────────┘ │  │
│  │  ... (90 more processes)                                  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Create New Job Modal

```
┌───────────────────────────────────────────────────────────┐
│  Create New Job Template                            [✕]   │
│  Define the job's name, description, and processes        │
│────────────────────────────────────────────────────────────│
│                                                            │
│  Job Name *                                                │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ e.g., A380 Landing Gear Assembly                     │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Job Description                                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │ Describe the purpose and scope...                    │ │
│  │                                                       │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  Processes *                        [➕ Add Process]      │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Process #1                                  [🗑️]    │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │ Operation Name *                               │  │ │
│  │  │ e.g., Install hydraulic cylinder               │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────┐  ┌──────────────────────────────┐  │ │
│  │  │ Std Time (s) │  │ Task Type                    │  │ │
│  │  │ 60          │  │ Technician ▼                 │  │ │
│  │  └──────────────┘  └──────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  Process #2                                  [🗑️]    │ │
│  │  ┌────────────────────────────────────────────────┐  │ │
│  │  │ Operation Name *                               │  │ │
│  │  │ Quality inspection                             │  │ │
│  │  └────────────────────────────────────────────────┘  │ │
│  │  ┌──────────────┐  ┌──────────────────────────────┐  │ │
│  │  │ Std Time (s) │  │ Task Type                    │  │ │
│  │  │ 120         │  │ Quality Inspector ▼          │  │ │
│  │  └──────────────┘  └──────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│────────────────────────────────────────────────────────────│
│                              [Cancel]  [💾 Create Job]    │
└───────────────────────────────────────────────────────────┘
```

---

## Key UI Elements

### Job Card (Collapsed)
```
▶ 📦 Job Name                           [✏️] [🗑️]
   Job description
   X processes
```

### Job Card (Expanded)
```
▼ 📦 Job Name                           [✏️] [🗑️]
   Job description
   X processes
   ┌─────────────────────────────────────┐
   │  Process Workflow:                   │
   │  ① Process Name         ⏱️ XXXs     │
   │     Type: Task Type                  │
   │  ② Process Name         ⏱️ XXXs     │
   │     Type: Task Type                  │
   └─────────────────────────────────────┘
```

### Process Form Fields
```
Process #N                               [🗑️]
┌─────────────────────────────────────────┐
│ Operation Name *                        │
│ (text input)                            │
└─────────────────────────────────────────┘
┌─────────────┐  ┌──────────────────────┐
│ Time (sec)  │  │ Task Type            │
│ (number)    │  │ (dropdown)           │
└─────────────┘  └──────────────────────┘

Dropdown options:
- Technician
- Quality Inspector
- Tester
```

---

## User Actions

### ✅ Viewing Jobs
1. All jobs displayed as cards
2. Click anywhere on card to expand/collapse
3. Expanded view shows all processes in order

### ✅ Creating a Job
1. Click "Add New Job" button
2. Fill in job name (required)
3. Add job description (optional)
4. Define at least one process:
   - Operation name (required)
   - Standard time in seconds (required)
   - Task type selection (required)
5. Click "Add Process" for more steps
6. Click "Create Job" to save

### ✅ Editing a Job
1. Click Edit (pencil) icon
2. Modify job details
3. Add/remove/edit processes
4. Click "Update Job" to save

### ✅ Deleting a Job
1. Click Delete (trash) icon
2. Confirm in popup dialog
3. Job and all processes removed

---

## Validation Rules

### Job Level
- ✅ Name is required
- ✅ At least one process required

### Process Level
- ✅ Operation name is required
- ✅ Standard time must be > 0
- ✅ Task type must be selected
- ✅ Processes automatically numbered

---

## Empty State
When no jobs exist:
```
┌─────────────────────────────────────────┐
│                                          │
│          📦 (large icon)                 │
│                                          │
│     No Job Templates                     │
│                                          │
│  Get started by creating your first     │
│        job template.                     │
│                                          │
│      [Create Job Template]               │
│                                          │
└─────────────────────────────────────────┘
```

---

## Loading State
While fetching data:
```
┌─────────────────────────────────────────┐
│                                          │
│          ⟳ (spinning icon)               │
│                                          │
└─────────────────────────────────────────┘
```

---

## Error State
If fetch fails:
```
┌─────────────────────────────────────────┐
│  ⚠️ Failed to fetch job templates.      │
└─────────────────────────────────────────┘
```

---

## Color Scheme

- **Primary Actions**: Blue (#3B82F6)
- **Secondary Actions**: Gray
- **Delete Actions**: Red (#EF4444)
- **Background**: Gray-50 (#F9FAFB)
- **Cards**: White with shadow
- **Borders**: Gray-200
- **Text**: 
  - Primary: Gray-900
  - Secondary: Gray-600
  - Muted: Gray-500

---

## Icons Used

- 📦 Package - Job templates
- ➕ Plus - Add new
- ✏️ Edit - Edit button
- 🗑️ Trash - Delete button
- ← ArrowLeft - Back navigation
- 💾 Save - Save button
- ✕ X - Close modal
- ▶ ChevronRight - Collapsed
- ▼ ChevronDown - Expanded
- ⏱️ Clock - Standard time
- ⟳ Loader - Loading spinner

---

## Responsive Design

### Desktop (> 1024px)
- Modal: max-width 900px
- Process fields: 2 columns grid
- Full navigation visible

### Tablet (768px - 1024px)
- Modal: max-width 700px
- Process fields: 2 columns
- Condensed navigation

### Mobile (< 768px)
- Modal: full width with padding
- Process fields: 1 column stack
- Hamburger menu (if implemented)
