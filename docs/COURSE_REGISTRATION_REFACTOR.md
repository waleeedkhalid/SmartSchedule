# Course Registration System Refactor

## Overview

This document describes the refactored Course Registration system with corrected business logic for course types, levels, and prerequisites.

## Business Logic

### Course Types

1. **Core (Required) Courses**
   - Have a `recommended_level` (1-8)
   - Assigned to specific levels
   - Students are automatically enrolled based on their level

2. **Elective Courses**
   - Do NOT belong to a specific level
   - `recommended_level` is NULL
   - Students can choose from the pool of electives at any time
   - No level restrictions (only prerequisite restrictions)

### Prerequisites

- A student **cannot register** for a course unless they have a status of **'Passed'** in all prerequisite courses
- Prerequisites are defined in the `course_prerequisite` table (self-referencing)
- Prerequisite checking is enforced at registration time

## Database Schema

### Updated `course` Table

```sql
-- Column renamed from 'level' to 'recommended_level'
-- Made nullable for elective courses
ALTER TABLE course 
  RENAME COLUMN level TO recommended_level;

ALTER TABLE course 
  ALTER COLUMN recommended_level DROP NOT NULL;

-- Updated constraint allows NULL
ALTER TABLE course 
  ADD CONSTRAINT course_recommended_level_check 
  CHECK (recommended_level IS NULL OR (recommended_level >= 1 AND recommended_level <= 8));
```

### New `course_prerequisite` Table

```sql
CREATE TABLE course_prerequisite (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code TEXT NOT NULL REFERENCES course(code) ON DELETE CASCADE,
  prerequisite_course_code TEXT NOT NULL REFERENCES course(code) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_code, prerequisite_course_code),
  CONSTRAINT course_prerequisite_no_self_reference 
    CHECK (course_code != prerequisite_course_code)
);
```

**Indexes:**
- `idx_course_prerequisite_course_code` on `course_code`
- `idx_course_prerequisite_prerequisite_code` on `prerequisite_course_code`

### Helper Function

A PostgreSQL function `check_course_prerequisites(student_id, course_code)` is available to efficiently check if a course is locked for a student:

```sql
SELECT * FROM check_course_prerequisites(
  'student-uuid-here',
  'CSC 113'
);
-- Returns: { is_locked: boolean, missing_prerequisites: text[] }
```

## Data Fetching

### Get Available Courses for Student

**Function:** `getAvailableCoursesForStudent(studentId: string)`

**Location:** `lib/db/course-registration.ts`

**Returns:** Array of `AvailableCourse` objects with:
- Course details (code, title, credits, etc.)
- `is_locked`: boolean indicating if prerequisites are met
- `missing_prerequisites`: array of course codes that are missing
- `prerequisites`: all prerequisite course codes

**Example Usage:**

```typescript
import { getAvailableCoursesForStudent } from '@/lib/db/course-registration';

const courses = await getAvailableCoursesForStudent(studentId);
const availableCourses = courses.filter(c => !c.is_locked);
const lockedCourses = courses.filter(c => c.is_locked);
```

### Get Single Course with Prerequisites

**Function:** `getCourseWithPrerequisites(courseCode: string, studentId?: string)`

**Location:** `lib/db/course-registration.ts`

**Example Usage:**

```typescript
import { getCourseWithPrerequisites } from '@/lib/db/course-registration';

const course = await getCourseWithPrerequisites('CSC 113', studentId);
if (course?.is_locked) {
  console.log('Missing prerequisites:', course.missing_prerequisites);
}
```

## Validation

### JavaScript Validation Function

**Function:** `canRegister(studentHistory, targetCourse, prerequisites)`

**Location:** `lib/utils/course-registration-validation.ts`

**Parameters:**
- `studentHistory`: Array of `StudentCourseHistory` objects
- `targetCourse`: Course code to check
- `prerequisites`: Array of prerequisite relationships

**Returns:** `boolean` - true if student can register

**Example Usage:**

```typescript
import { canRegister } from '@/lib/utils/course-registration-validation';

const studentHistory = [
  { course_code: 'CSC 111', status: 'Passed' },
  { course_code: 'MATH 106', status: 'Passed' }
];

const prerequisites = [
  { course_code: 'CSC 113', prerequisite_course_code: 'CSC 111' }
];

const canEnroll = canRegister(studentHistory, 'CSC 113', prerequisites);
// Returns: true (CSC 111 is passed)
```

### Helper Functions

**`getMissingPrerequisites(studentHistory, targetCourse, prerequisites)`**
- Returns array of missing prerequisite course codes

**`isCourseLocked(studentHistory, targetCourse, prerequisites)`**
- Returns boolean indicating if course is locked

## Student Course History

**Note:** The current implementation uses `student_enrollment` with status `'registered'` to determine passed courses. In a production system, you would typically have:

1. A separate `course_completion` or `grades` table with explicit pass/fail status
2. Or an enhanced `student_enrollment` table with a `grade` or `completion_status` field

For now, the system assumes:
- Courses with `status = 'registered'` are considered passed
- This is a temporary implementation that should be enhanced with proper grade tracking

## Example Supabase Query

Here's an example query that fetches all courses with their lock status for a student:

```sql
-- Get all courses with prerequisite information
WITH student_passed_courses AS (
  SELECT DISTINCT s.course_code
  FROM student_enrollment se
  JOIN section s ON se.section_id = s.id
  WHERE se.student_id = 'student-uuid-here'
    AND se.status = 'registered'
),
course_prereqs AS (
  SELECT 
    c.code,
    c.title,
    c.credits,
    c.is_elective,
    c.recommended_level,
    COALESCE(ARRAY_AGG(cp.prerequisite_course_code) FILTER (WHERE cp.prerequisite_course_code IS NOT NULL), ARRAY[]::TEXT[]) as prerequisites
  FROM course c
  LEFT JOIN course_prerequisite cp ON c.code = cp.course_code
  GROUP BY c.code, c.title, c.credits, c.is_elective, c.recommended_level
)
SELECT 
  cp.code,
  cp.title,
  cp.credits,
  cp.is_elective,
  cp.recommended_level,
  cp.prerequisites,
  CASE 
    WHEN array_length(cp.prerequisites, 1) IS NULL THEN false
    ELSE NOT (cp.prerequisites <@ (SELECT ARRAY_AGG(course_code) FROM student_passed_courses))
  END as is_locked,
  CASE 
    WHEN array_length(cp.prerequisites, 1) IS NULL THEN ARRAY[]::TEXT[]
    ELSE cp.prerequisites - (SELECT ARRAY_AGG(course_code) FROM student_passed_courses)
  END as missing_prerequisites
FROM course_prereqs cp;
```

## Migration Applied

The migration `refactor_course_registration_schema` has been applied to the database, which:
1. ✅ Renamed `level` to `recommended_level`
2. ✅ Made `recommended_level` nullable
3. ✅ Created `course_prerequisite` table
4. ✅ Created indexes for performance
5. ✅ Created `check_course_prerequisites` helper function

## Next Steps

1. **Grade/Completion Tracking**: Implement proper course completion tracking (separate table or enhanced enrollment status)
2. **UI Integration**: Update course registration UI to show locked courses and missing prerequisites
3. **API Endpoints**: Create API endpoints that use these functions for course registration validation
4. **Testing**: Add tests for prerequisite validation logic

## Files Created/Modified

- ✅ `supabase/migrations/refactor_course_registration_schema.sql` (applied via MCP)
- ✅ `lib/db/course-registration.ts` - Data fetching functions
- ✅ `lib/utils/course-registration-validation.ts` - Validation utilities
- ✅ `docs/COURSE_REGISTRATION_REFACTOR.md` - This documentation

