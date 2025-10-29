# SQL Seed File Guide

## Overview

The `supabase/seed.sql` file contains all seed data in pure SQL format. This is an alternative to the TypeScript seeder and can be used directly with Supabase CLI or psql.

## Usage Methods

### Method 1: Supabase CLI (Recommended)

```bash
# Make sure Supabase is running
pnpm db:start

# Apply the seed file
supabase db reset

# Or run the seed file directly
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/seed.sql
```

### Method 2: TypeScript Seeder (Full Featured)

For complete seeding including sections with instructor assignments:

```bash
# Clear and seed everything
pnpm db:seed:external:clear

# Or append to existing data
pnpm db:seed:external
```

### Method 3: Supabase Studio

1. Open Supabase Studio: `pnpm db:studio`
2. Go to SQL Editor
3. Copy and paste the contents of `supabase/seed.sql`
4. Run the SQL

### Method 4: Production Database

For production Supabase instance:

```bash
# Using Supabase CLI linked to production
supabase db push

# Or using psql
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" -f supabase/seed.sql
```

## What's Included

### ✅ Fully Seeded
- **52 Courses** (SWE + External departments)
- **35 Instructors** (all departments)
- **120+ Rooms** (lecture, lab, and exam rooms)
- **105 Exams** (midterm, midterm2, final for all courses)
- **8 Student Groups** (levels 1-8)

### ⚠️ Partially Seeded
- **Sections**: Structure is ready but not fully populated in SQL
  - Use TypeScript seeder for complete section import with instructor mapping
  - Or manually create sections via the dashboard

## Advantages of SQL Seed

1. **No Dependencies**: Pure SQL, no Node.js required
2. **Fast Execution**: Direct database operations
3. **Version Control**: Easy to track changes
4. **Migration Friendly**: Can be part of your migration strategy
5. **Platform Independent**: Works with any PostgreSQL client

## Advantages of TypeScript Seeder

1. **Complete Data**: Includes sections with instructor assignments
2. **Data Validation**: Type-safe data processing
3. **Error Handling**: Better error messages
4. **Flexible**: Can customize data transformation
5. **Progress Feedback**: Real-time progress updates

## Recommendations

### For Development
Use **TypeScript Seeder** for complete data including sections:
```bash
pnpm db:seed:external:clear
```

### For Quick Testing
Use **SQL Seed** for basic data structure:
```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f supabase/seed.sql
```

### For Production
1. Test with SQL seed first
2. Verify data integrity
3. Use TypeScript seeder for sections if needed
4. Or use the Import/Export UI for controlled data import

## Cleaning Up

To clear all data before re-seeding:

```sql
-- Run this in SQL editor
DELETE FROM exam;
DELETE FROM section;
DELETE FROM elective_preference;
DELETE FROM student_group;
DELETE FROM instructor;
DELETE FROM room;
DELETE FROM course;
```

Or use the database reset:
```bash
supabase db reset
```

## Verification

After running the seed file, check the counts:

```sql
SELECT 
  'courses' as table_name, COUNT(*) as count FROM course
UNION ALL
SELECT 'instructors', COUNT(*) FROM instructor
UNION ALL
SELECT 'rooms', COUNT(*) FROM room
UNION ALL
SELECT 'exams', COUNT(*) FROM exam
UNION ALL
SELECT 'student_groups', COUNT(*) FROM student_group;
```

Expected results:
- Courses: ~52
- Instructors: ~35
- Rooms: ~120
- Exams: ~105
- Student Groups: 8

## Troubleshooting

### Error: "relation does not exist"

**Cause**: Database schema not created

**Solution**: Run migrations first:
```bash
supabase db reset
```

### Error: "duplicate key value"

**Cause**: Data already exists

**Solution**: Clear data or use the `ON CONFLICT` clauses in the SQL

### Error: "permission denied"

**Cause**: Using wrong database user

**Solution**: Use service role or postgres superuser

## Next Steps

After seeding:
1. Run TypeScript seeder for sections: `pnpm db:seed:external`
2. Login to dashboard and verify data
3. Create test user accounts
4. Test the application workflows

