# External Data Seeding Guide

## Overview

This guide explains how to seed your SmartSchedule database with external department courses, sections, and SWE study plan data.

## Data Sources

### 1. `external_departments_courses_sections.json`
Contains comprehensive data for external departments:
- **11 departments**: MATH, CSC, PHYS, CEN, IS, IC, OPER, BIOL, BCH
- **35 courses** with full details
- **35 section groups** with multiple sections each
- **Instructors** from all departments
- **Room assignments** for lectures, tutorials, and labs
- **Exam schedules** (midterm, midterm2, final) with dates and rooms

### 2. `swe_plan.json`
Contains the Software Engineering study plan:
- **Core courses** for levels 4-8
- **Elective groups**:
  - Department Electives (9 credits required)
  - Math and Statistics Electives (6 credits required)
  - General Science Electives (3 credits required)
  - University Requirements Electives (4 credits required)

## Quick Start

### Prerequisites

1. Ensure Supabase is running:
```bash
pnpm db:start
```

2. Verify environment variables in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Seeding Commands

#### Option 1: Seed Without Clearing (Append Data)
```bash
pnpm db:seed:external
```

#### Option 2: Clear Existing Data First (Clean Seed)
```bash
pnpm db:seed:external:clear
```

> ⚠️ **Warning**: The `--clear` flag will delete ALL existing data including courses, sections, instructors, rooms, exams, and student groups.

## What Gets Seeded

### Courses
- **SWE Courses**: All Software Engineering courses from the study plan
- **External Courses**: All courses from external departments
- **Total**: ~50+ courses

Example courses:
- `SWE 211` - Introduction to Software Engineering (Level 4, 3 credits)
- `MATH 244` - Linear Algebra (Level 4, 3 credits)
- `CSC 113` - Computer Programming II (Level 4, 4 credits)
- `IC 107` - Professional Ethics (Level 7, 2 credits)

### Instructors
All instructors from the external departments data with:
- Full name
- Email address
- Default max load: 12 hours/week

Example instructors:
- Dr. Ahmed Al-Zahrani (azahrani@university.edu) - MATH 244
- Dr. Omar Al-Malki (omalki@university.edu) - CSC 113
- Dr. Saad Al-Zahrani (szahrani@university.edu) - PHYS 104

### Rooms
All rooms referenced in the data with auto-detected types:
- **Lecture rooms**: Standard classroom spaces
- **Lab rooms**: Rooms with "LAB" in the code
- **Exam rooms**: Rooms with "EXAM" in the code

Example rooms:
- `MATH-201` (Lecture, capacity: 50)
- `CSC-113-LAB-01` (Lab, capacity: 30)
- `EXAM-D101` (Exam, capacity: 100)

### Sections
Complete section information including:
- Section number (e.g., "01L", "01T", "01B")
- Activity type (lecture, tutorial, lab)
- Instructor assignment
- Room assignment
- Meeting patterns (days, start time, duration)
- Capacity
- Group level

Example section:
```json
{
  "course_code": "MATH 244",
  "section_no": "01L",
  "activity": "lecture",
  "instructor": "Dr. Ahmed Al-Zahrani",
  "room_code": "MATH-201",
  "capacity": 45,
  "group_level": 4,
  "meeting_pattern": {
    "days": ["sunday", "tuesday"],
    "start_time": "09:00",
    "duration_minutes": 90
  }
}
```

### Exams
All exam schedules including:
- Midterm exams
- Second midterm exams
- Final exams

Example exam:
```json
{
  "course_code": "MATH 244",
  "date": "2026-03-17",
  "start_time": "13:00",
  "duration_minutes": 120,
  "room_codes": ["EXAM-D101", "EXAM-D102"]
}
```

### Student Groups
Default groups for all 8 levels:
- Level 1 through Level 8
- Initial size: 0 (auto-updated when students enroll)

## Verification

After seeding, the script will display statistics:

```
📊 Database Statistics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Courses             : 52
  Rooms               : 145
  Instructors         : 28
  Student Groups      : 8
  Sections            : 87
  Exams               : 105
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Manual Verification

1. **Via Supabase Studio**:
```bash
pnpm db:studio
```
Navigate to each table and verify the data.

2. **Via Dashboard**:
- Login to your application
- Navigate to Dashboard → Courses
- Check that all courses are imported
- Navigate to Sections to verify sections
- Check Instructors and Rooms

## Troubleshooting

### Issue: "Missing environment variables"

**Solution**: Ensure your `.env.local` file contains:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

Get the service role key from:
```bash
pnpm db:status
```

### Issue: "File not found"

**Solution**: Ensure both JSON files are in the project root:
- `external_departments_courses_sections.json`
- `swe_plan.json`

### Issue: "Foreign key constraint violation"

**Solution**: Run with `--clear` flag to reset all data:
```bash
pnpm db:seed:external:clear
```

### Issue: Duplicate data

**Solution**: The script uses `upsert` for courses, instructors, and rooms (updates if exists). Sections and exams are inserted fresh. If you want to avoid duplicates, run with `--clear` first.

## Data Schema Mapping

### Course Mapping
```
External JSON → Database
--------------------------------
code          → code (PK)
title         → title
level         → level
credits       → credits
weekly_hours  → weekly_hours
is_elective   → is_elective
```

### Section Mapping
```
External JSON → Database
--------------------------------
section_no         → section_no
section_type       → activity (lecture/tutorial/lab)
instructor.email   → instructor_id (FK)
room_code          → room_code (FK)
group_level        → group_level
capacity           → capacity
meeting_pattern    → meeting_pattern (JSONB)
```

### Exam Mapping
```
External JSON → Database
--------------------------------
course.code        → course_code (FK)
date               → date
start_time         → start_time
duration_minutes   → duration_minutes
room_codes         → room_codes (array)
```

## Next Steps After Seeding

1. **Review the data**:
   - Check that all courses are imported correctly
   - Verify instructor assignments
   - Confirm room allocations

2. **Update section states**:
   - Sections are seeded as "draft"
   - Change to "released" when ready for student enrollment
   - Use the Dashboard → Sections page

3. **Create student accounts**:
   - Use the registration page
   - Assign students to appropriate levels (1-8)
   - Students will auto-enroll in required courses for their level

4. **Test the schedule**:
   - Login as a student
   - View your schedule
   - Register for elective sections

## Advanced Usage

### Seeding Only Specific Data

If you want to customize what gets seeded, edit `scripts/seed-external-data.ts` and comment out the functions you don't want to run:

```typescript
// Seed data in order
await seedSWECourses(swePlan)
await seedExternalCourses(externalData)

const instructors = await seedInstructors(externalData)
await seedRooms(externalData)

// await seedSections(externalData, instructors)  // Skip sections
// await seedExams(externalData)                   // Skip exams
await seedStudentGroups()
```

### Re-running Specific Parts

To re-seed only courses without clearing everything:

1. Delete courses:
```sql
DELETE FROM course WHERE code LIKE 'MATH%' OR code LIKE 'CSC%';
```

2. Run seed script:
```bash
pnpm db:seed:external
```

## Production Deployment

For production deployment:

1. **Export data**: Use the Dashboard → Import/Export feature
2. **Review sensitive data**: Remove or anonymize test data
3. **Import to production**: Upload the cleaned JSON file
4. **Verify**: Check all data is correct before going live

## Support

For issues or questions:
1. Check the console output for detailed error messages
2. Review the database schema in `PRODUCTION_INITIAL_SCHEMA.sql`
3. Check the data model documentation in `DATA_MODEL_COMPLETE.md`

