# SWE Scheduling Scope Documentation

## Overview

The SmartSchedule system is designed to automatically schedule **SWE (Software Engineering) department courses in levels 4-8** using the constraint satisfaction algorithm. External department courses and lower-level SWE courses are **pre-scheduled** and serve as reference data.

## Scheduling Scope

### SWE Courses (Scheduled by Algorithm)

**Levels: 4-8** (Year 2 Semester 4 through Year 4 Semester 8)

These courses are managed by the automated scheduling system:

- **Level 4 (Year 2, Sem 4)**
  - SWE 211: Introduction to Software Engineering
  - SWE department electives

- **Level 5 (Year 3, Sem 5)**
  - SWE 314: Software Security Engineering
  - SWE 312: Software Requirements Engineering
  - SWE department electives

- **Level 6 (Year 3, Sem 6)**
  - SWE 381: Web Application Development
  - SWE 321: Software Design and Architecture
  - SWE 333: Software Quality Assurance
  - SWE department electives

- **Level 7 (Year 4, Sem 7)**
  - SWE 444: Software Construction Laboratory
  - SWE 434: Software Testing & Validation
  - SWE 496: Graduation Project I
  - SWE 477: Software Engineering Code of Ethics
  - SWE 482: Human-Computer Interaction
  - SWE 479: Practical Training
  - SWE department electives

- **Level 8 (Year 4, Sem 8)**
  - SWE 466: Software Project Management
  - SWE 455: Software Maintenance & Evolution
  - SWE 497: Graduation Project II
  - SWE department electives

### External Department Courses (Pre-scheduled/Reference)

**Levels: 1-8** (All levels)

These courses are NOT scheduled by the algorithm and appear as reference data:

#### Foundation Courses (Levels 1-3)
- **ENGL** - English Language courses
- **MATH** - Mathematics courses (Calculus, Discrete Math, Linear Algebra)
- **CHEM** - Chemistry
- **ARAB** - Arabic Writing Skills
- **ENT** - Entrepreneurship
- **STAT** - Statistics
- **EPH** - Physical Education
- **CT** - IT Skills
- **CUR** - University Skills
- **PHYS** - Physics
- **General Education** courses

#### Support Courses (Levels 4-8)
- **CSC** - Computer Science courses
- **CEN** - Computer Engineering/Networks
- **IS** - Information Systems
- **IC** - Islamic Culture/Contemporary Issues
- **Math/Statistics Electives**
- **Science Electives**

## Technical Implementation

### Course Filtering

Courses are identified as schedulable using the following criteria:

```typescript
function isSWESchedulableCourse(courseCode: string, level: number): boolean {
  return courseCode.startsWith('SWE') && level >= 4 && level <= 8
}
```

### Database Layer

**File: `lib/db/courses.ts`**

```typescript
// Get SWE courses for scheduling (levels 4-8)
export async function getSWECoursesForScheduling() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .gte('level', 4)
    .lte('level', 8)
    .ilike('code', 'SWE%')
    .order('level', { ascending: true })
  
  if (error) throw error
  return data as Course[]
}

// Get external department courses (non-SWE)
export async function getExternalCourses() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .not('code', 'ilike', 'SWE%')
    .order('level', { ascending: true })
  
  if (error) throw error
  return data as Course[]
}
```

**File: `lib/db/sections.ts`**

```typescript
// Get sections for SWE courses only (for scheduling algorithm)
export async function getSWESectionsForScheduling(state: 'draft' | 'released' = 'draft') {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('section')
    .select(`
      *,
      course:course!section_course_code_fkey(code, level)
    `)
    .eq('state', state)
  
  if (error) throw error
  
  // Filter to only SWE courses in levels 4-8
  const sweSections = (data || []).filter((section: any) => {
    const course = section.course
    return course && 
           course.code.startsWith('SWE') && 
           course.level >= 4 && 
           course.level <= 8
  })
  
  return sweSections as Section[]
}
```

### Scheduling Algorithm

**File: `app/api/scheduling/generate/route.ts`**

The scheduling API route filters sections before running the algorithm:

```typescript
// Fetch ONLY SWE course sections in levels 4-8 for scheduling
const { data: allSections, error: sectionsError } = await supabase
  .from("section")
  .select(`
    *,
    course:course!section_course_code_fkey(code, level)
  `)
  .eq("state", "draft")

// Filter to SWE courses in levels 4-8 only
const sections = (allSections || []).filter((section: any) => {
  const course = section.course
  return course && 
         course.code.startsWith('SWE') && 
         course.level >= 4 && 
         course.level <= 8
})

// Run scheduling algorithm on filtered sections
const result = await generateSchedule({
  sections: sections.map(...),
  rooms: rooms,
  timeGridConfig: config
})
```

## Student Schedule View

### Combined Display

Students see **both** SWE-scheduled and external courses in their schedule:

- **Blue Badge** - SWE courses scheduled by algorithm (levels 4-8)
- **Purple Badge** - External department courses (pre-scheduled)
- **Green Badge** - Elective courses (manually registered)

### Data Structure

**File: `lib/db/student-schedule.ts`**

Each section includes metadata:

```typescript
{
  id: string
  course_code: string
  course_title: string
  section_no: string
  credits: number
  is_elective: boolean
  is_enrolled: boolean
  is_swe_scheduled: boolean  // TRUE for SWE levels 4-8, FALSE for external
  instructor_name: string | null
  room_code: string | null
  meeting_pattern: {...}
  state: string
}
```

### Production Data

**File: `app/api/student/schedule/route.ts`**

The API returns real data from the database:

```typescript
// Fetch real schedule from database
const schedule = await getStudentSchedule(user.id);

// If no schedule data exists, return empty state with helpful message
if (!schedule || schedule.sections.length === 0) {
  return NextResponse.json({
    sections: [],
    total_credits: 0,
    is_empty: true,
    message: 'No schedule data available. Please contact your department administrator.',
    setup_required: true
  });
}
```

All data must be populated in the database before students can view their schedules.

## UI Components

### Course Table

**File: `components/courses-table.tsx`**

Shows scheduling method for each course:

- "SWE Algorithm" badge - Courses scheduled by the system
- "External/Manual" badge - Pre-scheduled courses

### Section Table

**File: `components/sections-table.tsx`**

Displays scheduling indicator:

- "Algorithm" badge - SWE sections in levels 4-8
- "Manual" badge - External or manually scheduled sections

### Student Schedule View

**File: `components/student-schedule-view.tsx`**

Color-coded schedule grid:

- **Blue** - SWE scheduled courses (algorithm)
- **Purple** - External department courses
- **Green** - Elective courses

## Study Plan Alignment

According to the SWE study plan:

### Levels 1-3 (Foundation)
All courses are external or introductory SWE courses. **Not scheduled by algorithm.**

Includes: ENGL, MATH, CHEM, ARAB, ENT, STAT, EPH, CT, CUR, PHYS, CSC 111, CSC 113, early SWE courses

### Levels 4-8 (Core SWE)
SWE courses begin with SWE 211 in Level 4. **Scheduled by algorithm.**

External support courses (CSC, CEN, IS, IC, Math electives) remain pre-scheduled.

## Workflow

### For Scheduling Committee

1. Create draft sections for SWE courses (levels 4-8)
2. Run scheduling algorithm via `/api/scheduling/generate`
3. System filters to SWE courses only
4. Algorithm assigns rooms and time slots
5. Review and release schedule
6. External courses remain unchanged

### For Students

1. View schedule at `/dashboard/schedule`
2. See combined view:
   - SWE courses (scheduled by system)
   - External courses (reference)
   - Registered electives
3. Register for elective sections
4. Print/export schedule

### For Faculty

1. View teaching assignments
2. SWE courses show as algorithm-scheduled
3. External courses show as pre-scheduled
4. Submit preferences for algorithm consideration

## Benefits

### Scalability
- Algorithm handles complex SWE scheduling
- External courses don't add computational overhead
- Clear separation of concerns

### Flexibility
- External departments manage their own schedules
- SWE department has automated support
- Easy to extend to other departments later

### Maintainability
- Single source of truth for all courses
- Clear labeling of scheduling responsibility
- Consistent database structure

## Future Enhancements

### Potential Additions
- Multi-department scheduling support
- Cross-department conflict detection
- Automated external course import
- Prerequisite chain visualization
- Department-specific scheduling rules

### Database Extensions
If needed, add a `department` column:

```sql
ALTER TABLE course ADD COLUMN department TEXT;
UPDATE course SET department = 'SWE' WHERE code LIKE 'SWE%';
UPDATE course SET department = 'CSC' WHERE code LIKE 'CSC%';
-- etc.
CREATE INDEX idx_course_department ON course(department);
```

This would allow more flexible querying:

```typescript
.eq('department', 'SWE')
.gte('level', 4)
.lte('level', 8)
```

## Related Documentation

- [PRD.md](mdc:PRD.md) - Product requirements
- [ROLE_IMPLEMENTATION_SUMMARY.md](mdc:src/docs/ROLE_IMPLEMENTATION_SUMMARY.md) - Role-based access
- [DATABASE_ARCHITECTURE.md](mdc:src/docs/DATABASE_ARCHITECTURE.md) - Database design (if exists)

## Summary

The SmartSchedule system focuses on **SWE courses in levels 4-8**, leveraging the constraint satisfaction algorithm for optimal scheduling. External department courses and foundation-level courses are maintained as reference data, providing students with a complete view of their academic schedule while keeping the scheduling algorithm focused and efficient.

