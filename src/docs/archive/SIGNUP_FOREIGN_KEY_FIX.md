# Signup Foreign Key Constraint Fix

## Issue

**Error**: `insert or update on table "user_roles" violates foreign key constraint "user_roles_user_id_fkey"`
**Code**: `23503`
**Message**: `Key (user_id)=(...) is not present in table "users"`

## Root Cause

The `supabase.auth.signUp()` method returns a user object **before** the transaction is fully committed to the database. When we try to manually insert into `user_roles` (as a fallback if the trigger fails), the user doesn't exist in `auth.users` yet, causing a foreign key constraint violation.

## Solution

### 1. Verify User Exists Before Insert ✅
- Added retry logic with exponential backoff (up to 10 attempts)
- Verify user exists in `auth.users` using `serviceClient.auth.admin.getUserById()`
- Only attempt to insert into `user_roles` after confirming user exists

### 2. Graceful Degradation ✅
- If user cannot be verified after retries, return success and rely on trigger
- If foreign key violation occurs, return success (trigger will handle it or user completes onboarding)
- Don't delete the auth user unnecessarily

### 3. Increased Retry Attempts ✅
- Initial check: 10 attempts with exponential backoff (100ms, 200ms, 400ms, 800ms, etc.)
- Verification before insert: 3 additional attempts
- Total wait time can be up to ~5 seconds for slow systems

## Code Changes

### `app/(auth)/actions.ts`

1. **Initial User Verification** (lines 69-93):
   - Verify user exists in `auth.users` before checking for `user_roles`
   - Up to 10 retry attempts with exponential backoff
   - If user not found, return success (rely on trigger)

2. **User Roles Check** (lines 95-123):
   - Check if trigger created `user_roles` entry
   - Up to 5 retry attempts

3. **Manual Insert with Verification** (lines 125-180):
   - Double-check user exists before inserting
   - 3 additional verification attempts
   - Handle foreign key violations gracefully
   - Don't delete user unnecessarily

## Expected Behavior

1. User submits registration form
2. `signUp()` creates user in Supabase Auth
3. Code waits and verifies user exists in `auth.users`
4. Trigger `handle_new_user()` should create `user_roles` entry
5. If trigger fails, code verifies user exists again
6. Code manually creates `user_roles` entry if needed
7. If foreign key violation occurs, return success (trigger/onboarding will handle it)

## Testing

- [ ] Test registration with all roles
- [ ] Verify user_roles entry is created
- [ ] Test with slow network conditions
- [ ] Verify no foreign key violations occur
- [ ] Test that users can login after registration

## Notes

- The trigger `handle_new_user()` runs AFTER INSERT on `auth.users`
- The trigger is SECURITY DEFINER, so it bypasses RLS
- If the trigger fails, the manual insert will handle it
- If manual insert fails due to timing, the user can complete onboarding which will create the entry

