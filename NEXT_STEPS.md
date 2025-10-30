# 🚀 Next Steps - Database Simplification

**Created:** October 30, 2025  
**Current Status:** ✅ Migrations ready, documentation complete  
**Next Action:** Apply migrations and update code

---

## ✅ What's Been Done

### 1. Migrations Created
- ✅ `20251030154649_simplify_user_roles_to_basics.sql`
  - Removes bloat from `user_roles`
  - Drops: level, department, enrollment_year, expected_graduation_year, onboarding_completed, student_group_id
  - Keeps: user_id, name, email, role, timestamps
  
- ✅ `20251030154721_create_student_profile_table.sql`
  - Creates dedicated `student_profile` table
  - Auto-creates profile for students (trigger)
  - Includes RLS policies and indexes

### 2. Documentation Created
- ✅ `DATABASE_SIMPLIFICATION_GUIDE.md` - Complete implementation guide
- ✅ `SIMPLIFIED_SCHEMA_SUMMARY.md` - Quick overview with examples
- ✅ `SCHEMA_COMPARISON.md` - Before/after visual comparison
- ✅ `NEXT_STEPS.md` - This file (action plan)
- ✅ `QUICK_REFERENCE.md` - Updated with new schema
- ✅ `AUTH_ONLY_MODE.md` - Auth flow documentation

### 3. Maintenance Mode Active
- ✅ Auth works (register → verify → login)
- ✅ Personalized maintenance message shows: "Welcome, {NAME}! {ROLE} Dashboard is in Maintenance"
- ✅ All dashboard features blocked until schema is updated

---

## 📋 Your Action Plan

### Phase 1: Apply Migrations (5 minutes)

```bash
# 1. Start Docker (if not running)
open -a Docker
# Wait for Docker to start...

# 2. Navigate to project
cd /Users/waleedkhalid/Documents/Projects/SSv2

# 3. Reset database (applies ALL migrations including new ones)
supabase db reset --local

# 4. Verify migrations applied
supabase migration list

# Expected output should show:
# ✅ 20251030154649_simplify_user_roles_to_basics.sql
# ✅ 20251030154721_create_student_profile_table.sql
```

### Phase 2: Regenerate Types (1 minute)

```bash
# Generate fresh TypeScript types from new schema
supabase gen types typescript --local > lib/types/database.ts

# Or use the npm script
pnpm db:types

# Verify: Check that types are updated
cat lib/types/database.ts | grep "student_profile"
# Should show student_profile type definition
```

### Phase 3: Update Application Code (30-60 minutes)

See `DATABASE_SIMPLIFICATION_GUIDE.md` for detailed code changes.

**Priority files to update:**

#### 1. Registration (`app/(auth)/actions.ts`)
- [x] Current: Tries to insert `level` into `user_roles`
- [ ] Update: Remove `level` from insert, rely on auto-trigger for `student_profile`

#### 2. Student Dashboard (`app/(dashboard)/dashboard/student/page.tsx`)
- [x] Current: Queries `user_roles.level`
- [ ] Update: Join with `student_profile` for student data

#### 3. API Routes
- [ ] `app/api/student/enrollments/route.ts` - Update queries
- [ ] `app/api/student/available-sections/route.ts` - Update queries
- [ ] `app/api/student/profile/route.ts` - Create new route for profile

#### 4. Database Layer (`lib/db/`)
- [ ] Create `lib/db/student-profile.ts` - CRUD operations for student profiles
- [ ] Update `lib/db/students.ts` - Use joins for student data

#### 5. Components
- [ ] Any component accessing `level` or `student_group_id` from `user_roles`
- [ ] Update to query from `student_profile` instead

### Phase 4: Test Everything (15 minutes)

```bash
# Start app
pnpm dev

# Test 1: Register as student
# 1. Go to /register
# 2. Fill: Name, Email, Password, Role=Student, Level=1
# 3. Submit → Verify email → Login
# 4. Check database:

# SQL:
SELECT ur.name, ur.role, sp.level 
FROM user_roles ur
LEFT JOIN student_profile sp ON ur.user_id = sp.user_id
WHERE ur.role = 'student';

# Expected: Should show student with level=1 in student_profile

# Test 2: Register as faculty
# 1. Go to /register
# 2. Fill: Name, Email, Password, Role=Faculty
# 3. Submit → Verify email → Login
# 4. Check database:

# SQL:
SELECT ur.name, ur.role, sp.level 
FROM user_roles ur
LEFT JOIN student_profile sp ON ur.user_id = sp.user_id
WHERE ur.role = 'faculty';

# Expected: sp.level should be NULL (no student_profile record)

# Test 3: Check user_roles structure
# SQL:
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_roles';

# Expected: Only 6 columns
# - user_id
# - role
# - name
# - email
# - created_at
# - updated_at
```

### Phase 5: Disable Maintenance Mode (2 minutes)

**ONLY after all tests pass!**

```typescript
// 1. Edit app/(dashboard)/layout.tsx

// Line 13: Change to false
const MAINTENANCE_MODE = false;  // ✅ Disable maintenance

// Lines 4-6: Uncomment imports
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AppHeader } from "@/components/app-header";

// Lines 274-286: Uncomment normal layout
return (
  <SidebarProvider>
    <div className="flex h-screen w-full overflow-hidden">
      <AppSidebar user={user} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AppHeader />
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  </SidebarProvider>
);

// 2. Save and test
pnpm dev

// 3. Visit /dashboard - should see normal dashboard, not maintenance
```

### Phase 6: Deploy to Production (When Ready)

```bash
# 1. Push migrations to remote
supabase link --project-ref YOUR_PROJECT_REF
supabase db push

# 2. Commit and push code
git add .
git commit -m "Simplify schema: Clean user_roles, add student_profile"
git push

# 3. Deploy (Vercel, etc.)
# Your deployment platform will rebuild

# 4. Monitor logs for errors
# Check Supabase dashboard for migration status
```

---

## 🎯 Quick Start (TL;DR)

If you just want to get started:

```bash
# 1. Apply migrations
supabase db reset --local

# 2. Regenerate types
pnpm db:types

# 3. Update code (see DATABASE_SIMPLIFICATION_GUIDE.md)

# 4. Test

# 5. Disable maintenance mode (when ready)
```

---

## 📁 File Reference

### Migrations (Apply These)
- `supabase/migrations/20251030154649_simplify_user_roles_to_basics.sql`
- `supabase/migrations/20251030154721_create_student_profile_table.sql`

### Documentation (Read These)
- `DATABASE_SIMPLIFICATION_GUIDE.md` - **START HERE** - Complete guide
- `SIMPLIFIED_SCHEMA_SUMMARY.md` - Quick overview
- `SCHEMA_COMPARISON.md` - Before/after comparison
- `QUICK_REFERENCE.md` - Quick commands
- `AUTH_ONLY_MODE.md` - Current auth setup

### Code to Update (After Migrations)
- `app/(auth)/actions.ts` - Registration
- `app/(dashboard)/dashboard/student/page.tsx` - Student dashboard
- `app/api/student/*` - Student API routes
- `lib/db/students.ts` - Database queries
- Create: `lib/db/student-profile.ts` - New file for student profiles

---

## ❓ FAQ

### Q: Will existing data be lost?
**A:** The migrations use `DROP COLUMN IF EXISTS CASCADE`, which will remove data from those columns. However:
- Since you're in maintenance mode with auth-only, you likely have minimal/test data
- The important data (user_id, name, email, role) is preserved
- Student-specific data (level, etc.) should be re-entered or migrated if needed

### Q: What happens to existing students?
**A:** 
- Their `user_roles` record remains (with name, email, role)
- Their student-specific data (level, department) is dropped
- When they next login, you can prompt them to set their level
- Or you can manually create `student_profile` records for them

### Q: Can I migrate existing student data?
**A:** Yes! After applying migrations, run this SQL:

```sql
-- If you saved student data somewhere, insert it:
INSERT INTO student_profile (user_id, level, department)
SELECT 
  user_id,
  1 AS level,  -- Default level (update as needed)
  'Software Engineering' AS department
FROM user_roles
WHERE role = 'student'
ON CONFLICT (user_id) DO NOTHING;
```

### Q: What if I want to rollback?
**A:** You can:
1. Not apply the migrations (keep current schema)
2. Create reverse migrations to add columns back
3. Use `supabase db reset` to go back to a previous migration

But the new schema is cleaner and recommended!

### Q: Do I need to update the registration form?
**A:** No! The trigger auto-creates `student_profile` for students. But you should:
- Remove `level` field from registration form (or make it update `student_profile` after creation)
- Or add a separate "student onboarding" step after registration

---

## ✅ Success Criteria

You'll know you're done when:

- [ ] Migrations applied: `supabase migration list` shows them as applied
- [ ] Types regenerated: `lib/types/database.ts` shows `student_profile` type
- [ ] `user_roles` has 6 columns (verified in Supabase Studio)
- [ ] `student_profile` table exists (verified in Supabase Studio)
- [ ] Student registration creates `student_profile` automatically
- [ ] Faculty registration does NOT create `student_profile`
- [ ] No linter errors
- [ ] No console errors
- [ ] All tests pass
- [ ] Maintenance mode disabled
- [ ] Dashboard loads correctly
- [ ] Users can access their features

---

## 🆘 Need Help?

### If migrations fail:
1. Check Docker is running: `docker ps`
2. Check Supabase is running: `supabase status`
3. View logs: `supabase logs db`
4. Try reset: `supabase db reset`

### If types don't generate:
1. Verify migrations applied: `supabase migration list`
2. Check Supabase running: `supabase status`
3. Manually generate: `supabase gen types typescript --local`

### If auto-creation doesn't work:
1. Check trigger exists:
```sql
SELECT * FROM information_schema.triggers 
WHERE event_object_table = 'user_roles';
```
2. Test manually:
```sql
INSERT INTO user_roles (user_id, role, name, email)
VALUES (gen_random_uuid(), 'student', 'Test', 'test@test.com');

-- Check if student_profile was created
SELECT * FROM student_profile WHERE user_id = (
  SELECT user_id FROM user_roles WHERE email = 'test@test.com'
);
```

---

## 🎉 Ready to Go!

**You have:**
- ✅ Clean migrations ready to apply
- ✅ Comprehensive documentation
- ✅ Clear action plan
- ✅ Test scenarios
- ✅ Success criteria

**Next action:**
```bash
supabase db reset --local
```

**Then:**
Read `DATABASE_SIMPLIFICATION_GUIDE.md` for detailed code updates.

---

**Good luck! You got this! 🚀**

