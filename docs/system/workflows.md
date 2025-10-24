# System Workflows

> **Last Updated:** 2025-10-24

This document describes the end-to-end workflows for key processes in the SmartSchedule system.

---

## Workflow Overview

SmartSchedule implements several interconnected workflows that span multiple user personas and system components. Each workflow is designed to handle a specific business process from initiation to completion.

---

## 1. Student Elective Selection Workflow

**Participants:** Student, Scheduling Committee  
**Duration:** Typically 1-2 weeks during registration period  
**Outcome:** Student preferences recorded for schedule generation

### Process Flow

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: Authentication & Setup                     │
└─────────────────────────────────────────────────────┘
│
├─ Student logs in with credentials
├─ System verifies authentication
├─ Student profile loaded
└─ Redirect to dashboard
    │
    ├─ First-time user? → Setup wizard
    └─ Returning user? → Dashboard
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 2: Course Discovery                           │
└─────────────────────────────────────────────────────┘
│
├─ Navigate to Electives page
├─ System loads available electives
│  └─ Filter by level (student.level)
│  └─ Check prerequisites (student.completedCourses)
├─ Student browses courses
│  ├─ Search by code/name
│  ├─ Filter by department
│  └─ View course details
└─ Select courses of interest
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 3: Preference Ranking                         │
└─────────────────────────────────────────────────────┘
│
├─ Student adds courses to selection panel
├─ System validates selections
│  ├─ Check credit limits
│  ├─ Verify prerequisites
│  └─ Ensure package requirements
├─ Student ranks preferences (drag-and-drop)
│  ├─ Priority 1 (highest preference)
│  ├─ Priority 2
│  └─ Priority N (lowest preference)
└─ System auto-saves draft (optional)
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 4: Review & Submit                            │
└─────────────────────────────────────────────────────┘
│
├─ Click "Review & Submit"
├─ System displays summary
│  ├─ Total courses selected
│  ├─ Total credits
│  ├─ Ranked list
│  └─ Package fulfillment status
├─ Student confirms understanding
│  ├─ ☑ I understand preferences are not guaranteed
│  ├─ ☑ I have ranked courses by priority
│  └─ ☑ I have reviewed all selections
├─ Click "Submit Preferences"
└─ POST /api/student/preferences
    │
    ├─ Validate payload
    ├─ Delete existing preferences
    ├─ Insert new preferences
    └─ Return confirmation
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 5: Confirmation                               │
└─────────────────────────────────────────────────────┘
│
├─ Display success message
├─ Show submission details
│  ├─ Submission ID
│  ├─ Timestamp
│  └─ Course count
├─ Provide next steps
│  ├─ Wait for schedule generation
│  ├─ Estimated completion date
│  └─ Notification method
└─ Allow modifications (before deadline)
```

### Database Operations

**Tables Involved:**
- `users` - Student profile (read)
- `electives` - Available courses (read)
- `student_electives` - Preferences (delete + insert)

**Transaction Flow:**
```sql
BEGIN;
  -- Delete existing preferences
  DELETE FROM student_electives WHERE student_id = $1;
  
  -- Insert new preferences
  INSERT INTO student_electives (student_id, elective_id, preference_order)
  VALUES 
    ($1, $2, 1),
    ($1, $3, 2),
    ($1, $4, 3);
COMMIT;
```

---

## 2. Schedule Generation Workflow

**Participants:** Scheduling Committee, System  
**Duration:** Several hours to days depending on complexity  
**Outcome:** Optimized schedules for all students

### Process Flow

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: Preparation                                │
└─────────────────────────────────────────────────────┘
│
├─ Committee accesses scheduler dashboard
├─ Review semester setup
│  ├─ Courses offered
│  ├─ Faculty assignments
│  ├─ Room availability
│  └─ Student preferences
├─ Configure generation parameters
│  ├─ Time slot preferences
│  ├─ Gap minimization
│  └─ Workload balancing
└─ Initiate generation
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 2: Data Collection                            │
└─────────────────────────────────────────────────────┘
│
├─ ScheduleDataCollector.collect()
│  ├─ Load courses (required + electives)
│  ├─ Load student preferences
│  ├─ Load faculty availability
│  ├─ Load room list
│  └─ Load constraints
└─ Validate data completeness
    └─ Error? → Report issues and halt
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 3: Schedule Generation Algorithm              │
└─────────────────────────────────────────────────────┘
│
├─ ScheduleGenerator.generate()
│  │
│  ├─ Step 1: Required Courses
│  │  ├─ For each level (1-8)
│  │  ├─ For each required course
│  │  │  ├─ TimeSlotManager.allocate()
│  │  │  ├─ Assign room
│  │  │  └─ ConflictChecker.validate()
│  │  └─ Retry on conflict
│  │
│  ├─ Step 2: Elective Courses
│  │  ├─ Sort by student preference count
│  │  ├─ For each elective
│  │  │  ├─ Identify interested students
│  │  │  ├─ Check capacity
│  │  │  ├─ Allocate time slot
│  │  │  └─ Validate no conflicts
│  │  └─ Handle overflow
│  │
│  └─ Step 3: Optimization
│     ├─ Minimize gaps
│     ├─ Prefer student preferences
│     └─ Balance faculty workload
│
└─ Generate schedule data structure
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 4: Conflict Detection & Resolution            │
└─────────────────────────────────────────────────────┘
│
├─ ConflictChecker.checkAll()
│  ├─ Check student time conflicts
│  ├─ Check room double-booking
│  ├─ Check faculty availability
│  └─ Check capacity violations
│
├─ Conflicts found?
│  ├─ Yes → Generate conflict report
│  │  ├─ Categorize by severity
│  │  ├─ Suggest resolutions
│  │  └─ Manual review required
│  │     │
│  │     ├─ Committee adjusts parameters
│  │     └─ Re-run generation
│  │
│  └─ No → Proceed to preview
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 5: Preview & Review                           │
└─────────────────────────────────────────────────────┘
│
├─ Display generated schedules
│  ├─ Statistics dashboard
│  │  ├─ Students scheduled: X/Y
│  │  ├─ Sections created: N
│  │  ├─ Rooms utilized: M
│  │  └─ Average preferences met: %
│  │
│  ├─ Schedule viewer
│  │  ├─ By level
│  │  ├─ By course
│  │  └─ By student
│  │
│  └─ Issue report
│     ├─ Unscheduled students
│     ├─ Unmet preferences
│     └─ Warnings
│
├─ Committee reviews
└─ Decision
    ├─ Approve → Publish
    └─ Reject → Adjust & regenerate
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 6: Publishing                                 │
└─────────────────────────────────────────────────────┘
│
├─ Committee clicks "Publish"
├─ System confirmation dialog
├─ Batch insert to schedules table
│  └─ INSERT INTO schedules (student_id, data) VALUES ...
├─ Create change_log entries (audit trail)
├─ Send notifications (future feature)
└─ Success confirmation
```

### Algorithm Pseudocode

```python
def generate_schedule():
    # Phase 1: Collect data
    courses = fetch_courses()
    students = fetch_students()
    preferences = fetch_preferences()
    rooms = fetch_rooms()
    faculty = fetch_faculty_availability()
    
    # Phase 2: Initialize
    schedule = {}
    time_slot_manager = TimeSlotManager()
    conflict_checker = ConflictChecker()
    
    # Phase 3: Schedule required courses
    for level in range(1, 9):
        for course in courses.filter(level=level, type='REQUIRED'):
            time_slot = time_slot_manager.find_available(course)
            room = assign_room(course, time_slot)
            
            if conflict_checker.is_valid(course, time_slot, room):
                schedule.add(course, time_slot, room)
            else:
                handle_conflict(course)
    
    # Phase 4: Schedule electives
    for elective in courses.filter(type='ELECTIVE').sort_by_popularity():
        interested_students = preferences.filter(elective_id=elective.id)
        
        if len(interested_students) >= elective.min_capacity:
            time_slot = time_slot_manager.find_available(elective)
            room = assign_room(elective, time_slot)
            
            if conflict_checker.is_valid(elective, time_slot, room):
                schedule.add(elective, time_slot, room)
                assign_students_to_elective(interested_students, elective)
    
    # Phase 5: Optimize
    schedule = optimize_gaps(schedule)
    schedule = optimize_preferences(schedule, preferences)
    
    return schedule
```

---

## 3. Faculty Assignment Workflow

**Participants:** Teaching Load Committee, Faculty  
**Duration:** Days to weeks  
**Outcome:** Faculty assigned to course sections

### Process Flow

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: Faculty Availability Collection            │
└─────────────────────────────────────────────────────┘
│
├─ Faculty logs in
├─ Navigate to Setup page
├─ Set availability preferences
│  ├─ Mark available time slots
│  ├─ Mark preferred times
│  └─ Mark unavailable times
├─ Submit availability
└─ Store in database
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 2: Committee Review                           │
└─────────────────────────────────────────────────────┘
│
├─ Teaching Load Committee accesses dashboard
├─ View faculty availability matrix
│  ├─ Faculty member
│  ├─ Available hours
│  ├─ Current load
│  └─ Expertise areas
├─ View unassigned sections
└─ View workload distribution
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 3: Assignment                                 │
└─────────────────────────────────────────────────────┘
│
├─ For each section:
│  ├─ View section details (course, time, room)
│  ├─ Filter eligible faculty
│  │  ├─ Check availability
│  │  ├─ Check qualifications
│  │  └─ Check workload
│  ├─ Select faculty member
│  └─ Confirm assignment
│     └─ UPDATE section SET instructor_id = $1
│
├─ System validates
│  ├─ No time conflicts
│  ├─ Workload within limits
│  └─ Availability matches
│
└─ Record in change_log
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 4: Balancing & Optimization                   │
└─────────────────────────────────────────────────────┘
│
├─ Review workload distribution
│  ├─ Teaching hours per faculty
│  ├─ Course count per faculty
│  └─ Variance from target load
│
├─ Identify imbalances
│  ├─ Overloaded faculty
│  └─ Underutilized faculty
│
├─ Adjust assignments
│  └─ Reassign sections as needed
│
└─ Final review and approval
```

---

## 4. Exam Scheduling Workflow

**Participants:** Registrar  
**Duration:** Days  
**Outcome:** Conflict-free exam schedule

### Process Flow

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: Exam Definition                            │
└─────────────────────────────────────────────────────┘
│
├─ Registrar accesses exam scheduler
├─ Select semester and exam type
│  ├─ Midterm 1
│  ├─ Midterm 2
│  └─ Final
├─ For each course:
│  ├─ Set exam date
│  ├─ Set exam time
│  ├─ Set duration
│  └─ Assign room(s)
└─ Validate capacity
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 2: Conflict Detection                         │
└─────────────────────────────────────────────────────┘
│
├─ System checks for conflicts:
│  ├─ Student has multiple exams at same time
│  ├─ Student has consecutive exams (< 2h gap)
│  ├─ Room double-booked
│  └─ Capacity exceeded
│
├─ Generate conflict report
│  ├─ List affected students
│  ├─ List affected courses
│  └─ Severity rating
│
└─ Suggest resolutions
    ├─ Alternative time slots
    └─ Alternative rooms
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 3: Resolution & Adjustment                    │
└─────────────────────────────────────────────────────┘
│
├─ Registrar reviews conflicts
├─ Adjusts exam schedule
│  ├─ Reschedule conflicting exams
│  ├─ Change rooms
│  └─ Split large exams
├─ Re-run conflict detection
└─ Repeat until conflict-free
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 4: Publishing                                 │
└─────────────────────────────────────────────────────┘
│
├─ Final review
├─ Publish exam schedule
├─ INSERT INTO exam (course_code, kind, exam_date, ...)
├─ Notify students (future)
└─ Make available in student portal
```

---

## 5. Feedback Collection Workflow

**Participants:** Student, Committee  
**Duration:** Continuous  
**Outcome:** Feedback recorded for analysis

### Process Flow

```
┌─────────────────────────────────────────────────────┐
│ PHASE 1: Feedback Submission                        │
└─────────────────────────────────────────────────────┘
│
├─ Student accesses feedback page
├─ View current schedule (optional reference)
├─ Complete feedback form
│  ├─ Select schedule (optional)
│  ├─ Rating (1-5 stars)
│  └─ Text feedback (min 10 chars)
├─ Submit
└─ POST /api/student/feedback
    │
    ├─ Validate input
    ├─ INSERT INTO feedback (...)
    └─ Return confirmation
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 2: Aggregation & Analysis                     │
└─────────────────────────────────────────────────────┘
│
├─ Committee accesses feedback dashboard (future)
├─ View aggregated data
│  ├─ Average rating
│  ├─ Rating distribution
│  ├─ Common themes
│  └─ Sentiment analysis
├─ Filter feedback
│  ├─ By rating
│  ├─ By date
│  └─ By keyword
└─ Export reports
                │
                v
┌─────────────────────────────────────────────────────┐
│ PHASE 3: Action Items                               │
└─────────────────────────────────────────────────────┘
│
├─ Identify improvement areas
├─ Generate action items
├─ Track implementation
└─ Measure impact (next cycle)
```

---

## Workflow Integration

All workflows are interconnected:

```
Student Elective Selection
         ↓
    [Preferences Stored]
         ↓
Faculty Availability ← Schedule Generation → Exam Scheduling
         ↓                    ↓                      ↓
    [Assignments]      [Schedules Published]    [Exams Set]
         ↓                    ↓                      ↓
         └────────────→ Student Views ←──────────────┘
                             ↓
                      [Provides Feedback]
                             ↓
                    [Next Cycle Improvements]
```

---

## Workflow States & Transitions

### Student Elective Selection States

- `NOT_STARTED` → Student hasn't accessed electives page
- `IN_PROGRESS` → Student browsing/selecting
- `DRAFT_SAVED` → Selections saved but not submitted
- `SUBMITTED` → Preferences submitted
- `LOCKED` → Deadline passed, no modifications allowed

### Schedule Generation States

- `NOT_STARTED` → No generation initiated
- `COLLECTING_DATA` → Gathering inputs
- `GENERATING` → Algorithm running
- `CONFLICTS_DETECTED` → Manual review needed
- `PREVIEW` → Ready for committee review
- `PUBLISHED` → Available to students
- `ARCHIVED` → Historical schedule

### Faculty Assignment States

- `PENDING` → Awaiting assignment
- `ASSIGNED` → Faculty assigned
- `CONFIRMED` → Faculty accepted
- `REJECTED` → Faculty declined (rare)

---

*For technical implementation details of these workflows, see the relevant code in `src/lib/schedule/` and `src/app/api/`.*

