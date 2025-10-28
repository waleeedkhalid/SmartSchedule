# Testing User Registration

## Quick Test Guide

After fixing the RLS policy issue, you can test user registration with these steps:

### 1. Via Browser (Recommended)
1. Make sure your dev server is running: `pnpm dev`
2. Navigate to http://localhost:3000/register
3. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: Select any role (e.g., "faculty")
4. Submit the form
5. Check the terminal for any errors

**Expected Result**: User should be created successfully without RLS policy errors.

### 2. Via Supabase Studio
1. Open http://127.0.0.1:54323
2. Navigate to **Table Editor** → **user_roles**
3. Check if your test user was created with the correct role
4. Navigate to **Authentication** → **Users** to see the auth user

### 3. Check Email Confirmation (if enabled)
1. Open http://127.0.0.1:54324 (Mailpit)
2. Look for the confirmation email
3. Click the confirmation link

## What Was Fixed

### The Problem
When a new user tried to register, the backend would:
1. Create an auth user via `supabase.auth.signUp()`
2. Try to insert into `user_roles` table
3. **FAIL** with: `new row violates row-level security policy for table "user_roles"`

This happened because:
- New users had no role yet
- The old RLS policies only allowed users with the `scheduling` role to insert into `user_roles`
- Chicken-and-egg problem: You need a role to create a role! 🐔🥚

### The Solution
Added a new RLS policy in `20241027000004_fix_user_role_creation.sql`:

```sql
CREATE POLICY "Users can insert own role"
  ON user_roles FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

This policy allows:
- ✅ New users to insert their own role entry during registration
- ✅ The `user_id` must match their auth user ID (security check)
- ❌ Users cannot create role entries for other users

## Verification Query

Run this in Supabase Studio SQL Editor to see all RLS policies:

```sql
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  cmd as command,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies 
WHERE tablename = 'user_roles'
ORDER BY policyname;
```

## Testing Different Roles

Test creating users with each role to ensure they work:

1. **Scheduling** - Has full system access
2. **Teaching Load** - Manages courses and instructors
3. **Faculty** - Can view schedules and submit preferences
4. **Student** - Can view schedules and select electives
5. **Registrar** - Can view and export schedules

## Common Issues

### Issue: Still getting RLS errors
**Solution**: Make sure you ran `supabase db reset` to apply the new migration

### Issue: User created but no role
**Solution**: Check the server logs - there might be a different error

### Issue: "Email already exists"
**Solution**: Either use a different email or delete the test user from Supabase Studio

## Cleanup Test Data

To remove test users:

1. Via Supabase Studio:
   - Go to **Authentication** → **Users**
   - Find the test user
   - Click the three dots → **Delete User**

2. Via SQL:
   ```sql
   -- Delete auth user (will cascade to user_roles)
   DELETE FROM auth.users WHERE email = 'test@example.com';
   ```

