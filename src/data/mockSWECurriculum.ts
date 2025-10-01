import { SWECurriculumLevel } from "@/lib/types";

/**
 * SWE Department Curriculum Plan
 * Defines what courses each level takes (Required SWE + External courses)
 * Based on the actual SWE curriculum structure
 */
export const mockSWECurriculum: SWECurriculumLevel[] = [
  {
    level: 4,
    requiredSWECourses: ["SWE211", "SWE226"],
    externalCourses: ["MATH203", "PHY104", "ISL101", "ENG214"],
    totalCredits: 18,
    electiveSlots: 0, // Level 4 has no electives
  },
  {
    level: 5,
    requiredSWECourses: ["SWE312", "SWE314", "SWE321"],
    externalCourses: ["MATH260", "STAT201", "ISL102"],
    totalCredits: 18,
    electiveSlots: 0,
  },
  {
    level: 6,
    requiredSWECourses: ["SWE333", "SWE363", "SWE381"],
    externalCourses: ["MATH301"],
    totalCredits: 18,
    electiveSlots: 1, // Can take 1 elective course
  },
  {
    level: 7,
    requiredSWECourses: ["SWE434", "SWE444"],
    externalCourses: [],
    totalCredits: 15,
    electiveSlots: 2, // Can take 2 elective courses
  },
  {
    level: 8,
    requiredSWECourses: ["SWE497"], // Capstone project
    externalCourses: [],
    totalCredits: 12,
    electiveSlots: 3, // Can take 3 elective courses
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
