# ✅ Test All Roles Registration Flow

**Date:** October 30, 2025  
**Purpose:** Verify all roles can register, verify email, login, and access dashboard

---

## 🧪 Test Summary

We need to verify the complete auth flow for all 5 roles:
1. **scheduling** (admin)
2. **registrar**
3. **teaching_load**
4. **faculty**
5. **student**

---

## ✅ Fixes Applied

### Fix 1: Update `handle_new_user()` Function
**Issue:** Function was trying to insert `onboarding_completed` column which was removed

**Fixed:** ✅ Migration applied
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role, name, email)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student'::user_role),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 📋 Test Plan

### For Each Role, Test:

1. **Registration**
   - Fill form with: name, email, password, role
   - Submit form
   - ✅ Should succeed
   - ✅ Should see "Check your email" message

2. **Database Verification**
   - ✅ `auth.users` record created
   - ✅ `user_roles` record created
   - ✅ If student: `student_profile` record created
   - ✅ If faculty: `instructor` record created (via RPC)

3. **Email Verification**
   - Check Supabase Auth logs for verification email
   - Click verification link (or mark as verified in dashboard)
   - ✅ Email should be confirmed

4. **Login**
   - Enter email and password
   - Submit login form
   - ✅ Should redirect to dashboard

5. **Dashboard Access**
   - ✅ Should see personalized maintenance message
   - ✅ Message shows: "Welcome, {Name}! {Role} Dashboard is in Maintenance"
   - ✅ Should see user info: account, role, status

---

## 🧪 Manual Test Steps

### Test 1: Student Registration

```
1. Open: http://localhost:3000/register
2. Fill form:
   - Full Name: "Alice Student"
   - Email: "alice.student@test.com"
   - Role: "Student"
   - Password: "TestPassword123!"
   - Confirm Password: "TestPassword123!"
3. Click "Create Account"
4. Expected: "Check your email for verification link"

Verify in Supabase:
```

```sql
-- Check auth.users
SELECT id, email, email_confirmed_at 
FROM auth.users 
WHERE email = 'alice.student@test.com';

-- Check user_roles (should have record)
SELECT user_id, role, name, email 
FROM user_roles 
WHERE email = 'alice.student@test.com';

-- Check student_profile (should have record with level=1)
SELECT user_id, level, department 
FROM student_profile 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'alice.student@test.com'
);
```

**Expected Results:**
- ✅ user_roles: 1 record (role='student', name='Alice Student')
- ✅ student_profile: 1 record (level=1, department='Software Engineering')

---

### Test 2: Faculty Registration

```
1. Open: http://localhost:3000/register
2. Fill form:
   - Full Name: "Bob Faculty"
   - Email: "bob.faculty@test.com"
   - Role: "Faculty"
   - Password: "TestPassword123!"
   - Confirm Password: "TestPassword123!"
3. Click "Create Account"
4. Expected: "Check your email for verification link"

Verify in Supabase:
```

```sql
-- Check user_roles (should have record)
SELECT user_id, role, name, email 
FROM user_roles 
WHERE email = 'bob.faculty@test.com';

-- Check student_profile (should have NO record)
SELECT COUNT(*) as profile_count
FROM student_profile 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'bob.faculty@test.com'
);

-- Check instructor (should have record)
SELECT id, user_id, name, email 
FROM instructor 
WHERE email = 'bob.faculty@test.com';
```

**Expected Results:**
- ✅ user_roles: 1 record (role='faculty', name='Bob Faculty')
- ✅ student_profile: 0 records (faculty doesn't get profile)
- ✅ instructor: 1 record (auto-created by RPC)

---

### Test 3: Scheduling (Admin) Registration

```
1. Open: http://localhost:3000/register
2. Fill form:
   - Full Name: "Carol Admin"
   - Email: "carol.admin@test.com"
   - Role: "Scheduling"
   - Password: "TestPassword123!"
   - Confirm Password: "TestPassword123!"
3. Click "Create Account"
4. Expected: "Check your email for verification link"

Verify in Supabase:
```

```sql
-- Check user_roles (should have record)
SELECT user_id, role, name, email 
FROM user_roles 
WHERE email = 'carol.admin@test.com';

-- Check student_profile (should have NO record)
SELECT COUNT(*) as profile_count
FROM student_profile 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'carol.admin@test.com'
);

-- Check instructor (should have NO record)
SELECT COUNT(*) as instructor_count
FROM instructor 
WHERE email = 'carol.admin@test.com';
```

**Expected Results:**
- ✅ user_roles: 1 record (role='scheduling', name='Carol Admin')
- ✅ student_profile: 0 records
- ✅ instructor: 0 records

---

### Test 4: Registrar Registration

```
1. Open: http://localhost:3000/register
2. Fill form:
   - Full Name: "David Registrar"
   - Email: "david.registrar@test.com"
   - Role: "Registrar"
   - Password: "TestPassword123!"
3. Click "Create Account"

Expected Results:
- ✅ user_roles: 1 record (role='registrar')
- ✅ student_profile: 0 records
- ✅ instructor: 0 records
```

---

### Test 5: Teaching Load Registration

```
1. Open: http://localhost:3000/register
2. Fill form:
   - Full Name: "Eva TeachingLoad"
   - Email: "eva.teaching@test.com"
   - Role: "Teaching Load"
   - Password: "TestPassword123!"
3. Click "Create Account"

Expected Results:
- ✅ user_roles: 1 record (role='teaching_load')
- ✅ student_profile: 0 records
- ✅ instructor: 0 records
```

---

## 🔐 Email Verification Test

For each registered user:

### Option 1: Via Supabase Dashboard
```
1. Go to Supabase Dashboard
2. Navigate to Authentication > Users
3. Find user by email
4. Click "..." menu
5. Click "Confirm email"
```

### Option 2: Via SQL (Testing Only)
```sql
-- Manually confirm email (testing only)
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email = 'alice.student@test.com';
```

### Option 3: Via Email Link (Production)
```
1. Check email inbox
2. Click verification link
3. Should redirect to app
```

---

## 🔑 Login Test

For each confirmed user:

```
1. Go to: http://localhost:3000/login
2. Enter email and password
3. Click "Sign In"
4. Expected: Redirect to /dashboard
5. Expected: See maintenance message with personalized greeting
```

**Example for Alice (Student):**
```
Welcome, Alice Student!
Student Dashboard is in Maintenance

Thank You for Your Understanding

We appreciate your patience as we perform critical system upgrades.
Your Student dashboard will be available shortly.

Account: alice.student@test.com
Role: Student
Status: Dashboard Offline

[View Technical Details] [Sign Out]

Thanks for your understanding, Alice. Your data is safe.
```

---

## 📊 Verification Queries

### Check All Registered Users
```sql
SELECT 
  ur.name,
  ur.email,
  ur.role,
  CASE 
    WHEN sp.user_id IS NOT NULL THEN '✅ Has Profile'
    ELSE '❌ No Profile'
  END as student_profile_status,
  CASE 
    WHEN i.user_id IS NOT NULL THEN '✅ Has Instructor'
    ELSE '❌ No Instructor'
  END as instructor_status
FROM user_roles ur
LEFT JOIN student_profile sp ON ur.user_id = sp.user_id
LEFT JOIN instructor i ON ur.user_id = i.user_id
ORDER BY ur.role, ur.name;
```

**Expected Output:**
```
name              | email                      | role          | profile | instructor
------------------+----------------------------+---------------+---------+-----------
Carol Admin       | carol.admin@test.com       | scheduling    | ❌      | ❌
David Registrar   | david.registrar@test.com   | registrar     | ❌      | ❌
Eva TeachingLoad  | eva.teaching@test.com      | teaching_load | ❌      | ❌
Bob Faculty       | bob.faculty@test.com       | faculty       | ❌      | ✅
Alice Student     | alice.student@test.com     | student       | ✅      | ❌
```

### Check Student Profiles
```sql
SELECT 
  ur.name,
  ur.email,
  sp.level,
  sp.department,
  sp.student_group
FROM user_roles ur
JOIN student_profile sp ON ur.user_id = sp.user_id
WHERE ur.role = 'student';
```

**Expected Output:**
```
name           | email                   | level | department              | student_group
---------------+-------------------------+-------+-------------------------+--------------
Alice Student  | alice.student@test.com  | 1     | Software Engineering    | NULL
```

---

## ✅ Success Criteria

All tests pass when:

- [ ] All 5 roles can register successfully
- [ ] All users receive verification emails
- [ ] All users can verify their email
- [ ] All users can login successfully
- [ ] All users see personalized maintenance message
- [ ] Students have `student_profile` record (level=1)
- [ ] Faculty have `instructor` record
- [ ] Non-students have NO `student_profile` record
- [ ] No console errors during registration/login
- [ ] No database errors in Supabase logs

---

## 🧹 Cleanup Test Data

After testing, clean up test users:

```sql
-- Delete test users (will cascade to user_roles, student_profile, instructor)
DELETE FROM auth.users
WHERE email LIKE '%@test.com';
```

---

## 🚀 Next Steps After Verification

Once all roles work:

1. ✅ Update any remaining code that references old schema
2. ✅ Test API routes (enrollments, sections, etc.)
3. ✅ Disable maintenance mode: `MAINTENANCE_MODE = false`
4. ✅ Test full dashboard features
5. ✅ Deploy to production

---

**Status:** Ready to test manually  
**Estimated Time:** 15-20 minutes for all roles

