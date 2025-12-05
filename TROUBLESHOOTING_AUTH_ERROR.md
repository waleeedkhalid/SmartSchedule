# Troubleshooting: "Please Log In to Generate Schedules" Error

## Quick Fix

If you're seeing "Please log in to generate schedules" even though you're logged in:

### Step 1: Clear Browser Cache

1. Open DevTools (F12 or Cmd+Option+I)
2. Go to **Application** tab
3. Click **Storage** → **Clear Site Data**
4. Refresh the page (Cmd+R or Ctrl+R)

### Step 2: Check Browser Console for Errors

1. Open DevTools (F12)
2. Go to **Console** tab
3. Look for messages with `[ScheduleGenerator]` or `[Auth]` prefixes
4. Note any error messages and share with the development team

### Step 3: Re-authenticate

1. Click the user menu in top-right
2. Select **Logout**
3. Go to `/login` and log in again
4. Navigate back to `/dashboard/scheduling`
5. Try generating schedule again

---

## Why This Error Occurs

The error happens when:

1. **Authentication token timeout**: Supabase session took too long to initialize
2. **Token expiration**: Your authentication token expired
3. **Cache corruption**: Stored auth token became invalid
4. **Browser storage blocked**: LocalStorage or SessionStorage disabled

---

## What the Fix Does

The recent update includes:

✅ **Initialization delay**: Waits 500ms for Supabase to initialize  
✅ **Token cleanup**: Removes invalid cached tokens automatically  
✅ **Better error messages**: Shows what went wrong in console  
✅ **Hydration fix**: Eliminates dashboard rendering issues  
✅ **Warning logs**: Helps diagnose auth problems

---

## How to Verify the Fix Works

1. **Open DevTools** (F12)
2. **Go to Console tab**
3. **Clear console**
4. **Navigate to** `/dashboard/scheduling`
5. **Look for**: Message `[Auth] No token found` or absence of auth errors
6. **Click** "Auto-Generate Schedule" button
7. **Expected**: Should proceed to generating schedule (not auth error)
8. **Check console** for generation progress

---

## If Problem Persists

### Debug Information to Collect

1. **Screenshot of error message**
2. **Browser DevTools console output** (right-click → Export as JSON)
3. **Your role** (Scheduling, Teaching Load, Faculty, Student, Registrar)
4. **When it started**: Just after login? After page refresh?
5. **Browser & OS**: Chrome/Safari/Firefox on Windows/Mac/Linux

### Advanced Troubleshooting

**Check if you have the right role:**

- Only "Scheduling" role can generate schedules
- Check DevTools → Application → Storage → auth_token
- Look for role in user_roles table via Supabase dashboard

**Check Supabase connection:**

- Open DevTools → Network tab
- Try to generate schedule
- Look for `/api/v1/academic-terms?current=true` request
- Should return 200 OK with academic term data
- If 401, auth failed; if 500, server error

**Check localStorage:**

- Open DevTools → Application → Storage → Local Storage
- Look for `auth_token` key
- If missing, session is not cached (expected)
- If present but starts with garbage chars, it's corrupted

---

## Asking for Help

When reporting this issue, include:

```markdown
- **Role**: [Your role in the system]
- **Browser**: [e.g., Chrome 131 on macOS]
- **When**: [e.g., "Right after login" or "After 10 minutes"]
- **Steps to reproduce**:
  1. Go to /dashboard/scheduling
  2. Click "Auto-Generate Schedule"
  3. See error "Please log in to generate schedules"

**Console output** (from DevTools → Console):
[Paste any error messages with [ScheduleGenerator] or [Auth] prefixes]

**Network requests** (from DevTools → Network):
[Check if /api/v1/academic-terms returns 200 OK]
```

---

## Key Changes in Latest Fix

| Issue                | Before                  | After                                        |
| -------------------- | ----------------------- | -------------------------------------------- |
| **Auth timing**      | Checked immediately     | Waits 500ms for Supabase                     |
| **Error message**    | Generic "Please log in" | "Authentication failed. Please log in again" |
| **Token cache**      | Could stay invalid      | Auto-cleared on failure                      |
| **Hydration errors** | Possible on first load  | Fixed with ClientOnly wrapper                |
| **Debug info**       | No console logs         | Detailed [ScheduleGenerator] logs            |

---

## Related Pages

- **Dashboard**: `/dashboard/scheduling`
- **Login**: `/login`
- **Settings**: `/dashboard/settings`
- **Support**: Reach out to the development team

---

## Still Having Issues?

1. **Try a different browser** (Chrome, Safari, Firefox)
2. **Try incognito/private mode** (to test without extensions)
3. **Check if you have 2FA enabled** on your account
4. **Verify your role** in the system (ask administrator)
5. **Check if academic term** exists (ask scheduling committee)
6. **Verify courses/rooms/instructors** are set up (Setup Required card shows if missing)
