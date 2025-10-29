# SmartSchedule V1 - API Reference (Refactored)

## Base URL
```
/api
```

## Authentication
All endpoints require authentication via Supabase Auth.
Some endpoints require specific roles (student, scheduling, registrar, faculty).

---

## 📅 Semesters API

### GET `/semesters`
List all semesters, ordered by start_date (most recent first).

**Query Parameters:**
- `current` (boolean, optional): If `true`, returns only the current active semester

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Fall 2025",
    "code": "2025F",
    "start_date": "2025-09-01",
    "end_date": "2025-12-31",
    "registration_start_date": "2025-08-15",
    "registration_end_date": "2025-09-15",
    "add_drop_deadline": "2025-09-22",
    "status": "active",
    "is_current": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

**Status Values:**
- `planning` - Being set up
- `registration_open` - Students can register
- `active` - Semester in progress
- `completed` - Semester finished
- `archived` - Historical record

---

### GET `/semesters/:id`
Get details for a specific semester.

**Response:** Same as individual semester object above.

---

### POST `/semesters`
Create a new semester (scheduling role only).

**Request Body:**
```json
{
  "name": "Fall 2025",
  "code": "2025F",
  "start_date": "2025-09-01",
  "end_date": "2025-12-31",
  "registration_start_date": "2025-08-15",
  "registration_end_date": "2025-09-15",
  "add_drop_deadline": "2025-09-22",
  "status": "planning",
  "is_current": false
}
```

**Response:** Created semester object.

---

### PATCH `/semesters/:id`
Update a semester (scheduling role only).

**Request Body:** Partial semester object (any fields to update).

**Response:** Updated semester object.

---

### DELETE `/semesters/:id`
Delete a semester (scheduling role only).

**Response:**
```json
{ "success": true }
```

---

### POST `/semesters/:id/archive`
Archive a semester (scheduling/registrar role only).

Calls `archive_semester(semester_id)` database function.
Sets status to 'archived' and is_current to false.

**Response:** Updated semester object.

---

### POST `/semesters/:id/generate-sections`
Auto-create sections for courses (scheduling role only).

Calls `auto_create_all_sections(semester_id)` or `auto_create_sections(semester_id, course_code)` database function.

**Request Body (optional):**
```json
{
  "course_code": "CS301"  // If provided, creates sections for this course only
}
```

**Response:**
```json
{
  "success": true,
  "course_code": "CS301",  // If specific course
  "result": {
    "sections_created": 3,
    "total_capacity": 75
  }
}
```

---

### GET `/semesters/:id/conflicts`
Get all scheduling conflicts for a semester.

Calls `get_semester_conflicts(semester_id)` database function.

**Response:**
```json
[
  {
    "type": "room_conflict",
    "section1_id": "uuid",
    "section2_id": "uuid",
    "details": "..."
  }
]
```

---

## 📝 Survey Periods API

### GET `/survey-periods`
List all survey periods.

**Query Parameters:**
- `semester_id` (uuid, optional): Filter by semester

**Response:**
```json
[
  {
    "id": "uuid",
    "academic_semester_id": "uuid",
    "survey_type": "elective_survey",
    "status": "open",
    "start_date": "2025-08-01",
    "end_date": "2025-08-15",
    "description": "Fall 2025 Elective Selection",
    "created_at": "2025-07-01T00:00:00Z"
  }
]
```

**Survey Types:**
- `elective_survey` - Students select elective preferences
- `availability_survey` - Faculty indicate availability

**Status Values:**
- `draft` - Being set up
- `open` - Active, accepting responses
- `closed` - Ended

---

### GET `/survey-periods/:id`
Get details for a specific survey period.

**Response:** Same as individual survey object above.

---

### POST `/survey-periods`
Create a new survey period (scheduling role only).

**Request Body:**
```json
{
  "academic_semester_id": "uuid",
  "survey_type": "elective_survey",
  "status": "draft",
  "start_date": "2025-08-01",
  "end_date": "2025-08-15",
  "description": "Fall 2025 Elective Selection"
}
```

**Response:** Created survey object.

---

### PATCH `/survey-periods/:id`
Update a survey period (scheduling role only).

**Request Body:** Partial survey object.

**Response:** Updated survey object.

---

### DELETE `/survey-periods/:id`
Delete a survey period (scheduling role only).

**Response:**
```json
{ "success": true }
```

---

### POST `/survey-periods/:id/open`
Open a survey period (scheduling role only).

Calls `open_survey(survey_period_id)` database function.
Sets status to 'open' and start_date to now.

**Response:** Updated survey object.

---

### POST `/survey-periods/:id/close`
Close a survey period (scheduling role only).

Calls `close_survey(survey_period_id)` database function.
Sets status to 'closed' and end_date to now.

**Response:** Updated survey object.

---

## 👤 Student Profiles API

### GET `/student-profiles`
List all student profiles (scheduling/registrar role only).

**Query Parameters:**
- `with_user` (boolean, optional): If `true`, includes user role data

**Response:**
```json
[
  {
    "user_id": "uuid",
    "student_id": "2021001234",
    "current_level": 4,
    "enrollment_year": 2021,
    "expected_graduation_year": 2025,
    "academic_status": "active",
    "max_credits_allowed": 21,
    "created_at": "2021-09-01T00:00:00Z"
  }
]
```

**Academic Status Values:**
- `active` - Regular student
- `probation` - Academic probation
- `suspended` - Temporarily suspended
- `graduated` - Completed program
- `withdrawn` - Left program

---

### GET `/student-profiles/:userId`
Get student profile for a specific user.

**Query Parameters:**
- `with_user` (boolean, optional): If `true`, includes user role data

**Response:** Same as individual profile object above.

---

### POST `/student-profiles`
Create a new student profile (scheduling/registrar role only).

**Request Body:**
```json
{
  "user_id": "uuid",
  "student_id": "2021001234",
  "current_level": 4,
  "enrollment_year": 2021,
  "expected_graduation_year": 2025,
  "academic_status": "active",
  "max_credits_allowed": 21
}
```

**Response:** Created profile object.

---

### PATCH `/student-profiles/:userId`
Update a student profile.

**Request Body:** Partial profile object.

**Response:** Updated profile object.

---

## 📚 Courses API

### GET `/courses`
List all courses.

**Response:**
```json
[
  {
    "code": "CS301",
    "name": "Data Structures",
    "credits": 3,
    "level": 3,
    "course_type": "required",
    "created_at": "2024-01-01T00:00:00Z"
  }
]
```

**Course Types:**
- `required` - Mandatory course
- `elective` - Optional course

---

### GET `/courses/:code`
Get details for a specific course.

**Response:** Same as individual course object above.

---

## 📖 Sections API

**⚠️ IMPORTANT: All section queries require `semester_id` parameter.**

### GET `/sections`
List sections for a semester.

**Query Parameters:**
- `semester_id` (uuid, **required**): Semester ID (defaults to current if not provided)
- `level` (number, optional): Filter by student level
- `state` (string, optional): Filter by state ('draft' | 'released')
- `courseCode` (string, optional): Filter by course code
- `instructorId` (uuid, optional): Filter by instructor
- `sectionType` (string, optional): Filter by type ('lecture' | 'lab' | 'tutorial')

**Response:**
```json
[
  {
    "id": "uuid",
    "course_code": "CS301",
    "section_no": "01",
    "section_type": "lecture",
    "instructor_id": "uuid",
    "room_code": "A101",
    "capacity": 25,
    "current_enrollment": 18,
    "meeting_pattern": {
      "days": ["Sunday", "Tuesday"],
      "start_time": "10:00",
      "duration_minutes": 90
    },
    "group_level": 3,
    "state": "released",
    "academic_semester_id": "uuid",
    "created_at": "2025-08-01T00:00:00Z"
  }
]
```

---

### GET `/sections/:id`
Get details for a specific section.

**Response:** Same as individual section object above.

---

## 📝 Exams API

**⚠️ IMPORTANT: All exam queries require `semester_id` parameter.**

### GET `/exams`
List exams for a semester.

**Query Parameters:**
- `semester_id` (uuid, **required**): Semester ID (defaults to current if not provided)
- `courseCode` (string, optional): Filter by course
- `examType` (string, optional): Filter by type ('midterm' | 'midterm2' | 'final')
- `startDate` (date, optional): Filter by start date
- `endDate` (date, optional): Filter by end date

**Response:**
```json
[
  {
    "id": "uuid",
    "course_code": "CS301",
    "exam_type": "midterm",
    "date": "2025-10-15",
    "start_time": "14:00",
    "duration_minutes": 120,
    "room_codes": ["A101", "A102"],
    "academic_semester_id": "uuid",
    "created_at": "2025-09-01T00:00:00Z"
  }
]
```

**Exam Types:**
- `midterm` - First midterm
- `midterm2` - Second midterm
- `final` - Final exam

---

### GET `/exams/:id`
Get details for a specific exam.

**Response:** Same as individual exam object above.

---

## 🎓 Student Enrollments API

### GET `/student/enrollments`
Get authenticated student's enrollments.

**Query Parameters:**
- `semester_id` (uuid, optional): Semester ID (defaults to current)
- `stats` (boolean, optional): If `true`, returns statistics instead of enrollments

**Response (enrollments):**
```json
[
  {
    "id": "uuid",
    "student_id": "uuid",
    "course_code": "CS301",
    "academic_semester_id": "uuid",
    "enrollment_type": "elective",
    "status": "enrolled",
    "enrolled_at": "2025-08-20T00:00:00Z",
    "course": {
      "code": "CS301",
      "name": "Data Structures",
      "credits": 3
    },
    "section_assignments": [
      {
        "id": "uuid",
        "section_id": "uuid",
        "assignment_type": "lecture",
        "section": {
          "section_no": "01",
          "meeting_pattern": {...},
          "instructor": {...}
        }
      }
    ]
  }
]
```

**Response (stats):**
```json
{
  "total_credits": 18,
  "max_credits": 21,
  "remaining_credits": 3
}
```

---

### POST `/student/enrollments`
Enroll in a section (student role only).

Uses `validate_enrollment()` and `assign_student_to_section()` database functions.

**Request Body:**
```json
{
  "section_id": "uuid",
  "enrollment_type": "elective"  // optional: 'required' | 'elective' | 'retake'
}
```

**Response:**
```json
{
  "success": true,
  "enrollment_id": "uuid",
  "message": "Successfully enrolled in section"
}
```

**Error Response (validation failed):**
```json
{
  "error": "Section is full",
  "validation": {
    "valid": false,
    "section_capacity": 25,
    "section_enrollment": 25
  }
}
```

---

### DELETE `/student/enrollments/:sectionId`
Drop a section (student role only).

**⚠️ IMPORTANT: Parameter is `sectionId` (not `enrollmentId`).**

Uses `drop_section()` database function.

**Response:**
```json
{
  "success": true,
  "message": "Section dropped successfully"
}
```

---

## 📅 Student Schedule API

### GET `/student/schedule`
Get authenticated student's complete schedule.

Uses `get_student_schedule()` database function if available, falls back to enrollment query.

**Query Parameters:**
- `semester_id` (uuid, optional): Semester ID (defaults to current)

**Response:**
```json
{
  "student_id": "uuid",
  "level": 4,
  "student_name": "John Doe",
  "semester_id": "uuid",
  "schedule": [
    {
      "enrollment_id": "uuid",
      "course_code": "CS301",
      "course_name": "Data Structures",
      "credits": 3,
      "sections": [
        {
          "section_id": "uuid",
          "section_no": "01",
          "type": "lecture",
          "instructor": "Dr. Smith",
          "room": "A101",
          "meeting_pattern": {
            "days": ["Sunday", "Tuesday"],
            "start_time": "10:00",
            "duration_minutes": 90
          }
        }
      ]
    }
  ],
  "is_empty": false
}
```

---

## 🔐 Authorization

### Role Requirements

| Endpoint | Roles |
|----------|-------|
| `GET /semesters` | All authenticated |
| `POST /semesters` | scheduling |
| `POST /semesters/:id/archive` | scheduling, registrar |
| `POST /semesters/:id/generate-sections` | scheduling |
| `GET /survey-periods` | All authenticated |
| `POST /survey-periods` | scheduling |
| `POST /survey-periods/:id/open` | scheduling |
| `GET /student-profiles` | scheduling, registrar |
| `POST /student-profiles` | scheduling, registrar |
| `GET /courses` | All authenticated |
| `GET /sections` | All authenticated |
| `GET /exams` | All authenticated |
| `GET /student/enrollments` | student (own data) |
| `POST /student/enrollments` | student |
| `DELETE /student/enrollments/:id` | student (own enrollment) |
| `GET /student/schedule` | student (own schedule) |

---

## 📊 Database Functions Called

The API uses these database functions (see migrations 014-018):

### Semester Functions
- `get_current_semester()` - Get active semester
- `archive_semester(semester_id)` - Archive semester
- `is_registration_open(semester_id)` - Check registration
- `is_add_drop_open(semester_id)` - Check add/drop

### Enrollment Functions
- `validate_enrollment(student_id, section_id)` - Validate enrollment
- `assign_student_to_section(student_id, section_id, enrollment_type)` - Enroll
- `drop_section(student_id, section_id)` - Drop
- `get_student_total_credits(student_id, semester_id)` - Calculate credits

### Section Functions
- `auto_create_sections(semester_id, course_code)` - Create sections
- `auto_create_all_sections(semester_id)` - Create all sections
- `get_section_roster(section_id)` - Section roster

### Query Functions
- `get_student_schedule(student_id, semester_id)` - Student schedule
- `calculate_instructor_load(instructor_id, semester_id)` - Teaching load
- `get_course_enrollment_count(course_code, semester_id)` - Enrollment count
- `get_semester_conflicts(semester_id)` - All conflicts

### Survey Functions
- `check_survey_eligibility(user_id, survey_type, semester_id)` - Check eligibility
- `open_survey(survey_period_id)` - Open survey
- `close_survey(survey_period_id)` - Close survey

---

## 🚨 Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## 📝 Notes

1. **Semester Context**: Always include `semester_id` when querying sections, exams, or enrollments.
2. **Database Functions**: The API prefers database functions over raw queries for validation and operations.
3. **Dual Enrollment Model**: Enrollments consist of `course_enrollment` (academic record) + `section_assignment` (scheduling detail).
4. **Student Data**: Student-specific attributes (level, status) are now in `student_profile` table, not `user_roles`.
5. **Exams**: Exams are course-level (not section-specific) and must be associated with a semester.

---

For migration guide and complete refactoring details, see:
- `REFACTORING_SUMMARY.md` - Technical refactoring details
- `MIGRATION_GUIDE.md` - Frontend migration guide
- `DEVELOPER_QUICK_START.md` - Quick reference for common tasks


