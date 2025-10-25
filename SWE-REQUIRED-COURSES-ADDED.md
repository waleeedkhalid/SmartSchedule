# SWE Required Courses Added to Database

## Overview
Added all 39 required courses from the Software Engineering study plan to the Supabase database.

## Migration
**Migration Name**: `add_swe_required_courses`

## Courses Added by Level

### Level 1 (Semester 1) - 5 Courses, 16 Credits
- **ARAB100** - Writing Skills (2 CH)
- **CHEM101** - General Chemistry (1) (4 CH)
- **ENGL100** - English Language (6 CH)
- **ENT101** - Entrepreneurship (1 CH)
- **MATH101** - Differential Calculus (3 CH)

### Level 2 (Semester 2) - 5 Courses, 16 Credits
- **CT101** - IT Skills (3 CH)
- **CUR101** - University Skills (3 CH)
- **ENGL110** - English (6 CH) - *Prerequisite: ENGL100*
- **EPH101** - Fitness and Health Education (1 CH)
- **STAT101** - An Introduction to Probability & Statistics (3 CH)

### Level 3 (Semester 3) - 4 Courses, 14 Credits
- **CSC111** - Computer Programming I (4 CH) - *Prerequisite: CT101*
- **MATH106** - Integral Calculus (3 CH) - *Prerequisite: MATH101*
- **MATH151** - Discrete Mathematics (3 CH) - *Prerequisite: MATH101*
- **PHYS103** - General Physics I (4 CH)

### Level 4 (Semester 4) - 5 Courses, 17 Credits
- **CEN303** - Computer Communications and Networks (3 CH)
- **CSC113** - Computer Programming II (4 CH) - *Prerequisite: CSC111*
- **MATH244** - Linear Algebra (3 CH) - *Prerequisite: MATH106*
- **PHYS104** - General Physics II (4 CH) - *Prerequisite: PHYS103*
- **SWE211** - Introduction to Software Engineering (3 CH) - *Prerequisites: MATH151, CSC111*

### Level 5 (Semester 5) - 4 Courses, 12 Credits
- **CSC212** - Data Structures (3 CH) - *Prerequisite: CSC113*
- **CSC220** - Computer Organization (3 CH) - *Prerequisite: CSC111*
- **SWE312** - Software Requirements Engineering (3 CH) - *Prerequisites: CSC113, SWE211*
- **SWE314** - Software Security Engineering (3 CH) - *Prerequisite: CEN303*

### Level 6 (Semester 6) - 5 Courses, 14 Credits
- **CSC227** - Operation Systems (3 CH) - *Prerequisites: CSC212, CSC220*
- **IS230** - Introduction to Database Systems (3 CH) - *Prerequisite: CSC212*
- **SWE321** - Software Design and Architecture (3 CH) - *Prerequisites: SWE312, SWE314*
- **SWE333** - Software Quality Assurance (2 CH) - *Prerequisite: SWE312*
- **SWE381** - Web Application Development (3 CH) - *Prerequisite: SWE211*

### Level 7 (Semester 7) - 7 Courses, 16 Credits
- **IC107** - Professional Ethics (2 CH)
- **SWE434** - Software Testing & Validation (3 CH) - *Prerequisite: SWE333*
- **SWE444** - Software Construction Laboratory (2 CH) - *Prerequisites: SWE321, SWE333*
- **SWE477** - Software Engineering Code of Ethics & Professional Practice (2 CH) - *Requires 95 CH Passed*
- **SWE479** - Practical Training (1 CH) - *Requires 95 CH Passed*
- **SWE482** - Human-Computer Interaction (3 CH) - *Prerequisite: SWE381*
- **SWE496** - Graduation Project I (3 CH) - *Prerequisites: SWE321, Requires 95 CH Passed*

### Level 8 (Semester 8) - 4 Courses, 10 Credits
- **IC108** - Contemporary Issues (2 CH)
- **SWE455** - Software Maintenance & Evolution (2 CH) - *Prerequisite: SWE434*
- **SWE466** - Software Project Management (3 CH) - *Prerequisite: SWE333*
- **SWE497** - Graduation Project II (3 CH) - *Prerequisite: SWE496*

## Summary Statistics

| Category | Count | Total Credits |
|----------|-------|---------------|
| **Total Required Courses** | 39 | 115 CH |
| **SWE-Managed Courses** | 17 | 42 CH |
| **Non-SWE Courses** | 22 | 73 CH |

### By Department
- **SWE**: 17 courses
- **CSC**: 6 courses
- **MATH**: 4 courses
- **ENGL**: 2 courses
- **PHYS**: 2 courses
- **IC**: 2 courses
- **CEN**: 1 course
- **IS**: 1 course
- **CT**: 1 course
- **CUR**: 1 course
- **STAT**: 1 course
- **EPH**: 1 course
- **CHEM**: 1 course
- **ARAB**: 1 course
- **ENT**: 1 course

## Database Configuration

All courses were inserted with:
- `type`: 'REQUIRED'
- `level`: 1-8 (based on semester)
- `prerequisites`: Array of prerequisite course codes
- `is_swe_managed`: true for SWE department courses, false for others
- `ON CONFLICT` clause to update existing courses if they exist

## Integration with Student Counts API

The `get_course_enrollment_stats` function now correctly:
1. Counts students at each level for required courses
2. Calculates sections needed based on active students
3. Returns comprehensive statistics for schedule planning

## Next Steps

The system is now ready to:
1. Track student enrollments for required courses
2. Generate schedules based on level-specific requirements
3. Calculate capacity and section needs automatically
4. Support prerequisite validation

## Related Documents
- [Student Counts API Implementation](./STUDENT-COUNTS-API-IMPLEMENTATION.md)
- Study Plan: Software Engineering (4 years, 8 semesters)

