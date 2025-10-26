# 🗺️ Scheduler Navigation Flow

## Complete Navigation Structure

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│           SCHEDULER COMMITTEE DASHBOARD                 │
│         /committee/scheduler/dashboard                  │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Quick Stats (4 cards)                          │   │
│  │  • Total Courses  • Total Students              │   │
│  │  • Sections       • Conflicts                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────────┬──────────────────────────┐   │
│  │ Upcoming Events      │ System Overview          │   │
│  └──────────────────────┴──────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │          SCHEDULER TOOLS                        │   │
│  │  Core scheduling committee features             │   │
│  │                                                 │   │
│  │  ┌──────────────────┬─────────────────────┐    │   │
│  │  │ 👥 Student Mgmt  │ 📅 Timeline         │    │   │
│  │  │                  │                     │    │   │
│  │  │ • View stats     │ • Monitor phases    │    │   │
│  │  │ • Search list    │ • Track deadlines   │    │   │
│  │  │ • Track irregular│ • Workflow progress │    │   │
│  │  │ • Coord Registrar│ • Academic calendar │    │   │
│  │  │                  │                     │    │   │
│  │  │ [Manage] ──────► │ [View Timeline] ─► │    │   │
│  │  └──────────────────┴─────────────────────┘    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Feedback Controls                              │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
           │                              │
           │                              │
           ▼                              ▼
┌──────────────────────┐    ┌──────────────────────────┐
│                      │    │                          │
│  STUDENT MANAGEMENT  │    │   ACADEMIC TIMELINE      │
│  /scheduler/students │    │   /scheduler/timeline    │
│                      │    │                          │
│  [◄ Back to Dash]   │    │  [◄ Back to Dash]       │
│                      │    │                          │
│  ┌─ TABS ─────────┐ │    │  ┌──────────────────┐   │
│  │ • Overview     │ │    │  │ Phase Progress   │   │
│  │ • Student List │ │    │  │  [Active Phase]  │   │
│  │ • Irregular    │ │    │  ├──────────────────┤   │
│  └────────────────┘ │    │  │ Upcoming Events  │   │
│                      │    │  │  [Event Cards]   │   │
│  ┌──OVERVIEW───────┐│    │  ├──────────────────┤   │
│  │ 📊 6 Stat Cards ││    │  │ Task Timeline    │   │
│  │ • Total Students││    │  │  [Tasks List]    │   │
│  │ • Reg/Irregular ││    │  └──────────────────┘   │
│  │ • Enrollment    ││    │                          │
│  └─────────────────┘│    └──────────────────────────┘
│                      │
│  ┌─STUDENT LIST────┐│
│  │ 🔍 Search       ││
│  │ 🎚️  Filters     ││
│  │                 ││
│  │ [Table]         ││
│  │  👁️  View       ││─────┐
│  │  ✉️  Notify     ││     │
│  └─────────────────┘│     │
│                      │     │
│  ┌─IRREGULAR───────┐│     │
│  │ 📢 Registrar    ││     │
│  │    Notice       ││     │
│  │ [Contact] ─────►││───┐ │
│  │                 ││   │ │
│  │ [Table]         ││   │ │
│  │  ✏️  Edit Courses│├─┐ │ │
│  │  ✉️  Notify     ││ │ │ │
│  │  ✓  Resolve     ││ │ │ │
│  └─────────────────┘│ │ │ │
│                      │ │ │ │
└──────────────────────┘ │ │ │
                         │ │ │
        ┌────────────────┘ │ │
        │                  │ │
        ▼                  │ │
┌──────────────────────┐   │ │
│ REGISTRAR DIALOG     │   │ │
│                      │   │ │
│ Choose action:       │   │ │
│                      │   │ │
│ ┌─ Option 1 ──────┐ │   │ │
│ │ 📤 Request List │ │   │ │
│ │ [Textarea]      │ │   │ │
│ │ [Send Request]  │ │   │ │
│ └─────────────────┘ │   │ │
│                      │   │ │
│ ┌─ Option 2 ──────┐ │   │ │
│ │ ✓ Confirm None  │ │   │ │
│ │ [Confirm]       │ │   │ │
│ └─────────────────┘ │   │ │
│                      │   │ │
└──────────────────────┘   │ │
                           │ │
       ┌───────────────────┘ │
       │                     │
       ▼                     ▼
┌──────────────────────┐  ┌──────────────────────┐
│ COURSE SELECTION     │  │ STUDENT DETAILS      │
│ DIALOG               │  │ DIALOG               │
│                      │  │                      │
│ Student: [Name]      │  │ [Student Info]       │
│ Number: [Number]     │  │                      │
│                      │  │ ┌─ Basic Info ─────┐ │
│ ⚠️  Conflict Alert   │  │ │ • Student #      │ │
│                      │  │ │ • Level          │ │
│ ┌─ TABS ───────────┐ │  │ │ • Enrolled       │ │
│ │ • SWE Courses   │ │  │ │ • Credits        │ │
│ │ • External      │ │  │ │ • GPA            │ │
│ └─────────────────┘ │  │ └──────────────────┘ │
│                      │  │                      │
│ ┌─ SWE TAB ───────┐ │  │ ┌─ Enrollments ────┐ │
│ │ 🔍 Search       │ │  │ │ [Course Cards]   │ │
│ │                 │ │  │ │ • Code           │ │
│ │ [Scrollable]    │ │  │ │ • Section        │ │
│ │  ☑️  SWE201     │ │  │ │ • Status         │ │
│ │  ☐  SWE202     │ │  │ └──────────────────┘ │
│ │  ☑️  SWE301     │ │  │                      │
│ └─────────────────┘ │  │ ⚠️  Irregular Alert  │
│                      │  │                      │
│ ┌─ EXTERNAL TAB ──┐ │  │ Actions:             │
│ │ [Input] + [Add] │ │  │ [✉️  Notify]        │
│ │                 │ │  │ [⚠️  Mark Irregular] │
│ │ [Added Courses] │ │  │                      │
│ │ • MATH201  [X]  │ │  └──────────────────────┘
│ │ • PHYS101  [X]  │ │
│ └─────────────────┘ │
│                      │
│ [Cancel] [Save (N)]  │
│                      │
└──────────────────────┘
```

---

## 🎯 User Flows

### **Flow 1: View Student Details**
```
Dashboard
  → Click "Manage Students"
    → Student List Tab
      → Click 👁️ "View Details"
        → Student Details Dialog opens
          → See GPA, enrollments, status
          → [✉️ Send Notification]
          → [⚠️ Mark as Irregular]
```

### **Flow 2: Manage Irregular Student**
```
Dashboard
  → Click "Manage Students"
    → Irregular Students Tab
      → See Registrar Notice
      → Click ✏️ "Edit Courses" on student
        → Course Selection Dialog opens
          → SWE Courses Tab:
            → Search courses
            → Check required courses
          → External Courses Tab:
            → Enter course code (e.g., MATH201)
            → Click "Add"
          → Click "Save (N courses)"
        → Courses saved
      → Click "Notify" → Email sent
      → Click "Resolve" → Case resolved
```

### **Flow 3: Contact Registrar**
```
Dashboard
  → Click "Manage Students"
    → Irregular Students Tab
      → Click "Contact Registrar"
        → Registrar Dialog opens
          → Option 1: Request List
            → Type message
            → Click "Send Request"
          → Option 2: Confirm None
            → Click "Confirm"
```

### **Flow 4: View Timeline**
```
Dashboard
  → Click "View Timeline"
    → Timeline Page
      → See Phase Progress
      → View Upcoming Events with countdowns
      → Check Task Completion
      → Click "Back to Dashboard"
```

---

## 🔑 Key Interactions

### **Dashboard → Student Management**
- **Action:** Click "Manage Students" button
- **Result:** Navigate to `/committee/scheduler/students`
- **Features Available:**
  - Overview statistics
  - Student search and filtering
  - Irregular student management
  - Registrar communication

### **Dashboard → Timeline**
- **Action:** Click "View Timeline" button
- **Result:** Navigate to `/committee/scheduler/timeline`
- **Features Available:**
  - Phase progression tracking
  - Upcoming events with countdown
  - Task completion checklist
  - Academic calendar overview

### **Student Management → Back**
- **Action:** Click "◄ Back to Dashboard"
- **Result:** Return to dashboard
- **Location:** Top-left of Student Management page

### **Timeline → Back**
- **Action:** Click "◄ Back to Dashboard"
- **Result:** Return to dashboard
- **Location:** Top-left of Timeline page

---

## 🎨 Visual Indicators

### **Status Colors**
- **Blue** - Student Management (Regular status)
- **Purple** - Timeline/Academic
- **Orange** - Irregular/Warning
- **Green** - Success/Completed
- **Red** - High priority/Urgent

### **Icons**
- **👥 Users** - Student Management
- **📅 Calendar** - Timeline/Events
- **🕒 Clock** - Time-related
- **✉️ Mail** - Notifications
- **⚠️ Alert** - Warnings/Irregular
- **✏️ Edit** - Edit actions
- **👁️ Eye** - View details
- **✓ Check** - Complete/Resolve
- **🔍 Search** - Search functionality
- **◄ Arrow Left** - Back navigation

### **Hover Effects**
- **Student Management Card** - Blue border on hover
- **Timeline Card** - Purple border on hover
- **Table rows** - Gray background on hover
- **Buttons** - Slight scale increase

---

## 📱 Responsive Behavior

### **Desktop (≥768px)**
- 2-column grid for dashboard cards
- Full-width tables
- Side-by-side layouts

### **Mobile (<768px)**
- Single column layout
- Stacked cards
- Scrollable tables
- Simplified dialogs

---

## ⚡ Quick Actions

### **From Dashboard:**
1. **View Student Details:**
   - Manage Students → Student List → 👁️ View
   
2. **Handle Irregular Student:**
   - Manage Students → Irregular → ✏️ Edit → Select Courses

3. **Contact Registrar:**
   - Manage Students → Irregular → Contact Registrar

4. **Check Timeline:**
   - View Timeline → See all phases and events

---

## 🔐 Permission Notes

All features are restricted to:
- **Role:** `scheduling_committee`
- **Authentication:** Required
- **Middleware:** Protected routes

---

**Navigation is intuitive, clean, and focused on core scheduler tasks!**

---

**Created:** January 2025  
**Status:** ✅ Complete

