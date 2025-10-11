# 🧭 GitHub Copilot – Engineering Instructions

## 1. Project Overview

This repository uses **Next.js (App Router)** with **TypeScript** to build fullstack web applications.  
Copilot’s role is to act as an **engineering assistant** that quickly implements working code, explores valid options, and refines them toward correct, maintainable solutions.

The goal is to move fast, generate functional output, and improve iteratively — not to overanalyze or produce documentation.

---

## 2. Tech Stack

### Frameworks and Libraries

- **Next.js 15 (App Router)** – routing, server actions, and APIs
- **TypeScript** – strict typing; avoid `any`
- **Tailwind CSS** + **shadcn/ui** – styling and UI components
- **Supabase** – authentication, database, and storage
- **SWR** – data fetching and caching
- **Zod** – schema validation for all inputs and API responses
- **Chart.js** – dashboards and statistical reporting
- **Yjs** – real-time collaboration and shared editing
- **jsondiffpatch** – version control and schedule history
- **Lucide Icons** – iconography
- **ESLint** + **Prettier** – linting and formatting
- **Vercel** – deployment platform
- **@google/genai (Google AI Studio / Gemini API)** – generative AI for intelligent schedule recommendations and chatbot functionality

### Core Features Supported by Stack

- **AI-Powered Schedule Recommendation** – use Gemini models via `@google/genai` to generate optimized schedules based on predefined rules and preferences.
- **Chatbot Assistant** – provide real-time Q&A and scheduling support through Gemini integration.
- **Dashboards** – visualize scheduling and teaching load data using Chart.js.
- **Real-Time Collaboration** – enable concurrent edits and feedback via Yjs.
- **Version Control** – maintain schedule versions and change diffs using jsondiffpatch.
- **Notifications** – alert users to updates, comments, and approvals through Supabase.

### Patterns and Conventions

- Functional React components only
- Async functions with `await` for data access
- Prefer existing code reuse over new abstractions
- Avoid extra libraries unless explicitly approved

---

## 3. Coding Guidelines

### General Behavior

- **Start by implementing working code.**
- **Then refine.** Suggest small, concrete improvements only after a functional version exists.
- **Keep edits surgical.** Modify the minimum needed for progress.
- **Reuse existing logic and structure.** Don’t duplicate or create random files.
- **Ask clarifying questions as inline TODO comments** if uncertain.

### Code Quality

- Use clear, minimal, technical comments:
  ```ts
  // TODO: confirm section capacity rule
  // PRD 3.4 — registration validation
  ```
- Write descriptive, concise commit messages.
- Follow existing naming conventions and file structures.
- Ensure all code is type-safe and free of TypeScript errors.

* Keep files modular and short.
* Prefer composable, testable functions.
* Always check types and handle possible null/undefined cases.
* Follow RESTful conventions for API routes.

### Restrictions

- Do not generate documentation or markdown summaries.
- Do not overwrite stable modules or add large frameworks.
- Do not assume external resources or APIs.
- Do not produce analysis or explanations — code only.

---

## 4. Project Structure

| Path                | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `/src/app/`         | Pages, layouts, and API routes               |
| `/src/app/api/`     | Server endpoints using `NextResponse.json()` |
| `/src/components/`  | UI components using `shadcn/ui`              |
| `/src/lib/`         | Utilities, helpers, business logic           |
| `/src/lib/types.ts` | Shared type definitions                      |
| `/public/`          | Static assets                                |
| `/scripts/`         | Setup or build scripts                       |

**File naming:**

- Components: PascalCase (e.g., `ScheduleTable.tsx`)
- Utilities and stores: camelCase (e.g., `timeSlotManager.ts`)
- Avoid redundant suffixes like `Component` or `Helper`.

---

## 5. Resources

- **Scripts**

  - `setup.sh` or `setup-env.*` – environment setup
  - `dev`, `build`, `lint`, and `test` scripts – standard project tasks

- **MCP / Tools**

  - Supabase MCP for database and auth management
  - Shadcn/ui MCP for UI components
  - Shadcn.io for component customization

- **Recommended Prompts**

  - _Implement_: “Implement `/api/schedule/generate` using existing scheduler logic.”
  - _Refactor_: “Refactor `CourseTable.tsx` to use `shadcn/ui` components.”
  - _Add feature_: “Add Supabase auth with role-based access.”

---

### Summary

Copilot’s purpose:

> Generate fast, functional, type-safe code for Next.js fullstack apps using the defined stack and structure.

**Act first, refine second.**
**Keep code clean, small, and real.**
**Progress is measured by working features, not explanations.**
