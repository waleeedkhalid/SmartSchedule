# Academic API Testing Guide

This directory contains comprehensive tests for the Academic Terms and Events API endpoints.

## Endpoints

### 1. Academic Terms API

#### GET /api/academic/terms
Get all academic terms with optional filtering.

**Query Parameters:**
- `active` (boolean): Filter for active terms only
- `registration_open` (boolean): Filter for terms with open registration
- `electives_survey_open` (boolean): Filter for terms with open elective surveys

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "code": "471",
      "name": "Fall 2024/2025",
      "type": "fall",
      "start_date": "2024-09-01T00:00:00Z",
      "end_date": "2025-01-15T00:00:00Z",
      "is_active": true,
      "registration_open": false,
      "electives_survey_open": false,
      "schedule_published": true,
      "feedback_open": false,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

---

### 2. Academic Events API

#### GET /api/academic/events
Get all term events with optional filtering.

**Query Parameters:**
- `term_code` (string): Filter by term code
- `event_type` (string): Filter by event type (registration, add_drop, elective_survey, etc.)
- `category` (string): Filter by category (academic, registration, exam, administrative)
- `active` (boolean): Filter for currently active events
- `upcoming` (boolean): Filter for upcoming events
- `days_ahead` (number): Number of days to look ahead for upcoming events (default: 30)

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "term_code": "471",
      "title": "Registration Opens",
      "description": "Course registration period opens for all students",
      "event_type": "registration",
      "category": "registration",
      "start_date": "2024-08-15T08:00:00Z",
      "end_date": "2024-08-25T23:59:59Z",
      "is_recurring": false,
      "metadata": {
        "priority": "high",
        "requires_action": true
      },
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ],
  "count": 1
}
```

#### POST /api/academic/events
Create a new term event (Committee role required).

**Request Body:**
```json
{
  "term_code": "471",
  "title": "New Event",
  "description": "Event description",
  "event_type": "academic_milestone",
  "category": "academic",
  "start_date": "2024-10-01T08:00:00Z",
  "end_date": "2024-10-01T23:59:59Z",
  "is_recurring": false,
  "metadata": {
    "priority": "medium"
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "term_code": "471",
    "title": "New Event",
    ...
  }
}
```

#### GET /api/academic/events/[id]
Get a single event by ID.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "term_code": "471",
    "title": "Registration Opens",
    ...
  }
}
```

#### PATCH /api/academic/events/[id]
Update an existing event (Committee role required).

**Request Body (partial update):**
```json
{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### DELETE /api/academic/events/[id]
Delete an event (Committee role required).

**Example Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

---

### 3. Academic Timeline API

#### GET /api/academic/timeline/[term_code]
Get comprehensive timeline for a specific academic term.

**Query Parameters:**
- `days_ahead` (number): Number of days to look ahead for upcoming events (default: 30)

**Example Response:**
```json
{
  "success": true,
  "data": {
    "term": {
      "code": "471",
      "name": "Fall 2024/2025",
      "type": "fall",
      "start_date": "2024-09-01T00:00:00Z",
      "end_date": "2025-01-15T00:00:00Z",
      "is_active": true,
      "progress_percentage": 45,
      "days_total": 137,
      "days_elapsed": 62,
      "days_remaining": 75
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
      "total_events": 11,
      "active_events": 1,
      "upcoming_events": 5,
      "completed_events": 5,
      "by_category": {
        "academic": 4,
        "registration": 3,
        "exam": 3,
        "administrative": 1
      }
    }
  }
}
```

**Enriched Event Fields:**
- `status`: "completed" | "active" | "upcoming"
- `days_until`: Number of days until event starts (upcoming events only)
- `days_since`: Number of days since event ended (completed events only)
- `duration_days`: Total duration of event in days

---

## Event Types

The following event types are supported:
- `registration` - Course registration periods
- `add_drop` - Add/drop periods
- `elective_survey` - Elective preference surveys
- `midterm_exam` - Midterm examination periods
- `final_exam` - Final examination periods
- `break` - Academic breaks
- `grade_submission` - Grade submission deadlines
- `feedback_period` - Feedback collection periods
- `schedule_publish` - Schedule publication events
- `academic_milestone` - Important academic dates (e.g., first day of classes)
- `other` - Other events

## Event Categories

Events are organized into the following categories:
- `academic` - General academic events
- `registration` - Registration-related events
- `exam` - Examination periods
- `administrative` - Administrative deadlines and events

---

## Running Tests

### Unit Tests with Vitest

```bash
npm run test tests/api/academic/academic.test.ts
```

### Manual API Testing

Use the provided test script:

```bash
chmod +x tests/api/academic/test-academic-api.sh
./tests/api/academic/test-academic-api.sh
```

Or use curl commands directly:

```bash
# Get all terms
curl -X GET http://localhost:3000/api/academic/terms \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get events for a term
curl -X GET "http://localhost:3000/api/academic/events?term_code=471" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Get timeline for a term
curl -X GET http://localhost:3000/api/academic/timeline/471 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

1. **Authentication**: All endpoints require authentication. Include a valid session token in your requests.

2. **Authorization**: POST, PATCH, and DELETE operations on events require committee role (`scheduling_committee`, `teaching_load_committee`, or `registrar`).

3. **Date Formats**: All dates are in ISO 8601 format with timezone information.

4. **Metadata**: The `metadata` field is a flexible JSONB field for storing additional event-specific information.

5. **RLS Policies**: Row Level Security policies ensure users can only see appropriate data based on their role.

---

## Common Use Cases

### Get upcoming events for the current term
```bash
GET /api/academic/events?term_code=471&upcoming=true&days_ahead=30
```

### Get all active registration events
```bash
GET /api/academic/events?event_type=registration&active=true
```

### Get full timeline view for a term
```bash
GET /api/academic/timeline/471
```

### Check which terms have registration open
```bash
GET /api/academic/terms?registration_open=true
```

