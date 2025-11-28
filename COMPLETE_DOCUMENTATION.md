# SmartSchedule V2 - Complete Documentation

**Version**: V1 (Production Ready - 95% Complete)  
**Last Updated**: October 29, 2025  
**Built with**: Next.js 15, Supabase, TypeScript, shadcn/ui, Framer Motion, Chart.js

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Development Guides](#development-guides)
5. [Feature Documentation](#feature-documentation)
6. [API Reference](#api-reference)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)
9. [Design System](#design-system)

---

## Overview

### What is SmartSchedule?

SmartSchedule is a conflict-free teaching and exam scheduling web application for the SWE department. It generates optimal schedules automatically, manages student enrollments, tracks faculty preferences, and provides role-based dashboards for different stakeholders.

### Key Features

**Current Progress: 95% Complete (V1 Scope)** - Production Ready

#### ✅ Completed Features
- **Modern Brand Identity** - Custom logo, design system, professional color palette
- **Responsive Landing Page** - Hero, features, role benefits, conversion-optimized
- **Multi-UI Role System** - 5 distinct dashboards tailored to each user role
  - 🟣 Scheduling Committee - Full system control and schedule generation
  - 🔵 Teaching Load - Instructor workload management and balancing
  - 🟢 Faculty - Personal teaching schedule and preferences
  - 🟡 Student - Elective preferences and schedule viewing with drag-and-drop
  - 🔴 Registrar - Final validation and publication
- **Enhanced Student Experience** - Drag-and-drop preferences, course details, comments
- **Scheduling Algorithm** - One-click conflict-free schedule generation
- **Conflict Detection** - Real-time warnings for room, instructor, and student conflicts
- **Exams Management** - Full CRUD with conflict detection and multi-room support
- **Role-Based Navigation** - Dual navigation (desktop sidebar + mobile drawer)
- **Streamlined Authentication** - Role selection during signup, automatic assignment
- **Dashboard** - Beautiful home with entity statistics and quick actions
- **Time Grid Configuration** - Admin-configurable scheduling parameters
- **Courses Management** - Full CRUD with elective designation
- **Rooms Management** - Lecture and Lab room management
- **Instructors Management** - Teaching staff with load tracking
- **Student Groups** - Automatically created and updated based on actual student counts (levels 1-8)
- **Sections Management** - Full CRUD with meeting patterns and conflict detection
- **Import/Export** - Bulk JSON data operations with validation
- **Security** - Multi-layer RLS with role verification
- **Animations** - Smooth transitions with framer-motion
- **Mobile Responsive** - Touch-friendly, works on all devices

#### ⏳ Deferred to V2
- Real-time collaborative editing with Yjs
- Version history with jsondiffpatch
- Named releases with restore capability
- AI chatbot for schedule insights
- CSV import/export
- Instructor preference learning (ML-based)
- Email/SMS notifications
- PDF schedule exports

### Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: shadcn/ui, Radix UI, Tailwind CSS, Lucide Icons
- **State**: Zustand stores
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (Postgres + Auth + RLS)
- **Notifications**: Sonner (toast)
- **Animations**: Framer Motion
- **Charts**: Chart.js

---

## Quick Start

### Option A: Local Development with Supabase CLI (Recommended)

#### 1. Install Dependencies

```bash
pnpm install
```

#### 2. Start Supabase Locally

```bash
# Start Supabase (requires Docker)
pnpm db:start

# Or if using npm scripts
npm run db:start
```

This starts:
- **API URL**: http://127.0.0.1:54321
- **Studio** (Database GUI): http://127.0.0.1:54323
- **Mailpit** (Email testing): http://127.0.0.1:54324
- **Database**: postgresql://postgres:postgres@127.0.0.1:54322/postgres

#### 3. Configure Environment

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

#### 4. Run Migrations

```bash
# Reset database and apply all migrations
pnpm db:reset

# Or manually via Studio: http://127.0.0.1:54323 → SQL Editor
```

#### 5. Seed Sample Data (Optional)

```bash
# Load comprehensive seed data
pnpm db:seed:external:clear
```

#### 6. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

#### 7. Create Test Users

1. Visit http://localhost:3000/register
2. Create account and select role
3. Check email at http://127.0.0.1:54324 (Mailpit)
4. Click confirmation link
5. Login and explore!

**Available Roles:**
- `scheduling` - Full access, schedule generation, all management features
- `teaching_load` - Instructor load management, section assignment editing
- `faculty` - Personal schedule view, feedback submission
- `student` - Elective preferences, schedule viewing
- `registrar` - Final validation, publication, and data export

### Option B: Remote Supabase Project

#### 1. Install Dependencies

```bash
pnpm install
```

#### 2. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (~2 minutes)
3. Go to **Project Settings → API** to get your credentials

#### 3. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### 4. Run Database Migrations

Go to **SQL Editor** in your Supabase dashboard and execute these files **in order**:

1. `supabase/migrations/20241027000001_initial_schema.sql`
2. `supabase/migrations/20241027000002_rls_policies.sql`
3. `supabase/migrations/20241027000003_helper_functions.sql`

#### 5. Create Your First User

**Via Register Page (Recommended):**
1. Start the dev server: `pnpm dev`
2. Go to `/register` and create an account
3. **Select your role** from the dropdown during registration
4. Your role is automatically assigned - no manual SQL needed!

**Via Supabase Dashboard (Alternative):**
1. Go to **Authentication → Users** → **Add User**
2. After creation, go to **SQL Editor** and run:

```sql
INSERT INTO user_roles (user_id, role, name, email)
VALUES (
  'your-user-id-from-auth-users-table',
  'scheduling',
  'Your Name',
  'your.email@example.com'
);
```

#### 6. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Essential Commands

**Database Management:**
```bash
pnpm db:start        # Start Supabase
pnpm db:stop         # Stop Supabase
pnpm db:reset        # Reset database (reapply migrations)
pnpm db:status       # Check what's running
pnpm db:studio       # Open database GUI
pnpm db:types        # Generate TypeScript types
```

**Data Seeding:**
```bash
pnpm db:seed         # Load sample data
pnpm db:seed:clear   # Clear & reload data
pnpm db:seed:external:clear  # Load comprehensive external data
```

**Development:**
```bash
pnpm dev             # Start Next.js server
pnpm build           # Build for production
pnpm lint            # Run linter
```

---

## Architecture

### Project Structure

```
app/
├── (auth)/                      # Authentication pages
│   ├── login/
│   ├── register/
│   ├── onboarding/              # User onboarding flow
│   └── actions.ts
├── (dashboard)/dashboard/     # Main application
│   ├── page.tsx                # Dashboard home (role router)
│   ├── scheduling/             # Scheduling Committee dashboard
│   ├── teaching-load/           # Teaching Load dashboard
│   ├── faculty/                 # Faculty dashboard
│   ├── student/                 # Student dashboard
│   ├── registrar/               # Registrar dashboard
│   ├── courses/                 # Course management
│   ├── rooms/                   # Room management
│   ├── instructors/             # Instructor management
│   ├── student-groups/          # Student groups
│   ├── sections/                # Section management
│   ├── exams/                   # Exam management
│   ├── preferences/             # Student elective preferences
│   ├── elective-stats/          # Elective statistics (scheduling)
│   ├── import-export/           # Bulk data operations
│   └── settings/                # Time grid config
└── api/                         # REST API routes
    ├── courses/
    ├── rooms/
    ├── instructors/
    ├── student-groups/
    ├── sections/
    ├── exams/
    ├── elective-preferences/
    ├── student/
    ├── faculty/
    ├── data/                    # Import/Export
    └── config/

components/                      # React components
├── ui/                         # shadcn/ui components
├── *-form.tsx                  # Form components
├── *-table.tsx                 # Table components
├── dashboard-sidebar.tsx       # Navigation
├── role-guard.tsx              # Route protection
└── onboarding-form.tsx         # Onboarding component

lib/
├── db/                         # Database queries
│   ├── courses.ts
│   ├── rooms.ts
│   ├── instructors.ts
│   ├── student-groups.ts
│   ├── sections.ts
│   ├── exams.ts
│   ├── elective-preferences.ts
│   ├── elective-comments.ts
│   ├── elective-groups.ts
│   ├── prerequisites.ts
│   └── config.ts
├── stores/                     # Zustand state
│   ├── auth-store.ts
│   ├── schedule-store.ts
│   ├── conflict-store.ts
│   └── notification-store.ts
├── types/
│   └── database.ts            # TypeScript types
└── utils.ts

supabase/
├── migrations/                 # Database migrations
│   ├── 20241027000001_initial_schema.sql
│   ├── 20241027000002_rls_policies.sql
│   ├── 20241027000003_helper_functions.sql
│   ├── 20241027000004_fix_user_role_creation.sql
│   ├── 20241027000005_exam_conflict_functions.sql
│   ├── 20241027000006_elective_comments.sql
│   └── 20251029140000_populate_swe_study_plan.sql
├── client.ts
├── server.ts
└── middleware.ts
```

### Database Schema

**13+ Tables**: course, section, room, instructor, student_group, exam, rule, schedule_doc, comment, notification, user_roles, time_grid_config, elective_preference, elective_comment, elective_group, course_prerequisite, student_profile, academic_semester, survey_period

**Row Level Security**: Enforced for all tables with 5 role-based policies

**Helper Functions**: Conflict detection, statistics, notifications, automatic student group sync

**Auto-Sync**: Student groups automatically created/updated based on student enrollment counts

### User Roles

Defined in database table `user_roles`:
1. **scheduling** - Full system access (admin role)
2. **registrar** - Course and schedule management
3. **teaching_load** - Review instructor loads and provide feedback
4. **faculty** - View schedules, manage preferences
5. **student** - View own schedule and courses

**Note**: The `scheduling` role is the administrative role with full system access. There is no separate "admin" role.

### Authentication Flow

#### Registration
- Users register through `app/(auth)/register/page.tsx`
- Form component: `app/(auth)/register/register-form.tsx`
- Server action: `app/(auth)/actions.ts` - `signUp` function
- Email confirmation required (handled by `app/(auth)/auth/confirm/route.ts`)

#### Login
- Users login through `app/(auth)/login/page.tsx`
- Form component: `app/(auth)/login/login-form.tsx`
- Server action: `app/(auth)/actions.ts` - `signIn` function

#### Protected Routes
All dashboard routes are protected by `middleware.ts`:
- Redirects unauthenticated users to `/login`
- Uses `supabase/middleware.ts` for session management

#### Using Authentication

**In Server Components:**
```typescript
import { createClient } from '@/supabase/server'

const supabase = await createClient()
const { data: { user }, error } = await supabase.auth.getUser()

if (!user) {
  redirect('/login')
}
```

**In Client Components:**
```typescript
import { useAuth } from '@/lib/auth-context'

function MyComponent() {
  const { user, role, loading } = useAuth()
  
  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>
  
  return <div>Welcome {user.email}</div>
}
```

**In API Routes:**
```typescript
import { createClient } from '@/supabase/server'

const supabase = await createClient()
const { data: { user }, error: authError } = await supabase.auth.getUser()

if (authError || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

### Row Level Security (RLS)

All database access is controlled by RLS policies defined in `supabase/migrations/20241027000002_rls_policies.sql`.

**Key RLS Functions:**
- `is_admin()` - Check if current user has scheduling role (admin privileges)
- `is_registrar_or_admin()` - Check if user has scheduling or registrar privileges
- `get_user_role()` - Get current user's role

**Note**: The `is_admin()` function checks for the `scheduling` role, which has administrative privileges.

Defined in `supabase/migrations/20241027000003_helper_functions.sql`

---

## Development Guides

### Local Development with Supabase

#### Prerequisites
- Supabase CLI installed (`brew install supabase/tap/supabase` on macOS)
- Docker installed and running

#### Getting Started

1. **Start Local Supabase**
```bash
supabase start
```

This will start:
- **API URL**: http://127.0.0.1:54321
- **Database URL**: postgresql://postgres:postgres@127.0.0.1:54322/postgres
- **Studio URL**: http://127.0.0.1:54323 (Database GUI)
- **Mailpit URL**: http://127.0.0.1:54324 (Email testing)

2. **Environment Configuration**
Make sure your `.env.local` file is configured for local development:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

3. **Start Next.js Development Server**
```bash
npm run dev
# or
pnpm dev
```

#### Database Management

**Apply All Migrations:**
```bash
supabase db reset
```
This will:
- Drop the database
- Recreate it
- Apply all migrations in order
- Run seed files (if configured)

**Create a New Migration:**
```bash
supabase migration new migration_name
```

**Check Migration Status:**
```bash
supabase migration list
```

**View Database in Studio:**
Open http://127.0.0.1:54323 to access Supabase Studio and:
- Browse tables
- Run SQL queries
- Manage RLS policies
- View logs

#### Current Migrations

1. **20241027000001_initial_schema.sql** - Creates all tables and indexes
2. **20241027000002_rls_policies.sql** - Sets up Row Level Security policies
3. **20241027000003_helper_functions.sql** - Adds conflict detection and helper functions
4. **20241027000004_fix_user_role_creation.sql** - Fixes RLS for user registration
5. **20241027000005_exam_conflict_functions.sql** - Exam conflict detection
6. **20241027000006_elective_comments.sql** - Elective comments
7. **20251029140000_populate_swe_study_plan.sql** - SWE study plan courses

#### Testing Email in Development

All emails are captured by Mailpit (instead of being sent):
- Open http://127.0.0.1:54324
- View registration confirmation emails
- Click confirmation links (they point to your local app)

#### Common Commands

```bash
# Stop Supabase
supabase stop

# Restart Supabase
supabase stop && supabase start

# View Logs
supabase logs

# Generate TypeScript Types
supabase gen types typescript --local > lib/types/database.ts
```

### Environment Configuration

#### Required Variables

Create a `.env.local` file in the project root:

```bash
# ============================================
# Node Environment
# ============================================
NODE_ENV=development

# ============================================
# Supabase Configuration
# ============================================
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# ============================================
# Application Configuration
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ============================================
# Feature Flags
# ============================================
ENABLE_DEMO_MODE=false
```

#### Production Environment

```bash
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod-anon-key
SUPABASE_SERVICE_ROLE_KEY=prod-service-role-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
ENABLE_DEMO_MODE=false
```

### Data Fetching Standards

#### Next.js 15 Caching Strategy

This project implements comprehensive Next.js 15 caching strategies to optimize performance and ensure data freshness:

**1. Request Memoization (React.cache())**
- All data fetching functions in `lib/data/*.ts` are wrapped with `React.cache()`
- Ensures the same data is only fetched once per request, even if called multiple times in the same render tree
- Prevents duplicate database queries during server-side rendering

**2. Persistent Caching with Tags (unstable_cache)**
- Data fetching functions use `unstable_cache` with cache tags for fine-grained invalidation
- Cache tags defined in `lib/cache/tags.ts` (e.g., `CACHE_TAGS.COURSES`, `CACHE_TAGS.SECTIONS`)
- Time-based revalidation: Most caches revalidate every hour (3600 seconds)
- Sections cache revalidates every 30 minutes (1800 seconds) due to higher change frequency

**3. On-Demand Revalidation**
- After mutations (POST, PUT, DELETE), caches are invalidated using `revalidatePath` and `revalidateTag`
- Revalidation helpers in `lib/cache/revalidation.ts` provide centralized cache invalidation
- API routes automatically call revalidation after successful mutations

**4. Route Segment Config**
- User-specific routes use `dynamic = 'force-dynamic'` to opt out of Full Route Cache
- Static routes benefit from automatic caching with time-based revalidation
- See route configs in dashboard pages for examples

**Cache Layers:**
- **Request Memoization**: Per-request lifecycle (React.cache)
- **Data Cache**: Persistent across requests with tags (unstable_cache)
- **Full Route Cache**: Automatic for static routes
- **Router Cache**: Client-side navigation cache (handled by Next.js)

#### Server-Side Data Fetching (Preferred)

**When to Use:**
- Initial page loads
- SEO-critical content
- Data that doesn't need real-time updates
- Large datasets that benefit from server-side filtering/pagination
- Secure operations requiring authentication checks

**Pattern: Server Components**
```typescript
// app/(dashboard)/dashboard/courses/page.tsx
import { getCoursesPaginated } from '@/lib/data/courses'

export default async function CoursesPage() {
  const { courses, totalCount } = await getCoursesPaginated(1, 20)
  
  return <CoursesTable courses={courses} />
}
```

**Database Access Layer:**
**ALWAYS** create functions in `lib/data/` instead of inline queries:

**✅ Correct:**
```typescript
// lib/data/courses.ts
export const getCourses = cache(
  unstable_cache(
    async () => {
      const supabase = await createClient()
      const { data, error } = await supabase.from('course').select('*')
      if (error) throw error
      return data as Course[]
    },
    ['courses-all'],
    {
      tags: [CACHE_TAGS.COURSES, CACHE_TAGS.COURSE_LIST],
      revalidate: 3600, // 1 hour
    }
  )
)

// app/page.tsx
import { getCourses } from '@/lib/data/courses'
const courses = await getCourses()
```

**❌ Incorrect:**
```typescript
// app/page.tsx - DON'T DO THIS
const supabase = await createClient()
const { data } = await supabase.from('course').select('*')
```

#### Client-Side Data Fetching

**When to Use:**
- Real-time updates needed
- User interactions (search, filters, infinite scroll)
- Data that changes frequently
- Optimistic updates required

**Pattern: React Query with Custom Hooks**

Use `hooks/use-client-fetch.ts` for queries:
```typescript
import { useClientFetch } from '@/hooks/use-client-fetch'
import type { Course } from '@/lib/types/database'

function CoursesClient() {
  const { data: courses, isLoading, error } = useClientFetch<Course>(
    'courses',
    'course',
    60000 // Cache for 60 seconds
  )
  
  if (isLoading) return <Skeleton />
  if (error) return <ErrorMessage error={error} />
  
  return <CoursesTable courses={courses} />
}
```

**Cache Invalidation After Mutations:**
- Client-side mutations use React Query's `invalidateQueries` for automatic cache invalidation
- Server-side mutations (API routes) use `revalidatePath` and `revalidateTag` from `lib/cache/revalidation.ts`
- Both approaches ensure fresh data is served after mutations

### Seed Data Guide

#### Available Seed Data Files

1. **`seed-data.json` (Basic)**
   - 12 courses (Levels 1-5)
   - 10 rooms (5 lecture halls, 5 labs)
   - 6 instructors
   - 7 student groups
   - Use Case: Quick setup for testing basic functionality

2. **`seed-data-enhanced.json` (Comprehensive)**
   - 33 courses (Levels 1-5)
   - 15 rooms (9 lecture halls, 6 labs)
   - 10 instructors with varying workload capacities
   - 7 student groups with realistic sizes
   - Includes core and elective courses
   - Use Case: Full-featured testing and demos

#### Loading Methods

**Method 1: Using the Web Interface (Recommended)**
1. Login to the dashboard
2. Navigate to **Import/Export** (`/dashboard/import-export`)
3. Select entities to import (courses, rooms, instructors, student groups)
4. Upload the seed data JSON file
5. Click **Import Data**

**Method 2: Using the Seed Script**
```bash
# Navigate to project root
cd /path/to/SSv2

# Run the seed script
pnpm tsx scripts/seed-database.ts

# Or clear existing data first
pnpm tsx scripts/seed-database.ts --clear
```

---

## Feature Documentation

### Multi-UI Role System

SmartSchedule implements a comprehensive role-based multi-UI system with 5 distinct user roles, each with their own dedicated dashboard and navigation experience.

#### User Roles

1. **Scheduling Committee** (`scheduling`)
   - **Access Level**: Full system access
   - **Dashboard**: `/dashboard/scheduling`
   - **Key Features**:
     - Schedule generation controls
     - Conflict overview and resolution
     - Named releases management
     - Full CRUD access to all entities
     - System setup checklist
     - Quick actions for all management tasks

2. **Teaching Load Committee** (`teaching_load`)
   - **Access Level**: Instructor and course management
   - **Dashboard**: `/dashboard/teaching-load`
   - **Key Features**:
     - Instructor load overview with visual indicators
     - Teaching hour distribution
     - Section assignment management
     - Load balancing guidelines
     - Collaborative editing with scheduling committee

3. **Faculty** (`faculty`)
   - **Access Level**: Personal timetable view
   - **Dashboard**: `/dashboard/faculty`
   - **Key Features**:
     - Personal teaching schedule
     - Assigned sections with times and rooms
     - Course details and capacity
     - Feedback submission
     - Availability preferences management
     - Profile linked via email matching

4. **Student** (`student`)
   - **Access Level**: Schedule viewing and preference submission
   - **Dashboard**: `/dashboard/student`
   - **Key Features**:
     - Elective preference submission (ranked)
     - Personal course schedule view
     - Available elective courses
     - Exam schedule
     - Comments and reviews

5. **Registrar** (`registrar`)
   - **Access Level**: Publication and validation
   - **Dashboard**: `/dashboard/registrar`
   - **Key Features**:
     - Schedule publication controls
     - Validation checks (conflicts, rooms, loads)
     - Release history
     - Export functionality (JSON, PDF)
     - Final approval workflow
     - Read-only access to all system data

#### Navigation Matrix

| Menu Item | Scheduling | Teaching Load | Faculty | Student | Registrar |
|-----------|:----------:|:-------------:|:-------:|:-------:|:---------:|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ |
| Setup Check | ✅ | ✅ | ❌ | ❌ | ❌ |
| Courses | ✅ | ✅ | ❌ | ❌ | ✅ |
| Sections | ✅ | ✅ | ❌ | ❌ | ✅ |
| Rooms | ✅ | ❌ | ❌ | ❌ | ✅ |
| Instructors | ✅ | ✅ | ❌ | ❌ | ✅ |
| Student Groups | ✅ | ❌ | ❌ | ❌ | ✅ |
| My Schedule | ❌ | ❌ | ✅ | ❌ | ❌ |
| My Preferences | ❌ | ❌ | ❌ | ✅ | ❌ |
| Import/Export | ✅ | ❌ | ❌ | ❌ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ❌ | ❌ | ❌ | ❌ |

### Elective Preference System

The Elective Preference System enables students to select and rank their preferred elective courses. The system provides an interactive interface for students to manage their preferences and gives the scheduling committee aggregated statistics to inform scheduling decisions.

#### Key Features

- **Interactive Preference Manager**: Drag-and-drop reordering, visual rank badges
- **Course Details Dialog**: View full course information before adding
- **Search Functionality**: Filter available courses by code or title
- **Comment System**: Students can add comments/feedback on preferred courses
- **Statistics Dashboard**: Scheduling committee can view aggregated preference data
- **Mobile Responsive**: Touch-friendly interface with mobile navigation

#### Enrollment Rules

**Core Principle**: Electives have NO level restrictions! Students can register for any elective course regardless of their current level, as long as they satisfy the enrollment constraints.

**Enrollment Constraints:**
1. ✅ **Prerequisites Met**: Student has completed all prerequisite courses (if any)
2. ✅ **Credit Limit**: Total enrolled credits ≤ 20
3. ✅ **Section Capacity**: Section has available seats
4. ✅ **Elective Group Requirements**: Student meets any elective group constraints
5. ✅ **No Duplicate**: Not already enrolled in the same section

**NOT A Constraint:**
- ❌ Student level (Level 1 students can take "Level 8" electives if prerequisites are met)

### Exams Management

Comprehensive Exams CRUD system with advanced conflict detection for exam scheduling.

#### Features

- **Full CRUD Operations**: Create, read, update, delete exams
- **Multi-Room Support**: Assign multiple rooms to a single exam
- **Conflict Detection**: Automatic detection of room and student-level conflicts
- **Real-Time Warnings**: Visual indicators in form and table views
- **Date/Time Filtering**: Filter exams by date range, course, or type
- **Role-Based Access**: Scheduling and Registrar roles only

#### Conflict Detection

1. **Room Conflicts**: Checks if same room is booked for overlapping time slots on the same date
2. **Student-Level Conflicts**: Identifies exams for courses at the same level that would require students to be in two places at once

### Faculty Features

The SmartSchedule faculty portal provides comprehensive self-service features for instructors to manage their teaching preferences and provide feedback on schedules.

#### Features

1. **Self-Service Registration**
   - Faculty can register directly without admin intervention
   - Automatic instructor profile creation on signup
   - Email-based linking between user accounts and instructor records

2. **Availability Preferences**
   - Interactive weekly time grid (Sunday-Thursday, 08:00-17:00)
   - Two preference types:
     - **Preferred times**: Green slots indicating preferred teaching hours
     - **Unavailable times**: Red slots indicating unavailability
   - Click/drag interface for quick selection
   - Real-time visual feedback

3. **Schedule Feedback System**
   - Unified comment system for all user roles
   - Two comment types:
     - **General feedback**: Schedule-wide suggestions
     - **Section-specific**: Comments on assigned sections only
   - Faculty can only comment on their assigned sections
   - Full CRUD operations on unresolved comments

4. **Teaching Assignment View**
   - List of all assigned sections
   - Course information (code, title, level, credits)
   - Section details (number, capacity, meeting pattern, room)
   - Student group assignments
   - State indicators (draft/released)

### User Onboarding System

The SmartSchedule onboarding system ensures that all new users provide essential academic information before accessing the main application.

#### Features

- **Interactive Flow**: Guided, user-friendly setup process
- **Role-Specific Forms**: Different fields for students vs other roles
- **Student Level Selection**: Students select their academic level (1-8)
- **Confirmation Required**: Users must confirm information accuracy
- **Automatic Redirect**: Redirects to role-specific dashboard after completion
- **Middleware Protection**: Prevents dashboard access until onboarding complete

#### User Flow

1. **Registration/Login** - User creates account or logs in
2. **Automatic Redirect** - User tries to access /dashboard, middleware detects incomplete onboarding
3. **Onboarding Process** - User completes simple single-page form
4. **Profile Update** - Form submission updates user_roles via Supabase client
5. **Dashboard Access** - Success message shown, auto-redirect to role-specific dashboard

### SWE Scheduling Scope

The scheduling algorithm manages **SWE department courses in levels 4-8 only**.

- **SWE Courses (Levels 4-8)**: Scheduled automatically by the constraint satisfaction algorithm
- **External Courses** (MATH, CSC, CEN, IS, ENGL, etc.): Pre-scheduled, maintained as reference data
- **Foundation SWE** (Levels 1-3): Pre-scheduled, not managed by algorithm

Students see a combined schedule view with both algorithm-scheduled and pre-scheduled courses.

---

## API Reference

### Base URL
```
/api
```

### Authentication
All endpoints require authentication via Supabase Auth. Some endpoints require specific roles (student, scheduling, registrar, faculty).

### Semesters API

#### GET `/semesters`
List all semesters, ordered by start_date (most recent first).

**Query Parameters:**
- `current` (boolean, optional): If `true`, returns only the current active semester

#### POST `/semesters`
Create a new semester (scheduling role only).

#### PATCH `/semesters/:id`
Update a semester (scheduling role only).

#### DELETE `/semesters/:id`
Delete a semester (scheduling role only).

#### POST `/semesters/:id/archive`
Archive a semester (scheduling/registrar role only).

#### POST `/semesters/:id/generate-sections`
Auto-create sections for courses (scheduling role only).

### Courses API

#### GET `/courses`
List all courses.

#### GET `/courses/:code`
Get details for a specific course.

### Sections API

**⚠️ IMPORTANT: All section queries require `semester_id` parameter.**

#### GET `/sections`
List sections for a semester.

**Query Parameters:**
- `semester_id` (uuid, **required**): Semester ID (defaults to current if not provided)
- `level` (number, optional): Filter by student level
- `state` (string, optional): Filter by state ('draft' | 'released')
- `courseCode` (string, optional): Filter by course code
- `instructorId` (uuid, optional): Filter by instructor
- `sectionType` (string, optional): Filter by type ('lecture' | 'lab' | 'tutorial')

### Exams API

**⚠️ IMPORTANT: All exam queries require `semester_id` parameter.**

#### GET `/exams`
List exams for a semester.

**Query Parameters:**
- `semester_id` (uuid, **required**): Semester ID (defaults to current if not provided)
- `courseCode` (string, optional): Filter by course
- `examType` (string, optional): Filter by type ('midterm' | 'midterm2' | 'final')
- `startDate` (date, optional): Filter by start date
- `endDate` (date, optional): Filter by end date

### Student Enrollments API

#### GET `/student/enrollments`
Get authenticated student's enrollments.

**Query Parameters:**
- `semester_id` (uuid, optional): Semester ID (defaults to current)
- `stats` (boolean, optional): If `true`, returns statistics instead of enrollments

#### POST `/student/enrollments`
Enroll in a section (student role only).

**Request Body:**
```json
{
  "section_id": "uuid",
  "enrollment_type": "elective"  // optional: 'required' | 'elective' | 'retake'
}
```

#### DELETE `/student/enrollments/:sectionId`
Drop a section (student role only).

**⚠️ IMPORTANT: Parameter is `sectionId` (not `enrollmentId`).**

### Student Schedule API

#### GET `/student/schedule`
Get authenticated student's complete schedule.

**Query Parameters:**
- `semester_id` (uuid, optional): Semester ID (defaults to current)

### Elective Preferences API

#### GET `/elective-preferences`
Get current user's preferences or aggregated statistics.

**Query Parameters:**
- `stats` (boolean, optional): If `true`, returns aggregated statistics (scheduling role only)

#### POST `/elective-preferences`
Bulk update preferences for current user.

**Request Body:**
```json
[
  { "course_code": "CS301", "rank": 1 },
  { "course_code": "CS302", "rank": 2 }
]
```

#### DELETE `/elective-preferences/:id`
Remove single preference.

### Faculty API

#### GET `/faculty/availability`
Fetch availability preferences.

#### PATCH `/faculty/availability`
Update availability preferences.

**Request Body:**
```json
{
  "preferred_times": [...],
  "unavailable_times": [...]
}
```

### Error Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation failed) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (wrong role) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Deployment

### Production Deployment Guide

#### Pre-Deployment Requirements

1. **Environment Configuration**
   - Set `NODE_ENV=production`
   - Configure Supabase connection
   - Set `ENABLE_DEMO_MODE=false`
   - Configure application URL

2. **Database Requirements**
   - Apply all migrations to production database
   - Enable Row Level Security on all tables
   - Verify RLS policies are active
   - Test authentication flow

3. **Security**
   - Rotate service role key if needed
   - Verify API endpoints are protected
   - Test role-based access control
   - Check for exposed secrets

#### Deployment Checklist

**Phase 1: Data Preparation**
- [ ] Import initial data
- [ ] Validate database
- [ ] Generate initial schedule (if applicable)

**Phase 2: Configuration**
- [ ] Environment variables set
- [ ] Supabase project configured
- [ ] Security verified

**Phase 3: Testing**
- [ ] Empty state testing
- [ ] Data flow testing
- [ ] Role-based access testing
- [ ] Production validation

**Phase 4: Deployment**
- [ ] Build verification
- [ ] Deploy to hosting platform
- [ ] Post-deployment verification

**Phase 5: User Onboarding**
- [ ] Create initial users
- [ ] User testing

### Vercel Deployment

#### Prerequisites
1. ✅ GitHub repository
2. ✅ Supabase project (for production database)
3. ✅ Vercel account (free tier works)

#### Steps

1. **Prepare Your Supabase Project**
   - Create or use existing production Supabase project
   - Get API keys from **Settings** → **API**

2. **Deploy via Vercel Dashboard**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **Add New** → **Project**
   - Import your GitHub repository
   - Configure project:
     - **Framework Preset**: Next.js (auto-detected)
     - **Root Directory**: `./` (default)
     - **Build Command**: `npm run build` (default)
     - **Output Directory**: `.next` (default)

3. **Environment Variables**
   Add these in Vercel:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Deploy**
   - Click **Deploy**
   - Wait for build to complete
   - Test deployment

#### Automatic Deployments

Vercel automatically deploys when you push to your repository:
- **Push to `main`/`master`** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

---

## Troubleshooting

### Common Issues

**"Connection refused" or "Could not find table"**
```bash
# Check if Supabase is running (local)
pnpm db:status

# If not, start it
pnpm db:start

# Reset database to apply migrations
pnpm db:reset
```

**"Table does not exist"**
- Ensure all migrations ran successfully
- Check migration order: schema → RLS → helper functions
- Verify in Studio: http://127.0.0.1:54323 (local) or Supabase Dashboard (remote)

**Can't See the UI?**
1. Check `.env.local` exists with correct Supabase credentials
2. Ensure all migrations ran successfully
3. Verify user has a role in `user_roles` table
4. Check browser console for errors

**Database Errors?**
- Check Supabase project is active (remote) or Docker is running (local)
- Verify RLS policies are enabled
- Check user role permissions
- Review logs: Supabase Dashboard → Logs → Database

**Import Not Working?**
- Ensure JSON format matches expected structure
- Check user has `scheduling` role
- Verify all referenced entities exist
- Check console for validation errors

**Port Already in Use**
```bash
# Stop Supabase
pnpm db:stop

# Start again
pnpm db:start
```

**Docker Not Running (Local)**
- Start Docker Desktop first
- Then run: `pnpm db:start`

**Email Verification Issues (Local)**
- Check Mailpit: http://127.0.0.1:54324
- All emails are captured here (no real emails sent locally)
- Click confirmation links from Mailpit interface

**Role Not Assigned After Registration**
- Check `user_roles` table in database
- Verify registration form included role selection
- For manual assignment, see SQL in Quick Start section

**"No Role Assigned" Error**
- User exists in Supabase auth but not in `user_roles` table
- Solution: Add user to `user_roles` table with appropriate role

**Faculty Dashboard Shows "Profile Not Linked"**
- Faculty user doesn't have matching instructor record
- Solution: Create instructor with email matching the faculty user's email

**Navigation Items Not Showing**
- Role not properly assigned or auth context not loading
- Check browser console, verify role in database

**Redirect Loop**
- User role doesn't match expected role for dashboard
- Verify role enum value matches exactly (lowercase, underscores)

---

## Design System

### Brand Philosophy

SmartSchedule embodies **intelligence, precision, and trust** for academic scheduling. The design system reflects these values through:

- **Intelligence**: Clean, sophisticated interfaces that communicate smart automation
- **Precision**: Exact spacing, clear hierarchy, and purposeful design decisions
- **Trust**: Professional aesthetics with accessible, WCAG-compliant color choices

### Color System

#### Primary Palette

**Blue Scale** - Primary brand color conveying trust and professionalism
- `blue-500`: `hsl(210 75% 50%)` - Primary brand color
- `blue-600`: `hsl(210 80% 42%)` - Primary hover states

**Slate Scale** - Neutral tones for hierarchy and structure
- `slate-50`: `hsl(210 20% 98%)` - Page backgrounds (light)
- `slate-600`: `hsl(210 14% 40%)` - Primary text (light mode)

**Teal Scale** - Accent color for energy
- `teal-500`: `hsl(180 65% 45%)` - Accent highlights

**Purple Scale** - Primary hover states
- `purple-500`: `hsl(270 70% 50%)` - Primary hover color

**Indigo Scale** - Secondary/Navigation hover states
- `indigo-500`: `hsl(240 60% 50%)` - Secondary hover color

#### Semantic Colors

- **Success** - Emerald: `hsl(145 65% 45%)`
- **Warning** - Amber: `hsl(38 92% 50%)`
- **Error** - Red: `hsl(0 72% 51%)`
- **Info** - Sky Blue: `hsl(200 95% 50%)`

### Typography

**Primary Font**: Inter (sans-serif)
- Headings, body text, UI elements
- Excellent readability at all sizes

**Monospace Font**: JetBrains Mono
- Code snippets, technical content

### Spacing System

Based on 4px increments:
- `1` = 4px - Tight element spacing
- `2` = 8px - Small gaps
- `4` = 16px - Default component spacing
- `6` = 24px - Section spacing
- `8` = 32px - Large section spacing

### Component Patterns

#### Buttons

**Primary**: Blue background, purple hover
```tsx
<Button className="bg-blue-600 hover:bg-purple-600 text-white">
```

**Secondary**: Slate background, indigo hover
```tsx
<Button variant="secondary">
```

#### Cards

Standard card with modern styling:
```tsx
<Card className="rounded-lg shadow-sm border-slate-200">
  <CardHeader>
    <CardTitle className="text-xl font-semibold">
  </CardHeader>
  <CardContent>
```

### Design Principles

1. **Clarity First** - Every element serves a purpose
2. **Consistent Hierarchy** - Clear visual hierarchy through size, weight, and color
3. **Predictable Interactions** - Similar actions look and behave similarly
4. **Responsive by Default** - Design mobile-first, enhance for larger screens
5. **Accessible Always** - Contrast ratios, keyboard navigation, screen reader support
6. **Performance Matters** - Optimize images, lazy load components

---

## Additional Resources

### Documentation Files

- **PRD.md** - Product Requirements Document
- **timeline.md** - Development timeline and progress
- **IMPLEMENTATION_ANALYSIS.md** - Comprehensive analysis report
- **API_REFERENCE.md** - Complete API documentation
- **MIGRATION_GUIDE.md** - Frontend migration guide
- **VERCEL_DEPLOYMENT.md** - Deployment guide

### Related Documentation

- **src/docs/LOCAL_DEVELOPMENT.md** - Local development guide
- **src/docs/ROLE_IMPLEMENTATION_SUMMARY.md** - Role-based access control
- **src/docs/RLS_FIX_SUMMARY.md** - Row Level Security implementation
- **src/docs/TESTING_USER_REGISTRATION.md** - Testing guidelines
- **src/docs/ELECTIVE_PREFERENCES_SUMMARY.md** - Elective preferences system
- **src/docs/EXAMS_IMPLEMENTATION_SUMMARY.md** - Exams management
- **src/docs/FACULTY_FEATURES_SUMMARY.md** - Faculty features
- **src/docs/SWE_SCHEDULING_SCOPE.md** - Scheduling scope documentation
- **src/docs/ELECTIVE_ENROLLMENT_RULES.md** - Enrollment rules
- **src/docs/ONBOARDING_SYSTEM.md** - User onboarding system
- **src/docs/SEED_DATA_GUIDE.md** - Seed data documentation
- **src/docs/ENVIRONMENT_CONFIGURATION.md** - Environment setup
- **src/docs/PRODUCTION_DEPLOYMENT.md** - Production deployment
- **src/docs/DESIGN_SYSTEM.md** - Complete design system
- **SUPABASE_CLI_GUIDE.md** - Supabase CLI reference
- **STUDENT_GROUP_MANAGEMENT.md** - Student group management

---

**Version**: V1 (Production Ready - 95% Complete)  
**Last Updated**: October 29, 2025  
**Status**: ✅ Ready for Production Deployment

