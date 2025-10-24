# Migration Documentation

**Last Updated:** 2025-10-02  
**Maintainer:** [Name/Role]

---

## Overview

Details the migration plan, schema alignment steps, and migration status for moving from mock data to Supabase.

---

## Contents

- Migration Phases
- Schema Alignment Steps
- Migration Status
- Risk Points & Fallbacks

---

## Migration Phases

[Detailed steps, technical notes, and schema mapping.]

---

## Schema Alignment Steps

[Iterative schema alignment details.]

---

## Migration Status

[Current migration progress and issues.]

---

## Risk Points & Fallbacks

[List of risks and fallback measures.]

---

## References

- [Link to related docs or code]
- [External resources, if any]

---

## Revision History

| Date       | Author                        | Change Summary               |
| ---------- | ----------------------------- | ---------------------------- |
| 2025-10-11 | Supabase Integration Engineer | Demo Accounts Fix            |
| 2025-10-02 | Architect                     | Initial migration plan draft |

---

## 2025-10-11 — Supabase MCP Migration Snapshot

Command Summary:

- Applied migration: smart_schedule_schema_full via Supabase MCP
- Extensions ensured: pgcrypto, uuid-ossp

Tables Created/Verified (RLS status):

- user (RLS: enabled)
- students (RLS: enabled)
- course (RLS: enabled)
- time_slot (RLS: enabled)
- section (RLS: enabled)
- schedule (RLS: enabled)
- schedule_item (RLS: enabled)
- rule (RLS: enabled)
- rule_activation (RLS: enabled)
- feedback (RLS: enabled)
- elective_preferences (RLS: enabled)
- registration (RLS: enabled)
- notification (RLS: enabled)
- load_assignment (RLS: enabled)
- external_course (RLS: enabled)
- irregular_student (RLS: enabled)
- version_history (RLS: enabled)
- faculty_availability (RLS: enabled)
- student_preferences (RLS: enabled)
- scheduling_task (RLS: enabled)

Record counts: All 0 (no seed data in this migration).

Notes:

- Removed legacy/obsolete tables prior to migration: sections, courses, faculty_availability (legacy), student_preferences (legacy), section_meetings, teaching_assignments, schedule_versions, workflow_states, student_feedback, student_counts, completed_courses, student_schedules, elective_submissions, elective_preferences (legacy structure), irregular_students, \_prisma_migrations.
- Initial attempt failed due to legacy column names; cleaned up legacy tables and re-applied successfully.
- RLS policies created per role: student, faculty, scheduling_committee, teaching_load_committee, registrar.

Errors/Skipped Statements:

- First attempt error: column mismatch on legacy faculty_availability (facultyId). Resolved by dropping legacy tables.

Migration IDs:

- 20251011065733 — smart_schedule_schema_full

---

## Phase 4.1 — SWE Plan Integration (2025-10-11)

Schema Applied:

```
CREATE TABLE public.swe_plan (
	id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
	course_code text UNIQUE NOT NULL,
	course_name text NOT NULL,
	credits integer NOT NULL,
	level integer NOT NULL CHECK (level BETWEEN 4 AND 8),
	type text NOT NULL CHECK (type IN ('REQUIRED','ELECTIVE')),
	prerequisites text[] DEFAULT '{}',
	is_active boolean DEFAULT true,
	updated_by uuid REFERENCES public.user(id),
	created_at timestamptz DEFAULT now(),
	updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.swe_plan ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_manage_plan" ON public.swe_plan FOR ALL
USING (
	EXISTS (
		SELECT 1 FROM public.user u
		WHERE u.id = auth.uid()
			AND u.role IN ('scheduler','scheduling_committee','teaching_load_committee')
	)
)
WITH CHECK (
	EXISTS (
		SELECT 1 FROM public.user u
		WHERE u.id = auth.uid()
			AND u.role IN ('scheduler','scheduling_committee','teaching_load_committee')
	)
);

CREATE POLICY "readonly_plan" ON public.swe_plan FOR SELECT
USING (
	EXISTS (
		SELECT 1 FROM public.user u
		WHERE u.id = auth.uid()
			AND u.role IN ('faculty','student','registrar')
	)
);
```

Verification (MCP Introspection):

- Table exists: swe_plan
- RLS: enabled
- Policies:
  - admin_manage_plan → cmd: ALL, roles: committee/scheduler
  - readonly_plan → cmd: SELECT, roles: faculty/student/registrar

Notes:

- Anonymous access is denied implicitly by absence of anon-allow policy.
- `updated_by` references `public.user(id)`; UI to pass auth.uid via server actions.

---

## Phase 4.3 — Demo Accounts Seed (2025-01-XX)

### Demo Account Creation

**Script:** `scripts/seed-demo-accounts.js`

**Demo Accounts Created:**

```sql
-- Demo Student Account
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES ('student_demo@smartschedule.app', crypt('demo1234', gen_salt('bf')), now(), now(), now());

INSERT INTO public.user (id, name, email, role)
VALUES (auth_user_id, 'Demo Student', 'student_demo@smartschedule.app', 'student');

INSERT INTO public.students (user_id, student_id, name, email, level, major, gpa, completed_credits, total_credits)
VALUES (auth_user_id, 'STU001', 'Demo Student', 'student_demo@smartschedule.app', 6, 'Software Engineering', 3.5, 90, 132);

-- Demo Faculty Account
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES ('faculty_demo@smartschedule.app', crypt('demo1234', gen_salt('bf')), now(), now(), now());

INSERT INTO public.user (id, name, email, role)
VALUES (auth_user_id, 'Demo Faculty', 'faculty_demo@smartschedule.app', 'faculty');

-- Demo Scheduling Committee Account
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES ('scheduler_demo@smartschedule.app', crypt('demo1234', gen_salt('bf')), now(), now(), now());

INSERT INTO public.user (id, name, email, role)
VALUES (auth_user_id, 'Demo Scheduler', 'scheduler_demo@smartschedule.app', 'scheduling_committee');

-- Demo Teaching Load Committee Account
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES ('load_demo@smartschedule.app', crypt('demo1234', gen_salt('bf')), now(), now(), now());

INSERT INTO public.user (id, name, email, role)
VALUES (auth_user_id, 'Demo Load Manager', 'load_demo@smartschedule.app', 'teaching_load_committee');

-- Demo Registrar Account
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES ('registrar_demo@smartschedule.app', crypt('demo1234', gen_salt('bf')), now(), now(), now());

INSERT INTO public.user (id, name, email, role)
VALUES (auth_user_id, 'Demo Registrar', 'registrar_demo@smartschedule.app', 'registrar');
```

**RLS Access:** All demo accounts have appropriate RLS access based on their roles.

**API Endpoint:** `GET /api/demo-accounts` returns demo account credentials for testing.

### Mock Data Removal

**Files Removed:**

- `src/data/mockData.ts`
- `src/data/mockSWEStudents.ts`
- `src/data/mockSWEFaculty.ts`
- `src/data/mockSWECurriculum.ts`
- `src/data/mockRooms.ts`

**Code Updates:**

- `ScheduleDataCollector` now fetches all data from Supabase
- `curriculum-source.ts` uses live `swe_plan` table
- Removed `NEXT_PUBLIC_USE_MOCK_DATA` conditional logic
- All data access paths now use live Supabase helpers

---

## 2025-10-11 — Demo Accounts Fix

**Summary:** Reset Supabase Auth credentials for all demo accounts after credential drift caused failed logins. Confirmed `auth.users` and `public.user` records aligned per role and restored `email_confirmed_at` timestamps to allow password authentication.

**Actions:**

- Regenerated bcrypt password hashes with `demo1234` for student, faculty, scheduler, load, and registrar demo accounts.
- Populated `email_confirmed_at`, `last_sign_in_at`, and `updated_at` for each demo user.
- Validated role consistency between `auth.users` entries and linked `public.user` profiles.
- Reviewed RLS coverage impacting demo account access.
