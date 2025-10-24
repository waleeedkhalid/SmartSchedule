# SmartSchedule - Updated Folder Structure

## Post-Refactoring Structure

```
SmartSchedule/
│
├── src/
│   │
│   ├── types/                           # ✨ NEW: Centralized TypeScript types
│   │   ├── database.ts                  # Database schema types (aligned with main.sql)
│   │   ├── api.ts                       # API request/response types
│   │   ├── schedule.ts                  # Schedule generation & validation types
│   │   ├── ui.ts                        # UI component & state types
│   │   └── index.ts                     # Central export
│   │
│   ├── lib/                             # Server-side utilities & business logic
│   │   │
│   │   ├── supabase/                    # 🔄 MOVED: From utils/supabase
│   │   │   ├── client.ts               # Browser client
│   │   │   ├── server.ts               # Server client
│   │   │   ├── middleware.ts           # Middleware client
│   │   │   └── index.ts                # Central export
│   │   │
│   │   ├── api/                         # ✨ NEW: API route helpers
│   │   │   ├── helpers.ts              # Auth, response builders
│   │   │   ├── validators.ts           # Zod schemas
│   │   │   └── index.ts                # Central export
│   │   │
│   │   ├── auth/                        # Auth utilities
│   │   │   └── redirect-by-role.ts
│   │   │
│   │   ├── schedule/                    # Schedule generation engine
│   │   │   ├── ConflictChecker.ts
│   │   │   ├── ScheduleGenerator.ts
│   │   │   ├── ScheduleDataCollector.ts
│   │   │   ├── TimeSlotManager.ts
│   │   │   ├── curriculum-source.ts
│   │   │   ├── index.ts
│   │   │   └── test-phase*.ts          # Test data
│   │   │
│   │   ├── validations/                 # Input validation schemas
│   │   │   ├── auth.schemas.ts
│   │   │   ├── faculty.schemas.ts
│   │   │   └── student.schemas.ts
│   │   │
│   │   ├── colors.ts                    # Theme/color utilities
│   │   ├── committee-data-helpers.ts    # Committee-specific helpers
│   │   ├── data-store.ts                # Local state management
│   │   ├── fetcher.ts                   # SWR fetcher
│   │   ├── local-state.ts               # Client-side state
│   │   ├── rules-engine.ts              # Business rules
│   │   ├── schedule-generator.ts        # Main schedule logic
│   │   ├── student-schedule-helpers.ts  # Student-specific helpers
│   │   └── utils.ts                     # General utilities (cn, etc.)
│   │
│   ├── app/                             # Next.js 15 App Router
│   │   │
│   │   ├── api/                         # 🔄 REFACTORED: API Routes
│   │   │   │
│   │   │   ├── auth/                    # Authentication endpoints
│   │   │   │   ├── bootstrap/route.ts  # Profile initialization
│   │   │   │   ├── sign-in/route.ts    # Login
│   │   │   │   ├── sign-up/route.ts    # Registration
│   │   │   │   └── sign-out/route.ts   # Logout
│   │   │   │
│   │   │   ├── student/                 # Student-specific endpoints
│   │   │   │   ├── electives/route.ts  # Browse electives
│   │   │   │   ├── feedback/route.ts   # Submit/view feedback
│   │   │   │   ├── schedule/route.ts   # Get student schedule
│   │   │   │   ├── preferences/route.ts # Elective preferences
│   │   │   │   └── profile/route.ts    # Student profile
│   │   │   │
│   │   │   ├── mock/                    # Mock data endpoints
│   │   │   │   └── schedule/route.ts
│   │   │   │
│   │   │   └── hello/route.ts           # Health check
│   │   │
│   │   ├── (auth)/                      # Auth layout group
│   │   │   ├── login/page.tsx
│   │   │   └── sign-up/page.tsx
│   │   │
│   │   ├── student/                     # Student portal
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── electives/page.tsx
│   │   │   ├── feedback/page.tsx
│   │   │   ├── schedule/page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── setup/
│   │   │   │   ├── page.tsx
│   │   │   │   └── student-setup-form.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── StudentDashboardPageClient.tsx
│   │   │
│   │   ├── faculty/                     # Faculty portal
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── setup/
│   │   │   │   ├── page.tsx
│   │   │   │   └── faculty-setup-form.tsx
│   │   │   ├── page.tsx
│   │   │   └── FacultyDashboardPageClient.tsx
│   │   │
│   │   ├── committee/                   # Committee portals
│   │   │   │
│   │   │   ├── scheduler/               # Schedule Committee
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── setup/page.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── SchedulerDashboardPageClient.tsx
│   │   │   │
│   │   │   ├── teaching-load/           # Teaching Load Committee
│   │   │   │   ├── dashboard/page.tsx
│   │   │   │   ├── setup/page.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── TeachingLoadDashboardPageClient.tsx
│   │   │   │
│   │   │   └── registrar/               # Registrar Portal
│   │   │       ├── dashboard/page.tsx
│   │   │       ├── setup/page.tsx
│   │   │       ├── page.tsx
│   │   │       └── RegistrarDashboardPageClient.tsx
│   │   │
│   │   ├── dashboard/page.tsx           # Generic dashboard redirect
│   │   ├── page.tsx                     # Landing page
│   │   ├── layout.tsx                   # Root layout
│   │   ├── providers.tsx                # Context providers
│   │   ├── globals.css                  # Global styles
│   │   ├── middleware.ts                # Route protection
│   │   └── icon.png                     # App icon
│   │
│   ├── components/                      # React Components
│   │   │
│   │   ├── ui/                          # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── table.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── calendar.tsx
│   │   │   ├── date-picker.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── toast*.tsx
│   │   │   ├── theme-*.tsx
│   │   │   └── [30+ more components]
│   │   │
│   │   ├── auth/                        # Authentication components
│   │   │   ├── AuthProvider.tsx
│   │   │   ├── AuthDialog.tsx
│   │   │   ├── AuthButtons.tsx
│   │   │   ├── NavAuth.tsx
│   │   │   ├── auth-context.tsx
│   │   │   ├── auth-types.ts
│   │   │   └── use-auth.ts
│   │   │
│   │   ├── student/                     # Student-specific components
│   │   │   ├── electives/
│   │   │   │   ├── ElectiveBrowser.tsx
│   │   │   │   ├── ElectiveCard.tsx
│   │   │   │   ├── ElectivePreferencesManager.tsx
│   │   │   │   └── [5 more components]
│   │   │   ├── feedback/
│   │   │   │   ├── FeedbackForm.tsx
│   │   │   │   ├── FeedbackList.tsx
│   │   │   │   └── index.ts
│   │   │   ├── schedule/
│   │   │   │   ├── ScheduleView.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ScheduleTable.tsx
│   │   │   ├── ExamScheduleTable.tsx
│   │   │   ├── WelcomeBanner.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── faculty/                     # Faculty-specific components
│   │   │   ├── availability/
│   │   │   │   ├── AvailabilityScheduler.tsx
│   │   │   │   └── index.ts
│   │   │   ├── personal-schedule/
│   │   │   │   ├── PersonalSchedule.tsx
│   │   │   │   └── index.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── committee/                   # Committee-specific components
│   │   │   │
│   │   │   ├── scheduler/               # Schedule Committee
│   │   │   │   ├── GenerateScheduleDialog.tsx
│   │   │   │   ├── GeneratedScheduleResults.tsx
│   │   │   │   ├── SchedulePreviewer.tsx
│   │   │   │   ├── SectionEnrollmentManager.tsx
│   │   │   │   └── [13 more components]
│   │   │   │
│   │   │   ├── teaching-load/           # Teaching Load Committee
│   │   │   │   ├── InstructorLoadTable.tsx
│   │   │   │   ├── LoadReviewTable.tsx
│   │   │   │   ├── ConflictList.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── registrar/               # Registrar
│   │   │   │   ├── IrregularStudentFormList.tsx
│   │   │   │   ├── RegistrarCapacityManager.tsx
│   │   │   │   ├── RegistrarEnrollmentApproval.tsx
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── GenerateButton.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── shared/                      # Shared/common components
│   │   │   ├── PersonaNavigation.tsx
│   │   │   ├── NotificationsBell.tsx
│   │   │   ├── ThemeSwitcher.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ScheduleCard.tsx
│   │   │   ├── WorkflowSteps.tsx
│   │   │   ├── navigation-config.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── RoleSwitcher.tsx
│   │   ├── NotificationsDropdown.tsx
│   │   ├── ThemeSwitcher.tsx            # (duplicate, to be reviewed)
│   │   └── WorkflowDashboard.tsx
│   │
│   └── data/                            # Data files & SQL
│       ├── main.sql                     # Main database schema
│       ├── seed.sql                     # Seed data
│       ├── demo-accounts.ts             # Demo account data
│       ├── demo-data.ts                 # Demo application data
│       └── external-departments.json    # External course data
│
├── tests/                               # Test suite
│   ├── api/
│   │   └── auth/
│   │       ├── sign-in.test.ts
│   │       ├── sign-up.test.ts
│   │       ├── sign-out.test.ts
│   │       └── bootstrap.test.ts
│   ├── utils/
│   │   └── mock-types.ts
│   ├── example.test.tsx
│   └── README.md
│
├── docs/                                # Documentation
│   ├── main/
│   │   ├── API.md
│   │   ├── Changelog.md
│   │   ├── DataFlow.md
│   │   ├── Migration.md
│   │   └── README.md
│   ├── SYSTEM-ARCHITECTURE.md
│   ├── UX-STUDENT-ELECTIVE-FLOW.md
│   └── VALIDATION-PROGRESS.md
│
├── openspec/                            # OpenSpec specifications
│   ├── AGENTS.md
│   ├── project.md
│   ├── specs/
│   └── changes/
│
├── supabase/                            # Supabase migrations
│   └── migrations/
│       └── 20250124_student_features.sql
│
├── public/                              # Static assets
│   └── branding/
│       └── icon.png
│
├── Configuration Files
├── package.json                         # Dependencies
├── tsconfig.json                        # TypeScript config
├── next.config.ts                       # Next.js config
├── tailwind.config.js                   # Tailwind config
├── vitest.config.ts                     # Vitest config
├── vitest.setup.ts                      # Test setup
├── components.json                      # shadcn/ui config
├── eslint.config.mjs                    # ESLint config
│
├── Documentation
├── README.md                            # Main README
├── REFACTORING_SUMMARY.md               # ✨ NEW: This refactoring summary
├── UPDATED_FOLDER_STRUCTURE.md          # ✨ NEW: This file
├── architecture.md                      # System architecture
├── core-features.md                     # Core features list
├── PRD.md                               # Product requirements
├── PLAN.md                              # Development plan
├── WARP.md                              # Warp-specific notes
└── DATABASE-QUICK-START.md              # Database setup guide
```

## Key Changes Summary

### ✨ Added
- `src/types/` - Centralized type definitions (4 files)
- `src/lib/api/` - API route helpers (3 files)
- `REFACTORING_SUMMARY.md` - Detailed refactoring documentation
- `UPDATED_FOLDER_STRUCTURE.md` - This file

### 🔄 Moved
- `src/utils/supabase/` → `src/lib/supabase/`

### ❌ Removed
- `src/utils/` directory (empty after migration)
- `src/lib/types.ts`
- `src/lib/types/student.ts`
- `types/swe-plan.ts`

### 🔧 Refactored
- All API routes in `src/app/api/` (10+ files)
- Import paths across 50+ files

## Import Path Conventions

### Types
```typescript
// ✅ Correct
import type { User, Course, Elective } from '@/types';
import type { ApiResponse, ElectivesResponse } from '@/types';

// ❌ Old (removed)
import type { User } from '@/lib/types';
import type { Elective } from '@/lib/types/student';
```

### Supabase Clients
```typescript
// ✅ Correct
import { supabase } from '@/lib/supabase';
import { createServerClient } from '@/lib/supabase';
import { createMiddlewareClient } from '@/lib/supabase';

// ❌ Old (removed)
import { supabase } from '@/utils/supabase/client';
import { createServerClient } from '@/utils/supabase/server';
```

### API Helpers
```typescript
// ✅ Correct
import { getAuthenticatedUser, successResponse } from '@/lib/api';
import { feedbackSchema } from '@/lib/api';
```

## Next.js 15 Alignment

This structure follows Next.js 15 App Router best practices:

- ✅ `src/app/` for routes (App Router)
- ✅ `src/lib/` for server utilities
- ✅ `src/components/` for React components
- ✅ `src/types/` for TypeScript types
- ✅ Route groups with `(auth)` for layout organization
- ✅ Colocated page components (`*PageClient.tsx`)
- ✅ Centralized API helpers

## File Naming Conventions

- **Pages:** `page.tsx` (Next.js convention)
- **Layouts:** `layout.tsx` (Next.js convention)
- **API Routes:** `route.ts` (Next.js convention)
- **Components:** `PascalCase.tsx` (React convention)
- **Utilities:** `kebab-case.ts` or `camelCase.ts`
- **Types:** `kebab-case.ts`
- **Client Components:** `*PageClient.tsx` for large page components

## Notes

- All paths use `@/` alias pointing to `src/`
- No duplicate components (except ThemeSwitcher - flagged for review)
- Clear separation between server (`lib/`) and client (`components/`) code
- Type-safe end-to-end from database to UI

