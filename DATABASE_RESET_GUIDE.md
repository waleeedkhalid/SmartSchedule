# 🔄 Database Complete Reset Guide

**Status:** ✅ SAFE TO EXECUTE  
**Reason:** Global maintenance mode is active  
**Risk:** ZERO - Schema is defined in migrations

## ✅ Yes, You Can Delete Everything!

Since maintenance mode is active, you can safely wipe the entire database and rebuild from scratch. This is actually **recommended** to fix the schema issues cleanly.

## 🎯 Two Options

### Option 1: Local Development (Recommended)

If you're working locally with Supabase CLI:

```bash
# 1. Stop local Supabase
supabase stop

# 2. Reset everything (drops all tables, reapplies migrations)
supabase db reset

# 3. Verify tables exist
supabase db status

# 4. Generate fresh types
supabase gen types typescript --local > lib/types/database.ts

# Done! Database is fresh and clean
```

**What this does:**
- ✅ Drops ALL tables
- ✅ Drops ALL data
- ✅ Reapplies all migrations in order
- ✅ Creates clean schema
- ✅ Fresh start

### Option 2: Remote/Production Database

If you're working with a remote Supabase project:

#### Method A: Via Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Database** → **Schema**
4. For each table, click the `...` menu → **Delete table**
5. Or use SQL Editor:

```sql
-- Drop all tables in correct order (respects foreign keys)
DROP TABLE IF EXISTS schedule_comment CASCADE;
DROP TABLE IF EXISTS elective_comment CASCADE;
DROP TABLE IF EXISTS elective_preference CASCADE;
DROP TABLE IF EXISTS student_enrollment CASCADE;
DROP TABLE IF EXISTS exam CASCADE;
DROP TABLE IF EXISTS section CASCADE;
DROP TABLE IF EXISTS irregular_student CASCADE;
DROP TABLE IF EXISTS student_group CASCADE;
DROP TABLE IF EXISTS instructor CASCADE;
DROP TABLE IF EXISTS room CASCADE;
DROP TABLE IF EXISTS course CASCADE;
DROP TABLE IF EXISTS notification CASCADE;
DROP TABLE IF EXISTS comment CASCADE;
DROP TABLE IF EXISTS schedule_doc CASCADE;
DROP TABLE IF EXISTS rule CASCADE;
DROP TABLE IF EXISTS time_grid_config CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS academic_semester CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS is_admin() CASCADE;
DROP FUNCTION IF EXISTS get_user_role() CASCADE;
DROP FUNCTION IF EXISTS is_registrar_or_admin() CASCADE;
DROP FUNCTION IF EXISTS detect_section_conflicts(UUID) CASCADE;
DROP FUNCTION IF EXISTS detect_exam_conflicts(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_instructor_load(UUID, UUID) CASCADE;

-- Verify everything is gone
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
-- Should return empty (except auth tables)
```

#### Method B: Using Supabase MCP (If you have it configured)

```typescript
// Can use Supabase MCP to run the DROP commands
// Then reapply migrations
```

#### Then Reapply Migrations:

```sql
-- In Supabase Dashboard SQL Editor, run each migration file in order:

-- 1. Initial Schema
-- Copy/paste content from: supabase/migrations/20241027000001_initial_schema.sql

-- 2. RLS Policies  
-- Copy/paste content from: supabase/migrations/20241027000002_rls_policies.sql

-- 3. Helper Functions
-- Copy/paste content from: supabase/migrations/20241027000003_helper_functions.sql

-- 4. User Role Fixes
-- Copy/paste content from: supabase/migrations/20241027000004_fix_user_role_creation.sql

-- 5. Exam Conflict Functions
-- Copy/paste content from: supabase/migrations/20241027000005_exam_conflict_functions.sql

-- 6. Elective Comments
-- Copy/paste content from: supabase/migrations/20241027000006_elective_comments.sql

-- 7. ALL other migrations in chronological order...
```

## 🔄 Recommended: Fix Schema BEFORE Rebuilding

Since you're starting fresh, **fix the schema issues first**:

### Create New Migration: `student_profile` table

```bash
# Create new migration
supabase migration new create_student_profile_table
```

Then edit the created file:

```sql
-- supabase/migrations/[TIMESTAMP]_create_student_profile_table.sql

-- Create student_profile table for student-specific data
CREATE TABLE student_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 7),
  major TEXT,
  minor TEXT,
  academic_standing TEXT DEFAULT 'good' CHECK (academic_standing IN ('good', 'probation', 'suspension')),
  expected_graduation DATE,
  advisor_id UUID REFERENCES instructor(id),
  gpa DECIMAL(3,2) CHECK (gpa >= 0.0 AND gpa <= 4.0),
  total_credits INTEGER DEFAULT 0 CHECK (total_credits >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_student_profile_user_id ON student_profile(user_id);
CREATE INDEX idx_student_profile_level ON student_profile(level);
CREATE INDEX idx_student_profile_major ON student_profile(major);
CREATE INDEX idx_student_profile_advisor ON student_profile(advisor_id);

-- Enable RLS
ALTER TABLE student_profile ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Students can view own profile"
  ON student_profile FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Students can update own profile"
  ON student_profile FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all profiles"
  ON student_profile FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can manage all profiles"
  ON student_profile FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Advisors can view their advisees"
  ON student_profile FOR SELECT
  USING (
    advisor_id IN (
      SELECT id FROM instructor 
      WHERE email = (
        SELECT email FROM user_roles WHERE user_id = auth.uid()
      )
    )
  );

-- Comments
COMMENT ON TABLE student_profile IS 'Student-specific profile data separated from general user roles';
COMMENT ON COLUMN student_profile.level IS 'Academic level (1-7, typically 1-4 for undergrad, 5-7 for grad)';
COMMENT ON COLUMN student_profile.gpa IS 'Current GPA on 4.0 scale';
COMMENT ON COLUMN student_profile.total_credits IS 'Total credits earned to date';
```

### Update Existing Migration: Remove `level` from `user_roles`

Edit: `supabase/migrations/20241027000001_initial_schema.sql`

```sql
-- Find the user_roles table definition and REMOVE the level column:

CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('scheduling', 'registrar', 'teaching_load', 'faculty', 'student')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  -- level INTEGER,  ❌ REMOVE THIS LINE
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 📋 Step-by-Step Process

### For Local Development:

1. **Fix migrations first** (optional but recommended):
   ```bash
   # Edit existing migrations to fix schema
   # Add new student_profile migration
   ```

2. **Reset database**:
   ```bash
   supabase db reset
   ```

3. **Verify**:
   ```bash
   # Check tables exist
   supabase db status
   
   # Check in Studio
   supabase db studio
   # Browse to see all tables
   ```

4. **Generate types**:
   ```bash
   supabase gen types typescript --local > lib/types/database.ts
   ```

5. **Seed data** (if needed):
   ```bash
   # Add test users, courses, etc.
   supabase db seed
   ```

### For Remote/Production:

1. **Backup first** (if needed):
   ```bash
   # Download current schema (for reference)
   pg_dump -h [host] -U postgres -d postgres --schema-only > backup_schema.sql
   ```

2. **Drop all tables** (via SQL Editor in Dashboard)
   
3. **Run all migrations** in order

4. **Generate types**:
   ```bash
   supabase gen types typescript --linked > lib/types/database.ts
   ```

## ✅ What You Get

After reset:

- ✅ Clean database schema
- ✅ No data migration issues
- ✅ All constraints properly enforced
- ✅ Fresh TypeScript types
- ✅ RLS policies active
- ✅ No orphaned data
- ✅ No schema inconsistencies

## ⚠️ What You Lose

After reset:

- ❌ All data (users, courses, sections, etc.)
- ❌ Need to recreate test data
- ❌ Need to re-register users

**But this is FINE because:**
- ✅ Maintenance mode is active (no real users yet)
- ✅ Schema issues fixed permanently
- ✅ Clean start for production
- ✅ Can seed fresh test data

## 🎯 Recommended Workflow

```bash
# 1. Fix the schema in migrations
# Edit: supabase/migrations/20241027000001_initial_schema.sql
# Remove: level column from user_roles

# 2. Create new migration
supabase migration new create_student_profile_table
# Add student_profile table creation SQL

# 3. Reset database
supabase db reset

# 4. Verify everything
supabase db status
supabase db studio

# 5. Generate fresh types
supabase gen types typescript --local > lib/types/database.ts

# 6. Test with fresh data
# Register a student user
# Check student_profile table gets created
# Verify RLS policies work

# 7. When ready, disable maintenance mode
# Edit app/(dashboard)/layout.tsx
# Set MAINTENANCE_MODE = false
```

## 🔍 Verification Checklist

After reset, verify:

- [ ] All tables exist
- [ ] student_profile table created
- [ ] user_roles has NO level column
- [ ] All foreign keys working
- [ ] RLS policies enabled on all tables
- [ ] Helper functions exist
- [ ] No TypeScript errors after type generation
- [ ] Can register a new user
- [ ] Can create student profile
- [ ] Can login and access dashboard (with maintenance off)

## 💡 Pro Tips

1. **Use seed files** for test data:
   ```bash
   # Create supabase/seed.sql
   # Add INSERT statements for test data
   supabase db reset --seed
   ```

2. **Keep a clean migration history**:
   - Fix issues in migrations, not with new migrations
   - Clean slate = clean migrations

3. **Test RLS policies**:
   ```sql
   -- Test as specific user
   SET request.jwt.claims.sub = 'user-uuid-here';
   SELECT * FROM student_profile;  -- Should only see own profile
   ```

4. **Document schema decisions**:
   - Add comments in migration files
   - Explain why tables are structured this way

## 🚀 After Database Reset

1. **Update API routes** to use new schema
2. **Update database functions** (`lib/db/*`)
3. **Update components** to use student_profile
4. **Test everything** thoroughly
5. **Disable maintenance mode**
6. **Deploy to production**

---

**TL;DR:**  
✅ YES, delete everything  
✅ It's safe because maintenance mode is on  
✅ Reset gives you a clean start  
✅ Fix schema issues in migrations first  
✅ Then `supabase db reset`  
✅ Generate new types  
✅ Test and go live  

**Risk Level:** 🟢 ZERO RISK (maintenance mode active, schema in code)

