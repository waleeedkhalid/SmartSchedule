# Performance Investigation Report - Slow Page Transitions

## Issues Identified

### 🔴 CRITICAL ISSUE #1: CourseDialogProvider Wrapping Entire Page
**Location:** `app/(dashboard)/dashboard/courses/page.tsx:136`

**Problem:**
```tsx
<CourseDialogProvider>
  <div className="max-w-7xl mx-auto w-full">
    {/* Entire page content */}
  </div>
</CourseDialogProvider>
```

**Impact:**
- `CourseDialogProvider` is a **client component** (`"use client"`)
- Wrapping the entire page forces the entire page structure to be client-side rendered
- This prevents the page from being a true Server Component
- All child components must hydrate on the client, even though they could be server-rendered
- **Blocks page transition** until all client components hydrate

**Evidence:**
- `CourseDialogProvider` uses `useState`, `useRouter`, and React Context
- The page shell (header, alert, card wrapper) could be server-rendered but isn't
- Forces unnecessary client-side JavaScript bundle to load

---

### 🔴 CRITICAL ISSUE #2: SectionsTable Making Blocking API Calls on Mount
**Location:** `components/sections-table.tsx:44-87`

**Problem:**
```tsx
useEffect(() => {
  async function checkAllConflicts() {
    if (sections.length === 0) return;
    
    setIsLoadingConflicts(true);
    // Makes API call for EVERY section
    await Promise.all(
      sections.map(async (section) => {
        const response = await fetch("/api/sections/check-conflicts", {
          method: "POST",
          body: JSON.stringify({...})
        });
      })
    );
  }
  checkAllConflicts();
}, [sections]);
```

**Impact:**
- On page load, makes **N API calls** (one per section) to check conflicts
- If there are 50 sections, that's 50 API calls on mount
- All calls happen in parallel but still block the UI
- **Blocks page interactivity** until all conflict checks complete
- No loading state shown to user during this time
- Even if sections page loads quickly, the table becomes interactive only after all API calls finish

**Evidence:**
- `useEffect` runs on mount and whenever `sections` changes
- No debouncing or lazy loading
- All conflict checks happen immediately, blocking the UI

---

### 🟠 HIGH PRIORITY ISSUE #3: Multiple Client Components on Courses Page
**Location:** `app/(dashboard)/dashboard/courses/page.tsx`

**Problem:**
The courses page has **6 client components** that all need to hydrate:
1. `CourseDialogProvider` (wraps entire page)
2. `CoursesHeader` (uses `useCourseDialog` hook)
3. `CoursesSearch` (uses `useRouter`, `useSearchParams`, `useState`)
4. `CoursesSort` (uses `useRouter`, `useSearchParams`)
5. `CoursesTable` (uses `useRouter`, `useState`, `useCallback`)
6. `CoursesPagination` (uses `useRouter`, `useSearchParams`)

**Impact:**
- Each client component adds to the hydration bundle
- All must hydrate before page is fully interactive
- Even though data is server-rendered, the UI controls are client-side
- **Increases Time to Interactive (TTI)**

**Evidence:**
- All components marked with `"use client"`
- Each uses Next.js client hooks (`useRouter`, `useSearchParams`)
- No code splitting or lazy loading of these components

---

### 🟠 HIGH PRIORITY ISSUE #4: Middleware Auth Check on Every Request
**Location:** `supabase/middleware.ts:156`

**Problem:**
```tsx
const { data: { user: supabaseUser }, error: authError } = await supabase.auth.getUser();
```

**Impact:**
- Runs on **every single request** (including navigation)
- Makes network call to Supabase to refresh session
- Even for demo users, still creates Supabase client
- **Adds latency to every page transition**
- If Supabase is slow or network is slow, this blocks navigation

**Evidence:**
- Middleware runs before every route
- `getUser()` is an async operation that waits for response
- No caching or optimization for demo users

---

### 🟡 MEDIUM PRIORITY ISSUE #5: Layout Auth Check Duplicates Middleware
**Location:** `app/(dashboard)/layout.tsx:10`

**Problem:**
```tsx
const user = await getServerUser();
```

**Impact:**
- Layout calls `getServerUser()` which may make database queries
- This happens **after** middleware already checked auth
- Duplicates work already done in middleware
- **Adds extra latency** to every dashboard page load

**Evidence:**
- `getServerUser()` reads cookies and may query database
- Middleware already validated auth
- Layout re-validates on every page navigation

---

### 🟡 MEDIUM PRIORITY ISSUE #6: getMockSections Artificial Delay
**Location:** `lib/demo-data.ts:653`

**Problem:**
```tsx
export async function getMockSections(): Promise<MockSection[]> {
  await delay(100);  // Artificial 100ms delay
  return mockSections;
}
```

**Impact:**
- Adds 100ms delay to sections page load
- Unnecessary delay for demo/mock data
- **Blocks page render** for 100ms

**Evidence:**
- `delay()` function adds artificial wait time
- Mock data should be instant

---

## Root Cause Summary

### Primary Bottleneck: Client Component Hydration
1. **CourseDialogProvider** wrapping entire page forces client-side rendering
2. **Multiple client components** need to hydrate before page is interactive
3. **SectionsTable** makes blocking API calls on mount

### Secondary Bottleneck: Redundant Auth Checks
1. **Middleware** checks auth on every request
2. **Layout** re-checks auth after middleware
3. **No caching** of auth state between requests

### Tertiary Bottleneck: Unnecessary Delays
1. **Artificial delays** in mock data functions
2. **No code splitting** for client components
3. **No lazy loading** for heavy components

---

## Performance Impact Estimate

### Courses Page Transition:
- **Before optimization:** ~800-1200ms
  - Middleware auth: ~100-200ms
  - Layout auth: ~50-100ms
  - Data fetch: ~100-300ms
  - Client hydration: ~400-600ms (CourseDialogProvider + 5 child components)
  
### Sections Page Transition:
- **Before optimization:** ~1000-1500ms
  - Middleware auth: ~100-200ms
  - Layout auth: ~50-100ms
  - Mock data fetch: ~100ms (artificial delay)
  - Page render: ~50-100ms
  - Client hydration: ~200-300ms
  - **Conflict API calls: ~500-800ms** (N parallel requests)

---

## Recommended Fix Priority

1. **🔴 Fix #1:** Move CourseDialogProvider to only wrap components that need it
2. **🔴 Fix #2:** Lazy load conflict checks in SectionsTable (on-demand, not on mount)
3. **🟠 Fix #3:** Convert some client components to server components where possible
4. **🟠 Fix #4:** Cache auth state or optimize middleware auth check
5. **🟡 Fix #5:** Remove artificial delays in mock data
6. **🟡 Fix #6:** Add code splitting for client components

---

## Testing Recommendations

1. Use Chrome DevTools Performance tab to measure:
   - Time to First Byte (TTFB)
   - First Contentful Paint (FCP)
   - Time to Interactive (TTI)
   - Total Blocking Time (TBT)

2. Use Network tab to identify:
   - Number of API calls on page load
   - Size of JavaScript bundles
   - Waterfall of resource loading

3. Use React DevTools Profiler to identify:
   - Components causing re-renders
   - Components taking long to render
   - Unnecessary client-side work

