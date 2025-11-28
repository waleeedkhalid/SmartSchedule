# RLS Onboarding Fix - Complete Documentation

## Overview

This document explains the Row Level Security (RLS) fixes applied to resolve silent failures during user onboarding and data fetching in the SmartSchedule application.

## Problems Identified

### 1. **Critical Security Issue: `user_roles` Table Had RLS Disabled**
   - The `user_roles` table had RLS disabled, which is a security vulnerability
   - Users could potentially access/modify other users' role data without proper restrictions

### 2. **Chicken-and-Egg Problem with Profile Creation**
   - Profile INSERT policies checked if the user had a role in `user_roles` table
   - During onboarding, users might not have been able to read their own role due to RLS
   - This created a circular dependency: can't create profile without role, can't check role without RLS access

### 3. **Onboarding Flow Blocked by RLS**
   - Users couldn't INSERT their own profile during onboarding
   - Users couldn't UPDATE their `onboarding_completed` flag
   - Silent failures occurred (empty arrays or generic 400 errors)

## Solutions Implemented

### Migration 1: `fix_onboarding_rls_policies`

#### 1. Enabled RLS on `user_roles` Table
```sql
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
```

#### 2. Fixed `user_roles` Policies

**Policy: Users can read own role**
- Allows users to SELECT their own role data
- Required for checking onboarding status and role

**Policy: Users can insert own role on signup**
- Allows authenticated users to INSERT their own role
- Handles cases where the trigger fails or manual signup occurs
- Uses `TO authenticated` to ensure only authenticated users can insert

**Policy: Users can update own onboarding fields**
- Allows users to UPDATE their `onboarding_completed` flag
- Critical for completing the onboarding flow
- Users can also update `name`, `email`, `updated_at`

**Policy: Scheduling can read all roles**
- Admin access for scheduling role to view all user roles

**Policy: Scheduling can manage all roles**
- Full admin access for scheduling role (INSERT, UPDATE, DELETE)

**Policy: Registrar can read all roles**
- Registrar role can view all user roles for their dashboard

#### 3. Fixed Profile Table Policies

**student_profile:**
- **INSERT**: Removed role check - allows authenticated users to create their own profile
- **SELECT**: Users can read their own profile
- **UPDATE**: Users can update their own profile

**faculty_profile:**
- **INSERT**: Removed role check - allows authenticated users to create their own profile
- **SELECT**: Users can read their own profile (simplified, removed role check)
- **UPDATE**: Users can update their own profile

**committee_profile:**
- **INSERT**: Removed role check - allows authenticated users to create their own profile
- **SELECT**: Users can read their own profile
- **UPDATE**: Users can update their own profile

### Migration 2: `fix_handle_new_user_security`

#### Fixed Trigger Function Security
- Added `SET search_path TO public, pg_temp` to prevent search_path injection attacks
- This is a security best practice for `SECURITY DEFINER` functions
- The function already bypasses RLS (which is correct for trigger functions)

## Onboarding Flow

### Current Flow (After Fixes)

1. **User Signs Up**
   - Trigger `on_auth_user_created` fires automatically
   - Calls `handle_new_user()` function (SECURITY DEFINER, bypasses RLS)
   - Creates entry in `user_roles` table with `onboarding_completed = false`

2. **User Logs In**
   - Middleware validates session
   - User redirected to `/dashboard` (main dashboard page)

3. **Dashboard Page Checks Onboarding**
   - Calls `validateOnboardingAndProfile(user.id, user.role)`
   - Checks if `onboarding_completed = true` in `user_roles`
   - Checks if profile exists for user's role
   - If incomplete, redirects to `/onboarding`

4. **Onboarding Page**
   - User fills out onboarding form
   - Form creates role-specific profile (student_profile, faculty_profile, or committee_profile)
   - Form updates `onboarding_completed = true` in `user_roles`
   - User redirected to role-specific dashboard

5. **Role-Specific Dashboard**
   - Each dashboard page also validates onboarding (defense in depth)
   - If incomplete, redirects to `/onboarding`

### Key Files

- **Middleware**: `supabase/middleware.ts` - Handles authentication, allows `/onboarding` route
- **Main Dashboard**: `app/(dashboard)/dashboard/page.tsx` - Checks onboarding before redirecting
- **Onboarding Page**: `app/(auth)/onboarding/page.tsx` - Renders onboarding form
- **Onboarding Form**: `components/onboarding-form.tsx` - Client-side form for profile creation
- **Server Auth**: `lib/server-auth.ts` - Contains `validateOnboardingAndProfile()` function

## RLS Policy Summary

### user_roles Table

| Operation | Policy | Who Can Access |
|-----------|--------|----------------|
| SELECT | Users can read own role | Own user_id |
| SELECT | Scheduling can read all roles | Scheduling role |
| SELECT | Registrar can read all roles | Registrar role |
| INSERT | Users can insert own role on signup | Authenticated users (own user_id) |
| UPDATE | Users can update own onboarding fields | Own user_id |
| ALL | Scheduling can manage all roles | Scheduling role |

### Profile Tables (student_profile, faculty_profile, committee_profile)

| Operation | Policy | Who Can Access |
|-----------|--------|----------------|
| SELECT | Users can read own profile | Own user_id |
| INSERT | Users can insert own profile | Authenticated users (own user_id) |
| UPDATE | Users can update own profile | Own user_id |
| ALL | Admin roles can manage profiles | Scheduling/Registrar/Teaching Load (role-specific) |

## Testing the Fix

### Test Case 1: New User Signup
1. Create a new user account
2. Verify `user_roles` entry is created automatically (via trigger)
3. Verify `onboarding_completed = false`
4. Login should redirect to `/onboarding`
5. Complete onboarding form
6. Verify profile is created
7. Verify `onboarding_completed = true`
8. Should redirect to role-specific dashboard

### Test Case 2: Profile Creation During Onboarding
1. Login as new user
2. Navigate to `/onboarding`
3. Fill out form and submit
4. Verify no RLS errors occur
5. Verify profile is created successfully
6. Verify `onboarding_completed` flag is updated

### Test Case 3: Data Fetching After Onboarding
1. Complete onboarding
2. Access dashboard
3. Verify user can fetch their own profile data
4. Verify user can fetch their own role data
5. Verify no empty arrays or 400 errors

## Debugging RLS Issues

### Common Symptoms
- Empty arrays returned from queries
- Generic 400 errors
- "permission denied" errors
- Silent failures (no error, but no data)

### Debugging Steps

1. **Check RLS is Enabled**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('user_roles', 'student_profile', 'faculty_profile', 'committee_profile');
```

2. **Check Policies Exist**
```sql
SELECT tablename, policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename IN ('user_roles', 'student_profile', 'faculty_profile', 'committee_profile')
ORDER BY tablename, cmd;
```

3. **Test Policy Manually**
```sql
-- As the user, try to select your own role
SET ROLE authenticated;
SET request.jwt.claim.sub = 'user-uuid-here';
SELECT * FROM user_roles WHERE user_id = auth.uid();
```

4. **Check Function Security**
```sql
-- Verify handle_new_user() has SECURITY DEFINER
SELECT proname, prosecdef, proconfig
FROM pg_proc
WHERE proname = 'handle_new_user';
```

5. **Check Trigger Exists**
```sql
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users' AND event_object_schema = 'auth';
```

## Security Considerations

### ✅ What's Secure
- RLS is enabled on all profile tables
- Users can only access their own data
- Admin roles have appropriate elevated permissions
- Trigger function uses SECURITY DEFINER correctly
- Search path is set to prevent injection attacks

### ⚠️ Important Notes
- The `handle_new_user()` trigger function bypasses RLS (this is intentional and correct)
- Profile INSERT policies don't check role existence (application logic ensures correctness)
- Users can update their own `onboarding_completed` flag (this is required for onboarding flow)

## Related Documentation

- [RLS Policies Migration](../supabase/migrations/20241027000002_rls_policies.sql)
- [User Role Creation Fix](../supabase/migrations/20241027000004_fix_user_role_creation.sql)
- [Server Auth Implementation](../lib/server-auth.ts)
- [Onboarding Form Component](../components/onboarding-form.tsx)

## Migration Files

1. `fix_onboarding_rls_policies` - Main RLS policy fixes
2. `fix_handle_new_user_security` - Trigger function security fix

Both migrations have been applied to the production database.

## Next Steps

1. ✅ RLS enabled on `user_roles` table
2. ✅ Profile INSERT policies fixed
3. ✅ Onboarding flow validated
4. ✅ Main dashboard checks onboarding
5. ✅ Trigger function security hardened

## Support

If you encounter RLS issues:
1. Check the policies using the SQL queries above
2. Verify the user is authenticated (`auth.uid()` is not null)
3. Check that the user_id matches in the policy conditions
4. Review the Supabase logs for detailed error messages
5. Use `mcp_supabase_get_logs` to check for RLS-related errors

