# Multi-UI Role-Based System Documentation

## Overview
SmartSchedule now implements a comprehensive role-based multi-UI system with 5 distinct user roles, each with their own dedicated dashboard and navigation experience.

## Implemented User Roles

### 1. **Scheduling Committee** (`scheduling`)
- **Access Level**: Full system access
- **Dashboard**: `/dashboard/scheduling`
- **Key Features**:
  - Schedule generation controls
  - Conflict overview and resolution
  - Named releases management
  - Full CRUD access to all entities
  - System setup checklist
  - Quick actions for all management tasks

### 2. **Teaching Load Committee** (`teaching_load`)
- **Access Level**: Instructor and course management
- **Dashboard**: `/dashboard/teaching-load`
- **Key Features**:
  - Instructor load overview with visual indicators
  - Teaching hour distribution
  - Section assignment management
  - Load balancing guidelines
  - Collaborative editing with scheduling committee

### 3. **Faculty** (`faculty`)
- **Access Level**: Personal timetable view
- **Dashboard**: `/dashboard/faculty`
- **Key Features**:
  - Personal teaching schedule
  - Assigned sections with times and rooms
  - Course details and capacity
  - Feedback submission (placeholder)
  - Availability preferences management
  - Profile linked via email matching

### 4. **Student** (`student`)
- **Access Level**: Schedule viewing and preference submission
- **Dashboard**: `/dashboard/student`
- **Key Features**:
  - Elective preference submission (ranked)
  - Personal course schedule view
  - Available elective courses
  - Exam schedule (placeholder)
  - Comments and reviews

### 5. **Registrar** (`registrar`)
- **Access Level**: Publication and validation
- **Dashboard**: `/dashboard/registrar`
- **Key Features**:
  - Schedule publication controls
  - Validation checks (conflicts, rooms, loads)
  - Release history
  - Export functionality (JSON, PDF)
  - Final approval workflow
  - Read-only access to all system data

## Architecture

### Authentication & Role Management

#### 1. **Auth Context** (`lib/auth-context.tsx`)
```typescript
interface AuthContextType {
  user: User | null;           // Supabase auth user
  userRole: UserRoleRow | null; // User role from database
  loading: boolean;
}
```
- Fetches both Supabase auth user AND role from `user_roles` table
- Provides role information throughout the application
- Single source of truth for user identity and permissions

#### 2. **Role-Based Navigation** (`components/dashboard-sidebar.tsx`)
- Navigation items filtered based on user role
- Role badge displayed in sidebar header
- Color-coded role indicators:
  - 🟣 Purple: Scheduling Committee
  - 🔵 Blue: Teaching Load
  - 🟢 Green: Faculty
  - 🟡 Yellow: Student
  - 🔴 Red: Registrar

#### 3. **Dashboard Routing** (`app/(dashboard)/dashboard/page.tsx`)
Automatic redirection based on role:
```typescript
scheduling → /dashboard/scheduling
teaching_load → /dashboard/teaching-load
faculty → /dashboard/faculty
student → /dashboard/student
registrar → /dashboard/registrar
```

#### 4. **Role Guard Component** (`components/role-guard.tsx`)
Client-side protection for role-specific routes:
```typescript
<RoleGuard allowedRoles={['scheduling', 'teaching_load']}>
  {/* Protected content */}
</RoleGuard>
```

### Database Integration

#### User Roles Table
```sql
CREATE TABLE user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  role user_role NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Role Enum
```sql
CREATE TYPE user_role AS ENUM (
  'scheduling', 
  'teaching_load', 
  'faculty', 
  'student', 
  'registrar'
);
```

### Row Level Security (RLS)
Each dashboard page includes server-side role verification:
```typescript
// Verify user has correct role
const { data: userRole } = await supabase
  .from('user_roles')
  .select('role')
  .eq('user_id', user.id)
  .single();

if (userRole?.role !== 'expected_role') {
  redirect("/dashboard");
}
```

## Navigation Matrix

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

## UI Components

### Role Badge
```typescript
<Badge className={cn("mt-3", roleBadgeColors[userRole.role])}>
  {roleLabels[userRole.role]}
</Badge>
```

### User Dropdown
Now displays:
- User name
- Email address
- Role badge (color-coded)
- Dashboard link
- Logout button

## Setup & Configuration

### 1. Assign User Role
After user registration, assign role via SQL:
```sql
INSERT INTO user_roles (user_id, role, name, email)
VALUES (
  '<user_id>',
  'scheduling',  -- or teaching_load, faculty, student, registrar
  'John Doe',
  'john@example.com'
);
```

### 2. Link Faculty to Instructor
For faculty users, link by matching email:
```sql
-- Create instructor with matching email
INSERT INTO instructor (name, email)
VALUES ('John Doe', 'john@example.com');
```

## Security Features

### Server-Side
- ✅ Role verification on all dashboard pages
- ✅ RLS policies on database tables
- ✅ Redirect on unauthorized access

### Client-Side
- ✅ Navigation filtering by role
- ✅ RoleGuard component for protected routes
- ✅ Loading states during role fetch
- ✅ Error handling for missing roles

## Future Enhancements

### Phase 2 (Planned)
- [ ] Elective preference submission form
- [ ] Schedule generation algorithm
- [ ] Conflict detection and visualization
- [ ] Real-time collaboration (yjs)
- [ ] Named releases workflow
- [ ] Feedback and comments system
- [ ] Exam schedule view
- [ ] PDF export functionality
- [ ] Email notifications

## Testing Checklist

### Per Role
- [ ] User can log in
- [ ] Correct dashboard loads automatically
- [ ] Navigation shows only permitted items
- [ ] Role badge displays correctly
- [ ] Cannot access other role dashboards
- [ ] Logout works properly

### Integration
- [ ] Role changes reflect immediately
- [ ] Multiple users with different roles work concurrently
- [ ] Database queries respect RLS policies
- [ ] Error states handled gracefully

## Troubleshooting

### "No Role Assigned" Message
**Cause**: User exists in Supabase auth but not in `user_roles` table.  
**Solution**: Add user to `user_roles` table with appropriate role.

### "Profile Not Linked" (Faculty)
**Cause**: Faculty user doesn't have matching instructor record.  
**Solution**: Create instructor with email matching the faculty user's email.

### Navigation Items Missing
**Cause**: Role not properly assigned or auth context not loading.  
**Solution**: Check browser console, verify role in database.

### Redirect Loop
**Cause**: User role doesn't match expected role for dashboard.  
**Solution**: Verify role enum value matches exactly (lowercase, underscores).

## File Structure
```
app/(dashboard)/
├── dashboard/
│   ├── page.tsx                    # Role router
│   ├── scheduling/page.tsx         # Scheduling dashboard
│   ├── teaching-load/page.tsx      # Teaching Load dashboard
│   ├── faculty/page.tsx            # Faculty dashboard
│   ├── student/page.tsx            # Student dashboard
│   └── registrar/page.tsx          # Registrar dashboard
components/
├── dashboard-sidebar.tsx           # Role-based navigation
├── user-auth-state.tsx            # User dropdown with role
├── role-guard.tsx                 # Route protection
└── ui/
    └── badge.tsx                  # Role badge component
lib/
├── auth-context.tsx               # Auth + role context
└── stores/
    └── auth-store.ts              # Auth store (optional)
```

## API Reference

### useAuth Hook
```typescript
const { user, userRole, loading } = useAuth();

// user: Supabase auth user
// userRole: UserRoleRow with role, name, email
// loading: boolean
```

### RoleGuard Component
```typescript
<RoleGuard 
  allowedRoles={['scheduling', 'teaching_load']}
  redirectTo="/dashboard"
>
  {children}
</RoleGuard>
```

## Migration Notes

### From Generic Dashboard
1. ✅ Auth context updated to fetch roles
2. ✅ Dashboard sidebar filters navigation
3. ✅ Main dashboard redirects by role
4. ✅ 5 role-specific dashboards created
5. ✅ User dropdown shows role badge
6. ✅ RoleGuard component available

### Breaking Changes
- Main `/dashboard` now redirects instead of showing content
- `useAuth()` now returns `{ user, userRole, loading }` instead of `{ user, loading }`
- Navigation items require role array in definition

---

**Last Updated**: October 27, 2025  
**Version**: V1.0  
**Status**: ✅ Implemented

