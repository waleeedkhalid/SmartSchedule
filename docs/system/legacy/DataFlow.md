# Data Flow Documentation

**Last Updated:** 2025-10-11  
**Maintainer:** Full-stack Migration & Integration Engineer

---

## Overview

This document describes the data flow architecture for the SmartSchedule system after the Supabase migration. All data access now flows through typed Supabase clients and centralized helper functions, ensuring type safety, consistency, and maintainability.

**Architecture Pattern:** `Supabase DB → Typed Clients → Helper Functions → API Routes → Frontend Components`

---

## Contents

- [Database Layer](#database-layer)
- [Data Access Layer](#data-access-layer)
- [API Layer](#api-layer)
- [Frontend Layer](#frontend-layer)
- [Legacy Mock Data](#legacy-mock-data)

---

## Database Layer

### Supabase PostgreSQL Schema

**Location:** `supabase-schema.sql`

**Core Tables:**

- `user` - All system users with role-based access
- `students` - Student profiles linked to user accounts
- `course` - Course definitions (required, elective, external)
- `time_slot` - Scheduling time blocks with day/start/end
- `section` - Course sections with instructor and capacity
- `schedule` - Semester schedules with versioning
- `schedule_item` - Individual schedule entries
- `elective_preferences` - Student elective choices (JSON)
- `registration` - Student section registrations
- `feedback` - User feedback on schedules
- `faculty_availability` - Faculty time preferences
- `rule` / `rule_activation` - Scheduling constraints
- `notification` - System notifications
- `load_assignment` - Faculty teaching load
- `external_course` - Courses from other departments
- `irregular_student` - Non-standard course paths
- `version_history` - Schedule change tracking
- `scheduling_task` - Async generation jobs
- `student_preferences` - Student scheduling preferences
- `swe_plan` - SWE curriculum plan (admin-editable required/elective courses per level)

**Security:** All tables have Row-Level Security (RLS) policies enforcing role-based access for: student, faculty, scheduling_committee, teaching_load_committee, registrar.

**Extensions:** `pgcrypto`, `uuid-ossp`

---

## Data Access Layer

### Typed Supabase Clients

**Location:** `src/lib/database.types.ts`, `src/lib/supabase-client.ts`, `src/lib/supabase-admin.ts`

#### Browser Client

```typescript
// src/lib/supabase-client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export const supabase = createBrowserClient<Database>(...)
```

#### Server/Admin Client

```typescript
// src/lib/supabase-admin.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export function getSupabaseAdminOrThrow(): SupabaseClient<Database> { ... }
```

### Helper Functions

**Location:** `src/lib/supabase-admin.ts`, `src/lib/course-queries.ts`

#### SWE Plan Helpers

Location: `src/lib/supabase/swe-plan.ts`

- `getSWEPlan(level?)` → `SWEPlan[]` (active items, optional level filter)
- `addCourse(data)` → `SWEPlan` (admin roles)
- `updateCourse(id, data)` → `SWEPlan` (admin roles)
- `archiveCourse(id)` → `void` (admin roles; sets `is_active=false`)

#### Student Helpers

```typescript
// Get student profile by user_id
getStudentProfile(userId: string): Promise<TableRow<"students"> | null>

// Get student by email
getStudentByEmail(email: string): Promise<TableRow<"students"> | null>
```

#### Course Helpers

```typescript
// src/lib/course-queries.ts
// Fetch all course offerings with sections and time slots
fetchCourseOfferingsFromDB(): Promise<CourseOffering[]>

// Fetch sections for a specific course
fetchSectionsFromDB(courseCode: string): Promise<Section[]>
```

**Transformation:** Database rows (`TableRow<"course">`, etc.) are mapped to domain types (`CourseOffering`, `Section`) with proper field name transformations and relationships.

---

## API Layer

### API Routes

**Location:** `src/app/api/*`

All API routes use the typed admin client and helper functions:

#### Student Profile

```typescript
// src/app/api/student/profile/route.ts
GET /api/student/profile
- Uses: getStudentProfile(), getStudentByEmail()
- Returns: students table row directly
```

#### Courses & Sections

```typescript
// src/app/api/courses/route.ts
GET /api/courses
- Uses: fetchCourseOfferingsFromDB()
- Returns: CourseOffering[] with sections and time slots

// src/app/api/sections/route.ts
GET /api/sections?courseCode=XXX
- Uses: fetchSectionsFromDB(courseCode)
- Returns: Section[] for the specified course
```

#### Elective Preferences

```typescript
// src/app/api/electives/submit/route.ts
POST /api/electives/submit
- Inserts into elective_preferences table
- Payload: { student_id, elective_choices: JSON }

GET /api/electives/submit?studentId=XXX
- Fetches from elective_preferences table
- Returns: Student's elective choices
```

#### Authentication

```typescript
// src/app/api/auth/student/route.ts
POST /api/auth/student
- Validates credentials against students table
- Returns: Session data with student profile
```

---

## Frontend Layer

### Data Fetching Hooks

**Pattern:** Components use SWR or React Query to fetch from API routes:

```typescript
// Example: Fetch courses
const { data: courses, error } = useSWR("/api/courses", fetcher);

// Example: Fetch student profile
const { data: profile } = useSWR("/api/student/profile", fetcher);
```

### Component Data Flow

```
User Action → Component → API Route → Helper Function → Supabase Client → Database
                ↓                                                            ↓
            UI Update ← Transform ← Parse/Validate ← Query Result ← RLS Check
```

**Type Safety:** All data flows through typed interfaces from `database.types.ts` to domain types in `types.ts`, ensuring compile-time validation.

---

## Live Mode Integration

### Full Supabase Integration

**Status:** All mock data has been removed. The system now runs in full live mode with all data fetched from Supabase.

**Data Sources:**

- ✅ **Students** → `students` table via `getStudentsForLevels()`
- ✅ **Faculty** → `user` + `faculty_availability` tables via `getAvailableFaculty()`
- ✅ **Courses** → `course` table via `getAllElectiveCourses()`
- ✅ **External Courses** → `external_course` table via `getExternalCourses()`
- ✅ **Irregular Students** → `irregular_student` table via `getIrregularStudents()`
- ✅ **Curriculum** → `swe_plan` table via `getCurriculumByLevel()`

**ScheduleDataCollector Updates:**

All methods in `ScheduleDataCollector` are now async and fetch data directly from Supabase:
- `getCurriculumForLevels()` → Fetches from `swe_plan` table
- `getStudentsForLevels()` → Fetches from `students` table
- `getAvailableFaculty()` → Fetches from `user` + `faculty_availability` tables
- `getAllElectiveCourses()` → Fetches from `course` table
- `getExternalCourses()` → Fetches from `external_course` table
- `getIrregularStudents()` → Fetches from `irregular_student` table

**Demo Accounts:**

Demo accounts are seeded via `scripts/seed-demo-accounts.js` and accessible via `/api/demo-accounts` endpoint.

---

## References

- [Database Migration Log](./Migration.md)
- [Supabase Schema](../../supabase-schema.sql)
- [Database Types](../../src/lib/database.types.ts)
- [Course Queries](../../src/lib/course-queries.ts)
- [API Routes](../../src/app/api/)

---

## Revision History

| Date       | Author                        | Change Summary                           |
| ---------- | ----------------------------- | ---------------------------------------- |
| 2025-10-11 | Full-stack Migration Engineer | Complete rewrite post-Supabase migration |
| 2025-10-02 | Architect                     | Initial draft                            |
