# 🚨 GLOBAL MAINTENANCE MODE ACTIVATED

**Status:** ALL DASHBOARD FEATURES OFFLINE  
**Date:** October 30, 2025  
**Reason:** Critical Database Schema Restructuring  
**Affected:** 100% of dashboard functionality

## 🎯 Maintenance Mode Overview

A **global maintenance flag** has been activated in the dashboard layout. When `MAINTENANCE_MODE = true`, ALL users see a comprehensive maintenance page instead of any dashboard content.

## 📍 Implementation Location

**File:** `app/(dashboard)/layout.tsx`  
**Line:** 11 - `const MAINTENANCE_MODE = true;`

### To Disable Maintenance Mode:
```typescript
// Change line 11 in app/(dashboard)/layout.tsx
const MAINTENANCE_MODE = false;  // Set to false when ready
```

## 🔴 Why Global Maintenance Was Necessary

### Critical Issues Found

1. **User Roles Table Design Flaw**
   ```sql
   -- PROBLEM: user_roles has student-specific columns
   CREATE TABLE user_roles (
     user_id UUID,
     role TEXT,  -- 'student', 'faculty', 'scheduling', etc.
     level INTEGER,  -- ❌ Only applies to students!
     name TEXT,
     email TEXT
   );
   
   -- This causes:
   -- • Faculty with NULL level (doesn't make sense)
   -- • Admin with NULL level (poor design)
   -- • Data integrity issues
   ```

2. **API Failures**
   - ❌ 500 Error: `/api/student/enrollments`
   - ❌ 500 Error: `/api/student/available-sections`
   - ❌ 500 Error: `/api/student/enrollments?stats=true`

3. **Schema Migration Issues**
   - `schedule_comment.student_id` → `author_id` incomplete
   - Multiple API routes still using old schema
   - Component updates incomplete

## 🛠️ Required Database Changes

### 1. Create Student Profile Table

```sql
-- New table for student-specific data
CREATE TABLE student_profile (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 7),
  major TEXT,
  academic_standing TEXT,
  expected_graduation DATE,
  advisor_id UUID REFERENCES instructor(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_student_profile_user_id ON student_profile(user_id);
CREATE INDEX idx_student_profile_level ON student_profile(level);

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

CREATE POLICY "Admin can manage all profiles"
  ON student_profile FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());
```

### 2. Update User Roles Table

```sql
-- Remove student-specific columns
ALTER TABLE user_roles DROP COLUMN IF EXISTS level;
ALTER TABLE user_roles DROP COLUMN IF EXISTS major;

-- user_roles should only have:
-- • user_id (FK to auth.users)
-- • role (enum: student, faculty, scheduling, teaching_load, registrar)
-- • name
-- • email
-- • created_at
-- • updated_at
```

### 3. Update All Foreign Keys

```sql
-- Update elective_preference table
ALTER TABLE elective_preference 
  ADD CONSTRAINT elective_preference_student_profile_fkey
  FOREIGN KEY (student_id) REFERENCES student_profile(user_id);

-- Update student_enrollment table
ALTER TABLE student_enrollment
  ADD CONSTRAINT student_enrollment_student_profile_fkey
  FOREIGN KEY (student_id) REFERENCES student_profile(user_id);

-- Update other student-related tables...
```

### 4. Migrate Existing Data

```sql
-- Insert existing student data into student_profile
INSERT INTO student_profile (user_id, level, created_at)
SELECT user_id, level, created_at
FROM user_roles
WHERE role = 'student' AND level IS NOT NULL;
```

## 📊 Affected Systems

### 100% Affected (All Dashboard Pages)

Every dashboard route is blocked by the global maintenance mode:

1. **Student Features**
   - ❌ Student dashboard
   - ❌ Course registration
   - ❌ Schedule view
   - ❌ Exam timetable
   - ❌ Feedback system
   - ❌ Elective preferences

2. **Faculty Features**
   - ❌ Faculty dashboard
   - ❌ Teaching schedule
   - ❌ Availability management
   - ❌ Feedback viewing

3. **Admin Features**
   - ❌ Scheduling dashboard
   - ❌ Course management
   - ❌ Section management
   - ❌ Instructor management
   - ❌ Room management
   - ❌ Timeline management
   - ❌ Analytics & reporting

4. **All Other Features**
   - ❌ Teaching load dashboard
   - ❌ Registrar features
   - ❌ Import/Export
   - ❌ Notifications
   - ❌ Settings

### ✅ Still Accessible

- ✅ Login/Register pages
- ✅ Maintenance info page (`/maintenance`)
- ✅ Sign out functionality

## 🔧 What Users See

When users log in and try to access any dashboard route, they see:

```
┌─────────────────────────────────────────┐
│      🔴 Database Maintenance            │
│   System-Wide Schema Restructuring      │
├─────────────────────────────────────────┤
│                                         │
│  🚨 All Dashboard Features              │
│     Temporarily Unavailable             │
│                                         │
│  We're performing critical database     │
│  schema restructuring...                │
│                                         │
│  Issues Being Resolved:                 │
│  • 500 Error: /api/student/enrollments │
│  • Database schema normalization       │
│  • Student profile separation          │
│                                         │
│  [ View Technical Details ]             │
│  [      Sign Out         ]              │
└─────────────────────────────────────────┘
```

## 📋 Development Checklist

To complete maintenance and restore service:

### Phase 1: Database Schema ⏳
- [ ] Create `student_profile` table
- [ ] Migrate data from `user_roles.level` to `student_profile`
- [ ] Remove `level` column from `user_roles`
- [ ] Update all foreign key constraints
- [ ] Create RLS policies for `student_profile`
- [ ] Test with sample data

### Phase 2: Database Functions ⏳
- [ ] Update `lib/db/students.ts` (create if doesn't exist)
- [ ] Update `lib/db/faculty.ts`
- [ ] Update `lib/db/schedule-comments.ts`
- [ ] Update `lib/db/elective-preferences.ts`
- [ ] Update all other database access layers

### Phase 3: API Routes ⏳
- [ ] Fix `/api/student/enrollments`
- [ ] Fix `/api/student/available-sections`
- [ ] Fix `/api/student/schedule`
- [ ] Update all student-related API routes
- [ ] Update comment API routes
- [ ] Test all API endpoints

### Phase 4: Components ⏳
- [ ] Update `StudentCommentManager`
- [ ] Update `ElectiveRegistrationManager`
- [ ] Update `StudentScheduleView`
- [ ] Update all student profile displays
- [ ] Update faculty components

### Phase 5: Type Generation ⏳
- [ ] Regenerate database types: `pnpm db:types`
- [ ] Fix TypeScript errors
- [ ] Run linter
- [ ] Verify no compilation errors

### Phase 6: Testing ⏳
- [ ] Test student registration flow
- [ ] Test student enrollment
- [ ] Test faculty features
- [ ] Test admin features
- [ ] Test RLS policies
- [ ] Verify all API routes return 200

### Phase 7: Deployment ⏳
- [ ] Deploy database migrations
- [ ] Deploy code changes
- [ ] **Set `MAINTENANCE_MODE = false`**
- [ ] Monitor error logs
- [ ] Verify system functionality

## 🔄 Disabling Maintenance Mode

When all work is complete:

1. **Verify Everything Works**
   ```bash
   # Run all tests
   pnpm test
   
   # Check for errors
   pnpm lint
   
   # Test API endpoints
   curl http://localhost:3000/api/student/enrollments
   ```

2. **Update Layout**
   ```typescript
   // app/(dashboard)/layout.tsx - Line 11
   const MAINTENANCE_MODE = false;  // ✅ Ready to go!
   ```

3. **Deploy**
   ```bash
   git add app/(dashboard)/layout.tsx
   git commit -m "feat: Disable maintenance mode - schema restructuring complete"
   git push
   ```

4. **Monitor**
   - Watch error logs for 24-48 hours
   - Be ready to re-enable if issues arise
   - Have rollback plan ready

## ⚠️ Emergency Rollback

If critical issues occur after disabling maintenance:

```typescript
// app/(dashboard)/layout.tsx - Line 11
const MAINTENANCE_MODE = true;  // 🚨 Emergency re-enable
```

This immediately blocks all dashboard access and shows maintenance page.

## 📞 Support Information

- **Technical Lead:** Development Team
- **Issue Tracking:** GitHub Issues
- **Documentation:** `/SCHEMA_MIGRATION_GUIDE.md`
- **Status Updates:** This file + `/MAINTENANCE_SUMMARY.md`

## 🎯 Success Criteria

Maintenance can be disabled when:

- ✅ All database migrations complete
- ✅ All API routes return proper responses
- ✅ No TypeScript errors
- ✅ All RLS policies tested
- ✅ Student profile system working
- ✅ Zero 500 errors in logs
- ✅ Full regression testing passed

---

**Current Status:** 🔴 MAINTENANCE MODE ACTIVE  
**Last Updated:** October 30, 2025  
**Toggle Location:** `app/(dashboard)/layout.tsx:11`  
**Quick Disable:** Set `MAINTENANCE_MODE = false`

