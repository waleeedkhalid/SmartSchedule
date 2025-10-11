# API Documentation

**Last Updated:** 2025-10-02  
**Maintainer:** [Name/Role]

---

## Overview

[API routes, request/response formats, usage examples.]

---

## Contents

- API Routes
- Request/Response Formats
- Usage Examples
- ...

---

## API Routes

### Demo Accounts

**GET `/api/demo-accounts`** — Returns demo account credentials for testing
- **Authentication:** None required (read-only demo listing)
- **Response:**
  ```json
  {
    "success": true,
    "accounts": [
      {
        "email": "student_demo@smartschedule.app",
        "password": "demo1234",
        "role": "student",
        "name": "Demo Student"
      },
      {
        "email": "faculty_demo@smartschedule.app", 
        "password": "demo1234",
        "role": "faculty",
        "name": "Demo Faculty"
      },
      {
        "email": "scheduler_demo@smartschedule.app",
        "password": "demo1234", 
        "role": "scheduling_committee",
        "name": "Demo Scheduler"
      },
      {
        "email": "load_demo@smartschedule.app",
        "password": "demo1234",
        "role": "teaching_load_committee", 
        "name": "Demo Load Manager"
      },
      {
        "email": "registrar_demo@smartschedule.app",
        "password": "demo1234",
        "role": "registrar",
        "name": "Demo Registrar"
      }
    ],
    "message": "Demo accounts retrieved successfully"
  }
  ```

### SWE Plan

Proposed endpoints for curriculum management. These use centralized helpers in `src/lib/supabase/swe-plan.ts` and are protected by RLS.

- GET `/api/swe-plan` — List active curriculum rows
  - Query params: `level?` (number)
  - Response: `SWEPlan[]`
- POST `/api/swe-plan` — Create a curriculum entry (admin roles only)
  - Body: `Omit<SWEPlan, "id" | "created_at" | "updated_at">`
  - Response: `SWEPlan`
- PATCH `/api/swe-plan/:id` — Update a curriculum entry (admin roles only)
  - Body: `Partial<SWEPlan>`
  - Response: `SWEPlan`
- DELETE `/api/swe-plan/:id` — Soft-archive a curriculum entry (admin roles only)
  - Effect: sets `is_active = false`
  - Response: `{ success: true }`

Notes:

- Authorization is enforced via Supabase RLS policies on `public.swe_plan`.
- API handlers must call helpers: `getSWEPlan`, `addCourse`, `updateCourse`, `archiveCourse`.

---

## Request/Response Formats

[Request and response format details.]

---

## Usage Examples

[Example API calls and responses.]

---

## References

- [Link to related docs or code]
- [External resources, if any]
- Helpers: `src/lib/supabase/swe-plan.ts`
- Types: `types/swe-plan.ts`

---

## Revision History

| Date       | Author    | Change Summary |
| ---------- | --------- | -------------- |
| 2025-10-02 | Architect | Initial draft  |
