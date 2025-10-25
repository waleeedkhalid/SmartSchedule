# Scheduler System API Documentation

## Overview

The Scheduler System provides comprehensive APIs for automated course scheduling, conflict detection, and schedule management for the SmartSchedule platform.

## Phase 1 Implementation: Core Infrastructure & Types

### Components Implemented

#### 1. Type Definitions (`src/types/scheduler.ts`)

Comprehensive type definitions for the entire scheduler system:

- **Course & Section Types**: `SchedulerCourse`, `SchedulerSection`, `SectionTimeSlot`, `CourseWithSections`
- **Schedule Generation Types**: `ScheduleGenerationRequest`, `ScheduleGenerationResponse`, `GeneratedSchedule`, `ScheduleData`
- **Scheduling Rules Types**: `SchedulingRulesConfig`, `SchedulingRules`, `PriorityWeights`
- **Conflict Types**: `ScheduleConflict`, `ConflictType`, `AffectedEntity`, `ConflictResolution`
- **Exam Scheduling Types**: `ExamScheduleRequest`, `ExamScheduleResult`, `ExamConstraints`
- **Student Enrollment Types**: `StudentEnrollmentData`, `StudentCountSummary`
- **Validation & Optimization Types**: `ScheduleValidationResult`, `OptimizationMetrics`

#### 2. Database Schema (Migration: `20250127_scheduler_system.sql`)

Created comprehensive database tables:

- **`room`**: Physical classroom and lab spaces
- **`section`**: Course sections with instructors and rooms
- **`section_time`**: Time slots for each section
- **`exam`**: Exam schedules for courses
- **`scheduling_rules`**: Configuration for scheduling constraints
- **`schedule_conflicts`**: Detected conflicts with resolution tracking
- **`section_enrollment`**: Student enrollment in specific sections

**Key Features**:
- Row Level Security (RLS) enabled on all tables
- Conflict detection function: `detect_section_time_conflicts()`
- Enrollment statistics function: `get_course_enrollment_stats()`
- Automatic triggers for maintaining counts and timestamps

#### 3. API Routes

All routes are under `/api/committee/scheduler/` and require scheduling committee authentication.

##### A. Courses Management (`/courses`)

**GET** - List courses with sections for a term
```typescript
Query Params:
- term_code: string (required)
- course_type: 'REQUIRED' | 'ELECTIVE' (optional)
- level: number (optional)
- include_sections: boolean (default: true)

Response: {
  success: true,
  data: CourseWithSections[]
}
```

**POST** - Create a new section
```typescript
Body: {
  course_code: string;
  term_code: string;
  section_id: string;
  instructor_id?: string;
  room_number?: string;
  capacity?: number;
  section_type?: 'LECTURE' | 'LAB' | 'TUTORIAL';
  time_slots: Array<{
    day: string;
    start_time: string;
    end_time: string;
  }>;
}

Response: {
  success: true,
  data: {
    section: SchedulerSection;
    time_slots: SectionTimeSlot[];
    conflicts: Array<any>;
  }
}
```

**PATCH** - Update an existing section

**DELETE** - Delete a section (with enrollment validation)

##### B. Student Counts (`/student-counts`)

**GET** - Get enrollment statistics
```typescript
Query Params:
- term_code: string (required)
- group_by: 'level' | 'course' | 'course_type' (default: 'course')

Response: {
  success: true,
  data: {
    term_code: string;
    courses?: StudentEnrollmentData[];
    by_level?: LevelEnrollmentSummary[];
    by_course_type?: CourseTypeEnrollmentSummary[];
  }
}
```

##### C. Exams Management (`/exams`)

**GET** - List exam schedules for a term
```typescript
Query Params:
- term_code: string (required)
- exam_type: 'MIDTERM' | 'MIDTERM2' | 'FINAL' (optional)
- course_code: string (optional)
```

**POST** - Create exam schedule with conflict detection

**PATCH** - Update exam schedule

**DELETE** - Delete exam schedule

##### D. Scheduling Rules (`/rules`)

**GET** - Get scheduling rules for a term
```typescript
Query Params:
- term_code: string (required)
- active_only: boolean (default: true)

Response: {
  success: true,
  data: {
    term_code: string;
    rules: SchedulingRulesConfig[];
    count: number;
  }
}
```

**POST** - Create new scheduling rules configuration

**PATCH** - Update existing rules

**DELETE** - Delete rules

##### E. Conflicts Management (`/conflicts`)

**GET** - Get detected conflicts
```typescript
Query Params:
- term_code: string (optional)
- schedule_id: string (optional)
- section_id: string (optional)
- severity: 'critical' | 'error' | 'warning' | 'info' (optional)
- resolved: boolean (optional)

Response: {
  success: true,
  data: {
    conflicts: ScheduleConflict[];
    count: number;
  }
}
```

**POST** - Create conflict record

**PATCH** - Resolve/unresolve conflict

**DELETE** - Delete conflict record

##### F. Schedule by ID (`/schedule/[id]`)

**GET** - Get specific schedule with conflicts
```typescript
Response: {
  success: true,
  data: {
    schedule: GeneratedSchedule;
    conflicts: ScheduleConflict[];
    conflict_count: {
      total: number;
      critical: number;
      error: number;
      warning: number;
      info: number;
    };
  }
}
```

**PATCH** - Update specific schedule

**DELETE** - Delete schedule (with publish check)

##### G. Schedule Generation (`/schedule/generate`)

**POST** - Generate schedules for students
```typescript
Body: {
  term_code: string;
  target_level?: number;
  force_regenerate?: boolean;
  rules_config?: SchedulingRulesConfig;
  constraints?: ScheduleConstraints;
}

Response: {
  success: true,
  data: {
    generated_count: number;
    failed_count: number;
    results: Array<{
      success: boolean;
      student_id: string;
      schedule_id?: string;
      conflicts?: number;
      error?: string;
    }>;
    total_conflicts: number;
    execution_time_ms: number;
  }
}
```

## Database Functions

### `detect_section_time_conflicts(p_section_id TEXT)`
Detects room and instructor conflicts for a given section.

**Returns**:
```sql
TABLE(
  conflicting_section_id TEXT,
  conflict_day TEXT,
  conflict_start_time TIME,
  conflict_end_time TIME,
  conflict_type TEXT
)
```

### `get_course_enrollment_stats(p_term_code TEXT)`
Gets enrollment statistics for all courses in a term.

**Returns**:
```sql
TABLE(
  course_code TEXT,
  course_name TEXT,
  course_type TEXT,
  level INT,
  total_students BIGINT,
  enrolled_students BIGINT,
  sections_needed INT
)
```

## Security

All scheduler APIs implement:
- **Authentication**: Required for all endpoints
- **Authorization**: Committee member verification (scheduling_committee required for write operations)
- **Row Level Security**: Enforced on all database tables
- **Input Validation**: Comprehensive validation for all request parameters

## Conflict Types

The system detects and tracks multiple conflict types:

- `time_overlap` - Two classes scheduled at same time
- `exam_overlap` - Two exams scheduled at same time
- `capacity_exceeded` - Section capacity exceeded
- `prerequisite_violation` - Missing prerequisites
- `room_conflict` - Room double-booked
- `faculty_conflict` - Faculty double-booked
- `constraint_violation` - Scheduling rule violated
- `elective_unavailable` - Preferred elective not available
- `excessive_daily_load` - Too many hours in one day
- `excessive_weekly_load` - Too many hours in one week
- `large_gap` - Large gap between classes
- `faculty_unavailable` - Faculty not available at scheduled time
- `missing_required_course` - Required course not in schedule

## Scheduling Rules

The system supports comprehensive scheduling rules:

### Time Constraints
- `max_daily_hours`: Maximum hours per day
- `min_gap_between_classes`: Minimum minutes between classes
- `max_gap_between_classes`: Maximum minutes gap allowed
- `earliest_class_time`: Earliest allowed class start time
- `latest_class_time`: Latest allowed class end time

### Weekly Constraints
- `max_weekly_hours`: Maximum total weekly hours
- `preferred_days_off`: Days with no classes
- `allow_back_to_back`: Allow classes with no gap

### Section Constraints
- `max_students_per_section`: Maximum section capacity
- `min_students_per_section`: Minimum viable section size
- `allow_section_overflow`: Allow slight capacity overflow
- `overflow_percentage`: Maximum overflow percentage

### Faculty Constraints
- `respect_faculty_availability`: Honor faculty preferences
- `max_faculty_daily_hours`: Maximum daily teaching hours
- `min_gap_between_faculty_classes`: Minimum gap between classes

### Exam Constraints
- `min_days_between_exams`: Minimum days between student exams
- `avoid_exam_conflicts`: Prevent exam time conflicts
- `max_exams_per_day`: Maximum exams per student per day

## Priority Weights

Schedule generation uses weighted priorities:
- `time_preference`: Weight for preferred time slots
- `faculty_preference`: Weight for faculty preferences
- `elective_preference`: Weight for student elective preferences
- `minimize_gaps`: Weight for minimizing gaps
- `room_optimization`: Weight for room utilization
- `load_balancing`: Weight for balanced faculty load

## Next Steps (Future Phases)

### Phase 2: Advanced Scheduling Algorithm
- Implement constraint satisfaction algorithm
- Add optimization for student preferences
- Implement load balancing for faculty
- Add room utilization optimization

### Phase 3: UI Components
- Schedule visualization dashboard
- Conflict resolution interface
- Rules configuration UI
- Bulk operations interface

### Phase 4: Reporting & Analytics
- Schedule quality reports
- Faculty load analysis
- Room utilization reports
- Student satisfaction metrics

## Usage Examples

### 1. Create a Section
```typescript
POST /api/committee/scheduler/courses
{
  "course_code": "SWE101",
  "term_code": "2025-FALL",
  "section_id": "SWE101-01",
  "instructor_id": "uuid-here",
  "room_number": "101",
  "capacity": 50,
  "section_type": "LECTURE",
  "time_slots": [
    {
      "day": "SUNDAY",
      "start_time": "08:00",
      "end_time": "09:30"
    },
    {
      "day": "TUESDAY",
      "start_time": "08:00",
      "end_time": "09:30"
    }
  ]
}
```

### 2. Get Enrollment Statistics
```typescript
GET /api/committee/scheduler/student-counts?term_code=2025-FALL&group_by=level
```

### 3. Generate Schedules
```typescript
POST /api/committee/scheduler/schedule/generate
{
  "term_code": "2025-FALL",
  "target_level": 3,
  "force_regenerate": false
}
```

### 4. Get Conflicts for a Section
```typescript
GET /api/committee/scheduler/conflicts?section_id=SWE101-01
```

## Notes

- The current implementation includes a basic schedule generation algorithm
- Advanced conflict detection and resolution algorithms are planned for Phase 2
- The system is designed to be extensible for future optimization algorithms
- All database migrations include sample data for testing

## Dependencies

- Supabase (Database & Authentication)
- Next.js 15 (App Router)
- TypeScript (Type Safety)
- Row Level Security (Authorization)

## Maintenance

Database functions and triggers are automatically maintained:
- Enrollment counts are updated automatically via triggers
- Updated_at timestamps are maintained via triggers
- Conflicts are detected in real-time during section operations

