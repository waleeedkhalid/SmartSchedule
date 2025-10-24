# Database Schema Overview

> **Auto-generated from:** `src/data/main.sql`  
> **Last Updated:** 2025-10-24

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

## Student Features Module

### `electives`
Available elective courses for students.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique elective ID |
| `title` | TEXT | NOT NULL | Elective title |
| `description` | TEXT | | Detailed description |
| `code` | TEXT | NOT NULL, UNIQUE | Unique course code |
| `credits` | INTEGER | NOT NULL, CHECK (credits > 0) | Credit hours |
| `level` | INTEGER | NOT NULL, CHECK (level >= 4 AND level <= 8) | Academic level (4-8) |
| `prerequisites` | TEXT[] | | Array of prerequisite course codes |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_electives_code` on `code`
- `idx_electives_level` on `level`

**Row Level Security:** Enabled
- Everyone can view
- Committee members can manage

---

### `student_electives`
Junction table for student elective preferences.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique preference ID |
| `student_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Student reference |
| `elective_id` | UUID | NOT NULL, REFERENCES electives(id) ON DELETE CASCADE | Elective reference |
| `preference_order` | INTEGER | NOT NULL, CHECK (preference_order > 0) | Priority ranking |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Unique Constraint:** (student_id, elective_id)

**Indexes:**
- `idx_student_electives_student` on `student_id`
- `idx_student_electives_elective` on `elective_id`
- `idx_student_electives_order` on `(student_id, preference_order)`

**Row Level Security:** Enabled
- Students can CRUD their own preferences
- Committee members can view all

---

### `feedback`
Student feedback submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique feedback ID |
| `student_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Student who submitted |
| `schedule_id` | UUID | REFERENCES schedules(id) ON DELETE SET NULL | Related schedule (optional) |
| `feedback_text` | TEXT | NOT NULL, CHECK (char_length(feedback_text) >= 10) | Feedback content (min 10 chars) |
| `rating` | INTEGER | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Rating (1-5) |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Submission timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_feedback_student` on `student_id`
- `idx_feedback_schedule` on `schedule_id`
- `idx_feedback_created` on `created_at DESC`

**Row Level Security:** Enabled
- Students can CRUD their own feedback
- Committee members can view all

---

### `schedules`
Student schedule storage.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique schedule ID |
| `student_id` | UUID | NOT NULL, REFERENCES users(id) ON DELETE CASCADE | Student reference |
| `data` | JSONB | NOT NULL | Schedule data in JSON format |
| `created_at` | TIMESTAMPTZ | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_schedules_student` on `student_id`
- `idx_schedules_created` on `created_at DESC`
- `idx_schedules_data` (GIN index) for JSONB queries

**Row Level Security:** Enabled
- Students can view their own schedules
- Committee members can manage all

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
users (1) ─── (*) student_electives
electives (1) ─── (*) student_electives
users (1) ─── (*) feedback
schedules (1) ─── (*) feedback
users (1) ─── (*) schedules

course (1) ─── (*) section
course (1) ─── (*) exam
users (1) ─── (*) section (instructor_id)
room (1) ─── (*) section
section (1) ─── (*) section_time
```

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

*This document is automatically synchronized with the database schema. Any manual edits will be overwritten on regeneration.*

