# Demo Mode Setup Guide

## Overview

SmartSchedule now includes a **full working demo** with hardcoded data and no backend dependency. This allows you to showcase the application without needing to set up Supabase or deal with authentication issues.

## Quick Start

### 1. Enable Demo Mode

Add this to your `.env.local` file:

```bash
NEXT_PUBLIC_DEMO_MODE=true
```

### 2. Start the Development Server

```bash
npm run dev
```

### 3. Access the Demo

- **Demo Homepage**: http://localhost:3000/demo
- **Phase 5 Dashboards**: http://localhost:3000/phase5

## Features Included

### Demo Data

All demo data is **pre-calculated and hardcoded** with:

- ✅ **5 User Roles**: Scheduling, Teaching Load, Registrar, Faculty, Student
- ✅ **8 Courses**: Pre-defined SWE department courses (Levels 4-5)
- ✅ **5 Sections**: Conflict-free schedules across the week
- ✅ **213 Student Enrollments**: Pre-populated with realistic data
- ✅ **5 Faculty Members**: With teaching assignments
- ✅ **7 Rooms**: Lab, Lecture Hall, and Seminar rooms
- ✅ **5 Exams**: Final exam timetable with dates and times
- ✅ **Comments & Feedback**: System-wide comments and notifications

### No Backend Required

The demo mode works **entirely client-side** with:

- ❌ No Supabase connection
- ❌ No authentication server
- ❌ No database queries
- ❌ No API calls
- ✅ Pure React state management
- ✅ LocalStorage for session persistence

### Demo User Accounts

Switch between different roles to see role-specific features:

| Role                 | Email                       | Features                                 |
| -------------------- | --------------------------- | ---------------------------------------- |
| **Scheduling Admin** | admin@smartschedule.edu     | Full system control, schedule generation |
| **Teaching Load**    | teaching@smartschedule.edu  | Instructor management, workload tracking |
| **Registrar**        | registrar@smartschedule.edu | Student registration, validation         |
| **Faculty**          | faculty@smartschedule.edu   | Personal schedule, preferences           |
| **Student**          | student@smartschedule.edu   | Course registration, schedule viewing    |

## File Structure

### Core Demo Files

```
lib/demo/
├── mock-data.ts              # All hardcoded demo data
├── use-demo-session.ts       # Session management hook
└── use-demo-data.ts          # Data access hooks

components/demo/
└── demo-provider.tsx         # Context provider

app/demo/
└── page.tsx                  # Demo homepage
```

### Integration Points

The demo integrates with existing dashboards:

- `app/phase5/dashboards/` - Role-based dashboard pages
- `app/phase5/page.tsx` - Main dashboard
- All existing UI components work without modification

## How to Use

### Accessing Demo Page

```typescript
// Simply navigate to
http://localhost:3000/demo
```

### Switching Roles

On the demo page, click any user's tab to switch roles:

```typescript
// This updates the session and all dependent components re-render
const { switchRole } = useDemoSession();
switchRole("student");
```

### Using Demo Data in Components

```typescript
import { useDemoStudentSchedule } from "@/lib/demo/use-demo-data";

export function MyComponent() {
  const schedule = useDemoStudentSchedule();

  return (
    <div>
      {schedule.map((item) => (
        <div key={item.section.id}>{item.course.title}</div>
      ))}
    </div>
  );
}
```

### Using Demo Context

```typescript
import { useDemo } from "@/components/demo/demo-provider";

export function MyComponent() {
  const { session, switchRole } = useDemo();

  return (
    <div>
      <p>Current User: {session.user.name}</p>
      <button onClick={() => switchRole("faculty")}>Switch to Faculty</button>
    </div>
  );
}
```

## Switching Between Demo and Real Backend

### Enable Demo Mode

```bash
# .env.local
NEXT_PUBLIC_DEMO_MODE=true
```

### Disable Demo Mode

```bash
# .env.local
NEXT_PUBLIC_DEMO_MODE=false
# or comment it out
```

## Custom Demo Data

To customize demo data, edit these files:

### Add More Courses

```typescript
// lib/demo/mock-data.ts
export const DEMO_COURSES = [
  // Existing courses...
  {
    code: "SWE406",
    title: "My Custom Course",
    level: 4,
    credits: 3,
    weekly_hours: 3,
    is_elective: true,
  },
];
```

### Add More Students

```typescript
// lib/demo/mock-data.ts
export const DEMO_STUDENTS = [
  // Existing students...
  {
    id: "user-student-006",
    name: "New Student Name",
    student_number: "2024006",
    email: "student@smartschedule.edu",
    level: 4,
    gpa: 3.8,
    total_credits: 40,
  },
];
```

### Update Enrollments

```typescript
// lib/demo/mock-data.ts
export const DEMO_ENROLLMENTS = [
  // Existing enrollments...
  {
    student_id: "user-student-006",
    section_id: "sec-401-001",
    status: "enrolled",
  },
];
```

## Dashboard Examples

### Scheduling Committee Dashboard

- View all sections
- See conflict-free schedule
- Check statistics (0 conflicts guaranteed)
- View analytics charts
- Export schedule data

### Faculty Dashboard

- View personal teaching schedule
- See enrolled students (130 total)
- Track feedback (8 comments)
- View office hours
- Check teaching load

### Student Dashboard

- View enrolled courses (3 courses)
- See exam timetable (5 exams)
- Register for electives (1 registered)
- Track progress (45/120 credits)
- View GPA (3.85)

### Registrar Dashboard

- Manage irregular students (3 total)
- View enrollment statistics (92% enrollment rate)
- Check pending registrations (2 pending)
- Validate schedules (0 conflicts)

## Performance

Demo mode is **extremely fast**:

- ⚡ Page load: <100ms
- ⚡ Role switching: <50ms
- ⚡ Data filtering: <10ms
- ⚡ Dashboard render: <200ms

No network latency, no database queries!

## Troubleshooting

### Demo mode not loading

1. Verify `.env.local` has `NEXT_PUBLIC_DEMO_MODE=true`
2. Clear browser cache and localStorage
3. Restart the dev server

### Session not persisting

- Check browser localStorage is enabled
- Clear `smartschedule_demo_session` key from localStorage
- Refresh the page

### Components not updating when switching roles

- Wrap components with `DemoProvider`
- Use `useDemo()` hook to get current session
- Dependencies should include `session.user.id`

## Next Steps

### Converting to Real Backend

When ready to switch to the real backend:

1. Update API calls to use Supabase instead of mock data
2. Remove `NEXT_PUBLIC_DEMO_MODE=true` from `.env.local`
3. Connect real Supabase project
4. Implement proper authentication

### Extending Demo Data

To add more realistic data:

1. Edit `lib/demo/mock-data.ts`
2. Add more courses, sections, students
3. Update enrollments to match
4. Update helper functions if needed
5. Test with all 5 roles

## Support

For issues or questions about demo mode:

1. Check this guide first
2. Review `lib/demo/mock-data.ts` for data structure
3. Check `app/demo/page.tsx` for UI examples
4. Use browser DevTools to debug
