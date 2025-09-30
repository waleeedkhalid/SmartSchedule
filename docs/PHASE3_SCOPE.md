# Phase 3: Core Requirements - SmartSchedule

## Scope

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

1. **Students**

   - View and update course preferences
   - View their schedule

2. **Faculty**

   - Set availability
   - Set course preferences
   - View teaching assignments

3. **Committee Members**
   - Schedule courses
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
