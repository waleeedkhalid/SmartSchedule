# Changelog Documentation

**Last Updated:** 2025-10-02  
**Maintainer:** [Name/Role]

---

## Overview

Tracks versioned releases, major features, and removals.

---

## Contents

- v1.0.0 Initial Release
- v1.1.0 Enrollment System Added
- v2.0.0 KSU Royal Theme & Data Refactor
- v2.1.0 Type Alignment & Helper Consolidation
- ...

---

## v2.0.0 - KSU Royal Theme & Data Refactor

- Added KSU Royal theme and balanced contrast update
- Refactored backend to use flat types and centralized mock data
- Removed legacy entities (Meeting, ExternalSlot)
- Major documentation consolidation

---

## v2.1.0 - Type Alignment & Helper Consolidation

Refactor focused on unifying domain model and removing drift between helper and central type definitions.

### Highlights

- Removed duplicate `CourseOffering` definition (single canonical source in `types.ts`).
- Harmonized schedule generator types (`CandidateSchedule`, `GeneratedScheduleResult`).
- Resolved naming collision for `Notification` (UI-only renamed to `UINotificationItem`).
- Consolidated internal schedule time representations into `_ScheduledTimeSlot`.
- Moved `ExamUpdate` to central types; standardized exam update semantics.
- Renamed `SectionConflict` → `SectionConflictDetail` for clarity versus global `Conflict`.
- Renamed `ExamRecord` → `FlattenedExamRecord` (explicit derived structure).
- Replaced `IrregularStudentRecord` with canonical `IrregularStudent`.
- Added explicit UI-only annotations to presentation layer interfaces.

### Outcomes

- Eliminated duplicate / shadowed interfaces.
- Clear separation of domain vs UI-only types.
- Easier future Supabase schema alignment.

### Follow-Up (Deferred)

- Evaluate consolidation of `CourseStructure` vs generation shapes in future optimization pass.

---

---

## v3.0.0 - Supabase Migration & Full-Stack Integration (2025-10-11)

**Major Release:** Complete migration from mock data to Supabase PostgreSQL with Row-Level Security.

### Database Migration

**Applied:** Full Supabase schema with 20 tables, RLS policies, and role-based access control.

**New Tables:**

- Core: `user`, `students`, `course`, `time_slot`, `section`, `schedule`, `schedule_item`
- Academic: `elective_preferences`, `registration`, `feedback`, `student_preferences`
- Management: `rule`, `rule_activation`, `load_assignment`, `faculty_availability`
- Special Cases: `external_course`, `irregular_student`, `version_history`, `scheduling_task`
- System: `notification`

**Security:**

- All tables protected with RLS policies
- Role enforcement: student, faculty, scheduling_committee, teaching_load_committee, registrar
- Extensions enabled: pgcrypto, uuid-ossp

### Type System Overhaul

**Files Added:**

- `src/lib/database.types.ts` - Generated Supabase types with TableRow/Insert/Update utilities

**Files Updated:**

- `src/lib/supabase-client.ts` - Typed browser client with `Database` generic
- `src/lib/supabase-admin.ts` - Typed admin client with helper functions
- `src/lib/types.ts` - Removed obsolete DB interfaces (completed_courses, elective_submissions, student_schedules, student_feedback, view types)
- `src/lib/validators/students.ts` - Updated to match new schema (removed completed_courses field)
- `src/lib/validators/electives.ts` - Removed legacy view-based schemas
- `src/lib/student-helpers.ts` - Aligned with new student profile structure

### API Refactors

**Files Updated:**

- `src/app/api/courses/route.ts` - Uses new `course/section/time_slot` tables via `fetchCourseOfferingsFromDB()`
- `src/app/api/sections/route.ts` - Refactored for new schema
- `src/app/api/student/profile/route.ts` - Direct `students` table queries (removed view dependency)
- `src/app/api/electives/submit/route.ts` - Single `elective_preferences` table with JSON payload
- `src/app/api/auth/student/route.ts` - Removed `completed_courses` query (to be derived from registration)

### Data Access Layer

**Files Updated:**

- `src/lib/course-queries.ts` - Complete rewrite for `course`, `section`, `time_slot` relationships
  - Maps `TableRow<"course">` → `CourseOffering`
  - Maps `TableRow<"section">` + `TableRow<"time_slot">` → `Section` with times
  - Removed legacy `courses/sections/section_meetings` references

### UI Updates

**Files Updated:**

- `src/app/page.tsx` - Complete landing page redesign with shadcn/ui
  - Professional SaaS-style hero section with KSU branding
  - 4 key features cards (Intelligent Generation, Real-time Updates, Rule Enforcement, Analytics)
  - 5 role cards (Students, Faculty, Scheduling Committee, Teaching Load Committee, Registrar)
  - Structured data for SEO (schema.org SoftwareApplication)
  - Stats section and footer CTA
  - Integrated AuthDialog for secure role-based access

### Documentation

**Files Updated:**

- `docs/main/Migration.md` - Appended 2025-10-11 migration snapshot with table verification
- `docs/main/DataFlow.md` - Complete rewrite documenting Supabase → Helpers → API → Frontend flow
- `docs/main/Changelog.md` - This entry

### Breaking Changes

**Removed Tables/Views:**

- Legacy: `courses`, `sections`, `section_meetings`, `teaching_assignments`, `schedule_versions`
- Views: `student_profiles`, `student_submission_details`
- Tables: `completed_courses`, `elective_submissions`, `student_schedules`, `student_feedback`

**Migration Path:**

- `student_profiles` view → `students` table
- `courses/sections` → `course/section` with FK to `time_slot`
- `elective_submissions` → `elective_preferences` with JSON `elective_choices`
- `completed_courses` → To be derived from `registration` history

### Pending Work

**Mock Data Deprecation:**

- Files in `src/data/mockData.ts`, `src/data/mockSWE*.ts`, `src/lib/local-state.ts` remain for demo pages
- Action: Seed Supabase with representative data and migrate demo pages

**Feature Completions:**

- Completed courses derivation from registration table
- Seed script for initial data population
- Full demo page migration to Supabase

### Testing & Verification

- ✅ TypeScript compilation passes
- ✅ Next.js production build successful
- ✅ All RLS policies verified and enabled
- ✅ No remaining references to removed tables in API routes
- ✅ Landing page renders with proper authentication flow

---

## Revision History

| Date       | Author                        | Change Summary                      |
| ---------- | ----------------------------- | ----------------------------------- |
| 2025-10-11 | Full-stack Migration Engineer | v3.0.0 release (Supabase Migration) |
| 2025-10-06 | Architect                     | v2.1.0 release (Type Alignment)     |
| 2025-10-02 | Architect                     | v2.0.0 release                      |

---

## v3.1.0 - SWE Plan Backend (2025-10-11)

Adds dynamic curriculum backend for the SWE department.

### Database

- New table: `public.swe_plan` (RLS enabled)
- Policies:
  - `admin_manage_plan` — ALL for roles: scheduler, scheduling_committee, teaching_load_committee
  - `readonly_plan` — SELECT for roles: faculty, student, registrar

### Types & Helpers

- Added `types/swe-plan.ts` interface
- Added helpers `src/lib/supabase/swe-plan.ts` for CRUD and listing
- Updated generated DB types to include `swe_plan`

### Docs

- Migration log updated with Phase 4.1 entry
- API docs: proposed `/api/swe-plan` endpoints
- DataFlow updated with new helper flow

### Acceptance

- RLS ON and policies verified
- Helpers compile against typed Supabase client
