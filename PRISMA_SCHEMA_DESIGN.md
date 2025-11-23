# Prisma Schema Design Summary

**Date**: January 30, 2025  
**Status**: ✅ Complete - Ready for Migration

## Overview

This document summarizes the comprehensive Prisma schema design for SmartSchedule V1, migrated from Supabase SQL migrations to Prisma ORM.

## Key Design Decisions

### 1. Role-Specific Profile Tables
- **student_profile**: Student-specific data (level, student_group_id, department)
- **faculty_profile**: Faculty-specific data (preferences, availability, max load) - **replaces instructor table**
- **Committees** (scheduling, teaching_load, registrar): Use `user_roles` only (no separate profile tables)

### 2. Instructor/Faculty Linking
- **Fixed**: Changed from email-based matching to direct `user_id` FK
- **faculty_profile.user_id** → `user_roles.user_id` (1:1 relationship)
- **section.instructor_id** → `faculty_profile.user_id` (M:1 relationship)

### 3. Section States
- **section.state**: `draft` | `released` (for algorithm use)
- **academic_semesters.schedule_published**: Semester-level release flag
- Both are kept for flexibility

### 4. Prerequisites Tracking
- **course_prerequisite**: Many-to-many junction table
- **Validation**: Uses `student_enrollment` history (simplified for MVP)
- Student onboarding helps track completed courses

### 5. Exam Structure
- **Course-level**: Exams are linked to courses, not sections
- **Per student_group**: `exam.student_group_id` (NULL = all groups)
- **Conflict detection**: Application logic checks same-time + same-day conflicts
- **Max 2 exams per day**: Enforced in application logic

## Entity Relationship Diagram

```
auth.users (Supabase - not in Prisma)
    ↓
user_roles (role, name, email, onboarding_completed)
    ├─→ student_profile (level, student_group_id, department) [1:0..1]
    ├─→ faculty_profile (preferences, availability, max_load) [1:0..1]
    └─→ irregular_student (required_course_codes[]) [1:0..1]

academic_semesters
    ├─→ course_offering (course_code, semester_code) [M:N via junction]
    └─→ semester_timeline (events, dates) [1:M]

course
    ├─→ elective_group [M:1]
    ├─→ course_prerequisite [M:M via junction]
    ├─→ course_offering [M:N via junction]
    ├─→ section [1:M]
    └─→ exam [1:M]

section
    ├─→ course_offering [M:1] (links to semester)
    ├─→ faculty_profile [M:1] (instructor)
    ├─→ room [M:1]
    └─→ student_enrollment [1:M]

student_enrollment
    ├─→ student_profile.user_id [M:1]
    └─→ section [M:1]

student_group
    ├─→ student_profile [1:M] (via student_group_id)
    └─→ exam [1:M]

exam
    ├─→ course [M:1]
    └─→ student_group [M:0..1] (NULL = all groups)
```

## Schema Structure

### User & Role Management
- **UserRole**: Base role assignment (extends auth.users conceptually)
- **StudentProfile**: Student-specific academic data
- **FacultyProfile**: Faculty-specific preferences and availability

### Academic Structure
- **AcademicSemester**: Semester management with flags
- **SemesterTimeline**: Important dates and events
- **Course**: Course catalog
- **ElectiveGroup**: Elective categories (general, islamic culture, math, department)
- **CoursePrerequisite**: Many-to-many prerequisites
- **CourseOffering**: Links courses to semesters

### Scheduling Entities
- **Section**: Course sections (tied to semester via course_offering)
- **Room**: Physical rooms
- **StudentGroup**: Auto-managed groups by level
- **Exam**: Course-level exams (per student_group)
- **Rule**: Scheduling rules
- **TimeGridConfig**: Time grid configuration

### Enrollment & Student Entities
- **StudentEnrollment**: Student registrations (required + elective)
- **IrregularStudent**: Custom required course lists

### Communication Entities
- **ScheduleComment**: Unified comment system (all roles)
- **Notification**: In-app notifications

### Versioning (V2 - Reserved)
- **ScheduleDoc**: Schedule versioning (reserved for V2)

### Deprecated Tables
- **ElectivePreference**: Legacy preference ranking (replaced by student_enrollment)
- **Comment**: Legacy comment table (replaced by schedule_comment)

## Key Relationships

### 1. User → Profile (1:0..1)
- `user_roles.user_id` → `student_profile.user_id` (students only)
- `user_roles.user_id` → `faculty_profile.user_id` (faculty only)

### 2. Course → Section → Enrollment
- `course.code` → `section.course_code` (1:M)
- `section.id` → `student_enrollment.section_id` (1:M)
- `student_profile.user_id` → `student_enrollment.student_id` (1:M)

### 3. Semester → Course Offering → Section
- `academic_semesters.code` → `course_offering.semester_code` (1:M)
- `course.code` → `course_offering.course_code` (1:M)
- `course_offering.id` → `section.course_offering_id` (1:M)

### 4. Faculty → Section
- `faculty_profile.user_id` → `section.instructor_id` (1:M)

### 5. Exam → Course → Student Group
- `course.code` → `exam.course_code` (1:M)
- `student_group.id` → `exam.student_group_id` (1:0..M, NULL = all groups)

## Indexes

All foreign keys and frequently queried columns are indexed:
- User roles by role
- Courses by level, is_elective, elective_group_id
- Sections by course_code, instructor_id, state, group_level, is_scheduled_by_algorithm
- Student enrollments by student_id, section_id, status (with partial indexes)
- Exams by course_code, date, student_group_id
- And more...

## Constraints

### Check Constraints
- `student_profile.level`: 1-8
- `student_group.level`: 1-8
- `section.group_level`: 1-8
- `course.level`: 1-8
- `student_enrollment.enrollment_type`: 'required' | 'elective'
- `academic_semesters.type`: 'FALL' | 'SPRING' | 'SUMMER'

### Unique Constraints
- `user_roles.user_id` (PK)
- `student_profile.user_id` (PK, 1:1 with user_roles)
- `faculty_profile.user_id` (PK, 1:1 with user_roles)
- `irregular_student.student_id` (unique)
- `course.code` (PK)
- `section.course_code + section_no` (unique)
- `course_offering.course_code + semester_code` (unique)
- `student_enrollment.student_id + section_id` (unique)
- `course_prerequisite.course_code + prerequisite_code` (unique)

## Migration Notes

### Breaking Changes from Supabase Schema

1. **instructor table → faculty_profile table**
   - All `instructor` references must be updated to `faculty_profile`
   - `instructor.id` → `faculty_profile.user_id` (now PK, not separate UUID)
   - `section.instructor_id` now references `faculty_profile.user_id`

2. **Email-based linking removed**
   - Previously: `instructor.email` matched `user_roles.email`
   - Now: Direct FK `faculty_profile.user_id` → `user_roles.user_id`

3. **Exam table changes**
   - `section_id` removed (exams are course-level only)
   - `student_group_id` added (exams can be per group or all groups)

4. **Student profile separation**
   - `user_roles.level` moved to `student_profile.level`
   - `user_roles.student_group_id` moved to `student_profile.student_group_id`

### Data Migration Required

1. **Migrate instructor data to faculty_profile**
   ```sql
   INSERT INTO faculty_profile (user_id, preferred_times, unavailable_times, max_load_per_week)
   SELECT ur.user_id, i.preferred_times, i.unavailable_times, i.max_load_per_week
   FROM instructor i
   JOIN user_roles ur ON i.email = ur.email
   WHERE ur.role = 'faculty';
   ```

2. **Update section.instructor_id references**
   ```sql
   UPDATE section s
   SET instructor_id = fp.user_id
   FROM instructor i
   JOIN faculty_profile fp ON i.email = (SELECT email FROM user_roles WHERE user_id = fp.user_id)
   WHERE s.instructor_id = i.id;
   ```

3. **Migrate student level data**
   ```sql
   -- Already done in student_profile migration
   -- Verify all students have profiles
   ```

## Next Steps

1. **Review schema** with team
2. **Generate Prisma Client**: `npx prisma generate`
3. **Create migration**: `npx prisma migrate dev --name initial_schema`
4. **Test relationships** and constraints
5. **Update application code** to use Prisma Client
6. **Migrate data** from Supabase to Prisma-managed database

## Validation Checklist

- [x] All entities from Supabase migrations included
- [x] Role-specific profile tables created
- [x] Instructor table replaced with faculty_profile
- [x] All foreign keys properly defined
- [x] All indexes included
- [x] All constraints included
- [x] Exam structure matches requirements (course-level, per student_group)
- [x] Prerequisites table included
- [x] Elective groups table included
- [x] Multi-semester support (academic_semesters, course_offering)
- [x] Irregular students table included
- [x] Deprecated tables marked but kept for migration

## Related Documentation

- [PRD.md](PRD.md) - Product requirements
- [SWE_SCHEDULING_SCOPE.md](src/docs/SWE_SCHEDULING_SCOPE.md) - Scheduling scope
- [ROLE_IMPLEMENTATION_SUMMARY.md](src/docs/ROLE_IMPLEMENTATION_SUMMARY.md) - Role system
- Supabase migrations in `supabase/migrations/`

