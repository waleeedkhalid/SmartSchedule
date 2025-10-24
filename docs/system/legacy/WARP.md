# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

SmartSchedule is a **Software Engineering (SWE) Department-specific** course scheduling system. It manages SWE courses only (SWE211, SWE312, etc.) and handles faculty assignments, student preferences, and committee workflows. Non-SWE courses are tracked as external dependencies but not scheduled by this system.

**Tech Stack**: Next.js 15 (App Router), TypeScript (strict mode), Tailwind CSS, shadcn/ui, Supabase (auth + PostgreSQL), SWR, Zod validation.

## Development Commands

### Core Commands
```bash
npm run dev              # Start dev server with Turbopack
npm run build            # Production build with Turbopack
npm start                # Start production server
npm run lint             # Run ESLint
npm run test             # Run Vitest tests
npm run test:watch       # Run tests in watch mode
npm run test:ci          # Run tests in CI mode (single run)
```

### Testing
- Test files: `tests/**/*.{test,spec}.{ts,tsx}`
- Uses Vitest + @testing-library/react with jsdom
- Run specific test: `npm run test path/to/test.test.ts`

## Architecture

### Role-Based System
Five user roles with separate portals:
1. **Student** - View schedules, submit elective preferences
2. **Faculty** - Manage availability, view teaching assignments
3. **Scheduling Committee** - Schedule courses, manage terms
4. **Teaching Load Committee** - Monitor faculty loads and conflicts
5. **Registrar** - Manage irregular students

### Key Architectural Patterns

**Authentication & Authorization**
- Middleware (`src/app/middleware.ts`) enforces role-based access via `pathRequiresRole` and `redirectByRole`
- Supabase SSR integration for server-side auth (cookies)
- Client-side `AuthProvider` for reactive session management
- User role derived from `users.role` or `user_metadata.role`

**Data Flow**
- Server Components handle data orchestration and validation
- Client Components use SWR with `jsonFetcher` (no-store, no retry on error)
- API routes in `/app/api/*` use Zod validation and return `NextResponse.json()`
- Database: Supabase PostgreSQL with RLS policies

**State Management**
- Global: AuthProvider (session, user), SWRConfig, ThemeProvider, ToastProvider
- Local: React hooks (useState, useMemo) - no external state library
- Middleware-driven navigation based on role

### Directory Structure
```
src/
├── app/
│   ├── (auth)/              # Login, sign-up
│   ├── api/                 # API routes with Zod validation
│   ├── student/             # Student portal (dashboard, schedule, electives, profile, setup)
│   ├── faculty/             # Faculty portal (dashboard, setup)
│   ├── committee/
│   │   ├── scheduler/       # Scheduling Committee portal
│   │   ├── teaching-load/   # Teaching Load Committee portal
│   │   └── registrar/       # Registrar portal
│   ├── middleware.ts        # Role-based route guards
│   └── providers.tsx        # Global providers wrapper
│
├── components/
│   ├── auth/                # AuthProvider, NavAuth, hooks
│   ├── student/             # Student-specific components (schedule tables, electives UI)
│   ├── faculty/             # Faculty-specific components
│   ├── committee/           # Committee modules (scheduler, teaching-load, registrar)
│   ├── shared/              # PersonaNavigation, NotificationsBell, ThemeSwitcher
│   └── ui/                  # shadcn/ui primitives
│
├── lib/
│   ├── types.ts             # Core domain types (Course, Section, Student, Faculty, etc.)
│   ├── auth/                # redirect-by-role logic
│   ├── schedule/            # ConflictChecker, Generator, TimeSlotManager
│   ├── fetcher.ts           # SWR jsonFetcher
│   └── utils.ts             # General utilities
│
└── utils/supabase/          # Supabase client (client.ts, server.ts, middleware.ts)
```

### Core Types (src/lib/types.ts)
```typescript
Course                # courseId, code, name, credits, level, type, prerequisites
Section               # sectionId, activity (LEC/TUT/LAB), Classes, instructor
SectionClass          # day (1-5), startMinutes, endMinutes, room
CourseOffering        # courseId, exams (midterm, midterm2, final), sections
ExamInfo              # date, time, duration
Student               # id, name, level, electivePreferences, isIrregular
ElectivePreference    # studentId, courseCode, priority
FacultyAvailability   # instructorId, availableSlots
FacultyAssignment     # instructorId, sectionId
```

## Coding Standards

### TypeScript
- **Strict mode enabled** - never use `any`
- Functional React components only (no class components)
- Use async/await for all async operations
- Type-safe and null-safe code required

### Next.js Patterns
- Use App Router conventions (Server Components by default)
- Client Components marked with `"use client"` directive
- API routes return `NextResponse.json()` with proper status codes
- Path aliases: `@/*` maps to `src/*`

### Component Structure
- Naming: PascalCase for components, camelCase for utilities
- Keep files short and composable
- Use shadcn/ui primitives for UI consistency
- Avoid redundant suffixes like `Component` or `Helper`

### Validation & Error Handling
- Use Zod schemas for API request validation
- API responses: `{ success: true, ... }` or `{ success: false, error: string }`
- Client-side: Display errors via toast notifications (sonner)

## OpenSpec Workflow

**This project uses OpenSpec for spec-driven development.** When making significant changes:

1. **Before coding**: Check `openspec/AGENTS.md` for instructions
2. **Triggers for proposals**: New features, breaking changes, architecture changes, performance/security work
3. **Creating proposals**: Use `openspec list` and `openspec list --specs` to check existing work
4. **Implementation**: Follow `proposal.md` → `design.md` (if needed) → `tasks.md` checklist
5. **Archiving**: Move completed changes to `changes/archive/` with `openspec archive`

**Quick commands**:
```bash
openspec list                  # List active changes
openspec list --specs          # List specifications
openspec show [item]           # Display change or spec
openspec validate [item]       # Validate changes or specs
openspec archive [change] -y   # Archive completed change
```

## Important Project Constraints

### SWE Department Scope
- ✅ Manages SWE courses only (SWE211, SWE312, SWE314, etc.)
- ✅ SWE faculty assignments and teaching loads
- ✅ SWE student preferences and schedules
- ❌ Cannot schedule non-SWE courses (CSC, MATH, etc.)
- Non-SWE courses tracked as external dependencies only

### Environment Variables
Required in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

### Database
- Supabase PostgreSQL with RLS policies
- Key tables: `users`, `students`, `faculty`, `committee_members`, `swe_plan`
- Schema still in iterative incremental refinements, as we need or want.
- Curriculum backend stored in `swe_plan` table (admin-editable)

## Branching & Commits

**Branch naming**:
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `docs/*` - Documentation updates

**Commit format** (imperative mood):
- `feat: <description>` - New feature
- `fix: <description>` - Bug fix
- `docs: <description>` - Documentation
- `refactor: <description>` - Code cleanup
- `test: <description>` - Tests

**Workflow**: Create branch → Make changes → Open PR → Get approval → Merge

## Key Implementation Notes

### Authentication Flow
1. Middleware checks session → redirects to `/login` if unauthenticated
2. Login validates credentials → upserts `users` table with role
3. Role landing pages check profile existence → redirect to dashboard or setup
4. Dashboard components fetch additional data via SWR

### API Route Pattern
```typescript
// Standard pattern in /app/api/* routes
import { createServerClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ /* ... */ });

export async function POST(request: Request) {
  const supabase = await createServerClient();
  const body = await request.json();
  const validated = schema.safeParse(body);
  
  if (!validated.success) {
    return NextResponse.json({ success: false, error: "Validation failed" }, { status: 400 });
  }
  
  // Database operations...
  
  return NextResponse.json({ success: true, /* ... */ });
}
```

### Student Elective Flow
- Component set available: `ElectiveBrowser`, `CourseCard`, `SelectionPanel`, `ReviewSubmitDialog`, `SubmissionSuccess`
- State: `selectedCourses[]`, `searchQuery`, `activeFilter`, ranked priorities
- Validation: Package requirements, eligibility checks, priority ordering
- Submission: Generate unique ID, timestamp, store preferences

### Deployment
- Vercel hosting (Speed Insights integrated)

### User Rules
- Do not build.
- Run `npm run lint` to check your code correctness.
- Do not assume anything, ask me first and suggest best practices or the best way to do.
