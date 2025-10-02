import { SWEStudent } from "@/lib/types";

/**
 * Generate mock students for a level with randomized elective preferences
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
    // Each student gets a different randomized ranking
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
 * Realistic distribution: Higher levels have fewer students due to attrition
 */
export const mockSWEStudents: SWEStudent[] = [
  // Level 4: 75 students (largest cohort - new admissions)
  ...generateStudentsForLevel(4, 75, ["PHY101", "IC100", "IC102", "IC105"]),

  // Level 5: 65 students
  ...generateStudentsForLevel(5, 65, [
    "MATH254",
    "PHY101",
    "IC100",
    "IC102",
    "IC105",
  ]),

  // Level 6: 55 students, can take 1 elective
  ...generateStudentsForLevel(6, 55, [
    "QRAN100", // Quranic Studies
    "PHY101", // Biology I
  ]),

  // Level 7: 45 students, can take 2 electives
  ...generateStudentsForLevel(7, 45, [
    "CS311", // Algorithms
    "OPER122", // OR
    "MATH254",
    "SWE481",
    "SWE483",
  ]),

  // Level 8: 35 students, can take 3 electives
  ...generateStudentsForLevel(8, 35, ["SWE486", "SWE485", "SWE481", "SWE483"]),
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
 * Helper: Get total number of SWE students
 */
export function getTotalSWEStudents(): number {
  return mockSWEStudents.length;
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

/**
 * Helper: Get top demanded electives for a level
 * Returns array of [courseCode, demandCount] sorted by demand (highest first)
 */
export function getTopElectivesByDemand(
  level: number,
  topN: number = 5
): Array<[string, number]> {
  const demand = getElectiveDemandForLevel(level);
  return Array.from(demand.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN);
}

/**
 * Helper: Get all levels with their student counts
 */
export function getStudentCountsByLevel(): Map<number, number> {
  const counts = new Map<number, number>();
  [4, 5, 6, 7, 8].forEach((level) => {
    counts.set(level, getStudentCountForLevel(level));
  });
  return counts;
}

/**
 * Helper: Calculate sections needed for a course at a level
 * Assumes ~30 students per section
 */
export function calculateSectionsNeeded(
  level: number,
  sectionCapacity: number = 30
): number {
  const studentCount = getStudentCountForLevel(level);
  return Math.ceil(studentCount / sectionCapacity);
}
