import { SWECurriculumLevel } from "@/lib/types";

/**
 * SWE Department Curriculum Plan
 * Defines what courses each level takes (Required SWE + External courses)
 * Based on the actual SWE curriculum structure
 */
export const mockSWECurriculum: SWECurriculumLevel[] = [
  {
    level: 4,
    requiredSWECourses: ["CEN303", "SWE211"],
    externalCourses: ["MATH244", "PHY104", "CSC113"],
    totalCredits: 17,
    electiveSlots: 1,
  },
  {
    level: 5,
    requiredSWECourses: ["SWE312", "SWE314"],
    externalCourses: ["CSC212", "CSC220"],
    totalCredits: 12,
    electiveSlots: 3,
  },
  {
    level: 6,
    requiredSWECourses: ["SWE333", "SWE321", "SWE381"],
    externalCourses: ["IS230", "CSC227"],
    totalCredits: 14,
    electiveSlots: 3, // Can take 3 elective courses
  },
  {
    level: 7,
    requiredSWECourses: ["SWE434", "SWE444", "SWE482", "SWE477"],
    externalCourses: ["IC107"],
    totalCredits: 12,
    electiveSlots: 2, // Can take 2 elective courses
  },
  {
    level: 8,
    requiredSWECourses: ["SWE455", "SWE466"], // Capstone project
    externalCourses: ["IC108"],
    totalCredits: 7,
    electiveSlots: 4, // Can take 4 elective courses
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
 * Helper function to get all SWE courses across all levels
 */
export function getAllSWECourses(): string[] {
  return Array.from(
    new Set(mockSWECurriculum.flatMap((c) => c.requiredSWECourses))
  );
}

/**
 * Helper function to get all external courses required by SWE students
 */
export function getAllExternalCourses(): string[] {
  return Array.from(
    new Set(mockSWECurriculum.flatMap((c) => c.externalCourses))
  );
}

/**
 * Helper function to check if a course is a required SWE course
 */
export function isSWECourse(courseCode: string): boolean {
  return getAllSWECourses().includes(courseCode);
}

/**
 * Helper function to check if a course is an external course required by SWE
 */
export function isExternalCourse(courseCode: string): boolean {
  return getAllExternalCourses().includes(courseCode);
}

/**
 * Helper function to get which level(s) take a specific course
 */
export function getLevelsForCourse(courseCode: string): number[] {
  return mockSWECurriculum
    .filter(
      (c) =>
        c.requiredSWECourses.includes(courseCode) ||
        c.externalCourses.includes(courseCode)
    )
    .map((c) => c.level);
}
