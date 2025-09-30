# Implementation Operational Plan

Reference Master Feature Plan: `docs/persona_feature_implementation_plan.md`

_Last updated: 2025-09-30 (Update this timestamp when modifying)_

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

| ID     | Area       | Description                                                                                         | Status | Notes |
| ------ | ---------- | --------------------------------------------------------------------------------------------------- | ------ | ----- |
| FND-1  | Infra      | Create role-segmented layouts & nav shells (`committee`, `student`, `load`, `faculty`, `registrar`) | TODO   |       |
| FND-2  | Data       | Implement `src/lib/data-store.ts` with in-memory entity collections                                 | TODO   |       |
| FND-3  | Types      | Add / extend types & zod schemas for all entities                                                   | TODO   |       |
| FND-4  | Versioning | Add `jsondiffpatch`, implement `versioning.ts` diff helper                                          | TODO   |       |
| FND-5  | Rules      | Scaffold `rules-engine.ts` with placeholder functions & TODO comments                               | TODO   |       |
| FND-6  | API        | Create baseline API route folder structure (empty handlers)                                         | TODO   |       |
| FND-7  | Testing    | Configure Vitest + first 3 unit tests                                                               | TODO   |       |
| FND-8  | Tooling    | Add scripts: test / test:watch; install deps                                                        | TODO   |       |
| FND-9  | Docs       | Create `api-contracts.md` skeleton                                                                  | TODO   |       |
| FND-10 | Docs       | Create `data-model.md` with entity tables referencing zod                                           | TODO   |       |
| FND-11 | Auth Mock  | Extend mock role context if needed for userId propagation                                           | TODO   |       |
| FND-12 | Comments   | Define `Comment` structure & placeholder API stub                                                   | TODO   |       |

### 2.2 Scheduling Committee Sprint (Sprint 2)

| ID     | Persona   | Description                                          | Status      | Notes                                          |
| ------ | --------- | ---------------------------------------------------- | ----------- | ---------------------------------------------- |
| COM-1  | Committee | Page: `/committee/schedule` scaffold                 | TODO        |                                                |
| COM-2  | Committee | Component: `ScheduleGrid` (read-only initial)        | DONE        | Scaffolded component file with basic rendering |
| COM-3  | Committee | API: `GET /api/schedule` returning mock schedule     | TODO        |                                                |
| COM-4  | Committee | Component: Create/Edit Section modal                 | TODO        |                                                |
| COM-5  | Committee | API: `POST /api/sections` validation + uniqueness    | TODO        |                                                |
| COM-6  | Committee | API: `PATCH /api/sections/:id` + conflict recompute  | TODO        |                                                |
| COM-7  | Committee | Meetings: `POST /api/meetings` & `DELETE` endpoints  | TODO        |                                                |
| COM-8  | Committee | `rules-engine` implement conflict + break rules      | TODO        |                                                |
| COM-9  | Committee | Exams: `ExamTable` + `POST/PATCH /api/exams`         | IN_PROGRESS | UI table scaffolded; APIs pending              |
| COM-10 | Committee | External slots form + `GET/POST /api/external-slots` | TODO        |                                                |
| COM-11 | Committee | Rules editor + `GET/POST/PATCH /api/rules`           | TODO        |                                                |
| COM-12 | Committee | Version commit API + diff storage                    | TODO        |                                                |
| COM-13 | Committee | Version timeline UI                                  | DONE        | VersionTimeline component scaffolded           |
| COM-14 | Committee | CommentPanel integration (committee scope)           | IN_PROGRESS | Shared CommentPanel component created          |
| COM-15 | Committee | Conflict highlighting in ScheduleGrid (phase 2)      | TODO        |                                                |

### 2.3 Student & Registrar Sprint (Sprint 3)

| ID    | Persona   | Description                                         | Status | Notes |
| ----- | --------- | --------------------------------------------------- | ------ | ----- |
| STU-1 | Student   | Pages: preferences / schedule / feedback scaffolds  | TODO   |       |
| STU-2 | Student   | ElectivePreferenceForm (drag + rank)                | TODO   |       |
| STU-3 | Student   | API: `GET /api/courses?type=ELECTIVE`               | TODO   |       |
| STU-4 | Student   | API: `GET /api/preferences/me`                      | TODO   |       |
| STU-5 | Student   | API: `POST /api/preferences` (cap + no duplicates)  | TODO   |       |
| STU-6 | Student   | Public schedule API `GET /api/schedule/public`      | TODO   |       |
| STU-7 | Student   | Feedback form to `POST /api/comments`               | TODO   |       |
| REG-1 | Registrar | Page: `/registrar/irregular` scaffold               | TODO   |       |
| REG-2 | Registrar | IrregularStudentFormList component                  | TODO   |       |
| REG-3 | Registrar | APIs: `GET/POST /api/irregular`                     | TODO   |       |
| REG-4 | Registrar | API: `PATCH /api/irregular/:id`                     | TODO   |       |
| REG-5 | Registrar | Permissions / role guard for registrar endpoints    | TODO   |       |
| REG-6 | Registrar | Link irregular data into committee schedule sidebar | TODO   |       |

### 2.4 Teaching Load & Faculty Sprint (Sprint 4)

| ID     | Persona | Description                                | Status | Notes |
| ------ | ------- | ------------------------------------------ | ------ | ----- |
| LOAD-1 | Load    | Page: `/load/review` scaffold              | TODO   |       |
| LOAD-2 | Load    | InstructorLoadTable component              | TODO   |       |
| LOAD-3 | Load    | ConflictList component                     | TODO   |       |
| LOAD-4 | Load    | API: `GET /api/load/overview`              | TODO   |       |
| LOAD-5 | Load    | Comments integration (teaching load scope) | TODO   |       |
| FAC-1  | Faculty | Page: `/faculty/my-assignments` scaffold   | TODO   |       |
| FAC-2  | Faculty | MyScheduleTable component                  | TODO   |       |
| FAC-3  | Faculty | AvailabilityForm integration (optional)    | TODO   |       |
| FAC-4  | Faculty | API: `GET /api/faculty/assignments`        | TODO   |       |
| FAC-5  | Faculty | Comments integration (faculty scope)       | TODO   |       |

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

| Date       | Change                                                                             | Author | Related IDs                                                                                    |
| ---------- | ---------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| 2025-09-30 | Initial operational plan created                                                   | system | ALL                                                                                            |
| 2025-09-30 | Resolved Open Questions Q-1..Q-5; added component scaffolding tasks status updates | system | Q-1,Q-2,Q-3,Q-4,Q-5, COM-2, COM-9, COM-10, COM-13, COM-14, STU-2, LOAD-3, LOAD-5, FAC-2, REG-2 |

## 4. Decisions Log

| ID    | Decision                                                                           | Date       | Rationale                            | Impact                          |
| ----- | ---------------------------------------------------------------------------------- | ---------- | ------------------------------------ | ------------------------------- |
| DEC-1 | Use in-memory store until post-Phase 3                                             | 2025-09-30 | Scope constraint                     | Simplifies early iteration      |
| DEC-2 | Defer real-time collab to later phase                                              | 2025-09-30 | Out-of-scope per requirements        | Reduces complexity              |
| DEC-3 | Preference cap fixed at 6 (dynamic later via DB)                                   | 2025-09-30 | Align with stakeholder answer        | Drives validation logic early   |
| DEC-4 | Instructor load limits sourced from DB later; hard-coded constants now             | 2025-09-30 | Clarification of interim approach    | Enables early load computations |
| DEC-5 | Exam categories: support `midterm`, optional `midterm2`, and `final`               | 2025-09-30 | Mirrors external-departments dataset | Simplifies exam model           |
| DEC-6 | External slot minimal fields locked (id,label,day,startTime,endTime,room?,reason?) | 2025-09-30 | Prevent scope creep                  | Unblocks ExternalSlotForm       |
| DEC-7 | Irregular student adds `advisorId` (faculty id) + future advising view             | 2025-09-30 | Data requirement confirmed           | Future faculty advising page    |

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
