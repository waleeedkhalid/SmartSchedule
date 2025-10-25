# Faculty Features - Quick Start Guide

## 🚀 What's New

Complete faculty participation system integrated with academic term phases!

## 📍 Key Routes

- **Dashboard**: `/faculty/dashboard` - Overview and status
- **My Courses**: `/faculty/courses` - Detailed course view
- **Schedule**: `/faculty/schedule` - Weekly teaching calendar
- **Feedback**: `/faculty/feedback` - Student feedback (post-period)

## 🔑 API Endpoints

All endpoints require faculty authentication:

```bash
# Get faculty status
GET /api/faculty/status

# Get assigned courses
GET /api/faculty/courses

# Get teaching schedule
GET /api/faculty/schedule

# Get student feedback (after period closes)
GET /api/faculty/feedback

# Get relevant events
GET /api/faculty/events
```

## 🔐 Phase-Based Access

### Scheduling Phase (`schedule_published = false`)
- ❌ Courses locked
- ❌ Schedule locked
- ❌ Feedback locked
- ℹ️ Dashboard shows "in progress" status

### After Publication (`schedule_published = true`)
- ✅ Courses accessible
- ✅ Schedule visible
- ❌ Feedback still locked (if feedback_open = true)

### Post-Feedback (`feedback_open = false`)
- ✅ Courses accessible
- ✅ Schedule visible
- ✅ Feedback accessible (anonymized)

## 🧪 Testing

### 1. Create Test Faculty
```sql
-- Insert user
INSERT INTO users (id, email, full_name, role)
VALUES ('test-faculty-123', 'prof@test.edu', 'Dr. Test', 'faculty');

-- Insert faculty profile
INSERT INTO faculty (id, faculty_number, title, status)
VALUES ('test-faculty-123', 'FAC001', 'Professor', 'active');
```

### 2. Assign Sections
```sql
-- Assign to existing sections
UPDATE section
SET instructor_id = 'test-faculty-123'
WHERE id IN ('SEC001', 'SEC002');
```

### 3. Test Phase Transitions
```sql
-- Publish schedule
UPDATE academic_term
SET schedule_published = true
WHERE is_active = true;

-- Close feedback
UPDATE academic_term
SET feedback_open = false
WHERE is_active = true;
```

## 📊 Permission Helper

```typescript
import {
  canAccessFeedback,
  canViewCourses,
  getCurrentFacultyPhase,
} from "@/lib/faculty-permissions";

// Check permissions
const term = await getActiveTerm();
const feedbackPermission = canAccessFeedback(term);

if (feedbackPermission.allowed) {
  // Show feedback
} else {
  console.log(feedbackPermission.reason);
}

// Get current phase
const phase = getCurrentFacultyPhase(term);
console.log(phase.phase); // "scheduling" | "registration" | "active_term"
console.log(phase.allowedActions); // ["view_courses", "view_schedule"]
```

## 🎨 Components

### Dashboard Components
```typescript
import {
  FacultyStatusCards,
  MyCoursesCard,
  TeachingScheduleCard,
  FacultyUpcomingEvents,
} from "@/components/faculty/dashboard";

// Use in any page
<FacultyStatusCards
  assignedCoursesCount={5}
  schedulePublished={true}
  canViewFeedback={false}
  feedbackOpen={true}
/>
```

## 🔍 Feedback Privacy

Student feedback is **completely anonymized**:
- No student IDs or names in responses
- Only accessible after feedback period closes
- Aggregate statistics only
- Individual responses cannot be traced

## 📚 Documentation

- **Full Guide**: `src/docs/features/faculty-features.md`
- **Implementation Summary**: `FACULTY-FEATURES-IMPLEMENTATION.md`
- **Features Overview**: `docs/features/overview.md`

## 🎯 Key Features

✅ Phase-controlled access
✅ Real-time status updates
✅ Comprehensive course details
✅ Weekly schedule views
✅ Anonymized feedback aggregation
✅ Event filtering for faculty
✅ Responsive UI with dark mode
✅ Type-safe APIs

## 💡 Quick Tips

1. **Check Phase**: Always verify `academic_term` flags before testing
2. **Test Feedback**: Ensure `feedback_open = false` to access feedback
3. **Assign Sections**: Faculty only sees courses where `instructor_id = user.id`
4. **Events**: Faculty events filter by `metadata.audience = "faculty"` or no audience
5. **Permissions**: Use helper functions for consistent access control

## 🐛 Common Issues

**Problem**: Faculty dashboard shows no courses
- **Solution**: Check `section.instructor_id` is set and schedule is published

**Problem**: Feedback returns 403 error
- **Solution**: Ensure `academic_term.feedback_open = false`

**Problem**: Events not showing
- **Solution**: Check `term_events` has active term events with correct audience

## 🚦 Status Indicators

- **Green**: Available/Complete
- **Amber**: In Progress/Pending
- **Blue**: Active Now
- **Gray**: Locked/Unavailable

---

**Need Help?** Check the full documentation at `src/docs/features/faculty-features.md`

