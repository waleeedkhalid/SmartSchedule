# System Architecture

> **Last Updated:** 2025-10-24

This document provides a high-level overview of the SmartSchedule system architecture, including technology stack, system components, data flow, and integration points.

---

## Architecture Overview

SmartSchedule is a full-stack web application built with modern technologies, following a three-tier architecture pattern:

```
┌──────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                       │
│                                                               │
│  Browser / Client                                             │
│  - Next.js Client Components (React 19)                       │
│  - shadcn/ui + Tailwind CSS                                  │
│  - SWR data fetching/cache                                    │
│  - Supabase Client (Auth UI)                                 │
└───────────────────┬──────────────────────────────────────────┘
                    │ HTTP (App Router) + Cookies (SSR)
                    │
┌───────────────────┴──────────────────────────────────────────┐
│                      APPLICATION LAYER                        │
│                                                               │
│  Next.js 15 (App Router)                                     │
│  - Server Components (data orchestration)                    │
│  - Middleware (role-based guards, redirects)                 │
│  - API Routes (/app/api/*) with Zod validation              │
│  - Layout/Providers (Theme, Toast, SWR, Auth)                │
│  - Role-based pages (student/faculty/committee)              │
└───────────────────┬──────────────────────────────────────────┘
                    │ Supabase JS SDK
                    │
┌───────────────────┴──────────────────────────────────────────┐
│                         DATA LAYER                            │
│                                                               │
│  Supabase                                                    │
│  - PostgreSQL Database                                       │
│  - Authentication & Sessions                                 │
│  - Row Level Security (RLS)                                  │
│  - Real-time capabilities                                    │
└──────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Framework** | Next.js 15 (App Router) | Full-stack React framework with SSR/SSG |
| **Language** | TypeScript | Type-safe development |
| **UI Library** | shadcn/ui + Radix UI | Accessible component primitives |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Icons** | Lucide React | Icon library |
| **Data Fetching** | SWR | React Hooks for data fetching |
| **Forms** | React Hook Form + Zod | Form handling and validation |
| **State** | React Context + Hooks | Client-side state management |

### Backend

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Runtime** | Node.js | JavaScript runtime |
| **API** | Next.js API Routes | Serverless API endpoints |
| **Validation** | Zod | Schema validation |
| **Authentication** | Supabase Auth | User authentication & sessions |
| **Database Client** | Supabase JS Client | Database operations |

### Database

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Database** | PostgreSQL | Relational database |
| **Platform** | Supabase | Backend-as-a-Service |
| **Security** | Row Level Security (RLS) | Database-level access control |
| **Extensions** | pgcrypto, uuid-ossp | Cryptographic functions & UUID generation |

### DevOps & Deployment

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Hosting** | Vercel | Application hosting |
| **CI/CD** | Vercel (automated) | Continuous deployment |
| **Testing** | Vitest | Unit and integration testing |
| **Linting** | ESLint | Code quality |
| **Package Manager** | npm | Dependency management |

---

## System Components

### 1. Authentication System

**Location:** `src/components/auth/`, `src/app/api/auth/`

**Components:**
- `AuthProvider` - Global authentication state
- `AuthDialog` - Sign in/Sign up modal
- `NavAuth` - Header authentication UI

**Flow:**
1. User enters credentials
2. API validates with Supabase Auth
3. Session created (cookie-based)
4. User profile upserted to `users` table
5. Role-based redirect

**Security:**
- Password hashing (Supabase Auth)
- Email verification
- Session cookies (HTTP-only, secure)
- Row-level security policies

---

### 2. Role-Based Access Control

**Middleware:** `src/app/middleware.ts`

**Roles:**
- `student` - Students selecting courses and viewing schedules
- `faculty` - Faculty members setting availability
- `scheduling_committee` - Schedule generation and management
- `teaching_load_committee` - Faculty assignment to sections
- `registrar` - Exam scheduling and academic calendar

**Access Control:**
- Middleware intercepts all requests
- Validates session
- Checks user role
- Enforces route-role mapping
- Redirects unauthorized access

---

### 3. Student Portal

**Location:** `src/app/student/`, `src/components/student/`

**Features:**
- Dashboard with schedule overview
- Elective course selection with preference ranking
- Schedule viewing (class and exam schedules)
- Feedback submission
- Profile management

**Data Flow:**
```
Student → Browse Electives → Select & Rank → Submit Preferences
       ↓
   Database (student_electives table)
       ↓
Schedule Generator reads preferences → Generate Schedule
       ↓
   Database (schedules table)
       ↓
Student views final schedule
```

---

### 4. Faculty Portal

**Location:** `src/app/faculty/`, `src/components/faculty/`

**Features:**
- Teaching schedule view
- Availability preferences setting
- Course assignment view

**Data Flow:**
```
Faculty → Set Availability → Submit Preferences
       ↓
   Database (faculty_availability table - assumed)
       ↓
Teaching Load Committee assigns faculty
       ↓
   Database (section.instructor_id)
       ↓
Faculty views teaching schedule
```

---

### 5. Committee Portal

**Location:** `src/app/committee/`, `src/components/committee/`

#### Scheduling Committee
**Features:**
- Course catalog management
- Schedule generation
- Conflict detection & resolution
- Student preference review
- Schedule publishing

**Core Algorithm:** `src/lib/schedule/`
- `ScheduleGenerator.ts` - Main generation logic
- `ConflictChecker.ts` - Time/room conflict detection
- `TimeSlotManager.ts` - Time slot allocation
- `ScheduleDataCollector.ts` - Data aggregation

#### Teaching Load Committee
**Features:**
- Faculty workload overview
- Section-to-faculty assignment
- Load balancing
- Availability review

#### Registrar
**Features:**
- Exam schedule management
- Academic calendar
- Student enrollment oversight

---

### 6. Schedule Generation System

**Location:** `src/lib/schedule/`

**Algorithm Components:**

1. **Data Collection** (`ScheduleDataCollector.ts`)
   - Collects courses, students, faculty, rooms
   - Gathers constraints and preferences
   
2. **Conflict Checking** (`ConflictChecker.ts`)
   - Detects time conflicts
   - Validates room availability
   - Checks faculty availability
   
3. **Time Slot Management** (`TimeSlotManager.ts`)
   - Manages available time slots
   - Allocates time slots to sections
   
4. **Schedule Generation** (`ScheduleGenerator.ts`)
   - Main algorithm implementation
   - Constraint satisfaction
   - Optimization based on preferences

**Constraints:**
- No time conflicts for students
- No room double-booking
- Faculty availability respected
- Course prerequisites enforced
- Credit hour limits
- University policies (days, times, etc.)

---

## Data Flow Diagrams

### Authentication Flow

```
[User] → [Login Page] → POST /api/auth/sign-in
                              ↓
                     [Validate Credentials]
                              ↓
                       [Create Session]
                              ↓
                    [Upsert User Profile]
                              ↓
                    [Determine User Role]
                              ↓
                    [Role-Based Redirect]
                              ↓
              student → /student/dashboard
              faculty → /faculty/dashboard
              committee → /committee/{type}/dashboard
```

### Student Elective Selection Flow

```
[Student] → [Browse Electives]
                   ↓
          [Filter & Search]
                   ↓
         [Select Courses]
                   ↓
       [Rank Preferences]
                   ↓
        [Review & Confirm]
                   ↓
   POST /api/student/preferences
                   ↓
      [Save to Database]
                   ↓
    [student_electives table]
                   ↓
     [Confirmation Screen]
```

### Schedule Generation Flow

```
[Committee] → [Initiate Generation]
                      ↓
         [Collect All Data]
            ↓         ↓        ↓
        [Courses] [Students] [Faculty]
                      ↓
            [Collect Constraints]
                      ↓
         [Run Generation Algorithm]
                      ↓
            [Check for Conflicts]
                      ↓
              Conflicts? 
             /          \
          Yes           No
           ↓             ↓
    [Resolve]      [Publish]
           ↓             ↓
    [Re-generate]  [schedules table]
                         ↓
                   [Notify Users]
```

---

## Security Model

### Authentication & Authorization

1. **Session Management**
   - Cookie-based sessions (HTTP-only, Secure, SameSite)
   - Automatic expiration
   - Server-side validation

2. **Row Level Security (RLS)**
   - Database-level access control
   - User can only access their own data
   - Committee members have elevated permissions
   - Policies defined in `main.sql`

3. **API Route Protection**
   - All routes validate authentication
   - Role-based authorization checks
   - Input validation with Zod schemas

4. **Middleware Protection**
   - Route-level authentication
   - Role-based route access
   - Automatic redirects for unauthorized access

### Data Protection

1. **Sensitive Data**
   - Passwords: Hashed by Supabase Auth (bcrypt)
   - Personal information: Protected by RLS
   - Session tokens: HTTP-only cookies

2. **Input Validation**
   - All API inputs validated with Zod
   - SQL injection prevention (parameterized queries)
   - XSS protection (React escaping)

---

## Integration Points

### Supabase Integration

**Configuration:** `src/lib/supabase/`

1. **Client-Side** (`client.ts`)
   - Browser authentication
   - Real-time subscriptions
   - Public data queries

2. **Server-Side** (`server.ts`)
   - API route data access
   - Server component queries
   - Admin operations

3. **Middleware** (`middleware.ts`)
   - Session validation
   - Role determination
   - SSR authentication

### External Services

Currently none, but designed for:
- Email notifications (future)
- SMS alerts (future)
- Calendar integration (future)
- File storage (future)

---

## Scalability Considerations

### Current Architecture

- **Vercel Edge Network**: Global CDN
- **Serverless Functions**: Auto-scaling API routes
- **Supabase**: Managed PostgreSQL with connection pooling
- **Static Generation**: Pre-rendered pages where possible

### Performance Optimizations

1. **Frontend**
   - Code splitting
   - Lazy loading components
   - Image optimization
   - CSS purging

2. **Backend**
   - Database indexes on frequently queried columns
   - Connection pooling
   - Query optimization

3. **Caching**
   - SWR client-side caching
   - Static page generation
   - API response caching (future)

---

## Monitoring & Observability

### Current Setup

- **Vercel Analytics**: Page views and performance
- **Console Logging**: Development debugging
- **Error Boundaries**: React error handling

### Future Enhancements

- Application Performance Monitoring (APM)
- Error tracking (e.g., Sentry)
- Database query monitoring
- User analytics

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Vercel Platform                    │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │           Edge Network (CDN)                   │ │
│  │  - Static assets                               │ │
│  │  - Images                                      │ │
│  │  - CSS/JS bundles                              │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │      Serverless Functions                      │ │
│  │  - API Routes (/api/*)                         │ │
│  │  - Server Components                           │ │
│  │  - Middleware                                  │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└──────────────────┬───────────────────────────────────┘
                   │ HTTPS
                   │
┌──────────────────┴───────────────────────────────────┐
│                   Supabase                            │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │          PostgreSQL Database                    │ │
│  │  - Tables with RLS                              │ │
│  │  - Indexes                                      │ │
│  │  - Triggers & Functions                         │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
│  ┌─────────────────────────────────────────────────┐ │
│  │          Authentication Service                 │ │
│  │  - User management                              │ │
│  │  - Session handling                             │ │
│  │  - Email verification                           │ │
│  └─────────────────────────────────────────────────┘ │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## Development Workflow

### Local Development

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Lint code
npm run lint

# Build for production
npm run build
```

### Deployment Process

1. Push to main branch
2. Vercel automatic build triggered
3. Build and test
4. Deploy to production
5. Automatic rollback on failure

---

## API Architecture

### REST API Design

**Base URL:** `/api`

**Conventions:**
- RESTful endpoints
- JSON request/response bodies
- HTTP status codes
- Consistent error format

**Response Format:**
```typescript
// Success
{ success: true, data: {...} }

// Error
{ success: false, error: "message", details?: {...} }
```

**Authentication:**
- Cookie-based sessions
- Validated on every request
- Middleware-enforced

---

## Database Schema

See [Database Schema Overview](../schema/overview.md) for complete documentation.

**Key Design Principles:**
- Normalized tables (3NF)
- Foreign key constraints
- Row Level Security on all tables
- Audit logging via triggers
- Optimized indexes

---

*This document provides a high-level overview. For detailed implementation information, see the specific component documentation in this repository.*

