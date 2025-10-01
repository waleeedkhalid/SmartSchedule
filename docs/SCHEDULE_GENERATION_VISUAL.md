# Schedule Generation - Visual Flow Diagram

## 🎓 Student Level Grouping Concept

```
┌─────────────────────────────────────────────────────────────┐
│                    SWE STUDENT LEVELS                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Level 4 (40 students)                                      │
│  ├─ Required SWE: SWE211, SWE226                           │
│  ├─ External: MATH203, PHY104, ISL101                      │
│  └─ Electives: 0                                            │
│                                                              │
│  Level 5 (35 students)                                      │
│  ├─ Required SWE: SWE312, SWE314, SWE321                   │
│  ├─ External: MATH260, STAT201                             │
│  └─ Electives: 0                                            │
│                                                              │
│  Level 6 (30 students)                                      │
│  ├─ Required SWE: SWE333, SWE363, SWE381                   │
│  ├─ External: MATH301                                       │
│  └─ Electives: 1 course                                     │
│                                                              │
│  Level 7 (25 students)                                      │
│  ├─ Required SWE: SWE434, SWE444                           │
│  ├─ External: None                                          │
│  └─ Electives: 2 courses                                    │
│                                                              │
│  Level 8 (20 students)                                      │
│  ├─ Required SWE: SWE497 (Capstone)                        │
│  ├─ External: None                                          │
│  └─ Electives: 3 courses                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📅 Weekly Schedule Generation Process

### Example: Level 5 Schedule Generation

```
STEP 1: IDENTIFY COURSES FOR LEVEL 5
┌──────────────────────────────────────┐
│ SWE Courses (Need to Schedule):     │
│ • SWE312 (Software Architecture)     │
│ • SWE314 (Database Systems)          │
│ • SWE321 (Web Engineering)           │
│                                      │
│ External Courses (Already Scheduled):│
│ • MATH260 (Times FIXED)              │
│ • STAT201 (Times FIXED)              │
└──────────────────────────────────────┘

STEP 2: GET EXTERNAL COURSE TIMES (BLOCKED SLOTS)
┌──────────────────────────────────────────────────┐
│ MATH260 Sections:                                │
│ • Section 01: Sun/Tue 10:00-10:50               │
│ • Section 02: Mon/Wed 11:00-11:50               │
│                                                  │
│ STAT201 Sections:                                │
│ • Section 01: Sun/Tue 13:00-13:50               │
│ • Section 02: Mon/Wed 14:00-14:50               │
│                                                  │
│ ⚠️  These slots are BLOCKED for Level 5         │
│     SWE courses cannot use these times           │
└──────────────────────────────────────────────────┘

STEP 3: FIND AVAILABLE TIME SLOTS
┌──────────────────────────────────────────────────┐
│ All Possible Slots:                              │
│ Sun-Thu: 08:00-17:00                             │
│                                                  │
│ MINUS External Course Slots                      │
│                                                  │
│ = AVAILABLE SLOTS FOR SWE COURSES:              │
│ ✅ Sun/Tue 08:00-08:50                          │
│ ✅ Sun/Tue 09:00-09:50                          │
│ ❌ Sun/Tue 10:00-10:50 (MATH260)                │
│ ✅ Sun/Tue 11:00-11:50                          │
│ ✅ Sun/Tue 12:00-12:50                          │
│ ❌ Sun/Tue 13:00-13:50 (STAT201)                │
│ ✅ Mon/Wed 08:00-08:50                          │
│ ✅ Mon/Wed 09:00-09:50                          │
│ ✅ Mon/Wed 10:00-10:50                          │
│ ❌ Mon/Wed 11:00-11:50 (MATH260)                │
│ ... etc                                          │
└──────────────────────────────────────────────────┘

STEP 4: ASSIGN SWE SECTIONS
┌──────────────────────────────────────────────────┐
│ SWE312 - Software Architecture                   │
│ Students: 35 → Need 2 sections (35/2 = ~18/sec) │
│                                                  │
│ Section 01:                                      │
│ ✅ Assigned: Sun/Tue 08:00-08:50               │
│ ✅ Room: 101                                    │
│ ✅ Instructor: Dr. Ahmed (Available)           │
│                                                  │
│ Section 02:                                      │
│ ✅ Assigned: Mon/Wed 09:00-09:50               │
│ ✅ Room: 102                                    │
│ ✅ Instructor: Dr. Fatima (Available)          │
│                                                  │
│ SWE314 - Database Systems                        │
│ Section 01:                                      │
│ ✅ Assigned: Sun/Tue 12:00-12:50               │
│ ✅ Room: 103                                    │
│ ✅ Instructor: Dr. Omar (Available)            │
│                                                  │
│ Section 02:                                      │
│ ✅ Assigned: Mon/Wed 14:00-14:50               │
│ ✅ Room: 104                                    │
│ ✅ Instructor: Dr. Sara (Available)            │
│                                                  │
│ SWE321 - Web Engineering                         │
│ (Similar assignment...)                          │
└──────────────────────────────────────────────────┘

STEP 5: SCHEDULE EXAMS
┌──────────────────────────────────────────────────┐
│ External Course Exams (BLOCKED DATES):           │
│ • MATH260 Midterm: March 10, 2025 @ 10:00      │
│ • MATH260 Final: May 15, 2025 @ 10:00          │
│ • STAT201 Midterm: March 12, 2025 @ 14:00      │
│ • STAT201 Final: May 17, 2025 @ 14:00          │
│                                                  │
│ SWE Course Exams (TO SCHEDULE):                  │
│ • SWE312 Midterm: March 11 @ 16:00 ✅          │
│ • SWE312 Final: May 16 @ 16:00 ✅              │
│ • SWE314 Midterm: March 13 @ 16:00 ✅          │
│ • SWE314 Final: May 18 @ 16:00 ✅              │
│ • SWE321 Midterm: March 14 @ 16:00 ✅          │
│ • SWE321 Final: May 19 @ 16:00 ✅              │
│                                                  │
│ ✅ No conflicts with external exams!            │
└──────────────────────────────────────────────────┘

STEP 6: FINAL LEVEL 5 SCHEDULE
┌──────────────────────────────────────────────────┐
│              LEVEL 5 WEEKLY SCHEDULE             │
├──────────────────────────────────────────────────┤
│ Time   │ Sun      │ Mon      │ Tue      │ Wed    │
├────────┼──────────┼──────────┼──────────┼────────┤
│ 08:00  │ SWE312-1 │          │ SWE312-1 │        │
│ 09:00  │          │ SWE312-2 │          │ SWE312 │
│ 10:00  │ MATH260  │          │ MATH260  │        │
│ 11:00  │          │ MATH260  │          │ MATH260│
│ 12:00  │ SWE314-1 │          │ SWE314-1 │        │
│ 13:00  │ STAT201  │          │ STAT201  │        │
│ 14:00  │          │ SWE314-2 │          │ SWE314 │
│ 15:00  │ SWE321   │          │ SWE321   │        │
└────────┴──────────┴──────────┴──────────┴────────┘
│                                                  │
│ ✅ No time conflicts!                           │
│ ✅ Students can take all required courses       │
│ ✅ SWE courses don't overlap with external      │
└──────────────────────────────────────────────────┘
```

## 🔄 Complete Generation Flow

```
┌────────────────────────────────────────────────────────────┐
│                     START GENERATION                       │
│              "Generate Fall 2025 Schedule"                 │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                   LOAD INPUT DATA                          │
├────────────────────────────────────────────────────────────┤
│ • mockSWECurriculum (level→courses mapping)                │
│ • mockCourseOfferings (all courses including external)     │
│ • mockSWEStudents (student counts by level)                │
│ • mockFacultyAvailability (who can teach when)             │
│ • mockElectivePackages (elective options)                  │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│              FOR EACH LEVEL (4, 5, 6, 7, 8)               │
└────────────────────────────────────────────────────────────┘
                            ↓
        ┌───────────────────┴───────────────────┐
        ↓                                       ↓
┌──────────────────┐                   ┌──────────────────┐
│ Get Level Info   │                   │ Get External     │
│ • Required SWE   │                   │ Courses          │
│ • Student count  │                   │ • Already fixed  │
│ • Elective slots │                   │ • Get times      │
└──────────────────┘                   │ • Get exams      │
        ↓                               └──────────────────┘
        └───────────────────┬───────────────────┘
                            ↓
                 ┌──────────────────────┐
                 │ Calculate Available  │
                 │ Time Slots           │
                 │ (All - Blocked)      │
                 └──────────────────────┘
                            ↓
                 ┌──────────────────────┐
                 │ For Each SWE Course: │
                 ├──────────────────────┤
                 │ 1. Calculate sections│
                 │ 2. Find time slots   │
                 │ 3. Assign faculty    │
                 │ 4. Schedule exams    │
                 └──────────────────────┘
                            ↓
                 ┌──────────────────────┐
                 │ Validate Level:      │
                 │ • No time conflicts  │
                 │ • No exam conflicts  │
                 │ • Faculty available  │
                 └──────────────────────┘
                            ↓
                 ┌──────────────────────┐
                 │ Store Level Schedule │
                 └──────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│              COMBINE ALL LEVEL SCHEDULES                   │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                 FINAL VALIDATION                           │
├────────────────────────────────────────────────────────────┤
│ • Check cross-level conflicts                              │
│ • Verify faculty total load                                │
│ • Check room allocation                                    │
│ • Generate conflict report                                 │
└────────────────────────────────────────────────────────────┘
                            ↓
┌────────────────────────────────────────────────────────────┐
│                    OUTPUT RESULTS                          │
├────────────────────────────────────────────────────────────┤
│ ✅ Generated Schedule (5 levels)                          │
│ ⚠️  Conflict Report (if any)                              │
│ 📊 Statistics:                                             │
│    • Total sections: 45                                    │
│    • Total exams: 90                                       │
│    • Faculty utilization: 85%                              │
│    • Room utilization: 75%                                 │
└────────────────────────────────────────────────────────────┘
```

## 🎯 Key Data Structures

### Input

```typescript
{
  levels: [4, 5, 6, 7, 8],
  semester: "Fall 2025",
  considerIrregularStudents: true
}
```

### Processing

```typescript
// For Level 5
{
  level: 5,
  requiredCourses: ["SWE312", "SWE314", "SWE321"],
  externalCourses: ["MATH260", "STAT201"],
  studentCount: 35,

  // Calculated
  blockedSlots: [
    { day: "Sun", start: "10:00", end: "10:50" },
    { day: "Tue", start: "10:00", end: "10:50" },
    // ... from MATH260, STAT201
  ],

  availableSlots: [
    { day: "Sun", start: "08:00", end: "08:50" },
    { day: "Sun", start: "09:00", end: "09:50" },
    // ... all slots minus blocked
  ]
}
```

### Output

```typescript
{
  id: "SCHEDULE-2025-FALL-001",
  semester: "Fall 2025",
  generatedAt: "2025-10-01T10:30:00Z",

  levels: [
    {
      level: 5,
      studentCount: 35,
      courses: [
        {
          code: "SWE312",
          name: "Software Architecture",
          sections: [
            {
              id: "SWE312-01",
              instructor: "Dr. Ahmed",
              times: [
                { day: "Sun", start: "08:00", end: "08:50", room: "101" },
                { day: "Tue", start: "08:00", end: "08:50", room: "101" }
              ]
            },
            // Section 02...
          ],
          exams: {
            midterm: { date: "2025-03-11", time: "16:00", duration: 120 },
            final: { date: "2025-05-16", time: "16:00", duration: 120 }
          }
        },
        // SWE314, SWE321...
      ],

      externalCourses: [/* MATH260, STAT201 - read-only */],

      conflicts: [] // None if successful
    },
    // Levels 4, 6, 7, 8...
  ],

  conflicts: [], // Global conflicts

  metadata: {
    totalSections: 45,
    totalExams: 90,
    facultyUtilization: 85,
    roomUtilization: 75
  }
}
```

## 📊 Algorithm Complexity

```
Time Complexity Analysis:

For N levels, C courses per level, S sections per course:

1. Data Loading: O(1) - Read from mockData
2. For each level: O(N)
   a. Get external courses: O(C)
   b. Calculate blocked slots: O(S * C)
   c. Find available slots: O(total_slots)
   d. Assign sections: O(C * S * available_slots)
   e. Schedule exams: O(C * exam_dates)
   f. Validate: O(C * S)

Overall: O(N * C * S * max(available_slots, exam_dates))

For typical case:
• N = 5 levels
• C = 5 courses/level
• S = 2 sections/course
• Available slots ≈ 50
• Exam dates ≈ 30

= O(5 * 5 * 2 * 50) = O(2,500) operations

Expected runtime: < 1 second ✅
```

## 🔍 Conflict Detection Strategy

```
Priority Levels:

1. CRITICAL (Must fix before generation)
   ⛔ External course times overlap
   ⛔ External exam dates overlap
   ⛔ No available time slots
   ⛔ No available faculty

2. ERROR (Generate but flag)
   ❌ SWE course time conflicts within level
   ❌ Exam conflicts within level
   ❌ Faculty overload (>15 hrs/week)
   ❌ Room capacity exceeded

3. WARNING (Generate but notify)
   ⚠️  Back-to-back classes (no break)
   ⚠️  Early morning classes (before 8:30)
   ⚠️  Late afternoon classes (after 4:00)
   ⚠️  Faculty teaching outside preference
```

## 💡 Example Use Cases

### Use Case 1: Regular Generation

```
Committee Member:
1. Opens Scheduler page
2. Clicks "Generate Schedule" button
3. Selects "Fall 2025"
4. Selects levels: [4, 5, 6, 7, 8]
5. Clicks "Generate"
6. System processes for 2 seconds
7. Shows success: "Schedule generated with 0 conflicts"
8. Displays weekly grid view per level
```

### Use Case 2: Conflict Resolution

```
System detects:
⚠️  Level 6: SWE333 Section 01 conflicts with MATH301

Resolution:
1. Show conflict in UI
2. Suggest alternative time slots
3. Committee manually adjusts
4. Re-validate
5. Confirm no conflicts
```

### Use Case 3: Elective Demand

```
Level 6 students (30 total):
• 20 want CS201 (Data Structures)
• 15 want ISL102 (Quranic Studies)
• 10 want MATH202 (Calculus II)

System decision:
✅ Open CS201 section (high demand: 20/30 = 67%)
✅ Open ISL102 section (medium demand: 15/30 = 50%)
❌ Skip MATH202 (low demand: 10/30 = 33%)
```

---

**This visual guide complements the main implementation plan.**
**Review both documents before starting Phase 1!**
