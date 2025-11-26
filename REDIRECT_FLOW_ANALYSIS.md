# Redirect Flow Analysis - From Button Click to Dashboard

## Complete Flow Trace

### Step 1: User Clicks "Go to Dashboard" Button
**Location:** `components/landing/hero-section.tsx:40` or `components/landing/cta-section.tsx:38`
```tsx
<Link href="/dashboard">
  Go to Dashboard
</Link>
```

### Step 2: Next.js Navigation Initiated
- Next.js Router intercepts the navigation
- Creates a new request to `/dashboard`
- May include RSC query params (`?_rsc=...`) for React Server Components

### Step 3: Middleware Execution (`middleware.ts` → `supabase/middleware.ts`)
**Location:** `supabase/middleware.ts:47-120`

**Flow:**
1. **Early RSC Check (Lines 54-66):**
   - Checks for `/_next/`, `/favicon.ico`, or `?_rsc` query param
   - **FIXED:** Now passes `request` as-is (not reconstructed) to preserve metadata
   - Returns `NextResponse.next({ request })` to allow RSC through

2. **Authentication Check (Lines 68-72):**
   - Reads `demo_user_id` or `auth_token` from cookies
   - Determines if user is authenticated

3. **Public Route Check (Lines 74-91):**
   - Checks if pathname is in public routes list
   - `/dashboard` is NOT in public routes, so auth is required

4. **Auth Page Redirect (Lines 96-107):**
   - If authenticated user tries to access `/login` or `/register`, redirects to dashboard
   - For demo users: redirects directly to role-specific dashboard
   - For Supabase users: redirects to `/dashboard` (which will detect role)

5. **Dashboard Protection (Lines 110-114):**
   - If NOT authenticated and trying to access `/dashboard/*`, redirects to `/login`
   - Sets `redirect` query param for post-login redirect

6. **Allow Through (Lines 117-119):**
   - If authenticated, allows request to proceed

### Step 4: Layout Rendering (`app/(dashboard)/layout.tsx`)
**Location:** `app/(dashboard)/layout.tsx:10-35`

**Flow:**
1. **Auth Check (Line 11):**
   - Calls `getServerUser()` to get authenticated user
   - This reads cookies and queries Supabase `user_roles` table

2. **No User Handling (Lines 22-34):**
   - **FIXED:** No longer redirects in layout (prevents RedirectBoundary errors)
   - Returns minimal layout without sidebar
   - Lets child pages handle their own redirects

3. **Authenticated User (Lines 37-61):**
   - Renders full layout with sidebar
   - Passes user info to Sidebar component

### Step 5: Dashboard Page Rendering (`app/(dashboard)/dashboard/page.tsx`)
**Location:** `app/(dashboard)/dashboard/page.tsx:8-31`

**Flow:**
1. **Auth Check (Line 10):**
   - Calls `getServerUser()` again
   - **Note:** This is a second database query (could be optimized)

2. **No User Redirect (Lines 20-22):**
   - If no user, redirects to `/login`
   - **FIXED:** Removed duplicate commented code

3. **Role Detection (Lines 25-30):**
   - Gets role-specific dashboard path using `getDashboardPath(user.role)`
   - Redirects to role-specific dashboard (e.g., `/dashboard/student`)

### Step 6: Role-Specific Dashboard Rendering
**Example:** `app/(dashboard)/dashboard/student/page.tsx`

**Flow:**
1. **Auth Check (Line 38):**
   - Calls `getServerUser()` again (third time!)
   - **Performance Issue:** Multiple redundant queries

2. **No User Redirect (Lines 41-43):**
   - Redirects to `/login` if not authenticated

3. **Role Check (Lines 46-48):**
   - Redirects to `/dashboard` if wrong role
   - This creates a redirect loop if user has wrong role

4. **Render Dashboard:**
   - If authenticated with correct role, renders dashboard content

## Issues Identified and Fixed

### ✅ Bug 1: Middleware Matcher Missing Image Exclusions
**Fixed:** Added back image file extensions (`.svg`, `.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`) to matcher pattern

### ✅ Bug 2: Duplicate Commented Code
**Fixed:** Removed duplicate commented `if (!user)` check in `dashboard/page.tsx`

### ✅ Bug 3: RSC Request Reconstruction
**Fixed:** Changed from reconstructing request with only headers to passing `request` as-is:
```typescript
// Before (BUG):
return NextResponse.next({
  request: {
    headers: request.headers,
  },
});

// After (FIXED):
return NextResponse.next({
  request,
});
```

### ✅ Bug 4: RedirectBoundary Error (Main Issue)
**Root Cause:** Multiple redirects in the same render tree:
- Layout was redirecting unauthenticated users
- Page was also redirecting unauthenticated users
- This created conflicting redirects → RedirectBoundary error

**Fix:** 
- Removed redirect from layout
- Layout now returns minimal layout if no user
- Pages handle their own redirects
- This prevents multiple redirects in the same render tree

## Schema Alignment (Supabase)

Verified schema matches code expectations:

### `user_roles` Table
- ✅ `user_id` (uuid, PK) → matches `getServerUser()` query
- ✅ `role` (enum: scheduling, teaching_load, faculty, student, registrar) → matches role checks
- ✅ `name`, `email` → matches `ServerUser` interface
- ✅ `onboarding_completed` (boolean) → available for future use

### `student_profile` Table
- ✅ `user_id` (uuid, PK) → matches `getServerUser()` query for student level
- ✅ `level` (integer, 1-8) → matches `ServerUser.level` optional field

## Performance Optimizations Needed

1. **Multiple `getServerUser()` Calls:**
   - Layout calls it
   - Dashboard page calls it
   - Role-specific pages call it
   - **Solution:** Use React cache or pass user as prop

2. **Database Queries:**
   - Each `getServerUser()` makes 2-3 database queries:
     - `supabase.auth.getUser()` (verify token)
     - `user_roles` select
     - `student_profile` select (if student)
   - **Solution:** Cache results or use a single query with joins

## Testing Checklist

- [ ] User clicks "Go to Dashboard" button
- [ ] Middleware allows authenticated user through
- [ ] Layout renders without redirecting
- [ ] Dashboard page redirects to role-specific dashboard
- [ ] Role-specific dashboard renders correctly
- [ ] Unauthenticated users are redirected to login
- [ ] No RedirectBoundary errors in console
- [ ] RSC requests pass through correctly
- [ ] Static images are not processed by middleware

