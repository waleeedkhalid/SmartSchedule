Excellent — you’re thinking like a real engineering lead now 👏

Since your repo is already **partially built and cluttered**, we’ll craft the final **`copilot-instructions.md`** in a way that:

- Focuses Copilot on _implementing and refactoring_ toward the PRD.
- Prevents it from amplifying the mess (no new random files).
- Guides it to reuse or clean existing code where possible.
- Keeps code — not documentation — as the source of truth.

---

## 📘 `copilot-instructions.md`

Place this file at your repository root.

````md
# 🧭 SmartSchedule — GitHub Copilot Instructions

---

## 🧩 Project Context

**SmartSchedule** is an academic timetabling and teaching-load management system for the **Software Engineering Department (SWE)**.  
It enables the **Scheduling Committee**, **Teaching Load Committee**, **Registrar**, **Faculty**, and **Students** to collaboratively manage course schedules, resolve conflicts, and collect feedback.

This is a **Next.js + TypeScript** web app using:

- **Next.js 15 (App Router)**
- **shadcn/ui** + **Tailwind CSS**
- **Supabase (PostgreSQL)** for authentication and persistence
- **SWR** + lightweight local stores (not Zustand)
- Temporary **in-memory JSON storage** for Phase 3 prototype
- No real-time collaboration or versioning yet (future)

---

## 🎯 Purpose of These Instructions

Guide Copilot to:

- **Implement missing features from the PRD**
- **Refactor messy code responsibly**
- **Avoid generating redundant documentation**
- **Write working, modular TypeScript**
- **Reuse existing components and logic before creating new ones**

Copilot’s goal is to **incrementally evolve the existing codebase** into a functional, PRD-compliant prototype — **not rewrite it from scratch**.

---

## ✅ You Should

1. **Write functional, testable code** that fulfills PRD features.

   - Use the **App Router API pattern** (`/src/app/api/**/route.ts`).
   - Use **Supabase** for data and auth persistence.
   - Use **shadcn/ui** for UI (avoid new UI libraries).
   - Reuse and improve existing components before creating new ones.

2. **Refactor where needed** — if a component or function is redundant, unused, or broken, fix or remove it, but **preserve working features**.

3. **Follow these implementation layers:**

   - `/src/app/` → pages and routes
   - `/src/components/` → UI logic
   - `/src/lib/` → utilities, rules, generator logic
   - `/src/app/api/` → backend endpoints

4. **Reference PRD sections** when implementing features:

   - Add inline comment tags like:
     ```ts
     // PRD 4.2 - Schedule Generation Endpoint
     ```
   - Keep comments brief, technical, and contextual.

5. **Ask clarifying questions** as code comments if unsure:
   ```ts
   // TODO: Confirm if registrar override should allow 25% capacity or 30%.
   ```
````

---

## ❌ You Should Not

- Generate `.md` summaries, architecture reports, or documentation files.
- Add new random components unless required by PRD.
- Rewrite working files entirely — prefer _surgical edits_.
- Output “analysis,” “explanations,” or “proposals” in code comments.
- Import extra dependencies beyond the approved stack:

  - ✅ Allowed: Supabase, shadcn/ui, SWR, jsondiffpatch, Yjs (later)
  - 🚫 Disallowed: Redux, Axios, Mongoose, Moment.js, etc.

---

## ⚙️ Key Implementation Priorities (PRD Alignment)

### 1️⃣ Authentication & Roles

- Replace Clerk with **Supabase Auth** (email/password only).
- No domain restriction required yet (`.ksu.edu.sa` check deferred).
- Add **role-based logic** (scheduler, load-committee, registrar, faculty, student).
- Store roles in Supabase users table or profiles table.

### 2️⃣ API Layer (App Router)

Implement the following routes in `/src/app/api/`:

| Route                      | Purpose                                    |
| -------------------------- | ------------------------------------------ |
| `/api/schedule/generate`   | Run schedule generator, store version      |
| `/api/schedules`           | Get all schedules with metadata            |
| `/api/preferences`         | Store/retrieve student elective selections |
| `/api/feedback`            | Save feedback from students/faculty        |
| `/api/notifications`       | Create and list notifications              |
| `/api/teaching-load`       | Get and update faculty load assignments    |
| `/api/registrar/overrides` | Registrar-specific registration handling   |

Each route must:

- Use `NextResponse` and `async/await`
- Validate inputs
- Interact with Supabase or local mock store
- Return JSON responses

### 3️⃣ Scheduler Logic

- Reuse existing logic under `/src/lib/schedule/`:

  - `ScheduleGenerator.ts`
  - `ConflictChecker.ts`
  - `TimeSlotManager.ts`
  - `rules-engine.ts`

- Implement missing PRD rules:

  - Midterm blocks (Mon/Wed 12–2)
  - Lab continuity (2-hour blocks)
  - Balanced days (one day off)
  - Prerequisites alignment
  - External non-SWE conflicts avoidance

- Expose the generator via `/api/schedule/generate`.

### 4️⃣ Data Layer

- Migrate `data-store.ts` to Supabase gradually.
- Tables to implement:

  - `users`, `courses`, `sections`, `rules`, `schedules`, `feedback`, `notifications`, `preferences`, `registrations`

- Keep in-memory fallback for dev mode.

### 5️⃣ Teaching Load

- Connect `/demo/committee/teaching-load` page to `/api/teaching-load`.
- Validate faculty load assignments; mark overloads/conflicts.

### 6️⃣ Student Workflows

- Connect Elective Survey to `/api/preferences`.
- Connect Feedback Form to `/api/feedback`.
- Implement `/api/register` to enforce:

  - Section capacity
  - Time conflict checks
  - Registrar 25% override

### 7️⃣ Notifications

- Implement real notifications persistence via Supabase.
- Trigger on:

  - New schedule version
  - Schedule approval or rollback
  - Registrar override

- Use `NotificationsBell.tsx` as entry point.

### 8️⃣ Dashboards

- Add charts/tables for:

  - Faculty load
  - Section distribution
  - Student electives

- Use `recharts` (already available in shadcn projects).

### 9️⃣ Version Control & Collaboration

- Add `jsondiffpatch` for schedule version snapshots.
- Add Yjs-based real-time sync (future milestone, not now).

---

## 🧱 Code Style & Conventions

| Area       | Rule                                                           |
| ---------- | -------------------------------------------------------------- |
| Imports    | Use `@/lib/...`, `@/components/...`                            |
| Types      | Use `/src/lib/types.ts` definitions; avoid `any`               |
| Components | Functional only, PascalCase names                              |
| API        | Use `NextResponse.json()` and async handlers                   |
| UI         | Prefer shadcn/ui components; avoid raw HTML                    |
| Comments   | Use `// PRD <id>` for new logic; no long docs                  |
| Commits    | Follow pattern: `feat(api): add schedule generation (PRD 4.2)` |

---

## 🧹 Refactoring Guidelines

When Copilot detects inconsistencies (duplicate files, unused components, outdated imports):

1. **Check usage before deletion.**

   - If unused or conflicting, mark with:

     ```ts
     // TODO: candidate for removal — unused after PRD refactor
     ```

2. **Rename unclear files** (e.g., `MockData.ts` → `mockCourses.ts`).

3. **Merge redundant components** (e.g., multiple schedule tables → one shared ScheduleGrid).

4. **Keep demo pages** under `/demo/` — do not delete, but mark prototype-only:

   ```ts
   // NOTE: demo-only component, to be replaced in Phase 4
   ```

---

## 🧠 Copilot Mental Model

When generating or completing code:

> “This repository is already partially implemented. My goal is to **incrementally improve it** and make it comply with the PRD, using existing files and logic first, before creating new ones.”

---

## 💬 Example Prompts (for Copilot Chat)

```text
Implement the /api/schedule/generate route based on existing ScheduleGenerator.ts.
```

```text
Refactor the elective survey component to save results via Supabase API.
```

```text
Add missing rule enforcement for midterm blocks in rules-engine.ts.
```

```text
Replace Clerk auth with Supabase auth, keeping role-based access logic.
```

---

## 🧩 Summary

- Copilot’s mission: **implement + refactor**, not describe.
- Always code toward the **PRD feature list**, not random ideas.
- Keep the repository clean, modular, and type-safe.
- Use existing logic first; build new only when necessary.
- Each commit should represent **real progress toward PRD compliance**.

---
