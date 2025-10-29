# SmartSchedule V1 - Developer Quick Start Guide

## 🚀 Getting Started with the New Data Model

This guide helps developers quickly understand and work with the new SmartSchedule data model.

## Core Concepts (5-Minute Overview)

### 1. Everything Lives in a Semester
```typescript
// Always query with semester context
const currentSemester = await getCurrentSemester();
const sections = await getSections({ semester_id: currentSemester.id });
```

### 2. Dual Enrollment Model
```typescript
// Two separate but related concepts:

// A. Course Enrollment (Academic Record)
// "I'm taking CS301 in Fall 2025"
const enrollment = {
  student_id: userId,
  course_code: 'CS301',
  academic_semester_id: semesterId,
  enrollment_type: 'elective',
  status: 'enrolled'
};

// B. Section Assignment (Scheduling Detail)
// "I attend CS301-01 lecture on Sunday/Tuesday at 10:00"
const assignment = {
  course_enrollment_id: enrollment.id,
  section_id: sectionId,
  assignment_type: 'lecture'
};

// One enrollment can have multiple assignments (lecture + lab)
```

### 3. Survey-Driven Planning
```typescript
// Two survey types per semester:

// Elective Survey (Students)
await submitElectivePreference({
  course_code: 'CS304',
  rank: 1,
  reason: 'Interested in machine learning'
});

// Availability Survey (Faculty)
await updateInstructorAvailability({
  preferred_times: [{ day: 'Sunday', start: '10:00', end: '12:00' }],
  unavailable_times: [{ day: 'Thursday', start: '14:00', end: '16:00' }]
});
```

### 4. Intelligent Section Auto-Creation
```typescript
// Scheduling committee triggers this
const result = await autoCreateSections(semesterId, courseCode);
// Creates optimal sections: min 15, default 25, smart merging
// Example: 30 students → 1 section (30 capacity)
//          80 students → 3 sections (27, 27, 26 capacities)
```

## Common Developer Tasks

### Task 1: Query Student Schedule
```typescript
import { getStudentSchedule } from '@/lib/db/schedules';

// Get student's schedule for current semester
const schedule = await getStudentSchedule(studentId);

// Get for specific semester
const fallSchedule = await getStudentSchedule(studentId, semesterId);

// Returns:
// {
//   enrollment_id, course_code, course_name, credits,
//   sections: [
//     { section_id, section_no, type, instructor, room, meeting_pattern }
//   ]
// }
```

### Task 2: Enroll Student in Section
```typescript
import { assignStudentToSection } from '@/lib/db/enrollments';

// Validate and enroll
const result = await assignStudentToSection(
  studentId,
  sectionId,
  'elective' // or 'required'
);

// Function automatically:
// - Validates credits limit
// - Checks section capacity
// - Verifies level match
// - Creates course_enrollment (if needed)
// - Creates section_assignment
// - Updates cached enrollment count
```

### Task 3: Drop a Section
```typescript
import { dropSection } from '@/lib/db/enrollments';

const result = await dropSection(studentId, sectionId);

// Automatically:
// - Removes section_assignment
// - Marks enrollment as 'dropped' if no other sections
// - Updates cached counts
```

### Task 4: Check Enrollment Validation
```typescript
import { validateEnrollment } from '@/lib/db/enrollments';

const validation = await validateEnrollment(studentId, sectionId);

// Returns:
// { valid: true/false, error?: string, ... }
// Checks: credits, capacity, level, conflicts
```

### Task 5: Calculate Instructor Load
```typescript
import { calculateInstructorLoad } from '@/lib/db/instructors';

const load = await calculateInstructorLoad(instructorId, semesterId);

// Returns:
// {
//   instructor_id,
//   total_weekly_hours, // Calculated from meeting patterns
//   sections: [{ section_id, course_code, weekly_hours }]
// }
```

### Task 6: Auto-Create Sections
```typescript
import { autoCreateSections } from '@/lib/db/sections';

// For one course
const result = await autoCreateSections(semesterId, 'CS301');

// For all courses
const allResults = await autoCreateAllSections(semesterId);

// Returns section count and capacities created
```

### Task 7: Manage Surveys
```typescript
import { openSurvey, closeSurvey } from '@/lib/db/surveys';

// Open elective survey
await openSurvey(surveyPeriodId);

// Students can now submit preferences
// Check eligibility
const eligible = await checkSurveyEligibility(
  userId,
  'elective_survey',
  semesterId
);

// Close survey
await closeSurvey(surveyPeriodId);
```

### Task 8: Get Current Semester
```typescript
import { getCurrentSemester } from '@/lib/db/semesters';

const semester = await getCurrentSemester();
// Use this ID for all semester-specific queries
```

### Task 9: Archive Semester
```typescript
import { archiveSemester } from '@/lib/db/semesters';

await archiveSemester(semesterId);
// Sets status='archived', is_current=false
// Historical data preserved
```

## Database Function Reference

### Quick Function Lookup

| Function | Purpose | Example |
|----------|---------|---------|
| `get_current_semester()` | Get active semester | `SELECT get_current_semester()` |
| `assign_student_to_section()` | Enroll student | `SELECT assign_student_to_section('uuid', 'uuid', 'elective')` |
| `drop_section()` | Drop enrollment | `SELECT drop_section('student-uuid', 'section-uuid')` |
| `validate_enrollment()` | Check if can enroll | `SELECT validate_enrollment('student-uuid', 'section-uuid')` |
| `auto_create_sections()` | Create sections | `SELECT auto_create_sections('semester-uuid', 'CS301')` |
| `calculate_instructor_load()` | Get teaching hours | `SELECT calculate_instructor_load('instructor-uuid', 'semester-uuid')` |
| `get_student_schedule()` | Get schedule | `SELECT get_student_schedule('student-uuid', 'semester-uuid')` |
| `get_section_roster()` | List students | `SELECT get_section_roster('section-uuid')` |

## API Endpoint Patterns

### Recommended API Structure

```typescript
// GET /api/semesters/current
// Returns current semester

// GET /api/students/me/schedule?semester_id=xxx
// Student's schedule

// POST /api/enrollments
// Body: { section_id, enrollment_type }
// Enroll in section

// DELETE /api/enrollments/:enrollment_id/sections/:section_id
// Drop section

// POST /api/semesters/:id/generate-sections
// Trigger auto-creation (scheduling only)

// POST /api/survey-periods/:id/open
// Open survey (scheduling only)

// POST /api/survey-periods/:id/close
// Close survey (scheduling only)

// GET /api/sections?semester_id=xxx&level=2
// List available sections

// GET /api/instructors/:id/load?semester_id=xxx
// Instructor teaching load

// GET /api/semesters/:id/conflicts
// All conflicts for semester
```

## Common Patterns

### Pattern 1: Semester Context Provider (React)
```typescript
// Create a semester context
const SemesterContext = createContext<Semester | null>(null);

export function SemesterProvider({ children }) {
  const [semester, setSemester] = useState<Semester | null>(null);
  
  useEffect(() => {
    getCurrentSemester().then(setSemester);
  }, []);
  
  return (
    <SemesterContext.Provider value={semester}>
      {children}
    </SemesterContext.Provider>
  );
}

// Use in components
const semester = useContext(SemesterContext);
```

### Pattern 2: Query with Semester Filter
```typescript
// Always include semester in queries
const { data: sections } = useQuery({
  queryKey: ['sections', semesterId, level],
  queryFn: () => getSections({ semester_id: semesterId, level })
});
```

### Pattern 3: Enrollment Validation Hook
```typescript
function useEnrollmentValidation(sectionId: string) {
  return useQuery({
    queryKey: ['validate-enrollment', sectionId],
    queryFn: () => validateEnrollment(userId, sectionId),
    enabled: !!sectionId
  });
}

// In component
const { data: validation } = useEnrollmentValidation(selectedSectionId);
if (validation?.valid) {
  // Show enroll button
}
```

### Pattern 4: Survey Status Check
```typescript
function useSurveyStatus(surveyType: 'elective_survey' | 'availability_survey') {
  return useQuery({
    queryKey: ['survey-status', surveyType, semesterId],
    queryFn: () => checkSurveyEligibility(userId, surveyType, semesterId)
  });
}

// In component
const { data: surveyStatus } = useSurveyStatus('elective_survey');
if (surveyStatus?.eligible) {
  // Show survey form
}
```

## Type Definitions (Quick Reference)

```typescript
// Core Types
type Semester = {
  id: string;
  name: string;
  code: string;
  status: 'planning' | 'registration_open' | 'active' | 'completed' | 'archived';
  is_current: boolean;
  registration_start_date: string;
  registration_end_date: string;
  add_drop_deadline: string;
};

type CourseEnrollment = {
  id: string;
  student_id: string;
  course_code: string;
  academic_semester_id: string;
  enrollment_type: 'required' | 'elective' | 'retake';
  status: 'enrolled' | 'dropped' | 'completed' | 'failed' | 'withdrawn';
  enrolled_at: string;
  dropped_at?: string;
  grade?: string;
  credits_earned?: number;
};

type SectionAssignment = {
  id: string;
  course_enrollment_id: string;
  section_id: string;
  assignment_type: 'lecture' | 'lab' | 'tutorial';
  assigned_at: string;
};

type StudentProfile = {
  user_id: string;
  student_id: string;
  current_level: number; // 1-5
  enrollment_year: number;
  expected_graduation_year: number;
  academic_status: 'active' | 'probation' | 'suspended' | 'graduated' | 'withdrawn';
  max_credits_allowed: number;
};

type SurveyPeriod = {
  id: string;
  academic_semester_id: string;
  survey_type: 'elective_survey' | 'availability_survey';
  status: 'draft' | 'open' | 'closed';
  start_date?: string;
  end_date?: string;
};
```

## Debugging Tips

### Check Current Semester
```sql
SELECT * FROM academic_semester WHERE is_current = true;
```

### Verify Student Enrollments
```sql
SELECT ce.*, c.name, c.credits
FROM course_enrollment ce
JOIN course c ON c.code = ce.course_code
WHERE ce.student_id = 'student-uuid'
  AND ce.academic_semester_id = 'semester-uuid';
```

### Check Section Assignments
```sql
SELECT sa.*, s.section_no, s.meeting_pattern
FROM section_assignment sa
JOIN section s ON s.id = sa.section_id
WHERE sa.course_enrollment_id = 'enrollment-uuid';
```

### Verify Section Capacities
```sql
SELECT 
  s.id,
  s.course_code,
  s.section_no,
  s.capacity,
  s.current_enrollment,
  (s.capacity - s.current_enrollment) as available_seats
FROM section s
WHERE s.academic_semester_id = 'semester-uuid'
ORDER BY s.course_code, s.section_no;
```

### Check Survey Status
```sql
SELECT * FROM survey_period
WHERE academic_semester_id = 'semester-uuid'
ORDER BY created_at DESC;
```

## Gotchas & Common Mistakes

### ❌ Mistake 1: Forgetting Semester Context
```typescript
// BAD: No semester filter
const sections = await db.from('section').select('*');

// GOOD: Always filter by semester
const sections = await db
  .from('section')
  .select('*')
  .eq('academic_semester_id', semesterId);
```

### ❌ Mistake 2: Creating Enrollment Without Section Assignment
```typescript
// BAD: Manual enrollment creation
await db.from('course_enrollment').insert({ ... });

// GOOD: Use function that handles both
await assignStudentToSection(studentId, sectionId, 'elective');
```

### ❌ Mistake 3: Not Checking Survey Status
```typescript
// BAD: Allow submission anytime
await db.from('elective_preference').insert({ ... });

// GOOD: Check eligibility first
const eligible = await checkSurveyEligibility(userId, 'elective_survey', semesterId);
if (eligible.eligible) {
  await db.from('elective_preference').insert({ ... });
}
```

### ❌ Mistake 4: Querying Exams by Section
```typescript
// BAD: Exams are no longer section-specific
const exams = await db.from('exam').eq('section_id', sectionId);

// GOOD: Exams are course-level
const exams = await db.from('exam')
  .eq('course_code', courseCode)
  .eq('academic_semester_id', semesterId);
```

### ❌ Mistake 5: Not Using Validation Function
```typescript
// BAD: Manual capacity check
if (section.current_enrollment < section.capacity) {
  // enroll
}

// GOOD: Use comprehensive validation
const validation = await validateEnrollment(studentId, sectionId);
if (validation.valid) {
  // enroll
}
// Checks: capacity, credits, level, conflicts
```

## Performance Tips

1. **Use cached enrollment counts**: `section.current_enrollment` is maintained via triggers
2. **Batch semester queries**: Fetch semester once, reuse ID
3. **Index on semester_id**: Already indexed in migrations
4. **Use RLS policies**: Let database handle permission filtering
5. **Leverage database functions**: They're optimized and tested

## Testing Checklist

- [ ] Create test semester
- [ ] Create test student profiles
- [ ] Test enrollment flow (validate → assign → verify)
- [ ] Test drop flow
- [ ] Test section auto-creation
- [ ] Test survey open/close
- [ ] Test credit limit validation
- [ ] Test section capacity limits
- [ ] Test conflict detection
- [ ] Test instructor load calculation
- [ ] Test semester archiving

## Migration Deployment

See `supabase/migrations/README.md` for detailed deployment instructions.

Quick steps:
1. Backup database
2. Run migrations 000-018 in order
3. Create initial semester
4. Verify student data migration
5. Test key functions

## Additional Resources

- **Full Architecture**: `data-model-architecture.plan.md`
- **Migration Guide**: `supabase/migrations/README.md`
- **Implementation Summary**: `DATA_MODEL_IMPLEMENTATION_SUMMARY.md`
- **Product Requirements**: `PRD.md`

---

**Questions?** Check the comprehensive docs or database function comments!

