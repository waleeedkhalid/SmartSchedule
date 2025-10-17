# Project Context

## Purpose

SmartSchedule is a role-based web application for the Software Engineering (SWE) Department that streamlines semester scheduling: generating course and exam timetables, balancing faculty teaching loads, collecting student elective preferences, and enabling registrar overrides. The scope is limited to SWE courses; non-SWE courses are tracked as external offerings only for conflict awareness.

Top outcomes:

- Conflict-free SWE timetable (lectures, labs, exams) within departmental rules
- Fair faculty load assignment with visibility and guardrails
- Student elective preference collection and integration into offered sections
- Transparent collaboration between Scheduling Committee, Teaching Load Committee, Registrar, Faculty, and Students

## Tech Stack

- Framework: Next.js 15 (App Router) — output: standalone; dev/build via Turbopack
- Language: TypeScript 5.9 (strict)
- UI: Tailwind CSS v4 + shadcn/ui (Radix primitives), lucide-react icons
- State/data: React 19, SWR for client caching, lightweight context providers
- Forms/validation: react-hook-form + Zod 4
- Dates: date-fns, react-day-picker
- Notifications: sonner
- Auth/DB: Supabase (@supabase/supabase-js, @supabase/ssr)
- Utilities: clsx, class-variance-authority, tailwind-merge, uuid
- Linting: ESLint 9 (flat config) + eslint-config-next (core-web-vitals)

Not yet installed but planned (per PRD/engineering notes):

- Real-time collaboration: Yjs
- Version history/diffs: jsondiffpatch
- Dashboards: Chart.js
- AI: Google AI Studio via @google/genai for schedule recommendations/chatbot

## Project Conventions

### Code Style

- TypeScript strict mode; avoid `any`; explicit interfaces in `src/lib/types.ts`
- Functional React components only (prefer Server Components by default; Client Components when needed)
- Tailwind CSS utility-first styling; component primitives from shadcn/ui
- File naming:
  - Components: PascalCase (e.g., `NotificationsDropdown.tsx`)
  - Utilities/helpers: camelCase (e.g., `rules-engine.ts`, `schedule-generator.ts`)
  - App routes: colocated under `src/app/**` using App Router
- Import aliases (from `components.json` and `tsconfig.json`):
  - `@/components`, `@/components/ui`, `@/lib`, `@/lib/utils`, `@/hooks`
- ESLint config: flat config using `next/core-web-vitals` and TypeScript rules; `.next`, `out`, `build` ignored

### Architecture Patterns

- App Router structure in `src/app/**` with server-first rendering; route handlers under `src/app/api/**` using `NextResponse.json()`
- Middleware-driven auth/role gating in `src/app/middleware.ts` with redirects by role and protected matchers
- Domain logic in `src/lib/**` with dedicated modules:
  - `rules-engine.ts` — rules and constraint checks
  - `schedule-generator.ts` — schedule composition helpers
  - `committee-data-helpers.ts`, `student-schedule-helpers.ts` — role-specific helpers
  - `supabase-client.ts` and `utils/supabase/*` — data access and SSR helpers
- Data modeling centralized in `src/lib/types.ts` (courses, sections, exams, preferences, faculty availability, etc.)
- UI composition using shadcn/ui components and Radix primitives; theme control via `next-themes` and custom `ThemeSwitcher`
- Data fetching: SWR for client caching; server functions for SSR-safe operations; `src/lib/fetcher.ts` for common patterns
- Config: `next.config.ts` sets output=standalone and rewrites `/data/:path*` -> `/api/data/:path*`

### Testing Strategy

Current repo has no formal test runner configured. Quality gates rely on:

- Type safety: strict TypeScript + Zod validation at boundaries (APIs, forms)
- Lint: ESLint flat config via `npm run lint`
- Build: `npm run build` (Next + Turbopack) to catch route/type/syntax issues

Planned additions (non-breaking):

- Lightweight unit tests for rules and generator modules
- Component tests for critical flows (student electives, load dashboard)

### Git Workflow

- Default branch: `main` (production)
- Working branches: `feature/*`, `bugfix/*`, `docs/*`
- Commit style: Conventional Commits (e.g., `feat:`, `fix:`, `docs:`, `refactor:`)
- PRs required before merge; at least one review recommended

## Domain Context

Audience and roles:

- Scheduling Committee — builds initial SWE schedule, imports external (non-SWE) time slots, manages rules
- Teaching Load Committee — balances faculty assignments and resolves overload/conflicts
- Registrar — manages irregular students and overrides (up to capacity thresholds)
- Faculty — reviews personal timetable and provides feasibility feedback
- Students — view schedules and submit ranked SWE elective preferences

Key concepts:

- Levels 4–8: SWE plan structure with required/external courses per level
- Sections: LEC/TUT/LAB activities with class blocks (`day` 1–5 = Sun–Thu)
- Exams: midterms and final windows, stored alongside course offering
- Electives: ranked preferences and package requirements; prerequisites enforced
- Irregular students: remaining courses tracked for path feasibility

Operational rules (high level):

- Daily break 12:00–13:00 reserved
- Midterm blocks Mon/Wed 12:00–14:00 reserved
- Two-hour labs must be continuous
- Avoid conflicts with external required courses (non-SWE)
- Aim for balanced student day loads and at least one lighter day when possible

## Important Constraints

- Scope limited to SWE department; non-SWE courses are external references only
- No SIS/Edugate integration; use synthetic/demo data unless Supabase is populated
- Timezone/locale: KSA academic week (Sun–Thu)
- Security: Supabase RLS expected on tables when backend is enabled
- Production builds are standalone; environment variables required for Supabase

## External Dependencies

Core services/libraries in use:

- Supabase (Auth, Postgres): `@supabase/supabase-js`, `@supabase/ssr`
- Next.js runtime and middleware for role gating
- SWR for client-side data caching
- Tailwind CSS + shadcn/ui + Radix primitives for UI

Planned/optional integrations (not yet in dependencies):

- Yjs for real-time collaboration in committee views
- jsondiffpatch for schedule version history and diff visualization
- Chart.js for dashboards (teaching load, section distributions, survey results)
- Google AI Studio via `@google/genai` for AI-based schedule recommendations and chatbot

## Operational Notes

- Paths/aliases: `@/*` resolved from `src/` base; UI imports via `@/components/ui`
- Middleware matchers (protected areas): `/dashboard`, `/student/*`, `/faculty/*`, `/committee/*`, `/login`
- Rewrites: `/data/:path*` proxies to `/api/data/:path*`
- Styling entrypoint: `src/app/globals.css`; shadcn style: `new-york`, base color `neutral`
- Demo data and external department slots under `src/data/*`

## Acceptance Criteria (for this spec)

- Accurately reflects current `package.json` dependencies and config
- Documents roles, scope limits, and key scheduling rules from PRD
- Captures conventions for code, folder structure, and aliases used in this repo
- Calls out planned (but not yet installed) integrations to avoid confusion
