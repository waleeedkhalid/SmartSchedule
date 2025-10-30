# 🧪 Quick Test Guide - All Roles Registration

**Time Required:** 10-15 minutes  
**Purpose:** Verify all 5 roles can register, verify email, login, and access dashboard

---

## 🚀 Quick Start

### Step 1: Start Your App
```bash
cd /Users/waleedkhalid/Documents/Projects/SSv2
pnpm dev
```

Open: http://localhost:3000

---

## 📝 Test Each Role (5 Quick Tests)

### Test 1: Student ✅

**Register:**
```
1. Go to: http://localhost:3000/register
2. Fill form:
   - Full Name: Test Student
   - Email: test.student@yourtest.com
   - Role: Student
   - Password: TestPass123!
   - Confirm: TestPass123!
3. Click "Create Account"
4. ✅ Should see: "Check your email"
```

**Verify Email (Supabase Dashboard):**
```
1. Go to: Supabase Dashboard → Authentication → Users
2. Find: test.student@yourtest.com
3. Click "..." → "Confirm email"
```

**Login:**
```
1. Go to: http://localhost:3000/login
2. Email: test.student@yourtest.com
3. Password: TestPass123!
4. Click "Sign In"
5. ✅ Should see: "Welcome, Test Student! Student Dashboard is in Maintenance"
```

**Verify Database:**
```sql
SELECT 
  ur.name, 
  ur.role, 
  sp.level, 
  sp.department
FROM user_roles ur
JOIN student_profile sp ON ur.user_id = sp.user_id
WHERE ur.email = 'test.student@yourtest.com';

-- Expected:
-- name: Test Student
-- role: student
-- level: 1
-- department: Software Engineering
```

---

### Test 2: Faculty ✅

**Register:**
```
Full Name: Test Faculty
Email: test.faculty@yourtest.com
Role: Faculty
Password: TestPass123!
```

**After verification and login:**
- ✅ Should see: "Welcome, Test Faculty! Faculty Dashboard is in Maintenance"

**Verify Database:**
```sql
SELECT 
  ur.name, 
  ur.role, 
  i.email
FROM user_roles ur
LEFT JOIN student_profile sp ON ur.user_id = sp.user_id
LEFT JOIN instructor i ON ur.user_id = i.user_id
WHERE ur.email = 'test.faculty@yourtest.com';

-- Expected:
-- name: Test Faculty
-- role: faculty
-- student_profile: NULL (no profile)
-- instructor.email: test.faculty@yourtest.com (has instructor)
```

---

### Test 3: Scheduling (Admin) ✅

**Register:**
```
Full Name: Test Admin
Email: test.admin@yourtest.com
Role: Scheduling
Password: TestPass123!
```

**After verification and login:**
- ✅ Should see: "Welcome, Test Admin! Scheduling Dashboard is in Maintenance"

**Verify Database:**
```sql
-- Should have user_roles only (no profile, no instructor)
SELECT ur.name, ur.role 
FROM user_roles ur
WHERE ur.email = 'test.admin@yourtest.com';
```

---

### Test 4: Registrar ✅

**Register:**
```
Full Name: Test Registrar
Email: test.registrar@yourtest.com
Role: Registrar
Password: TestPass123!
```

**After verification and login:**
- ✅ Should see: "Welcome, Test Registrar! Registrar Dashboard is in Maintenance"

---

### Test 5: Teaching Load ✅

**Register:**
```
Full Name: Test Teaching Load
Email: test.teaching@yourtest.com
Role: Teaching Load
Password: TestPass123!
```

**After verification and login:**
- ✅ Should see: "Welcome, Test Teaching Load! Teaching Load Dashboard is in Maintenance"

---

## ✅ Success Checklist

After testing all 5 roles:

- [ ] All 5 users registered successfully
- [ ] All 5 users received "Check your email" message
- [ ] All 5 users can have email verified (via dashboard)
- [ ] All 5 users can login successfully
- [ ] All 5 users see personalized maintenance message
- [ ] Student has student_profile with level=1
- [ ] Faculty has instructor record
- [ ] Admin/Registrar/Teaching Load have only user_roles
- [ ] No console errors during any step
- [ ] No errors in Supabase logs

---

## 🔍 Quick Verification Query

Run this in Supabase SQL Editor to see all test users:

```sql
SELECT 
  ur.name,
  ur.email,
  ur.role,
  CASE WHEN sp.user_id IS NOT NULL THEN '✅' ELSE '❌' END as has_student_profile,
  CASE WHEN i.user_id IS NOT NULL THEN '✅' ELSE '❌' END as has_instructor
FROM user_roles ur
LEFT JOIN student_profile sp ON ur.user_id = sp.user_id
LEFT JOIN instructor i ON ur.user_id = i.user_id
WHERE ur.email LIKE '%@yourtest.com'
ORDER BY ur.role;
```

**Expected Output:**
```
name               | email                      | role          | profile | instructor
-------------------+----------------------------+---------------+---------+-----------
Test Admin         | test.admin@yourtest.com    | scheduling    | ❌      | ❌
Test Registrar     | test.registrar@yourtest.com| registrar     | ❌      | ❌
Test Teaching Load | test.teaching@yourtest.com | teaching_load | ❌      | ❌
Test Faculty       | test.faculty@yourtest.com  | faculty       | ❌      | ✅
Test Student       | test.student@yourtest.com  | student       | ✅      | ❌
```

---

## 🧹 Cleanup After Testing

```sql
-- Delete all test users
DELETE FROM auth.users
WHERE email LIKE '%@yourtest.com';

-- This will cascade delete:
-- - user_roles
-- - student_profile
-- - instructor
```

---

## 🎉 If All Tests Pass

You're ready to:
1. ✅ Update any remaining API routes/components
2. ✅ Disable maintenance mode: `MAINTENANCE_MODE = false` in `app/(dashboard)/layout.tsx`
3. ✅ Test full dashboard functionality
4. ✅ Deploy to production

---

## ❌ If Any Test Fails

### Common Issues:

**1. "Check your email" doesn't appear**
- Check console for errors
- Check Supabase logs: Dashboard → Logs → Database

**2. student_profile not created**
- Check trigger exists: Run verification query in `REGISTRATION_FLOW_VERIFIED.md`
- Check Supabase logs

**3. instructor not created for faculty**
- Check `create_instructor_for_user` function exists
- Check console logs during registration

**4. Cannot login**
- Verify email must be confirmed first
- Check Supabase Auth logs

**5. Maintenance message doesn't show role**
- Check `app/(dashboard)/layout.tsx` query
- Verify user_roles record exists

---

## 📚 Related Documentation

- **`REGISTRATION_FLOW_VERIFIED.md`** - Complete verification details
- **`TEST_ALL_ROLES_REGISTRATION.md`** - Detailed test scenarios
- **`MIGRATIONS_APPLIED_SUMMARY.md`** - What was changed in database
- **`DATABASE_SIMPLIFICATION_GUIDE.md`** - Complete schema guide

---

**Estimated Time:** 10-15 minutes  
**Status:** Ready to test! 🚀

