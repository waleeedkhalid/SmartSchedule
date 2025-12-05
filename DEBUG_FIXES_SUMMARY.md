# SmartSchedule - Debug Fixes Summary

**Date**: December 6, 2025  
**Issue**: "Please log in to generate schedules" error when user is already logged in + Hydration errors in scheduler dashboard

---

## Issues Identified

### 1. **Authentication Token Retrieval Timing Issue**

- **Root Cause**: The `getAuthToken()` function had no delay between initialization and the Supabase client being ready
- **Impact**: On initial page load, the token cache might return empty even though the user is authenticated
- **Symptoms**:
  - "Please log in to generate schedules" error despite being logged in
  - Auth token check fails: `authHeader === "Bearer "`

### 2. **Hydration Error in Scheduler Dashboard**

- **Root Cause**: `ScheduleGenerator` component was dynamically imported with `ssr: false` but not wrapped with `ClientOnly` wrapper
- **Impact**: Client-side state could mismatch with server rendering, causing hydration errors
- **Symptoms**:
  - Console shows hydration mismatches
  - Scheduler dashboard becomes unresponsive on first load

### 3. **Poor Error Handling and Logging**

- **Root Cause**: When authentication failed, users got a generic error message without debugging information
- **Impact**: Difficult to diagnose why schedules couldn't be generated
- **Symptoms**: Vague error messages without actionable next steps

---

## Fixes Applied

### Fix 1: Authentication Initialization Delay

**File**: `components/schedule-generator.tsx`

```typescript
// Added 500ms delay to ensure Supabase client is ready
await new Promise((resolve) => setTimeout(resolve, 500));
const authHeader = await getAuthHeader();
```

**Why it works**: Gives the Supabase client time to initialize its session before attempting to retrieve the auth token.

### Fix 2: Improved Error Logging and Token Cleanup

**File**: `components/schedule-generator.tsx`

```typescript
if (!authHeader || authHeader.trim() === "" || authHeader === "Bearer ") {
  console.error("[ScheduleGenerator] Authentication failed:", {
    authHeader,
    authHeaderType: typeof authHeader,
    authHeaderTrimmed: authHeader?.trim(),
  });

  // Clear cached tokens to force re-authentication
  try {
    localStorage.removeItem("auth_token");
  } catch (e) {
    console.warn("Failed to clear auth_token from localStorage");
  }

  // Better error message
  toast.error(
    "Authentication failed. Please log in again to generate schedules."
  );
  setTimeout(() => {
    window.location.href = "/login";
  }, 1500);
  return;
}
```

**Why it works**:

- Logs detailed auth state for debugging
- Clears invalid cached tokens to prevent future failures
- Provides clearer error messaging
- Adds appropriate delay before redirect

### Fix 3: Wrap ScheduleGenerator with ClientOnly

**File**: `app/(dashboard)/dashboard/scheduling/scheduling-dashboard-client.tsx`

```typescript
<ClientOnly
  fallback={
    <Card>
      <CardHeader>
        <CardTitle>Schedule Generator</CardTitle>
        <CardDescription>Loading schedule generation...</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </CardContent>
    </Card>
  }
>
  <ScheduleGenerator initialStatus={scheduleStatus} />
</ClientOnly>
```

**Why it works**:

- Ensures component only renders on client
- Prevents hydration mismatches between server and client
- Shows loading state during initialization
- Properly handles client-only features

### Fix 4: Improved Auth Header Documentation

**File**: `lib/utils/client-auth.ts`

```typescript
export async function getAuthHeader(): Promise<string> {
  const token = await getAuthToken();
  if (!token) {
    console.warn("[Auth] No token found - user may not be authenticated");
    return "";
  }
  return `Bearer ${token}`;
}
```

**Why it works**: Adds warning logging when token retrieval fails, helps diagnose authentication issues.

---

## Testing Checklist

- [x] Build completes successfully
- [ ] Log in to the scheduler dashboard
- [ ] Verify scheduler dashboard loads without hydration errors
- [ ] Click "Generate Schedule" button
- [ ] Should NOT see "Please log in" error when authenticated
- [ ] If auth fails, should see detailed error message in console
- [ ] Verify redirect to login works correctly
- [ ] Try generating schedule - should work if user is authenticated
- [ ] Check browser console for any hydration warnings

---

## Technical Details

### Token Cache Behavior

- Token is cached for 5 minutes to reduce Supabase calls
- Cache is cleared when authentication fails
- Fallback to localStorage if Supabase fails
- Timeout protection: 3 seconds max wait for session

### Client-Only Rendering

- `ScheduleGenerator` uses browser APIs (localStorage, window)
- Cannot be server-rendered
- `ClientOnly` wrapper ensures proper client-side initialization
- Prevents hydration errors from mismatched DOM

### Authentication Flow

1. User clicks "Generate Schedule"
2. Component waits 500ms for Supabase to initialize
3. Attempts to get auth token from Supabase session
4. Validates token is non-empty and properly formatted
5. Makes API request with Authorization header
6. If auth fails, clears cache and redirects to login

---

## Files Modified

1. **components/schedule-generator.tsx**

   - Added initialization delay
   - Improved error logging
   - Added token cache cleanup
   - Better error messages

2. **app/(dashboard)/dashboard/scheduling/scheduling-dashboard-client.tsx**

   - Wrapped ScheduleGenerator with ClientOnly
   - Added fallback loading UI

3. **lib/utils/client-auth.ts**
   - Added warning log when token not found
   - Improved comments

---

## Related Documentation

- See `SYSTEM_OVERVIEW.md` for authentication architecture
- See `lib/api/auth-utils.ts` for server-side authentication
- See `lib/api/error-handler.ts` for error handling patterns

---

## Future Improvements

1. **Add token refresh logic**: Automatically refresh expired tokens
2. **Better retry mechanism**: Exponential backoff for failed auth attempts
3. **Analytics**: Track auth failure reasons
4. **User feedback**: More granular error messages (network error vs invalid credentials)
5. **Offline support**: Cache schedule generation UI state
