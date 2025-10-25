# Features Overview

> **Auto-generated from:** `src/app/` and `src/components/`  
> **Last Updated:** 2025-10-24

This document provides a comprehensive overview of all implemented features organized by user persona.

---

## 🎓 Student Features

### Dashboard (`/student/dashboard`)
**Location:** `src/app/student/dashboard/`  
**Component:** `StudentDashboardPageClient.tsx`

**Features:**
- Welcome banner with student information
- Quick access to key features
- Overview of current schedule
- Notifications and announcements

**Related Components:**
- `WelcomeBanner` (`src/components/student/WelcomeBanner.tsx`)
- `ScheduleCard` (`src/components/shared/ScheduleCard.tsx`)

---

### Electives Management (`/student/electives`)
**Location:** `src/app/student/electives/`  
**Component Directory:** `src/components/student/electives/`

**Features:**
- Browse available elective courses
- Filter by level and department
- View course details (credits, prerequisites, description)
- Select and rank elective preferences (drag-and-drop ordering)
- Save preference rankings
- View confirmation of submitted preferences

**Key Components:**
- Electives list view
- Preference selection interface
- Drag-and-drop ranking system
- Preference confirmation

**API Endpoints Used:**
- `GET /api/student/electives` - Fetch available electives
- `GET /api/student/preferences` - Fetch current preferences
- `POST /api/student/preferences` - Save/update preferences
- `DELETE /api/student/preferences` - Remove preference

**Database Tables:**
- `electives` (read)
- `student_electives` (CRUD)

**Related Documentation:**
- [UX Student Elective Flow](../system/legacy/UX-STUDENT-ELECTIVE-FLOW.md)

---

### Schedule View (`/student/schedule`)
**Location:** `src/app/student/schedule/`  
**Component Directory:** `src/components/student/schedule/`

**Features:**
- View current class schedule
- Weekly calendar view
- Exam schedule display
- Schedule details (room, instructor, time)
- Print/export functionality

**Key Components:**
- `ScheduleTable` (`src/components/student/ScheduleTable.tsx`)
- `ExamScheduleTable` (`src/components/student/ExamScheduleTable.tsx`)

**API Endpoints Used:**
- `GET /api/student/schedule` - Fetch student schedule

**Database Tables:**
- `schedules` (read)
- `sections` (read via schedule data)
- `section_time` (read via schedule data)
- `exam` (read for exam schedule)

---

### Feedback Submission (`/student/feedback`)
**Location:** `src/app/student/feedback/`  
**Component Directory:** `src/components/student/feedback/`

**Features:**
- Submit feedback about schedules
- Rate scheduling experience (1-5 stars)
- Write detailed feedback comments
- View previously submitted feedback
- Link feedback to specific schedules

**Key Components:**
- Feedback form
- Rating component
- Feedback history

**API Endpoints Used:**
- `GET /api/student/feedback` - Fetch feedback history
- `POST /api/student/feedback` - Submit new feedback

**Database Tables:**
- `feedback` (CRUD)
- `schedules` (reference)

---

### Profile Management (`/student/profile`)
**Location:** `src/app/student/profile/`

**Features:**
- View student information
- Student number
- Academic level
- Status
- Contact information

**API Endpoints Used:**
- `GET /api/student/profile?userId={id}` - Fetch profile

**Database Tables:**
- `users` (read)
- `students` (read)

---

### Initial Setup (`/student/setup`)
**Location:** `src/app/student/setup/`

**Features:**
- First-time student onboarding
- Profile completion
- Preference selection guidance

---

## 👨‍🏫 Faculty Features

### Dashboard (`/faculty/dashboard`)
**Location:** `src/app/faculty/dashboard/`  
**Component:** `FacultyDashboardClient.tsx`

**Features:**
- Welcome header with active term information
- Phase-aware status cards (Assigned Courses, Schedule Status, Feedback Access)
- My Courses summary with quick stats
- Teaching schedule preview
- Upcoming deadlines and faculty-relevant events
- Faculty profile overview
- Alert messages for schedule and feedback status

**Key Components:**
- `FacultyStatusCards` - Status overview cards
- `MyCoursesCard` - Course assignments summary
- `TeachingScheduleCard` - Weekly schedule preview
- `FacultyUpcomingEvents` - Relevant deadlines widget

**API Endpoints Used:**
- `GET /api/faculty/status` - Faculty status and term info

**Database Tables:**
- `faculty` (read)
- `section` (read - where instructor_id = user.id)
- `academic_term` (read)

**Documentation:** [Faculty Features Guide](../../src/docs/features/faculty-features.md)

---

### My Courses (`/faculty/courses`)
**Location:** `src/app/faculty/courses/`  
**Component:** `FacultyCoursesClient.tsx`

**Features:**
- Detailed view of all assigned courses and sections
- Course information (name, code, description, credits, type)
- Enrollment statistics with capacity percentages
- Section times and room assignments
- Department and level information
- Visual cards for each course

**API Endpoints Used:**
- `GET /api/faculty/courses` - Fetch assigned sections with details

**Database Tables:**
- `section` (read - where instructor_id = user.id)
- `section_time` (read)
- `course` (read)
- `enrollment` (count)

**Phase Control:**
- ✅ Available: After schedule publication
- ❌ Locked: During scheduling phase

---

### Teaching Schedule (`/faculty/schedule`)
**Location:** `src/app/faculty/schedule/`  
**Component:** `FacultyScheduleClient.tsx`

**Features:**
- Full weekly calendar view (Sunday-Thursday)
- Day-by-day schedule breakdown
- Course names, times, and room assignments
- Visual indicators for teaching days
- Empty day indicators

**API Endpoints Used:**
- `GET /api/faculty/schedule` - Generate weekly schedule

**Database Tables:**
- `section` (read - where instructor_id = user.id)
- `section_time` (read)
- `course` (read)

**Phase Control:**
- ✅ Available: After schedule publication
- ❌ Locked: During scheduling phase

---

### Course Feedback (`/faculty/feedback`)
**Location:** `src/app/faculty/feedback/`  
**Component:** `FacultyFeedbackClient.tsx`

**Features:**
- Aggregated, anonymized student feedback
- Overall statistics (average rating, response rate, total responses)
- Per-course detailed breakdown
- Rating distribution charts (1-5 stars)
- Anonymized student comments with ratings
- Response metrics and percentages
- Privacy-first design with phase protection

**API Endpoints Used:**
- `GET /api/faculty/feedback` - Fetch aggregated feedback

**Database Tables:**
- `feedback` (read - aggregated)
- `section` (read - where instructor_id = user.id)
- `enrollment` (count)
- `academic_term` (read - for phase control)

**Phase Control:**
- ✅ Available: ONLY after feedback period closes
- ❌ Locked: During active feedback collection (to ensure anonymity)

**Security:**
- Complete anonymization of student responses
- No student identifiers exposed
- Aggregate-only statistics

---

### Availability Management (`/faculty/setup`)
**Location:** `src/app/faculty/setup/`  
**Component Directory:** `src/components/faculty/availability/`

**Status:** 🚧 Coming Soon

**Planned Features:**
- Set weekly availability preferences
- Block specific time slots
- Set recurring availability patterns
- Mark preferred teaching times

**Key Components:**
- Availability grid interface
- Time slot selector

**Database Tables:**
- `faculty_availability` (planned - CRUD)

---

## 🏛️ Committee Features

### Scheduling Committee

#### Dashboard (`/committee/scheduler/dashboard`)
**Location:** `src/app/committee/scheduler/`  
**Component Directory:** `src/components/committee/scheduler/`

**Features:**
- Semester overview
- Schedule generation controls
- Conflict detection and resolution
- Student enrollment statistics
- Faculty assignment overview

**Key Components (17 files):**
- Schedule generator interface
- Conflict checker
- Statistics dashboard
- Course assignment tools
- Section management
- Time slot allocation
- Room assignment interface
- Faculty assignment interface
- Constraint configuration
- Generation progress tracker
- Conflict resolution tools
- Schedule preview
- Export functionality

**Core Logic:**
- `ScheduleGenerator.ts` (`src/lib/schedule/`)
- `ConflictChecker.ts` (`src/lib/schedule/`)
- `TimeSlotManager.ts` (`src/lib/schedule/`)
- `ScheduleDataCollector.ts` (`src/lib/schedule/`)

**Database Tables:**
- `course` (read/write)
- `section` (read/write)
- `section_time` (read/write)
- `room` (read)
- `users` (read - for faculty)
- `change_log` (write - audit trail)

---

### Teaching Load Committee

#### Dashboard (`/committee/teaching-load/dashboard`)
**Location:** `src/app/committee/teaching-load/`  
**Component Directory:** `src/components/committee/teaching-load/`

**Features:**
- Faculty workload overview
- Course-to-faculty assignment
- Load balancing visualization
- Faculty availability review
- Section capacity management

**Key Components:**
- Faculty workload dashboard
- Assignment interface
- Load balancing tools
- Availability viewer

**Database Tables:**
- `section` (write - assign instructor_id)
- `users` (read - faculty list)
- `course` (read)
- `faculty_availability` (read)
- `change_log` (write - audit trail)

---

### Registrar Committee

#### Dashboard (`/committee/registrar/dashboard`)
**Location:** `src/app/committee/registrar/`  
**Component Directory:** `src/components/committee/registrar/`

**Features:**
- Exam schedule management
- Exam conflict detection
- Room assignment for exams
- Student enrollment management
- Academic calendar management

**Key Components:**
- Exam scheduler
- Conflict detection
- Room assignment
- Calendar management

**Database Tables:**
- `exam` (CRUD)
- `course` (read)
- `room` (read)
- `change_log` (write - audit trail)

---

## 🔄 Shared Features

### Authentication
**Location:** `src/app/(auth)/`  
**Component Directory:** `src/components/auth/`

**Features:**
- Sign up with role selection
- Sign in
- Sign out
- Session management
- Role-based authentication
- Email verification

**Key Components:**
- `AuthProvider.tsx`
- `AuthDialog.tsx`
- `AuthButtons.tsx`
- `NavAuth.tsx`
- `use-auth.ts` (custom hook)

**Pages:**
- `/login` - Sign in page
- `/sign-up` - Registration page

**API Endpoints Used:**
- `POST /api/auth/sign-up`
- `POST /api/auth/sign-in`
- `POST /api/auth/sign-out`
- `POST /api/auth/bootstrap`

---

### Navigation
**Component Directory:** `src/components/shared/`

**Features:**
- Role-based navigation menu
- Persona switcher (for demo accounts)
- Theme switcher (light/dark mode)
- Notifications bell
- Responsive mobile menu

**Key Components:**
- `PersonaNavigation.tsx`
- `RoleSwitcher.tsx`
- `ThemeSwitcher.tsx`
- `NotificationsBell.tsx`
- `navigation-config.ts`

---

### Workflow Management
**Component:** `WorkflowDashboard.tsx` / `WorkflowSteps.tsx`

**Features:**
- Visual workflow progress tracking
- Step-by-step guidance
- Status indicators
- Completion tracking

---

### UI Components Library
**Location:** `src/components/ui/`

**Available Components (39 files):**
- Buttons, Cards, Dialogs
- Forms (Input, Select, Textarea, Checkbox, Radio)
- Navigation (Tabs, Breadcrumbs)
- Feedback (Alert, Toast, Progress)
- Overlays (Modal, Dropdown, Popover)
- Data Display (Table, Badge, Avatar)
- Layout (Container, Separator)
- And more...

**Based on:** shadcn/ui + Radix UI primitives

---

## 🎨 Design System

### Theme Support
- Light mode
- Dark mode
- System preference detection
- Persistent theme selection

### Color Palette
**Component:** `ColorPaletteShowcase.tsx`

Comprehensive design system with:
- Primary colors
- Secondary colors
- Accent colors
- Semantic colors (success, warning, error, info)
- Neutral grays

**Utility:** `src/lib/colors.ts`

---

## 🔧 Core Business Logic

### Schedule Generation
**Location:** `src/lib/schedule/`

**Modules:**
- `ScheduleGenerator.ts` - Main generation algorithm
- `ConflictChecker.ts` - Detects time/room conflicts
- `TimeSlotManager.ts` - Manages time slot allocation
- `ScheduleDataCollector.ts` - Collects data for generation
- `curriculum-source.ts` - Curriculum data source

**Test Data:**
- `test-phase1-data.ts` through `test-phase4-data.ts`

---

### Data Management
**Location:** `src/lib/`

**Modules:**
- `data-store.ts` - Local state management
- `local-state.ts` - Browser storage utilities
- `fetcher.ts` - API request wrapper
- `committee-data-helpers.ts` - Committee-specific data utilities
- `student-schedule-helpers.ts` - Student schedule utilities

---

### Validation
**Location:** `src/lib/validations/`

**Schemas:**
- `auth.schemas.ts` - Authentication validation
- `faculty.schemas.ts` - Faculty data validation
- `student.schemas.ts` - Student data validation

---

### Rules Engine
**Module:** `src/lib/rules-engine.ts`

**Purpose:**
- Business rules enforcement
- Constraint validation
- Policy implementation

---

## 📊 Feature Maturity Matrix

| Feature | Student | Faculty | Committee | Status |
|---------|---------|---------|-----------|--------|
| Authentication | ✅ | ✅ | ✅ | Complete |
| Dashboard | ✅ | ✅ | ✅ | Complete |
| Schedule View | ✅ | ✅ | ✅ | Complete |
| Elective Management | ✅ | - | ✅ | Complete |
| Feedback System | ✅ | ✅ | ✅ | Complete |
| Course Management | - | ✅ | ✅ | Complete |
| Phase-Based Permissions | ✅ | ✅ | - | Complete |
| Availability Setting | - | ⏳ | - | In Progress |
| Teaching Load Assignment | - | - | ✅ | Complete |
| Exam Scheduling | - | - | ✅ | Complete |
| Schedule Generation | - | - | ✅ | Complete |
| Profile Management | ✅ | ⏳ | ⏳ | In Progress |

**Legend:**
- ✅ Complete
- ⏳ In Progress
- - Not Applicable

---

## 🔒 Feature Access Control

### Student Role
- ✅ View own schedule
- ✅ Select elective preferences
- ✅ Submit feedback
- ✅ View own profile
- ❌ Cannot modify schedules
- ❌ Cannot view other students' data

### Faculty Role
- ✅ View own teaching schedule (after publication)
- ✅ View assigned courses and sections (after publication)
- ✅ Access aggregated student feedback (after feedback period closes)
- ✅ View academic deadlines and events
- ⏳ Set availability preferences (coming soon)
- ❌ Cannot modify schedules directly
- ❌ Cannot access individual student data
- ❌ Cannot view feedback during collection period

### Scheduling Committee Role
- ✅ Generate schedules
- ✅ Assign courses to sections
- ✅ Manage course catalog
- ✅ View all schedules
- ✅ Detect and resolve conflicts
- ✅ View student preferences

### Teaching Load Committee Role
- ✅ Assign faculty to sections
- ✅ View faculty workload
- ✅ Balance teaching loads
- ✅ View faculty availability
- ✅ Modify section assignments

### Registrar Role
- ✅ Schedule exams
- ✅ Assign exam rooms
- ✅ Manage academic calendar
- ✅ View all student data
- ✅ Generate reports

---

## 🚀 Future Features (Not Yet Implemented)

Based on the PRD and architecture documents:

1. **Real-time Notifications** - Push notifications for schedule changes
2. **Advanced Analytics** - Data visualization and reporting dashboards
3. **Mobile App** - Native mobile applications
4. **Export/Import** - Bulk data import/export functionality
5. **Automated Conflict Resolution** - AI-powered conflict resolution
6. **Student Enrollment** - Online course registration
7. **Grade Management** - Grade entry and reporting
8. **Attendance Tracking** - Class attendance monitoring

---

*This document is automatically synchronized with the application structure. Any manual edits will be overwritten on regeneration.*

