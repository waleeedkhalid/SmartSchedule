# SWE Study Plan Courses Migration Summary

**Date:** October 29, 2025  
**Migration File:** `supabase/migrations/20251029140000_populate_swe_study_plan.sql`

## Overview

Successfully migrated the system to use ONLY the courses from the SWE study plan (`swe_plan.json`). This migration removed all existing courses and established a new course catalog with elective group structure and prerequisite tracking.

## What Was Done

### 1. Database Schema Changes

#### New Tables Created

**`elective_group`**
- Stores elective group definitions (Department, Math/Stats, General Science, University Requirements)
- Fields: `id`, `name`, `required_credit_hours`, `description`, `created_at`, `updated_at`
- RLS policies: Everyone can read, only scheduling/registrar can manage

**`course_prerequisite`**
- Junction table for many-to-many prerequisite relationships
- Fields: `id`, `course_code`, `prerequisite_code`, `created_at`
- RLS policies: Everyone can read, only scheduling/registrar can manage

#### Modified Tables

**`course`**
- Added column: `elective_group_id` (UUID, nullable)
- Updated level constraint from (1-5) to (0-8) to accommodate all levels

**`student_group` and `section`**
- Updated level constraints to allow levels 1-8

### 2. Course Data Inserted

#### Required Courses (38 total)

| Level | Count | Example Courses |
|-------|-------|----------------|
| 1 | 5 | ENGL 100, MATH 101, CHEM 101, ARAB 100, ENT 101 |
| 2 | 5 | STAT 101, EPH 101, CT 101, CUR 101, ENGL 110 |
| 3 | 4 | CSC 111, MATH 106, MATH 151, PHYS 103 |
| 4 | 5 | SWE 211, CSC 113, MATH 244, CEN 303, PHYS 104 |
| 5 | 4 | SWE 314, SWE 312, CSC 212, CSC 220 |
| 6 | 5 | SWE 381, SWE 321, SWE 333, IS 230, CSC 227 |
| 7 | 6 | SWE 444, SWE 434, SWE 496, SWE 477, SWE 482, IC 107 |
| 8 | 4 | SWE 466, SWE 455, SWE 497, IC 108 |

#### Elective Courses (33 total)

| Elective Group | Required Credits | Course Count | Example Courses |
|----------------|-----------------|--------------|----------------|
| Department Electives | 9 | 16 | SWE 481, SWE 483, SWE 484, CSC 311, CSC 361 |
| Math and Statistics Electives | 6 | 3 | MATH 200, MATH 254, OPER 122 |
| General Science Electives | 3 | 5 | BIOL 145, BCH 101, MIC 140, PHYS 201 |
| University Requirements Electives | 4 | 9 | QURN 100, IC 100-106, IC 109 |

**Total Courses:** 71 (38 required + 33 electives)

### 3. Prerequisite Relationships

Inserted prerequisite relationships for all courses that have them. Examples:
- `SWE 211` requires `MATH 151` AND `CSC 111`
- `SWE 321` requires `SWE 312` AND `SWE 314`
- `CSC 227` requires `CSC 212` AND `CSC 220`
- And many more...

Total prerequisite relationships: ~40 entries

### 4. Database Access Layer

Created new database access modules:

#### `lib/db/elective-groups.ts`
Functions for managing elective groups:
- `getElectiveGroups()` - Get all elective groups
- `getElectiveGroupWithCourses()` - Get group with its courses
- `getAllElectiveGroupsWithCourses()` - Get all groups with courses
- `getElectiveCoursesByGroupName()` - Get courses by group name
- `getStudentElectiveProgress()` - Calculate student progress in each group

#### `lib/db/prerequisites.ts`
Functions for managing prerequisites:
- `getCoursePrerequisites()` - Get prerequisites for a course
- `getCourseDependents()` - Get courses that depend on this course
- `checkStudentPrerequisites()` - Check if student has completed prerequisites
- `getAllCoursesWithPrerequisites()` - Get all courses with their prereqs
- `getAvailableCoursesForStudent()` - Get courses student can take
- `getPrerequisiteChain()` - Get full prerequisite chain recursively
- `addPrerequisite()` / `removePrerequisite()` - Manage prerequisites

#### `lib/db/courses.ts` (updated)
Added new functions:
- `getCoursesWithElectiveGroups()` - Get courses with group info
- `getCoursesByElectiveGroup()` - Get courses in a specific group
- `getRequiredCoursesByLevel()` - Get required courses for a level

### 5. TypeScript Types

Regenerated `lib/types/database.ts` to include new tables and columns.

## Verification

### Expected Counts

Run these queries in Supabase Studio to verify:

```sql
-- Total courses
SELECT COUNT(*) FROM course;
-- Expected: 71

-- Required courses
SELECT COUNT(*) FROM course WHERE is_elective = false;
-- Expected: 38

-- Elective courses
SELECT COUNT(*) FROM course WHERE is_elective = true;
-- Expected: 33

-- Elective groups
SELECT COUNT(*) FROM elective_group;
-- Expected: 4

-- Prerequisite relationships
SELECT COUNT(*) FROM course_prerequisite;
-- Expected: ~40

-- Courses by level
SELECT level, COUNT(*) 
FROM course 
WHERE is_elective = false 
GROUP BY level 
ORDER BY level;
-- Should show distribution across levels 1-8
```

### Testing Checklist

- [x] Migration applied successfully without errors
- [x] TypeScript types regenerated
- [x] New tables created with proper RLS policies
- [x] All 71 courses inserted
- [x] 4 elective groups created
- [x] Prerequisite relationships established
- [x] Database access functions created
- [x] No linter errors in new code
- [ ] Test prerequisite checking functions
- [ ] Test elective group progress tracking
- [ ] Verify RLS policies prevent unauthorized modifications

## Important Notes

### Destructive Changes

⚠️ **This migration deletes ALL existing course data**, including:
- All courses
- All sections
- All exams
- All student enrollments
- All elective preferences
- All elective comments

### Level System Update

The system now supports levels 1-8 instead of 1-5. This accommodates:
- Levels 1-3: Foundation and general education
- Levels 4-8: Core SWE program courses

### Elective System

Students must fulfill credit requirements from each elective group:
- **9 credits** from Department Electives
- **6 credits** from Math and Statistics Electives
- **3 credits** from General Science Electives
- **4 credits** from University Requirements Electives

**Total elective credits required:** 22 credits  
**Total required course credits:** Based on sum of all required courses  
**Total program credits:** 137 credits (as specified in swe_plan.json)

## Next Steps

### For Development

1. Update UI components to show elective groups
2. Implement prerequisite checking in course registration
3. Add student progress tracking for elective requirements
4. Update scheduling algorithm to handle new course structure
5. Test with various student scenarios

### For Production Deployment

1. Backup existing course data (if needed for reference)
2. Review migration thoroughly
3. Test on staging environment first
4. Apply migration during maintenance window
5. Verify all data integrity checks pass
6. Update any external documentation

## Files Modified/Created

### Migration
- `supabase/migrations/20251029140000_populate_swe_study_plan.sql`

### Database Access Layer
- `lib/db/elective-groups.ts` (new)
- `lib/db/prerequisites.ts` (new)
- `lib/db/courses.ts` (updated)

### Types
- `lib/types/database.ts` (regenerated)

### Documentation
- `src/docs/SWE_COURSES_MIGRATION_SUMMARY.md` (this file)

## References

- Source data: `swe_plan.json`
- Total credit hours: 137
- Program: Software Engineering (SWE)
- Levels: 8 levels
- Elective groups: 4 groups with varying credit requirements

