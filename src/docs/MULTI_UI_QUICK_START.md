# Multi-UI Role System - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create Test Users
Use Supabase dashboard or API to create 5 test users with different emails:
- `scheduling@test.com` 
- `teaching@test.com`
- `faculty@test.com`
- `student@test.com`
- `registrar@test.com`

### Step 2: Assign Roles via SQL

Run this in Supabase SQL Editor (replace `<user_id>` with actual UUIDs from auth.users):

```sql
-- Get user IDs first
SELECT id, email FROM auth.users;

-- Then insert roles (replace the UUIDs)
INSERT INTO user_roles (user_id, role, name, email) VALUES
  ('<uuid-1>', 'scheduling', 'Scheduling Admin', 'scheduling@test.com'),
  ('<uuid-2>', 'teaching_load', 'Teaching Lead', 'teaching@test.com'),
  ('<uuid-3>', 'faculty', 'Prof. Smith', 'faculty@test.com'),
  ('<uuid-4>', 'student', 'John Doe', 'student@test.com'),
  ('<uuid-5>', 'registrar', 'Registrar Office', 'registrar@test.com');
```

### Step 3: Link Faculty Profile (Optional)

For faculty dashboard to show schedule:
```sql
INSERT INTO instructor (name, email)
VALUES ('Prof. Smith', 'faculty@test.com');
```

### Step 4: Add Sample Data

```sql
-- Add a course
INSERT INTO course (code, title, level, credits, weekly_hours, is_elective)
VALUES ('CS101', 'Introduction to Programming', 1, 3, 3, false);

-- Add a room
INSERT INTO room (code, type)
VALUES ('R101', 'Lecture');

-- Add a student group
INSERT INTO student_group (level, size, name)
VALUES (1, 30, 'Level 1 - Group A');
```

### Step 5: Test Each Role

Login with each test account and verify:

#### ✅ Scheduling Committee (`scheduling@test.com`)
- Should redirect to `/dashboard/scheduling`
- See: Setup checklist, schedule generation, all menu items
- Role badge: 🟣 Purple "Scheduling Committee"

#### ✅ Teaching Load (`teaching@test.com`)
- Should redirect to `/dashboard/teaching-load`
- See: Instructor load overview, limited menu items
- Role badge: 🔵 Blue "Teaching Load"

#### ✅ Faculty (`faculty@test.com`)
- Should redirect to `/dashboard/faculty`
- See: Personal schedule (if linked), preferences
- Role badge: 🟢 Green "Faculty"

#### ✅ Student (`student@test.com`)
- Should redirect to `/dashboard/student`
- See: Elective preferences, available courses
- Role badge: 🟡 Yellow "Student"

#### ✅ Registrar (`registrar@test.com`)
- Should redirect to `/dashboard/registrar`
- See: Publication controls, validation checks, export
- Role badge: 🔴 Red "Registrar"

---

## 📋 Verification Checklist

### For Each Role:
- [ ] Auto-redirect to correct dashboard works
- [ ] Role badge appears in sidebar (top)
- [ ] Navigation shows only permitted items
- [ ] User dropdown shows role badge
- [ ] Dashboard displays role-specific content
- [ ] Cannot manually navigate to other role dashboards
- [ ] Logout works and redirects to login

### Navigation Items Check:

| Item | Scheduling | Teaching Load | Faculty | Student | Registrar |
|------|:----------:|:-------------:|:-------:|:-------:|:---------:|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ |
| Setup Check | ✓ | ✓ | - | - | - |
| Courses | ✓ | ✓ | - | - | ✓ |
| Sections | ✓ | ✓ | - | - | ✓ |
| Rooms | ✓ | - | - | - | ✓ |
| Instructors | ✓ | ✓ | - | - | ✓ |
| Student Groups | ✓ | - | - | - | ✓ |
| My Schedule | - | - | ✓ | - | - |
| My Preferences | - | - | - | ✓ | - |
| Import/Export | ✓ | - | - | - | ✓ |
| Notifications | ✓ | ✓ | ✓ | ✓ | ✓ |
| Settings | ✓ | - | - | - | - |

---

## 🎨 Role Color Coding

Each role has a unique color for easy identification:

- 🟣 **Purple** - Scheduling Committee (full access)
- 🔵 **Blue** - Teaching Load (instructor management)
- 🟢 **Green** - Faculty (personal view)
- 🟡 **Yellow** - Student (learning view)
- 🔴 **Red** - Registrar (publication & archival)

---

## 🔧 Troubleshooting

### Problem: "No Role Assigned" Error
**Solution**: User exists in auth but not in user_roles table.
```sql
-- Check if role exists
SELECT * FROM user_roles WHERE user_id = '<user_id>';

-- Add if missing
INSERT INTO user_roles (user_id, role, name, email)
VALUES ('<user_id>', 'scheduling', 'Name', 'email@example.com');
```

### Problem: Faculty Dashboard Shows "Profile Not Linked"
**Solution**: Create instructor record with matching email.
```sql
INSERT INTO instructor (name, email)
VALUES ('Faculty Name', 'faculty@test.com');
```

### Problem: Navigation Items Not Showing
**Causes**:
1. Role not assigned correctly (check database)
2. Auth context not loading (check console)
3. Browser cache (hard refresh: Cmd+Shift+R)

### Problem: Stuck on Loading
**Solution**: 
1. Check browser console for errors
2. Verify Supabase connection
3. Check RLS policies enabled
4. Verify user_roles table exists

### Problem: Redirect Loop
**Solution**: Role value doesn't match enum exactly.
```sql
-- Check role enum values
SELECT enum_range(NULL::user_role);

-- Should return: {scheduling,teaching_load,faculty,student,registrar}
```

---

## 🎯 Usage Scenarios

### Scenario 1: New Semester Setup (Scheduling)
1. Login as scheduling@test.com
2. See setup checklist on dashboard
3. Add courses, rooms, instructors via quick actions
4. Generate schedule (placeholder)
5. Create named release

### Scenario 2: Load Balancing (Teaching Load)
1. Login as teaching@test.com
2. View instructor load bars
3. Identify overloaded instructors (red bars)
4. Access sections to reassign
5. Check loads rebalanced (green bars)

### Scenario 3: Faculty Schedule View
1. Login as faculty@test.com
2. See personal teaching schedule
3. View assigned sections with rooms and times
4. Check weekly load
5. Submit feedback (placeholder)

### Scenario 4: Student Preferences
1. Login as student@test.com
2. View available elective courses
3. Submit ranked preferences (placeholder)
4. Check schedule when published
5. Review exam schedule

### Scenario 5: Final Publication (Registrar)
1. Login as registrar@test.com
2. Review validation checks
3. Verify all sections assigned
4. Publish schedule to students
5. Export data for archival

---

## 💻 Developer Testing

### Test Role Switching
```typescript
// Simulate role change
UPDATE user_roles 
SET role = 'faculty' 
WHERE user_id = '<test-user-id>';

// Logout and login again to see new role
```

### Test Route Protection
Try accessing dashboards manually:
- `/dashboard/scheduling` - Should only work for scheduling role
- `/dashboard/faculty` - Should only work for faculty role
- etc.

### Test Data with Roles
```sql
-- Query as would be seen by role
SET ROLE authenticated;
SET request.jwt.claim.sub = '<user-id>';

-- Now queries respect RLS
SELECT * FROM section; -- See what this role can see
```

---

## 📊 Sample Data Script

Complete sample data for testing:

```sql
-- Courses (run as scheduling)
INSERT INTO course (code, title, level, credits, weekly_hours, is_elective) VALUES
  ('CS101', 'Intro to Programming', 1, 3, 3, false),
  ('CS102', 'Data Structures', 1, 3, 3, false),
  ('CS201', 'Algorithms', 2, 3, 3, false),
  ('CS301', 'Machine Learning', 3, 3, 3, true),
  ('CS302', 'Web Development', 3, 3, 3, true);

-- Rooms
INSERT INTO room (code, type) VALUES
  ('R101', 'Lecture'),
  ('R102', 'Lecture'),
  ('LAB1', 'Lab'),
  ('LAB2', 'Lab');

-- Instructors
INSERT INTO instructor (name, email, max_load_per_week) VALUES
  ('Prof. Smith', 'faculty@test.com', 12),
  ('Dr. Johnson', 'johnson@test.com', 12),
  ('Prof. Williams', 'williams@test.com', 15);

-- Student Groups
INSERT INTO student_group (level, size, name) VALUES
  (1, 35, 'Level 1 - Section A'),
  (1, 32, 'Level 1 - Section B'),
  (2, 28, 'Level 2 - Section A'),
  (3, 25, 'Level 3 - Section A');

-- Sample Section (for testing faculty view)
INSERT INTO section (
  course_code, 
  section_no, 
  instructor_id, 
  room_code, 
  capacity, 
  group_level,
  meeting_pattern
) 
SELECT 
  'CS101',
  '01',
  (SELECT id FROM instructor WHERE email = 'faculty@test.com'),
  'R101',
  35,
  1,
  '{"days": ["Sunday", "Tuesday"], "start": "09:00", "duration": 90, "is_lab": false}'::jsonb;
```

---

## 🎓 Best Practices

1. **Always assign roles immediately after user creation**
2. **Link faculty emails to instructor records**
3. **Test with each role before production**
4. **Keep role badges visible for context**
5. **Use descriptive names in user_roles table**

---

## 📚 Additional Resources

- [Complete Documentation](./MULTI_UI_ROLES.md)
- [Implementation Summary](./ROLE_IMPLEMENTATION_SUMMARY.md)
- [PRD](../../PRD.md)
- [Database Schema](../../supabase/migrations/)

---

**Last Updated**: October 27, 2025  
**Status**: Ready for Testing ✅

