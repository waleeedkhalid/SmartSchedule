## SmartSchedule API Reference

**Base URL**: `/api`  
**Data Storage**: In-memory JSON (Phase 3)  
**Authentication**: Mock user IDs (Phase 4+ will add real auth)

---

### 🗓️ Sections

#### `GET /api/sections`

Get all sections with full details (course, instructor, room, meetings).

**Response**:

```json
[
  {
    "id": "uuid",
    "courseId": "uuid",
    "index": 1,
    "capacity": 25,
    "instructorId": "uuid",
    "roomId": "uuid",
    "enrollmentCount": 0,
    "course": {
      /* Course object */
    },
    "instructor": {
      /* Instructor object */
    },
    "room": {
      /* Room object */
    },
    "meetings": [
      {
        "id": "uuid",
        "sectionId": "uuid",
        "timeSlotId": "uuid",
        "kind": "LECTURE",
        "timeSlot": {
          /* TimeSlot object */
        }
      }
    ]
  }
]
```

#### `POST /api/sections`

Create a new section.

**Request Body**:

```json
{
  "courseId": "uuid",
  "index": 1,
  "capacity": 25,
  "instructorId": "uuid",
  "roomId": "uuid"
}
```

**Response**: `201 Created` with section object

#### `PATCH /api/sections/:id`

Update a section.

**Request Body**: Partial section object  
**Response**: Updated section object

#### `DELETE /api/sections/:id`

Delete a section (also deletes associated meetings).

**Response**: `{ "success": true }`

---

### 📅 Meetings

#### `POST /api/meetings`

Create a meeting for a section.

**Request Body**:

```json
{
  "sectionId": "uuid",
  "timeSlotId": "uuid",
  "kind": "LECTURE" | "LAB"
}
```

**Response**: `201 Created`

```json
{
  "meeting": {
    /* Meeting object */
  },
  "conflicts": [
    /* Array of conflicts if any */
  ]
}
```

#### `DELETE /api/meetings/:id`

Delete a meeting.

**Response**: `{ "success": true }`

---

### 📝 Exams

#### `GET /api/exams`

Get all exams with course details.

**Response**:

```json
[
  {
    "id": "uuid",
    "courseId": "uuid",
    "kind": "MIDTERM" | "MIDTERM2" | "FINAL",
    "date": "2025-10-15",
    "startTime": "12:00",
    "durationMinutes": 90,
    "roomIds": ["uuid"],
    "course": { /* Course object */ }
  }
]
```

#### `POST /api/exams`

Create an exam.

**Request Body**:

```json
{
  "courseId": "uuid",
  "kind": "MIDTERM",
  "date": "2025-10-15",
  "startTime": "12:00",
  "durationMinutes": 90,
  "roomIds": ["uuid"]
}
```

**Response**: `201 Created` with exam and conflicts

#### `PATCH /api/exams/:id`

Update an exam.

**Response**: Updated exam with conflict check

#### `DELETE /api/exams/:id`

Delete an exam.

---

### 🌐 External Slots (Non-SWE Courses)

#### `GET /api/external-slots`

Get all external course slots.

**Response**:

```json
[
  {
    "id": "uuid",
    "sourceDepartment": "CSC",
    "courseCode": "CS111",
    "courseName": "Computer Science I",
    "dayOfWeek": "MONDAY",
    "startTime": "08:00",
    "endTime": "09:15",
    "sectionCount": 3,
    "capacity": 90
  }
]
```

#### `POST /api/external-slots`

Create external slot (Registrar/Committee only).

**Request Body**: ExternalSlot fields  
**Response**: `201 Created`

#### `DELETE /api/external-slots/:id`

Delete external slot.

---

### 📚 Courses

#### `GET /api/courses`

Get all courses with optional filters.

**Query Params**:

- `type`: `ELECTIVE` | `REQUIRED`
- `level`: `200` | `300` | `400`

**Response**: Array of courses

---

### 🎓 Student Preferences

#### `GET /api/preferences`

Get current student's elective preferences.

**Response**:

```json
[
  {
    "id": "uuid",
    "studentUserId": "uuid",
    "courseId": "uuid",
    "priority": 1,
    "course": {
      /* Course object */
    }
  }
]
```

#### `POST /api/preferences`

Save student preferences (max 6).

**Request Body**:

```json
{
  "preferences": [
    { "courseId": "uuid", "priority": 1 },
    { "courseId": "uuid", "priority": 2 }
  ]
}
```

**Response**: `201 Created` with preferences

---

### 📆 Schedule (Student View)

#### `GET /api/schedule/public`

Get published schedule for students (SWE + external).

**Response**:

```json
{
  "sweSections": [
    /* Array of enriched sections */
  ],
  "externalSlots": [
    /* Array of external slots */
  ],
  "studentId": "uuid"
}
```

---

### 👥 Irregular Students

#### `GET /api/irregular`

Get all irregular students.

**Response**: Array of irregular students with course details

#### `POST /api/irregular`

Create irregular student entry.

**Request Body**:

```json
{
  "studentName": "John Doe",
  "studentEmail": "john@example.com",
  "remainingCourses": ["courseId1", "courseId2"],
  "notes": "Needs SWE312 and SWE314"
}
```

#### `PATCH /api/irregular/:id`

Update irregular student.

#### `DELETE /api/irregular/:id`

Delete irregular student.

---

### 📋 Rules

#### `GET /api/rules`

Get all scheduling rules.

**Response**:

```json
[
  {
    "id": "uuid",
    "key": "BREAK_TIME",
    "label": "Break Time",
    "description": "No classes during 12:00-13:00",
    "active": true,
    "valueJson": "{\"startTime\":\"12:00\",\"endTime\":\"13:00\"}"
  }
]
```

#### `POST /api/rules`

Create new rule.

#### `PATCH /api/rules/:id`

Update rule (toggle active, change values).

---

### 💬 Comments

#### `GET /api/comments?targetType=SECTION&targetId=uuid`

Get comments for a specific target.

**Response**: Array of comments

#### `POST /api/comments`

Create a comment.

**Request Body**:

```json
{
  "targetType": "SECTION" | "EXAM" | "ASSIGNMENT" | "SCHEDULE",
  "targetId": "uuid",
  "text": "This section has a conflict..."
}
```

---

### 🔔 Notifications

#### `GET /api/notifications`

Get current user's notifications.

**Response**: Array of notifications

#### `PATCH /api/notifications/:id`

Mark notification as read.

---

### 👨‍🏫 Faculty

#### `GET /api/faculty/assignments`

Get faculty member's assigned sections.

**Response**: Array of sections with meetings

---

### ⚖️ Teaching Load

#### `GET /api/load/overview`

Get instructor load overview.

**Response**:

```json
[
  {
    "instructor": {
      /* Instructor object */
    },
    "sections": [
      /* Array of sections */
    ],
    "totalHours": 12.5,
    "isOverloaded": false
  }
]
```

---

### ⚠️ Conflicts

#### `GET /api/conflicts`

Run conflict check and get all conflicts.

**Response**:

```json
{
  "isValid": false,
  "conflicts": [
    {
      "id": "uuid",
      "type": "INSTRUCTOR_CONFLICT",
      "severity": "ERROR",
      "ruleKey": null,
      "affectedEntities": [
        { "type": "meeting", "id": "uuid", "label": "SWE312 - MONDAY 08:00" }
      ],
      "message": "Instructor has overlapping meeting times",
      "detectedAt": "2025-09-30T..."
    }
  ]
}
```

---

## Rules Enforced

1. **BREAK_TIME**: No meetings 12:00-13:00
2. **MIDTERM_WINDOW**: Midterms on Mon/Wed 12:00-14:00 only
3. **LAB_CONTINUOUS_BLOCK**: Labs must be 2-hour continuous blocks
4. **ELECTIVE_MULTI_LEVEL**: Electives accessible to multiple levels (soft check)
5. **PREREQUISITE_COSCHEDULE**: Prerequisites can be co-scheduled (soft check)
6. **BALANCED_DISTRIBUTION**: Balance electives and day-off (soft check)

**Hard conflicts** (ERROR): Time conflicts, room conflicts, instructor conflicts, break time violations, midterm window violations, lab duration violations

**Soft warnings** (WARNING): Elective accessibility, imbalanced distribution

---

## Mock Users (Phase 3)

- **Student**: `student-1`
- **Faculty**: `instructor-1`
- **Committee**: `user-1`
- **Registrar**: `registrar-1`

Phase 4+ will replace with real authentication.
