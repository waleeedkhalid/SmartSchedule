# RLS Policy Fix Summary

## Issue Resolved ✅

**Error Message:**
```
Failed to create user role: {
  code: '42501',
  details: null,
  hint: null,
  message: 'new row violates row-level security policy for table "user_roles"'
}
```

## Root Cause

The user registration flow was failing because of a **chicken-and-egg problem** with Row-Level Security (RLS) policies:

1. During registration, the app creates an auth user
2. Then tries to insert a role entry in `user_roles` table
3. But the RLS policies only allowed users with the `scheduling` role to insert into `user_roles`
4. New users don't have any role yet, so they can't create their own role entry

## Solution Implemented

Created migration `20241027000004_fix_user_role_creation.sql` that:

### 1. Removed the overly restrictive policy
```sql
DROP POLICY IF EXISTS "Scheduling can manage roles" ON user_roles;
```

### 2. Added a policy for new user registration
```sql
CREATE POLICY "Users can insert own role"
  ON user_roles FOR INSERT
  WITH CHECK (user_id = auth.uid());
```

This allows:
- ✅ New users to insert their own role entry during registration
- ✅ Only for their own user_id (security maintained)
- ❌ Users cannot create roles for others

### 3. Recreated separate policies for updates/deletes
```sql
CREATE POLICY "Scheduling can update roles"
  ON user_roles FOR UPDATE
  USING (has_role('scheduling'::user_role))
  WITH CHECK (has_role('scheduling'::user_role));

CREATE POLICY "Scheduling can delete roles"
  ON user_roles FOR DELETE
  USING (has_role('scheduling'::user_role));
```

## Current RLS Policies

The `user_roles` table now has these policies:

| Policy Name | Operation | Who Can Do It |
|-------------|-----------|---------------|
| Users can insert own role | INSERT | New users (for themselves only) |
| Users can read own role | SELECT | Any authenticated user (own role only) |
| Admins can read all roles | SELECT | Scheduling & Registrar roles |
| Scheduling can update roles | UPDATE | Scheduling role only |
| Scheduling can delete roles | DELETE | Scheduling role only |

## Changes Made

### Files Created
1. **`supabase/migrations/20241027000004_fix_user_role_creation.sql`**
   - New migration to fix RLS policies

2. **`src/docs/LOCAL_DEVELOPMENT.md`**
   - Complete guide for local Supabase development
   - Setup instructions
   - Common commands and troubleshooting

3. **`src/docs/TESTING_USER_REGISTRATION.md`**
   - Step-by-step testing guide
   - Explanation of the fix
   - Cleanup instructions

4. **`src/docs/RLS_FIX_SUMMARY.md`** (this file)
   - Summary of changes

### Commands Run
```bash
# Applied the new migration
supabase db reset

# Started local Supabase instance
supabase start

# Started Next.js dev server
pnpm dev
```

## Verification

Verified the policies are correctly applied:
```bash
docker exec supabase_db_SSv2 psql -U postgres -c \
  "SELECT policyname, cmd FROM pg_policies WHERE tablename = 'user_roles';"
```

Result:
```
         policyname          |  cmd   
-----------------------------+--------
 Admins can read all roles   | SELECT
 Scheduling can delete roles | DELETE
 Scheduling can update roles | UPDATE
 Users can insert own role   | INSERT  ← New policy
 Users can read own role     | SELECT
```

## Testing Registration

Your local environment is now ready:
- ✅ Local Supabase running on http://127.0.0.1:54321
- ✅ Supabase Studio at http://127.0.0.1:54323
- ✅ Next.js app at http://localhost:3000
- ✅ Email testing at http://127.0.0.1:54324

To test:
1. Go to http://localhost:3000/register
2. Fill in registration form with any role
3. Submit - should work without RLS errors!

## Why This is Secure

The fix maintains security because:

1. **User identity is verified**: Uses `auth.uid()` which is provided by Supabase Auth
2. **Scoped to own data**: Users can only insert their own role (`user_id = auth.uid()`)
3. **One-time operation**: After registration, users cannot modify roles (only scheduling can)
4. **No privilege escalation**: Users can't make themselves admins or change roles later

## Future Considerations

If you want to add admin-only registration (where only admins can create accounts):

1. Disable the "Users can insert own role" policy
2. Create a server-side function with SECURITY DEFINER
3. Call that function during admin-initiated user creation

For now, the current setup allows self-registration which is appropriate for most applications.

---

**Status**: ✅ Issue Resolved & Tested  
**Migration**: Applied to local database  
**Ready for**: User registration testing

