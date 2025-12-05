# SmartSchedule V1 - SWE Department Scheduling System

A conflict-free teaching and exam scheduling web application for the SWE department. Built with Next.js 15, TypeScript, Supabase, and shadcn/ui.

## 🚀 Features

**Current Progress: 95% Complete (V1 Scope)** - Production Ready | [See Detailed Analysis](IMPLEMENTATION_ANALYSIS.md)

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
- **Student Groups** - Automatically created and updated based on actual student counts (levels 1-8)
- **Sections Management** - Full CRUD with meeting patterns and conflict detection
- **Import/Export** - Bulk JSON data operations with validation
- **Security** - Multi-layer RLS with role verification
- **Animations** - Smooth transitions with framer-motion
- **Mobile Responsive** - Touch-friendly, works on all devices

### ⏳ Deferred to V2

- Real-time collaborative editing with Yjs
- Version history with jsondiffpatch
- Named releases with restore capability
- AI chatbot for schedule insights
- CSV import/export
- Instructor preference learning (ML-based)
- Email/SMS notifications
- PDF schedule exports

## 🚀 Quick Start

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

---

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

#### 7. Load Sample Data (Optional)

1. Login to the dashboard
2. Go to **Import/Export** (`/dashboard/import-export`)
3. Use the provided `seed-data.json` or `seed-data-enhanced.json` file to import:
   - 12-52 sample courses
   - 10-124 rooms (lecture halls and labs)
   - 6-35 instructors
   - 7-8 student groups

---

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

### Quick Verification

After setup, verify everything works:

1. **View Sample Data**: Dashboard → Courses/Rooms/Instructors
2. **Test Import/Export**: Dashboard → Import/Export
3. **Explore Dashboards**: Dashboard → Level Overview / Course Overview

**Note**: Each role sees a completely different dashboard and navigation menu tailored to their responsibilities.

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
   - **Student Groups** (`/dashboard/student-groups`) - Auto-managed groups by level (view-only for most users)

3. **Import Data (Alternative)**
   - Go to **Import/Export** (`/dashboard/import-export`)
   - Upload `seed-data.json` or your own JSON file
   - Data will be upserted (updates existing, creates new)

### Dashboard Navigation (Role-Based)

Navigation is automatically filtered based on your role:

**Scheduling Committee** (Full Access):

- Dashboard, Courses, Sections, Rooms, Instructors, Student Groups
- Import/Export, Notifications, Settings

**Teaching Load Committee**:

- Dashboard, Courses, Sections, Instructors, Notifications

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
- **Helper Functions**: Conflict detection, statistics, notifications, automatic student group sync
- **Auto-Sync**: Student groups automatically created/updated based on student enrollment counts

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

## 📊 Implementation Status

### V1 - Production Ready (95% Complete)

| Phase                             | Status         | Completion                                               |
| --------------------------------- | -------------- | -------------------------------------------------------- |
| **Phase 1: Foundation & Setup**   | ✅ Complete    | 100%                                                     |
| **Phase 2: Data Management**      | ✅ Complete    | 100%                                                     |
| **Phase 3: Scheduling Engine**    | ✅ Complete    | 100%                                                     |
| **Phase 4: Collaboration**        | ⚠️ Partial     | 25% (Notifications ✅, Comments ✅, Yjs/Versioning → V2) |
| **Phase 5: Dashboards & Portals** | ✅ Complete    | 100%                                                     |
| **Phase 6: Testing & Polish**     | ⚠️ In Progress | 60% (Seed data ✅, UAT pending)                          |

**Phase 1**: ✅ Foundation & Setup (100%)

- 18 database tables with complete RLS policies
- TypeScript types auto-generated from schema
- 4 Zustand stores for client state
- Dashboard layout with role-based navigation
- Brand identity and design system

**Phase 2**: ✅ Data Management (100%)

- Complete CRUD for all 6 core entities
- JSON Import/Export with validation
- Time Grid Configuration
- Seed data system (JSON + CLI)

**Phase 3**: ✅ Core Scheduling Engine (100%)

- ✅ Greedy CSP algorithm with automatic room assignment
- ✅ Real-time conflict detection (room, instructor, student-level)
- ✅ One-click schedule generation
- ✅ Manual editing with instant validation
- ✅ Exam scheduling with conflict detection

**Phase 4**: ⚠️ Collaboration & Versioning (25%)

- ✅ In-app notifications with auto-refresh
- ✅ Comment/feedback system for all roles
- ⏳ Yjs real-time collaboration (deferred to V2)
- ⏳ jsondiffpatch versioning (deferred to V2)
- ⏳ Named releases (deferred to V2)
- **Note**: Asynchronous collaboration via comments; JSON export/import for manual versioning

**Phase 5**: ✅ Dashboards & Portals (100%)

- ✅ Modern landing page with conversion optimization
- ✅ 5 role-specific dashboards with unique UIs and animations
- ✅ Scheduling Committee portal with schedule generation
- ✅ Teaching Load portal
- ✅ Faculty portal with availability preferences and feedback
- ✅ Student portal with elective registration, schedule view, and exam timetable
- ✅ Registrar portal
- ✅ Dual navigation system (desktop sidebar + mobile drawer)
- ✅ Chart.js analytics (Level Overview + Course Overview dashboards)

**Phase 6**: ⚠️ Testing & Polish (60%)

- ✅ Seed data system (enhanced JSON + CLI script)
- ⏳ User acceptance testing (all 5 roles)
- ⏳ Performance benchmarking
- ⏳ Demo script and training materials
- ⏳ Automated testing suite

### Next Steps (V1 Completion)

1. User acceptance testing (all roles)
2. Performance benchmarking (scheduling algorithm)
3. Demo script and user documentation
4. Production deployment preparation

### V1 Documentation

- [PRD.md](PRD.md) - Product Requirements Document (updated with V1/V2 scope)
- [timeline.md](timeline.md) - Development timeline and progress
- [IMPLEMENTATION_ANALYSIS.md](IMPLEMENTATION_ANALYSIS.md) - Comprehensive analysis report
- [src/docs/](src/docs/) - Technical documentation

## 🐛 Troubleshooting

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
2. Ensure all 3 migrations ran successfully
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

### Getting Help

- **📖 Complete Documentation**: See [COMPLETE_DOCUMENTATION.md](COMPLETE_DOCUMENTATION.md) for all guides and references
- **Local Development**: See [COMPLETE_DOCUMENTATION.md#local-development-with-supabase](COMPLETE_DOCUMENTATION.md#local-development-with-supabase)
- **Supabase CLI**: See [COMPLETE_DOCUMENTATION.md#development-guides](COMPLETE_DOCUMENTATION.md#development-guides)
- **Database Issues**: Check [COMPLETE_DOCUMENTATION.md#troubleshooting](COMPLETE_DOCUMENTATION.md#troubleshooting)
- **API Reference**: See [COMPLETE_DOCUMENTATION.md#api-reference](COMPLETE_DOCUMENTATION.md#api-reference)

## 📚 Documentation

**📖 [Complete Documentation](COMPLETE_DOCUMENTATION.md)** - Comprehensive guide covering all aspects of the project including:

- Quick start guides
- Architecture and development guides
- Feature documentation
- API reference
- Deployment instructions
- Troubleshooting
- Design system

### Additional Resources

- **PRD.md** - Product Requirements Document
- **timeline.md** - Development timeline and progress
- **IMPLEMENTATION_ANALYSIS.md** - Detailed V1 vs PRD analysis
- **seed-data.json** - Sample data for testing
- **seed-data-enhanced.json** - Comprehensive seed data (33 courses)

## 🤝 Contributing

This is a department-specific scheduling system. For modifications:

1. Review PRD.md for requirements
2. Check timeline.md for current progress
3. Follow existing patterns in codebase

---

**Version**: V1 (98% Complete - Production Ready!)  
**Last Updated**: October 28, 2025  
**Built with**: Next.js 15, Supabase, TypeScript, shadcn/ui, Framer Motion, Chart.js
