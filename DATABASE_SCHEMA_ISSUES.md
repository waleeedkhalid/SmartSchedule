# 🔴 Critical Database Schema Issues

**Severity:** CRITICAL  
**Impact:** System-Wide  
**Status:** GLOBAL MAINTENANCE ACTIVATED

## 🎯 Executive Summary

The application has fundamental database schema design flaws that require immediate restructuring. A global maintenance mode has been activated to prevent user access to broken features while the schema is corrected.

## 🚨 Critical Issues

### 1. User Roles Table Design Flaw

**Problem:** Student-specific data mixed with general user roles

```sql
-- CURRENT (BROKEN) SCHEMA
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY,
  role TEXT,           -- 'student', 'faculty', 'scheduling', etc.
  name TEXT,
  email TEXT,
  level INTEGER,       -- ❌ ONLY APPLIES TO STUDENTS!
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- RESULT:
-- • Faculty users have NULL level (meaningless)
-- • Admin users have NULL level (poor normalization)
-- • Teaching load users have NULL level (data integrity issue)
-- • Cannot enforce proper constraints
```

**Why This Is Wrong:**
- Violates database normalization principles (1NF)
- Creates NULL values that shouldn't exist
- Makes queries confusing (need to check role before using level)
- Causes application errors when code assumes level exists
- Poor data integrity

### 2. API Failures

**Confirmed Errors:**
```
❌ 500 Error: /api/student/enrollments
❌ 500 Error: /api/student/available-sections?available_only=false
❌ 500 Error: /api/student/enrollments?stats=true
```

**Root Cause:**
These APIs likely query `user_roles.level` but:
1. Faculty/admin users hit these endpoints (NULL level)
2. JOIN queries fail when level is NULL
3. Business logic assumes level always exists for students

### 3. Incomplete Schema Migration

**Schedule Comment Table:**
```sql
-- PARTIALLY MIGRATED (BROKEN STATE)
ALTER TABLE schedule_comment RENAME COLUMN student_id TO author_id;

-- BUT:
-- • Many API routes still use old column name
-- • Components reference old schema
-- • Database functions not updated
-- • Foreign key references inconsistent
```

## 📋 Required Schema Changes

### Solution 1: Create Student Profile Table

```sql
-- CORRECT SCHEMA
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('student', 'faculty', 'scheduling', 'teaching_load', 'registrar')),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- NEW: Separate table for student-specific data
CREATE TABLE student_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 7),
  major TEXT,
  minor TEXT,
  academic_standing TEXT DEFAULT 'good',
  expected_graduation DATE,
  advisor_id UUID REFERENCES instructor(id),
  gpa DECIMAL(3,2),
  total_credits INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE INDEX idx_student_profile_user_id ON student_profile(user_id);
CREATE INDEX idx_student_profile_level ON student_profile(level);
CREATE INDEX idx_student_profile_major ON student_profile(major);

COMMENT ON TABLE student_profile IS 'Student-specific profile data separate from general user roles';
COMMENT ON COLUMN student_profile.level IS 'Student academic level (1-7, typically 1-4 for undergrad)';
```

**Benefits:**
- ✅ Proper normalization
- ✅ No NULL confusion
- ✅ Clear separation of concerns
- ✅ Can add student-specific fields without affecting other roles
- ✅ Enforces data integrity with constraints
- ✅ Better query performance (smaller user_roles table)

### Solution 2: Migrate Existing Data

```sql
-- Step 1: Create student_profile table (from above)

-- Step 2: Migrate existing student data
INSERT INTO student_profile (user_id, level, created_at, updated_at)
SELECT 
  user_id, 
  level, 
  created_at, 
  updated_at
FROM user_roles
WHERE role = 'student' 
  AND level IS NOT NULL;

-- Step 3: Verify migration
SELECT COUNT(*) FROM student_profile;  -- Should match student count

-- Step 4: Remove student-specific columns from user_roles
ALTER TABLE user_roles DROP COLUMN level;

-- Step 5: Update foreign keys in dependent tables
ALTER TABLE elective_preference
  DROP CONSTRAINT IF EXISTS elective_preference_student_id_fkey,
  ADD CONSTRAINT elective_preference_student_profile_fkey
    FOREIGN KEY (student_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 6: Add NOT NULL constraints now that data is clean
ALTER TABLE user_roles ALTER COLUMN role SET NOT NULL;
ALTER TABLE user_roles ALTER COLUMN name SET NOT NULL;
```

## 🔧 Application Code Updates Required

### 1. Update Database Access Layer

**Create:** `lib/db/student-profile.ts`
```typescript
import { createClient } from '@/supabase/server';

export async function getStudentProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_profile')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw error;
  return data;
}

export async function getStudentsByLevel(level: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_profile')
    .select(`
      *,
      user:user_roles!student_profile_user_id_fkey(name, email)
    `)
    .eq('level', level);
  
  if (error) throw error;
  return data;
}
```

**Update:** All student-related queries
```typescript
// BEFORE (BROKEN)
const { data: student } = await supabase
  .from('user_roles')
  .select('*, level')  // ❌ level might be NULL!
  .eq('user_id', userId)
  .single();

// AFTER (CORRECT)
const { data: userRole } = await supabase
  .from('user_roles')
  .select('*')
  .eq('user_id', userId)
  .single();

const { data: studentProfile } = await supabase
  .from('student_profile')
  .select('*')
  .eq('user_id', userId)
  .single();

// Now userRole has role/name/email
// studentProfile has level/major/etc (only for students!)
```

### 2. Update API Routes

**Fix:** `/api/student/enrollments/route.ts`
```typescript
// BEFORE (BROKEN)
const { data: student } = await supabase
  .from('user_roles')
  .select('level')
  .eq('user_id', user.id)
  .single();

const level = student?.level;  // ❌ Might be NULL!

// AFTER (CORRECT)
const { data: studentProfile } = await supabase
  .from('student_profile')
  .select('level')
  .eq('user_id', user.id)
  .single();

if (!studentProfile) {
  return NextResponse.json(
    { error: 'Student profile not found' },
    { status: 404 }
  );
}

const level = studentProfile.level;  // ✅ Always exists!
```

### 3. Update Components

**Update:** Student profile displays
```typescript
// BEFORE (BROKEN)
const { user, role, level } = useAuth();  // ❌ level in auth context

// AFTER (CORRECT)
const { user, role } = useAuth();
const { data: profile } = useStudentProfile(user?.id);

// Then:
{role === 'student' && profile?.level && (
  <Badge>Level {profile.level}</Badge>
)}
```

### 4. Update Type Definitions

```typescript
// lib/types/database.ts
export interface StudentProfile {
  id: string;
  user_id: string;
  level: number;
  major: string | null;
  minor: string | null;
  academic_standing: string;
  expected_graduation: string | null;
  advisor_id: string | null;
  gpa: number | null;
  total_credits: number;
  created_at: string;
  updated_at: string;
}

export interface UserWithProfile {
  user_id: string;
  role: string;
  name: string;
  email: string;
  profile?: StudentProfile;  // Only exists for students
}
```

## 📊 Impact Analysis

### Tables Requiring Updates

1. ✅ **user_roles** - Remove student-specific columns
2. ✅ **student_profile** - Create new table
3. ⚠️ **elective_preference** - Update foreign keys
4. ⚠️ **student_enrollment** - Update foreign keys
5. ⚠️ **elective_comment** - Verify references
6. ⚠️ **schedule_comment** - Complete author_id migration
7. ⚠️ **irregular_student** - Update references

### API Routes Requiring Updates

- `/api/student/**` - All student endpoints (10+ routes)
- `/api/registrar/students` - Student management
- `/api/registrar/student-enrollments` - Enrollment management
- `/api/elective-preferences/**` - Preference management
- `/api/schedule-comments/**` - Comment system

### Pages Requiring Updates

- `app/(dashboard)/dashboard/student/**` - All student pages
- `app/(dashboard)/dashboard/preferences/**` - Preference pages
- `app/(dashboard)/dashboard/registrar/**` - Registrar pages
- All components displaying student info

## 🎯 Migration Strategy

### Phase 1: Database Schema (1-2 hours)
1. Create `student_profile` table
2. Migrate data from `user_roles.level`
3. Drop `level` column from `user_roles`
4. Update foreign key constraints
5. Create indexes
6. Add RLS policies

### Phase 2: Database Functions (1-2 hours)
1. Create `lib/db/student-profile.ts`
2. Update all student-related queries
3. Update enrollment functions
4. Update preference functions

### Phase 3: API Routes (2-3 hours)
1. Fix `/api/student/**` routes
2. Fix `/api/registrar/**` routes
3. Test all endpoints

### Phase 4: Components (1-2 hours)
1. Update auth context
2. Update student components
3. Update profile displays

### Phase 5: Testing (1-2 hours)
1. Unit tests
2. Integration tests
3. Manual testing

**Total Estimated Time: 6-11 hours**

## ✅ Testing Checklist

Before disabling maintenance mode:

### Database
- [ ] student_profile table created
- [ ] Data migrated successfully
- [ ] No orphaned records
- [ ] Foreign keys working
- [ ] RLS policies tested

### APIs
- [ ] /api/student/enrollments returns 200
- [ ] /api/student/available-sections returns 200
- [ ] All student APIs working
- [ ] No 500 errors in logs

### Application
- [ ] Students can view profile
- [ ] Students can register for courses
- [ ] Students can view schedule
- [ ] Level displays correctly
- [ ] No TypeScript errors

### Security
- [ ] Students can only see own profile
- [ ] Admins can see all profiles
- [ ] RLS policies enforced
- [ ] No data leaks

## 📝 Post-Migration Cleanup

After successful migration:

```sql
-- Verify no NULLs where they shouldn't be
SELECT COUNT(*) FROM user_roles WHERE role IS NULL;  -- Should be 0
SELECT COUNT(*) FROM student_profile WHERE level IS NULL;  -- Should be 0

-- Check data integrity
SELECT 
  (SELECT COUNT(*) FROM user_roles WHERE role = 'student') as total_students,
  (SELECT COUNT(*) FROM student_profile) as total_profiles;
-- These should match!

-- Update statistics
ANALYZE user_roles;
ANALYZE student_profile;
```

---

**Status:** 🔴 CRITICAL - Global Maintenance Active  
**Priority:** P0 - Blocks all functionality  
**Owner:** Development Team  
**ETA:** 6-11 hours

