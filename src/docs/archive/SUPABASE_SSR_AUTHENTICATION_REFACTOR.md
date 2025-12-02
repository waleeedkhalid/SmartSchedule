# Supabase SSR Authentication Refactor

## Overview

This document describes the refactoring of the authentication system to use the modern `@supabase/ssr` (Server-Side Rendering) package pattern. This fixes the persistent `Authentication required. Please provide a valid token` error that occurred during CRUD operations in Server Actions.

## Problem

The previous implementation manually managed an `auth_token` cookie, which caused issues:
- Server Actions couldn't access the session properly
- Cookies weren't being refreshed automatically
- Session state wasn't synchronized between middleware and server actions

## Solution

Refactored to use Supabase's built-in cookie management through `@supabase/ssr`, which:
- Automatically manages auth cookies
- Refreshes sessions transparently
- Ensures cookies are properly passed to Server Actions

## Files Changed

### 1. `supabase/server.ts` - Server Client Factory

**Key Changes:**
- Enhanced cookie handling with proper error handling
- Added comprehensive documentation
- Gracefully handles cookie setting errors in Server Components

**Usage:**
```typescript
import { createClient } from "@/supabase/server";

const supabase = await createClient();
const { data: { user }, error } = await supabase.auth.getUser();
```

### 2. `supabase/middleware.ts` - Middleware Session Refresh

**Key Changes:**
- Creates Supabase client using request/response objects
- **CRITICAL**: Calls `supabase.auth.getUser()` on every request to refresh the session
- Automatically updates cookies when session is refreshed
- Preserves Supabase cookies on redirects

**How It Works:**
1. Creates a Supabase client with request/response for cookie handling
2. Calls `supabase.auth.getUser()` which automatically refreshes expired tokens
3. Updates cookies in the response
4. Returns response with refreshed session cookies

### 3. `app/(auth)/actions.ts` - Login Action

**Key Changes:**
- Removed manual `auth_token` cookie setting
- Now relies on Supabase's automatic cookie management
- Verifies session after login with `getUser()`

**Before:**
```typescript
// Manually set auth_token cookie
cookieStore.set('auth_token', token, { ... });
```

**After:**
```typescript
// Supabase automatically manages cookies
const { data: { user }, error } = await supabase.auth.getUser();
// Cookies are set automatically by Supabase SSR
```

## Server Action Pattern

All Server Actions should follow this pattern:

```typescript
"use server";

import { createClient } from "@/supabase/server";

export async function myServerAction(formData: FormData) {
  try {
    // 1. Create Supabase client (automatically reads cookies)
    const supabase = await createClient();

    // 2. CRITICAL: Verify authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Authentication required. Please provide a valid token.");
    }

    // 3. Perform database operation
    const { data, error } = await supabase
      .from("your_table")
      .insert({ ... })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
```

## Key Points

### 1. Always Call `getUser()` First

**Why:** This ensures:
- The session is valid
- Cookies are properly set
- Expired tokens are automatically refreshed

### 2. Middleware Refreshes Session Automatically

The middleware calls `supabase.auth.getUser()` on every request, which:
- Refreshes expired access tokens
- Updates refresh tokens if needed
- Keeps the session alive

### 3. Cookies Are Managed Automatically

- Supabase SSR handles all cookie operations
- No need to manually set `auth_token` cookie
- Cookies are automatically passed to Server Actions

### 4. Error Handling

- Cookie setting errors in Server Components are handled gracefully
- Middleware will refresh the session on the next request
- Server Actions can set cookies successfully

## Migration Guide

### For Existing Server Actions

1. **Remove manual cookie management:**
   ```typescript
   // ❌ Remove this
   const cookieStore = await cookies();
   cookieStore.set('auth_token', token, { ... });
   ```

2. **Add authentication check:**
   ```typescript
   // ✅ Add this
   const supabase = await createClient();
   const { data: { user }, error: authError } = await supabase.auth.getUser();
   if (authError || !user) {
     throw new Error("Unauthorized");
   }
   ```

3. **Use the authenticated user:**
   ```typescript
   // ✅ Use user.id for created_by, etc.
   await supabase.from("table").insert({
     created_by: user.id,
     // ...
   });
   ```

## Testing

### Verify Authentication Works

1. **Login** - Should set Supabase cookies automatically
2. **Server Actions** - Should work without "Authentication required" errors
3. **Session Refresh** - Should happen automatically in middleware
4. **Logout** - Should clear all auth cookies

### Test Server Action

```typescript
// Example: Create a test server action
"use server";

import { createClient } from "@/supabase/server";

export async function testAuth() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return { error: "Not authenticated" };
  }
  
  return { success: true, userId: user.id };
}
```

## Troubleshooting

### Still Getting "Authentication required" Error?

1. **Check middleware is running:**
   - Verify `middleware.ts` is calling `updateSession`
   - Check that `supabase.auth.getUser()` is being called

2. **Check cookies are being set:**
   - Open browser DevTools → Application → Cookies
   - Look for Supabase cookies (sb-access-token, sb-refresh-token)

3. **Verify Server Action pattern:**
   - Ensure you're calling `getUser()` first
   - Check that you're using `await createClient()`

### Session Not Persisting?

1. **Check cookie settings:**
   - Ensure `sameSite: 'lax'` is set
   - Verify `secure` flag matches environment (true in production)

2. **Check middleware:**
   - Ensure `getUser()` is called on every request
   - Verify cookies are being copied on redirects

## Additional Resources

- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Usage Examples](./lib/utils/supabase-server-usage-example.ts)

