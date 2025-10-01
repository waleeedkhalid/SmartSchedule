// Schedule generation logic for SmartSchedule (SWE Department)
// Generates all possible conflict-free schedules for students in a level

import { CourseOffering, Section } from "./types";

export interface ScheduleOption {
  courseCode: string;
  courseName: string;
  sections: Section[]; // Paired sections (lecture + lab/tutorial) or single section
}

export interface GeneratedSchedule {
  id: string;
  options: ScheduleOption[];
  totalCredits: number;
}

export interface ScheduleGenerationResult {
  totalCombinations: number;
  validCount: number;
  generationMs: number;
  coursesCount: number;
  schedules: GeneratedSchedule[];
}

/**
 * Parse day string to array of days
 * Examples: "Sunday", "Sunday Tuesday", "Mon Wed Fri"
 */
function parseDays(dayStr: string): string[] {
  if (!dayStr) return [];
  return dayStr
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Parse time string to minutes since midnight
 * Examples: "08:00", "14:30", "16:45"
 */
function parseTime(timeStr: string): number {
  if (!timeStr || !timeStr.includes(":")) return 0;
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

/**
 * Check if two time ranges overlap
 */
function timeRangesOverlap(
  start1: number,
  end1: number,
  start2: number,
  end2: number
): boolean {
  return start1 < end2 && start2 < end1;
}

/**
 * Check if two sections have time conflicts
 */
function sectionsConflict(sectionA: Section, sectionB: Section): boolean {
  for (const timeA of sectionA.times) {
    for (const timeB of sectionB.times) {
      const daysA = parseDays(timeA.day);
      const daysB = parseDays(timeB.day);

      // Check if they share any common days
      const hasCommonDay = daysA.some((day) => daysB.includes(day));
      if (!hasCommonDay) continue;

      // Check if time ranges overlap
      const startA = parseTime(timeA.start);
      const endA = parseTime(timeA.end);
      const startB = parseTime(timeB.start);
      const endB = parseTime(timeB.end);

      if (timeRangesOverlap(startA, endA, startB, endB)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Check if a schedule has any conflicts
 */
function scheduleHasConflict(schedule: ScheduleOption[]): boolean {
  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      const optionA = schedule[i];
      const optionB = schedule[j];

      // Check all section pairs between the two options
      for (const secA of optionA.sections) {
        for (const secB of optionB.sections) {
          if (sectionsConflict(secA, secB)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * Group sections into course options (lecture + lab/tutorial pairs or single sections)
 * This matches the groupPairs logic from the original algorithm
 */
function groupCourseOptions(
  courseOfferings: CourseOffering[]
): Map<string, ScheduleOption[]> {
  const optionsMap = new Map<string, ScheduleOption[]>();

  for (const course of courseOfferings) {
    const options: ScheduleOption[] = [];

    // For now, treat each section as a standalone option
    // In Phase 4+, we might need to pair lectures with labs/tutorials
    for (const section of course.sections) {
      options.push({
        courseCode: course.code,
        courseName: course.name,
        sections: [section],
      });
    }

    if (options.length > 0) {
      optionsMap.set(course.code, options);
    }
  }

  return optionsMap;
}

/**
 * Generate cartesian product of arrays
 */
function cartesianProduct<T>(arrays: T[][]): T[][] {
  if (!arrays.length) return [];
  return arrays.reduce(
    (acc, curr) => {
      const res: T[][] = [];
      for (const a of acc) {
        for (const b of curr) {
          res.push([...a, b]);
        }
      }
      return res;
    },
    [[]] as T[][]
  );
}

/**
 * Generate all possible schedules using full cartesian product approach
 */
export function generateSchedules(
  courseOfferings: CourseOffering[],
  options?: { limit?: number }
): ScheduleGenerationResult {
  const t0 = Date.now();

  // Group sections into course options
  const optionsMap = groupCourseOptions(courseOfferings);
  const optionsList = Array.from(optionsMap.values());

  // Generate all possible combinations
  const allCombinations = cartesianProduct(optionsList);
  const valid: GeneratedSchedule[] = [];

  // Filter out schedules with conflicts
  for (const combo of allCombinations) {
    if (!scheduleHasConflict(combo)) {
      const totalCredits = courseOfferings.reduce(
        (sum, course) => sum + course.credits,
        0
      );

      valid.push({
        id: `schedule-${valid.length + 1}`,
        options: combo,
        totalCredits,
      });

      if (options?.limit && valid.length >= options.limit) break;
    }
  }

  const t1 = Date.now();

  return {
    totalCombinations: allCombinations.length,
    validCount: valid.length,
    generationMs: t1 - t0,
    coursesCount: optionsList.length,
    schedules: valid,
  };
}

/**
 * Generate schedules using backtracking (more efficient for large sets)
 */
export function generateSchedulesBacktracking(
  courseOfferings: CourseOffering[],
  options?: { limit?: number }
): ScheduleGenerationResult {
  const t0 = Date.now();

  const optionsMap = groupCourseOptions(courseOfferings);
  const optionsList = Array.from(optionsMap.values());
  const valid: GeneratedSchedule[] = [];
  let explored = 0;

  function conflictsWithCurrent(
    current: ScheduleOption[],
    option: ScheduleOption
  ): boolean {
    for (const chosen of current) {
      for (const secA of chosen.sections) {
        for (const secB of option.sections) {
          if (sectionsConflict(secA, secB)) return true;
        }
      }
    }
    return false;
  }

  function dfs(idx: number, current: ScheduleOption[]) {
    if (options?.limit && valid.length >= options.limit) return;

    if (idx === optionsList.length) {
      const totalCredits = courseOfferings.reduce(
        (sum, course) => sum + course.credits,
        0
      );

      valid.push({
        id: `schedule-${valid.length + 1}`,
        options: [...current],
        totalCredits,
      });
      return;
    }

    for (const option of optionsList[idx]) {
      explored++;
      if (conflictsWithCurrent(current, option)) continue;

      current.push(option);
      dfs(idx + 1, current);
      current.pop();

      if (options?.limit && valid.length >= options.limit) break;
    }
  }

  dfs(0, []);
  const t1 = Date.now();

  return {
    totalCombinations: explored,
    validCount: valid.length,
    generationMs: t1 - t0,
    coursesCount: optionsList.length,
    schedules: valid,
  };
}

/**
 * Filter course offerings by level
 */
export function getCoursesByLevel(
  courseOfferings: CourseOffering[],
  level: number
): CourseOffering[] {
  return courseOfferings.filter(
    (course) => course.level === level && course.department === "SWE"
  );
}

/**
 * Filter course offerings by course codes
 */
export function getCoursesByCodes(
  courseOfferings: CourseOffering[],
  courseCodes: string[]
): CourseOffering[] {
  const codeSet = new Set(courseCodes);
  return courseOfferings.filter((course) => codeSet.has(course.code));
}
