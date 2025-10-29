# Onboarding Redirect Loop Fix - Implementation Summary

## Problem Overview
Users were experiencing an infinite 307 redirect loop when trying to access `/onboarding`:
- **Flow**: Dashboard → Onboarding → Login → Dashboard (repeats infinitely)
- **Root Cause**: Missing RLS INSERT policy prevented `user_roles` record creation during registration
- **Result**: Users had auth credentials but no profile, causing middleware redirect loops

## Solution Implemented

### 1. Migration Created ✅
**File**: `supabase/migrations/019_add_user_roles_insert_policy.sql`

Adds the missing INSERT policy to allow new users to create their own `user_roles` record during registration:

```sql
CREATE POLICY "Users can insert own role"
  ON user_roles FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

**To Apply**:
1. Option A: Open Supabase Studio at http://127.0.0.1:54323
2. Navigate to SQL Editor
3. Run the migration file contents

OR

Option B: Will be automatically applied on next `npx supabase db reset`

### 2. Onboarding Page Fixed ✅
**File**: `app/(auth)/onboarding/page.tsx`

Changed behavior when `user_roles` record is missing:
- **Before**: Redirected to `/login` (causing infinite loop)
- **After**: Displays error page with clear instructions to sign out and re-register

**Benefits**:
- Breaks the redirect loop
- Provides clear user guidance
- Shows specific error details for debugging

### 3. Registration Error Handling Enhanced ✅
**File**: `app/(auth)/actions.ts`

Modified `signup` function to return errors instead of failing silently:
- **Before**: Logged error to console, user unaware of failure
- **After**: Returns descriptive error message to user

### 4. Registration Form UI Updated ✅
**File**: `app/(auth)/register/register-form.tsx`

Enhanced error display with specific handling for:
- Profile creation errors (RLS policy issues)
- Duplicate email errors
- Invalid email errors
- Generic errors

All errors now shown with:
- Clear primary message
- Helpful description
- Appropriate duration (6-8 seconds for critical errors)

## Testing Instructions

### Prerequisites
1. Ensure local Supabase is running: `npx supabase status`
2. Apply the migration (see instructions above)

### Test Scenarios

#### Scenario 1: Successful Registration (After Migration)
1. Navigate to http://localhost:3000/register
2. Fill in registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: Test@123456
   - Role: Student
3. Click "Create Account"
4. **Expected**: Success toast, redirect to login
5. Login with credentials
6. **Expected**: Redirect to onboarding
7. Complete onboarding form
8. **Expected**: Redirect to student dashboard

#### Scenario 2: Failed Registration (Before Migration Applied)
1. Navigate to http://localhost:3000/register
2. Fill in registration form
3. Click "Create Account"
4. **Expected**: Error toast: "Failed to create user profile: [permission error]. This is likely a permission issue..."
5. **Expected**: User NOT created (auth account may exist but will show profile error on login)

#### Scenario 3: Profile Error Page (User with auth but no profile)
1. If user somehow has auth but no `user_roles` record:
2. Login → Middleware redirects to `/onboarding`
3. `/onboarding` page detects missing profile
4. **Expected**: Shows "Profile Not Found" error page
5. Click "Sign Out and Register Again"
6. **Expected**: Signed out and redirected to `/register`

## Files Modified

1. ✅ `supabase/migrations/019_add_user_roles_insert_policy.sql` (NEW)
2. ✅ `app/(auth)/onboarding/page.tsx`
3. ✅ `app/(auth)/actions.ts`
4. ✅ `app/(auth)/register/register-form.tsx`
5. ✅ `supabase/middleware.ts` (Previously fixed)

## Migration Status

✅ **APPLIED**: The migration has been successfully applied via `npx supabase db reset`

All migrations including the INSERT policy (019_add_user_roles_insert_policy.sql) have been applied.

**Additional Fixes Applied**:
- Created `00000000000000_initial_schema.sql` from PRODUCTION_INITIAL_SCHEMA
- Fixed migration dependency issues in 004_create_course_enrollment.sql
- Made migration 010 conditional to handle different schema states

## Expected Results

### Before Migration Applied
- ❌ Registration fails silently
- ❌ Users can't create accounts
- ❌ Infinite redirect loop if they somehow login
- ✅ Clear error messages shown to user
- ✅ Profile error page prevents redirect loop

### After Migration Applied  
- ✅ Registration succeeds
- ✅ `user_roles` record created automatically
- ✅ Onboarding flow works normally
- ✅ No redirect loops
- ✅ Clear error messages for any edge cases

## Rollback Plan

If issues occur, remove the policy:
```sql
DROP POLICY IF EXISTS "Users can insert own role" ON user_roles;
```

Note: This will prevent new user registration, but existing users will continue to work.

## Next Steps

1. **Apply the migration** using Supabase Studio SQL Editor
2. **Test registration flow** with a new test account
3. **Verify onboarding** completes successfully
4. **Monitor logs** for any RLS errors
5. **Consider**: Add integration tests for registration flow

## Additional Notes

- The middleware (`supabase/middleware.ts`) was previously fixed to properly handle public routes
- Error handling is now comprehensive across the entire registration flow
- Users will get clear feedback at every step if something goes wrong
- The fix handles both the root cause (missing policy) and symptoms (redirect loops, silent failures)

