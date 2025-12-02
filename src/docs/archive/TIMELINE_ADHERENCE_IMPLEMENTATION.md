# Timeline Adherence System - Implementation Summary

**Date:** October 29, 2025  
**Feature:** Timeline Adherence and Deadline Notification System  
**PRD Requirement:** "It shall respect the university's scheduling timeline and enable notifications to stakeholders to adhere to deadlines."

## Overview

The Timeline Adherence System is a comprehensive deadline tracking and notification system that helps the university manage its scheduling timeline and automatically notify stakeholders about upcoming deadlines. The system ensures all participants (faculty, students, registrars, and administrators) stay informed about important dates and required actions.

## Key Features

### 1. Timeline Event Management
- **Create and manage timeline events** with start/end dates, priorities, and categories
- **Event types** support registration, exams, administrative, and academic activities
- **Priority levels**: Low, Medium, High, Critical
- **Status tracking**: Upcoming, In Progress, Completed, Overdue, Cancelled
- **Action flags**: Mark events as requiring user action or hard deadlines

### 2. Automated Deadline Notifications
- **Configurable notification schedules** (e.g., 14, 7, 3, 1 days before deadline)
- **Role-based targeting** (send notifications only to relevant user groups)
- **Duplicate prevention** through notification logging
- **Bulk notifications** for efficient delivery to multiple users
- **Manual and automated** deadline checking

### 3. User Dashboards
- **Timeline Management Dashboard** for scheduling and registrar roles
- **Upcoming Deadlines Widget** for all user dashboards
- **Statistics and analytics** showing event counts and statuses
- **Overdue event alerts** with visual warnings
- **Tabbed interface** for filtering events (All, Upcoming, In Progress, Overdue, Completed)

## Database Schema

### Tables

#### `semester_timeline` (Enhanced)
Existing table enhanced with notification capabilities:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| term_code | TEXT | Links to academic semester |
| title | TEXT | Event title |
| description | TEXT | Event description |
| event_type | TEXT | Type of event (e.g., registration, faculty_availability) |
| category | TEXT | Category (registration, academic, exam, administrative) |
| start_date | TIMESTAMPTZ | Event start date |
| end_date | TIMESTAMPTZ | Event end date/deadline |
| **requires_action** | BOOLEAN | Whether users must take action |
| **target_roles** | TEXT[] | Roles to notify (scheduling, faculty, student, etc.) |
| **notification_days_before** | INTEGER[] | Days before to send notifications |
| **is_deadline** | BOOLEAN | Whether this is a hard deadline |
| **priority** | TEXT | Priority level (low, medium, high, critical) |
| **status** | TEXT | Current status (upcoming, in_progress, etc.) |

#### `timeline_notification_log` (New)
Tracks sent notifications to prevent duplicates:

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| timeline_event_id | UUID | Reference to timeline event |
| notification_id | UUID | Reference to notification sent |
| sent_at | TIMESTAMPTZ | When notification was sent |
| days_before | INTEGER | Days before event notification was sent |
| recipient_role | TEXT | Role that received notification |
| recipient_count | INTEGER | Number of users notified |

### Helper Functions

| Function | Description |
|----------|-------------|
| `get_upcoming_deadlines_for_role(role, days_ahead)` | Get upcoming deadlines for a specific user role |
| `get_overdue_events()` | Find all overdue deadline events |
| `get_events_needing_notifications()` | Identify events that need notifications sent |
| `update_timeline_event_statuses()` | Auto-update event statuses based on current date |
| `get_timeline_statistics(semester)` | Generate summary statistics for timeline events |
| `has_notification_been_sent(event, days, role)` | Check if notification already sent |

## API Endpoints

### `/api/timeline`

**GET** - Retrieve timeline events
- Query parameters:
  - `semester` - Filter by semester code
  - `status` - Filter by status (upcoming, in_progress, etc.)
  - `priority` - Filter by priority level
  - `category` - Filter by category
  - `actionRequired=true` - Get only events requiring action
  - `role=<role_name>` - Get upcoming deadlines for specific role
  - `overdue=true` - Get overdue events
  - `stats=true` - Get statistics summary

**POST** - Create new timeline event
- Requires: scheduling or registrar role
- Body: Event details (term_code, title, dates, target_roles, etc.)

### `/api/timeline/[id]`

**GET** - Get specific timeline event
- Query parameter: `logs=true` to include notification logs

**PATCH** - Update timeline event
- Requires: scheduling or registrar role

**DELETE** - Delete timeline event
- Requires: scheduling role only

### `/api/timeline/check-deadlines`

**POST** - Trigger deadline check and send notifications
- Can be called by:
  - Scheduling role (manual trigger)
  - Cron job with `Authorization: Bearer <CRON_SECRET>`
- Returns: Count of notifications sent and details

**GET** - Preview notifications that would be sent
- Requires: scheduling role
- Returns: List of events and recipient counts

## UI Components

### Timeline Management Dashboard
**Route:** `/dashboard/timeline`  
**Access:** Scheduling and Registrar roles

Features:
- View all timeline events with filtering and sorting
- Create new events with comprehensive form
- Edit existing events
- Mark events as completed or cancelled
- View statistics (total, upcoming, in progress, overdue, completed)
- Manually trigger deadline checks
- Filter by semester
- Tabbed interface for different event statuses

### Upcoming Deadlines Widget
**Component:** `<UpcomingDeadlinesWidget />`  
**Usage:** Can be added to any dashboard

Features:
- Shows role-specific upcoming deadlines
- Displays days until deadline with urgency colors
- Highlights action-required items
- Compact and full display modes
- Priority badges
- Link to full timeline view

### Timeline Events Table
**Component:** `<TimelineEventsTable />`

Features:
- Sortable columns
- Priority and status badges
- Days until deadline countdown
- Action menus (edit, complete, cancel, delete)
- Role targeting display
- Responsive design

### Timeline Event Form
**Component:** `<TimelineEventForm />`

Features:
- Date/time pickers for start and end dates
- Priority and category selection
- Role targeting with multi-select
- Notification day selection
- Action required and deadline flags
- Description field
- Validation

## Notification System Integration

### Notification Type: `timeline_deadline`

Payload structure:
```json
{
  "event_id": "uuid",
  "event_title": "Faculty Availability Submission",
  "event_type": "faculty_availability",
  "category": "administrative",
  "start_date": "2025-11-05T00:00:00Z",
  "end_date": "2025-11-20T00:00:00Z",
  "days_before": 7,
  "priority": "high",
  "description": "Faculty must submit availability..."
}
```

### Notification Flow

1. **Cron job** calls `/api/timeline/check-deadlines` daily
2. System calls `get_events_needing_notifications()` function
3. For each event needing notification:
   - Get all users with target role
   - Create bulk notifications
   - Log notification to prevent duplicates
4. Users receive notifications in their notification center
5. Notification includes event details and days until deadline

## Sample Timeline Events

Six sample events are automatically created for the active semester:

1. **Faculty Availability Submission**
   - Type: faculty_availability
   - Target: faculty
   - Notifications: 14, 7, 3, 1 days before
   - Priority: High

2. **Elective Preferences Survey**
   - Type: elective_survey
   - Target: student
   - Notifications: 7, 3, 1 days before
   - Priority: High

3. **Schedule Generation Deadline**
   - Type: schedule_generation
   - Target: scheduling
   - Notifications: 7, 3, 1 days before
   - Priority: Critical

4. **Schedule Publication**
   - Type: schedule_publication
   - Target: All roles
   - Notifications: 3, 1 days before
   - Priority: High

5. **Course Registration Period**
   - Type: registration
   - Target: student
   - Notifications: 7, 3, 1 days before
   - Priority: High

6. **Teaching Load Review**
   - Type: teaching_load_review
   - Target: teaching_load
   - Notifications: 7, 3 days before
   - Priority: Medium

## User Workflows

### For Scheduling Committee

1. **Access Timeline Dashboard**
   - Navigate to Dashboard → Timeline
   - View all timeline events

2. **Create New Deadline**
   - Click "New Event" button
   - Fill in event details:
     - Title and description
     - Event type and category
     - Start and end dates
     - Priority level
     - Target roles
     - Notification schedule
   - Mark as action-required if needed
   - Submit to create

3. **Monitor Deadlines**
   - View statistics cards showing event counts
   - Check overdue events (red alert)
   - Filter by status or semester
   - Manually trigger deadline check

4. **Manage Events**
   - Edit event details
   - Mark events as completed
   - Cancel events that are no longer needed
   - Delete obsolete events

### For Faculty

1. **View Upcoming Deadlines**
   - See deadlines widget on faculty dashboard
   - View only faculty-relevant deadlines

2. **Track Action Items**
   - Identify action-required items (highlighted)
   - See days until deadline
   - Understand priority levels

3. **Receive Notifications**
   - Get in-app notifications at scheduled intervals
   - View notification details
   - Mark as read when addressed

### For Students

1. **Stay Informed**
   - View upcoming deadlines widget
   - See registration and survey deadlines
   - Track course-related dates

2. **Take Action**
   - Respond to action-required notifications
   - Complete surveys before deadline
   - Register during open periods

### For Registrars

1. **Manage Timeline**
   - Create and edit timeline events
   - Monitor deadlines alongside scheduling team
   - Track registration periods

2. **Monitor Compliance**
   - View overdue events
   - Ensure stakeholders meet deadlines
   - Trigger manual deadline checks

## Production Setup

### Environment Variables

Add to `.env` or `.env.local`:
```env
CRON_SECRET=<generate-secure-random-token>
```

Generate a secure token:
```bash
openssl rand -base64 32
```

### Cron Job Setup

**Vercel (Recommended):**

Create `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/timeline/check-deadlines",
      "schedule": "0 8 * * *"
    }
  ]
}
```

**Manual Cron (Alternative):**
```bash
0 8 * * * curl -X POST https://your-domain.com/api/timeline/check-deadlines \
  -H "Authorization: Bearer $CRON_SECRET"
```

Recommended schedule: **Daily at 8:00 AM**

### Database Migration

Migration is already applied. To verify:
```bash
pnpm db:status
```

To re-apply all migrations:
```bash
pnpm db:reset
```

## Testing Guide

### 1. Test Timeline Creation

1. Login as scheduling user
2. Navigate to `/dashboard/timeline`
3. Click "New Event"
4. Create a test event:
   - Title: "Test Deadline"
   - Start date: 2 days from now
   - End date: 5 days from now
   - Target roles: Select your role
   - Notification days: 3, 1
   - Priority: High
   - Mark as action-required
5. Submit and verify event appears in table

### 2. Test Deadline Notifications

1. Manually trigger deadline check:
   - Go to `/dashboard/timeline`
   - Click "Check Deadlines" button
2. Verify notifications appear:
   - Go to `/dashboard/notifications`
   - Check for timeline_deadline notifications
3. Verify notification log:
   - Edit the event
   - Check notification logs (if implemented in UI)

### 3. Test User Views

1. **As Faculty:**
   - Login as faculty user
   - Create event targeting faculty role
   - Verify widget shows the deadline

2. **As Student:**
   - Login as student user
   - Create event targeting student role
   - Verify deadline appears in widget

### 4. Test Status Updates

1. Create event with start date in the past
2. Trigger deadline check
3. Verify status changes to "in_progress"
4. Create event with end date in the past
5. Mark as deadline
6. Verify status changes to "overdue"

## Monitoring and Maintenance

### Check Notification Logs

Query to see recent notifications:
```sql
SELECT 
  tl.title,
  tnl.recipient_role,
  tnl.recipient_count,
  tnl.days_before,
  tnl.sent_at
FROM timeline_notification_log tnl
JOIN semester_timeline tl ON tnl.timeline_event_id = tl.id
ORDER BY tnl.sent_at DESC
LIMIT 20;
```

### View Overdue Events

```sql
SELECT title, end_date, priority, target_roles
FROM semester_timeline
WHERE is_deadline = true
  AND end_date < NOW()
  AND status NOT IN ('completed', 'cancelled')
ORDER BY priority DESC, end_date ASC;
```

### Monitor Event Statistics

```sql
SELECT 
  status,
  priority,
  COUNT(*) as count
FROM semester_timeline
GROUP BY status, priority
ORDER BY status, priority;
```

## Troubleshooting

### Notifications Not Sending

1. **Check cron job is running:**
   - Verify cron configuration
   - Check cron logs
   - Test manual trigger via API

2. **Verify notification window:**
   - Events must be within the notification window
   - Start date should be within configured days

3. **Check for duplicate prevention:**
   - Query `timeline_notification_log`
   - Notifications only sent once per event/role/days_before combination

4. **Verify target roles:**
   - Ensure users exist with target roles
   - Check user_roles table

### Events Not Showing

1. **Check semester filter:**
   - Ensure correct semester is selected
   - Events are tied to specific semesters

2. **Verify RLS policies:**
   - All users can view events
   - Only scheduling/registrar can create

3. **Check event status:**
   - Use appropriate tab (All, Upcoming, etc.)
   - Completed events won't show in Upcoming

## Benefits

### Automated Compliance
- Reduces manual reminder work
- Ensures consistent notification timing
- Prevents missed deadlines

### Role-Based Targeting
- Users only see relevant deadlines
- Reduces notification fatigue
- Improves engagement

### Audit Trail
- Complete log of notifications sent
- Tracking of event completion
- Accountability for deadline adherence

### Scalability
- Handle unlimited timeline events
- Bulk notifications to thousands of users
- Efficient duplicate prevention

### Flexibility
- Configurable notification schedules
- Multiple priority levels
- Customizable event types

## Future Enhancements

### Phase 2 Possibilities
1. **Calendar Visualization**
   - Full calendar view of timeline
   - Drag-and-drop event management
   - Month/week/day views

2. **Email Notifications**
   - Send emails in addition to in-app
   - Configurable email templates
   - Digest emails for multiple deadlines

3. **Recurring Events**
   - Template events for common deadlines
   - Auto-create events for new semesters
   - Recurring patterns (weekly, monthly, annually)

4. **Analytics Dashboard**
   - Deadline adherence rates
   - User engagement metrics
   - Event completion tracking

5. **External Calendar Integration**
   - iCal export
   - Google Calendar sync
   - Outlook integration

6. **Escalation System**
   - Send reminders for overdue items
   - Escalate to supervisors
   - Automated follow-ups

## Related Documentation

- [Timeline Migration](supabase/migrations/20251029120001_timeline_adherence_notifications.sql)
- [Database Layer](lib/db/timeline.ts)
- [API Routes](app/api/timeline/)
- [UI Components](components/timeline-*.tsx)
- [Timeline Dashboard](app/(dashboard)/dashboard/timeline/)
- [Development Timeline](timeline.md)

## Summary

The Timeline Adherence System provides a robust, scalable solution for managing scheduling deadlines and automatically notifying stakeholders. With role-based targeting, configurable notifications, and comprehensive management tools, the system ensures the university can maintain its scheduling timeline and keep all participants informed about important dates and required actions.

**Implementation Status:** ✅ Complete and Ready for Testing
**Production Readiness:** Requires cron job configuration
**Next Steps:** Functional testing and cron job deployment

