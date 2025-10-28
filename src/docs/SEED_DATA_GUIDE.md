# Seed Data Guide

## Overview

SmartSchedule provides comprehensive seed data for testing and demo purposes. This guide explains how to use the seed data system effectively.

## Available Seed Data Files

### 1. `seed-data.json` (Basic)
- **Version**: 1.0
- **Contents**:
  - 12 courses (Levels 1-5)
  - 10 rooms (5 lecture halls, 5 labs)
  - 6 instructors
  - 7 student groups
- **Use Case**: Quick setup for testing basic functionality

### 2. `seed-data-enhanced.json` (Comprehensive)
- **Version**: 2.0
- **Contents**:
  - 33 courses (Levels 1-5)
  - 15 rooms (9 lecture halls, 6 labs)
  - 10 instructors with varying workload capacities
  - 7 student groups with realistic sizes
  - Includes core and elective courses
- **Use Case**: Full-featured testing and demos

## Loading Methods

### Method 1: Using the Web Interface (Recommended)

1. **Login** to the dashboard
2. Navigate to **Import/Export** (`/dashboard/import-export`)
3. **Select entities** to import (courses, rooms, instructors, student groups)
4. **Upload** the seed data JSON file
5. Click **Import Data**

**Advantages**:
- Visual feedback
- Selective import
- Error handling with UI messages
- No command-line access needed

### Method 2: Using the Seed Script

```bash
# Navigate to project root
cd /path/to/SSv2

# Install tsx if not already installed
pnpm add -D tsx

# Run the seed script
pnpm tsx scripts/seed-database.ts

# Or clear existing data first
pnpm tsx scripts/seed-database.ts --clear
```

**Advantages**:
- Automated setup
- Fast batch insertion
- Can be integrated into CI/CD
- Useful for resetting test databases

**Requirements**:
- `NEXT_PUBLIC_SUPABASE_URL` in `.env.local`
- `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

## Seed Data Structure

### Courses

```json
{
  "code": "CS101",
  "name": "Introduction to Programming",
  "level": 1,
  "credits": 3,
  "type": "core",
  "is_elective": false
}
```

**Fields**:
- `code` (string, unique): Course code (e.g., "CS101")
- `name` (string): Full course name
- `level` (1-5): Academic level
- `credits` (number): Credit hours
- `type` (string): "core", "elective", or "general"
- `is_elective` (boolean): Whether course is elective

### Rooms

```json
{
  "name": "A101",
  "type": "lecture",
  "capacity": 50
}
```

**Fields**:
- `name` (string, unique): Room identifier
- `type` (string): "lecture" or "lab"
- `capacity` (number): Maximum student capacity

### Instructors

```json
{
  "name": "Dr. Ahmed Hassan",
  "email": "ahmed.hassan@university.edu",
  "max_load_per_week": 12
}
```

**Fields**:
- `name` (string): Instructor's full name
- `email` (string, unique): Contact email
- `max_load_per_week` (number): Maximum teaching hours per week

### Student Groups

```json
{
  "level": 1,
  "size": 48,
  "name": "Level 1 - Section A"
}
```

**Fields**:
- `level` (1-5): Academic level
- `size` (number): Number of students
- `name` (string): Group identifier

## Course Distribution

### Enhanced Seed Data Breakdown

| Level | Core Courses | Elective Courses | Total |
|-------|-------------|------------------|-------|
| 1     | 6           | 0                | 6     |
| 2     | 5           | 2                | 7     |
| 3     | 3           | 4                | 7     |
| 4     | 1           | 6                | 7     |
| 5     | 4           | 2                | 6     |
| **Total** | **19**  | **14**           | **33** |

### Elective Courses List
- **Level 2**: CS204 (Web Development), CS205 (Mobile App Development)
- **Level 3**: CS304 (Machine Learning), CS305 (Cloud Computing), CS306 (Cybersecurity), CS307 (Data Mining)
- **Level 4**: CS402 (Computer Graphics), CS403 (AI), CS404 (Distributed Systems), CS405 (Software Testing), CS406 (DevOps), CS407 (Blockchain)
- **Level 5**: CS505 (Advanced AI), CS506 (Big Data Analytics)

## After Loading Seed Data

### 1. Generate Sections

1. Go to **Scheduling** dashboard
2. Use the **Schedule Generator** component
3. Click "Generate Schedule"
4. Review assigned and unassigned sections

### 2. Add Exams

1. Navigate to **Exams** (`/dashboard/exams`)
2. Create exams for core courses
3. Assign dates, times, and rooms
4. System will check for conflicts

### 3. View Analytics

Check the following dashboards:
- **Level Overview** - Statistics by level
- **Course Overview** - Course distribution and utilization
- **Teaching Load** - Instructor workload

### 4. Test User Roles

Create test users with different roles:
```sql
-- Insert test users into user_roles table
INSERT INTO user_roles (user_id, role, name, email) VALUES
  ('<user-id-1>', 'scheduling', 'Test Scheduler', 'scheduler@test.com'),
  ('<user-id-2>', 'faculty', 'Test Faculty', 'faculty@test.com'),
  ('<user-id-3>', 'student', 'Test Student', 'student@test.com');
```

## Customizing Seed Data

### Creating Your Own Seed File

1. **Copy** `seed-data-enhanced.json`
2. **Modify** the data to match your institution
3. **Validate** JSON syntax
4. **Test** with a few records first
5. **Import** using web interface or script

### Data Validation Rules

**Courses**:
- Code must be unique
- Level must be 1-5
- Credits must be positive

**Rooms**:
- Name must be unique
- Type must be "lecture" or "lab"
- Capacity must be positive

**Instructors**:
- Email must be unique
- max_load_per_week must be positive

**Student Groups**:
- Level must be 1-5
- Size must be positive

## Troubleshooting

### Import Errors

**"Duplicate key error"**
- Solution: Use upsert mode or clear existing data first

**"Foreign key constraint"**
- Solution: Import in correct order (courses → rooms → instructors → student groups → sections)

**"Permission denied"**
- Solution: Ensure user has `scheduling` or `registrar` role

### Script Errors

**"Missing environment variables"**
```bash
# Check .env.local file
cat .env.local | grep SUPABASE
```

**"Connection timeout"**
- Check internet connection
- Verify Supabase URL
- Ensure service role key is correct

**"RLS policy violation"**
- Script uses service role key which bypasses RLS
- If using web interface, ensure proper role

## Best Practices

1. **Start Small**: Load basic seed data first, then enhance
2. **Backup**: Export current data before importing new data
3. **Test Roles**: Test each user role after loading data
4. **Generate Sections**: Use schedule generator rather than manual creation
5. **Check Conflicts**: Review conflict detection after creating sections
6. **Monitor Stats**: Use dashboards to verify data loaded correctly

## Integration Testing

### Automated Testing Setup

```bash
# 1. Reset database
pnpm tsx scripts/seed-database.ts --clear

# 2. Run tests
pnpm test

# 3. Check results
pnpm tsx scripts/seed-database.ts  # Re-seed after tests
```

### Manual Testing Checklist

- [ ] Load seed data
- [ ] Login as scheduling role
- [ ] Generate schedule
- [ ] Check for conflicts
- [ ] View Level Overview dashboard
- [ ] View Course Overview dashboard
- [ ] Create an exam
- [ ] Test notifications
- [ ] Export data
- [ ] Verify import/export round-trip

## Additional Resources

- [Import/Export Documentation](./IMPORT_EXPORT.md) *(to be created)*
- [Role Implementation](./ROLE_IMPLEMENTATION_SUMMARY.md)
- [Local Development Guide](./LOCAL_DEVELOPMENT.md)
- [Timeline](../../timeline.md)

## Support

If you encounter issues:
1. Check this documentation
2. Review error messages in browser console
3. Check server logs
4. Verify database connections
5. Ensure all migrations are applied

---

*Last Updated: October 28, 2025*

