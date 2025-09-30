# Phase 3: Core Requirements - SmartSchedule (SWE Department)

## Department Scope

**CRITICAL: This system is exclusively for the Software Engineering (SWE) Department**

- ✅ **SWE Courses Only**: The system manages scheduling for SWE courses (SWE211, SWE312, SWE314, etc.)
- ✅ **SWE Faculty**: Manages SWE faculty teaching assignments and loads
- ✅ **SWE Students**: Handles SWE student preferences and schedules
- ❌ **Non-SWE Courses**: Cannot schedule or manage courses from other departments (CSC, MATH, PHY, etc.)
- ℹ️ **External Courses**: Non-SWE courses are tracked as external dependencies only (students may take them, but scheduling is not managed by this system)

## Feature Scope

This document outlines the scope for Phase 3 of the SmartSchedule project, focusing on delivering core functionality with a clean, modular architecture.

### In Scope

- **Core CRUD Operations**: Basic create, read, update, and delete operations for all entities
- **Single AI Call**: One AI recommendation endpoint for scheduling suggestions
- **Mobile-Friendly UI**: Responsive design that works on all device sizes
- **Simple Data Storage**: In-memory JSON storage (no database)
- **Mock Authentication**: Role-based access control with a simple role switcher
- **Basic Validation**: Client and server-side form validation

### Out of Scope

- Real-time collaboration
- Advanced dashboards or analytics
- Versioning or history tracking
- Complex scheduling algorithms
- Persistent database storage
- User authentication (using mock roles instead)
- Email notifications
- Advanced reporting

### Technical Stack

- Next.js 15 with App Router
- TypeScript
- TailwindCSS for styling
- shadcn/ui for UI components
- In-memory data storage (JSON)
- Zod for validation

### Personas

1. **Students (SWE Students)**

   - View and update SWE elective preferences
   - View their schedule (including external non-SWE courses they're enrolled in)

2. **Faculty (SWE Faculty)**

   - Set availability for teaching SWE courses
   - Set SWE course preferences
   - View teaching assignments for SWE courses

3. **Scheduling Committee**

   - Schedule SWE courses only
   - Manage SWE sections, meetings, and exams
   - Track external course slots (non-SWE courses) as reference only

4. **Teaching Load Committee**

   - Monitor SWE faculty teaching loads
   - Identify conflicts in SWE course assignments

5. **Registrar**
   - Manage irregular students who need SWE courses
   - Import data
   - View scheduling conflicts

### Data Model

- Students
- Faculty
- Courses
- Sections
- Preferences
- Availability
- Assignments
- Schedules

### Success Criteria

- All core features implemented and functional
- Responsive design works on mobile devices
- Basic form validation in place
- Clear error messages
- Simple, maintainable code structure
- Documentation complete and up-to-date
