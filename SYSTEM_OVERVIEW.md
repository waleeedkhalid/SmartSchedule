# SmartSchedule - System Overview Documentation

**Version**: 1.0  
**Last Updated**: November 30, 2025  
**Status**: Production Ready (V1)

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Requirements](#2-system-requirements)
3. [User Roles & Personas](#3-user-roles--personas)
4. [System Architecture](#4-system-architecture)
5. [Database Design](#5-database-design)
6. [Core Features](#6-core-features)
7. [System Diagrams](#7-system-diagrams)
8. [Security Model](#8-security-model)
9. [Future Roadmap](#9-future-roadmap)

---

## 1. Introduction

### 1.1 What is SmartSchedule?

SmartSchedule is a conflict-free teaching and exam scheduling web application designed specifically for the Software Engineering (SWE) department. The system automates the generation of optimal course schedules while managing student enrollments, tracking faculty preferences, and providing role-based dashboards for all university stakeholders.

### 1.2 Key Objectives

| Goal   | Description                                                   |
| ------ | ------------------------------------------------------------- |
| **G1** | Produce conflict-free schedules for lectures, labs, and exams |
| **G2** | Enable fast edits with live conflict detection                |
| **G3** | Deliver comprehensive analytics dashboards                    |
| **G4** | Capture student elective preferences and feedback             |

### 1.3 Performance Targets

- **Zero clashes** in released schedules (room, instructor, student conflicts)
- **≤10 seconds** for one-click schedule recommendation
- **≤2 seconds** for dashboard load times
- **Sub-50ms** database queries with 87%+ cache hit rate

### 1.4 Scheduling Scope

The scheduling algorithm manages **SWE department courses in levels 4-8 only**:

| Category                                    | Scheduling Method                              |
| ------------------------------------------- | ---------------------------------------------- |
| SWE Courses (Levels 4-8)                    | Automated by constraint satisfaction algorithm |
| External Courses (MATH, CSC, CEN, IS, etc.) | Pre-scheduled, maintained as reference data    |
| Foundation SWE (Levels 1-3)                 | Pre-scheduled, not managed by algorithm        |

Students see a combined schedule view with both algorithm-scheduled and pre-scheduled courses.

---

## 2. System Requirements

### 2.1 Functional Requirements

#### Must-Have (V1 - Implemented)

| #   | Requirement                                                                          | Status      |
| --- | ------------------------------------------------------------------------------------ | ----------- |
| 1   | **Authentication & RBAC** - Supabase Auth with 5 roles and Row Level Security        | ✅ Complete |
| 2   | **Data Intake** - CRUD forms + JSON import/export for core datasets                  | ✅ Complete |
| 3   | **Scheduler** - One-click recommendation respecting rules and preventing collisions  | ✅ Complete |
| 4   | **Manual Editing** - Form edits with instant conflict detection                      | ✅ Complete |
| 5   | **Comment System** - Feedback system for all roles                                   | ✅ Complete |
| 6   | **Notifications** - In-app alerts on comments and schedule changes                   | ✅ Complete |
| 7   | **Dashboards** - Level Overview and Course Overview with Chart.js                    | ✅ Complete |
| 8   | **Student Portal** - Elective registration, schedule view, exam timetable            | ✅ Complete |
| 9   | **Faculty Portal** - Self-registration, availability preferences, personal timetable | ✅ Complete |
| 10  | **Registrar Features** - Irregular student management, manual registration           | ✅ Complete |

#### Future Enhancements (V2 - Planned)

- Real-time collaborative editing with Yjs
- Version history with jsondiffpatch and named releases
- AI chatbot for schedule insights
- CSV import/export
- Instructor preference learning (ML-based)
- Email notifications

### 2.2 Non-Functional Requirements

| Aspect            | Requirement                                                    |
| ----------------- | -------------------------------------------------------------- |
| **Performance**   | Recommendation ≤10s, Dashboard load ≤2s                        |
| **Scalability**   | Single department scale; ~hundreds of sections                 |
| **Security**      | Supabase RLS; least-privilege policies; audit fields           |
| **Reliability**   | Autosave drafts; optimistic UI with retry                      |
| **Usability**     | Simple forms; minimal required fields; clear conflict messages |
| **Portability**   | JSON import/export as system boundary                          |
| **Accessibility** | ARIA labels, keyboard navigation, responsive design            |

---

## 3. User Roles & Personas

### 3.1 Role Definitions

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         USER ROLES HIERARCHY                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🟣 SCHEDULING COMMITTEE (Admin)                                        │
│     └─ Full system control, schedule generation, all management         │
│                                                                         │
│  🔵 TEACHING LOAD COMMITTEE                                             │
│     └─ Instructor workload management and section assignment            │
│                                                                         │
│  🔴 REGISTRAR                                                           │
│     └─ Irregular students, manual registration, final validation        │
│                                                                         │
│  🟢 FACULTY                                                             │
│     └─ Personal schedule, availability preferences, feedback            │
│                                                                         │
│  🟡 STUDENT                                                             │
│     └─ Elective registration, schedule viewing, feedback                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Permission Matrix

| Capability                       | Scheduling | Teaching Load | Registrar | Faculty | Student |
| -------------------------------- | :--------: | :-----------: | :-------: | :-----: | :-----: |
| Generate schedule recommendation |     ✅     |      ❌       |    ❌     |   ❌    |   ❌    |
| Manage all data (CRUD)           |     ✅     |      ❌       |    ❌     |   ❌    |   ❌    |
| JSON import/export               |     ✅     |      ❌       |    ❌     |   ❌    |   ❌    |
| Edit section assignments         |     ✅     |      ✅       |    ❌     |   ❌    |   ❌    |
| Review instructor loads          |     ✅     |      ✅       |    ❌     |   ❌    |   ❌    |
| Manage irregular students        |     ❌     |      ❌       |    ✅     |   ❌    |   ❌    |
| Manual student registration      |     ❌     |      ❌       |    ✅     |   ❌    |   ❌    |
| Set availability preferences     |     ❌     |      ❌       |    ❌     |   ✅    |   ❌    |
| View personal timetable          |     ✅     |      ✅       |    ✅     |   ✅    |   ✅    |
| Register for electives           |     ❌     |      ❌       |    ❌     |   ❌    |   ✅    |
| Submit comments/feedback         |     ✅     |      ✅       |    ✅     |   ✅    |   ✅    |

### 3.3 User Journeys

#### Scheduling Committee Journey

```
Import JSON/Create Data → Define Rules → Click "Recommend" → Review Conflicts
    → Manual Tweaks → Create Named Release → Publish Schedule
```

#### Student Journey

```
Sign In → Complete Onboarding (Set Level) → Register for Electives
    → View Level-Based Schedule → View Exam Timetable → Submit Feedback
```

#### Faculty Journey

```
Self-Register → Auto-Create Instructor Profile → Set Availability Preferences
    → View Personal Timetable → Add Feedback/Constraints
```

#### Registrar Journey

```
Manage Irregular Students (Custom Course Lists)
    → Manual Registration (Bypass Validation) → Final Validation
```

---

## 4. System Architecture

### 4.1 Technology Stack

| Layer                  | Technology                                      |
| ---------------------- | ----------------------------------------------- |
| **Frontend**           | Next.js 15 (App Router), React 19, TypeScript   |
| **UI Components**      | shadcn/ui, Radix UI, Tailwind CSS, Lucide Icons |
| **State Management**   | Zustand stores                                  |
| **Forms & Validation** | React Hook Form + Zod                           |
| **Backend**            | Supabase (PostgreSQL + Auth + RLS)              |
| **Charts & Analytics** | Chart.js v4.5.1, react-chartjs-2                |
| **Animations**         | Framer Motion                                   |
| **Notifications**      | Sonner (toast notifications)                    |

### 4.2 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                │
│    │  Web Client  │  │  PWA Client  │  │ Mobile API   │                │
│    │  (Next.js)   │  │  (React)     │  │ (Future)     │                │
│    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘                │
│           │                 │                 │                         │
└───────────┼─────────────────┼─────────────────┼─────────────────────────┘
            │                 │                 │
            ▼                 ▼                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│    ┌─────────────────────────────────────────────────────────────┐     │
│    │                    Next.js API Routes                        │     │
│    │  /api/courses  /api/sections  /api/scheduling  /api/data    │     │
│    │  /api/rooms    /api/exams     /api/student     /api/faculty │     │
│    └─────────────────────────┬───────────────────────────────────┘     │
│                              │                                          │
│    ┌─────────────────────────┴───────────────────────────────────┐     │
│    │                   Database Access Layer                      │     │
│    │              (lib/db/*.ts - 15 modules)                     │     │
│    └─────────────────────────┬───────────────────────────────────┘     │
│                              │                                          │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATA LAYER                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│    ┌──────────────────────────────────────────────────────────────┐    │
│    │                      SUPABASE                                 │    │
│    │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │    │
│    │  │ PostgreSQL  │  │    Auth     │  │    RLS      │          │    │
│    │  │  Database   │  │   Service   │  │  Policies   │          │    │
│    │  └─────────────┘  └─────────────┘  └─────────────┘          │    │
│    └──────────────────────────────────────────────────────────────┘    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Project Structure

```
SmartSchedule/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Authentication pages
│   │   ├── login/
│   │   ├── register/
│   │   └── onboarding/
│   ├── (dashboard)/dashboard/    # Main application
│   │   ├── scheduling/           # Scheduling Committee dashboard
│   │   ├── teaching-load/        # Teaching Load dashboard
│   │   ├── faculty/              # Faculty dashboard
│   │   ├── student/              # Student dashboard
│   │   ├── registrar/            # Registrar dashboard
│   │   ├── courses/              # Course management
│   │   ├── rooms/                # Room management
│   │   ├── sections/             # Section management
│   │   ├── exams/                # Exam management
│   │   └── import-export/        # Bulk data operations
│   ├── api/                      # REST API routes
│   └── mobile/                   # PWA mobile client
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   └── *.tsx                     # Feature components
├── lib/                          # Shared utilities
│   ├── db/                       # Database queries (15 modules)
│   ├── scheduling/               # Scheduling algorithm
│   ├── stores/                   # Zustand state stores
│   └── types/                    # TypeScript types
├── supabase/                     # Supabase configuration
│   └── migrations/               # SQL migration files
└── public/                       # Static assets
```

### 4.4 Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    User      │     │  Middleware  │     │   Supabase   │
│   Browser    │     │  (Next.js)   │     │     Auth     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │  1. Login Request  │                    │
       │───────────────────>│                    │
       │                    │  2. Authenticate   │
       │                    │───────────────────>│
       │                    │                    │
       │                    │  3. JWT Token      │
       │                    │<───────────────────│
       │                    │                    │
       │  4. Set Cookies    │                    │
       │<───────────────────│                    │
       │                    │                    │
       │  5. Each Request   │                    │
       │───────────────────>│  6. Refresh Token  │
       │                    │<──────────────────>│
       │                    │                    │
       │  7. Protected      │                    │
       │     Content        │                    │
       │<───────────────────│                    │
       │                    │                    │
```

---

## 5. Database Design

### 5.1 Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       DATABASE ENTITY RELATIONSHIPS                     │
└─────────────────────────────────────────────────────────────────────────┘

    ┌───────────────┐          ┌───────────────┐
    │  auth.users   │          │  user_roles   │
    │   (Supabase)  │◄─────────│               │
    └───────────────┘   1:1    │  role, level  │
                               │  department   │
                               └───────────────┘
                                      │
                                      │ 1:N (if student)
                                      ▼
                               ┌───────────────┐
                               │student_group  │
                               │  level, size  │
                               └───────────────┘
                                      │
                                      │ 1:N
                                      ▼
    ┌───────────────┐          ┌───────────────┐          ┌───────────────┐
    │    course     │◄─────────│    section    │─────────►│   instructor  │
    │  code, title  │   N:1    │  section_no   │   N:1    │  name, email  │
    │  level, type  │          │  capacity     │          │  preferences  │
    └───────────────┘          │  meeting_pat  │          └───────────────┘
           │                   └───────────────┘
           │                          │
           │ 1:N                      │ N:1
           ▼                          ▼
    ┌───────────────┐          ┌───────────────┐
    │     exam      │          │     room      │
    │  date, time   │          │  code, type   │
    │  duration     │          │  capacity     │
    └───────────────┘          └───────────────┘

    ┌───────────────┐          ┌───────────────┐
    │   student_    │          │   schedule_   │
    │   enrollment  │          │    comment    │
    │  student_id   │          │  author, text │
    │  section_id   │          │  section_id?  │
    │  status       │          │  is_resolved  │
    └───────────────┘          └───────────────┘
```

### 5.2 Core Tables

| Table                  | Purpose                               | Key Fields                                             |
| ---------------------- | ------------------------------------- | ------------------------------------------------------ |
| **user_roles**         | User profiles extending Supabase auth | role, name, email, level, department                   |
| **course**             | Course catalog                        | code (PK), title, level, credits, is_elective          |
| **section**            | Course sections with meeting times    | course_code, instructor_id, room_code, meeting_pattern |
| **instructor**         | Teaching staff                        | name, email, preferred_times, max_load                 |
| **room**               | Physical spaces                       | code (PK), type (Lecture/Lab), capacity                |
| **student_group**      | Student cohorts by level              | level, size, name                                      |
| **exam**               | Exam schedules                        | course_code, date, start_time, room_codes              |
| **student_enrollment** | Student section registrations         | student_id, section_id, status, enrollment_type        |
| **schedule_comment**   | Feedback system                       | author_id, section_id, text, is_resolved               |
| **notification**       | In-app alerts                         | user_id, type, payload, read_at                        |
| **time_grid_config**   | Scheduling parameters                 | teaching_days, daily_start/end, slot_duration          |

### 5.3 Key Data Structures

#### Meeting Pattern (JSONB)

```json
{
  "days": ["sunday", "tuesday", "thursday"],
  "start_time": "09:00",
  "duration_minutes": 90,
  "is_lab": false
}
```

#### Instructor Preferences (JSONB)

```json
{
  "preferred_times": [{ "day": "sunday", "start": "08:00", "end": "12:00" }],
  "unavailable_times": [{ "day": "thursday", "start": "14:00", "end": "17:00" }]
}
```

### 5.4 Enrollment Model

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        STUDENT ENROLLMENT MODEL                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  REQUIRED COURSES                    ELECTIVE COURSES                   │
│  ─────────────────                   ────────────────                   │
│  • Auto-enrolled based on level      • Manual registration              │
│  • All students in same level        • ≤20 total credits constraint     │
│    get same required courses         • Section capacity limits          │
│  • No student action needed          • Prerequisites checked            │
│                                                                         │
│  ┌──────────────┐                   ┌──────────────┐                   │
│  │   Level 4    │                   │   Elective   │                   │
│  │   Student    │                   │   Catalog    │                   │
│  └──────┬───────┘                   └──────┬───────┘                   │
│         │                                  │                            │
│         │ Auto-Enroll                      │ Manual Register            │
│         ▼                                  ▼                            │
│  ┌──────────────┐                   ┌──────────────┐                   │
│  │ SWE 311      │                   │ ML Elective  │                   │
│  │ SWE 312      │                   │ Security El. │                   │
│  │ MATH 244     │                   │ Data Science │                   │
│  └──────────────┘                   └──────────────┘                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Core Features

### 6.1 Scheduling Algorithm

The system uses a **Greedy Constraint Satisfaction Algorithm** with priority-based assignment:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      SCHEDULING ALGORITHM FLOW                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1. PRIORITIZE SECTIONS                                                 │
│     ┌──────────────────────────────────────────────────────────┐       │
│     │ Sort by: Constraints Count → Student Count → Credits    │       │
│     └──────────────────────────────────────────────────────────┘       │
│                              │                                          │
│                              ▼                                          │
│  2. FOR EACH SECTION                                                    │
│     ┌──────────────────────────────────────────────────────────┐       │
│     │ a. Find available time slots                             │       │
│     │ b. Check instructor availability                         │       │
│     │ c. Check room availability                               │       │
│     │ d. Check student-level conflicts                         │       │
│     │ e. Assign best fit or report conflict                    │       │
│     └──────────────────────────────────────────────────────────┘       │
│                              │                                          │
│                              ▼                                          │
│  3. CONFLICT RESOLUTION                                                 │
│     ┌──────────────────────────────────────────────────────────┐       │
│     │ Priority: Student Clashes > Instructor > Room > Prefs   │       │
│     └──────────────────────────────────────────────────────────┘       │
│                              │                                          │
│                              ▼                                          │
│  4. OUTPUT                                                              │
│     ┌──────────────────────────────────────────────────────────┐       │
│     │ Assigned Sections + Unresolved Conflicts List            │       │
│     └──────────────────────────────────────────────────────────┘       │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Scheduling Rules

- No student group clashes across courses in the same level
- No instructor clashes (same instructor, same time)
- Room uniqueness (one room, one meeting at a time)
- Labs must be contiguous when flagged
- Exams observe minimum spacing per student group and instructor

### 6.2 Analytics Dashboards

#### Level Overview Dashboard

- **Summary Cards**: Total courses, sections, active instructors, conflicts
- **Distribution Charts**: Courses & sections by level, instructor allocation
- **Efficiency Metrics**: Sections per course ratio, level detail cards
- **Workload Analysis**: Credit hours per instructor by level
- **Conflict Tracking**: Conflicts by level with alert banner

#### Course Overview Dashboard

- **Summary Cards**: Total courses, sections, completion rate, status
- **Course Distribution**: Elective vs Required breakdown
- **Top Courses**: Highest section count courses
- **Utilization Metrics**: Assignment status, draft vs released
- **Searchable Course List**: Detailed info per course

#### Scheduling Committee Analytics

- **Elective Preferences**: Top 10 most-requested electives
- **Scheduling Progress**: Assignment completion tracking
- **Faculty Availability**: Preference submission status
- **Room Utilization**: Type distribution and usage
- **Instructor Workload**: Overloaded/balanced/underutilized
- **Timeline Distribution**: Time slot and day-of-week patterns

### 6.3 Student Features

| Feature                   | Description                                                              |
| ------------------------- | ------------------------------------------------------------------------ |
| **Elective Registration** | Manual enrollment with validation (≤20 credits, capacity, prerequisites) |
| **Level-Based Schedule**  | Auto-enrolled required courses + manually registered electives           |
| **Exam Timetable**        | View exam schedule with conflict detection                               |
| **Dual-Layer Comments**   | General schedule feedback + section-specific comments                    |
| **Credit Tracking**       | Real-time credit count and constraint validation                         |
| **Enrollment Management** | Register/drop electives                                                  |

### 6.4 Faculty Features

| Feature                | Description                                      |
| ---------------------- | ------------------------------------------------ |
| **Self-Registration**  | Create account with automatic instructor profile |
| **Availability Grid**  | Set preferred/unavailable time slots (Sun-Thu)   |
| **Personal Timetable** | View assigned teaching schedule                  |
| **Feedback System**    | Comment on assignments and constraints           |

### 6.5 Registrar Features

| Feature                 | Description                                           |
| ----------------------- | ----------------------------------------------------- |
| **Irregular Students**  | Define custom required course lists for special cases |
| **Manual Registration** | Register students in sections with validation bypass  |
| **Final Validation**    | Review and approve schedule before publication        |

### 6.6 Import/Export System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA IMPORT/EXPORT FLOW                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  IMPORT                               EXPORT                            │
│  ──────                               ──────                            │
│  ┌───────────────┐                   ┌───────────────┐                 │
│  │  JSON File    │                   │  Select       │                 │
│  │  Upload       │                   │  Entities     │                 │
│  └───────┬───────┘                   └───────┬───────┘                 │
│          │                                   │                          │
│          ▼                                   ▼                          │
│  ┌───────────────┐                   ┌───────────────┐                 │
│  │  Validation   │                   │  Generate     │                 │
│  │  & Preview    │                   │  JSON         │                 │
│  └───────┬───────┘                   └───────┬───────┘                 │
│          │                                   │                          │
│          ▼                                   ▼                          │
│  ┌───────────────┐                   ┌───────────────┐                 │
│  │  Bulk Insert  │                   │  Download     │                 │
│  │  to Database  │                   │  File         │                 │
│  └───────────────┘                   └───────────────┘                 │
│                                                                         │
│  Supported Entities:                                                    │
│  • Courses        • Rooms          • Instructors                       │
│  • Sections       • Exams          • Student Groups                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. System Diagrams

### 7.1 Complete Data Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         SMARTSCHEDULE DATA FLOW                         │
└─────────────────────────────────────────────────────────────────────────┘

                          ┌─────────────────┐
                          │  JSON Import    │
                          │  (Bulk Data)    │
                          └────────┬────────┘
                                   │
                                   ▼
┌──────────────┐           ┌───────────────┐           ┌──────────────┐
│   Faculty    │           │               │           │  Scheduling  │
│  (Set Prefs) │──────────>│   DATABASE    │<──────────│  Committee   │
└──────────────┘           │               │           │ (CRUD/Rules) │
                           │  ┌─────────┐  │           └──────────────┘
┌──────────────┐           │  │ Courses │  │
│   Students   │           │  │ Sections│  │           ┌──────────────┐
│  (Register)  │──────────>│  │ Rooms   │  │<──────────│ Teaching     │
└──────────────┘           │  │ Faculty │  │           │ Load (Edit)  │
                           │  │ Exams   │  │           └──────────────┘
┌──────────────┐           │  └─────────┘  │
│  Registrar   │           │               │           ┌──────────────┐
│  (Override)  │──────────>│               │<──────────│  JSON Export │
└──────────────┘           └───────┬───────┘           │  (Backup)    │
                                   │                   └──────────────┘
                                   │
                    ┌──────────────┼──────────────┐
                    │              │              │
                    ▼              ▼              ▼
            ┌────────────┐ ┌────────────┐ ┌────────────┐
            │ Scheduling │ │ Analytics  │ │ Conflict   │
            │ Algorithm  │ │ Dashboards │ │ Detection  │
            └──────┬─────┘ └────────────┘ └────────────┘
                   │
                   ▼
            ┌────────────┐
            │  Schedule  │
            │  Output    │
            └────────────┘
```

### 7.2 Role-Based Dashboard Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      DASHBOARD HIERARCHY BY ROLE                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🟣 SCHEDULING COMMITTEE DASHBOARD                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ • Overview: Stats, Generator, Checklist                         │   │
│  │ • Analytics: 6 Chart Categories (Electives, Progress, etc.)     │   │
│  │ • Quick Actions: Courses, Rooms, Instructors, Sections, Exams   │   │
│  │ • Level Overview + Course Overview Dashboards                   │   │
│  │ • Import/Export, Settings (Time Grid)                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  🔵 TEACHING LOAD DASHBOARD                                             │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ • Instructor Workload Overview                                  │   │
│  │ • Section Assignment Editing                                    │   │
│  │ • Workload Distribution Charts                                  │   │
│  │ • Feedback/Comments                                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  🔴 REGISTRAR DASHBOARD                                                 │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ • Irregular Student Management                                  │   │
│  │ • Manual Registration (with bypass)                             │   │
│  │ • Enrollment Statistics                                         │   │
│  │ • Final Validation Tools                                        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  🟢 FACULTY DASHBOARD                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ • Personal Teaching Schedule                                    │   │
│  │ • Availability Preferences Grid                                 │   │
│  │ • Section Details                                               │   │
│  │ • Feedback Submission                                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  🟡 STUDENT DASHBOARD                                                   │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ • Schedule View (Required + Electives)                          │   │
│  │ • Elective Registration                                         │   │
│  │ • Exam Timetable                                                │   │
│  │ • Credit Tracker                                                │   │
│  │ • Comments/Feedback                                             │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 7.3 Conflict Detection System

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     CONFLICT DETECTION TYPES                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     ROOM CONFLICT                               │   │
│  │  Same room assigned to multiple sections at overlapping times   │   │
│  │  Detection: Check room_code + time overlap                      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                   INSTRUCTOR CONFLICT                           │   │
│  │  Same instructor assigned to multiple sections at same time     │   │
│  │  Detection: Check instructor_id + time overlap                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                  STUDENT-LEVEL CONFLICT                         │   │
│  │  Required courses for same level overlap in schedule            │   │
│  │  Detection: Check group_level + time overlap for required       │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     EXAM CONFLICT                               │   │
│  │  Student has multiple exams within minimum spacing              │   │
│  │  Detection: Check student enrollments + exam times + spacing    │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Conflict Resolution Priority:                                          │
│  1. Student Clashes (highest)                                          │
│  2. Instructor Clashes                                                 │
│  3. Room Type Fit                                                      │
│  4. Instructor Preferences (lowest)                                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Security Model

### 8.1 Authentication

- **Provider**: Supabase Auth (JWT-based)
- **Session Management**: HTTP-only cookies with automatic refresh
- **Middleware**: All dashboard routes protected by authentication check
- **SSR Pattern**: Server-side authentication using `@supabase/ssr`

### 8.2 Row Level Security (RLS)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                       RLS POLICY STRUCTURE                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Every table has RLS enabled with policies for:                        │
│                                                                         │
│  SELECT (Read)                                                          │
│  ├─ Public tables: All authenticated users                             │
│  └─ Private tables: Own records only (user_id match)                   │
│                                                                         │
│  INSERT (Create)                                                        │
│  ├─ Admin tables: Scheduling committee only                            │
│  ├─ User tables: Own records only                                      │
│  └─ Enrollment: Students for own registrations                         │
│                                                                         │
│  UPDATE (Modify)                                                        │
│  ├─ Admin tables: Scheduling committee only                            │
│  ├─ Assignment tables: Scheduling + Teaching Load                      │
│  └─ Personal data: Own records only                                    │
│                                                                         │
│  DELETE (Remove)                                                        │
│  ├─ Admin tables: Scheduling committee only                            │
│  └─ Personal data: Own records only (with restrictions)                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.3 Role Verification

All API routes include server-side role verification:

1. Extract user from session
2. Query `user_roles` table for role
3. Compare against required role(s) for endpoint
4. Return 403 Forbidden if unauthorized

---

## 9. Future Roadmap

### 9.1 Version 2 Features

| Feature                            | Description                                           | Status  |
| ---------------------------------- | ----------------------------------------------------- | ------- |
| **Real-Time Collaboration**        | Yjs concurrent editing for Scheduling + Teaching Load | Planned |
| **Version History**                | jsondiffpatch snapshots with named releases           | Planned |
| **AI Chatbot**                     | Natural language schedule queries (Google AI Studio)  | Planned |
| **Email Notifications**            | Critical update alerts via email                      | Planned |
| **Calendar Export**                | iCal format export to Google/Outlook                  | Planned |
| **CSV Import/Export**              | Alternative to JSON for data operations               | Planned |
| **Instructor Preference Learning** | ML-based preference suggestions                       | Planned |

### 9.2 Deployment Checklist

- [x] Core scheduling functionality complete
- [x] All role-based workflows functional
- [x] Security (RLS) implemented across all tables
- [x] Data import/export for backup and migration
- [x] Responsive UI with dark mode support
- [ ] User acceptance testing
- [ ] Performance benchmarking
- [ ] Production environment setup
- [ ] User documentation
- [ ] Demo/training materials

---

## Appendix A: Data Dictionary

| Entity             | Primary Key                | Key Relationships                |
| ------------------ | -------------------------- | -------------------------------- |
| user_roles         | user_id (FK to auth.users) | → student_group (if student)     |
| course             | code                       | ← section, exam                  |
| section            | id (UUID)                  | → course, instructor, room       |
| instructor         | id (UUID)                  | ← section                        |
| room               | code                       | ← section                        |
| student_group      | id (UUID)                  | ← user_roles                     |
| exam               | id (UUID)                  | → course                         |
| student_enrollment | id (UUID)                  | → user_roles, section            |
| schedule_comment   | id (UUID)                  | → user_roles, section (optional) |
| notification       | id (UUID)                  | → auth.users                     |

---

## Appendix B: API Endpoints Summary

| Endpoint                    | Method            | Description             | Role Required    |
| --------------------------- | ----------------- | ----------------------- | ---------------- |
| `/api/courses`              | GET, POST         | List/Create courses     | Any / Scheduling |
| `/api/courses/[code]`       | GET, PUT, DELETE  | Course CRUD             | Any / Scheduling |
| `/api/sections`             | GET, POST         | List/Create sections    | Any / Scheduling |
| `/api/rooms`                | GET, POST         | List/Create rooms       | Any / Scheduling |
| `/api/instructors`          | GET, POST         | List/Create instructors | Any / Scheduling |
| `/api/exams`                | GET, POST         | List/Create exams       | Any / Scheduling |
| `/api/scheduling/generate`  | POST              | Generate schedule       | Scheduling       |
| `/api/student/schedule`     | GET               | Student schedule        | Student          |
| `/api/student/enrollments`  | GET, POST, DELETE | Elective registration   | Student          |
| `/api/faculty/availability` | GET, PUT          | Faculty preferences     | Faculty          |
| `/api/data/import`          | POST              | Bulk import             | Scheduling       |
| `/api/data/export`          | GET               | Bulk export             | Scheduling       |

---

_This document provides a comprehensive high-level overview of the SmartSchedule system. For implementation details, refer to the codebase and inline documentation._
