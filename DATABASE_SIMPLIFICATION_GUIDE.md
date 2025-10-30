# 🗃️ Database Simplification Guide

**Created:** October 30, 2025  
**Status:** Ready to Apply  
**Impact:** Simplifies user_roles table, creates dedicated student_profile table

---

## 📋 Overview

This guide documents the database schema simplification that addresses the core issue: **role-agnostic vs role-specific data**.

### The Problem

The `user_roles` table had become bloated with columns that only applied to students:
- `level` - Only for students (1-8), NULL for faculty/admin
- `student_group_id` - Only for students, NULL for everyone else
- `department` - Only relevant for students
- `enrollment_year` - Only for students
- `expected_graduation_year` - Only for students
- `onboarding_completed` - System flag, not user data

**Result:** Faculty and admin users had many NULL columns, making the schema confusing and error-prone.

### The Solution

**Two-table approach:**

1. **`user_roles`** - ONLY basic, universal user info (applies to ALL users)
2. **`student_profile`** - ONLY student-specific academic data (students ONLY)

---

## 🎯 What Changed

### Before: `user_roles` (Bloated)

```sql
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY,
  role user_role NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  level INT,                        -- ❌ Student-only
  department TEXT,                  -- ❌ Student-only
  enrollment_year INT,              -- ❌ Student-only
  expected_graduation_year INT,     -- ❌ Student-only
  onboarding_completed BOOLEAN,     -- ❌ System flag
  student_group_id UUID,            -- ❌ Student-only
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

### After: `user_roles` (Clean & Simple)

```sql
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY,         -- ✅ Universal
  role user_role NOT NULL,          -- ✅ Universal
  name TEXT NOT NULL,               -- ✅ Universal
  email TEXT NOT NULL,              -- ✅ Universal
  created_at TIMESTAMPTZ,           -- ✅ Universal
  updated_at TIMESTAMPTZ            -- ✅ Universal
);
```

**6 columns total. ALL apply to ALL users. No NULLs.**

### New: `student_profile` (Student-Specific)

```sql
CREATE TABLE student_profile (
  user_id UUID PRIMARY KEY,         -- ✅ References user_roles
  level INT NOT NULL,               -- ✅ Student academic level (1-8)
  student_group_id UUID,            -- ✅ Group assignment (nullable)
  department TEXT NOT NULL,         -- ✅ Student department
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Only students have records here. Faculty/admin have ZERO records.**

---

## 📊 Data Distribution

### `user_roles` Table
- **Records:** One per user (student, faculty, admin, all roles)
- **Purpose:** Basic identity and role assignment
- **Used by:** Authentication, authorization, user display

### `student_profile` Table
- **Records:** One per student ONLY
- **Purpose:** Academic metadata for students
- **Used by:** Course enrollment, section assignment, academic planning

---

## 🔄 Relationship Diagram

```
┌─────────────────────┐
│    auth.users       │ (Supabase managed)
│  (Authentication)   │
└──────────┬──────────┘
           │
           │ 1:1 (always exists)
           ▼
┌─────────────────────┐
│    user_roles       │
│ ─────────────────── │
│ user_id (PK)        │ ◄── All users
│ role                │     (student, faculty, admin, etc.)
│ name                │
│ email               │
│ created_at          │
│ updated_at          │
└──────────┬──────────┘
           │
           │ 1:0..1 (only if role='student')
           ▼
┌─────────────────────┐
│  student_profile    │
│ ─────────────────── │
│ user_id (PK, FK)    │ ◄── Students only
│ level               │
│ student_group_id    │
│ department          │
│ created_at          │
│ updated_at          │
└─────────────────────┘
```

---

## 🛠️ Migrations Created

### 1. `20251030154649_simplify_user_roles_to_basics.sql`

**Purpose:** Remove all bloat from `user_roles`

**Changes:**
- ❌ Drops `level` column
- ❌ Drops `department` column
- ❌ Drops `enrollment_year` column
- ❌ Drops `expected_graduation_year` column
- ❌ Drops `onboarding_completed` column
- ❌ Drops `student_group_id` column
- ✅ Drops old RLS policies
- ✅ Creates new, cleaner RLS policies
- ✅ Adds documentation comments

**Final Schema:**
```
user_id      | uuid                     | NOT NULL | PK
role         | user_role                | NOT NULL
name         | text                     | NOT NULL
email        | text                     | NOT NULL
created_at   | timestamptz              | DEFAULT NOW()
updated_at   | timestamptz              | DEFAULT NOW()
```

### 2. `20251030154721_create_student_profile_table.sql`

**Purpose:** Create dedicated table for student data

**Changes:**
- ✅ Creates `student_profile` table
- ✅ Adds indexes for performance (level, student_group_id)
- ✅ Enables RLS with proper policies
- ✅ Creates auto-trigger: when a student is added to `user_roles`, automatically create their `student_profile` with default level=1
- ✅ Adds comprehensive documentation

**Automatic Behavior:**
When you register a user with `role='student'`, the trigger automatically:
1. Creates their record in `user_roles`
2. Creates their record in `student_profile` with:
   - `level = 1` (default)
   - `department = 'Software Engineering'` (default)
   - `student_group_id = NULL` (assigned later)

---

## 🚀 How to Apply

### Step 1: Apply Migrations

```bash
# Start Docker (if not running)
docker start

# Reset database (applies all migrations in order)
supabase db reset --local

# Or apply to production (when ready)
supabase db push
```

### Step 2: Regenerate TypeScript Types

```bash
# Generate fresh types
supabase gen types typescript --local > lib/types/database.ts

# Or using npm script
pnpm db:types
```

### Step 3: Update Application Code

See "Code Changes Required" section below.

### Step 4: Test

```bash
# Test registration flow
# 1. Register as student → Should auto-create student_profile
# 2. Register as faculty → Should NOT create student_profile
# 3. Login and verify data structure

# Test queries
# Check user_roles structure
# Check student_profile structure
# Verify RLS policies work
```

---

## 💻 Code Changes Required

### 1. Registration Flow

**Before:**
```typescript
// app/(auth)/actions.ts
await supabase.from('user_roles').insert({
  user_id: user.id,
  role: formData.get('role'),
  name: formData.get('name'),
  email: user.email,
  level: formData.get('level'),  // ❌ Removed
  department: 'Software Engineering'  // ❌ Removed
})
```

**After:**
```typescript
// Step 1: Create user_roles record (for ALL users)
await supabase.from('user_roles').insert({
  user_id: user.id,
  role: formData.get('role'),
  name: formData.get('name'),
  email: user.email
})

// Step 2: If student, update their auto-created profile
if (formData.get('role') === 'student') {
  await supabase.from('student_profile').update({
    level: parseInt(formData.get('level')),
    department: formData.get('department') || 'Software Engineering'
  }).eq('user_id', user.id)
}
```

### 2. Fetching Student Data

**Before:**
```typescript
const { data: student } = await supabase
  .from('user_roles')
  .select('name, email, level, student_group_id')  // ❌ level no longer here
  .eq('user_id', userId)
  .single()
```

**After:**
```typescript
const { data: student } = await supabase
  .from('user_roles')
  .select(`
    name,
    email,
    role,
    student_profile (
      level,
      student_group_id,
      department
    )
  `)
  .eq('user_id', userId)
  .single()

// Access: student.student_profile.level
```

### 3. Student-Specific Queries

**Before:**
```typescript
// Get all level 3 students
const { data } = await supabase
  .from('user_roles')
  .select('*')
  .eq('role', 'student')
  .eq('level', 3)  // ❌ level no longer in user_roles
```

**After:**
```typescript
// Get all level 3 students
const { data } = await supabase
  .from('student_profile')
  .select(`
    level,
    student_group_id,
    user_roles (
      name,
      email
    )
  `)
  .eq('level', 3)
```

### 4. Dashboard Components

**Before:**
```typescript
const { data: userRole } = await supabase
  .from('user_roles')
  .select('name, role, level')
  .eq('user_id', user.id)
  .single()

if (userRole.role === 'student') {
  const currentLevel = userRole.level  // ❌ No longer here
}
```

**After:**
```typescript
const { data: userRole } = await supabase
  .from('user_roles')
  .select(`
    name,
    role,
    student_profile (
      level,
      student_group_id
    )
  `)
  .eq('user_id', user.id)
  .single()

if (userRole.role === 'student') {
  const currentLevel = userRole.student_profile?.level ?? 1
}
```

---

## 🔍 Verification Queries

### Check `user_roles` Structure
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'user_roles' 
ORDER BY ordinal_position;

-- Expected: 6 columns
-- user_id, role, name, email, created_at, updated_at
```

### Check `student_profile` Structure
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'student_profile' 
ORDER BY ordinal_position;

-- Expected: 6 columns
-- user_id, level, student_group_id, department, created_at, updated_at
```

### Verify Auto-Creation Works
```sql
-- Register a student user, then check:
SELECT 
  ur.name,
  ur.role,
  sp.level,
  sp.department
FROM user_roles ur
LEFT JOIN student_profile sp ON ur.user_id = sp.user_id
WHERE ur.role = 'student';

-- All students should have a student_profile record
```

### Verify Faculty Has No Profile
```sql
SELECT 
  ur.name,
  ur.role,
  sp.level
FROM user_roles ur
LEFT JOIN student_profile sp ON ur.user_id = sp.user_id
WHERE ur.role = 'faculty';

-- sp.level should be NULL for all faculty
```

---

## 📁 Files to Update

### Database Layer (`lib/db/`)

**Update these files:**
- [ ] `lib/db/students.ts` - Update queries to join with `student_profile`
- [ ] `lib/db/user-roles.ts` - Simplify to only basic fields

**Example:**
```typescript
// lib/db/students.ts
export async function getStudentProfile(userId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('user_roles')
    .select(`
      user_id,
      name,
      email,
      role,
      student_profile (
        level,
        student_group_id,
        department
      )
    `)
    .eq('user_id', userId)
    .eq('role', 'student')
    .single()
  
  if (error) throw error
  return data
}
```

### API Routes (`app/api/`)

**Update these routes:**
- [ ] `app/api/student/enrollments/route.ts`
- [ ] `app/api/student/available-sections/route.ts`
- [ ] `app/api/student/profile/route.ts`

### Components

**Update these components:**
- [ ] `app/(dashboard)/dashboard/student/page.tsx` - Update data fetching
- [ ] `app/(auth)/register/register-form.tsx` - Update registration logic
- [ ] Any component that accesses `level` or `student_group_id`

---

## ✅ Benefits

### 1. Clean Schema
- ✅ `user_roles` has NO null columns
- ✅ Every field applies to every user
- ✅ Clear separation of concerns

### 2. Better Type Safety
```typescript
// Before: level could be null for faculty
type UserRole = {
  name: string
  role: 'student' | 'faculty'
  level?: number  // ❌ Confusing - when is it present?
}

// After: Clean types
type UserRole = {
  name: string
  role: 'student' | 'faculty'
  email: string
}

type StudentProfile = {
  level: number  // ✅ Always present for students
  student_group_id: string | null
  department: string
}
```

### 3. Easier Queries
```typescript
// Get all students at a specific level
const { data } = await supabase
  .from('student_profile')
  .select('*')
  .eq('level', 3)

// No need to filter by role='student' - table only has students!
```

### 4. Automatic Profile Creation
When a student registers, their `student_profile` is auto-created. No manual creation needed!

### 5. Future-Proof
Adding student-specific fields is easy:
```sql
-- Add a new student-only field
ALTER TABLE student_profile ADD COLUMN gpa DECIMAL(3,2);

-- Faculty/admin unaffected!
```

---

## 🔐 Security (RLS Policies)

### `user_roles` Policies

```sql
-- Users view own record
"Users can view own role" - SELECT WHERE user_id = auth.uid()

-- Users update own name only
"Users can update own name" - UPDATE WHERE user_id = auth.uid()

-- Admin views all
"Scheduling can view all users" - SELECT WHERE is_admin()

-- Admin manages all
"Scheduling can manage all users" - ALL WHERE is_admin()
```

### `student_profile` Policies

```sql
-- Students view own profile
"Students can view own profile" - SELECT WHERE user_id = auth.uid()

-- Students update own profile
"Students can update own profile" - UPDATE WHERE user_id = auth.uid()

-- Admin has full access
"Scheduling can view/manage all profiles" - ALL WHERE is_admin()

-- Registrar can view/update (for group assignment)
"Registrar can view/update profiles" - SELECT/UPDATE WHERE is_registrar_or_admin()

-- Faculty can view (for section planning)
"Faculty can view student profiles" - SELECT WHERE role IN ('faculty', 'teaching_load')
```

---

## 🎯 Testing Checklist

After applying migrations:

### Registration Tests
- [ ] Register as **student** → Should auto-create `student_profile` with level=1
- [ ] Register as **faculty** → Should NOT create `student_profile`
- [ ] Register as **admin** → Should NOT create `student_profile`

### Query Tests
- [ ] Query `user_roles` for all users → Should have 6 columns, no NULLs
- [ ] Query `student_profile` → Should only have student records
- [ ] Join query → Should properly link user_roles ↔ student_profile

### Update Tests
- [ ] Student updates their level → Should succeed
- [ ] Faculty tries to query `student_profile` → Should see data (RLS allows)
- [ ] Student tries to view other student's profile → Should fail (RLS blocks)

### Edge Cases
- [ ] Delete student user → Should cascade-delete `student_profile`
- [ ] Change user role from student to faculty → `student_profile` remains (manual cleanup needed)

---

## 📝 Summary

**What we did:**
1. ✅ Cleaned `user_roles` to 6 essential columns (no bloat)
2. ✅ Created `student_profile` for student-specific data
3. ✅ Added auto-trigger to create profiles for students
4. ✅ Set up proper RLS policies for both tables
5. ✅ Documented everything

**What you get:**
- Clean, role-agnostic `user_roles` table
- Dedicated `student_profile` for student data
- Automatic profile creation
- No NULL columns for faculty/admin
- Better type safety
- Easier maintenance

**Next steps:**
1. Apply migrations: `supabase db reset`
2. Regenerate types: `pnpm db:types`
3. Update code (see "Code Changes Required")
4. Test thoroughly
5. Deploy to production

---

**Migration Files:**
- `supabase/migrations/20251030154649_simplify_user_roles_to_basics.sql`
- `supabase/migrations/20251030154721_create_student_profile_table.sql`

**Ready to apply!** 🚀

