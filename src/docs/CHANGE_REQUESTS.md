# Change Requests

This document tracks all change requests (bugs, features, and enhancements) for SmartSchedule V1.

## Request ID Format
`CR-YYYYMMDD-NNN` (e.g., CR-20251027-001)

## Status Legend
- **Pending**: Awaiting review or prioritization
- **In Progress**: Currently being worked on
- **Completed**: Implemented and deployed
- **Cancelled**: Will not be implemented

## Priority Levels
- **Critical**: Blocking functionality, security issues
- **High**: Important features or significant bugs
- **Medium**: Nice-to-have features or minor bugs
- **Low**: Future enhancements or cosmetic issues

---

## Active Requests

None currently. All high-priority features for V1 are complete!

---

## Completed Requests

### CR-20251027-003
- **Type**: Feature
- **Priority**: High
- **Status**: Completed
- **Date**: October 27, 2025
- **Completed**: October 28, 2025
- **Description**: Implement scheduling recommendation algorithm
- **Details**: 
  - ✅ Built greedy constraint satisfaction algorithm
  - ✅ Intelligent time slot generation for lectures and labs
  - ✅ Automatic room assignment based on type and capacity
  - ✅ Complete conflict avoidance (room, instructor, student-level)
  - ✅ Priority-based section assignment (by level, then type)
  - ✅ API endpoints for generation and status tracking
  - ✅ Comprehensive UI with progress and detailed results
  - ✅ Manual override support through section edit forms
- **Assigned To**: Development Team

### CR-20251027-002
- **Type**: Feature
- **Priority**: Medium
- **Status**: Completed
- **Date**: October 27, 2025
- **Completed**: October 27, 2025
- **Description**: Implement Elective Preference System for students
- **Details**: 
  - Database functions for preference CRUD
  - Interactive UI for students to rank electives
  - Aggregated statistics dashboard for scheduling committee
  - Visual preference breakdown (1st, 2nd, 3rd choice)
  - Integration with student dashboard
- **Assigned To**: Development Team

### CR-20251027-001
- **Type**: Feature
- **Priority**: High
- **Status**: Completed
- **Date**: October 27, 2025
- **Completed**: October 27, 2025
- **Description**: Implement Exams CRUD with conflict detection for exam scheduling
- **Details**: 
  - Add exam creation, editing, and deletion functionality
  - Implement room and student-level conflict detection for exams
  - Create exam management UI for scheduling committee and registrar roles
- **Assigned To**: Development Team

---

## Cancelled Requests

None yet.

---

## Request Template

When adding a new request, copy and fill out this template:

```markdown
### CR-YYYYMMDD-NNN
- **Type**: [Bug/Feature/Enhancement]
- **Priority**: [Low/Medium/High/Critical]
- **Status**: Pending
- **Date**: [Date]
- **Description**: [Brief description]
- **Details**: 
  - [Detailed requirements or steps to reproduce]
- **Assigned To**: [Team member or "Unassigned"]
```

---

*Last Updated: October 28, 2025*

