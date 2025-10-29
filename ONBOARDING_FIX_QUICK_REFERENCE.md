# Onboarding Error - Quick Reference

## ✅ FIXED - Two Issues Resolved

### Problem 1: Empty Error Object
**Error**: `Error updating profile: {}`  
**Cause**: Missing RLS UPDATE policy  
**Fix**: Migration `20251029134303_allow_users_update_onboarding_fields.sql`

### Problem 2: Infinite Recursion
**Error**: `infinite recursion detected in policy for relation "user_roles"`  
**Cause**: RLS helper functions querying user_roles triggered RLS policies, which called the same functions  
**Fix**: Migration `20251029134541_fix_rls_infinite_recursion.sql`

## What Changed

### 1. New RLS Policy
Users can now update their own `user_roles` record:
```sql
CREATE POLICY "Users can update own onboarding fields"
  ON user_roles FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### 2. Fixed Helper Functions
Added `SET row_security = off` to break the recursion loop:
- `get_user_role()`
- `has_role()`
- `has_any_role()`

### 3. Better Error Messages
Enhanced error logging in `onboarding-form.tsx`:
- Shows detailed error information
- Displays error message in toast
- Logs success when profile updates

## How to Test

### Test 1: Scheduling Account Onboarding
```bash
1. Register new scheduling account at http://localhost:3000/register
2. Login with new account
3. Should see onboarding form
4. Confirm and submit
5. Should redirect to /dashboard (no errors in console)
```

### Test 2: Student Account Onboarding
```bash
1. Register new student account
2. Login
3. Select academic level (e.g., Level 4)
4. Confirm and submit
5. Should redirect to /dashboard/student
6. Check console for "Profile updated successfully"
```

### Test 3: Verify Database
Open Supabase Studio: http://127.0.0.1:54323
```sql
-- Check onboarding completion
SELECT user_id, name, role, onboarding_completed, level, updated_at
FROM user_roles
WHERE onboarding_completed = true;

-- Check student group assignment (for students)
SELECT 
  ur.name, 
  ur.level, 
  sg.name as group_name
FROM user_roles ur
LEFT JOIN student_group sg ON sg.level = ur.level
WHERE ur.role = 'student' 
  AND ur.onboarding_completed = true;
```

## Console Output to Expect

### ✅ Success (What you should see):
```
Profile updated successfully: { user_id: "...", onboarding_completed: true, ... }
```

### ❌ Old Errors (Should NOT see anymore):
```
Error updating profile: {}
Failed to save your profile: infinite recursion detected in policy for relation "user_roles"
```

## Files Modified

1. ✅ `supabase/migrations/20251029134303_allow_users_update_onboarding_fields.sql`
2. ✅ `supabase/migrations/20251029134541_fix_rls_infinite_recursion.sql`
3. ✅ `components/onboarding-form.tsx`

## Status: READY TO TEST ✅

Both migrations have been applied to your local database. The onboarding form should now work correctly for all user roles.

## Troubleshooting

If you still see errors:

1. **Restart Supabase**:
   ```bash
   supabase stop && supabase start
   ```

2. **Reset database** (nuclear option):
   ```bash
   supabase db reset
   ```

3. **Check Supabase is running**:
   ```bash
   supabase status
   ```
   Should show: `supabase local development setup is running.`

4. **Check browser console** for detailed error messages

5. **Check Network tab** to see the actual Supabase response

## Related Documentation

- Full details: `ONBOARDING_ERROR_FIX.md`
- RLS Policies: `supabase/migrations/20241027000002_rls_policies.sql`
- Onboarding Component: `components/onboarding-form.tsx`

