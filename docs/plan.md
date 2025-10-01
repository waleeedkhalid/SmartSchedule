# Implementation Operational Plan - SWE Department Scheduling System

Reference Master Feature Plan: `docs/persona_feature_implementation_plan.md`

_Last updated: 2025-09-30 (Update this timestamp when modifying)_

## ⚠️ CRITICAL SCOPE NOTE

**This system is exclusively for the Software Engineering (SWE) Department:**

- ✅ Manages SWE courses only (SWE211, SWE312, SWE314, SWE321, SWE333, SWE381, SWE434, SWE444, etc.)
- ✅ Schedules SWE sections, meetings, and exams
- ✅ Manages SWE faculty assignments and teaching loads
- ✅ Handles SWE student preferences and schedules
- ❌ **Cannot schedule or manage non-SWE courses** (CSC, MATH, PHY, etc.)
- ℹ️ Non-SWE courses appear in mockData as external dependencies only (for student reference)

## 0. How This File Is Used

- This `plan.md` is the single source of truth for day‑to‑day progress.
- Each task has: ID, Persona/Area, Description, Status, Notes.
- Status values: `TODO`, `IN_PROGRESS`, `DONE`, `BLOCKED`, `DEFERRED`.
- When something is completed, move its status to `DONE` and (optionally) add a short outcome note.
- When something needs clarification, add it under Section 7 (Open Questions) and mark the related task `BLOCKED`.
- The agent (automation) will: (1) mark progress after making changes, (2) append to Change Log, (3) surface new questions.

## 1. Current Focus / Active Sprint

```
Sprint: FOUNDATION (Sprint 1)
Timebox: TBD (assume 1 week)
Goal: Establish scaffolding (layouts, in-memory store, types, base APIs, testing harness).
Success Exit Criteria:
  - Role-based layouts exist for all personas.
  - data-store + type definitions implemented with placeholder datasets.
  - Zod schemas for core entities (Course, Section, Meeting, Exam, Rule, ExternalSlot, Preference, IrregularStudent, Comment, ScheduleVersion).
  - jsondiffpatch integrated and basic version commit function working.
  - At least 3 unit tests (rule engine stub, data-store CRUD, version diff).
```

## 2. Task Board

Legend: | ID | Persona/Area | Description | Status | Notes |

### 2.1 Foundation Sprint Tasks

| ID     | Area       | Description                                                                                         | Status | Notes                                                |
| ------ | ---------- | --------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------- |
| FND-1  | Infra      | Create role-segmented layouts & nav shells (`committee`, `student`, `load`, `faculty`, `registrar`) | TODO   |                                                      |
| FND-2  | Data       | Implement `src/lib/data-store.ts` with in-memory entity collections                                 | DONE   | Full CRUD service layer with all collections         |
| FND-3  | Types      | Add / extend types & zod schemas for all entities                                                   | DONE   | Comprehensive types.ts with all entities             |
| FND-4  | Versioning | Add `jsondiffpatch`, implement `versioning.ts` diff helper                                          | TODO   | Deferred - version APIs ready but diff lib not added |
| FND-5  | Rules      | Scaffold `rules-engine.ts` with placeholder functions & TODO comments                               | DONE   | Complete rules engine with 6 SWE rules implemented   |
| FND-6  | API        | Create baseline API route folder structure (empty handlers)                                         | DONE   | All API routes implemented with CRUD operations      |
| FND-7  | Testing    | Configure Vitest + first 3 unit tests                                                               | TODO   |                                                      |
| FND-8  | Tooling    | Add scripts: test / test:watch; install deps                                                        | TODO   |                                                      |
| FND-9  | Docs       | Create `api-contracts.md` skeleton                                                                  | DONE   | Complete api-reference.md with all endpoints         |
| FND-10 | Docs       | Create `data-model.md` with entity tables referencing zod                                           | TODO   | Types documented in types.ts, formal doc pending     |
| FND-11 | Auth Mock  | Extend mock role context if needed for userId propagation                                           | DONE   | Mock user IDs in all API routes                      |
| FND-12 | Comments   | Define `Comment` structure & placeholder API stub                                                   | DONE   | Full comments API with target types                  |

### 2.2 Scheduling Committee Sprint (Sprint 2)

| ID     | Persona   | Description                                          | Status | Notes                                                                         |
| ------ | --------- | ---------------------------------------------------- | ------ | ----------------------------------------------------------------------------- |
| COM-1  | Committee | Page: `/committee/schedule` scaffold                 | TODO   |                                                                               |
| COM-2  | Committee | Component: `ScheduleGrid` (read-only initial)        | DONE   | Scaffolded component file with basic rendering                                |
| COM-3  | Committee | API: `GET /api/schedule` returning mock schedule     | DONE   | Implemented as GET /api/sections with full enrichment                         |
| COM-4  | Committee | Component: Create/Edit Section modal                 | TODO   | API ready, UI component pending                                               |
| COM-5  | Committee | API: `POST /api/sections` validation + uniqueness    | DONE   | Full validation + conflict checking                                           |
| COM-6  | Committee | API: `PATCH /api/sections/:id` + conflict recompute  | DONE   | Implemented with validation                                                   |
| COM-7  | Committee | Meetings: `POST /api/meetings` & `DELETE` endpoints  | DONE   | Both endpoints with conflict checking                                         |
| COM-8  | Committee | `rules-engine` implement conflict + break rules      | DONE   | All 6 rules implemented + conflict detection                                  |
| COM-9  | Committee | Exams: `ExamTable` + `POST/PATCH /api/exams`         | DONE   | ExamTable with full CRUD (create/edit/delete) + console logging; APIs pending |
| COM-10 | Committee | External slots form + `GET/POST /api/external-slots` | DONE   | Full CRUD APIs implemented, UI component pending                              |
| COM-11 | Committee | Rules editor + `GET/POST/PATCH /api/rules`           | DONE   | All rules APIs implemented, UI component pending                              |
| COM-12 | Committee | Version commit API + diff storage                    | TODO   | Data structure ready, jsondiffpatch integration pending                       |
| COM-13 | Committee | Version timeline UI                                  | DONE   | VersionTimeline component scaffolded                                          |
| COM-14 | Committee | CommentPanel integration (committee scope)           | DONE   | Shared CommentPanel component created & integrated                            |
| COM-15 | Committee | Conflict highlighting in ScheduleGrid (phase 2)      | TODO   |                                                                               |
| COM-16 | Committee | Data transformation helpers library                  | DONE   | committee-data-helpers.ts with getExams, getSectionsLookup, etc. (DEC-8)      |
| COM-17 | Committee | Update demo page to use helper functions             | DONE   | Demo page refactored to use mockCourseOfferings + transformation helpers      |

### 2.3 Student & Registrar Sprint (Sprint 3)

| ID    | Persona   | Description                                         | Status | Notes                                                   |
| ----- | --------- | --------------------------------------------------- | ------ | ------------------------------------------------------- |
| STU-1 | Student   | Pages: preferences / schedule / feedback scaffolds  | TODO   |                                                         |
| STU-2 | Student   | ElectivePreferenceForm (drag + rank)                | TODO   |                                                         |
| STU-3 | Student   | API: `GET /api/courses?type=ELECTIVE`               | DONE   | Implemented with type and level filters                 |
| STU-4 | Student   | API: `GET /api/preferences/me`                      | DONE   | Implemented as GET /api/preferences                     |
| STU-5 | Student   | API: `POST /api/preferences` (cap + no duplicates)  | DONE   | Full validation with 6 preference cap                   |
| STU-6 | Student   | Public schedule API `GET /api/schedule/public`      | DONE   | Returns SWE sections + external slots                   |
| STU-7 | Student   | Feedback form to `POST /api/comments`               | DONE   | Comments API supports all target types                  |
| REG-1 | Registrar | Page: `/registrar/irregular` scaffold               | TODO   |                                                         |
| REG-2 | Registrar | IrregularStudentFormList component                  | DONE   | Full CRUD with local state management + console logging |
| REG-3 | Registrar | APIs: `GET/POST /api/irregular`                     | DONE   | Full CRUD APIs with course validation                   |
| REG-4 | Registrar | API: `PATCH /api/irregular/:id`                     | DONE   | Update and delete endpoints implemented                 |
| REG-5 | Registrar | Permissions / role guard for registrar endpoints    | TODO   | Deferred to Phase 4+ with real auth                     |
| REG-6 | Registrar | Link irregular data into committee schedule sidebar | TODO   |                                                         |

### 2.4 Teaching Load & Faculty Sprint (Sprint 4)

| ID     | Persona | Description                                | Status | Notes                                      |
| ------ | ------- | ------------------------------------------ | ------ | ------------------------------------------ |
| LOAD-1 | Load    | Page: `/load/review` scaffold              | TODO   |                                            |
| LOAD-2 | Load    | InstructorLoadTable component              | DONE   | Created with 15hr hard-coded limit (DEC-4) |
| LOAD-3 | Load    | ConflictList component                     | DONE   | Created with conflict highlighting         |
| LOAD-4 | Load    | API: `GET /api/load/overview`              | DONE   | Returns instructor loads with hours calc   |
| LOAD-5 | Load    | Comments integration (teaching load scope) | DONE   | Comments API supports all personas         |
| FAC-1  | Faculty | Page: `/faculty/my-assignments` scaffold   | TODO   |                                            |
| FAC-2  | Faculty | MyScheduleTable component                  | TODO   |                                            |
| FAC-3  | Faculty | AvailabilityForm integration (optional)    | TODO   |                                            |
| FAC-4  | Faculty | API: `GET /api/faculty/assignments`        | DONE   | Returns faculty sections with meetings     |
| FAC-5  | Faculty | Comments integration (faculty scope)       | DONE   | Comments API ready                         |

### 2.5 Polish & QA Sprint (Sprint 5)

| ID   | Area          | Description                            | Status | Notes |
| ---- | ------------- | -------------------------------------- | ------ | ----- |
| QA-1 | Testing       | Playwright smoke tests core flows      | TODO   |       |
| QA-2 | Accessibility | Basic a11y audit + alt/aria review     | TODO   |       |
| QA-3 | Performance   | Measure key pages (TTFB & interaction) | TODO   |       |
| QA-4 | Error UX      | Consistent error & empty states        | TODO   |       |
| QA-5 | Docs          | Finalize testing scripts + API docs    | TODO   |       |
| QA-6 | Cleanup       | Dead code & TODO sweep                 | TODO   |       |

## 3. Change Log

| Date       | Change                                                                                            | Author | Related IDs                                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------- |
| 2025-09-30 | Initial operational plan created                                                                  | system | ALL                                                                                                               |
| 2025-09-30 | Resolved Open Questions Q-1..Q-5; added component scaffolding tasks status updates                | system | Q-1,Q-2,Q-3,Q-4,Q-5, COM-2, COM-9, COM-10, COM-13, COM-14, STU-2, LOAD-3, LOAD-5, FAC-2, REG-2                    |
| 2025-09-30 | Integrated new components into demo pages with console logging for API data                       | system | COM-2, COM-9, COM-10, COM-13, COM-14, LOAD-2, LOAD-3, REG-2                                                       |
| 2025-09-30 | Created data transformation helpers & refactored ExamTable; updated demo to use helper functions  | system | COM-9, COM-16, COM-17, DEC-8                                                                                      |
| 2025-09-30 | Enhanced ExamTable with full CRUD operations (edit/delete) and confirmation dialog                | system | COM-9                                                                                                             |
| 2025-09-30 | Enhanced IrregularStudentFormList with local state + full CRUD (create/edit/delete)               | system | REG-2                                                                                                             |
| 2025-09-30 | Clarified system scope: SWE department only; updated all major docs with scope limitation         | system | DEC-9, README, PHASE3_SCOPE, plan.md, copilot-instructions, persona_feature_plan                                  |
| 2025-09-30 | Implemented complete backend infrastructure: types, data-store, rules-engine, seed data, all APIs | system | FND-2, FND-3, FND-5, FND-6, FND-9, FND-11, FND-12, COM-3, COM-5..8, COM-10..11, STU-3..7, REG-3..4, LOAD-4, FAC-4 |
| 2025-10-01 | Migrated ElectiveSurvey to use mockElectivePackages (SWE plan); added category badges             | system | STU-2, DEC-8                                                                                                      |
| 2025-10-01 | Added category filters to ElectiveSurvey with smart counters and clear filter button              | system | STU-2                                                                                                             |

## 4. Decisions Log

| ID    | Decision                                                                                  | Date       | Rationale                            | Impact                            |
| ----- | ----------------------------------------------------------------------------------------- | ---------- | ------------------------------------ | --------------------------------- |
| DEC-1 | Use in-memory store until post-Phase 3                                                    | 2025-09-30 | Scope constraint                     | Simplifies early iteration        |
| DEC-2 | Defer real-time collab to later phase                                                     | 2025-09-30 | Out-of-scope per requirements        | Reduces complexity                |
| DEC-3 | Preference cap fixed at 6 (dynamic later via DB)                                          | 2025-09-30 | Align with stakeholder answer        | Drives validation logic early     |
| DEC-4 | Instructor load limits sourced from DB later; hard-coded constants now                    | 2025-09-30 | Clarification of interim approach    | Enables early load computations   |
| DEC-5 | Exam categories: support `midterm`, optional `midterm2`, and `final`                      | 2025-09-30 | Mirrors external-departments dataset | Simplifies exam model             |
| DEC-6 | External slot minimal fields locked (id,label,day,startTime,endTime,room?,reason?)        | 2025-09-30 | Prevent scope creep                  | Unblocks ExternalSlotForm         |
| DEC-7 | Irregular student adds `advisorId` (faculty id) + future advising view                    | 2025-09-30 | Data requirement confirmed           | Future faculty advising page      |
| DEC-8 | Use functional data transformation pattern: mockCourseOfferings → helpers → UI components | 2025-09-30 | User requirement for mockData as DB  | Clean separation of data/UI       |
| DEC-9 | System scope limited to SWE department courses only; non-SWE courses are external refs    | 2025-09-30 | Core business requirement            | Prevents scope creep, clear focus |

## 5. Risks & Mitigations

| Risk                                    | Likelihood | Impact | Mitigation                                | Owner     | Status |
| --------------------------------------- | ---------- | ------ | ----------------------------------------- | --------- | ------ |
| Expanding scope (adding realtime early) | Medium     | High   | Keep scope gate in reviews                | PM        | Open   |
| Rule engine complexity creep            | Medium     | Medium | Start with minimal set; add feature flags | Tech Lead | Open   |
| Large UI surface overwhelms QA          | Medium     | Medium | Incremental persona vertical slices       | QA Lead   | Open   |

## 6. Metrics (Future Placeholder)

- Build pass rate: TBD
- Test coverage target: 40% logic modules by Sprint 5
- Mean task cycle time: (to collect once started)

## 7. Open Questions

| ID  | Question                                               | Needed By     | Blocking IDs   | Status   | Notes                                     |
| --- | ------------------------------------------------------ | ------------- | -------------- | -------- | ----------------------------------------- |
| Q-1 | Preference cap final number? (assumed 6)               | Before STU-5  | STU-5          | RESOLVED | Fixed = 6 (DEC-3)                         |
| Q-2 | Instructor load limit source? (rules vs static config) | Before LOAD-2 | LOAD-2, LOAD-4 | RESOLVED | Hard-coded constants Phase 3 (DEC-4)      |
| Q-3 | Required exam categories? (midterm, final, makeup?)    | Before COM-9  | COM-9          | RESOLVED | midterm, optional midterm2, final (DEC-5) |
| Q-4 | External slot data fields minimal set?                 | Before COM-10 | COM-10         | RESOLVED | Keep minimal fields (DEC-6)               |
| Q-5 | Irregular student additional metadata (advisor?)       | Before REG-3  | REG-3          | RESOLVED | Add advisorId field (DEC-7)               |

## 8. Update Procedure (For Agent)

1. After implementing code affecting a task, change its Status and add a brief note.
2. Append a line to Change Log with date + summary + related IDs.
3. If ambiguity arises, add an entry to Open Questions and set the task to `BLOCKED`.
4. Never delete historical rows—add new rows for new decisions / changes.

## 9. Short-Term Next Actions (Proposed)

1. Confirm answers to Open Questions Q-1 .. Q-5 (or provide defaults to proceed).
2. Begin FND-1 through FND-3 in a single PR (layouts + data-store + schemas) to unblock downstream work.
3. Add initial test harness (FND-7) immediately after FND-2 to prevent drift.

---

_Provide clarifications for Open Questions so implementation can begin without assumptions becoming stale._
