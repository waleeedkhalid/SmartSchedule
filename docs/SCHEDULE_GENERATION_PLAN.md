# Schedule Generation System - Implementation Plan

**Date:** October 1, 2025  
**Status:** Planning Phase  
**Goal:** Build automated schedule generation for SWE courses with conflict-free scheduling

---

## 🎯 Core Concept

**Level-Based Group Scheduling:**

- Students grouped by level (4, 5, 6, 7, 8)
- Each level has required SWE courses + external department courses
- System generates SWE course schedules that avoid conflicts with:
  - External department course times
  - External department exam times
  - Other SWE courses for the same level
  - Faculty availability constraints

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT COLLECTION                         │
├─────────────────────────────────────────────────────────────┤
│ • SWE Curriculum Plan (level → courses)                     │
│ • External Courses (MATH, PHY, ISL, etc.)                   │
│ • Student Elective Preferences                              │
│ • Faculty Availability                                      │
│ • Existing Schedules/Constraints                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  CONSTRAINT ANALYSIS                        │
├─────────────────────────────────────────────────────────────┤
│ • Identify blocked time slots (external courses)            │
│ • Identify blocked exam dates                               │
│ • Check faculty availability windows                        │
│ • Calculate available slots per level                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 SCHEDULE GENERATION                         │
├─────────────────────────────────────────────────────────────┤
│ For each level (4, 5, 6, 7, 8):                            │
│   1. Get required SWE courses                               │
│   2. Get external courses for level                         │
│   3. Find available time slots                              │
│   4. Assign SWE sections to slots                           │
│   5. Schedule exams (no conflicts)                          │
│   6. Assign faculty to sections                             │
│   7. Validate constraints                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   VALIDATION & OUTPUT                       │
├─────────────────────────────────────────────────────────────┤
│ • Conflict detection report                                 │
│ • Generated schedule per level                              │
│ • Faculty teaching load summary                             │
│ • Room allocation report                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Implementation Phases

### **Phase 1: Foundation (PRIORITY - Do First)**

#### 1.1 Type Definitions

**File:** `src/lib/types.ts`

Add new types:

```typescript
// Faculty Availability
interface FacultyAvailability {
  instructorId: string;
  instructorName: string;
  availableSlots: TimeSlot[];
  maxTeachingHours: number; // per week
  preferences?: string[]; // preferred course codes
}

interface TimeSlot {
  day: string; // "Sunday", "Monday", etc.
  startTime: string; // "08:00"
  endTime: string; // "17:00"
}

// SWE Student
interface SWEStudent {
  id: string;
  name: string;
  level: number; // 4, 5, 6, 7, 8
  electivePreferences: string[]; // course codes, ranked
  isIrregular?: boolean;
  irregularCourses?: string[]; // if irregular
}

// SWE Curriculum Plan
interface SWECurriculumLevel {
  level: number;
  requiredSWECourses: string[]; // SWE course codes
  externalCourses: string[]; // Non-SWE course codes (MATH, PHY, etc.)
  totalCredits: number;
  electiveSlots: number; // how many elective courses
}

// Schedule Generation Request
interface ScheduleGenerationRequest {
  semester: string; // "Fall 2025"
  levels: number[]; // [4, 5, 6, 7, 8]
  considerIrregularStudents: boolean;
  optimizationGoals?: (
    | "minimize-conflicts"
    | "balance-load"
    | "prefer-morning"
  )[];
}

// Generated Schedule Output
interface GeneratedSchedule {
  id: string;
  semester: string;
  generatedAt: string;
  levels: LevelSchedule[];
  conflicts: Conflict[];
  metadata: {
    totalSections: number;
    totalExams: number;
    facultyUtilization: number; // percentage
    roomUtilization: number; // percentage
  };
}

interface LevelSchedule {
  level: number;
  studentCount: number;
  courses: CourseOffering[]; // SWE courses with generated sections
  externalCourses: CourseOffering[]; // External courses (read-only)
  conflicts: Conflict[];
}
```

#### 1.2 Mock Data - SWE Curriculum Plan

**File:** `src/data/mockSWECurriculum.ts`

```typescript
export const mockSWECurriculum: SWECurriculumLevel[] = [
  {
    level: 4,
    requiredSWECourses: ["SWE211", "SWE226"],
    externalCourses: ["MATH203", "PHY104", "ISL101"],
    totalCredits: 18,
    electiveSlots: 0, // No electives at level 4
  },
  {
    level: 5,
    requiredSWECourses: ["SWE312", "SWE314", "SWE321"],
    externalCourses: ["MATH260", "STAT201"],
    totalCredits: 18,
    electiveSlots: 0,
  },
  {
    level: 6,
    requiredSWECourses: ["SWE333", "SWE363", "SWE381"],
    externalCourses: ["MATH301"],
    totalCredits: 18,
    electiveSlots: 1, // 1 elective course
  },
  {
    level: 7,
    requiredSWECourses: ["SWE434", "SWE444"],
    externalCourses: [],
    totalCredits: 15,
    electiveSlots: 2, // 2 elective courses
  },
  {
    level: 8,
    requiredSWECourses: ["SWE497"], // Capstone project
    externalCourses: [],
    totalCredits: 12,
    electiveSlots: 3, // 3 elective courses
  },
];
```

#### 1.3 Mock Data - SWE Students

**File:** `src/data/mockSWEStudents.ts`

```typescript
export const mockSWEStudents: SWEStudent[] = [
  // Level 4 students (40 students)
  ...generateStudents(4, 40, []),

  // Level 5 students (35 students)
  ...generateStudents(5, 35, []),

  // Level 6 students (30 students) - start having elective preferences
  ...generateStudents(6, 30, ["CS201", "ISL102", "MATH202"]),

  // Level 7 students (25 students)
  ...generateStudents(7, 25, ["CS301", "CS201", "ISL103", "STAT201"]),

  // Level 8 students (20 students)
  ...generateStudents(8, 20, [
    "CS401",
    "CS301",
    "MATH301",
    "PHYS102",
    "BIOL101",
  ]),
];

function generateStudents(
  level: number,
  count: number,
  electivePool: string[]
): SWEStudent[] {
  const students: SWEStudent[] = [];
  for (let i = 1; i <= count; i++) {
    students.push({
      id: `SWE-L${level}-${String(i).padStart(3, "0")}`,
      name: `Student ${level}.${i}`,
      level,
      electivePreferences: electivePool.slice(
        0,
        Math.min(6, electivePool.length)
      ),
    });
  }
  return students;
}
```

#### 1.4 Mock Data - Faculty Availability

**File:** `src/data/mockFacultyAvailability.ts`

```typescript
export const mockFacultyAvailability: FacultyAvailability[] = [
  {
    instructorId: "FAC001",
    instructorName: "Dr. Ahmed",
    availableSlots: [
      { day: "Sunday", startTime: "08:00", endTime: "14:00" },
      { day: "Monday", startTime: "08:00", endTime: "14:00" },
      { day: "Tuesday", startTime: "08:00", endTime: "14:00" },
      { day: "Wednesday", startTime: "08:00", endTime: "14:00" },
    ],
    maxTeachingHours: 15,
    preferences: ["SWE211", "SWE312"],
  },
  {
    instructorId: "FAC002",
    instructorName: "Dr. Fatima",
    availableSlots: [
      { day: "Sunday", startTime: "10:00", endTime: "16:00" },
      { day: "Tuesday", startTime: "10:00", endTime: "16:00" },
      { day: "Thursday", startTime: "10:00", endTime: "16:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE314", "SWE333"],
  },
  // Add more faculty...
];
```

#### 1.5 Update ElectiveCourse with Prerequisites

**File:** `src/data/mockData.ts`

Update `mockElectivePackages` structure:

```typescript
// Add prerequisites to elective courses
{
  id: "departmentElectives",
  label: "Department Electives",
  rangeLabel: "0-9 hours",
  minHours: 0,
  maxHours: 9,
  courses: [
    {
      code: "CS201",
      name: "Data Structures",
      credits: 3,
      prerequisites: ["SWE211"], // Need SWE211 first
    },
    {
      code: "CS301",
      name: "Algorithms",
      credits: 3,
      prerequisites: ["CS201"], // Need CS201 first
    },
    // ...
  ],
}
```

---

### **Phase 2: Data Collection Services**

#### 2.1 Schedule Data Collector

**File:** `src/lib/schedule/schedule-collector.ts`

```typescript
export class ScheduleDataCollector {
  // Get all courses for a specific level
  getCoursesForLevel(level: number): {
    sweCourses: CourseOffering[];
    externalCourses: CourseOffering[];
  };

  // Get students in a level
  getStudentsByLevel(level: number): SWEStudent[];

  // Get available faculty for a course
  getAvailableFaculty(courseCode: string): FacultyAvailability[];

  // Get blocked time slots for a level
  getBlockedSlots(level: number): TimeSlot[];

  // Get blocked exam dates for a level
  getBlockedExamDates(level: number): string[];

  // Get elective demand (how many students want each elective)
  getElectiveDemand(level: number): Map<string, number>;
}
```

#### 2.2 Time Slot Manager

**File:** `src/lib/schedule/time-slot-manager.ts`

```typescript
export class TimeSlotManager {
  // Generate all possible time slots
  generateAllSlots(): TimeSlot[];

  // Check if two slots overlap
  checkOverlap(slot1: TimeSlot, slot2: TimeSlot): boolean;

  // Find available slots (not blocked)
  findAvailableSlots(
    allSlots: TimeSlot[],
    blockedSlots: TimeSlot[]
  ): TimeSlot[];

  // Check if faculty available in slot
  isFacultyAvailable(faculty: FacultyAvailability, slot: TimeSlot): boolean;
}
```

---

### **Phase 3: Conflict Detection**

#### 3.1 Conflict Checker

**File:** `src/lib/schedule/conflict-checker.ts`

```typescript
export class ConflictChecker {
  // Check time conflicts between sections
  checkTimeConflicts(sections: Section[]): Conflict[];

  // Check exam conflicts
  checkExamConflicts(courses: CourseOffering[]): Conflict[];

  // Check faculty overload
  checkFacultyLoad(
    sections: Section[],
    facultyAvailability: FacultyAvailability[]
  ): Conflict[];

  // Check room capacity
  checkRoomCapacity(section: Section, studentCount: number): Conflict[];

  // Check prerequisites
  checkPrerequisites(student: SWEStudent, courseCode: string): boolean;
}
```

---

### **Phase 4: Core Generation Logic**

#### 4.1 Schedule Generator (Main Service)

**File:** `src/lib/schedule/schedule-generator.ts`

```typescript
export class ScheduleGenerator {
  constructor(
    private collector: ScheduleDataCollector,
    private timeSlotManager: TimeSlotManager,
    private conflictChecker: ConflictChecker
  ) {}

  // Main generation method
  async generateSchedule(
    request: ScheduleGenerationRequest
  ): Promise<GeneratedSchedule>;

  // Generate schedule for one level
  private generateLevelSchedule(level: number): LevelSchedule;

  // Assign sections to time slots
  private assignSectionsToSlots(
    course: CourseOffering,
    availableSlots: TimeSlot[],
    facultyPool: FacultyAvailability[]
  ): Section[];

  // Schedule exams
  private scheduleExams(
    courses: CourseOffering[],
    blockedDates: string[]
  ): void;

  // Optimize schedule
  private optimize(schedule: GeneratedSchedule): GeneratedSchedule;
}
```

#### Algorithm Flow:

```
FOR each level (4, 5, 6, 7, 8):

  1. Get curriculum for level
     - requiredSWECourses
     - externalCourses
     - electiveSlots

  2. Get external course schedules (already fixed)
     - Extract all time slots used
     - Extract all exam dates used
     → These are BLOCKED

  3. Get available time slots
     - All possible university slots (8am-5pm, Sun-Thu)
     - MINUS blocked external course slots
     → Available slots for SWE courses

  4. For each required SWE course:
     a. Get student count for level
     b. Calculate sections needed (assuming ~30 students per section)
     c. For each section:
        - Find available time slot (no conflicts)
        - Find available faculty
        - Assign faculty to section
        - Mark slot as used
     d. Schedule exams:
        - Find available exam date (no conflicts with external exams)
        - Assign midterm date
        - Assign final date

  5. Handle electives (if level has electiveSlots):
     a. Get elective demand from students
     b. Rank electives by demand
     c. Open sections for top demanded electives
     d. Follow same process as required courses

  6. Validate level schedule:
     - No time conflicts within level
     - No exam conflicts within level
     - Faculty load under limit
     - Room capacity sufficient

  7. Store level schedule

RETURN complete schedule for all levels
```

---

### **Phase 5: API & Integration**

#### 5.1 API Endpoints

**File:** `src/app/api/schedule/generate/route.ts`

```typescript
// POST /api/schedule/generate
// Generate new schedule
export async function POST(request: Request) {
  const body: ScheduleGenerationRequest = await request.json();
  const generator = new ScheduleGenerator(/* dependencies */);
  const schedule = await generator.generateSchedule(body);
  return Response.json(schedule);
}
```

**File:** `src/app/api/schedule/validate/route.ts`

```typescript
// POST /api/schedule/validate
// Validate existing schedule
export async function POST(request: Request) {
  const schedule: GeneratedSchedule = await request.json();
  const conflicts = validateSchedule(schedule);
  return Response.json({ conflicts });
}
```

#### 5.2 UI Component

**File:** `src/components/committee/scheduler/GenerateScheduleDialog.tsx`

```typescript
// Dialog to trigger schedule generation
// Allows selecting:
// - Semester
// - Levels to generate
// - Optimization preferences
// - Include irregular students?

// Shows progress during generation
// Displays results and conflicts
```

---

## 📋 Implementation Checklist

### Phase 1: Foundation ✅ (Week 1)

- [ ] Add new types to `src/lib/types.ts`
- [ ] Create `mockSWECurriculum.ts`
- [ ] Create `mockSWEStudents.ts`
- [ ] Create `mockFacultyAvailability.ts`
- [ ] Update `mockElectivePackages` with prerequisites
- [ ] Update `mockData.ts` exports

### Phase 2: Data Services 📊 (Week 2)

- [ ] Implement `ScheduleDataCollector`
- [ ] Implement `TimeSlotManager`
- [ ] Add helper functions to `committee-data-helpers.ts`
- [ ] Write unit tests for data collection

### Phase 3: Conflict Detection ⚠️ (Week 2)

- [ ] Implement `ConflictChecker`
- [ ] Add conflict detection algorithms
- [ ] Integrate with existing rules-engine
- [ ] Write unit tests for conflict detection

### Phase 4: Core Generation 🎯 (Week 3)

- [ ] Implement `ScheduleGenerator` main class
- [ ] Implement level-by-level generation
- [ ] Implement section assignment algorithm
- [ ] Implement exam scheduling algorithm
- [ ] Add optimization logic
- [ ] Write integration tests

### Phase 5: API & UI 🖥️ (Week 4)

- [ ] Create API endpoints
- [ ] Create generation UI component
- [ ] Create results display component
- [ ] Add to committee scheduler page
- [ ] End-to-end testing

---

## 🎯 Success Criteria

The schedule generation system is successful when:

1. ✅ Can generate conflict-free schedules for all levels
2. ✅ No time overlaps between courses in same level
3. ✅ No exam conflicts for any level
4. ✅ Respects faculty availability constraints
5. ✅ Handles elective demand properly
6. ✅ Generates human-readable conflict reports
7. ✅ Completes generation in <5 seconds for all levels
8. ✅ UI is simple and intuitive for committee users

---

## 🚀 Next Steps

1. **Review this plan** - Confirm approach is correct
2. **Start Phase 1** - Add types and mock data
3. **Build incrementally** - Test each phase before moving on
4. **Iterate based on feedback** - Adjust algorithm as needed

---

## ⚠️ Important Notes

### Assumptions:

- University operates Sun-Thu (5 days/week)
- Class periods: 8am-5pm
- Section size: ~30 students
- Faculty max load: 15 hours/week
- Exam period: 2 weeks at end of semester

### Limitations (Phase 3):

- No real-time updates
- No complex optimization (just greedy algorithm)
- No room capacity database (assume sufficient rooms)
- No student individual constraints (only level-based)

### Future Enhancements:

- Genetic algorithm for optimization
- Machine learning for demand prediction
- Multi-semester planning
- Individual student schedules
- Room allocation optimization
- What-if scenario analysis

---

**Ready to start implementation? Please confirm the plan or request adjustments!**
