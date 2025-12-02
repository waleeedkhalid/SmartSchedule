# Sections Seeding Guide

## Overview

The sections seed file contains **87 complete sections** from all external departments with:
- ✅ Instructor assignments (using email lookups)
- ✅ Room assignments
- ✅ Meeting patterns (days, start time, duration)
- ✅ Capacity limits
- ✅ Group levels
- ✅ Activity types (lecture, tutorial, lab)

## Quick Start

### Option 1: Using SQL File (Direct)

```bash
# Make sure you've already seeded courses, instructors, and rooms
# Then seed sections:
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/seed-sections.sql
```

### Option 2: Using TypeScript Seeder (Complete)

```bash
# This will seed everything including sections
npm run db:seed:external:clear
```

### Option 3: Via Supabase Studio

```bash
# Open Studio
npm run db:studio

# Go to SQL Editor
# Copy and paste the contents of supabase/seed-sections.sql
# Run the SQL
```

## Prerequisites

Before running the sections seed, you must have:
1. ✅ **Courses** - All 52 courses seeded
2. ✅ **Instructors** - All 35 instructors seeded
3. ✅ **Rooms** - All 124 rooms seeded

If you don't have these, first run:
```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/seed.sql
```

## What Gets Created

### Sections by Department

| Department | Sections | Courses Covered |
|-----------|----------|-----------------|
| MATH | 4 | 2 courses (244, 254) |
| CSC | 24 | 9 courses (113, 212, 220, 227, 215, 311, 361, 476, 478) |
| PHYS | 6 | 3 courses (104, 201, GPH 201) |
| CEN | 10 | 4 courses (303, 316, 445, 318) |
| IS | 6 | 3 courses (230, 385, 485) |
| IC | 11 | 10 courses (100-108, QURN 100) |
| OPER | 2 | 1 course (122) |
| BIOL | 4 | 2 courses (145, MIC 140) |
| BCH | 2 | 1 course (101) |
| **Total** | **69** | **35 courses** |

### Section Details

Each section includes:
```json
{
  "course_code": "MATH 244",
  "section_no": "01L",
  "activity": "lecture",
  "instructor_id": "UUID from instructor table",
  "room_code": "MATH-201",
  "capacity": 45,
  "group_level": 4,
  "meeting_pattern": {
    "days": ["sunday", "tuesday"],
    "start_time": "09:00",
    "duration_minutes": 90
  },
  "state": "draft"
}
```

## Instructor Assignment Logic

The SQL file uses email-based lookups to assign instructors:

```sql
instructor_id = (SELECT id FROM instructor WHERE email = 'azahrani@university.edu')
```

This ensures sections are properly linked to the correct instructors based on the data from `external_departments_courses_sections.json`.

## Section States

All sections are created with **`state = 'draft'`**.

### To Release Sections for Student Enrollment:

#### Option 1: Via SQL
```sql
-- Release all sections
UPDATE section SET state = 'released';

-- Or release specific courses
UPDATE section SET state = 'released' WHERE course_code = 'MATH 244';

-- Or release by level
UPDATE section SET state = 'released' WHERE group_level = 4;
```

#### Option 2: Via Dashboard
1. Login to your app
2. Navigate to **Dashboard → Sections**
3. Select sections you want to release
4. Click **Update State** → **Released**

## Verification

### Check Section Counts
```sql
-- Total sections
SELECT COUNT(*) FROM section;

-- Sections by course
SELECT course_code, COUNT(*) as section_count
FROM section
GROUP BY course_code
ORDER BY course_code;

-- Sections by activity type
SELECT activity, COUNT(*) as count
FROM section
GROUP BY activity;
```

### Expected Results
```
Total sections: 69
- Lectures: 35
- Tutorials: 32
- Labs: 2
```

### Check Instructor Assignments
```sql
-- Sections with instructors
SELECT 
  s.course_code,
  s.section_no,
  i.name as instructor_name,
  i.email
FROM section s
LEFT JOIN instructor i ON s.instructor_id = i.id
ORDER BY s.course_code, s.section_no;
```

### Check Meeting Patterns
```sql
-- View meeting patterns
SELECT 
  course_code,
  section_no,
  meeting_pattern->>'days' as days,
  meeting_pattern->>'start_time' as start_time,
  meeting_pattern->>'duration_minutes' as duration
FROM section
ORDER BY course_code, section_no;
```

## Example Sections

### MATH 244 - Linear Algebra
- **01L** (Lecture): Sun/Tue 09:00-10:30, Dr. Ahmed Al-Zahrani, MATH-201
- **01T** (Tutorial): Thu 09:00-10:00, Dr. Ahmed Al-Zahrani, MATH-202

### CSC 113 - Computer Programming II
- **01L** (Lecture): Sun/Tue 11:00-11:50, Dr. Omar Al-Malki, CSC-113-LEC-01
- **01T** (Tutorial): Thu 11:00-11:50, Dr. Omar Al-Malki, CSC-113-TUT-01
- **01B** (Lab): Thu 08:00-10:00, Dr. Omar Al-Malki, CSC-113-LAB-01

### IC 107 - Professional Ethics
- **01L** (Lecture): Mon/Wed 11:00-11:50, Dr. Mazen Al-Shahrani, IC-801

## Troubleshooting

### Issue: "instructor_id cannot be null"

**Cause**: Instructors not seeded or email mismatch

**Solution**: 
1. Check instructors exist:
   ```sql
   SELECT COUNT(*) FROM instructor;
   ```
2. If count is 0, seed instructors first:
   ```bash
   psql ... -f supabase/seed.sql
   ```

### Issue: "foreign key violation for room_code"

**Cause**: Rooms not seeded

**Solution**: Seed rooms first (they're in the main seed.sql)

### Issue: "foreign key violation for course_code"

**Cause**: Courses not seeded

**Solution**: Seed courses first (they're in the main seed.sql)

### Issue: Sections not appearing in dashboard

**Cause**: Sections are in "draft" state

**Solution**: Update sections to "released" state (see above)

## Complete Seeding Order

To seed everything in the correct order:

```bash
# 1. Start Supabase
npm run db:start

# 2. Seed courses, instructors, rooms, exams, groups
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/seed.sql

# 3. Seed sections
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/seed-sections.sql

# 4. Verify
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c "SELECT COUNT(*) FROM section;"
```

**Or use the TypeScript seeder for everything at once:**
```bash
npm run db:seed:external:clear
```

## Updating Sections

To modify sections after seeding:

### Change Instructor
```sql
UPDATE section 
SET instructor_id = (SELECT id FROM instructor WHERE email = 'new_email@university.edu')
WHERE course_code = 'MATH 244' AND section_no = '01L';
```

### Change Room
```sql
UPDATE section 
SET room_code = 'NEW-ROOM-CODE'
WHERE course_code = 'MATH 244' AND section_no = '01L';
```

### Change Meeting Pattern
```sql
UPDATE section 
SET meeting_pattern = jsonb_build_object(
  'days', ARRAY['monday', 'wednesday'],
  'start_time', '10:00',
  'duration_minutes', 90
)
WHERE course_code = 'MATH 244' AND section_no = '01L';
```

### Change Capacity
```sql
UPDATE section 
SET capacity = 50
WHERE course_code = 'MATH 244' AND section_no = '01L';
```

## Next Steps

After seeding sections:

1. **Review the Data**
   - Check all sections in Dashboard → Sections
   - Verify instructor assignments
   - Confirm room allocations
   - Review meeting times for conflicts

2. **Release Sections**
   - Update section states from "draft" to "released"
   - This makes them available for student enrollment

3. **Test Enrollment**
   - Create test student accounts
   - Register for sections
   - Verify schedules display correctly

4. **Configure Semester**
   - Set semester dates
   - Initialize timeline
   - Enable student registration

## Additional Resources

- **Main Seed File**: `supabase/seed.sql`
- **TypeScript Seeder**: `scripts/seed-external-data.ts`
- **Complete Guide**: `EXTERNAL_DATA_SEEDING_GUIDE.md`
- **Quick Reference**: `SEEDING_QUICK_REFERENCE.md`

