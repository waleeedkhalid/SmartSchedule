# Student Schema Summary

> **Last Updated:** 2025-10-25  
> **System Type:** Timetabling/Scheduling System

## 🎯 Quick Overview

This document provides a **quick reference** for all student-related database tables in SmartSchedule.

**Key Concept:** SmartSchedule is a **TIMETABLING SYSTEM**. Students do NOT enroll in real-time. Instead:
1. **Pre-Semester**: Students submit preferences → System generates schedules
2. **Semester**: Students VIEW their generated schedules (read-only)

---

## 📊 Student Tables At-A-Glance

| Table | Purpose | Created By | Phase |
|-------|---------|------------|-------|
| `students` | Core student profile | Registrar | Both |
| `elective_preferences` | Elective course preferences (INPUT) | Student | Pre-Semester |
| `schedules` | Generated timetables (OUTPUT) | Scheduler | Pre-Semester |
| `enrollment` | Historical course records | Registrar | Post-Semester |
| `feedback` | Schedule feedback | Student | Semester |
| `irregular_students` | Special cases tracking | Committee | Pre-Semester |
| `student_package_progress` | Elective package tracking | System | Both |
| `elective_package` | Elective course groups | Committee | Setup |
| `package_course` | Courses in packages | Committee | Setup |

---

## 1. `students` - Core Profile

**Purpose:** Student identity and current academic status

```sql
CREATE TABLE students (
  id UUID PRIMARY KEY REFERENCES users(id),
  student_number TEXT UNIQUE NOT NULL,
  level INT NOT NULL CHECK (level BETWEEN 1 AND 8),
  current_term TEXT REFERENCES academic_term(code),
  status TEXT DEFAULT 'active',
  setup_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Status Values:** `active`, `inactive`, `suspended`, `graduated`, `withdrawn`

**RLS:**
- Students: View/update own profile
- Committee/Registrar: View/manage all

**Common Queries:**
```sql
-- Get active students by level
SELECT * FROM students 
WHERE status = 'active' AND level = 6;

-- Get student with enrollment history
SELECT s.*, COUNT(e.id) as courses_completed
FROM students s
LEFT JOIN enrollment e ON e.student_id = s.id AND e.status = 'completed'
WHERE s.id = $1
GROUP BY s.id;
```

---

## 2. `elective_preferences` - Student Input

**Purpose:** Student elective selections (INPUT for scheduler)

```sql
CREATE TABLE elective_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  course_code TEXT NOT NULL REFERENCES course(code),
  term_code TEXT NOT NULL REFERENCES academic_term(code),
  preference_order INT NOT NULL CHECK (preference_order BETWEEN 1 AND 10),
  status TEXT DEFAULT 'pending',
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, term_code, preference_order),
  UNIQUE(student_id, course_code, term_code)
);
```

**Status Values:** `pending`, `approved`, `rejected`, `assigned`

**RLS:**
- Students: CRUD own preferences (before deadline)
- Committee: View all, update status

**Workflow:**
1. Student ranks electives (1-10, 1 = highest priority)
2. Scheduler reads preferences
3. Scheduler assigns based on constraints + preferences
4. Status updated to `assigned` or `rejected`

**Common Queries:**
```sql
-- Get student's submitted preferences for a term
SELECT ep.*, c.name as course_name
FROM elective_preferences ep
JOIN course c ON c.code = ep.course_code
WHERE ep.student_id = $1 
  AND ep.term_code = $2
  AND ep.submitted_at IS NOT NULL
ORDER BY ep.preference_order;

-- Check if student has submitted
SELECT EXISTS(
  SELECT 1 FROM elective_preferences
  WHERE student_id = $1 
    AND term_code = $2
    AND submitted_at IS NOT NULL
);
```

---

## 3. `schedules` - Generated Timetables

**Purpose:** FINAL generated student schedules (OUTPUT of scheduler)

```sql
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  term_code TEXT REFERENCES academic_term(code),
  data JSONB NOT NULL,
  version INT DEFAULT 1,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Important:** READ-ONLY for students. Created by scheduling committee.

**Schedule Data Format (JSONB):**
```json
{
  "sections": [
    {
      "section_id": "SWE101-01",
      "course_code": "SWE101",
      "course_name": "Introduction to Programming",
      "instructor": "Dr. Ahmed",
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

**RLS:**
- Students: View own PUBLISHED schedules only
- Committee: Manage all

**Common Queries:**
```sql
-- Get student's published schedule
SELECT * FROM schedules
WHERE student_id = $1 
  AND term_code = $2
  AND is_published = true
ORDER BY version DESC
LIMIT 1;

-- Get all sections from schedule
SELECT 
  s.id,
  s.student_id,
  jsonb_array_elements(s.data->'sections') as section
FROM schedules s
WHERE s.student_id = $1 AND s.is_published = true;
```

---

## 4. `enrollment` - Historical Records

**Purpose:** Past course completions (NOT current semester enrollment)

```sql
CREATE TABLE enrollment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  course_code TEXT NOT NULL REFERENCES course(code),
  term_code TEXT NOT NULL REFERENCES academic_term(code),
  status TEXT DEFAULT 'enrolled',
  grade DECIMAL(5,2),
  grade_letter TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, course_code, term_code)
);
```

**Status Values:** `enrolled`, `completed`, `dropped`, `failed`, `withdrawn`

**Grade Letters:** `A+`, `A`, `B+`, `B`, `C+`, `C`, `D+`, `D`, `F`, `W`, `I`, `P`

**Usage:**
- Transcript generation
- GPA calculation
- Prerequisite checking
- Graduation requirements

**RLS:**
- Students: View own enrollment history
- Committee/Registrar: View/manage all

**Common Queries:**
```sql
-- Calculate student GPA
SELECT 
  student_id,
  ROUND(AVG(grade), 2) as gpa,
  COUNT(*) as courses_taken,
  SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as courses_completed
FROM enrollment
WHERE student_id = $1 AND grade IS NOT NULL
GROUP BY student_id;

-- Check prerequisites
SELECT EXISTS(
  SELECT 1 FROM enrollment
  WHERE student_id = $1
    AND course_code = ANY($2::TEXT[])
    AND status = 'completed'
    AND grade >= 50
);
```

---

## 5. `feedback` - Student Feedback

**Purpose:** Student feedback on generated schedules

```sql
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  schedule_id UUID REFERENCES schedules(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  feedback_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**RLS:**
- Students: CRUD own feedback
- Committee: View all

**Common Queries:**
```sql
-- Get average rating for a term
SELECT 
  AVG(f.rating) as avg_rating,
  COUNT(*) as feedback_count
FROM feedback f
JOIN schedules s ON s.id = f.schedule_id
WHERE s.term_code = $1;

-- Get recent feedback
SELECT f.*, u.full_name as student_name
FROM feedback f
JOIN users u ON u.id = f.student_id
ORDER BY f.created_at DESC
LIMIT 50;
```

---

## 6. `irregular_students` - Special Cases

**Purpose:** Track students with special needs/issues

```sql
CREATE TABLE irregular_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  term_code TEXT NOT NULL REFERENCES academic_term(code),
  reason TEXT NOT NULL,
  courses_needed TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  reported_by UUID NOT NULL REFERENCES users(id),
  notified_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, term_code)
);
```

**Status Values:** `pending`, `notified`, `resolved`

**RLS:**
- Committee/Registrar: View/manage
- Students: CANNOT view (notified separately)

**Common Use Cases:**
- Failed prerequisite courses
- Missing required courses
- Overload/underload situations
- Special accommodation needs

---

## 7. Elective Package System

### `elective_package`
Groups of related elective courses with credit requirements.

```sql
CREATE TABLE elective_package (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  min_credits INT NOT NULL,
  max_credits INT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Example:** "Web Development Track" requires 6-9 credits from web courses.

### `package_course`
Links courses to packages.

```sql
CREATE TABLE package_course (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES elective_package(id),
  course_code TEXT NOT NULL REFERENCES course(code),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(package_id, course_code)
);
```

### `student_package_progress`
Tracks student progress toward package completion.

```sql
CREATE TABLE student_package_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES users(id),
  package_id UUID NOT NULL REFERENCES elective_package(id),
  credits_completed INT DEFAULT 0,
  credits_enrolled INT DEFAULT 0,
  is_fulfilled BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(student_id, package_id)
);
```

---

## 🔄 Data Flow Summary

### Pre-Semester (System Active)

```
1. Student submits elective_preferences
2. Faculty submits faculty_availability
3. Committee assigns sections to faculty
4. SCHEDULER RUNS:
   - Reads: students, elective_preferences, faculty_availability, courses, enrollment
   - Generates: schedules, section_time
   - Updates: elective_preferences.status
   - Flags: irregular_students
5. Committee reviews and PUBLISHES schedules
```

### Semester (System Passive)

```
1. Student views published schedules (READ-ONLY)
2. Student provides feedback
3. Faculty views teaching schedule (READ-ONLY)
```

### Post-Semester

```
1. Registrar updates enrollment with grades
2. System updates student_package_progress
3. Checks graduation requirements
```

---

## 🔐 Security Summary

All tables use **Row Level Security (RLS)**:

| Table | Student Access | Committee Access |
|-------|----------------|------------------|
| `students` | View/update own | View/manage all |
| `elective_preferences` | CRUD own | View all, update status |
| `schedules` | View published | Manage all |
| `enrollment` | View own | View/manage all |
| `feedback` | CRUD own | View all |
| `irregular_students` | NO ACCESS | View/manage all |
| `student_package_progress` | View own | View all |

**RLS Performance Rule:** Always wrap `auth.uid()` in subquery!

```sql
-- ✅ GOOD (fast)
CREATE POLICY "view_own" ON students
  FOR SELECT USING (id = (SELECT auth.uid()));

-- ❌ BAD (slow - re-evaluated for every row)
CREATE POLICY "view_own" ON students
  FOR SELECT USING (id = auth.uid());
```

---

## 🔍 Common Integration Queries

### Get Complete Student Profile
```sql
SELECT 
  s.*,
  u.full_name,
  u.email,
  at.name as current_term_name,
  COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'completed') as courses_completed,
  COUNT(DISTINCT ep.id) FILTER (WHERE ep.submitted_at IS NOT NULL) as preferences_submitted,
  EXISTS(
    SELECT 1 FROM schedules sc 
    WHERE sc.student_id = s.id 
      AND sc.term_code = s.current_term 
      AND sc.is_published = true
  ) as has_published_schedule,
  EXISTS(
    SELECT 1 FROM irregular_students i 
    WHERE i.student_id = s.id 
      AND i.term_code = s.current_term 
      AND i.status != 'resolved'
  ) as is_irregular
FROM students s
JOIN users u ON u.id = s.id
LEFT JOIN academic_term at ON at.code = s.current_term
LEFT JOIN enrollment e ON e.student_id = s.id
LEFT JOIN elective_preferences ep ON ep.student_id = s.id AND ep.term_code = s.current_term
WHERE s.id = $1
GROUP BY s.id, u.id, at.id;
```

### Check Student Eligibility for Electives
```sql
-- Check if student can select electives
SELECT 
  ep.id IS NOT NULL as already_submitted,
  te.id IS NOT NULL as survey_open,
  at.electives_survey_open as term_allows
FROM students s
LEFT JOIN academic_term at ON at.code = s.current_term
LEFT JOIN elective_preferences ep ON ep.student_id = s.id 
  AND ep.term_code = s.current_term 
  AND ep.submitted_at IS NOT NULL
LEFT JOIN term_events te ON te.term_code = s.current_term 
  AND te.event_type = 'elective_survey'
  AND NOW() BETWEEN te.start_date AND te.end_date
WHERE s.id = $1;
```

---

## 📚 Related Documentation

- **Full Schema:** [`schema/overview.md`](overview.md)
- **System Architecture:** [`system/architecture.md`](../system/architecture.md)
- **Workflows:** [`system/workflows.md`](../system/workflows.md)
- **Database Types:** [`src/types/database.ts`](../../src/types/database.ts)

---

*This document provides a quick reference for developers. For complete details, see the full schema documentation.*

