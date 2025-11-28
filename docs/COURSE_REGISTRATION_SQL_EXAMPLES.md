# Course Registration SQL Examples

## Database Schema Updates

### 1. Update Course Table

The `level` column has been renamed to `recommended_level` and made nullable:

```sql
-- Already applied via migration
ALTER TABLE course RENAME COLUMN level TO recommended_level;
ALTER TABLE course ALTER COLUMN recommended_level DROP NOT NULL;
```

**Result:**
- Core courses: `recommended_level` = 1-8 (e.g., Level 4)
- Elective courses: `recommended_level` = NULL

### 2. Prerequisites Table

Self-referencing table for course prerequisites:

```sql
-- Already created via migration
CREATE TABLE course_prerequisite (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_code TEXT NOT NULL REFERENCES course(code) ON DELETE CASCADE,
  prerequisite_course_code TEXT NOT NULL REFERENCES course(code) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(course_code, prerequisite_course_code),
  CHECK (course_code != prerequisite_course_code)
);
```

## Example Queries

### Query 1: Fetch Available Courses with Lock Status

This query fetches all courses and determines if they're locked for a specific student:

```sql
-- Get all courses with prerequisite information for a student
WITH student_passed_courses AS (
  -- Get all courses the student has passed
  -- Note: Currently using 'registered' status as passed
  -- In production, you'd check a grades/completion table
  SELECT DISTINCT s.course_code
  FROM student_enrollment se
  JOIN section s ON se.section_id = s.id
  WHERE se.student_id = 'student-uuid-here'
    AND se.status = 'registered'
),
course_with_prereqs AS (
  -- Get all courses with their prerequisites
  SELECT 
    c.code,
    c.title,
    c.credits,
    c.weekly_hours,
    c.is_elective,
    c.recommended_level,
    COALESCE(
      ARRAY_AGG(cp.prerequisite_course_code) 
      FILTER (WHERE cp.prerequisite_course_code IS NOT NULL), 
      ARRAY[]::TEXT[]
    ) as prerequisites
  FROM course c
  LEFT JOIN course_prerequisite cp ON c.code = cp.course_code
  GROUP BY c.code, c.title, c.credits, c.weekly_hours, c.is_elective, c.recommended_level
)
SELECT 
  cwp.code,
  cwp.title,
  cwp.credits,
  cwp.weekly_hours,
  cwp.is_elective,
  cwp.recommended_level,
  cwp.prerequisites,
  -- Check if course is locked (has unmet prerequisites)
  CASE 
    WHEN array_length(cwp.prerequisites, 1) IS NULL THEN false
    ELSE NOT (cwp.prerequisites <@ (SELECT ARRAY_AGG(course_code) FROM student_passed_courses))
  END as is_locked,
  -- Get missing prerequisites
  CASE 
    WHEN array_length(cwp.prerequisites, 1) IS NULL THEN ARRAY[]::TEXT[]
    ELSE cwp.prerequisites - (SELECT ARRAY_AGG(course_code) FROM student_passed_courses)
  END as missing_prerequisites
FROM course_with_prereqs cwp
ORDER BY cwp.code;
```

### Query 2: Using the Helper Function

The `check_course_prerequisites` function provides a simpler way to check lock status:

```sql
-- Check if a specific course is locked for a student
SELECT * FROM check_course_prerequisites(
  'student-uuid-here'::UUID,
  'CSC 113'::TEXT
);

-- Result:
-- is_locked: boolean
-- missing_prerequisites: text[]
```

### Query 3: Get All Prerequisites for a Course

```sql
SELECT 
  cp.prerequisite_course_code,
  c.title as prerequisite_title
FROM course_prerequisite cp
JOIN course c ON cp.prerequisite_course_code = c.code
WHERE cp.course_code = 'CSC 113'
ORDER BY cp.prerequisite_course_code;
```

### Query 4: Get Courses That Require a Specific Prerequisite

```sql
-- Find all courses that require CSC 111 as a prerequisite
SELECT 
  cp.course_code,
  c.title as course_title
FROM course_prerequisite cp
JOIN course c ON cp.course_code = c.code
WHERE cp.prerequisite_course_code = 'CSC 111'
ORDER BY cp.course_code;
```

### Query 5: Add a Prerequisite

```sql
-- Add CSC 111 as a prerequisite for CSC 113
INSERT INTO course_prerequisite (course_code, prerequisite_course_code)
VALUES ('CSC 113', 'CSC 111')
ON CONFLICT (course_code, prerequisite_course_code) DO NOTHING;
```

### Query 6: Remove a Prerequisite

```sql
-- Remove CSC 111 as a prerequisite for CSC 113
DELETE FROM course_prerequisite
WHERE course_code = 'CSC 113'
  AND prerequisite_course_code = 'CSC 111';
```

### Query 7: Get All Elective Courses (No Level Restriction)

```sql
-- Get all elective courses (recommended_level is NULL)
SELECT 
  code,
  title,
  credits,
  weekly_hours
FROM course
WHERE is_elective = true
  AND recommended_level IS NULL
ORDER BY code;
```

### Query 8: Get Core Courses for a Specific Level

```sql
-- Get all core courses for Level 4
SELECT 
  code,
  title,
  credits,
  weekly_hours
FROM course
WHERE is_elective = false
  AND recommended_level = 4
ORDER BY code;
```

### Query 9: Check Student's Registration Eligibility

```sql
-- Check if a student can register for a course
WITH student_history AS (
  SELECT DISTINCT s.course_code
  FROM student_enrollment se
  JOIN section s ON se.section_id = s.id
  WHERE se.student_id = 'student-uuid-here'
    AND se.status = 'registered'
),
required_prereqs AS (
  SELECT prerequisite_course_code
  FROM course_prerequisite
  WHERE course_code = 'CSC 113'
)
SELECT 
  'CSC 113' as target_course,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM required_prereqs) THEN true
    WHEN (SELECT COUNT(*) FROM required_prereqs) = 
         (SELECT COUNT(*) FROM required_prereqs rp
          JOIN student_history sh ON rp.prerequisite_course_code = sh.course_code)
    THEN true
    ELSE false
  END as can_register,
  ARRAY(
    SELECT prerequisite_course_code 
    FROM required_prereqs 
    WHERE prerequisite_course_code NOT IN (SELECT course_code FROM student_history)
  ) as missing_prerequisites;
```

## Using in TypeScript/JavaScript

### Example 1: Fetch Available Courses

```typescript
import { getAvailableCoursesForStudent } from '@/lib/db/course-registration';

const courses = await getAvailableCoursesForStudent(studentId);

// Filter available courses
const available = courses.filter(c => !c.is_locked);
const locked = courses.filter(c => c.is_locked);

// Display locked courses with missing prerequisites
locked.forEach(course => {
  console.log(`${course.code} is locked. Missing: ${course.missing_prerequisites.join(', ')}`);
});
```

### Example 2: Validate Before Registration

```typescript
import { canRegister } from '@/lib/utils/course-registration-validation';

// Get student history from database
const studentHistory = [
  { course_code: 'CSC 111', status: 'Passed' },
  { course_code: 'MATH 106', status: 'Passed' }
];

// Get prerequisites from database
const prerequisites = await supabase
  .from('course_prerequisite')
  .select('course_code, prerequisite_course_code')
  .eq('course_code', 'CSC 113');

// Check if student can register
if (canRegister(studentHistory, 'CSC 113', prerequisites.data || [])) {
  // Allow registration
} else {
  const missing = getMissingPrerequisites(studentHistory, 'CSC 113', prerequisites.data || []);
  console.log(`Cannot register. Missing prerequisites: ${missing.join(', ')}`);
}
```

## Notes

1. **Course Status**: Currently, the system uses `student_enrollment.status = 'registered'` to determine passed courses. In production, implement a proper grades/completion tracking system.

2. **Performance**: The `check_course_prerequisites` function is optimized for performance. Use it when checking individual courses.

3. **RLS Policies**: Ensure Row Level Security policies are set up for `course_prerequisite` table to allow appropriate access.

4. **Data Integrity**: The `UNIQUE` constraint on `(course_code, prerequisite_course_code)` prevents duplicate prerequisites, and the `CHECK` constraint prevents self-referencing.

