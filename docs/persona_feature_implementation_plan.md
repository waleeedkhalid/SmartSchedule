# Persona-Based Feature Implementation Plan

_Last updated: 2025-09-30_

## 1. Guiding Principles

- **Phase 3 Scope Alignment**: Deliver persona workflows using the existing Next.js 15 App Router stack with TypeScript, Tailwind, shadcn/ui, mock authentication, and in-memory JSON persistence.
- **Incremental Enablement**: Ship persona surfaces in thin vertical slices—UI skeleton ➜ mock data ➜ write interactions ➜ connect to APIs ➜ enforce business rules ➜ add validation/tests.
- **Shared Foundations**: Reuse existing shared components (`src/components/shared`), ui primitives (`src/components/ui`), and mock data utilities (`src/data/mockData.ts`). Maintain consistent experience with the role switcher and notification system.
- **Plan for Evolution**: Design APIs, business rules, and data access to be database-ready. Keep persistence abstractions in `src/lib` so we can replace in-memory stores with Prisma later.

## 2. Cross-Cutting Architecture

| Area                     | Decision                                                | Notes                                                                                                            |
| ------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Routing                  | App Router pages in `src/app`                           | New segments per persona (`committee`, `student`, `load`, `faculty`, `registrar`).                               |
| State                    | SWR + local component state                             | SWR mocks use `src/lib/fetcher.ts`; stub endpoints return JSON from in-memory store.                             |
| Data Store               | `src/lib/data-store.ts` (new)                           | Central module exporting CRUD helpers per entity; wraps mutable JSON objects persisted in memory during runtime. |
| Validation               | Zod schemas per entity                                  | Place under `src/lib/zod` (extend existing pattern).                                                             |
| Notifications & Comments | Reuse `NotificationsBell`, add `CommentPanel` component | Comments stored in `data-store`; filtered by persona/payload.                                                    |
| Versioning               | In-memory `ScheduleVersion[]` with jsondiffpatch output | Use `jsondiffpatch` npm package (add dependency) to generate diffs on version commits.                           |
| Error Handling           | Standardized JSON `{ success, data?, error? }`          | Include `code` and `message`; surface constraint violations clearly.                                             |
| Testing                  | Vitest for logic / Playwright smoke routes              | Add minimal tests for data store and rule engine.                                                                |
| Styling                  | Tailwind + shadcn/ui components                         | Follow existing design language.                                                                                 |

### 2.1 New Shared Utilities

- `src/lib/data-store.ts`: Entities: `Section`, `Meeting`, `Exam`, `SchedulingRule`, `ExternalSlot`, `ScheduleVersion`, `ElectivePreference`, `Comment`, `IrregularStudent`, `InstructorLoad`. Provide typed CRUD with optimistic locking via version number integer.
- `src/lib/rules-engine.ts`: Functions to enforce breaks, midterm window, contiguous labs, conflict detection (time/room/instructor).
- `src/lib/versioning.ts`: Helpers for computing diffs and storing `ScheduleChange` records.
- Extend `src/types` with new entity definitions to keep UI and APIs in sync.

## 3. Persona Roadmaps

### 3.1 Scheduling Committee

**Routes**

- `src/app/committee/layout.tsx`: role guard + shared navigation (Schedule, Exams, Rules, External Slots, Versions).
- Pages: `/committee/schedule`, `/committee/exams`, `/committee/rules`, `/committee/external-slots`, `/committee/versions`.

**UI Components (new)**

- `ScheduleGrid`: visual timetable; reuse `StudentScheduleGrid` structure with committee interactions (drag/drop for meetings).
- `ExamTable`: table view of exams with inline editing.
- `RuleEditor`: form list for key/value JSON rules with validation.
- `ExternalSlotForm`: list + modal for manual external slot entry.
- `VersionTimeline`: timeline UI showing version history and diff summaries.
- `CommentPanel`: persona-specific instance that consumes comments store.

**Forms & Interactions**

- Create/Edit Section modal: Fields for course, sectionId, capacity, instructor, room; integrates with rule checks.
- Assign Room / Instructor quick actions inside `ScheduleGrid` sidebar.
- Meeting editor drawer: add/update/delete meeting blocks with time conflict validation.
- Exam definition form: exam type, datetime, room, invigilator, linked section(s).
- Rule key/value editor: JSON schema validated with `zod` before persistence.
- External slot import: manual entry table with add/remove rows.

**APIs (App Router routes)**

- `GET /api/schedule?version=`: returns schedule snapshot with sections, meetings, conflicts.
- `POST /api/sections`: create section; validate uniqueness and course existence.
- `PATCH /api/sections/:id`: update capacity, instructor, room; re-run conflict detection.
- `POST /api/meetings`, `DELETE /api/meetings/:id`: manage meeting instances; enforce breaks/midterm windows.
- `POST /api/exams`, `PATCH /api/exams/:id`: maintain exam schedule, ensure no room/time clashes.
- `GET/POST/PATCH /api/rules`: CRUD for scheduling rules (key/value pairs + metadata).
- `GET/POST /api/external-slots`: manage external slot entries (reserved times/rooms).
- `POST /api/versions/commit`: persist diff between active schedule and prior version; mark active version.

**Business Logic**

- Rule enforcement via `rules-engine`: break compliance, contiguous labs, midterm windows.
- Conflict detection: time overlap for rooms and instructors, exam collisions.
- Version diff: compare previous version schedule JSON using `jsondiffpatch`.
- Error reporting: return constraint message array when violations occur.

**Data Store Entities**

- `Section`, `SectionMeeting`, `Exam`, `SchedulingRule`, `ExternalSlot`, `ScheduleVersion`, `ScheduleChange` (diff + meta).

### 3.2 Students

**Routes**

- `src/app/student/preferences`, `/student/schedule`, `/student/feedback` (ensure layout guard for student role).

**UI Components**

- `ElectivePreferenceForm`: ranked drag-and-drop list with cap enforcement and duplicate prevention.
- `ScheduleViewer`: read-only schedule view bound to published version.
- `FeedbackForm`: connects to comments API, tagged with student persona.

**APIs**

- `GET /api/courses?type=ELECTIVE&level=`: filter courses by type/level.
- `GET /api/preferences/me`: returns student’s stored preferences.
- `POST /api/preferences`: accept list of course IDs (max N) with rank validation.
- `GET /api/schedule/public`: returns active/published schedule version.
- `POST /api/comments`: shared endpoint to submit feedback (persona tag `STUDENT`).

**Business Logic**

- Cap at N preferences (configurable, default 6).
- Prevent duplicates via set validation.
- Attach feedback comments to current schedule version id.

**Data Store Entities**

- `ElectivePreference` (userId, ranks), `Comment` (with persona + scope), read-only `ScheduleVersion`.

### 3.3 Teaching Load Committee

**Routes**

- `/load/review` under `src/app/load` with committee guard.

**UI Components**

- `InstructorLoadTable`: aggregated view of hours vs assigned load per instructor.
- `ConflictList`: list UI for overloads or overlaps.
- `CommentPanel`: specialized for teaching load feedback.
- `ApproveSuggestions`: interactable list to flag suggestions for scheduler.

**APIs**

- `GET /api/load/overview`: returns per-instructor loads, conflicts details.
- `POST /api/comments`: reuse shared comment endpoint with persona `TEACHING_LOAD`.

**Business Logic**

- Compute teaching hours from sections + meetings; compare to limits (config in rules store).
- Highlight overlapping meeting times per instructor.

**Data Store Entities**

- Derived from `Section` and `SectionMeeting`; store `InstructorLoadSummary` snapshots for caching if needed.

### 3.4 Faculty

**Routes**

- `/faculty/my-assignments` with faculty layout.

**UI Components**

- `MyScheduleTable`: list/time view of assigned sections.
- `AvailabilityForm`: simple weekly availability toggle (optional, reuses `FacultyAvailabilityForm`).
- `CommentPanel`: persona `FACULTY` for feedback to scheduler.

**APIs**

- `GET /api/faculty/assignments`: filter sections by instructor (from mock auth context).
- `POST /api/comments`: persona `FACULTY` input.

**Business Logic**

- Ensure data scoped to authenticated instructor (use mock role context to supply `userId`).

### 3.5 Registrar

**Routes**

- `/registrar/irregular` with registrar layout and role guard.

**UI Components**

- `IrregularStudentFormList`: list existing irregular students, inline add/edit.

**APIs**

- `GET /api/irregular`: list irregular student entries.
- `POST /api/irregular`: create new record.
- `PATCH /api/irregular/:id`: update record (course set, reason, notes).

**Business Logic**

- Validate courses exist; restrict access to registrar and scheduling committee roles.

**Data Store Entities**

- `IrregularStudent` records with audit timestamps.

## 4. Development Phasing

1. **Foundation Sprint**

   - Create role-segmented layouts and navigation for all personas.
   - Implement `data-store`, shared types, zod schemas, and mock auth context enhancements.
   - Add jsondiffpatch dependency and versioning helpers.

2. **Scheduling Committee Sprint**

   - Scaffold pages and core components.
   - Implement schedule CRUD APIs and rule engine MVP (breaks, conflict detection).
   - Wire forms and command panel interactions; integrate version timeline.
   - Add tests around rule evaluation and version diffs.

3. **Student & Registrar Sprint**

   - Build student-facing pages and APIs with preference validation.
   - Implement registrar CRUD for irregular students; connect to committee views (highlight irregular requirements in schedule grid sidebar).

4. **Teaching Load & Faculty Sprint**

   - Implement load overview computations, conflict detection.
   - Build faculty assignments page and availability capture.
   - Integrate shared comment system across personas.

5. **Polish & QA Sprint**
   - Perform accessibility sweep; ensure mobile responsiveness.
   - Add error states, toasts, and skeleton loaders.
   - Finalize documentation, sample data scenarios, and run smoke tests.

## 5. Testing Strategy

- **Unit Tests**: Rule engine, preference validation, load calculations, version diff logic.
- **Integration Tests**: API routes against in-memory store (Vitest + supertest or Next test utilities).
- **UI Tests**: Playwright flows for core persona tasks (create section, submit preferences, add irregular student).
- **Manual QA Scripts**: Document persona walkthrough scripts in `docs/testing-scripts.md` (to be created).

## 6. Tooling & Dependencies

- Add `jsondiffpatch`, `vitest`, `@testing-library/react`, `supertest` as dev dependencies.
- Update `package.json` scripts: `test`, `test:watch`, `test:ui` (Playwright later optional).
- Ensure lint rules accommodate new directories (`src/lib`, `src/app/*`).

## 7. Documentation Deliverables

- This plan (`docs/persona_feature_implementation_plan.md`).
- API reference (`docs/api-contracts.md`) describing request/response schemas.
- Data dictionary (`docs/data-model.md`) linking to zod schemas.
- Testing playbook (`docs/testing-scripts.md`).

## 8. Open Questions / Assumptions

1. **Authentication**: Continue using mock role switcher for Phase 3; future SSO integration out-of-scope.
2. **Persistence**: In-memory store sufficient now; ensure interfaces allow swapping to Prisma later.
3. **Real-time Collaboration**: Deferred per Phase 3 scope; comment system is async only.
4. **Notification Delivery**: UI-only notifications (no email/SMS) using existing dropdown components.
5. **AI Recommendations**: Single placeholder endpoint to be addressed separately (not part of this persona scope).

## 9. Acceptance Criteria Summary

- Every persona can complete their primary workflows end-to-end using UI + mock APIs.
- Rule engine blocks invalid schedule actions with human-readable errors.
- Versioning records diffs and exposes them in UI timeline.
- Student preference caps and duplication rules enforced server-side and client-side.
- Teaching load view highlights instructor overloads with actionable details.
- Registrar can CRUD irregular students; data surfaces in committee tooling.
- Comments stored and filtered per persona across schedule versions.
- Documentation and tests updated to reflect new flows.
