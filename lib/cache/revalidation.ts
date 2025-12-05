/**
 * Cache Revalidation Utilities
 *
 * Centralized functions for invalidating Next.js caches.
 * Use these functions after mutations to ensure fresh data is served.
 *
 * Revalidation Strategy:
 * - Use revalidateTag() for fine-grained cache invalidation
 * - Use revalidatePath() to invalidate Full Route Cache for specific pages
 * - Call these functions in Server Actions after successful mutations
 *
 * @see https://nextjs.org/docs/app/guides/caching#revalidating
 */

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS, createDynamicTag } from "./tags";

/**
 * Revalidates all course-related caches
 * Call after creating, updating, or deleting courses
 */
export function revalidateCourses() {
  revalidateTag("default", CACHE_TAGS.COURSES);
  revalidateTag("default", CACHE_TAGS.COURSE_LIST);
  revalidateTag("default", CACHE_TAGS.COURSE_DETAIL);
  revalidatePath("/dashboard/courses");
  // Also revalidate sections since they reference courses
  revalidateTag("default", CACHE_TAGS.SECTION_LIST);
}

/**
 * Revalidates a specific course by code
 * More efficient than revalidating all courses
 */
export function revalidateCourseByCode(courseCode: string) {
  revalidateTag(
    "default",
    createDynamicTag(CACHE_TAGS.COURSE_DETAIL, courseCode)
  );
  revalidatePath(`/dashboard/courses/${courseCode}`);
}

/**
 * Revalidates all section-related caches
 * Call after creating, updating, or deleting sections
 */
export function revalidateSections() {
  revalidateTag("default", CACHE_TAGS.SECTIONS);
  revalidateTag("default", CACHE_TAGS.SECTION_LIST);
  revalidateTag("default", CACHE_TAGS.SECTION_DETAIL);
  revalidatePath("/dashboard/sections");
  // Also revalidate schedules since they reference sections
  revalidateTag("default", CACHE_TAGS.SCHEDULE_LIST);
  // Revalidate enrollments since section changes affect capacity
  revalidateTag("default", CACHE_TAGS.ENROLLMENTS);
}

/**
 * Revalidates sections for a specific term
 */
export function revalidateSectionsByTerm(termId: string) {
  revalidateTag(
    "default",
    createDynamicTag(CACHE_TAGS.SECTION_BY_TERM, termId)
  );
  revalidateTag(
    "default",
    createDynamicTag(CACHE_TAGS.SCHEDULE_BY_TERM, termId)
  );
}

/**
 * Revalidates all schedule-related caches
 * Call after creating, updating, or deleting schedules
 */
export function revalidateSchedules() {
  revalidateTag("default", CACHE_TAGS.SCHEDULES);
  revalidateTag("default", CACHE_TAGS.SCHEDULE_LIST);
  revalidateTag("default", CACHE_TAGS.SCHEDULE_DETAIL);
  revalidatePath("/dashboard/schedules");
  revalidatePath("/dashboard/scheduling");
  // Revalidate dashboard stats as schedule changes affect statistics
  revalidateTag("default", CACHE_TAGS.DASHBOARD_STATS);
}

/**
 * Revalidates all room-related caches
 * Call after creating, updating, or deleting rooms
 */
export function revalidateRooms() {
  revalidateTag("default", CACHE_TAGS.ROOMS);
  revalidateTag("default", CACHE_TAGS.ROOM_LIST);
  revalidateTag("default", CACHE_TAGS.ROOM_DETAIL);
  revalidateTag("default", CACHE_TAGS.ROOM_AVAILABILITY);
  revalidatePath("/dashboard/rooms");
  // Revalidate sections since they reference rooms
  revalidateTag("default", CACHE_TAGS.SECTION_LIST);
}

/**
 * Revalidates all instructor-related caches
 * Call after creating, updating, or deleting instructors
 */
export function revalidateInstructors() {
  revalidateTag("default", CACHE_TAGS.INSTRUCTORS);
  revalidateTag("default", CACHE_TAGS.INSTRUCTOR_LIST);
  revalidateTag("default", CACHE_TAGS.INSTRUCTOR_DETAIL);
  revalidateTag("default", CACHE_TAGS.INSTRUCTOR_AVAILABILITY);
  revalidatePath("/dashboard/instructors");
  // Revalidate sections and teaching load since they reference instructors
  revalidateTag("default", CACHE_TAGS.SECTION_LIST);
  revalidateTag("default", CACHE_TAGS.TEACHING_LOAD);
}

/**
 * Revalidates all exam-related caches
 * Call after creating, updating, or deleting exams
 */
export function revalidateExams() {
  revalidateTag("default", CACHE_TAGS.EXAMS);
  revalidateTag("default", CACHE_TAGS.EXAM_LIST);
  revalidateTag("default", CACHE_TAGS.EXAM_DETAIL);
  revalidatePath("/dashboard/exams");
}

/**
 * Revalidates exams for a specific course
 */
export function revalidateExamsByCourse(courseCode: string) {
  revalidateTag(
    "default",
    createDynamicTag(CACHE_TAGS.EXAM_BY_COURSE, courseCode)
  );
}

/**
 * Revalidates academic term caches
 * Call after creating, updating, or deleting terms
 */
export function revalidateAcademicTerms() {
  revalidateTag("default", CACHE_TAGS.ACADEMIC_TERMS);
  revalidateTag("default", CACHE_TAGS.CURRENT_TERM);
  revalidateTag("default", CACHE_TAGS.TERM_LIST);
  revalidatePath("/dashboard/timeline");
  // Term changes affect sections and schedules
  revalidateTag("default", CACHE_TAGS.SECTION_LIST);
  revalidateTag("default", CACHE_TAGS.SCHEDULE_LIST);
}

/**
 * Revalidates timeline-related caches
 */
export function revalidateTimeline() {
  revalidateTag("default", CACHE_TAGS.TIMELINE);
  revalidateTag("default", CACHE_TAGS.TIMELINE_EVENTS);
  revalidatePath("/dashboard/timeline");
}

/**
 * Revalidates elective preferences caches
 * Call after students submit/update elective preferences
 */
export function revalidateElectivePreferences() {
  revalidateTag("default", CACHE_TAGS.ELECTIVE_PREFERENCES);
  revalidateTag("default", CACHE_TAGS.ELECTIVE_STATS);
  revalidatePath("/dashboard/elective-preferences");
  revalidatePath("/dashboard/elective-stats");
  revalidatePath("/dashboard/preferences");
}

/**
 * Revalidates teaching load caches
 * Call after section assignments change
 */
export function revalidateTeachingLoad() {
  revalidateTag("default", CACHE_TAGS.TEACHING_LOAD);
  revalidatePath("/dashboard/teaching-load");
  revalidatePath("/dashboard/faculty");
  // Faculty stats depend on teaching load
  revalidateTag("default", CACHE_TAGS.FACULTY_STATS);
}

/**
 * Revalidates teaching load for a specific instructor
 */
export function revalidateTeachingLoadByInstructor(instructorId: string) {
  revalidateTag(
    "default",
    createDynamicTag(CACHE_TAGS.TEACHING_LOAD_BY_INSTRUCTOR, instructorId)
  );
}

/**
 * Revalidates student-related caches
 * Call after enrollment changes
 */
export function revalidateStudents() {
  revalidateTag("default", CACHE_TAGS.STUDENTS);
  revalidateTag("default", CACHE_TAGS.STUDENT_ENROLLMENTS);
  revalidateTag("default", CACHE_TAGS.ENROLLMENTS);
  revalidatePath("/dashboard/student");
  // Student stats depend on enrollments
  revalidateTag("default", CACHE_TAGS.STUDENT_STATS);
}

/**
 * Revalidates enrollment caches for a specific section
 */
export function revalidateEnrollmentsBySection(sectionId: string) {
  revalidateTag(
    "default",
    createDynamicTag(CACHE_TAGS.ENROLLMENT_BY_SECTION, sectionId)
  );
}

/**
 * Revalidates dashboard statistics
 * Call after any major data changes that affect statistics
 */
export function revalidateDashboardStats() {
  revalidateTag("default", CACHE_TAGS.DASHBOARD_STATS);
  revalidateTag("default", CACHE_TAGS.REGISTRAR_STATS);
  revalidateTag("default", CACHE_TAGS.FACULTY_STATS);
  revalidateTag("default", CACHE_TAGS.STUDENT_STATS);
  revalidatePath("/dashboard");
}

/**
 * Revalidates multiple resource types at once
 * Use for complex operations that affect multiple resources
 */
export function revalidateMultiple(tags: string[]) {
  for (const tag of tags) {
    revalidateTag("default", tag);
  }
}

/**
 * Revalidates all caches - use sparingly!
 * Only use after major data imports or bulk operations
 */
export function revalidateAll() {
  // Revalidate all major cache tags
  Object.values(CACHE_TAGS).forEach((tag) => {
    revalidateTag("default", tag);
  });

  // Revalidate major routes
  revalidatePath("/dashboard", "layout");
}

/**
 * Helper to revalidate after a section assignment change
 * This is a common operation that affects multiple caches
 */
export function revalidateAfterSectionAssignment(
  sectionId: string,
  instructorId?: string,
  termId?: string
) {
  revalidateSections();
  revalidateSchedules();

  if (instructorId) {
    revalidateTeachingLoadByInstructor(instructorId);
  }

  if (termId) {
    revalidateSectionsByTerm(termId);
  }

  revalidateEnrollmentsBySection(sectionId);
}
