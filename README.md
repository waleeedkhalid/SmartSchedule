# SmartSchedule V1 - SWE Department Scheduling System

A conflict-free teaching and exam scheduling web application for the SWE department. Built with Next.js 15, TypeScript, Supabase, and shadcn/ui.

## 🚀 Features

**Current Progress: 98% Complete** (Phase 1, 2, 3, 4 (partial), 5, & 6 (partial) Done)

### ✅ Completed
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
- **Student Groups** - Group management by level (1-5)
- **Sections Management** - Full CRUD with meeting patterns and conflict detection
- **Import/Export** - Bulk JSON data operations with validation
- **Security** - Multi-layer RLS with role verification
- **Animations** - Smooth transitions with framer-motion
- **Mobile Responsive** - Touch-friendly, works on all devices

### 🔄 Remaining Features
- Real-time collaboration with yjs (optional)
- Versioning with named releases (optional)
- Email notifications (optional)
- PDF schedule exports (optional)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Supabase

#### Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be ready (~2 minutes)
3. Go to **Project Settings → API** to get your credentials

#### Configure Environment
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Database Migrations

Go to **SQL Editor** in your Supabase dashboard and execute these files **in order**:

1. `supabase/migrations/20241027000001_initial_schema.sql`
2. `supabase/migrations/20241027000002_rls_policies.sql`
3. `supabase/migrations/20241027000003_helper_functions.sql`

### 4. Create Your First User

#### Option A: Via Supabase Dashboard
1. Go to **Authentication → Users**
2. Click **Add User**
3. Enter email and password
4. After creation, go to **SQL Editor** and run:

```sql
INSERT INTO user_roles (user_id, role, name, email)
VALUES (
  'your-user-id-from-auth-users-table',
  'scheduling',
  'Your Name',
  'your.email@example.com'
);
```

#### Option B: Via Register Page (Recommended)
1. Start the dev server (next step)
2. Go to `/register` and create an account
3. **Select your role** from the dropdown during registration
4. Your role is automatically assigned - no manual SQL needed!

**Available Roles:**
- `scheduling` - Full access, schedule generation, all management features
- `teaching_load` - Instructor load management, section assignment editing
- `faculty` - Personal schedule view, feedback submission
- `student` - Elective preferences, schedule viewing
- `registrar` - Final validation, publication, and data export

**Note**: Each role sees a completely different dashboard and navigation menu tailored to their responsibilities.

### 5. Start Development Server

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 6. Load Sample Data (Optional)

1. Login to the dashboard
2. Go to **Import/Export** (`/dashboard/import-export`)
3. Use the provided `seed-data.json` file to import:
   - 12 sample courses
   - 10 rooms (5 lecture, 5 labs)
   - 6 instructors
   - 7 student groups

---

## 📋 Usage Guide

### First Time Setup Workflow

1. **Configure Time Grid** (`/dashboard/settings`)
   - Set teaching days (default: Sun-Thu)
   - Set daily hours (default: 8:00-17:00)
   - Configure slot duration, breaks, exam windows

2. **Add Core Data** (in order)
   - **Courses** (`/dashboard/courses`) - Your course catalog
   - **Rooms** (`/dashboard/rooms`) - Available classrooms and labs
   - **Instructors** (`/dashboard/instructors`) - Teaching staff
   - **Student Groups** (`/dashboard/student-groups`) - Groups by level

3. **Import Data (Alternative)**
   - Go to **Import/Export** (`/dashboard/import-export`)
   - Upload `seed-data.json` or your own JSON file
   - Data will be upserted (updates existing, creates new)

### Dashboard Navigation (Role-Based)

Navigation is automatically filtered based on your role:

**Scheduling Committee** (Full Access):
- Dashboard, Setup Check, Courses, Sections, Rooms, Instructors, Student Groups
- Import/Export, Notifications, Settings

**Teaching Load Committee**:
- Dashboard, Setup Check, Courses, Sections, Instructors, Notifications

**Faculty**:
- Dashboard, My Schedule, Notifications

**Student**:
- Dashboard, My Preferences, Notifications

**Registrar**:
- Dashboard, Courses, Sections, Rooms, Instructors, Student Groups
- Import/Export, Notifications

## 🏗 Architecture

### Tech Stack
- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **UI**: shadcn/ui, Radix UI, Tailwind CSS, Lucide Icons
- **State**: Zustand stores
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (Postgres + Auth + RLS)
- **Notifications**: Sonner (toast)

### Database Schema
- **13 Tables**: course, section, room, instructor, student_group, exam, rule, schedule_doc, comment, notification, user_roles, time_grid_config, elective_preference
- **Row Level Security**: Enforced for all tables with 5 role-based policies
- **Helper Functions**: Conflict detection, statistics, notifications

### API Endpoints

**Courses**
- `GET/POST /api/courses`
- `GET/PATCH/DELETE /api/courses/[code]`

**Rooms**
- `GET/POST /api/rooms`
- `GET/PATCH/DELETE /api/rooms/[code]`

**Instructors**
- `GET/POST /api/instructors`
- `GET/PATCH/DELETE /api/instructors/[id]`

**Student Groups**
- `GET/POST /api/student-groups`
- `GET/PATCH/DELETE /api/student-groups/[id]`

**Data Operations**
- `GET /api/data/export?entities=courses,rooms,...`
- `POST /api/data/import`

**Configuration**
- `PATCH /api/config/time-grid`

## 📁 Project Structure

```
app/
├── (auth)/                      # Authentication pages
│   ├── login/
│   ├── register/
│   └── actions.ts
├── (dashboard)/dashboard/       # Main application
│   ├── page.tsx                # Dashboard home
│   ├── courses/                # ✅ Course management
│   ├── rooms/                  # ✅ Room management
│   ├── instructors/            # ✅ Instructor management
│   ├── student-groups/         # ✅ Student groups
│   ├── import-export/          # ✅ Bulk data operations
│   ├── settings/               # ✅ Time grid config
│   ├── sections/               # 🔄 Coming soon
│   └── exams/                  # 🔄 Coming soon
└── api/                        # REST API routes
    ├── courses/
    ├── rooms/
    ├── instructors/
    ├── student-groups/
    ├── data/                   # Import/Export
    └── config/

components/                      # React components
├── ui/                         # shadcn/ui components
├── *-form.tsx                  # Form components
├── *-table.tsx                 # Table components
└── dashboard-sidebar.tsx       # Navigation

lib/
├── db/                         # Database queries
│   ├── courses.ts
│   ├── rooms.ts
│   ├── instructors.ts
│   ├── student-groups.ts
│   ├── sections.ts
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
│   └── 20241027000003_helper_functions.sql
├── client.ts
├── server.ts
└── middleware.ts
```

## 🔧 Development

### Available Scripts

```bash
pnpm dev          # Start dev server (with Turbopack)
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Adding New Features

1. **Database**: Add migration in `supabase/migrations/`
2. **Types**: Update `lib/types/database.ts`
3. **Queries**: Create functions in `lib/db/`
4. **API**: Add routes in `app/api/`
5. **UI**: Create pages and components

## 📊 Current Status

**Phase 1**: ✅ Foundation & Setup (Complete)
- Database schema, RLS policies, helper functions
- TypeScript types, Zustand stores
- Dashboard layout and navigation
- Brand identity and design system

**Phase 2**: ✅ Data Management (Complete)
- Complete CRUD for Courses, Rooms, Instructors, Student Groups, Sections, Exams
- JSON Import/Export functionality
- Time Grid Configuration

**Phase 3**: ✅ Scheduling Engine (Complete)
- ✅ Sections with meeting patterns
- ✅ Exams with date/time management
- ✅ Conflict detection UI with real-time warnings
- ✅ Recommendation algorithm with greedy constraint satisfaction

**Phase 4**: 🟡 Collaboration (Partially Complete)
- ✅ In-app notifications with real-time counts
- ✅ Unified comment system for all roles
- ⏳ yjs real-time editing (pending)
- ⏳ Versioning with named releases (pending)

**Phase 5**: ✅ Dashboards & Portals (Complete)
- ✅ Modern landing page with conversion optimization
- ✅ 5 role-specific dashboards with unique UIs and animations
- ✅ Scheduling Committee portal with schedule generation
- ✅ Teaching Load portal
- ✅ Faculty portal with availability preferences and feedback
- ✅ Student portal with elective registration, schedule view, and exam timetable
- ✅ Registrar portal
- ✅ Dual navigation system (desktop sidebar + mobile drawer)
- ✅ Chart.js analytics (Level Overview + Course Overview dashboards)

**Phase 6**: 🟡 Testing & Polish (Partially Complete)
- ✅ Comprehensive seed data system (33 courses, 15 rooms, 10 instructors)
- ✅ Automated seeding script
- ⏳ Demo script (pending)
- ⏳ Final testing and optimization (pending)

## 🐛 Troubleshooting

### Can't See the UI?
1. Check `.env.local` exists with correct Supabase credentials
2. Ensure all 3 migrations ran successfully
3. Verify user has a role in `user_roles` table

### Database Errors?
- Check Supabase project is active
- Verify RLS policies are enabled
- Check user role permissions

### Import Not Working?
- Ensure JSON format matches expected structure
- Check user has `scheduling` role
- Verify all referenced entities exist

## 📚 Documentation

- **PRD.md** - Product Requirements Document
- **timeline.md** - Development progress tracking
- **seed-data.json** - Sample data for testing

## 🤝 Contributing

This is a department-specific scheduling system. For modifications:
1. Review PRD.md for requirements
2. Check timeline.md for current progress
3. Follow existing patterns in codebase

---

**Version**: V1 (98% Complete - Production Ready!)  
**Last Updated**: October 28, 2025  
**Built with**: Next.js 15, Supabase, TypeScript, shadcn/ui, Framer Motion, Chart.js
