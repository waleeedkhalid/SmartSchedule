# Schedule System Updates - October 1, 2025

## Changes Made

### 1. Teaching Load Committee - SWE Courses Only

**File:** `src/app/demo/committee/teaching-load/page.tsx`

**Change:** Updated mock instructor loads to show only SWE department courses.

**Before:**

- Instructors had mix of courses: CSC212, CSC380, CSC484, MATH203, MATH311, CEN303, etc.

**After:**

- All courses are now SWE courses: SWE211, SWE226, SWE312, SWE316, SWE418, SWE417, etc.

**Rationale:** Teaching Load Committee manages SWE department faculty assignments only. Non-SWE courses (MATH, CSC, CEN, etc.) are managed by their respective departments.

**Example Update:**

```typescript
// Before
sections: [
  { sectionId: "CSC212-01", courseCode: "CSC212", hours: 4 },
  { sectionId: "CSC380-01", courseCode: "CSC380", hours: 3 },
];

// After
sections: [
  { sectionId: "SWE211-01", courseCode: "SWE211", hours: 3 },
  { sectionId: "SWE226-01", courseCode: "SWE226", hours: 3 },
];
```

---

### 2. Exam Table - SWE Courses Only

**File:** `src/lib/committee-data-helpers.ts`

**Change:** Updated `getExams()` function to filter for SWE department courses only.

**Implementation:**

```typescript
export function getExams(courseOfferings: CourseOffering[]): ExamRecord[] {
  const exams: ExamRecord[] = [];

  courseOfferings.forEach((course) => {
    // Only include SWE department courses
    if (course.department !== "SWE") return;

    // ... rest of logic
  });

  return exams;
}
```

**Impact:** The ExamTable component will now only display exams for SWE courses (SWE211, SWE226, SWE312, etc.), excluding external courses like MATH203, PHY104, CSC courses, etc.

**Rationale:** The Scheduling Committee is responsible for SWE department course scheduling only. External courses are scheduled by their respective departments and shown as read-only references.

---

### 3. Time Conflict Detection - Room-Based Severity

**File:** `src/lib/schedule/ConflictChecker.ts`

**Change:** Modified `checkSectionTimeConflict()` to differentiate between:

- **ERROR**: Same time AND same room (true conflict - physically impossible)
- **WARNING**: Same time but different rooms (scheduling concern but not impossible)

**Before:**

```typescript
if (this.timeManager.doTimeSlotsOverlap(slot1, slot2)) {
  return {
    type: "TIME",
    severity: "ERROR",
    message: `Time conflict: ${section1.courseCode} and ${section2.courseCode} meet at the same time`,
  };
}
```

**After:**

```typescript
if (this.timeManager.doTimeSlotsOverlap(slot1, slot2)) {
  const sameRoom =
    section1.room && section2.room && section1.room === section2.room;

  return {
    type: "TIME",
    severity: sameRoom ? "ERROR" : "WARNING",
    message: sameRoom
      ? `Time and room conflict: ${section1.courseCode} and ${section2.courseCode} meet at the same time in ${section1.room}`
      : `Time conflict: ${section1.courseCode} and ${section2.courseCode} meet at the same time (different rooms)`,
  };
}
```

**Rationale:**

- **ERROR (Same Time + Same Room):** Physically impossible - two classes cannot occupy the same room at the same time. Must be fixed before publishing.
- **WARNING (Same Time + Different Rooms):** Possible scheduling concern (e.g., students enrolled in both), but not physically impossible. May be acceptable in some cases.

**Examples:**

| Scenario               | Time                         | Room                     | Severity        | Reason                                                   |
| ---------------------- | ---------------------------- | ------------------------ | --------------- | -------------------------------------------------------- |
| SWE211-01 vs SWE312-01 | Sunday 09:00                 | CCIS 1A101 vs CCIS 1A101 | **ERROR**       | Same room, same time - impossible                        |
| SWE211-01 vs SWE312-01 | Sunday 09:00                 | CCIS 1A101 vs CCIS 2B102 | **WARNING**     | Different rooms - possible but may conflict for students |
| SWE211-01 vs SWE312-01 | Sunday 09:00 vs Monday 09:00 | Any rooms                | **No Conflict** | Different days                                           |

---

## Impact Assessment

### Components Affected

1. **Teaching Load Committee Pages:**

   - `/demo/committee/teaching-load` - Now shows only SWE courses
   - `/demo/committee/teaching-load/conflicts` - Conflicts reference SWE courses only

2. **Exam Management:**

   - `/demo/committee/scheduler` - ExamTable displays SWE exams only
   - Schedule Generation System - Exam scheduling for SWE courses

3. **Conflict Detection:**
   - All schedule generation workflows
   - Conflict checking APIs
   - Student schedule validation

### Data Flow

```
mockCourseOfferings (all departments)
    ↓
getExams() [FILTERED: department === "SWE"]
    ↓
ExamTable Component
    ↓
Displays only SWE exams
```

```
Section Comparison
    ↓
checkSectionTimeConflict()
    ↓
Time Overlap? → Yes
    ↓
Same Room?
    ├─ Yes → ERROR: "Time and room conflict"
    └─ No  → WARNING: "Time conflict (different rooms)"
```

---

## Testing Recommendations

### 1. Teaching Load Committee

**Test Case:** View instructor loads

```bash
Navigate to: /demo/committee/teaching-load
Expected: All course codes should be SWE*** (e.g., SWE211, SWE312)
```

### 2. Exam Table

**Test Case:** View exam schedule

```bash
Navigate to: /demo/committee/scheduler
Expected: Exam table shows only SWE courses
- SWE211, SWE226, SWE312, SWE314, SWE316, etc.
- No MATH, CSC, PHY, or other department courses
```

### 3. Conflict Detection - ERROR

**Test Case:** Two sections in same room at same time

```typescript
Section 1: SWE211-01, Sunday 09:00-09:50, Room: CCIS 1A101
Section 2: SWE312-01, Sunday 09:00-09:50, Room: CCIS 1A101
Expected: ERROR - "Time and room conflict"
```

### 4. Conflict Detection - WARNING

**Test Case:** Two sections at same time, different rooms

```typescript
Section 1: SWE211-01, Sunday 09:00-09:50, Room: CCIS 1A101
Section 2: SWE312-01, Sunday 09:00-09:50, Room: CCIS 2B102
Expected: WARNING - "Time conflict (different rooms)"
```

### 5. No Conflict

**Test Case:** Different times or days

```typescript
Section 1: SWE211-01, Sunday 09:00-09:50, Room: CCIS 1A101
Section 2: SWE312-01, Monday 09:00-09:50, Room: CCIS 1A101
Expected: No conflict detected
```

---

## Documentation Updates

### Updated Files

1. ✅ `src/app/demo/committee/teaching-load/page.tsx` - SWE courses only
2. ✅ `src/lib/committee-data-helpers.ts` - Added SWE filter to getExams()
3. ✅ `src/lib/schedule/ConflictChecker.ts` - Room-based conflict severity

### Documentation Added

- This file: `docs/SCHEDULE_UPDATES_20251001.md`

---

## Scope Reminder

**SWE Department Scope (Phase 3):**

- ✅ Manages SWE courses exclusively (SWE211, SWE312, SWE314, etc.)
- ✅ Schedules SWE sections, meetings, and exams
- ✅ Manages SWE faculty and student data
- ❌ Does NOT schedule non-SWE courses (CSC, MATH, PHY, etc.)
- ℹ️ Non-SWE courses exist in mockData as external course references only

These changes reinforce this scope limitation across all components.

---

## Next Steps

1. **Testing:** Verify all three changes work correctly
2. **User Feedback:** Confirm with stakeholders that SWE-only filtering is correct
3. **Documentation:** Update user guides to clarify SWE department scope
4. **Future Enhancement:** If multi-department support needed, add department filter UI

---

**Changes Completed:** October 1, 2025  
**Compilation Status:** ✅ No errors  
**Ready for Testing:** Yes
