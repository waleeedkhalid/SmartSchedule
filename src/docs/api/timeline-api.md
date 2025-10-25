# Timeline API Documentation

## Overview

The Timeline API provides access to academic calendar events and timeline-based feature gating. This API is central to the dynamic feature availability system, controlling when students can submit feedback, register for courses, or participate in elective surveys.

**Base Path:** `/api/academic`

---

## Feature Gating System

The timeline system uses **event-based feature gating** to dynamically control feature availability based on date ranges stored in the `term_events` table.

### Key Event Types for Gating

| Event Type | Feature | Page | Gating Logic |
|------------|---------|------|--------------|
| `elective_survey` | Elective Preference Survey | `/student/electives` | Survey available when `NOW()` is between event's `start_date` and `end_date` |
| `feedback_period` | Course Feedback | `/student/feedback` | Feedback available when `NOW()` is between event's `start_date` and `end_date` |
| `registration` | Course Registration | Future feature | Registration available during event period |

### How It Works

1. **Event Creation**: Committee members create timeline events with specific date ranges
2. **API Checks**: APIs query `term_events` to check if current time falls within event periods
3. **Feature Gates**: UI components check status from APIs to enable/disable features
4. **Dynamic Updates**: No code changes needed to change availability - just update event dates

---

## Endpoints

### 1. Get All Events

**Endpoint:** `GET /api/academic/events`

**Description:** Retrieve all term events with optional filtering.

**Authentication:** Required

**Query Parameters:**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `term_code` | string | Filter by term code | `471` |
| `event_type` | string | Filter by event type | `elective_survey` |
| `category` | string | Filter by category | `registration` |
| `active` | boolean | Only active events (currently happening) | `true` |
| `upcoming` | boolean | Only upcoming events | `true` |
| `days_ahead` | number | Days to look ahead for upcoming events | `30` |

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "term_code": "471",
      "title": "Elective Preference Survey",
      "description": "Students must submit their elective preferences",
      "event_type": "elective_survey",
      "category": "registration",
      "start_date": "2024-08-10T08:00:00+03:00",
      "end_date": "2024-08-22T23:59:59+03:00",
      "is_recurring": false,
      "metadata": {
        "priority": "high",
        "requires_action": true,
        "url": "/student/electives"
      },
      "created_at": "2024-07-01T10:00:00Z",
      "updated_at": "2024-07-01T10:00:00Z"
    }
  ],
  "count": 1
}
```

**Example Requests:**

```bash
# Get all events for Fall 2024
curl -X GET "https://api.example.com/api/academic/events?term_code=471"

# Get currently active events
curl -X GET "https://api.example.com/api/academic/events?active=true"

# Get upcoming registration events in next 14 days
curl -X GET "https://api.example.com/api/academic/events?upcoming=true&category=registration&days_ahead=14"

# Get all elective survey events
curl -X GET "https://api.example.com/api/academic/events?event_type=elective_survey"
```

---

### 2. Get Timeline for Term

**Endpoint:** `GET /api/academic/timeline/:term_code`

**Description:** Get comprehensive timeline data for a specific term, including enriched events and statistics.

**Authentication:** Required

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `term_code` | string | Term code (e.g., "471") |

**Response:**

```json
{
  "success": true,
  "data": {
    "term": {
      "code": "471",
      "name": "Fall 2024/2025",
      "type": "FALL",
      "start_date": "2024-09-01",
      "end_date": "2025-01-15",
      "is_active": true,
      "progress_percentage": 45,
      "days_total": 137,
      "days_elapsed": 62,
      "days_remaining": 75,
      "registration_open": false,
      "electives_survey_open": true,
      "schedule_published": true,
      "feedback_open": false
    },
    "events": {
      "all": [...],
      "by_category": {
        "academic": [...],
        "registration": [...],
        "exam": [...],
        "administrative": [...]
      },
      "active": [...],
      "upcoming": [...]
    },
    "statistics": {
      "total_events": 12,
      "active_events": 1,
      "upcoming_events": 8,
      "completed_events": 3,
      "by_category": {
        "academic": 4,
        "registration": 3,
        "exam": 3,
        "administrative": 2
      }
    }
  }
}
```

**Event Enrichment:**

Each event in the timeline response includes computed fields:
- `status`: "completed" | "active" | "upcoming"
- `days_until`: Days until event starts (for upcoming events)
- `days_since`: Days since event ended (for completed events)
- `duration_days`: Total duration in days
- `progress_percentage`: Completion percentage (for active events)

---

### 3. Create Event

**Endpoint:** `POST /api/academic/events`

**Description:** Create a new timeline event.

**Authentication:** Required (Committee role)

**Permissions:** Scheduling Committee, Teaching Load Committee, or Registrar

**Request Body:**

```json
{
  "term_code": "471",
  "title": "Elective Preference Survey",
  "description": "Students must submit their elective preferences",
  "event_type": "elective_survey",
  "category": "registration",
  "start_date": "2024-08-10T08:00:00+03:00",
  "end_date": "2024-08-22T23:59:59+03:00",
  "is_recurring": false,
  "metadata": {
    "priority": "high",
    "requires_action": true,
    "url": "/student/electives",
    "notification": true
  }
}
```

**Validation Rules:**
- `term_code`: Must reference existing term
- `title`: Required, non-empty
- `event_type`: Must be valid enum value
- `start_date`: Required, ISO 8601 format
- `end_date`: Required, must be >= `start_date`
- `category`: Defaults to "academic" if not provided

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "term_code": "471",
    "title": "Elective Preference Survey",
    ...
  }
}
```

---

### 4. Update Event

**Endpoint:** `PATCH /api/academic/events/:id`

**Description:** Update an existing timeline event.

**Authentication:** Required (Committee role)

**Path Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | UUID | Event ID |

**Request Body:** (All fields optional)

```json
{
  "title": "Updated Title",
  "start_date": "2024-08-11T08:00:00+03:00",
  "end_date": "2024-08-23T23:59:59+03:00",
  "metadata": {
    "priority": "medium"
  }
}
```

---

### 5. Delete Event

**Endpoint:** `DELETE /api/academic/events/:id`

**Description:** Delete a timeline event.

**Authentication:** Required (Committee role)

**Response:**

```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

## Student Status API

### Get Student Status

**Endpoint:** `GET /api/student/status`

**Description:** Get student status including timeline-based feature availability.

**Authentication:** Required (Student role)

**Response:**

```json
{
  "success": true,
  "data": {
    "hasSchedule": true,
    "scheduleId": "uuid",
    "schedulePublished": true,
    
    "feedbackOpen": true,
    "canSubmitFeedback": true,
    "hasSubmittedFeedback": false,
    "feedbackEvent": {
      "title": "Course Feedback Period",
      "startDate": "2024-12-15T08:00:00+03:00",
      "endDate": "2025-01-10T23:59:59+03:00"
    },
    
    "electiveSurveyOpen": true,
    "canSubmitElectives": true,
    "hasSubmittedPreferences": false,
    "electiveEvent": {
      "title": "Elective Preference Survey",
      "startDate": "2024-08-10T08:00:00+03:00",
      "endDate": "2024-08-22T23:59:59+03:00"
    },
    
    "activeTerm": "Fall 2024/2025",
    "activeTermCode": "471"
  }
}
```

**Feature Gate Logic:**

```typescript
// Feedback availability
feedbackOpen = EXISTS(
  SELECT 1 FROM term_events 
  WHERE event_type = 'feedback_period' 
  AND NOW() BETWEEN start_date AND end_date
)

canSubmitFeedback = hasSchedule AND feedbackOpen AND NOT hasSubmittedFeedback

// Elective survey availability
electiveSurveyOpen = EXISTS(
  SELECT 1 FROM term_events 
  WHERE event_type = 'elective_survey' 
  AND NOW() BETWEEN start_date AND end_date
)

canSubmitElectives = electiveSurveyOpen AND NOT hasSubmittedPreferences
```

---

## Event Types Reference

### Complete Event Type List

| Event Type | Category | Typical Duration | Feature Gating |
|------------|----------|------------------|----------------|
| `registration` | registration | 1-2 weeks | Course registration (future) |
| `add_drop` | registration | 2 weeks | Add/drop courses (future) |
| `elective_survey` | registration | 1-2 weeks | **Elective preferences** |
| `midterm_exam` | exam | 1 week | No gating |
| `final_exam` | exam | 1-2 weeks | No gating |
| `break` | academic | 1 week | No gating |
| `grade_submission` | administrative | 1 day | Faculty feature (future) |
| `feedback_period` | academic | 2-4 weeks | **Course feedback** |
| `schedule_publish` | administrative | Instant | No gating |
| `academic_milestone` | academic | Varies | No gating |
| `other` | academic | Varies | No gating |

---

## Event Metadata Schema

Event metadata is stored as JSONB and supports flexible key-value pairs:

### Common Metadata Fields

```typescript
interface EventMetadata {
  // Priority level
  priority?: "high" | "medium" | "low";
  
  // Whether event requires user action
  requires_action?: boolean;
  
  // Associated URL for action
  url?: string;
  
  // Custom icon name
  icon?: string;
  
  // Send notifications
  notification?: boolean;
  
  // Target audience
  audience?: "all" | "student" | "faculty" | "committee";
  
  // Exam-specific
  exam_type?: "midterm1" | "midterm2" | "final";
  
  // Custom fields
  [key: string]: any;
}
```

### Example Metadata Configurations

**Elective Survey:**
```json
{
  "priority": "high",
  "requires_action": true,
  "url": "/student/electives",
  "notification": true,
  "audience": "student"
}
```

**Feedback Period:**
```json
{
  "priority": "medium",
  "requires_action": true,
  "url": "/student/feedback",
  "notification": false,
  "audience": "student"
}
```

**Exam Period:**
```json
{
  "priority": "high",
  "exam_type": "final",
  "notification": true,
  "audience": "all"
}
```

---

## Error Responses

### Common Errors

**401 Unauthorized:**
```json
{
  "error": "Unauthorized"
}
```

**403 Forbidden:**
```json
{
  "error": "Insufficient permissions. Committee role required."
}
```

**400 Bad Request:**
```json
{
  "error": "Missing required fields: term_code, title, event_type, start_date, end_date"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch term events",
  "details": "Database connection error"
}
```

---

## Integration Examples

### Frontend Integration

#### Check Feature Availability

```typescript
// In a React component
const { data: status } = useSWR('/api/student/status');

if (status?.canSubmitFeedback) {
  // Show feedback form
} else if (status?.feedbackOpen && status?.hasSubmittedFeedback) {
  // Show "already submitted" message
} else {
  // Show "feedback period closed" message
}
```

#### Display Timeline

```typescript
// Fetch timeline data
const { data: timeline } = useSWR('/api/academic/timeline/471');

// Display active events
timeline?.events.active.map(event => (
  <EventCard
    key={event.id}
    title={event.title}
    status={event.status}
    progress={event.progress_percentage}
  />
));
```

---

## Testing

### Manual Testing Scenarios

1. **Test Feature Gating:**
   - Create elective survey event for current time period
   - Verify `/student/electives` page is accessible
   - Update event end_date to past
   - Verify page shows "survey closed" message

2. **Test Multiple Events:**
   - Create overlapping events
   - Verify all active events appear in `active=true` query
   - Check student status API shows correct flags

3. **Test Permissions:**
   - Try creating event as student (should fail)
   - Try creating event as committee member (should succeed)

### API Testing with curl

```bash
# Test active events
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.example.com/api/academic/events?active=true"

# Test student status
curl -H "Authorization: Bearer $TOKEN" \
  "https://api.example.com/api/student/status"

# Create test event (requires committee role)
curl -X POST \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "term_code": "471",
    "title": "Test Survey",
    "event_type": "elective_survey",
    "category": "registration",
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-12-31T23:59:59Z"
  }' \
  "https://api.example.com/api/academic/events"
```

---

## Best Practices

### When Creating Events

1. **Use Timezone-Aware Dates:** Always include timezone offset (e.g., `+03:00` for Saudi Arabia)
2. **Set Reasonable Durations:** 
   - Surveys: 1-2 weeks
   - Feedback: 2-4 weeks
   - Registration: 1-2 weeks
3. **Include Metadata:** Add `priority`, `requires_action`, and `url` for better UX
4. **Avoid Overlaps:** Don't create overlapping events of the same type unless intentional

### When Implementing Feature Gates

1. **Check Both Flags:** Verify `canSubmit*` flags, not just `*Open` flags
2. **Show Clear Messages:** When feature is closed, show why and when it opens
3. **Handle Edge Cases:** Consider what happens at exact start/end times
4. **Cache Status Data:** Use SWR or similar to avoid excessive API calls

---

## Related Documentation

- [Schema Documentation](../../docs/schema/overview.md) - Database schema including `term_events` table
- [Timeline Feature Summary](../../src/docs/TIMELINE-FEATURE-SUMMARY.md) - Feature implementation details
- [Academic Events Migration](../../supabase/migrations/20250126_academic_events.sql) - Database migration

---

**Last Updated:** 2025-10-25

