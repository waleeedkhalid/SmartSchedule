# SmartSchedule — V1 Product Requirements Document (PRD)

## Overview
SmartSchedule is a web app for the SWE department (one program, one campus, one semester) that generates conflict‑free teaching and exam schedules with minimal setup. It supports manual data entry and JSON import/export, one‑click intelligent schedule recommendations, collaborative editing, versioning, and in‑app notifications. Stack: Next.js 15, TypeScript, Tailwind, shadcn/ui, Zustand, Supabase (Auth + Postgres + RLS), Chart.js, yjs, jsondiffpatch.

## Goals and Objectives
- **G1**: Produce a conflict‑free schedule for lectures, labs, and exams.
- **G2**: Enable fast edits with live conflict detection and collaboration.
- **G3**: Deliver two dashboards (Level, Course) for reporting.
- **G4**: Capture student elective preferences and feedback.
- **Measurable targets**: 
  1) 0 student and instructor time clashes in “Released” schedules.  
  2) One‑click recommendation completes in ≤10 s for target scale (assumption).  
  3) Dashboard loads in ≤2 s with cached data.

## Scope
**Included (V1)**
- Personas: Scheduling Committee, Teaching Load Committee, Students, Faculty, Registrar.
- Data intake: Forms + JSON import/export for courses, sections, rooms, instructors, student groups, exams, rules.
- Intelligent recommendation: one‑click generate; then manual tweaks.
- Collaboration: Comment/feedback system for all roles; asynchronous collaborative editing.
- Notifications: in‑app for comments and material changes.
- Dashboards: Level overview and Course overview (Chart.js).
- Student portal: manual elective registration with validation (≤20 credits, capacity, prerequisites); view level‑based schedule (required courses + registered electives); exam timetable; dual-layer comments.
- Faculty portal: self-registration with auto instructor profile; availability preferences; view personal teaching timetable; add feedback.
- Teaching Load: review instructor loads; provide feedback via comments.
- Registrar: manage irregular students (custom required course lists); manually register students in sections with validation bypass.
- **Student enrollment model**: Students follow main curriculum flow—automatically enrolled in all required courses for their current level. Irregular students have custom required course lists defined by registrar. For electives, students manually register for specific sections with constraints: ≤20 total credits, section capacity limits, prerequisites (V1: auto-pass).
- **Data Model Enhancements**: student_enrollment table for tracking registrations, schedule_comment table for unified feedback, irregular_student table for custom curricula.

**Included (V2 - Future)**
- Real‑time collaboration: yjs concurrent edits on schedules (Scheduling + Teaching Load roles).
- Versioning: jsondiffpatch snapshots; named releases with restore capability.
- AI chatbot for schedule insights and queries.
- Instructor preference learning (ML-based).
- CSV import/export variants.

**Excluded (All Versions)**
- SSO or external SIS/LMS integrations.  
- Auto‑ingest from subsystems.  
- Complex optimization beyond defined rules.  
- Email/SMS push notifications; in‑app only.

## User Personas / Target Audience
| Persona | Primary needs |
|---|---|
| Scheduling Committee | Define rules, generate schedules, resolve conflicts, create named releases, manage all data (courses, sections, rooms, instructors, exams), import/export |
| Teaching Load Committee | Review loads, suggest edits, co‑edit schedule |
| Students | Submit elective preferences, view level‑based schedule (read‑only), comment/provide feedback |
| Faculty | Self-register, set availability preferences, review personal timetable (read‑only), provide feedback/constraints |
| Registrar | Manage irregular students (custom course lists), manually register students in sections |

## Functional Requirements (prioritized)
### Must‑have (MVP)
1. **Auth & RBAC**: Supabase Auth; roles: `scheduling`, `teaching_load`, `faculty`, `student`, `registrar`. RLS on all tables.  
2. **Data Intake**: CRUD forms + JSON import/export for core datasets.  
3. **Scheduler**: One‑click “Recommend Schedule” that respects rules and prevents room/time collisions; supports exams and labs; provides conflict list.  
4. **Manual Editing**: Drag/resize or form edits to section meetings; instant conflict detection.  
5. **Collaboration**: 
   - Comment/feedback system (all roles) - ✅ V1 Complete
   - Section-specific and general feedback - ✅ V1 Complete
   - Real‑time concurrent editing via yjs (Scheduling + Teaching Load only) - ⏳ Deferred to V2
   - Activity presence indicators (editors only) - ⏳ Deferred to V2
6. **Versioning**: 
   - JSON export/import for manual versioning - ✅ V1 Complete
   - jsondiffpatch diffs and named releases - ⏳ Deferred to V2
   - Restore from release capability - ⏳ Deferred to V2  
7. **Notifications**: In‑app alerts on comments and changes affecting an instructor/section/exam.  
8. **Dashboards**:  
   - **Level overview**: per group in a level, sections, assigned instructors, student counts.  
   - **Course overview**: room assignments, students per section, instructor per section.  
9. **Student features**: 
   - Elective section registration (manual enrollment with validation: ≤20 credits, capacity, prerequisites)
   - Level‑based schedule view (read‑only): auto-enrolled required courses + manually registered electives
   - Exam timetable view with conflict detection
   - Dual-layer comment system: general schedule feedback + section-specific comments
   - Real-time credit tracking and constraint validation
   - Enrollment management (register/drop electives)
10. **Faculty features**: 
   - Self-service registration with automatic instructor profile creation
   - Personal teaching timetable view (read‑only)
   - Comment/feedback on assignments
   - Availability constraints submission (preferred/unavailable time slots)
   - No admin intervention required for initial setup
11. **Registrar features**:
   - Manage irregular students: input student ID and custom required course lists for students who don't follow standard level-based curriculum
   - Manual student registration: register any student in any section (bypass normal validation rules for special cases)

### Nice‑to‑have (post‑MVP)
- AI chatbot for rule queries and schedule insights (Google AI Studio).  
- Instructor preference learning.  
- CSV import/export variants.

## Non‑Functional Requirements
- **Performance**: Recommendation ≤10 s for target scale (assumption). Dashboard load ≤2 s.  
- **Scalability**: Single department scale; handle ~hundreds of sections.  
- **Security**: Supabase RLS; least‑privilege policies; audit fields.  
- **Reliability**: Autosave drafts; optimistic UI with retry.  
- **Usability**: Simple forms; minimal required fields; clear conflict messages.  
- **Portability**: JSON import/export as system boundary.  
- **Observability**: Structured logs for recommendation runs.

## User Journeys
### Scheduling Committee
1) Import JSON or create datasets → 2) Define rules → 3) Click **Recommend** → 4) Review conflicts list → 5) Manual tweaks with comments → 6) Create **Named Release** → 7) Publish schedule.

### Teaching Load
Open current draft → filter by instructor/load → comment or co‑edit sections within rules → watch notifications.

### Registrar
1) **Irregular Students**: Add student ID → specify custom required courses (for students not following standard curriculum) → save.
2) **Manual Registration**: Select student → select section → register (bypass validation for special cases like overrides, exceptions).

### Faculty
Self-register → auto-create instructor profile → sign in → set availability preferences → view personal teaching timetable (read‑only) → add feedback or constraints (unavailable times) → receive in‑app notifications on changes.

### Students
Sign in → complete simple onboarding (set level 1-8) → register for elective sections (manual with validation) → view level‑based schedule (auto-enrolled required + registered electives, read‑only) → view exam timetable with conflicts → add general/section-specific feedback → manage enrollments (drop if needed).

**Note**: Student level (1-8) determines which required courses appear in schedule. Level is the only academic standing indicator (no year fields).

## Data Model (minimal V1)
> **Simplicity rules**: 
> - Section holds capacity; rooms have no capacity; enforce unique room usage per time slot.
> - Students follow main flow: each student belongs to a level and is automatically enrolled in all required courses for that level.
> - Only elective courses require student preference submission.

- **course**: `code PK`, `title`, `level INT` (organizational only for electives, required courses use this for enrollment), `credits INT`, `weekly_hours INT`, `is_elective BOOL`, `elective_group_id FK`
  - **Important**: For elective courses, the `level` field is purely organizational (indicates typical placement in curriculum). Electives have NO level restrictions - students can register for any elective regardless of their level, as long as they meet prerequisites and credit requirements.  
- **section**: `id PK`, `course_code FK`, `section_no`, `instructor_id FK`, `room_code FK`, `capacity INT`, `meeting_pattern JSONB{days[], start, duration, is_lab, linked_lab_section?}`, `group_level INT`, `state ENUM('draft','released')`  
- **room**: `code PK`, `type ENUM('Lecture','Lab')`  
- **instructor**: `id PK`, `name`, `email TEXT UNIQUE`, `preferred_times JSONB`, `unavailable_times JSONB`, `max_load_per_week INT`  
- **student_group**: `id PK`, `level INT (1-8)`, `size INT`, `name TEXT`
  - **Auto-Sync**: Groups automatically created/updated when students are added/modified. Size reflects real-time student count per level.  
- **user_roles**: `user_id PK FK (auth.users)`, `role ENUM(scheduling, teaching_load, faculty, student, registrar)`, `name`, `email`, `level INT (1-8, students only)`, `department`, `onboarding_completed BOOL`
  - **Note**: Level (1-8) is the ONLY indicator of student academic standing. Determines required course enrollment and schedule placement.
  - **Student Groups**: Auto-created and auto-updated based on actual student counts per level via database triggers. No manual management required.
- **student_enrollment**: `id PK`, `student_id FK`, `section_id FK`, `status ENUM('registered','dropped')`, `enrolled_at`, `dropped_at`
- **schedule_comment**: `id PK`, `author_id FK (user_roles.user_id)`, `section_id FK (nullable)`, `comment_text`, `is_resolved BOOL`, `resolved_by FK`, `resolved_at` *(unified for all roles)*
- **elective_preference**: `id PK`, `student_id FK`, `course_code FK`, `rank INT` *(deprecated - legacy preference ranking, replaced by student_enrollment)*
- **student_enrollment**: `id PK`, `student_id FK`, `section_id FK`, `status ENUM('registered','dropped')`, `enrolled_at`, `dropped_at` *(V1: tracks actual elective registrations)*
- **exam**: `id PK`, `course_code FK`, `section_id FK`, `date`, `start`, `duration`, `room_codes TEXT[]`  
- **rule**: `id PK`, `time_blocks JSONB`, `forbidden_pairs JSONB`, `exam_spacing_mins INT`, `max_classes_per_instructor_day INT`, `max_classes_per_student_day INT`  
- **schedule_doc**: `id PK`, `content JSONB`, `release_tag? TEXT`, `diff_from_previous JSONB`, `created_by`, `created_at` *(reserved for V2 versioning)*
- **schedule_comment**: `id PK`, `author_id FK (user_roles.user_id)`, `section_id FK (nullable)`, `comment_text`, `is_resolved BOOL`, `resolved_by FK`, `resolved_at` *(V1: unified comment system for all roles)*
- **comment**: `id PK`, `doc_id FK`, `target_ref`, `author_id`, `text`, `created_at` *(deprecated - replaced by schedule_comment)*
- **notification**: `id PK`, `user_id`, `type`, `payload JSONB`, `read_at?`
- **time_grid_config**: `id PK`, `teaching_days TEXT[]`, `daily_start_time`, `daily_end_time`, `slot_duration_minutes INT`, `break_start_time`, `break_end_time`, `exam_days TEXT[]`, `exam_start_time`, `exam_end_time`, `typical_lab_duration_minutes INT`
- **irregular_student**: `id PK`, `student_id FK (user_roles.user_id)`, `required_course_codes TEXT[]`, `notes TEXT`, `created_by FK`, `created_at`, `updated_at` *(V1: for students not following standard level-based curriculum)*

## Scheduling Scope

**The scheduling algorithm manages SWE department courses in levels 4-8 only.**

- **SWE Courses (Levels 4-8)**: Scheduled automatically by the constraint satisfaction algorithm
- **External Courses** (MATH, CSC, CEN, IS, ENGL, etc.): Pre-scheduled, maintained as reference data
- **Foundation SWE** (Levels 1-3): Pre-scheduled, not managed by algorithm

Students see a combined schedule view with both algorithm-scheduled and pre-scheduled courses.

See [SWE_SCHEDULING_SCOPE.md](mdc:src/docs/SWE_SCHEDULING_SCOPE.md) for detailed implementation.

## Scheduling Rules (initial)
- No student group clashes across courses in the same level.  
- No instructor clashes.  
- Room uniqueness: a room_code cannot host two meetings that overlap.  
- Labs contiguous when flagged `is_lab=true`.  
- Exams observe `exam_spacing_mins` per student group and per instructor.  
- Tie‑breaker priority (assumption): 1) student clashes, 2) instructor clashes, 3) room type fit, 4) instructor preference.

## Time Grid (TBD — open item)
- Teaching days (assumption): Sun–Thu.  
- Daily window: **TBD**.  
- Slot size: **TBD** (60/90 min).  
- Fixed breaks (e.g., 12:00–13:00): **TBD**.  
- Exam windows: **TBD**.  
- Typical lab duration: **TBD**.

## Permission Matrix (summary)
| Capability | Scheduling | Teaching Load | Faculty | Student | Registrar |
|---|:--:|:--:|:--:|:--:|:--:|
| Generate recommendation | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Real‑time edit schedule (yjs) | ⏳ V2 | ⏳ V2 | ⛔ | ⛔ | ⛔ |
| Comment/feedback | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create named release | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Manage data (CRUD courses/sections/rooms) | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| JSON import/export | ✅ | ⛔ | ⛔ | ⛔ | ⛔ |
| Submit elective prefs | ⛔ | ⛔ | ⛔ | ✅ | ⛔ |
| Manage irregular students | ⛔ | ⛔ | ⛔ | ⛔ | ✅ |
| Manual student registration | ⛔ | ⛔ | ⛔ | ⛔ | ✅ |
| View personal timetable (read‑only) | ✅ | ✅ | ✅ | ✅ | ✅ |

## Success Metrics
- **M1**: 0 clashes in Released schedule (student and instructor).  
- **M2**: Recommendation ≤10 s at target scale (assumption).  
- **M3**: Positive stakeholder check: Scheduling, Teaching Load, Registrar endorse the Released schedule.  
- **M4**: ≥80% student and faculty can view their schedules without issues in UAT.

## Timeline (high‑level, 2–3 days)
1) Day 1: Schema + RLS + CRUD + JSON import/export; dashboards scaffolding.  
2) Day 2: Recommendation engine MVP + conflict detector + yjs collaboration + notifications.  
3) Day 3: Versioning with named releases; polish dashboards; demo script and seed JSON.

## Implementation Notes
- **UI**: Next.js 15 (App Router), shadcn/ui, Tailwind; Zustand for client state.  
- **Charts**: Chart.js for Level and Course overviews.  
- **Collab**: 
  - V1: Comment/feedback system accessible to all roles (section-specific and general)
  - V2: yjs provider on `schedule_doc` for real‑time concurrent editing (Scheduling + Teaching Load roles only)
  - Students and Faculty see read‑only schedule views with comment capability
- **Diff/Versioning**: jsondiffpatch per save; tag named releases.  
- **AI**: Optional chatbot via Google AI Studio for queries and explanations.  
- **Boundary**: JSON import/export endpoints for all core data.
- **Student model**: Students automatically enrolled in all required courses for their level; only electives require preference submission.

## Open Questions / Assumptions
1) Confirm time grid: teaching days, daily window, slot size, fixed breaks, exam windows, lab durations.  
2) Confirm tie‑breaker order or provide custom weights.  
3) Target scale numbers: #students, #courses, #sections, #rooms, #instructors.  
4) Registrar validations beyond clashes (e.g., minimum enrollments).  
5) Any hard departmental rules not listed (e.g., sacred hours, shared rooms, cross‑dept constraints).

---

**Simplicity principle**: "Implement the smallest thing that works." Manual forms + JSON import/export. One‑click recommendation, then edits. Real‑time collaboration for editors only (Scheduling + Teaching Load); read‑only views with comments for Faculty and Students. Students automatically enrolled in level‑based required courses; only electives require preference submission. In‑app notifications. Named releases only. Supabase Auth only.
