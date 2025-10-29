# External Departments Integration - Files to Update

This document lists all files in the codebase that need to be reviewed and potentially updated after importing external departments data.

**Migration File**: `supabase/migrations/20251029141000_import_external_departments_data.sql`

## Summary of Changes

- ✅ **35 courses** added from 11 external departments
- ✅ **35 instructors** added
- ✅ **59 rooms** added (lecture halls and labs only - no capacity/equipment stored)
- ✅ **90+ sections** created with section groups (capacity managed at section level)
- ✅ **100+ exams** scheduled (course-level, unified for all sections)
- ✅ **19 course prerequisites** defined

---

## 🔴 HIGH PRIORITY - Must Update

### 1. Database Access Layer (`lib/db/`)

#### ✏️ **lib/db/courses.ts**
- **Why**: Need to handle external department courses alongside SWE courses
- **What to add**:
  - Filter courses by department (external vs SWE)
  - Handle elective courses (level = 0)
  - Support prerequisite display
- **Functions to review**:
  - `getCoursesPaginated()` - ensure it shows external courses
  - `getCourseByCode()` - works with external course codes
  - `getElectiveCourses()` - returns all elective courses (level = 0)

#### ✏️ **lib/db/sections.ts**
- **Why**: Section groups are now multi-part (lecture + tutorial + lab)
- **What to add**:
  - Group sections by `group_level` for student registration
  - Display section types (L, T, B suffixes)
  - Handle sections with same `section_no` prefix but different types
- **Functions to review**:
  - `getSectionsByCourse()` - group by section groups
  - `createSection()` - validate section group structure
  - Any functions that display section lists

#### ✏️ **lib/db/exams.ts**
- **Why**: Course-level exams are now unified (section_id = NULL)
- **What to add**:
  - Fetch exams where `section_id IS NULL` for course-level exams
  - Support multiple exam rooms (array field)
  - Handle courses with 2-3 exams (midterm, midterm2, final)
- **Functions to review**:
  - `getExamsByCourse()` - fetch course-level exams
  - `getExamSchedule()` - show all student exams
  - `detectExamConflicts()` - check course-level conflicts

#### ✏️ **lib/db/instructors.ts**
- **Why**: 35 new external instructors added
- **What to verify**:
  - Instructor listing includes external faculty
  - Workload calculations include external courses
- **Functions to review**:
  - `getInstructors()` - returns all instructors
  - `getInstructorLoad()` - calculates teaching load correctly

#### ✏️ **lib/db/rooms.ts**
- **Why**: 59 new rooms added (lecture halls and labs)
- **What to verify**:
  - Room listing includes external department rooms
  - Rooms are categorized as 'Lecture' or 'Lab' (room_type enum)
  - **Note**: Room capacity is NOT stored in the room table - it's managed at the section level
- **Functions to review**:
  - `getRooms()` - returns all rooms
  - `getRoomsByType()` - filter by room type
  - `getAvailableRooms()` - considers all rooms (don't filter by capacity, check section capacity instead)

---

### 2. API Routes (`app/api/`)

#### ✏️ **app/api/courses/route.ts**
- **Why**: External courses need to be included in API responses
- **What to verify**:
  - GET endpoint returns external courses
  - Filters work for department, level, electives
- **Test cases**:
  - `/api/courses` - should include all courses
  - `/api/courses?is_elective=true` - should include external electives
  - `/api/courses?level=4` - should include MATH 244, CSC 113, etc.

#### ✏️ **app/api/sections/route.ts**
- **Why**: Section groups need special handling
- **What to add**:
  - Group sections by `group_level` and `section_no` prefix
  - Return section types (lecture, tutorial, lab)
- **Test cases**:
  - `/api/sections?course_code=CSC 113` - should return 3 sections (01L, 01T, 01B)

#### ✏️ **app/api/exams/route.ts**
- **Why**: Course-level exams are structured differently
- **What to verify**:
  - Fetch exams where `section_id IS NULL`
  - Handle multiple exam rooms
  - Return midterm, midterm2, final for 3-credit courses

---

### 3. Dashboard Pages (`app/(dashboard)/dashboard/`)

#### ✏️ **app/(dashboard)/dashboard/courses/page.tsx**
- **Why**: Should display all courses including external departments
- **What to add**:
  - Department filter/grouping
  - Prerequisite display
  - Elective badge for elective courses
- **Visual updates**:
  - Add "Department" column
  - Show prerequisites as chips/tags
  - Highlight elective courses

#### ✏️ **app/(dashboard)/dashboard/sections/page.tsx**
- **Why**: Section groups need visual representation
- **What to add**:
  - Group sections visually (e.g., collapsible groups)
  - Section type badges (Lecture, Tutorial, Lab)
  - Indicate which sections students register as a group
- **Visual updates**:
  - Nested table or cards for section groups
  - Color coding for section types

#### ✏️ **app/(dashboard)/dashboard/exams/page.tsx**
- **Why**: Unified course-level exams need clear display
- **What to add**:
  - Show exam applies to "All Sections"
  - Display multiple exam rooms
  - Handle courses with 2-3 exams
- **Visual updates**:
  - "Unified" badge for course-level exams
  - List multiple rooms clearly

#### ✏️ **app/(dashboard)/dashboard/student/schedule/page.tsx**
- **Why**: Students see external department courses in their schedule
- **What to verify**:
  - External courses appear correctly
  - Prerequisites are checked
  - Section groups are properly displayed

#### ✏️ **app/(dashboard)/dashboard/student/exams/page.tsx**
- **Why**: Exam timetable includes external course exams
- **What to verify**:
  - All course-level exams are displayed
  - Exam conflicts are detected across all courses
  - Multiple exam rooms are shown

---

## 🟡 MEDIUM PRIORITY - Should Update

### 4. Components (`components/`)

#### ✏️ **components/courses-table.tsx**
- Add department column
- Show prerequisites
- Add elective indicator
- Support filtering by department

#### ✏️ **components/sections-table.tsx**
- Group sections by section groups
- Add section type badges (L, T, B)
- Show capacity per group, not per section
- Handle multi-section registration

#### ✏️ **components/exams-table.tsx**
- Display "Unified" badge for course-level exams
- Show multiple exam rooms
- Handle 2-3 exams per course (midterm, midterm2, final)

#### ✏️ **components/student-exam-timetable.tsx**
- Include external course exams
- Show room assignments clearly
- Detect conflicts across all courses

#### ✏️ **components/course-form.tsx**
- Add prerequisite selection
- Support external department courses
- Validate course codes

#### ✏️ **components/section-form.tsx**
- Support section group creation
- Add section type selection (lecture/tutorial/lab)
- Validate section naming (01L, 01T, 01B pattern)
- Link sections in same group

#### ✏️ **components/exam-form.tsx**
- Support multiple exam rooms selection
- Course-level exam option (no section selected)
- Handle 2-3 exam types

---

### 5. Scheduling & Registration

#### ✏️ **lib/scheduling/algorithm.ts**
- **Why**: Scheduling algorithm needs to understand section groups
- **What to update**:
  - Don't schedule sections independently
  - Schedule section groups as units
  - Respect lab = 2-hour block constraint

#### ✏️ **lib/db/student-enrollments.ts**
- **Why**: Students register for section groups, not individual sections
- **What to update**:
  - Create enrollments for all sections in a group
  - Validate prerequisite courses
  - Check level requirements for electives

---

## 🟢 LOW PRIORITY - Optional Updates

### 6. UI/UX Enhancements

#### 📄 **components/course-detail-dialog.tsx**
- Show department information
- Display prerequisites graphically
- Show all section groups
- Link to prerequisite courses

#### 📄 **app/(dashboard)/dashboard/admin/settings/page.tsx**
- Add department management
- Configure exam types (midterm, midterm2, final)
- Manage section group settings

#### 📄 **components/elective-preference-manager.tsx**
- Filter electives by department
- Show prerequisites for elective courses
- Group electives by department

---

## 🔧 Testing Checklist

After updating the files, test the following:

### Course Management
- [ ] Can view all courses (SWE + external)
- [ ] Can filter courses by department
- [ ] Can filter courses by level (including level 0 for electives)
- [ ] Prerequisites are displayed correctly
- [ ] Elective courses are clearly marked

### Section Management
- [ ] Sections are grouped correctly
- [ ] Section types (L, T, B) are displayed
- [ ] Students register for section groups, not individual sections
- [ ] Lab sections are always 2-hour blocks
- [ ] Section capacity is enforced (not room capacity)
- [ ] Enrollment checks section capacity, not room capacity

### Exam Management
- [ ] Course-level exams are displayed (not section-specific)
- [ ] Multiple exam rooms are shown
- [ ] Courses with 2 credits have 2 exams (midterm, final)
- [ ] Courses with 3+ credits have 3 exams (midterm, midterm2, final)
- [ ] Exam conflicts are detected across all courses

### Student Experience
- [ ] Students can see external courses in course catalog
- [ ] Students can register for courses with prerequisites
- [ ] Student schedule shows all sections in a group
- [ ] Exam timetable includes all exams
- [ ] Exam conflicts are highlighted

### Instructor Experience
- [ ] External instructors appear in instructor list
- [ ] Workload calculation includes external courses
- [ ] Instructors can view their assigned sections

### Admin Experience
- [ ] Can manage courses from all departments
- [ ] Can create section groups
- [ ] Can schedule exams at course level
- [ ] Can assign multiple exam rooms

---

## 📝 Migration Instructions

1. **Backup database** before applying migration:
   ```bash
   supabase db dump > backup_before_external_departments.sql
   ```

2. **Apply migration**:
   ```bash
   supabase db reset  # For local development
   # OR
   supabase migration up  # For production (after testing)
   ```

3. **Regenerate TypeScript types**:
   ```bash
   supabase gen types typescript --local > lib/types/database.ts
   ```

4. **Test locally** with seed data

5. **Update codebase** following this checklist

6. **Run full test suite**

7. **Deploy to staging** and verify

8. **Deploy to production**

---

## 📊 Data Summary

### Courses by Department
- **MATH**: 2 courses (1 required, 1 elective)
- **CSC**: 9 courses (4 required, 5 electives)
- **PHYS**: 3 courses (1 required, 2 electives)
- **CEN**: 4 courses (1 required, 3 electives)
- **IS**: 3 courses (1 required, 2 electives)
- **IC**: 9 courses (2 required, 7 electives)
- **QURN**: 1 course (elective)
- **OPER**: 1 course (elective)
- **BIOL**: 2 courses (electives)
- **BCH**: 1 course (elective)

### Courses by Level
- **Level 0** (Electives): 23 courses
- **Level 4**: 6 courses
- **Level 5**: 3 courses
- **Level 6**: 2 courses
- **Level 7**: 1 course
- **Level 8**: 1 course

### Section Types
- **Lecture only**: 10 courses (2-credit Islamic Culture courses, QURN)
- **Lecture + Tutorial**: 19 courses (3-credit courses)
- **Lecture + Tutorial + Lab**: 6 courses (4-credit courses with programming/lab component)

---

## 🆘 Support

If you encounter issues:
1. Check migration logs for errors
2. Verify foreign key constraints
3. Check RLS policies (instructors, rooms, courses should be accessible)
4. Review the JSON source file: `external_departments_courses_sections.json`

**Migration file**: `supabase/migrations/20251029141000_import_external_departments_data.sql`
**Data source**: `external_departments_courses_sections.json`
**Generated**: October 29, 2025

