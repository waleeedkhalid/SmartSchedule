# Faculty Features Documentation

## Overview

The faculty module provides comprehensive tools for faculty members to participate in the academic scheduling process, manage their teaching assignments, and access student feedback. All faculty actions are tightly integrated with the academic term system and are automatically controlled by term phases.

## Architecture

### Core Principles

1. **Phase-Based Access Control**: All faculty features respect the current academic term phase
2. **Academic Term Integration**: Faculty data is synchronized with `academic_term` and `term_events`
3. **Anonymized Feedback**: Student feedback is only accessible after the feedback period closes
4. **Real-time Updates**: Dashboard reflects current term status and upcoming deadlines

### Database Schema

Faculty data is stored in the following tables:

- `faculty`: Faculty profile information (id, faculty_number, title, status)
- `section`: Course sections with `instructor_id` linking to faculty
- `section_time`: Time slots for each section
- `term_events`: Academic calendar events (filtered by audience for faculty)
- `feedback`: Student feedback (accessed in aggregated, anonymized form)

## Features

### 1. Faculty Dashboard

**Route**: `/faculty/dashboard`

**Purpose**: Central hub for faculty to view their status, courses, schedule, and deadlines.

**Components**:
- Faculty status cards (assigned courses, schedule status, feedback access)
- My Courses summary
- Teaching schedule preview
- Upcoming deadlines and events
- Profile information

**API Endpoint**: `GET /api/faculty/status`

**Response**:
```typescript
{
  activeTerm: string | null;
  termName: string | null;
  assignedCoursesCount: number;
  schedulePublished: boolean;
  feedbackOpen: boolean;
  canViewFeedback: boolean;
  hasPendingSuggestions: boolean;
  facultyInfo: {
    facultyNumber: string;
    title: string;
    status: string;
  };
}
```

### 2. My Courses

**Route**: `/faculty/courses`

**Purpose**: Detailed view of all courses and sections assigned to the faculty member.

**API Endpoint**: `GET /api/faculty/courses`

**Features**:
- Course details (name, code, description, credits)
- Section information (ID, capacity, enrolled count)
- Schedule times for each section
- Department and level information
- Enrollment statistics

**Permissions**:
- ✅ Available: After schedule is published
- ❌ Locked: During scheduling phase (before publication)

### 3. Teaching Schedule

**Route**: `/faculty/schedule`

**Purpose**: Weekly calendar view of all teaching commitments.

**API Endpoint**: `GET /api/faculty/schedule`

**Features**:
- Day-by-day schedule breakdown
- Time slots with course information
- Room assignments
- Visual calendar layout

**Permissions**:
- ✅ Available: After schedule is published
- ❌ Locked: During scheduling phase

### 4. Course Feedback

**Route**: `/faculty/feedback`

**Purpose**: Aggregated, anonymized student feedback for courses taught.

**API Endpoint**: `GET /api/faculty/feedback`

**Features**:
- Overall statistics (average rating, response rate)
- Per-course feedback breakdown
- Rating distribution (1-5 stars)
- Anonymized text comments
- Response metrics

**Permissions**:
- ✅ Available: After feedback period closes
- ❌ Locked: During feedback collection (to ensure anonymity)

**Response**:
```typescript
{
  courseFeedback: [
    {
      courseCode: string;
      courseName: string;
      sectionId: string;
      enrolledCount: number;
      responseCount: number;
      responseRate: number;
      averageRating: number;
      ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      };
      textFeedback: [
        {
          text: string;
          rating: number;
          submittedAt: string;
        }
      ];
    }
  ];
  overallStats: {
    totalCourses: number;
    totalResponses: number;
    averageRating: number;
    responseRate: number;
  };
}
```

### 5. Academic Events

**API Endpoint**: `GET /api/faculty/events`

**Purpose**: Fetch academic events relevant to faculty (deadlines, milestones).

**Features**:
- Filters events by faculty audience
- Shows grade submission deadlines
- Displays schedule publication dates
- Highlights active and upcoming events

## Phase-Based Permissions

### Permission System

Faculty actions are controlled by the current academic term phase. The system uses helper functions in `src/lib/faculty-permissions.ts` to determine access.

### Academic Phases

#### 1. Scheduling Phase
**Status**: `schedule_published = false`

**Allowed Actions**:
- Submit schedule suggestions/preferences
- View profile information

**Restricted Actions**:
- ❌ View assigned courses
- ❌ View teaching schedule
- ❌ Access student feedback
- ❌ View student lists

#### 2. Registration Phase
**Status**: `schedule_published = true`, `registration_open = true`

**Allowed Actions**:
- ✅ View assigned courses
- ✅ View teaching schedule
- ✅ View student lists
- View profile information

**Restricted Actions**:
- ❌ Access student feedback (if feedback_open = true)

#### 3. Active Term Phase
**Status**: `schedule_published = true`, `registration_open = false`

**Allowed Actions**:
- ✅ View assigned courses
- ✅ View teaching schedule
- ✅ View student lists
- View profile information

**Restricted Actions**:
- ❌ Access student feedback (if feedback_open = true)

#### 4. Post-Feedback Phase
**Status**: `feedback_open = false`

**Allowed Actions**:
- ✅ View assigned courses
- ✅ View teaching schedule
- ✅ View student lists
- ✅ **Access aggregated feedback**
- View profile information

### Permission Helpers

```typescript
import {
  canFacultyPerformAction,
  getCurrentFacultyPhase,
  canAccessFeedback,
  canViewCourses,
} from "@/lib/faculty-permissions";

// Check specific action
const feedbackPermission = canAccessFeedback(term);
if (feedbackPermission.allowed) {
  // Allow access
} else {
  console.log(feedbackPermission.reason);
}

// Get current phase
const phaseInfo = getCurrentFacultyPhase(term);
console.log(phaseInfo.phase); // "scheduling" | "registration" | "active_term" | "feedback_collection"
console.log(phaseInfo.allowedActions); // ["view_courses", "view_schedule"]
```

## API Reference

### Faculty Status
```
GET /api/faculty/status
```
Returns current faculty member's status and term information.

### Faculty Courses
```
GET /api/faculty/courses
```
Returns all sections assigned to the faculty member with enrollment data.

### Faculty Schedule
```
GET /api/faculty/schedule
```
Returns weekly schedule with course times organized by day.

### Faculty Feedback
```
GET /api/faculty/feedback
```
Returns aggregated, anonymized feedback. Returns 403 if feedback period is still open.

### Faculty Events
```
GET /api/faculty/events
```
Returns academic events relevant to faculty (filtered by audience).

## Components

### Dashboard Components
- `FacultyStatusCards`: Display status of courses, schedule, and feedback
- `MyCoursesCard`: Summary of assigned courses
- `TeachingScheduleCard`: Weekly schedule preview
- `FacultyUpcomingEvents`: Relevant deadlines and milestones

### Page Components
- `FacultyDashboardClient`: Main dashboard page
- `FacultyCoursesClient`: Detailed courses page
- `FacultyScheduleClient`: Full schedule calendar
- `FacultyFeedbackClient`: Feedback aggregation display

## User Flow

### Typical Faculty Workflow

1. **Pre-Schedule (Scheduling Phase)**
   - Faculty logs in to see profile
   - Dashboard shows "Schedule in Progress" status
   - Can submit availability and course preferences (future feature)

2. **Schedule Published (Registration Phase)**
   - Dashboard updates to show assigned courses
   - Faculty can view their teaching schedule
   - Course details become accessible
   - Student enrollment numbers appear

3. **Active Term**
   - Faculty can access all course information
   - View enrolled student lists
   - Monitor enrollment numbers

4. **Feedback Period**
   - Students submit feedback
   - Faculty sees "Feedback in Progress" status
   - Feedback results locked to ensure anonymity

5. **Post-Feedback**
   - Feedback becomes accessible
   - Faculty can review aggregated ratings and comments
   - See distribution and response rates

## Integration with Academic Term

All faculty features are synchronized with the `academic_term` table:

```typescript
interface AcademicTerm {
  code: string;
  name: string;
  is_active: boolean;
  schedule_published: boolean;
  registration_open: boolean;
  feedback_open: boolean;
  electives_survey_open: boolean;
  start_date: string;
  end_date: string;
}
```

### Key Flags

- `schedule_published`: Controls access to courses and schedule
- `feedback_open`: Controls when feedback becomes accessible (must be false)
- `registration_open`: Indicates active registration period

## Security & Privacy

### Feedback Anonymization

Faculty feedback is strictly anonymized:
- No student identifiers are exposed
- Feedback only accessible after period closes
- Individual responses cannot be traced back to students
- Aggregate statistics provided

### Row Level Security

All faculty queries use Supabase RLS policies:
- Faculty can only view their own assigned courses
- Committee members can manage all sections
- Students can view course information but not instructor details

### 6. Teaching Availability Management

**Route**: `/faculty/availability`

**Purpose**: Faculty can submit their preferred teaching time slots to help the scheduling committee optimize course assignments.

**API Endpoints**: 
- `GET /api/faculty/availability` - Fetch saved availability
- `POST /api/faculty/availability` - Save/update availability

**Features**:
- Interactive weekly time grid (Sunday-Thursday, 8AM-8PM)
- Click to toggle individual time slots
- Bulk actions: Select All / Clear All
- Visual feedback (green = available, gray = unavailable)
- Persistent storage per term
- Phase-based access control
- Automatic save and load
- Real-time availability count

**Permissions**:
- ✅ Available: During scheduling phase (before schedule publication)
- ❌ Locked: After schedule is published

**Response**:
```typescript
{
  success: boolean;
  data: {
    availability_data: Record<string, boolean>; // e.g., {"Sunday-08:00": true}
    lastUpdated: string;
    termCode: string;
  } | null;
}
```

**Dashboard Integration**:
- Status card shows submission status
- Quick access button to availability page
- Badge indicators (Submitted/Pending)
- Last updated timestamp

## Future Enhancements

1. **Schedule Suggestions**
   - Allow faculty to propose time changes during scheduling phase
   - Committee review and approval workflow

2. **Student Lists**
   - View enrolled students per section
   - Export class rosters
   - Track attendance (optional)

4. **Course Materials**
   - Upload course syllabus
   - Share resources with students
   - Integration-ready placeholders

## Testing

To test faculty features:

1. Create a faculty account
2. Assign sections via `section` table with `instructor_id`
3. Toggle `schedule_published` flag in `academic_term`
4. Toggle `feedback_open` flag to test feedback access
5. Create sample feedback entries

## Related Documentation

- [Academic Term System](../system/academic-term.md)
- [Term Events](./term-events.md)
- [Student Features](./student-features.md)
- [Committee Workflows](../system/workflows.md)

