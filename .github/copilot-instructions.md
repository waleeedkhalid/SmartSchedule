# SmartSchedule - AI Coding Agent Instructions

## Project Overview

**SWE Department** academic course scheduling system with **5 persona-based workflows**: Scheduling Committee, Teaching Load Committee, Faculty, Students, and Registrar. Built with Next.js 15 App Router, TypeScript, shadcn/ui, and **in-memory JSON storage** (Phase 3 scope - no database).

## ⚠️ CRITICAL SCOPE LIMITATION

**This system is ONLY for the Software Engineering (SWE) Department:**

- ✅ Manages SWE courses exclusively (SWE211, SWE312, SWE314, etc.)
- ✅ Schedules SWE sections, meetings, and exams
- ✅ Manages SWE faculty and student data
- ❌ **CANNOT schedule or manage non-SWE courses** (CSC, MATH, PHY, etc.)
- ℹ️ Non-SWE courses exist in mockData as external course references only

## Critical Architecture Patterns

### Data Transformation Pattern (DEC-8)

**ALL data flows through transformation helpers - never inline transform in components:**

```typescript
// ✅ CORRECT: Use helper functions from src/lib/committee-data-helpers.ts
import { getExams, getSectionsLookup } from "@/lib/committee-data-helpers";
const exams = getExams(mockCourseOfferings);

// ❌ WRONG: Don't transform mockCourseOfferings directly in components
const exams = Object.values(mockCourseOfferings).flatMap(...) // NO!
```

**When creating new features:**

1. Add typed transformation function to `src/lib/committee-data-helpers.ts`
2. Export properly typed interface (e.g., `ExamRecord`, `ScheduleSection`)
3. Components receive pre-transformed data only

### Mock Data as Database (Phase 3)

- Single source of truth: `src/data/mockData.ts` → `mockCourseOfferings` array
- Structure: `{ code, name, credits, department, level, type, exams: { midterm?, midterm2?, final? }, sections: [] }`
- **midterm2 is optional** - always check `if (!examData) return` in transformations
- Console log all form submissions to prototype API payloads: `console.log("Creating exam:", examData);`

### Component Organization

```
src/components/
  ui/               # shadcn/ui primitives (don't modify)
  shared/           # Cross-persona components (CommentPanel, NotificationsBell)
  committee/        # Scheduling Committee components
    scheduler/
    teaching-load/
    registrar/
  student/
  faculty/
```

**Barrel exports via index.ts:**

```typescript
// src/components/committee/index.ts
export * as scheduler from "./scheduler";
export * as teachingLoad from "./teaching-load";

// Usage: import * as committee from "@/components/committee";
<committee.scheduler.ExamTable exams={...} />
```

### Forms & Validation Pattern

- UI must be **"simple and look nice"** (user requirement)
- shadcn Dialog for modals, not full-page forms
- Inline validation with clear error states
- Grid layouts for compact forms (see `ExamTable.tsx` dialog)

### Task Tracking System

**ALWAYS update `docs/plan.md` after implementing features:**

1. Change task status to `DONE` in Task Board (Section 2)
2. Add notes column describing outcome
3. Append entry to Change Log (Section 3) with date, description, task IDs
4. Add decisions to Decisions Log (Section 4) if architectural choice made
5. Reference master plan: `docs/persona_feature_implementation_plan.md`

**Task ID format:** `{AREA}-{NUM}` (e.g., `COM-9`, `STU-2`, `FND-4`)

## Development Workflow

### Commands

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build (also uses Turbopack)
npm run lint         # ESLint check
```

### Creating New Components

1. **Check existing patterns** in similar persona folders
2. **Use transformation helpers** - never inline data transforms
3. **Export via index.ts** barrel pattern
4. **Add to demo page** with console logging: `src/app/demo/{persona}/*/page.tsx`
5. **Update plan.md** with task completion

### File Naming Conventions

- Components: PascalCase (e.g., `ExamTable.tsx`, `VersionTimeline.tsx`)
- Utilities: kebab-case (e.g., `committee-data-helpers.ts`, `data-store.ts`)
- Demo pages: `page.tsx` in appropriate route folder

## Key Files Reference

### Must-Read Before Coding

- **`docs/plan.md`** - Active task board, change log, decisions (UPDATE THIS!)
- **`docs/persona_feature_implementation_plan.md`** - Master feature roadmap
- **`docs/PHASE3_SCOPE.md`** - What's in/out of scope
- **`src/data/mockData.ts`** - Data structure authority (1552 lines)
- **`src/lib/committee-data-helpers.ts`** - Transformation pattern examples

### Type Definitions

- Personas/Roles: `src/components/RoleSwitcher.tsx` - `"SCHEDULING" | "TEACHING_LOAD" | "FACULTY" | "STUDENT" | "REGISTRAR"`
- Course offerings: `src/lib/committee-data-helpers.ts` → `CourseOffering` interface
- Zod schemas: `src/lib/zod/` (extend as needed per FND-3)

### Demo Pages Pattern

```typescript
// src/app/demo/committee/scheduler/page.tsx
const exams = getExams(mockCourseOfferings); // Use helpers!
const sectionsLookup = getSectionsLookup(mockCourseOfferings);

const handleCreate = (data) => {
  console.log("Creating exam:", data); // Required logging
  // TODO: Send to API endpoint POST /api/exams
};

return <committee.scheduler.ExamTable exams={exams} onCreate={handleCreate} />;
```

## Current Sprint Focus

**Sprint 1: FOUNDATION** - Establishing scaffolding (see `plan.md` Section 1)

- Completed: COM-2, COM-9, COM-13, COM-14, COM-16, COM-17, LOAD-2, LOAD-3, REG-2
- Next: FND-1 (layouts), FND-2 (data-store.ts), FND-4 (jsondiffpatch)

## Decisions Log (Reference)

- **DEC-3**: Preference cap = 6 (hardcoded, DB later)
- **DEC-4**: Instructor load limits = 15hr hardcoded (constants now, DB later)
- **DEC-5**: Exam categories = midterm, optional midterm2, final
- **DEC-8**: Functional data transformation pattern (mockCourseOfferings → helpers → UI)

## Common Pitfalls

1. ❌ Don't transform mockCourseOfferings inline in components
2. ❌ Don't forget to handle optional `midterm2` exam (causes TypeScript errors)
3. ❌ Don't skip updating `plan.md` after completing tasks
4. ❌ Don't create generic error handling - log specific data structures
5. ❌ Don't use complex UI - keep it simple and clean per user requirement

## Questions to Ask User

- If data structure unclear: "Should this follow the mockCourseOfferings pattern?"
- If scope uncertain: "Is this in Phase 3 scope? Check PHASE3_SCOPE.md"
- If task not in plan.md: "Should I add this as a new task to plan.md?"
- If pattern deviates: "This differs from existing {component} pattern - intentional?"
