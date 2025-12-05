/**
 * Cache Module Index
 *
 * Re-exports all caching utilities for convenient imports.
 *
 * Usage:
 * ```ts
 * import {
 *   CACHE_TAGS,
 *   CACHE_DURATIONS,
 *   revalidateCourses,
 *   getCachedCourses
 * } from '@/lib/cache';
 * ```
 */

// Cache tags and constants
export { CACHE_TAGS, CACHE_DURATIONS, createDynamicTag } from "./tags";
export type { CacheTag } from "./tags";

// Revalidation utilities
export {
  revalidateCourses,
  revalidateCourseByCode,
  revalidateSections,
  revalidateSectionsByTerm,
  revalidateSchedules,
  revalidateRooms,
  revalidateInstructors,
  revalidateExams,
  revalidateExamsByCourse,
  revalidateAcademicTerms,
  revalidateTimeline,
  revalidateElectivePreferences,
  revalidateTeachingLoad,
  revalidateTeachingLoadByInstructor,
  revalidateStudents,
  revalidateEnrollmentsBySection,
  revalidateDashboardStats,
  revalidateMultiple,
  revalidateAll,
  revalidateAfterSectionAssignment,
} from "./revalidation";

// Cached query functions
export {
  getCachedCourses,
  getCachedCourseByCode,
  getCachedRooms,
  getCachedInstructors,
  getCachedCurrentTerm,
  getCachedAcademicTerms,
  getCachedSectionsByTerm,
  getCachedExamStats,
  getCachedElectiveStats,
  getCachedDashboardStats,
} from "./cached-queries";
