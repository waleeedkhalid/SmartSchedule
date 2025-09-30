2. User Stories and Requirements
   2.1 Scheduling Committee User Stories
   Story 1: Add Enrollment Data

As a scheduling committee member
I want to Add student enrollment data.
So that I can determine the optimal number of sections needed for each level

Acceptance Criteria:

System accepts structured format entries. (Using Forms)
Validates data structure and identifies missing or invalid entries
Displays total students per level and calculates recommended sections (default: 25 students/section)
Allows adjustment of students-per-section threshold
Shows validation summary with any errors or warnings
Saves added data with timestamp and version tracking

Story 2: Manage Irregular Student Information

As a scheduling committee member
I want to collect and view irregular student data from the registrar
So that I can ensure their remaining courses are accommodated in the schedule

Acceptance Criteria:

Provides secure form for registrar to enter irregular student data
Stores student name, remaining courses from past levels, and current level courses
Implements role-based access (only registrar and scheduling committee can view)
Sends notification to registrar when input is needed
Validates that entered courses exist in course catalog
Highlights scheduling conflicts for irregular students in schedule view

Story 3: Input External Department Constraints

As a scheduling committee member
I want to enter scheduling information from other departments
So that I can avoid conflicts when scheduling SWE courses

Acceptance Criteria:

Provides form to enter course codes (e.g., CS111, CS113) and their time slots
Validates time slot format and detects overlaps
Displays occupied slots visually when generating schedules
Allows editing and deletion of external constraints
Maintains history of external constraints by semester
Prevents scheduling SWE courses in occupied slots

Story 4: Generate Preliminary Schedule

As a scheduling committee member
I want to automatically generate an initial schedule based on rules and constraints
So that I can start with an optimized baseline instead of building from scratch

Acceptance Criteria:

Generates schedule respecting all scheduling rules (Section 3 of project description)
Reserves break times (12:00-1:00 PM) and midterm slots (Mon/Wed 12:00-2:00 PM)
Schedules electives to accommodate multiple levels
Places linked prerequisite courses in same slots when beneficial
Schedules 2-hour labs as continuous blocks
Provides AI-generated recommendations with confidence scores
Allows regeneration with different parameters
Saves generated schedule as new version

Story 5: Collaborate on Schedule Refinements

As a scheduling committee member
I want to edit the schedule collaboratively with other committee members in real-time
So that we can efficiently refine the schedule together

Acceptance Criteria:

Displays cursor positions and live edits from all active users
Prevents conflicting edits with automatic conflict resolution
Provides comment threads on specific schedule entries
Shows who made each change with timestamp
Allows tagging other users in comments
Sends notifications when tagged or when changes affect watched items
Supports undo/redo with full history preservation

Story 6: Submit Schedule for Load Committee Review

As a scheduling committee member
I want to share the preliminary schedule with the teaching load committee
So that they can verify instructor availability and identify conflicts

Acceptance Criteria:

Marks schedule as "Pending Load Review" status
Sends notification to all teaching load committee members
Provides read-only view with comment permissions for load committee
Collects feedback as structured comments linked to specific schedule entries
Highlights schedule entries with unresolved comments
Tracks resolution status of each comment
Prevents moving to next workflow stage until critical issues are resolved

Story 7: Publish Schedule for Student Feedback

As a scheduling committee member
I want to share a revised schedule with students to gather their feedback
So that I can identify and address issues before finalization

Acceptance Criteria:

Marks schedule as "Student Feedback Period" status
Sends notification to all students with personalized schedule view
Provides public-facing interface for student comments
Allows students to rate schedule on multiple dimensions (timing, elective availability, etc.)
Aggregates feedback with sentiment analysis
Generates feedback summary report with key issues highlighted
Sets deadline for feedback collection
Prevents student edits after feedback period ends

Story 8: Finalize and Export Schedule

As a scheduling committee member
I want to lock the final schedule and export it for submission
So that I can send it to the deanship of registration

Acceptance Criteria:

Validates that all workflow stages are complete
Marks schedule as "Finalized" (read-only for all users)
Generates export files in multiple formats (Excel, PDF, JSON)
Includes metadata (creation date, version number, approvers)
Creates permanent archive version with version control
Sends notification to all stakeholders that schedule is final
Provides comparison view between preliminary and final versions

2.2 Department Registrar User Stories
Story 9: Enter Irregular Student Data

As a department registrar
I want to securely enter information about irregular students
So that the scheduling committee can accommodate their unique course needs

Acceptance Criteria:

Receives notification when input is needed
Accesses secure form with student lookup by ID
Enters remaining courses from past levels (with validation)
Enters current level courses needed
Adds notes about special circumstances
Submits data with confirmation message
Cannot view other sensitive scheduling data (least privilege access)

2.3 Teaching Load Committee User Stories
Story 10: Review Instructor Assignments

As a teaching load committee member
I want to review preliminary instructor assignments in the schedule
So that I can identify and flag conflicts before finalization

Acceptance Criteria:

Views schedule filtered by instructor assignments
Sees each instructor's total load and course distribution
Identifies time conflicts in instructor schedules
Adds comments on specific assignments
Marks comments as "blocking" (must be resolved) or "suggestion"
Receives notifications when scheduling committee responds to comments
Approves schedule once all conflicts are resolved

2.4 Faculty Member User Stories
Story 11: Review Personal Schedule

As a faculty member
I want to view my preliminary teaching assignments and schedule
So that I can provide feedback on conflicts or preferences

Acceptance Criteria:

Receives notification when preliminary assignments are available
Views personalized schedule showing only their assigned courses
Sees course details (time, room, number of students)
Provides feedback via comments
Indicates availability issues or conflicts
Tracks resolution status of submitted feedback
Receives confirmation when final schedule is published

2.5 Student User Stories
Story 12: View and Comment on Schedule

As a student
I want to view the preliminary schedule and provide feedback
So that issues affecting my education can be identified and addressed

Acceptance Criteria:

Receives notification when schedule is available for feedback
Views schedule filtered by their level/group
Sees elective course offerings and time slots
Submits comments on specific concerns (conflicts, timing issues)
Rates schedule on satisfaction scale
Receives acknowledgment of submitted feedback
Gets notification when final schedule is published
