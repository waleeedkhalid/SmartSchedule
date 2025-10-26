# Scheduling Rules Reference

## Overview

The SmartSchedule system implements **6 core scheduling rule types** to ensure optimal schedule generation while respecting various constraints and requirements.

---

## 6 Scheduling Rule Types

### 1. **Time Constraint Rules**
**Purpose:** Manage time-based scheduling restrictions

**Examples:**
- No back-to-back labs (minimum 30-minute gap)
- Maximum 3 lectures per day per student
- Avoid scheduling classes during prayer times
- No classes before 8:00 AM or after 4:00 PM
- Minimum gap between lectures (e.g., 1-hour lunch break)

**Priority Level:** High (8-10)

**Impact:** Affects student and faculty well-being and compliance

---

### 2. **Room Constraint Rules**
**Purpose:** Manage physical space allocation

**Examples:**
- Room capacity must accommodate enrolled students
- Lab courses require lab facilities
- Special equipment requirements (projector, computer, etc.)
- Accessibility requirements for students with disabilities
- Room availability windows

**Priority Level:** Critical (10)

**Impact:** Cannot be violated - physical constraints

---

### 3. **Instructor Constraint Rules**
**Purpose:** Manage faculty assignments and workload

**Examples:**
- No instructor teaching two sections simultaneously
- Maximum teaching hours per week per instructor
- Respect faculty availability preferences
- Minimum preparation time between different courses
- Maximum consecutive teaching hours

**Priority Level:** High (7-9)

**Impact:** Faculty workload balance and quality of teaching

---

### 4. **Enrollment Constraint Rules**
**Purpose:** Manage student enrollment and capacity

**Examples:**
- Section capacity limits (including threshold buffer)
- Prerequisite requirements enforcement
- Level-appropriate course assignments
- Credit hour limits per student per term
- Elective preference satisfaction

**Priority Level:** Medium-High (6-8)

**Impact:** Student progression and satisfaction

---

### 5. **Curriculum Constraint Rules**
**Purpose:** Ensure academic program requirements are met

**Examples:**
- Required courses scheduled for appropriate levels
- Sufficient sections for expected enrollment
- Core courses available every term
- Electives rotated across terms
- Sequential course availability (prerequisites in earlier terms)

**Priority Level:** Critical (9-10)

**Impact:** Student graduation paths and academic compliance

---

### 6. **Conflict Prevention Rules**
**Purpose:** Prevent scheduling conflicts

**Examples:**
- No student enrolled in overlapping sections
- Required courses at same level should not conflict
- Popular elective combinations should not conflict
- External department course coordination
- Exam schedule conflict prevention

**Priority Level:** Critical (10)

**Impact:** Student ability to complete required coursework

---

## Rule Priority System

### Priority Levels (1-10 Scale)

| Level | Description | Violation Impact |
|-------|-------------|------------------|
| **10** | **CRITICAL** - Must never be violated | Schedule generation fails |
| **8-9** | **HIGH** - Strong preference | Warning generated, manual review required |
| **5-7** | **MEDIUM** | Logged for review, affects optimization score |
| **1-4** | **LOW** - Nice to have | Informational only |

---

## Rule Implementation Notes

### Hard vs Soft Constraints

**Hard Constraints (Cannot be violated):**
- Room capacity
- Instructor double-booking
- Student schedule conflicts
- Physical resource availability

**Soft Constraints (Optimized when possible):**
- Faculty preferences
- Student elective preferences
- Time distribution balance
- Workload balance

---

## Priority Weight Distribution

The system balances multiple factors when generating schedules:

```
Student Preferences:      25%
Faculty Availability:     30%
Room Optimization:        20%
Time Distribution:        25%
```

*These weights can be adjusted by the Scheduling Committee through the system configuration.*

---

## Rule Conflict Resolution

When rules conflict, the system follows this hierarchy:

1. **Physical Constraints** (Room, Time, Resources)
2. **Academic Requirements** (Curriculum, Prerequisites)
3. **Institutional Constraints** (Instructor availability, Workload)
4. **Optimization Goals** (Preferences, Balance, Distribution)

---

## Implementation in Schedule Generation

### Phase 1: Constraint Validation
- All hard constraints are checked
- Schedule generation aborts if critical rules cannot be satisfied

### Phase 2: Optimization
- Soft constraints are optimized using weighted scoring
- Multiple candidate schedules generated and scored

### Phase 3: Conflict Detection
- All rules validated against generated schedule
- Conflicts reported with severity levels

### Phase 4: Manual Review
- Committee reviews violations and conflicts
- Approves or requests regeneration

---

## Future Rule Types (Under Consideration)

1. **Budget Constraints** - Room utilization costs
2. **Energy Optimization** - Building usage efficiency
3. **Accreditation Requirements** - ABET compliance
4. **Research Time Protection** - Faculty research blocks
5. **TA Assignment Rules** - Teaching assistant scheduling

---

## API Integration (For Developers)

### Fetching Active Rules
```typescript
GET /api/scheduler/rules
Response: Array<SchedulingRule>
```

### Testing Rules
```typescript
POST /api/scheduler/rules/{ruleId}/test
Body: { scheduleData: Schedule }
Response: { passed: boolean, violations: Violation[] }
```

### Updating Rule Priority
```typescript
PATCH /api/scheduler/rules/{ruleId}
Body: { priority: number }
```

---

## Related Documentation

- [Schedule Generation Algorithm](./scheduler-api.md)
- [Conflict Resolution Guide](./conflict-resolution.md)
- [Committee Workflows](../system/workflows.md)

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Status:** Active Implementation

---

## Notes for Implementation

When implementing scheduling features:
1. Always reference these 6 rule types
2. Ensure hard constraints are never violated
3. Optimize soft constraints by priority
4. Log all rule violations for audit
5. Provide clear explanation to users when rules conflict

**For questions or rule additions, contact the Scheduling Committee.**

