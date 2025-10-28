/**
 * Pure utility functions for course-related logic
 * These functions don't use database calls and are safe to import in Client Components
 */

/**
 * Checks if a course is a SWE course that should be scheduled
 * @param courseCode - The course code (e.g., "SWE401")
 * @param level - The course level (1-8)
 * @returns true if the course is SWE and in levels 4-8
 */
export function isSWESchedulableCourse(courseCode: string, level: number): boolean {
	return courseCode.startsWith('SWE')
}

