# SmartSchedule - AI Coding Agent Instructions

## Project Overview

**SWE Department** academic course scheduling system with **5 persona-based workflows**: Scheduling Committee, Teaching Load Committee, Faculty, Students, and Registrar. Built with Next.js 15 App Router, TypeScript, shadcn/ui, **Supabase** (database), **Clerk** (auth), and **Google AI Studio** (AI recommendations).

---

## ⚠️ CRITICAL SCOPE LIMITATION

**This system is ONLY for the Software Engineering (SWE) Department:**

- ✅ Manages SWE courses exclusively (SWE211, SWE312, SWE314, etc.)
- ✅ Schedules SWE sections, meetings, and exams
- ✅ Manages SWE faculty and student data
- ❌ **CANNOT schedule or manage non-SWE courses** (CSC, MATH, PHY, etc.)
- ℹ️ Non-SWE courses exist in mockData as **external course references** only (imported by Scheduling Committee)

---

## PHASE 4: Production Architecture (Current Phase)

### **Tech Stack**

| Component      | Technology                      | Status              |
| -------------- | ------------------------------- | ------------------- |
| **Auth**       | Clerk (username + Google OAuth) | ✅ DONE             |
| **Database**   | Supabase (PostgreSQL + RLS)     | 🚧 Schema iteration |
| **AI**         | Google AI Studio API            | 🔜 Next sprint      |
| **Real-time**  | Liveblocks                      | 📋 Future phase     |
| **Deployment** | Replit (GitHub auto-deploy)     | ✅ Configured       |

### **Critical Architecture Shift**

- **Phase 3**: In-memory mockData → Validate core functionality
- **Phase 4**: Supabase migration → Production-ready with real persistence
- **mockData.ts**: Now serves as **seed data** for development/testing

---

## TypeScript Types Organization

**Best Practice**: Colocate single-use types with their components. Move shared types to domain-specific type files. Create a centralized types package only for monorepo-wide shared types.

### **SmartSchedule Type Structure**

```

src/
types/
database.types.ts          \# Supabase generated types (auto-generated)

lib/
supabase/
queries/
courses.types.ts       \# Course-related shared types
schedule.types.ts      \# Schedule/exam shared types
faculty.types.ts       \# Faculty/load shared types
student.types.ts       \# Student/preference shared types

components/
committee/
scheduler/
ExamTable.tsx          \# Props type inlined or in same file
ExamTable.types.ts     \# Only if types shared across scheduler/

```

### **Type Organization Rules**

1. **Inline or colocate** if type used in 1 place only
2. **Domain-specific .types.ts** if shared across 2-5 files in same folder
3. **lib/supabase/queries/\*.types.ts** if shared across multiple personas
4. **NEVER create a single monolithic types.ts** - makes refactoring painful

```typescript
// ✅ CORRECT: Single-use component props
export const ExamTable = (props: { exams: Exam[]; onCreate: (data: ExamFormData) => void }) => {...}

// ✅ CORRECT: Shared across scheduler folder
// committee/scheduler/scheduler.types.ts
export interface ScheduleSection { code: string; time: string; room: string; }

// ✅ CORRECT: Shared across personas
// lib/supabase/queries/schedule.types.ts
export interface ExamRecord { id: string; course_code: string; date: string; type: 'midterm' | 'midterm2' | 'final'; }

// ❌ WRONG: Global types.ts with everything
// types/index.ts - DON'T DO THIS
export interface ExamRecord {...}
export interface ScheduleSection {...}
export interface StudentPreference {...}
// ... 50+ more types (hard to maintain!)
```

---

## Clerk + Supabase Integration Pattern

### **Authentication Flow**

Clerk provides session tokens that Supabase validates using Row Level Security (RLS) policies. Use `auth.jwt()->>'sub'` to access the Clerk user ID in RLS policies.

```typescript
// lib/supabase/client.ts
import { useSession } from "@clerk/nextjs";
import { createClient } from "@supabase/supabase-js";

export function useClerkSupabaseClient() {
  const { session } = useSession();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${await session?.getToken({
            template: "supabase",
          })}`,
        },
      },
    }
  );
}

// Server-side (Server Actions)
import { auth } from "@clerk/nextjs/server";

export async function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${await auth().getToken({
            template: "supabase",
          })}`,
        },
      },
    }
  );
}
```

### **Row Level Security (RLS) Setup**

```sql
-- Enable RLS on all tables
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

-- Example: Users can only view schedules for their department
CREATE POLICY "Department members can view schedules"
ON schedules FOR SELECT
TO authenticated
USING (
  department = 'SWE' AND
  (SELECT auth.jwt()->>'sub') IN (
    SELECT clerk_user_id FROM department_members WHERE department = 'SWE'
  )
);

-- Example: Only Scheduling Committee can insert/update
CREATE POLICY "Scheduling Committee can modify schedules"
ON schedules FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE clerk_user_id = auth.jwt()->>'sub') = 'SCHEDULING'
);
```

---

## Database Migration Strategy

### **Phase 3 → Phase 4 Transition**

1.  **mockData.ts remains** as seed data for local development
2.  **Schema iteration**: Use `mockCourseOfferings` structure as baseline
3.  **New pattern**: `lib/supabase/queries/` replaces `committee-data-helpers.ts`

### **Data Flow Pattern**

```typescript
// OLD (Phase 3): In-memory transformation
import { getExams } from '@/lib/committee-data-helpers'
const exams = getExams(mockCourseOfferings) // Client-side transform

// NEW (Phase 4): Supabase queries
import { getExams } from '@/lib/supabase/queries/exams'
const exams = await getExams() // Server-side DB fetch

// Component receives pre-transformed data
<ExamTable exams={exams} />
```

### **Supabase Query Helper Pattern**

```typescript
// lib/supabase/queries/exams.ts
import { createServerSupabaseClient } from "@/lib/supabase/client";
import type { ExamRecord } from "./schedule.types";

export async function getExams(): Promise<ExamRecord[]> {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("exams")
    .select("*")
    .eq("department", "SWE")
    .order("date", { ascending: true });

  if (error) throw error;
  return data;
}

export async function createExam(examData: Omit<ExamRecord, "id">) {
  const supabase = createServerSupabaseClient();

  const { data, error } = await supabase
    .from("exams")
    .insert(examData)
    .select()
    .single();

  if (error) throw error;
  console.log("[DB] Created exam:", data); // Required logging
  return data;
}
```

---

## Core User Journey (Priority Order)

### **1. Scheduling Committee → Import External Courses**

- Inputs CSC111, MATH101, etc. with fixed times/rooms/exams
- System stores as constraints (not schedulable by SWE)

### **2. System AI Scheduler → Generate SWE Schedule**

- **Input**: External course constraints + SWE course requirements
- **Output**: Optimized schedule avoiding conflicts
- **Conflict Rules**:
  - ❌ Student can't have SWE + external course at same time
  - ❌ Exam times can't overlap (midterms/finals)
  - ✅ Two SWE sections same time, different rooms = OK
  - ❌ Faculty teaching \>15hr/week = overload warning

### **3. Teaching Load Committee → Faculty Assignment Review**

- Check faculty overload (\>15hr/week)
- Adjust assignments (must not affect irregular students)
- Send to Scheduling Committee for approval

### **4. Faculty + Students → Preliminary Schedule Review**

- View draft schedule
- Submit feedback/comments
- Changes allowed unless they affect irregular students

### **5. Registrar → Finalize & Publish**

- Lock schedule version
- Export to university registration system

---

## AI Integration Points (Google AI Studio)

### **1. Schedule Optimization API**

```typescript
// lib/ai/schedule-optimizer.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function optimizeSchedule(constraints: ScheduleConstraints) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Given these scheduling constraints:
    - External courses: ${JSON.stringify(constraints.externalCourses)}
    - SWE courses to schedule: ${JSON.stringify(constraints.sweCourses)}
    - Available rooms: ${JSON.stringify(constraints.rooms)}
    - Available time slots: ${JSON.stringify(constraints.timeSlots)}
    
    Generate an optimized schedule that:
    1. Avoids time conflicts for students taking both SWE + external courses
    2. Avoids exam conflicts (midterms/finals)
    3. Distributes faculty load evenly (<15hr/week per instructor)
    4. Gives students balanced day-off distribution
    
    Return JSON format: { sections: [...], conflicts: [...], warnings: [...] }
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return JSON.parse(response.text());
}
```

### **2. Student Course Q\&A Chatbot**

```typescript
// lib/ai/course-chatbot.ts
export async function askCourseQuestion(
  question: string,
  courseContext: string
) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    Context: SWE Department Course Catalog
    ${courseContext}
    
    Student question: "${question}"
    
    Provide a helpful answer about course content, prerequisites, or recommendations.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}
```

---

## Component Organization

```
src/
  components/
    ui/               # shadcn/ui primitives (don't modify)
    shared/           # Cross-persona (CommentPanel, NotificationsBell)
    committee/        # Scheduling Committee components
      scheduler/
        ExamTable.tsx
        ScheduleGrid.tsx
      teaching-load/
        FacultyLoadTable.tsx
      registrar/
        IrregularStudentForm.tsx
    student/
      PreferenceForm.tsx
      ScheduleViewer.tsx
    faculty/
      AvailabilityForm.tsx
      AssignmentReview.tsx
```

### **Barrel Exports Pattern**

```typescript
// components/committee/index.ts
export * as scheduler from "./scheduler";
export * as teachingLoad from "./teaching-load";
export * as registrar from "./registrar";

// Usage in pages
import * as committee from "@/components/committee";
<committee.scheduler.ExamTable exams={exams} />;
```

---

## Forms & Validation Pattern

### **UI Requirements**

- **"Simple and look nice"** (user requirement)
- shadcn Dialog for modals (not full-page forms)
- Inline validation with clear error states
- Grid layouts for compact forms

### **Example: Exam Creation Form**

```typescript
// components/committee/scheduler/ExamDialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const examSchema = z.object({
  course_code: z.string().startsWith("SWE", "Must be an SWE course"),
  date: z.string().datetime(),
  type: z.enum(["midterm", "midterm2", "final"]),
  room: z.string().min(1, "Room is required"),
});

export function ExamDialog({ open, onOpenChange, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(examSchema),
    defaultValues: { course_code: "", date: "", type: "midterm", room: "" },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Exam</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          {/* Form fields with inline validation */}
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Task Tracking System

### **ALWAYS Update `docs/plan.md` After Implementation**

1.  Change task status to `DONE` in Task Board (Section 2)
2.  Add notes column describing outcome
3.  Append entry to Change Log (Section 3) with date, description, task IDs
4.  Add decisions to Decisions Log (Section 4) if architectural choice made
5.  Reference master plan: `docs/persona_feature_implementation_plan.md`

**Task ID format:** `{AREA}-{NUM}` (e.g., `COM-9`, `STU-2`, `FND-4`)

---

## Development Workflow

### **Commands**

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Production build (Turbopack)
npm run lint         # ESLint check
npx supabase gen types typescript --project-id "$PROJECT_REF" > src/types/database.types.ts  # Generate DB types
```

### **Creating New Features**

1.  **Check existing patterns** in similar persona folders
2.  **Use Supabase query helpers** - never inline DB queries in components
3.  **Export via index.ts** barrel pattern
4.  **Add to demo page** with console logging: `src/app/demo/{persona}/*/page.tsx`
5.  **Update plan.md** with task completion

### **File Naming Conventions**

- Components: PascalCase (e.g., `ExamTable.tsx`, `VersionTimeline.tsx`)
- Utilities: kebab-case (e.g., `schedule-optimizer.ts`, `data-store.ts`)
- Types: kebab-case with `.types.ts` suffix (e.g., `schedule.types.ts`)
- Demo pages: `page.tsx` in appropriate route folder

---

## Key Files Reference

### **Must-Read Before Coding**

- **`docs/plan.md`** - Active task board, change log, decisions (UPDATE THIS\!)
- **`src/data/mockData.ts`** - Seed data structure
- **`src/lib/supabase/queries/`** - Database query patterns

### **Type Definitions**

- Personas/Roles: `src/components/RoleSwitcher.tsx` → `"SCHEDULER" | "TEACHING_LOAD" | "FACULTY" | "STUDENT" | "REGISTRAR"`
- Supabase types: `src/types/database.types.ts` (auto-generated)
- Domain types: `src/lib/supabase/queries/*.types.ts`
- Zod schemas: `src/lib/zod/` (extend as needed per FND-3)

---

## Demo Pages Pattern

```typescript
// src/app/demo/committee/scheduler/page.tsx
import { getExams } from "@/lib/supabase/queries/exams";
import * as committee from "@/components/committee";

export default async function SchedulerDemoPage() {
  const exams = await getExams(); // Server-side DB fetch

  const handleCreate = async (data: ExamFormData) => {
    "use server";
    console.log("[Demo] Creating exam:", data); // Required logging
    await createExam(data);
  };

  return (
    <committee.scheduler.ExamTable exams={exams} onCreate={handleCreate} />
  );
}
```

---

## Environment Variables

```bash
# .env.local
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_SUPABASE_URL=[https://xyz.supabase.co](https://xyz.supabase.co)
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Server-side only
GOOGLE_AI_API_KEY=AIza... # Google AI Studio
```

---

## Current Sprint Focus

**Sprint: Phase 4 Foundation**

### Completed ✅

- COM-2, COM-9, COM-13, COM-14, COM-16, COM-17
- LOAD-2, LOAD-3
- REG-2
- Clerk auth setup (username + Google OAuth)

### In Progress 🚧

- FND-2: Supabase schema finalization
- FND-5: Clerk + Supabase RLS integration
- Database query helper migration

### Next Up 📋

- FND-1: Production layouts with auth guards
- FND-4: Version control (jsondiffpatch or Supabase triggers)
- AI-1: Google AI Studio schedule optimizer integration

---

## Decisions Log (Reference)

- **DEC-3**: Preference cap = 6 (hardcoded, DB later)
- **DEC-4**: Instructor load limits = 15hr hardcoded (constants now, DB later)
- **DEC-5**: Exam categories = midterm, optional midterm2, final
- **DEC-8**: Functional data transformation pattern (mockCourseOfferings → helpers → UI)
- **DEC-9**: Supabase + Clerk RLS for auth (Phase 4)
- **DEC-10**: Domain-specific type files, not monolithic types.ts
- **DEC-11**: Google AI Studio for schedule optimization + student Q\&A

---

## Common Pitfalls

1.  ❌ Don't inline database queries in components - use query helpers
2.  ❌ Don't forget RLS policies - every table needs auth checks
3.  ❌ Don't create monolithic `types.ts` - use domain-specific type files
4.  ❌ Don't forget to handle optional `midterm2` exam (causes TypeScript errors)
5.  ❌ Don't skip updating `plan.md` after completing tasks
6.  ❌ Don't use complex UI - keep it simple and clean per user requirement
7.  ❌ Don't expose Supabase service role key in client components
8.  ❌ Don't forget to await Clerk `session.getToken()` calls

---

## Deployment Checklist (Replit)

1.  **Environment Variables**: Add all secrets to Replit environment
2.  **Supabase Connection**: Verify RLS policies are active
3.  **Clerk Webhooks**: Set up user sync to Supabase `users` table
4.  **Build Command**: `npm run build` (uses Turbopack)
5.  **Start Command**: `npm start`
6.  **GitHub Integration**: Auto-deploy on push to main branch

---

## Questions to Ask User

- If data structure unclear: "Should this follow the mockCourseOfferings pattern or Supabase schema?"
- If scope uncertain: "Is this in Phase 4 scope? Check plan.md"
- If task not in plan.md: "Should I add this as a new task to plan.md?"
- If pattern deviates: "This differs from existing {component} pattern - intentional?"
- If type location unclear: "Is this type used in 1 place (inline), 2-5 places (domain .types.ts), or everywhere (shared types)?"

---

---

# Appendix: Next.js Best Practices for LLMs (2025)

_This document summarizes the latest, authoritative best practices for building, structuring, and maintaining Next.js applications. It is intended for use by LLMs and developers to ensure code quality, maintainability, and scalability. Last updated: July 2025._

---

## _applyTo: "\*\*"_

## 1. Project Structure & Organization

- **Use the `app/` directory** (App Router) for all new projects. Prefer it over the legacy `pages/` directory.
- **Top-level folders:**
  - `app/` — Routing, layouts, pages, and route handlers
  - `public/` — Static assets (images, fonts, etc.)
  - `lib/` — Shared utilities, API clients, and logic
  - `components/` — Reusable UI components
  - `contexts/` — React context providers
  - `styles/` — Global and modular stylesheets
  - `hooks/` — Custom React hooks
  - `types/` — TypeScript type definitions
- **Colocation:** Place files (components, styles, tests) near where they are used, but avoid deeply nested structures.
- **Route Groups:** Use parentheses (e.g., `(admin)`) to group routes without affecting the URL path.
- **Private Folders:** Prefix with `_` (e.g., `_internal`) to opt out of routing and signal implementation details.
- **Feature Folders:** For large apps, group by feature (e.g., `app/dashboard/`, `app/auth/`).
- **Use `src/`** (optional): Place all source code in `src/` to separate from config files.

## 2.1. Server and Client Component Integration (App Router)

**Never use `next/dynamic` with `{ ssr: false }` inside a Server Component.** This is not supported and will cause a build/runtime error.

**Correct Approach:**

- If you need to use a Client Component (e.g., a component that uses hooks, browser APIs, or client-only libraries) inside a Server Component, you must:
  1.  Move all client-only logic/UI into a dedicated Client Component (with `'use client'` at the top).
  2.  Import and use that Client Component directly in the Server Component (no need for `next/dynamic`).
  3.  If you need to compose multiple client-only elements (e.g., a navbar with a profile dropdown), create a single Client Component that contains all of them.

**Example:**

```tsx
// Server Component
import DashboardNavbar from "@/components/DashboardNavbar";

export default async function DashboardPage() {
  // ...server logic...
  return (
    <>
      <DashboardNavbar /> {/* This is a Client Component */}
      {/* ...rest of server-rendered page... */}
    </>
  );
}
```

**Why:**

- Server Components cannot use client-only features or dynamic imports with SSR disabled.
- Client Components can be rendered inside Server Components, but not the other way around.

**Summary:**
Always move client-only UI into a Client Component and import it directly in your Server Component. Never use `next/dynamic` with `{ ssr: false }` in a Server Component.

---

## 2. Component Best Practices

- **Component Types:**
  - **Server Components** (default): For data fetching, heavy logic, and non-interactive UI.
  - **Client Components:** Add `'use client'` at the top. Use for interactivity, state, or browser APIs.
- **When to Create a Component:**
  - If a UI pattern is reused more than once.
  - If a section of a page is complex or self-contained.
  - If it improves readability or testability.
- **Naming Conventions:**
  - Use `PascalCase` for component files and exports (e.g., `UserCard.tsx`).
  - Use `camelCase` for hooks (e.g., `useUser.ts`).
  - Use `snake_case` or `kebab-case` for static assets (e.g., `logo_dark.svg`).
  - Name context providers as `XyzProvider` (e.g., `ThemeProvider`).
- **File Naming:**
  - Match the component name to the file name.
  - For single-export files, default export the component.
  - For multiple related components, use an `index.ts` barrel file.
- **Component Location:**
  - Place shared components in `components/`.
  - Place route-specific components inside the relevant route folder.
- **Props:**
  - Use TypeScript interfaces for props.
  - Prefer explicit prop types and default values.
- **Testing:**
  - Co-locate tests with components (e.g., `UserCard.test.tsx`).

## 3. Naming Conventions (General)

- **Folders:** `kebab-case` (e.g., `user-profile/`)
- **Files:** `PascalCase` for components, `camelCase` for utilities/hooks, `kebab-case` for static assets
- **Variables/Functions:** `camelCase`
- **Types/Interfaces:** `PascalCase`
- **Constants:** `UPPER_SNAKE_CASE`

## 4. API Routes (Route Handlers)

- **Prefer API Routes over Edge Functions** unless you need ultra-low latency or geographic distribution.
- **Location:** Place API routes in `app/api/` (e.g., `app/api/users/route.ts`).
- **HTTP Methods:** Export async functions named after HTTP verbs (`GET`, `POST`, etc.).
- **Request/Response:** Use the Web `Request` and `Response` APIs. Use `NextRequest`/`NextResponse` for advanced features.
- **Dynamic Segments:** Use `[param]` for dynamic API routes (e.g., `app/api/users/[id]/route.ts`).
- **Validation:** Always validate and sanitize input. Use libraries like `zod` or `yup`.
- **Error Handling:** Return appropriate HTTP status codes and error messages.
- **Authentication:** Protect sensitive routes using middleware or server-side session checks.

## 5. General Best Practices

- **TypeScript:** Use TypeScript for all code. Enable `strict` mode in `tsconfig.json`.
- **ESLint & Prettier:** Enforce code style and linting. Use the official Next.js ESLint config.
- **Environment Variables:** Store secrets in `.env.local`. Never commit secrets to version control.
- **Testing:** Use Jest, React Testing Library, or Playwright. Write tests for all critical logic and components.
- **Accessibility:** Use semantic HTML and ARIA attributes. Test with screen readers.
- **Performance:**
  - Use built-in Image and Font optimization.
  - Use Suspense and loading states for async data.
  - Avoid large client bundles; keep most logic in Server Components.
- **Security:**
  - Sanitize all user input.
  - Use HTTPS in production.
  - Set secure HTTP headers.
- **Documentation:**
  - Write clear README and code comments.
  - Document public APIs and components.

# Avoid Unnecessary Example Files

Do not create example/demo files (like ModalExample.tsx) in the main codebase unless the user specifically requests a live example, Storybook story, or explicit documentation component. Keep the repository clean and production-focused by default.

# Always use the latest documentation and guides

- For every nextjs related request, begin by searching for the most current nextjs documentation, guides, and examples.
- Use the following tools to fetch and search documentation if they are available:
  - `resolve_library_id` to resolve the package/library name in the docs.
  - `get_library_docs` for up to date documentation.
