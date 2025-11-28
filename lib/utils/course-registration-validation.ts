/**
 * Course Registration Validation Utilities
 * 
 * Provides validation functions for course registration,
 * including prerequisite checking.
 */

export interface StudentCourseHistory {
  course_code: string;
  status: 'Passed' | 'Failed' | 'Registered' | 'Dropped';
}

export interface CoursePrerequisite {
  course_code: string;
  prerequisite_course_code: string;
}

/**
 * Check if a student can register for a target course
 * 
 * A student can register only if they have a status of 'Passed'
 * in all prerequisite courses.
 * 
 * @param studentHistory - Array of courses the student has taken/registered for
 * @param targetCourse - The course code the student wants to register for
 * @param prerequisites - Array of prerequisite relationships (course_code -> prerequisite_course_code)
 * @returns true if student can register, false otherwise
 * 
 * @example
 * ```typescript
 * const history = [
 *   { course_code: 'CSC 111', status: 'Passed' },
 *   { course_code: 'MATH 106', status: 'Passed' }
 * ];
 * const prerequisites = [
 *   { course_code: 'CSC 113', prerequisite_course_code: 'CSC 111' }
 * ];
 * 
 * const canRegister = canRegister(history, 'CSC 113', prerequisites);
 * // Returns true because CSC 111 (prerequisite) is in history with status 'Passed'
 * ```
 */
export function canRegister(
  studentHistory: StudentCourseHistory[],
  targetCourse: string,
  prerequisites: CoursePrerequisite[]
): boolean {
  // Get all prerequisites for the target course
  const targetPrerequisites = prerequisites
    .filter((prereq) => prereq.course_code === targetCourse)
    .map((prereq) => prereq.prerequisite_course_code);

  // If no prerequisites, student can register
  if (targetPrerequisites.length === 0) {
    return true;
  }

  // Create a map of student's passed courses for quick lookup
  const passedCourses = new Set<string>();
  studentHistory.forEach((entry) => {
    if (entry.status === 'Passed') {
      passedCourses.add(entry.course_code);
    }
  });

  // Check if all prerequisites are passed
  const allPrerequisitesMet = targetPrerequisites.every((prereqCode) =>
    passedCourses.has(prereqCode)
  );

  return allPrerequisitesMet;
}

/**
 * Get missing prerequisites for a target course
 * 
 * @param studentHistory - Array of courses the student has taken/registered for
 * @param targetCourse - The course code the student wants to register for
 * @param prerequisites - Array of prerequisite relationships
 * @returns Array of course codes that are missing prerequisites
 * 
 * @example
 * ```typescript
 * const history = [
 *   { course_code: 'CSC 111', status: 'Passed' }
 * ];
 * const prerequisites = [
 *   { course_code: 'CSC 113', prerequisite_course_code: 'CSC 111' },
 *   { course_code: 'CSC 113', prerequisite_course_code: 'MATH 106' }
 * ];
 * 
 * const missing = getMissingPrerequisites(history, 'CSC 113', prerequisites);
 * // Returns ['MATH 106'] because CSC 111 is passed but MATH 106 is not
 * ```
 */
export function getMissingPrerequisites(
  studentHistory: StudentCourseHistory[],
  targetCourse: string,
  prerequisites: CoursePrerequisite[]
): string[] {
  // Get all prerequisites for the target course
  const targetPrerequisites = prerequisites
    .filter((prereq) => prereq.course_code === targetCourse)
    .map((prereq) => prereq.prerequisite_course_code);

  if (targetPrerequisites.length === 0) {
    return [];
  }

  // Create a map of student's passed courses
  const passedCourses = new Set<string>();
  studentHistory.forEach((entry) => {
    if (entry.status === 'Passed') {
      passedCourses.add(entry.course_code);
    }
  });

  // Return prerequisites that are not passed
  return targetPrerequisites.filter(
    (prereqCode) => !passedCourses.has(prereqCode)
  );
}

/**
 * Check if a course is locked for a student
 * 
 * A course is locked if the student has not passed all prerequisites.
 * 
 * @param studentHistory - Array of courses the student has taken/registered for
 * @param targetCourse - The course code to check
 * @param prerequisites - Array of prerequisite relationships
 * @returns true if course is locked, false if available
 */
export function isCourseLocked(
  studentHistory: StudentCourseHistory[],
  targetCourse: string,
  prerequisites: CoursePrerequisite[]
): boolean {
  const missing = getMissingPrerequisites(
    studentHistory,
    targetCourse,
    prerequisites
  );
  return missing.length > 0;
}

