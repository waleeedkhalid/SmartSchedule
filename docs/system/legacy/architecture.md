# 🏗️ SmartSchedule - System Architecture

## Architecture Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                   Browser                                    │
│  - Next.js Client Components (React 19)                                      │
│  - shadcn/ui + Tailwind CSS                                                  │
│  - SWR data fetching/cache                                                   │
│  - Auth UI (Supabase client)                                                 │
└───────────────▲───────────────────────────────────────────────────────────────┘
                │
                │ HTTP (App Router) + Cookies (Supabase SSR)
                │
┌───────────────┴───────────────────────────────────────────────────────────────┐
│                               Next.js (App Router)                            │
│  - Server Components (data orchestration)                                     │
│  - Middleware (role-based guards, redirects)                                  │
│  - API Routes (/app/api/*) with Zod validation                                │
│  - Layout/Providers (Theme, Toast, SWR, Auth)                                 │
│  - Role Landing Pages (student/faculty/committee/registrar)                   │
│                                                                               │
│  Integration points:                                                          │
│   • Supabase SSR (server) via cookies (auth/session)                          │
│   • Supabase client (browser) for reactive session                           │
│   • SWR jsonFetcher (no-store) for client data requests                       │
└───────────────▼───────────────────────────────────────────────────────────────┘
                │
                │ Supabase JS SDK (server/client)
                │
┌───────────────┴───────────────────────────────────────────────────────────────┐
│                                  Supabase                                     │
│  - Auth (email/password, OTP)                                                 │
│  - Postgres (tables: users, students, faculty, committee_members, swe_plan*)  │
│  - RLS policies (implied by README / schema file)                             │
│                                                                               │
│  Data used by features:                                                       │
│   • users.role → role routing and access                                      │
│   • students/faculty/committee_members → onboarding state and routing         │
│   • swe_plan (curriculum backend)                                             │
└───────────────────────────────────────────────────────────────────────────────┘

Deployment context:
- App hosted on Vercel (Speed Insights present; Next 15)
- Supabase project (auth + database) via environment variables
```

## Data Flow Diagram

```
[1] User visits protected path (/student, /faculty, /committee/*)
    |
    v
[Middleware]
  - Reads Supabase session via SSR middleware client
  - If not authenticated → redirect to /login
  - If authenticated:
      * Fetches role (users.role or user_metadata.role)
      * Ensures route-role alignment (pathRequiresRole)
      * If mismatch → redirect to redirectByRole(role)
    |
    v
[Role Landing Page (Server Component)]
  - Revalidates user/session on server
  - Queries existence of profile/record (e.g., students/faculty/committee_members)
  - Redirects to dashboard or setup path
    |
    v
[Dashboard/Setup (Client+Server composition)]
  - UI rendered with shadcn/ui components
  - SWR fetches additional JSON endpoints (if any)
  - User actions (buttons/forms) → API routes
    |
    v
[API Route (Route Handler)]
  - Validates request with Zod
  - Uses Supabase server client for auth/db
  - Returns JSON (NextResponse.json) with success/error and next navigation
    |
    v
[Response]
  - Client updates UI/state (toasts, redirects, SWR mutate)
```

## Component Hierarchy

```
src/app/layout.tsx
│
├─ Providers (client)
│  ├─ AuthProvider (Supabase client session)
│  ├─ ThemeProvider
│  ├─ ToastProvider + Toaster (shadcn/ui)
│  └─ SWRConfig (jsonFetcher)
│
├─ Global Header
│  ├─ Brand (logo/title)
│  └─ NavAuth (auth-aware header actions)
│
└─ Footer

src/app/(auth)/
│
├─ login/page.tsx      (Auth UI, redirects on success)
└─ sign-up/page.tsx    (Registration form, role capture)

src/app/student/
│
├─ page.tsx            (role gate → dashboard/setup redirect)
├─ layout.tsx          (student shell)
├─ dashboard/page.tsx  (student dashboard UI)
├─ schedule/page.tsx   (student schedule view)
├─ feedback/page.tsx   (submit schedule feedback)
├─ profile/page.tsx    (profile view)
├─ setup/page.tsx      (initial setup)
└─ electives/page.tsx  (placeholder; component set available under components/student/electives)

src/components/student/
│
├─ WelcomeBanner.tsx
├─ ScheduleTable.tsx
├─ ExamScheduleTable.tsx
└─ electives/
   ├─ ElectiveBrowser.tsx
   ├─ CourseCard.tsx
   ├─ SelectionPanel.tsx
   ├─ ReviewSubmitDialog.tsx
   ├─ SubmissionSuccess.tsx
   └─ ElectiveSurvey.tsx

src/app/faculty/
│
├─ page.tsx            (role gate → dashboard/setup)
├─ dashboard/page.tsx
├─ setup/page.tsx
└─ FacultyDashboardPageClient.tsx

src/app/committee/
│
├─ scheduler/
│  ├─ page.tsx         (role gate → dashboard/setup)
│  ├─ dashboard/page.tsx
│  ├─ setup/page.tsx
│  └─ SchedulerDashboardPageClient.tsx
│     (components/committee/scheduler/*: CourseEditor, ExamTable, VersionTimeline,
│      GenerateScheduleDialog, GeneratedScheduleResults, StudentCountsTable, etc.)
│
├─ teaching-load/
│  ├─ page.tsx         (role gate)
│  ├─ dashboard/page.tsx
│  ├─ setup/page.tsx
│  └─ TeachingLoadDashboardPageClient.tsx
│     (components/committee/teaching-load/*: InstructorLoadTable, ConflictList, LoadReviewTable)
│
└─ registrar/
   ├─ page.tsx         (role gate)
   ├─ dashboard/page.tsx
   ├─ setup/page.tsx
   └─ RegistrarDashboardPageClient.tsx
      (components/committee/registrar/*: RegistrarCapacityManager, RegistrarEnrollmentApproval, IrregularStudentFormList)

src/components/shared/
│
├─ PersonaNavigation.tsx (+ navigation-config.ts)
├─ NotificationsBell.tsx
├─ WorkflowSteps.tsx
├─ ScheduleCard.tsx / ScheduleTestCard.tsx
└─ ThemeSwitcher.tsx

src/components/ui/
  (shadcn/ui primitives: button, dialog, table, tabs, form, toast, etc.)
```

## State Management

```
Global (Providers)
│
├─ AuthProvider (Supabase client)
│  • session: Session | null
│  • user: User | null
│  • isLoading: boolean
│  • signInWithOtp(email): Promise<{ error }>
│  • signOut(): Promise<void>
│
├─ SWRConfig
│  • fetcher: jsonFetcher (no-store)
│  • shouldRetryOnError: false
│  • revalidateOnFocus: false
│
└─ ThemeProvider / ToastProvider (+ Toaster)

Middleware-driven Navigation
│
• Reads Supabase session (server)
• Determines role from users.role or user_metadata.role
• Enforces pathRequiresRole
• Redirects to redirectByRole(role) when needed

Role Landing Pages (Server)
│
• Validate session
• Query tables: users, students/faculty/committee_members
• Decide dashboard vs setup routing

Student Components (examples)
│
• ScheduleTable / ExamScheduleTable: local UI state (filters, pagination)
• Elective components (available; page currently placeholder):
  - ElectiveBrowser: selectedCourses[], searchQuery, activeFilter
  - SelectionPanel: internal ranked selections
  - ReviewSubmitDialog: confirmChecks, submitting
  - SubmissionSuccess: read-only summary

Committee Components (examples)
│
• Scheduler: CourseEditor state (course/section edits), ExamTable state (exam grid),
  GeneratedScheduleResults (result set paging/filtering), VersionTimeline (snapshot selection)
• Teaching Load: instructor load data, conflict filters
• Registrar: irregular student data forms, approvals

Core Domain Types (from src/lib/types.ts)
│
• Course, Section (with Classes: day/startMinutes/endMinutes)
• ExamInfo (date/time/duration), CourseOffering (exams, sections)
• Student (level, electivePreferences, irregular flags)
• ElectivePreference (courseCode, priority)
• FacultyAvailability/Preferences, FacultyAssignment
```

## API Request/Response Flow

```
/api/hello (GET)
│ Input: none
│ Output: { message: string, env: "development" | "production" | ... }
│ Status: 200

/auth/sign-in (POST)
/api/auth/sign-in
│ Input (JSON):
│   { email: string, password: string, role?: UserRole, fullName?: string }
│ Flow:
│   - zod validate
│   - supabase.auth.signInWithPassword
│   - read users.role (fallback: requested role or user_metadata.role)
│   - upsert into users (id, email, full_name, role)
│ Output:
│   { success: true, redirect: string, role: UserRole } | { success: false, error }
│ Status:
│   200 on success
│   400 on validation/upsert error
│   401 on sign-in failure
│   500 on user fetch error

/auth/sign-up (POST)
/api/auth/sign-up
│ Input (JSON):
│   { email: string, password: string, fullName: string, role: UserRole }
│ Flow:
│   - zod validate
│   - supabase.auth.signUp (options: { data: { full_name, role }, emailRedirectTo: /login })
│ Output:
│   { success: true, message: "Check your email..." } | { success: false, error }
│ Status:
│   200 on success
│   400 on validation or supabase error (or error.status passthrough)

(auth bootstrap) (POST)
/api/auth/bootstrap
│ Input (JSON optional):
│   { role?: UserRole, fullName?: string }
│ Flow:
│   - zod validate (partial)
│   - ensure existing session; unauthorized if none
│   - derive role (users.role → input role → user_metadata.role)
│   - upsert users with role/full_name
│ Output:
│   { success: true, redirect: string } | { success: false, error }
│ Status:
│   200 on success
│   400 on upsert/validation error
│   401 if no session

/auth/sign-out (POST)
/api/auth/sign-out
│ Input: none
│ Flow:
│   - supabase.auth.signOut()
│ Output:
│   { success: true } | { success: false, error }
│ Status:
│   200 on success
│   400 on sign-out error
```

## File Structure

```
SmartSchedule/
│
├─ docs/
│  ├─ SYSTEM-ARCHITECTURE.md           (reference architecture doc for elective flow)
│  ├─ UX-STUDENT-ELECTIVE-FLOW.md
│  └─ main/*                           (API, DataFlow, Changelog, etc.)
│
├─ src/
│  ├─ app/
│  │  ├─ (auth)/
│  │  │  ├─ login/page.tsx
│  │  │  └─ sign-up/page.tsx
│  │  ├─ api/
│  │  │  ├─ hello/route.ts
│  │  │  └─ auth/
│  │  │     ├─ sign-in/route.ts
│  │  │     ├─ sign-up/route.ts
│  │  │     ├─ sign-out/route.ts
│  │  │     └─ bootstrap/route.ts
│  │  ├─ committee/
│  │  │  ├─ scheduler/ (dashboard, setup, client page)
│  │  │  ├─ teaching-load/ (dashboard, setup, client page)
│  │  │  └─ registrar/ (dashboard, setup, client page)
│  │  ├─ faculty/ (dashboard, setup, client page)
│  │  ├─ student/ (dashboard, schedule, feedback, profile, setup, electives)
│  │  ├─ dashboard/page.tsx
│  │  ├─ layout.tsx
│  │  ├─ middleware.ts
│  │  ├─ page.tsx
│  │  └─ providers.tsx
│  │
│  ├─ components/
│  │  ├─ auth/ (AuthProvider, NavAuth, hooks, types)
│  │  ├─ committee/ (scheduler, teaching-load, registrar modules)
│  │  ├─ faculty/ (availability, personal schedule)
│  │  ├─ shared/ (navigation, notifications, footer, etc.)
│  │  ├─ student/ (schedule tables, electives UI set)
│  │  └─ ui/ (shadcn/ui primitives)
│  │
│  ├─ data/ (demo-data, external-departments)
│  ├─ lib/
│  │  ├─ auth/redirect-by-role.ts
│  │  ├─ fetcher.ts, colors.ts, utils.ts
│  │  ├─ types.ts (Course/Section/Exam/Student/Faculty types)
│  │  ├─ schedule/* (ConflictChecker, Generator, TimeSlotManager, tests)
│  │  ├─ rules-engine.ts (prototype, commented)
│  │  ├─ schedule-generator.ts (prototype, commented)
│  │  ├─ committee-data-helpers.ts
│  │  └─ local-state.ts (prototype, commented)
│  │
│  └─ utils/supabase/ (client, server, middleware)
│
├─ tests/
│  ├─ api/hello.test.ts
│  └─ example.test.tsx
│
├─ supabase-schema.sql
├─ next.config.ts, tsconfig.json, eslint.config.mjs, tailwind/postcss configs
└─ README.md
```

Approximate TypeScript/TSX line counts (from wc -l):

- src/app: ~6,877
- src/components: ~14,199
- src/lib: ~4,328
- src/utils: ~81
- tests: ~22
- Total (TS/TSX): ~25,500 lines

## Technology Stack

```
┌────────────────────────────── Frontend ───────────────────────────────┐
│ - Next.js 15 (App Router, React 19)                                   │
│ - Client Components (UI), Server Components (data/control)            │
│ - shadcn/ui + Tailwind CSS                                            │
│ - SWR (client-side fetching/cache)                                     │
└───────────────────────────────────────────────────────────────────────┘
┌────────────────────────────── Backend (App) ──────────────────────────┐
│ - Next.js Route Handlers (/app/api/*)                                 │
│ - Zod validation                                                       │
│ - Role-based Middleware (pathRequiresRole, redirectByRole)            │
│ - Providers: Auth (Supabase client), Theme, Toast, SWR                │
└───────────────────────────────────────────────────────────────────────┘
┌────────────────────────────── Platform & Data ────────────────────────┐
│ - Supabase Auth (email/password, OTP)                                 │
│ - Supabase Postgres (users, students, faculty, committee_members,     │
│   swe_plan, etc.; RLS implied)                                        │
│ - Supabase SSR integration (server) + client SDK                      │
│ - Vercel (hosting; @vercel/speed-insights present)                    │
└───────────────────────────────────────────────────────────────────────┘
┌────────────────────────────── Tooling & DX ───────────────────────────┐
│ - TypeScript (strict), ESLint, Prettier                               │
│ - Vitest + @testing-library (basic tests)                             │
│ - Turbopack builds                                                    │
└───────────────────────────────────────────────────────────────────────┘
```

## Deployment Architecture

```
┌──────────────────────────── Vercel ─────────────────────────────┐
│                                                                 │
│  Next.js (App Router)                                           │
│  • Serverless Route Handlers (/api/*)                           │
│  • Edge Middleware (auth/role gates)                            │
│  • Server Components (SSR)                                      │
│  • Client Components (CSR/Hydration)                            │
│                                                                 │
│  Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY   │
│       SUPABASE_SERVICE_ROLE_KEY (API routes as needed)          │
└───────────────▲─────────────────────────────────────────────────┘
                │ HTTPS + Supabase JS SDK (server/client)
                │
┌───────────────┴───────────────────────────┐
│                Supabase                   │
│  • Auth (sessions; cookies via SSR)       │
│  • Postgres (RLS policies)                │
│  • Tables: users, students, faculty,      │
│           committee_members, swe_plan*    │
└───────────────────────────────────────────┘

Notes:
- Next middleware enforces auth/role before rendering pages.
- Server route handlers use Supabase server client with cookie store.
- Client AuthProvider keeps session reactive in the browser.
```

---

## API Request/Response Flow (Tabular)

| Endpoint            | Method | Auth Required | Input (JSON)                          | Success Response (JSON)           | Error Codes   |
| ------------------- | ------ | ------------- | ------------------------------------- | --------------------------------- | ------------- |
| /api/hello          | GET    | No            | —                                     | { message, env }                  | 500           |
| /api/auth/sign-in   | POST   | No            | { email, password, role?, fullName? } | { success: true, redirect, role } | 400, 401, 500 |
| /api/auth/sign-up   | POST   | No            | { email, password, fullName, role }   | { success: true, message }        | 400           |
| /api/auth/sign-out  | POST   | Yes (session) | —                                     | { success: true }                 | 400           |
| /api/auth/bootstrap | POST   | Yes (session) | { role?, fullName? }                  | { success: true, redirect }       | 400, 401      |

## State Management (Key Variables by Layer)

```
Global Providers
- AuthProvider: session, user, isLoading, signInWithOtp(), signOut()
- SWRConfig: jsonFetcher (no-store), retry: false, revalidateOnFocus: false
- ThemeProvider, ToastProvider (+ Toaster)

Middleware
- Derives role: users.role or user_metadata.role
- Guards: isProtectedPath, pathRequiresRole, redirectByRole

Role Landing (Server)
- Reads user (supabase.auth.getUser)
- Fetches profile table row (e.g., users.role)
- Checks existence in students/faculty/committee_members to decide routing

Student UI (examples)
- ScheduleTable: filters/pagination (local)
- ExamScheduleTable: filters (local)
- ElectiveBrowser (component set available): selectedCourses[], searchQuery, activeFilter
```

## File Structure (selected with counts)

```
src/app/                      (~6,877 lines)
  layout.tsx
  middleware.ts
  providers.tsx
  page.tsx
  (auth)/login/page.tsx
  (auth)/sign-up/page.tsx
  dashboard/page.tsx
  api/
    hello/route.ts
    auth/
      sign-in/route.ts
      sign-up/route.ts
      sign-out/route.ts
      bootstrap/route.ts
  student/
    page.tsx
    layout.tsx
    dashboard/page.tsx
    schedule/page.tsx
    feedback/page.tsx
    profile/page.tsx
    setup/page.tsx
    electives/page.tsx
  faculty/
    page.tsx
    dashboard/page.tsx
    setup/page.tsx
  committee/
    scheduler/(dashboard, setup, client)
    teaching-load/(dashboard, setup, client)
    registrar/(dashboard, setup, client)

src/components/               (~14,199 lines)
  auth/*                      (AuthProvider, NavAuth, hooks, types)
  student/*                   (Schedule, Electives component set)
  committee/*                 (Scheduler/Load/Registrar modules)
  shared/*                    (PersonaNavigation, NotificationsBell, etc.)
  ui/*                        (shadcn/ui primitives)

src/lib/                      (~4,328 lines)
  types.ts                    (Course/Section/Exam/Student/etc.)
  auth/redirect-by-role.ts
  fetcher.ts, utils.ts
  schedule/*                  (ConflictChecker, Generator, TimeSlotManager, test data)
  committee-data-helpers.ts
  rules-engine.ts (proto, commented)
  schedule-generator.ts (proto, commented)
  local-state.ts (proto, commented)

src/utils/supabase/           (~81 lines)
  client.ts, server.ts, middleware.ts

tests/                        (~22 lines)
  api/hello.test.ts
  example.test.tsx
```

---

**Architecture Status:** ✅ Supabase-authenticated, role-gated Next.js app with committee/student/faculty portals, working auth APIs and middleware; rich UI component library; scheduling logic prototypes present; student elective page scaffolded with component set available.

**Last Updated:** 2025-10-17

**Architect:** Waleed Khalid (inferred from repository ownership)
