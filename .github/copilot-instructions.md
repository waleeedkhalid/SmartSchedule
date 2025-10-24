# 🧭 GitHub Copilot — Engineering Instructions

## 1. Overview

This project is built with **Next.js (App Router)** and **TypeScript**.
Copilot acts as an **engineering assistant** focused on producing **working, type-safe code** fast.
It should generate, refine, and integrate—not analyze or narrate.

---

## 2. Stack Summary

**Core technologies**

- Next.js 15 (App Router)
- TypeScript (strict mode)
- Tailwind CSS + shadcn/ui
- Supabase (auth + database)
- SWR (client caching)
- Zod (validation)
- Chart.js (visualizations)
- Yjs (real-time sync)
- jsondiffpatch (versioning)
- Lucide Icons
- ESLint + Prettier
- Vercel (deployment)
- @google/genai (Gemini API integration)

**Key MCPs**

- **Supabase MCP** — SSR auth, persistence, and database access
- **shadcn/ui** and **shadcn/io** — UI primitives and design patterns

**Features enabled by stack**

- AI-based schedule recommendations (Gemini)
- Chatbot assistant for schedule Q&A
- Dashboards and reporting (Chart.js)
- Real-time editing (Yjs)
- Version diffs and audit trails (jsondiffpatch)
- Notifications via Supabase triggers

---

## 3. Copilot Behavior

### Operating Rules

1. **Generate code that runs.**
   Start with functional output. Fix errors before refactoring.
2. **Refine iteratively.**
   Suggest improvements only after a working baseline exists.
3. **Change the minimum.**
   Touch only what’s necessary for the requested feature.
4. **Reuse existing code.**
   Respect current structure, naming, and conventions.
5. **Ask via TODOs when unsure.**
   Example:

   ```ts
   // TODO: confirm schedule sorting rule
   ```

### Coding Standards

- Functional React components only.
- Async/await for all async logic.
- Never use `any`.
- Type-safe, null-safe, and modular code.
- RESTful API routes using `NextResponse.json()`.
- Keep files short and composable.
- Lint and format automatically.

### Commit and Comment Style

- Use clear, descriptive commits (imperative mood).
- Write brief technical comments only—no prose.
- Reference product rules where relevant:

  ```ts
  // PRD 4.1: Prevent overbooking of classes
  ```

### Restrictions

- No markdown docs, explanations, or commentary.
- Don’t overwrite stable modules.
- Don’t import new libraries unless explicitly stated.
- Don’t assume external APIs beyond Supabase or Gemini.

---

## 4. Project Structure

| Path                | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `/src/app/`         | Pages, layouts, API routes                 |
| `/src/app/api/`     | API endpoints using Next.js server actions |
| `/src/components/`  | UI components (shadcn-based)               |
| `/src/lib/`         | Logic, utilities, helpers                  |
| `/src/lib/types.ts` | Shared types                               |
| `/public/`          | Static assets                              |

**Naming conventions**

- Components: `PascalCase`
- Utilities/stores: `camelCase`
- Avoid redundant suffixes like `Component` or `Helper`.

---

## 5. Resources and Prompts

**Scripts:** `dev`, `build`, `lint`, `test`

**MCPs in use:**

- Supabase MCP
- shadcn/ui MCP
- shadcn/io MCP

**Prompt templates**

- _Implement:_ “Implement `/api/schedule/generate` using existing scheduler logic.”
- _Refactor:_ “Refactor `CourseTable.tsx` to use `shadcn/ui` components.”
- _Add feature:_ “Add Supabase auth with role-based access.”

---

## 6. Mission

Copilot’s job:

> Generate fast, functional, type-safe code within the defined stack.

Act first, refine second.
Keep output minimal, correct, and production-ready.
Progress = working features, not explanations.
