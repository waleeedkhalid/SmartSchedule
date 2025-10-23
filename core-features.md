#

PRD: University Scheduling System
Version: 1.0
Repo: <fill>
Owners: PM <fill>, Tech Lead <fill>
Last updated: <fill>
===============================================================================

1. OVERVIEW

- Purpose: Web app to generate, review, and publish course schedules and exams.
- Stack (fixed): Next.js 15 App Router, TypeScript strict, Tailwind + shadcn/ui,
  Supabase (auth + DB), SWR, Zod, Chart.js, Yjs, jsondiffpatch, Lucide, ESLint/Prettier,
  Vercel, @google/genai.
- High-level: Students submit elective preferences and view schedules. Faculty submit
  availability, preferences, and feedback. Scheduler manages rules, imports data,
  runs generation, and publishes drafts. Teaching Load committee validates instructor
  load conflicts. Registrar manages irregular student records.

2. GOALS AND NON-GOALS

- Goals:
  1. Generate a conflict-minimized draft schedule and exam plan.
  2. Capture feedback from Students, Faculty, Scheduler, Teaching Load, Registrar.
  3. Enforce RBAC with secure data access and audit trail.
  4. Provide dashboards and real-time collaboration for committees.
  5. Support version diffs and rollbacks of schedules.
- Non-goals:
  - Full SIS integration, grade management, payment, HR.
  - Automated room booking outside course/exam contexts.
  - Timetabling research algorithms beyond current heuristic + Gemini guidance.

3. PERSONAS

- Student: submits elective preferences; views schedule and exams; rates preliminary schedule.
- Faculty: declares availability and course preferences; reviews draft assignments; submits feedback.
- Scheduler (Committee): imports data; sets rules; runs generation; manages workflows; publishes.
- Teaching Load (Committee): validates instructor load and conflict-free schedules; requests changes.
- Registrar: manages irregular students and required courses to prevent falling behind.

4. SCOPE BY PHASE (ALIGNED TO GRADING)

- Phase 1 Initiation (due Thu Sep 11 23:59)
  - Team formation, repo with branch + PR workflow.
  - Draft demo schedule.
  - Requirements breakdown.
  - Gantt chart explicitly noted as missing.
- Phase 2 Infrastructure (due Thu Sep 18 23:59)
  - Architecture choice + rationale.
  - DB schema + ERD; synthetic dataset loaded.
- Phase 3 Feature Impl (due Thu Oct 2 23:59)
  - Students: elective prefs, schedule view.
  - Faculty: availability, preferences; committees workflows.
  - Responsive UI with Tailwind/shadcn.
  - API usage for recommendations.
- Phase 4 Security (due Thu Oct 23 23:59)
  - RBAC auth; input validation; privacy.
  - Deployed site on hosting (Vercel allowed; GoDaddy acceptable).
- Phase 5 Optimization & Integration (due Thu Nov 13 23:59)
  - Dashboards (Chart.js).
  - Real-time collab (Yjs).
  - Version control (jsondiffpatch).
  - Performance optimizations.
- Phase 6 Extendability (due Sun Nov 30 23:59)
  - Android app connectivity or PWA; API reusability.
- Phase 7 Final Demo (due Sun Dec 7)
  - End-to-end demo covering all personas with clear narrative.

5. SUCCESS METRICS

- Scheduling: <5% hard conflicts in draft; <1% after committee iteration.
- Feedback cycle time: median <3 days per iteration.
- Uptime: 99.5% during demo week.
- P95 page load <2.5s on Vercel.
- Auth: 0 high-risk findings in basic security review.
- Data quality: 100% referential integrity; seed fixtures load idempotently.

6. ROLES AND ACCESS (RBAC)

- Roles: student, faculty, scheduler, load_committee, registrar, admin.
- Access:
  - student: read own schedule; create/update own preferences and feedback.
  - faculty: read own assignments; create/update own availability/preferences/feedback.
  - scheduler: CRUD rules; import/export; run generation; approve and publish drafts.
  - load_committee: read all drafts; comment; flag conflicts; request changes.
  - registrar: manage irregular students dataset.
  - admin: role assignment; environment settings.
- Enforcement:
  - Supabase RLS on tables; Next.js middleware for route gating.
  - All API routes validate session and role.

7. CORE WORKFLOWS

- Student preferences:
  1. Student selects elective courses ranked list with constraints (Zod validated).
  2. Submit; instant preview of implications where possible.
  3. Post-generation, student reviews draft schedule and rates it 1–5; optional comments.
- Faculty availability/preferences:
  1. Define weekly blocks unavailable; preferred time windows; course preferences.
  2. Review proposed assignments; submit structured feedback.
- Scheduler generation:
  1. Import CSVs: courses, sections, rooms, capacities, faculty, constraints.
  2. Define rules: max daily load, room capacity fit, instructor no-overlap, travel gap, exam windows.
  3. Run generation: heuristic engine + Gemini for recommendations.
  4. Produce Draft vN with audit entry; notify committees.
- Teaching Load review:
  1. Auto-detect conflicts: double-booking, over-limit loads, cross-campus gaps.
  2. Comment or change requests; tag impacted entities.
- Registrar irregular students:
  1. CRUD irregular students, remaining courses, must-take this term.
  2. Influence scheduling priority weights.
- Publish:
  1. Scheduler marks Draft vN as Published.
  2. Students/Faculty see published schedule and exams.

8. FUNCTIONAL REQUIREMENTS

- Data import/export:
  - CSV import with schema validation and typed preview.
  - Export current draft/published schedules.
- Schedule generation:
  - Inputs: rules + dataset + preferences + irregulars.
  - Outputs: section times, rooms, instructor assignments, exam slots.
  - Objective: minimize conflicts, soft penalties for preferences.
- Feedback:
  - Structured review forms per persona.
  - Comment threads linked to entities (course, section, room, slot).
- Versioning:
  - Store drafts; compute diffs with jsondiffpatch.
  - Rollback to prior draft with audit trail.
- Real-time:
  - Yjs-powered edits on rules and draft schedule board for committee sessions.
- Dashboards:
  - KPIs: conflicts count, room utilization, load distribution, satisfaction ratings.
- Notifications:
  - Supabase triggers; in-app notifications list; optional email webhook later.
- Exams:
  - Exam slots generated with room capacity and conflict-free constraints.
- Search/filter:
  - Full-text search by course code, instructor, room; fast filters by day/time.

9. NON-FUNCTIONAL REQUIREMENTS

- Security: RLS, parameterized queries, Zod validation on input, HTTPS only.
- Privacy: role-scoped reads; PII minimized.
- Performance: server components for heavy queries; SWR for cache; indexes on FK and lookup columns.
- Accessibility: WCAG AA color contrast; keyboard navigation in forms and tables.
- Reliability: seeded demo dataset; deterministic seed for reproducible results.
- Observability: basic request logs; error boundaries; simple metrics panel.

10. DATA MODEL SNAPSHOT (HIGH LEVEL)

- users(id, email, name, role)
- students(user_id FK users.id, cohort, major)
- faculty(user_id FK users.id, dept)
- courses(id, code, title, credits, dept)
- sections(id, course_id, term, instructor_id FK faculty.user_id, cap, status)
- rooms(id, code, capacity, building)
- timeslots(id, day, start_min, end_min)
- section_meetings(id, section_id, room_id, timeslot_id)
- exams(id, section_id, date, start_min, end_min, room_id)
- student_preferences(id, student_id, course_id, rank, constraints jsonb)
- faculty_prefs(id, faculty_id, course_id, priority, time_prefs jsonb)
- faculty_availability(id, faculty_id, day, start_min, end_min, available boolean)
- rules(id, key, value jsonb, updated_by)
- irregular_students(id, name, remaining jsonb, must_take jsonb)
- drafts(id, label, created_by, created_at)
- draft_items(id, draft_id, entity_type, entity_id, payload jsonb)
- feedback(id, persona, entity_type, entity_id, rating int, comment, author_id)
- audit_log(id, actor_id, action, entity, entity_id, diff jsonb, created_at)
- notifications(id, user_id, type, payload jsonb, read_at)

11. API SURFACE (REST, Next.js App Router)

- Auth:
  - GET /api/auth/session -> current session
- Preferences:
  - GET /api/student/preferences
  - POST /api/student/preferences
  - GET /api/faculty/availability
  - POST /api/faculty/availability
  - GET /api/faculty/preferences
  - POST /api/faculty/preferences
- Scheduling:
  - POST /api/import/csv (multipart) -> validate + stage
  - POST /api/rules -> upsert
  - GET /api/rules
  - POST /api/schedule/generate -> returns draft_id
  - GET /api/drafts/:id
  - POST /api/drafts/:id/publish
  - POST /api/feedback -> entity scoped
- Exams:
  - POST /api/exams/generate
  - GET /api/exams
- Analytics:
  - GET /api/dashboard/kpis
- Notifications:
  - GET /api/notifications
  - POST /api/notifications/read
- Registrar:
  - GET/POST /api/registrar/irregular

12. VALIDATION RULES (ZOD, EXAMPLES)

- Preferences:
  - rank unique per student; rank range 1..10; only open electives.
- Availability:
  - no overlapping windows; start < end; within 07:00..22:00.
- Rules:
  - room capacity >= section cap; instructor cannot overlap meetings; max daily load per instructor; min gap between meetings optional; exam overlaps forbidden.

13. SCHEDULER RULES ENGINE

- Hard constraints:
  - No instructor double-booking.
  - Room capacity fit.
  - Course section meeting count matches syllabus.
  - Exam conflicts avoided for students and instructors.
- Soft constraints with weights:
  - Student elective ranks.
  - Faculty preferred times.
  - Room building proximity per instructor day schedule.
- Objective:
  - Minimize weighted penalties; return feasible solution or top N candidates.
- Gemini use:
  - Suggest weight tuning and highlight conflict clusters with explanations.
  - Never auto-accept changes without human approval.

14. UI REQUIREMENTS

- Students:
  - Elective preferences form with drag-rank; schedule week view; exam list; rating modal.
- Faculty:
  - Availability grid; preference form; proposed assignments list; feedback panel.
- Scheduler:
  - CSV import wizard with schema preview; rules editor; run generation button; draft board with status; publish control.
- Teaching Load:
  - Conflict dashboard; filter by instructor/department; annotate conflicts; request changes.
- Registrar:
  - Irregular students table with quick add; course requirement editor.
- Shared:
  - Global search; notifications center; role-aware navigation; mobile responsive.

15. REAL-TIME AND VERSIONING

- Real-time:
  - Yjs docs per draft; presence indicators; change locks on specific entities.
- Versioning:
  - jsondiffpatch diffs between Draft vN and vN-1; render viewer; rollback action with audit.

16. SECURITY AND PRIVACY

- Supabase Auth; JWT checked in middleware.
- RLS policies per table; only role-scoped reads.
- Sensitive fields minimized; logs avoid PII.
- CSRF not applicable to same-origin fetch; still validate origin on POST.
- Rate limits on mutation endpoints.

17. PERFORMANCE

- Server components for heavy queries; pagination on tables.
- Indexes: sections(course_id, term), meetings(section_id, timeslot_id), rooms(capacity), exams(section_id,date).
- Caching: SWR with keyed tags; revalidate on publish/import.

18. ERROR STATES

- Import: malformed CSV -> show row-level errors and downloadable error report.
- Generation: infeasible -> present conflict set and suggested relaxations.
- Auth: expired session -> redirect to sign-in, preserve intent.

19. ANALYTICS AND KPIs

- Conflicts over time; utilization; satisfaction ratings; turnaround time of feedback; publish cadence.

20. DEPLOYMENT AND ENV

- Vercel project with env vars:
  - NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_SUPABASE_ANON_KEY,
  - GEMINI_API_KEY, NEXT_PUBLIC_APP_URL.
- Preview deployments per PR; protected main.

21. RISKS AND MITIGATIONS

- Risk: low-quality seed data -> bad demo. Mitigation: curated fixtures + lint checks.
- Risk: infeasible schedule. Mitigation: rule relaxations with human overrides.
- Risk: real-time collisions. Mitigation: Yjs awareness + per-entity locks.
- Risk: scope creep. Mitigation: phase gates; change log.

22. ACCEPTANCE CRITERIA BY PHASE

- Phase 1: repo + PR flow + demo schedule + requirements list in repo.
- Phase 2: ERD image + SQL schema + seed script; dataset loads without errors.
- Phase 3: Working UI for student/faculty; committee workflows reachable; API live.
- Phase 4: RBAC enforced; Zod on all POST; site reachable on public URL.
- Phase 5: Charts dashboards; Yjs live presence; diffs and rollback; P95 <2.5s.
- Phase 6: Android or PWA client calling same APIs; documented API usage.
- Phase 7: Demo script covers all personas; zero blocking defects.

23. CHANGE LOG

- # v1.0: Initial PRD.
