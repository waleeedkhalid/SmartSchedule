/**
 * Pure utility functions for course-related logic
 * These functions don't use database calls and are safe to import in Client Components
 */

/**
 * Checks if a course is a SWE course that should be scheduled
 * @param courseCode - The course code (e.g., "SWE401")
 * @param _level - The course level (1-8) - currently unused but kept for API compatibility
 * @returns true if the course is SWE
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function isSWESchedulableCourse(courseCode: string, _level: number): boolean {
	return courseCode.startsWith('SWE')
}

