# Database Schema Overview

> **Auto-generated from:** `src/data/main.sql`  
> **Last Updated:** 2025-10-25

## 🎯 System Type: TIMETABLING/SCHEDULING SYSTEM

**Critical Understanding:** SmartSchedule is a **TIMETABLING SYSTEM**, not a traditional enrollment system.

### Pre-Semester Phase (System Active):
1. Students submit **elective preferences** (not enrollment)
2. Faculty submit **availability**
3. Teaching Load Committee assigns **faculty to sections**
4. Scheduling Committee runs **GENERATOR** to create timetables
5. Schedules are **PUBLISHED**
6. Registrar sets **exam schedules**

### Semester Phase (System Passive):
- Students **VIEW** their generated schedules (READ-ONLY)
- Faculty **VIEW** their teaching schedules (READ-ONLY)
- Students provide **feedback** for next cycle

**Key Point:** By the time semester starts, all scheduling is COMPLETE. The system shows what was generated, not what is being enrolled.

---

## Extensions

- **pgcrypto**: Cryptographic functions
- **uuid-ossp**: UUID generation utilities

---

## Enums

### `user_role`
Defines the role types available in the system:
- `student`
- `faculty`
- `scheduling_committee`
- `teaching_load_committee`
- `registrar`

### `event_type`
Defines types of academic timeline events:
- `registration` - Course registration period
- `add_drop` - Add/drop courses period
- `elective_survey` - Elective preference survey period
- `midterm_exam` - Midterm examination period
- `final_exam` - Final examination period
- `break` - Academic break period
- `grade_submission` - Grade submission deadline
- `feedback_period` - Student feedback collection period
- `schedule_publish` - Schedule publication date
- `academic_milestone` - Important academic dates
- `other` - Other events

### `event_category`
Categories for organizing events in UI:
- `academic` - Academic events and milestones
- `registration` - Registration-related events
- `exam` - Examination periods
- `administrative` - Administrative deadlines and dates

---

## Core Tables

### `users`
Central user management table for all personas.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique user identifier |
| `full_name` | TEXT | NOT NULL | User's full name |
| `email` | TEXT | UNIQUE, NOT NULL | User's email address |
| `role` | user_role | NOT NULL | User role (enum) |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Row Level Security:** Enabled
- Users can read their own profile
- Committee members can read all users

---

### `room`
Physical rooms available for scheduling.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | SERIAL | PRIMARY KEY | Auto-incrementing room ID |
| `number` | TEXT | UNIQUE, NOT NULL | Room number/identifier |

**Row Level Security:** Enabled (public read access)

---

### `course`
Course catalog containing all available courses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `code` | TEXT | PRIMARY KEY | Unique course code (e.g., SWE101) |
| `name` | TEXT | NOT NULL | Course name |
| `credits` | INT | NOT NULL, CHECK (credits > 0) | Credit hours |
| `department` | TEXT | NOT NULL | Department offering the course |
| `level` | INT | NOT NULL, CHECK (level BETWEEN 1 AND 8) | Academic level (1-8) |
| `type` | TEXT | NOT NULL, CHECK (type IN ('REQUIRED','ELECTIVE')) | Course type |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Row Level Security:** Enabled (public read access)

---

### `exam`
Examination schedule details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique exam ID |
| `course_code` | TEXT | NOT NULL, REFERENCES course(code) ON DELETE CASCADE | Associated course |
| `kind` | TEXT | NOT NULL, CHECK (kind IN ('MIDTERM','MIDTERM2','FINAL')) | Exam type |
| `exam_date` | DATE | NOT NULL | Date of examination |
| `exam_time` | TIME | NOT NULL | Start time |
| `duration` | INT | NOT NULL, CHECK (duration > 0) | Duration in minutes |

**Row Level Security:** Enabled (public read access)
**Managed by:** Registrar committee

---

### `section`
Course sections with instructor and room assignments.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | TEXT | PRIMARY KEY | Section identifier |
| `course_code` | TEXT | NOT NULL, REFERENCES course(code) ON DELETE CASCADE | Associated course |
| `instructor_id` | UUID | REFERENCES users(id) ON DELETE SET NULL | Assigned instructor |
| `room_id` | INT | REFERENCES room(id) | Assigned room |
| `capacity` | INT | DEFAULT 50 | Maximum student capacity |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT now() | Last update timestamp |

**Row Level Security:** Enabled (public read access)
**Managed by:** Teaching Load Committee

---

### `section_time`
Time slots for each section.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique time slot ID |
| `section_id` | TEXT | NOT NULL, REFERENCES section(id) ON DELETE CASCADE | Associated section |
| `day` | TEXT | NOT NULL, CHECK (day IN ('SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY')) | Day of week |
| `start_time` | TIME | NOT NULL | Start time |
| `end_time` | TIME | NOT NULL | End time |

**Row Level Security:** Enabled (public read access)

---

### `change_log`
Audit trail for all changes to critical entities.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique log entry ID |
| `entity` | TEXT | NOT NULL | Entity type that was changed |
| `entity_id` | TEXT | NOT NULL | ID of the changed entity |
| `action` | TEXT | NOT NULL, CHECK (action IN ('INSERT','UPDATE','DELETE')) | Type of action |
| `actor` | UUID | REFERENCES users(id) ON DELETE SET NULL | User who performed the action |
| `change_data` | JSONB | | JSON representation of the change |
| `created_at` | TIMESTAMPTZ | DEFAULT now() | Timestamp of change |

**Row Level Security:** Enabled

---

## Academic Timeline Module

### `academic_term`
Academic term/semester information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `code` | TEXT | PRIMARY KEY | Unique term code (e.g., "471") |
| `name` | TEXT | NOT NULL | Term name (e.g., "Fall 2024/2025") |
| `type` | TEXT | NOT NULL, CHECK (type IN ('FALL','SPRING','SUMMER')) | Term type |
| `start_date` | DATE | NOT NULL | Term start date |
| `end_date` | DATE | NOT NULL | Term end date |
| `is_active` | BOOLEAN | DEFAULT false | Whether this is the current active term |
| `schedule_published` | BOOLEAN | DEFAULT false | Whether schedules have been published |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Row Level Security:** Enabled (public read access)

---

### `term_events`
Timeline events for academic terms - **Used for dynamic feature gating**.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique event ID |
| `term_code` | TEXT | NOT NULL, REFERENCES academic_term(code) ON DELETE CASCADE | Associated term |
| `title` | TEXT | NOT NULL | Event title |
| `description` | TEXT | | Event description |
| `event_type` | event_type | NOT NULL | Type of event (enum) |
| `category` | event_category | NOT NULL, DEFAULT 'academic' | Event category (enum) |
| `start_date` | TIMESTAMPTZ | NOT NULL | Event start date/time |
| `end_date` | TIMESTAMPTZ | NOT NULL | Event end date/time |
| `is_recurring` | BOOLEAN | DEFAULT false | Whether event recurs |
| `metadata` | JSONB | DEFAULT '{}'::jsonb | Additional event metadata |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Constraints:**
- `end_date` must be >= `start_date`

**Indexes:**
- `idx_term_events_term_code` on `term_code`
- `idx_term_events_type` on `event_type`
- `idx_term_events_category` on `category`
- `idx_term_events_dates` on `(start_date, end_date)`
- `idx_term_events_created` on `created_at DESC`
- `idx_term_events_metadata` (GIN) for JSONB queries

**Row Level Security:** Enabled
- Everyone can view events
- Committee members can manage events

**Timeline-Based Feature Gating:**
This table is central to the dynamic feature gating system. Key event types used for gating:
- `elective_survey`: Controls access to elective preference submission (`/student/electives`)
- `feedback_period`: Controls access to feedback submission (`/student/feedback`)

The system checks if `NOW()` is between `start_date` and `end_date` for these event types to determine feature availability.

**Event Metadata Examples:**
```json
{
  "priority": "high",
  "requires_action": true,
  "url": "/student/electives",
  "notification": true,
  "audience": "student"
}
```

---

## Student Module

### 🎓 Student Profile & Identity

### `students`
Core student profile extending the users table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, REFERENCES users(id) ON DELETE CASCADE | Student identifier (same as user ID) |
| `student_number` | TEXT | UNIQUE, NOT NULL | Official student number |
| `level` | INT | NOT NULL, CHECK (level BETWEEN 1 AND 8) | Current academic level (1-8) |
| `current_term` | TEXT | REFERENCES academic_term(code) | Current enrolled term |
| `status` | TEXT | DEFAULT 'active', CHECK (status IN ('active','inactive','suspended','graduated','withdrawn')) | Student status |
| `setup_completed` | BOOLEAN | DEFAULT false | Whether initial setup is done |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Account creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Purpose:** Stores core student identity and current academic standing.

**Indexes:**
- `idx_students_number` on `student_number`
- `idx_students_level` on `level`
- `idx_students_term` on `current_term`
- `idx_students_status` on `status` WHERE status = 'active'

**Row Level Security:** Enabled
- Students can view/update their own profile
- Committee/Registrar can view/manage all

---

### 📚 Elective Preference System (Pre-Semester)

### `elective_preferences`
Student elective course preferences submitted BEFORE scheduling.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique preference ID |
| `student_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Student who submitted preference |
| `course_code` | TEXT | NOT NULL, REFERENCES course(code) ON DELETE CASCADE | Desired elective course |
| `term_code` | TEXT | NOT NULL, REFERENCES academic_term(code) ON DELETE CASCADE | Target term |
| `preference_order` | INT | NOT NULL, CHECK (preference_order BETWEEN 1 AND 10) | Priority rank (1=highest) |
| `status` | TEXT | DEFAULT 'pending', CHECK (status IN ('pending','approved','rejected','assigned')) | Processing status |
| `submitted_at` | TIMESTAMPTZ | | When preferences were submitted |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Purpose:** Captures student elective preferences used as INPUT to the schedule generator.

**Unique Constraints:**
- `(student_id, term_code, preference_order)` - One rank per student per term
- `(student_id, course_code, term_code)` - One preference per course per term

**Indexes:**
- `idx_elective_prefs_student` on `student_id`
- `idx_elective_prefs_term` on `term_code`
- `idx_elective_prefs_status` on `status`
- `idx_elective_prefs_course` on `course_code`

**Row Level Security:** Enabled
- Students can CRUD their own preferences (before deadline)
- Committee can view all and update status

**Workflow:**
1. Student submits preferences (preference_order 1-10)
2. Scheduler reads preferences
3. Scheduler assigns courses based on preferences + constraints
4. Status updated to 'assigned' or 'rejected'

---

### `elective_package`
Groupings of elective courses with credit requirements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Package identifier |
| `name` | TEXT | NOT NULL | Package name (e.g., "Web Development Track") |
| `description` | TEXT | | Package description |
| `min_credits` | INT | NOT NULL | Minimum credits required from this package |
| `max_credits` | INT | NOT NULL | Maximum credits allowed from this package |
| `is_active` | BOOLEAN | DEFAULT true | Whether package is currently offered |
| `display_order` | INT | | Display order in UI |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Purpose:** Groups related electives with credit requirements.

**Indexes:**
- `idx_elective_package_active` on `is_active` WHERE is_active = true
- `idx_elective_package_order` on `display_order`

---

### `package_course`
Junction table linking courses to elective packages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique ID |
| `package_id` | UUID | NOT NULL, REFERENCES elective_package(id) ON DELETE CASCADE | Package reference |
| `course_code` | TEXT | NOT NULL, REFERENCES course(code) ON DELETE CASCADE | Course in package |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Purpose:** Defines which courses belong to which packages.

**Unique Constraint:** `(package_id, course_code)`

**Indexes:**
- `idx_package_course_package` on `package_id`
- `idx_package_course_code` on `course_code`

---

### `student_package_progress`
Tracks student progress toward package completion.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique ID |
| `student_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Student reference |
| `package_id` | UUID | NOT NULL, REFERENCES elective_package(id) ON DELETE CASCADE | Package reference |
| `credits_completed` | INT | DEFAULT 0 | Credits completed in this package |
| `credits_enrolled` | INT | DEFAULT 0 | Credits currently enrolled |
| `is_fulfilled` | BOOLEAN | DEFAULT false | Whether package requirement is met |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last calculation timestamp |

**Purpose:** Automatically calculated package fulfillment tracking.

**Unique Constraint:** `(student_id, package_id)`

**Indexes:**
- `idx_student_package_progress_student` on `student_id`
- `idx_student_package_progress_package` on `package_id`

---

### 📅 Generated Schedules (Post-Generation)

### `schedules`
**GENERATED** student schedules (OUTPUT of the scheduler).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Schedule identifier |
| `student_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Student this schedule belongs to |
| `term_code` | TEXT | REFERENCES academic_term(code) | Academic term |
| `data` | JSONB | NOT NULL | Generated schedule data (sections, times, rooms) |
| `version` | INT | DEFAULT 1 | Schedule version (for regenerations) |
| `is_published` | BOOLEAN | DEFAULT false | Whether visible to student |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Generation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Purpose:** Stores the FINAL generated schedules created by the scheduler.

**Important:** This is READ-ONLY for students. Created by the scheduling committee.

**Schedule Data Format (JSONB):**
```json
{
  "sections": [
    {
      "section_id": "SWE101-01",
      "course_code": "SWE101",
      "course_name": "Intro to Programming",
      "instructor": "Dr. Smith",
      "room": "A201",
      "times": [
        {"day": "SUNDAY", "start": "08:00", "end": "09:30"},
        {"day": "TUESDAY", "start": "08:00", "end": "09:30"}
      ],
      "credits": 3,
      "type": "REQUIRED"
    }
  ],
  "stats": {
    "total_credits": 18,
    "required_courses": 5,
    "elective_courses": 1,
    "preferences_met": 4,
    "total_preferences": 5
  }
}
```

**Indexes:**
- `idx_schedules_student` on `student_id`
- `idx_schedules_term` on `term_code`
- `idx_schedules_published` on `is_published` WHERE is_published = true
- `idx_schedules_data` (GIN) for JSONB queries

**Row Level Security:** Enabled
- Students can view their own PUBLISHED schedules only
- Committee can manage all schedules

---

### `enrollment`
Historical course completion tracking (NOT real-time enrollment).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Enrollment record ID |
| `student_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Student reference |
| `course_code` | TEXT | NOT NULL, REFERENCES course(code) ON DELETE CASCADE | Course taken |
| `term_code` | TEXT | NOT NULL, REFERENCES academic_term(code) ON DELETE CASCADE | Term taken |
| `status` | TEXT | DEFAULT 'enrolled', CHECK (status IN ('enrolled','completed','dropped','failed','withdrawn')) | Enrollment status |
| `grade` | DECIMAL(5,2) | | Numeric grade (0-100) |
| `grade_letter` | TEXT | CHECK (grade_letter IN ('A+','A','B+','B','C+','C','D+','D','F','W','I','P')) | Letter grade |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Record creation |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Purpose:** Historical record of courses taken and grades earned.

**Important:** This represents PAST enrollments, not current semester enrollment. Used for:
- Transcript generation
- GPA calculation
- Prerequisite checking
- Graduation requirements

**Unique Constraint:** `(student_id, course_code, term_code)`

**Indexes:**
- `idx_enrollment_student` on `student_id`
- `idx_enrollment_term` on `term_code`
- `idx_enrollment_course` on `course_code`
- `idx_enrollment_status` on `status`

**Row Level Security:** Enabled
- Students can view their own enrollment history
- Committee/Registrar can view/manage all

---

### 💬 Feedback System

### `feedback`
Student feedback on generated schedules.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Feedback ID |
| `student_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Student who submitted |
| `schedule_id` | UUID | REFERENCES schedules(id) ON DELETE SET NULL | Related schedule (optional) |
| `rating` | INT | NOT NULL, CHECK (rating BETWEEN 1 AND 5) | Schedule rating (1-5 stars) |
| `feedback_text` | TEXT | NOT NULL | Detailed feedback (min 10 chars) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Submission timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Purpose:** Collects student feedback to improve future schedule generation.

**Indexes:**
- `idx_feedback_student` on `student_id`
- `idx_feedback_schedule` on `schedule_id`
- `idx_feedback_rating` on `rating`
- `idx_feedback_created` on `created_at DESC`

**Row Level Security:** Enabled
- Students can CRUD their own feedback
- Committee can view all feedback

---

### 🚨 Irregular Students Tracking

### `irregular_students`
Tracks students with special scheduling needs or issues.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Record ID |
| `student_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Affected student |
| `term_code` | TEXT | NOT NULL, REFERENCES academic_term(code) ON DELETE CASCADE | Term |
| `reason` | TEXT | NOT NULL | Why student is irregular |
| `courses_needed` | TEXT[] | DEFAULT '{}' | Specific courses needed |
| `status` | TEXT | DEFAULT 'pending', CHECK (status IN ('pending','notified','resolved')) | Case status |
| `reported_by` | UUID | NOT NULL, REFERENCES users(id) | Committee member who reported |
| `notified_at` | TIMESTAMPTZ | | When student was notified |
| `resolved_at` | TIMESTAMPTZ | | When issue was resolved |
| `notes` | TEXT | | Additional notes |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Report timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Purpose:** Tracks students who need special attention (failed courses, missing prerequisites, etc.).

**Unique Constraint:** `(student_id, term_code)`

**Indexes:**
- `idx_irregular_students_student` on `student_id`
- `idx_irregular_students_term` on `term_code`
- `idx_irregular_students_status` on `status`

**Row Level Security:** Enabled
- Committee/Registrar can view/manage
- Students CANNOT view (handled via notifications)

---

## Triggers & Functions

### `log_changes()`
Automatically logs all INSERT/UPDATE/DELETE operations to the `change_log` table.

**Applied to:**
- `course` table
- `section` table
- `exam` table

### `update_updated_at_column()`
Automatically updates the `updated_at` timestamp on record modification.

**Applied to:**
- `electives` table
- `student_electives` table
- `feedback` table
- `schedules` table
- `term_events` table
- `academic_term` table

### `get_active_events(term_code)`
Returns all currently active events (where NOW() is between start_date and end_date).

**Parameters:**
- `term_code` (TEXT, optional): Filter by specific term

**Returns:** Table of active events with all columns

### `get_upcoming_events(term_code, days_ahead)`
Returns upcoming events within a specified number of days.

**Parameters:**
- `term_code` (TEXT): Term to query
- `days_ahead` (INTEGER, default 30): Number of days to look ahead

**Returns:** Table with event details and `days_until` field

---

## Sample Data

The schema includes sample elective courses:
- Advanced Web Development (SWE499, Level 8, 3 credits)
- Mobile Application Development (SWE498, Level 8, 3 credits)
- Machine Learning (SWE497, Level 7, 3 credits)
- Cloud Computing (SWE496, Level 7, 3 credits)
- Cybersecurity Fundamentals (SWE495, Level 6, 3 credits)

---

## Relationships

```
users (1) ─── (1) students
users (1) ─── (*) elective_preferences
users (1) ─── (*) enrollment (historical records)
users (1) ─── (*) schedules (generated by system)
users (1) ─── (*) feedback
users (1) ─── (*) student_package_progress
users (1) ─── (*) irregular_students

course (1) ─── (*) elective_preferences
course (1) ─── (*) enrollment
course (1) ─── (*) package_course
course (1) ─── (*) section
course (1) ─── (*) exam

academic_term (1) ─── (*) elective_preferences
academic_term (1) ─── (*) enrollment
academic_term (1) ─── (*) schedules
academic_term (1) ─── (*) irregular_students
academic_term (1) ─── (*) term_events
academic_term (1) ─── (1) students (current_term)

elective_package (1) ─── (*) package_course
elective_package (1) ─── (*) student_package_progress

users (faculty) (1) ─── (*) section (instructor_id)
room (1) ─── (*) section
section (1) ─── (*) section_time

schedules (1) ─── (*) feedback (optional)
```

---

## 📊 Timetabling System Data Flow

### Pre-Semester Phase (Data Collection)

```
┌──────────────────────────────────────────────────────────┐
│                    DATA COLLECTION                        │
└──────────────────────────────────────────────────────────┘

    STUDENTS                FACULTY               REGISTRAR
       ↓                       ↓                      ↓
┌─────────────┐      ┌─────────────────┐    ┌──────────────┐
│  Elective   │      │     Faculty      │    │   Academic   │
│ Preferences │      │  Availability    │    │    Terms     │
└──────┬──────┘      └────────┬─────────┘    └──────┬───────┘
       │                      │                      │
       │                      │                      │
       v                      v                      v
┌───────────────────────────────────────────────────────────┐
│              SCHEDULING COMMITTEE INPUT                    │
│   • elective_preferences                                  │
│   • faculty_availability                                  │
│   • academic_term                                         │
│   • course (catalog)                                      │
│   • students (level, status)                              │
│   • enrollment (historical - for prerequisites)           │
│   • elective_package (requirements)                       │
└───────────────────────────┬───────────────────────────────┘
                            │
                            v
┌───────────────────────────────────────────────────────────┐
│                  SCHEDULE GENERATOR                        │
│                  (Algorithm Runs)                          │
│                                                            │
│  1. Collect constraints & preferences                      │
│  2. Assign required courses to sections                    │
│  3. Allocate time slots & rooms                            │
│  4. Assign electives based on preferences                  │
│  5. Check conflicts (time, room, capacity)                 │
│  6. Optimize (minimize gaps, balance load)                 │
│  7. Generate final schedule for each student               │
└───────────────────────────┬───────────────────────────────┘
                            │
                            v
┌───────────────────────────────────────────────────────────┐
│                  GENERATED OUTPUT                          │
│                                                            │
│   • schedules (per student, JSONB data)                    │
│   • section (with instructor assignments)                  │
│   • section_time (time slots)                              │
│   • elective_preferences (status updated)                  │
│   • irregular_students (if any issues)                     │
└───────────────────────────┬───────────────────────────────┘
                            │
                            v
┌───────────────────────────────────────────────────────────┐
│                 COMMITTEE REVIEW                           │
│                                                            │
│   • Check conflicts                                        │
│   • Verify preferences satisfied                           │
│   • Review irregular students                              │
│   • Adjust if needed → Re-run generator                    │
│   • Approve → PUBLISH                                      │
└───────────────────────────┬───────────────────────────────┘
                            │
                            v
```

### Semester Phase (Read-Only Viewing)

```
┌───────────────────────────────────────────────────────────┐
│               PUBLISHED SCHEDULES                          │
│           (schedules.is_published = true)                  │
└───────────────────────────┬───────────────────────────────┘
                            │
                 ┌──────────┴──────────┐
                 v                     v
         ┌─────────────┐       ┌─────────────┐
         │  STUDENTS   │       │   FACULTY   │
         │  View Their │       │  View Their │
         │  Schedule   │       │  Teaching   │
         │  (READ)     │       │  Schedule   │
         └──────┬──────┘       └─────────────┘
                │
                v
         ┌─────────────┐
         │  Provide    │
         │  Feedback   │
         └──────┬──────┘
                │
                v
         ┌─────────────┐
         │  feedback   │
         │  table      │
         └─────────────┘
```

### Key Table Purposes

| Table | Phase | Purpose | Modified By |
|-------|-------|---------|-------------|
| `students` | Both | Student profile | Registrar, Student |
| `elective_preferences` | Pre-Semester | Input for scheduler | Student, Scheduler |
| `faculty_availability` | Pre-Semester | Input for scheduler | Faculty |
| `section` | Pre-Semester | Generated sections | Teaching Load Committee |
| `section_time` | Pre-Semester | Time allocations | Scheduler |
| `schedules` | Pre-Semester → Semester | Generated schedules (OUTPUT) | Scheduler |
| `enrollment` | Post-Semester | Historical records | Registrar |
| `feedback` | Semester | Student feedback | Student |
| `irregular_students` | Pre-Semester | Special cases | Committee |

---

## Security Model

All tables have **Row Level Security (RLS)** enabled with specific policies:

1. **Public Read Access**: courses, exams, rooms, sections, section_time, electives
2. **User-Owned Data**: students can CRUD their own preferences, feedback, and view their schedules
3. **Committee Powers**:
   - Scheduling Committee: manages courses
   - Teaching Load Committee: manages sections
   - Registrar: manages exams
   - All committees: can view all data and manage schedules

---

## Database Maintenance

### Resetting User Data

✅ **Database Reset Complete** (2025-10-24)

All demo/test user data has been cleared:
- ✅ `auth.users` - 0 rows
- ✅ `public.users` - 0 rows  
- ✅ `public.students` - 0 rows
- ✅ `public.faculty` - 0 rows
- ✅ `public.student_electives` - 0 rows
- ✅ `public.feedback` - 0 rows
- ✅ `public.schedules` - 0 rows
- ✅ `public.enrollment` - 0 rows

The database is now ready to accept real users.

---

*This document is automatically synchronized with the database schema. Any manual edits will be overwritten on regeneration.*

