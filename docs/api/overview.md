# API Routes Overview

> **Auto-generated from:** `src/app/api/**/route.ts`  
> **Last Updated:** 2025-10-24

This document provides a comprehensive overview of all API endpoints available in the SmartSchedule system.

---

## Authentication Endpoints

### `/api/auth/sign-in`

**Methods:** `POST`

**Description:** Authenticate user and create session

**Input:**
```typescript
{
  email: string (email format)
  password: string (min 6 characters)
  role?: 'student' | 'faculty' | 'scheduling_committee' | 'teaching_load_committee' | 'registrar'
  fullName?: string
}
```

**Output:**
```typescript
{
  success: true
  data: {
    redirect: string  // Role-based redirect path
    role: UserRole
  }
}
```

**Related Tables:**
- `users` (read/upsert)

**Authentication:** Not required (public endpoint)

---

### `/api/auth/sign-up`

**Methods:** `POST`

**Description:** Create new user account

**Input:**
```typescript
{
  email: string (email format)
  password: string (min 6 characters)
  fullName: string (2-120 characters)
  role: 'student' | 'faculty' | 'scheduling_committee' | 'teaching_load_committee' | 'registrar'
}
```

**Output:**
```typescript
{
  success: true
  message: "Account created successfully"
  data: {
    message: "Check your email to verify your account."
  }
}
```

**Related Tables:**
- Creates entry in Supabase Auth
- `users` table (via trigger)

**Authentication:** Not required (public endpoint)

---

### `/api/auth/sign-out`

**Methods:** `POST`

**Description:** End user session

**Input:** None (empty body)

**Output:**
```typescript
{
  success: true
  data: {
    message: "Signed out successfully"
  }
}
```

**Related Tables:** None

**Authentication:** Required (session must exist)

---

### `/api/auth/bootstrap`

**Methods:** `POST`

**Description:** Initialize or update user profile after authentication

**Input:**
```typescript
{
  email?: string (email format)
  role?: 'student' | 'faculty' | 'scheduling_committee' | 'teaching_load_committee' | 'registrar'
  fullName?: string
}
```
*(All fields optional)*

**Output:**
```typescript
{
  success: true
  data: {
    redirect: string  // Role-based redirect path
    role: UserRole
  }
}
```

**Related Tables:**
- `users` (read/upsert)

**Authentication:** Required

---

## Student Endpoints

### `/api/student/electives`

**Methods:** `GET`

**Description:** Fetch all available electives

**Input:** None

**Output:**
```typescript
{
  success: true
  data: {
    electives: Array<{
      id: string
      title: string
      description: string | null
      code: string
      credits: number
      level: number
      prerequisites: string[] | null
      created_at: string
      updated_at: string
    }>
  }
}
```

**Related Tables:**
- `electives` (read)

**Authentication:** Required

**Query Details:**
- Ordered by: `level ASC`, `code ASC`

---

### `/api/student/preferences`

**Methods:** `GET`, `POST`, `DELETE`

**Description:** Manage student's elective preferences

#### GET
**Input:** None

**Output:**
```typescript
{
  success: true
  data: {
    preferences: Array<{
      id: string
      student_id: string
      elective_id: string
      preference_order: number
      elective: Elective  // Full elective details
      created_at: string
      updated_at: string
    }>
  }
}
```

#### POST
**Input:**
```typescript
{
  preferences: Array<{
    electiveId: string (UUID)
    preferenceOrder: number (positive integer)
  }>  // Min 1, Max 10 preferences
}
```

**Output:**
```typescript
{
  success: true
  data: {
    preferences: Array<StudentElective>
  }
}
```

**Behavior:** Replaces all existing preferences with new ones (delete + insert)

#### DELETE
**Query Parameters:** `?electiveId={uuid}`

**Output:**
```typescript
{
  success: true
  data: {
    message: "Preference deleted successfully"
  }
}
```

**Related Tables:**
- `student_electives` (read/write/delete)
- `electives` (read via join)

**Authentication:** Required
**Authorization:** Students can only manage their own preferences

---

### `/api/student/feedback`

**Methods:** `GET`, `POST`

**Description:** Manage student feedback submissions

#### GET
**Input:** None

**Output:**
```typescript
{
  success: true
  data: {
    feedbacks: Array<{
      id: string
      student_id: string
      schedule_id: string | null
      feedback_text: string
      rating: number  // 1-5
      created_at: string
      updated_at: string
    }>
  }
}
```

**Query Details:**
- Ordered by: `created_at DESC`

#### POST
**Input:**
```typescript
{
  scheduleId?: string (UUID, optional)
  feedbackText: string (min 10 characters)
  rating: number (1-5)
}
```

**Output:**
```typescript
{
  success: true
  data: {
    feedback: Feedback
  }
}
```

**Related Tables:**
- `feedback` (read/write)
- `schedules` (optional reference)

**Authentication:** Required
**Authorization:** Students can only manage their own feedback

---

### `/api/student/schedule`

**Methods:** `GET`

**Description:** Fetch student's latest schedule

**Input:** None

**Output:**
```typescript
{
  success: true
  data: {
    schedule: {
      id: string
      student_id: string
      data: any  // JSONB schedule data
      created_at: string
      updated_at: string
    } | null
  }
}
```

**Query Details:**
- Returns most recent schedule only (ordered by `created_at DESC`, limit 1)

**Related Tables:**
- `schedules` (read)

**Authentication:** Required
**Authorization:** Students can only view their own schedule

---

### `/api/student/profile`

**Methods:** `GET`

**Description:** Fetch student profile information

**Query Parameters:** `?userId={uuid}` (required)

**Input:** Query parameter `userId`

**Output:**
```typescript
{
  success: true
  student: {
    user_id: string
    name: string
    email: string
    student_number: string
    student_id: string  // Alias for student_number
    level: number
    status: string
  }
}
```

**Related Tables:**
- `students` (read)
- `users` (read)

**Authentication:** Required
**Authorization:** 
- Students can only access their own profile
- Committee members can access any profile

---

## Utility Endpoints

### `/api/hello`

**Methods:** `GET`

**Description:** Test endpoint to verify API is running

**Input:** None

**Output:**
```typescript
{
  message: "Hello from API"
}
```

**Related Tables:** None

**Authentication:** Not required

---

## Mock/Development Endpoints

### `/api/mock/schedule`

**Methods:** (Check implementation for details)

**Description:** Mock schedule generation for testing

**Related Tables:** Various (mock data)

**Authentication:** Implementation-dependent

---

## Common Response Formats

### Success Response
```typescript
{
  success: true
  message?: string  // Optional success message
  data: T  // Response payload
}
```

### Error Response
```typescript
{
  success: false
  error: string  // Error message
  details?: any  // Optional error details
}
```

### Validation Error Response
```typescript
{
  success: false
  error: string
  details: {
    issues: Array<{
      path: string[]
      message: string
    }>
  }
}
```

---

## API Helpers & Utilities

The API uses centralized helper functions from `@/lib/api`:

- `successResponse(data, message?)` - Format success responses
- `errorResponse(message, status?)` - Format error responses
- `validationErrorResponse(error)` - Format validation error responses
- `unauthorizedResponse()` - Return 401 unauthorized
- `getAuthenticatedUser()` - Get current authenticated user and Supabase client

---

## Authentication Flow

1. **Sign Up**: `POST /api/auth/sign-up`
   - Creates Supabase Auth user
   - Sends email verification
   
2. **Sign In**: `POST /api/auth/sign-in`
   - Validates credentials
   - Creates session
   - Upserts user profile
   - Returns role-based redirect

3. **Bootstrap**: `POST /api/auth/bootstrap`
   - Called on app load
   - Ensures user profile exists
   - Returns current role and redirect

4. **Sign Out**: `POST /api/auth/sign-out`
   - Destroys session
   - Redirects to login

---

## Security & Authorization

### Row Level Security (RLS)
All database operations respect RLS policies defined in the schema:
- Students: Own data only (preferences, feedback, schedule)
- Committee members: Can view/manage broader data sets
- Faculty: Own availability and schedule data

### Authentication Middleware
Protected endpoints use `getAuthenticatedUser()` which:
- Verifies session validity
- Fetches user profile
- Returns Supabase client with user context

### Role-Based Redirects
After authentication, users are redirected based on role:
- `student` → `/student/dashboard`
- `faculty` → `/faculty/dashboard`
- `scheduling_committee` → `/committee/scheduler/dashboard`
- `teaching_load_committee` → `/committee/teaching-load/dashboard`
- `registrar` → `/committee/registrar/dashboard`

---

## Database Connections

All API routes use server-side Supabase client:
```typescript
import { createServerClient } from "@/lib/supabase";
const supabase = createServerClient(cookieStore);
```

This ensures:
- Server-side rendering compatibility
- Secure credential handling
- Automatic cookie-based session management

---

*This document is automatically synchronized with API route implementations. Any manual edits will be overwritten on regeneration.*

