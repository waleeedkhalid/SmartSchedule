# Schedule Generation - Quick Start Implementation Guide

**Goal:** Get the foundation built TODAY so we can start generating schedules

---

## 🚀 Phase 1: Foundation - Implementation Order

### Step 1: Add Types (15 minutes)

**File:** `src/lib/types.ts`

Add these interfaces:

```typescript
// Time Management
export interface TimeSlot {
  day: string; // "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"
  startTime: string; // "08:00"
  endTime: string; // "08:50"
}

// Faculty Availability
export interface FacultyAvailability {
  instructorId: string;
  instructorName: string;
  availableSlots: TimeSlot[];
  maxTeachingHours: number; // per week
  preferences?: string[]; // preferred course codes
}

// SWE Student
export interface SWEStudent {
  id: string;
  name: string;
  level: number; // 4, 5, 6, 7, 8
  electivePreferences: string[]; // course codes, ranked by priority
  isIrregular?: boolean;
  irregularCourses?: string[]; // only if irregular
}

// SWE Curriculum Level Configuration
export interface SWECurriculumLevel {
  level: number;
  requiredSWECourses: string[]; // e.g., ["SWE211", "SWE226"]
  externalCourses: string[]; // e.g., ["MATH203", "PHY104"]
  totalCredits: number;
  electiveSlots: number; // how many elective courses this level can take
}

// Schedule Generation Request
export interface ScheduleGenerationRequest {
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
export interface GeneratedSchedule {
  id: string;
  semester: string;
  generatedAt: string; // ISO date
  levels: LevelSchedule[];
  conflicts: Conflict[];
  metadata: ScheduleMetadata;
}

export interface LevelSchedule {
  level: number;
  studentCount: number;
  courses: CourseOffering[]; // SWE courses with generated sections
  externalCourses: CourseOffering[]; // External courses (read-only reference)
  conflicts: Conflict[];
}

export interface ScheduleMetadata {
  totalSections: number;
  totalExams: number;
  facultyUtilization: number; // percentage 0-100
  roomUtilization: number; // percentage 0-100
}
```

**Update ElectiveCourse:**

```typescript
export interface ElectiveCourse {
  code: string;
  name: string;
  credits: number;
  prerequisites?: string[]; // ADD THIS
}
```

---

### Step 2: Create SWE Curriculum Data (20 minutes)

**File:** `src/data/mockSWECurriculum.ts`

```typescript
import { SWECurriculumLevel } from "@/lib/types";

/**
 * SWE Department Curriculum Plan
 * Defines what courses each level takes
 */
export const mockSWECurriculum: SWECurriculumLevel[] = [
  {
    level: 4,
    requiredSWECourses: ["SWE211", "SWE226"],
    externalCourses: ["MATH203", "PHY104", "ISL101"],
    totalCredits: 18,
    electiveSlots: 0, // Level 4 has no electives
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
    electiveSlots: 1, // Can take 1 elective
  },
  {
    level: 7,
    requiredSWECourses: ["SWE434", "SWE444"],
    externalCourses: [],
    totalCredits: 15,
    electiveSlots: 2, // Can take 2 electives
  },
  {
    level: 8,
    requiredSWECourses: ["SWE497"], // Capstone project
    externalCourses: [],
    totalCredits: 12,
    electiveSlots: 3, // Can take 3 electives
  },
];

/**
 * Helper function to get curriculum for specific level
 */
export function getCurriculumForLevel(
  level: number
): SWECurriculumLevel | undefined {
  return mockSWECurriculum.find((c) => c.level === level);
}

/**
 * Helper function to get all SWE courses for a level
 */
export function getAllSWECourses(): string[] {
  return Array.from(
    new Set(mockSWECurriculum.flatMap((c) => c.requiredSWECourses))
  );
}
```

---

### Step 3: Create SWE Students Data (15 minutes)

**File:** `src/data/mockSWEStudents.ts`

```typescript
import { SWEStudent } from "@/lib/types";

/**
 * Generate mock students for a level
 */
function generateStudentsForLevel(
  level: number,
  count: number,
  electivePool: string[]
): SWEStudent[] {
  const students: SWEStudent[] = [];

  for (let i = 1; i <= count; i++) {
    const studentId = `SWE-L${level}-${String(i).padStart(3, "0")}`;

    // Randomize elective preferences (shuffle the pool)
    const shuffled = [...electivePool].sort(() => Math.random() - 0.5);
    const preferences = shuffled.slice(0, Math.min(6, electivePool.length));

    students.push({
      id: studentId,
      name: `Student ${level}.${i}`,
      level,
      electivePreferences: preferences,
    });
  }

  return students;
}

/**
 * Mock SWE students by level
 */
export const mockSWEStudents: SWEStudent[] = [
  // Level 4: 40 students, no electives yet
  ...generateStudentsForLevel(4, 40, []),

  // Level 5: 35 students, no electives yet
  ...generateStudentsForLevel(5, 35, []),

  // Level 6: 30 students, can take 1 elective
  ...generateStudentsForLevel(6, 30, ["CS201", "ISL102", "MATH202", "PHYS102"]),

  // Level 7: 25 students, can take 2 electives
  ...generateStudentsForLevel(7, 25, [
    "CS301",
    "CS201",
    "ISL103",
    "STAT201",
    "BIOL101",
  ]),

  // Level 8: 20 students, can take 3 electives
  ...generateStudentsForLevel(8, 20, [
    "CS401",
    "CS301",
    "MATH301",
    "PHYS102",
    "BIOL101",
    "CHEM102",
  ]),
];

/**
 * Helper: Get students by level
 */
export function getStudentsByLevel(level: number): SWEStudent[] {
  return mockSWEStudents.filter((s) => s.level === level);
}

/**
 * Helper: Get student count for level
 */
export function getStudentCountForLevel(level: number): number {
  return mockSWEStudents.filter((s) => s.level === level).length;
}

/**
 * Helper: Get elective demand for a level
 * Returns: Map<courseCode, numberOfStudentsWanting>
 */
export function getElectiveDemandForLevel(level: number): Map<string, number> {
  const students = getStudentsByLevel(level);
  const demand = new Map<string, number>();

  students.forEach((student) => {
    student.electivePreferences.forEach((courseCode) => {
      demand.set(courseCode, (demand.get(courseCode) || 0) + 1);
    });
  });

  return demand;
}
```

---

### Step 4: Create Faculty Availability Data (15 minutes)

**File:** `src/data/mockFacultyAvailability.ts`

```typescript
import { FacultyAvailability } from "@/lib/types";

/**
 * Mock faculty availability data
 */
export const mockFacultyAvailability: FacultyAvailability[] = [
  {
    instructorId: "FAC001",
    instructorName: "Dr. Ahmed Al-Rashid",
    availableSlots: [
      { day: "Sunday", startTime: "08:00", endTime: "14:00" },
      { day: "Monday", startTime: "08:00", endTime: "14:00" },
      { day: "Tuesday", startTime: "08:00", endTime: "14:00" },
      { day: "Wednesday", startTime: "08:00", endTime: "14:00" },
    ],
    maxTeachingHours: 15,
    preferences: ["SWE211", "SWE312", "SWE333"],
  },
  {
    instructorId: "FAC002",
    instructorName: "Dr. Fatima Hassan",
    availableSlots: [
      { day: "Sunday", startTime: "10:00", endTime: "16:00" },
      { day: "Tuesday", startTime: "10:00", endTime: "16:00" },
      { day: "Thursday", startTime: "10:00", endTime: "16:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE314", "SWE363", "SWE434"],
  },
  {
    instructorId: "FAC003",
    instructorName: "Dr. Omar Ibrahim",
    availableSlots: [
      { day: "Sunday", startTime: "09:00", endTime: "15:00" },
      { day: "Monday", startTime: "09:00", endTime: "15:00" },
      { day: "Wednesday", startTime: "09:00", endTime: "15:00" },
      { day: "Thursday", startTime: "09:00", endTime: "15:00" },
    ],
    maxTeachingHours: 15,
    preferences: ["SWE226", "SWE321", "SWE381"],
  },
  {
    instructorId: "FAC004",
    instructorName: "Dr. Sara Mohammed",
    availableSlots: [
      { day: "Sunday", startTime: "08:00", endTime: "13:00" },
      { day: "Tuesday", startTime: "08:00", endTime: "13:00" },
      { day: "Wednesday", startTime: "08:00", endTime: "13:00" },
    ],
    maxTeachingHours: 12,
    preferences: ["SWE444", "SWE497"],
  },
  {
    instructorId: "FAC005",
    instructorName: "Dr. Khalid Abdullah",
    availableSlots: [
      { day: "Monday", startTime: "10:00", endTime: "17:00" },
      { day: "Tuesday", startTime: "10:00", endTime: "17:00" },
      { day: "Wednesday", startTime: "10:00", endTime: "17:00" },
      { day: "Thursday", startTime: "10:00", endTime: "17:00" },
    ],
    maxTeachingHours: 15,
    preferences: ["SWE312", "SWE314", "SWE434"],
  },
];

/**
 * Helper: Get faculty who can teach a specific course
 */
export function getFacultyForCourse(courseCode: string): FacultyAvailability[] {
  return mockFacultyAvailability.filter((f) =>
    f.preferences?.includes(courseCode)
  );
}

/**
 * Helper: Get all available faculty
 */
export function getAllFaculty(): FacultyAvailability[] {
  return mockFacultyAvailability;
}
```

---

### Step 5: Update mockData.ts Exports (5 minutes)

**File:** `src/data/mockData.ts`

Add to the end of the file:

```typescript
// Export new mock data
export {
  mockSWECurriculum,
  getCurriculumForLevel,
  getAllSWECourses,
} from "./mockSWECurriculum";
export {
  mockSWEStudents,
  getStudentsByLevel,
  getStudentCountForLevel,
  getElectiveDemandForLevel,
} from "./mockSWEStudents";
export {
  mockFacultyAvailability,
  getFacultyForCourse,
  getAllFaculty,
} from "./mockFacultyAvailability";
```

---

### Step 6: Update Elective Packages with Prerequisites (10 minutes)

**File:** `src/data/mockData.ts`

Find `mockElectivePackages` and update:

```typescript
export const mockElectivePackages: ElectivePackage[] = [
  {
    id: "islamic",
    label: "Islamic Studies",
    rangeLabel: "2-4 hours",
    minHours: 2,
    maxHours: 4,
    courses: [
      {
        code: "ISL101",
        name: "Islamic Culture",
        credits: 2,
        prerequisites: [], // No prerequisites
      },
      {
        code: "ISL102",
        name: "Quranic Studies",
        credits: 2,
        prerequisites: [], // No prerequisites
      },
      {
        code: "ISL103",
        name: "Islamic History",
        credits: 2,
        prerequisites: [], // No prerequisites
      },
    ],
  },
  {
    id: "mathStats",
    label: "Math/Statistics",
    rangeLabel: "0-6 hours",
    minHours: 0,
    maxHours: 6,
    courses: [
      {
        code: "MATH202",
        name: "Calculus II",
        credits: 3,
        prerequisites: ["MATH203"], // Need Linear Algebra
      },
      {
        code: "STAT201",
        name: "Probability",
        credits: 3,
        prerequisites: [], // No prerequisites
      },
      {
        code: "MATH301",
        name: "Linear Algebra",
        credits: 3,
        prerequisites: ["MATH203"], // Need previous math
      },
    ],
  },
  {
    id: "generalScience",
    label: "General Science",
    rangeLabel: "0-3 hours",
    minHours: 0,
    maxHours: 3,
    courses: [
      {
        code: "PHYS102",
        name: "Physics II",
        credits: 3,
        prerequisites: ["PHY104"], // Need Physics I
      },
      {
        code: "BIOL101",
        name: "Biology I",
        credits: 3,
        prerequisites: [], // No prerequisites
      },
      {
        code: "CHEM102",
        name: "Chemistry II",
        credits: 3,
        prerequisites: [], // No prerequisites
      },
    ],
  },
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
        prerequisites: ["SWE211"], // Need intro to SWE
      },
      {
        code: "CS301",
        name: "Algorithms",
        credits: 3,
        prerequisites: ["CS201"], // Need Data Structures
      },
      {
        code: "CS401",
        name: "Machine Learning",
        credits: 3,
        prerequisites: ["CS301", "MATH301"], // Need Algorithms and Linear Algebra
      },
    ],
  },
];
```

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] `src/lib/types.ts` has all new interfaces
- [ ] `src/data/mockSWECurriculum.ts` exists and exports curriculum
- [ ] `src/data/mockSWEStudents.ts` exists and exports students
- [ ] `src/data/mockFacultyAvailability.ts` exists and exports faculty
- [ ] `src/data/mockData.ts` exports all new data
- [ ] `mockElectivePackages` has prerequisites added
- [ ] No TypeScript errors
- [ ] Build completes successfully

---

## 🧪 Quick Test

Create a test file to verify data:

**File:** `src/lib/schedule/test-data.ts`

```typescript
import {
  mockSWECurriculum,
  mockSWEStudents,
  mockFacultyAvailability,
  getStudentCountForLevel,
  getElectiveDemandForLevel,
} from "@/data/mockData";

export function testScheduleData() {
  console.log("=== Schedule Data Test ===\n");

  // Test curriculum
  console.log("Curriculum Levels:", mockSWECurriculum.length);
  mockSWECurriculum.forEach((level) => {
    console.log(`Level ${level.level}:`, {
      swe: level.requiredSWECourses.length,
      external: level.externalCourses.length,
      electives: level.electiveSlots,
    });
  });

  // Test students
  console.log("\nStudent Counts by Level:");
  [4, 5, 6, 7, 8].forEach((level) => {
    console.log(`Level ${level}:`, getStudentCountForLevel(level));
  });

  // Test elective demand
  console.log("\nElective Demand (Level 6):");
  const demand = getElectiveDemandForLevel(6);
  demand.forEach((count, course) => {
    console.log(`${course}: ${count} students`);
  });

  // Test faculty
  console.log("\nFaculty Count:", mockFacultyAvailability.length);
  console.log(
    "Faculty:",
    mockFacultyAvailability.map((f) => f.instructorName)
  );

  console.log("\n=== All Data Loaded Successfully ===");
}
```

Run in browser console or add to a demo page.

---

## 🎯 What's Next?

Once Phase 1 is complete, we can move to:

1. **Phase 2:** Build data collection services
2. **Phase 3:** Implement conflict detection
3. **Phase 4:** Build the generation algorithm
4. **Phase 5:** Create UI and API

---

**Estimated Time for Phase 1:** ~1.5 hours  
**Ready to start? Let's implement Step 1! 🚀**
