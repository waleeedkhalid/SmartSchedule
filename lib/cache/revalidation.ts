/**
 * Cache Revalidation Utilities
 * 
 * Centralized functions for invalidating Next.js caches.
 * Use these functions after mutations to ensure fresh data is served.
 */

import { revalidatePath, revalidateTag } from 'next/cache';
import { CACHE_TAGS } from './tags';

/**
 * Revalidates all course-related caches
 */
export async function revalidateCourses() {
  revalidateTag(CACHE_TAGS.COURSES);
  revalidateTag(CACHE_TAGS.COURSE_LIST);
  revalidatePath('/dashboard/courses');
}

/**
 * Revalidates all section-related caches
 */
export async function revalidateSections() {
  revalidateTag(CACHE_TAGS.SECTIONS);
  revalidateTag(CACHE_TAGS.SECTION_LIST);
  revalidatePath('/dashboard/sections');
}

/**
 * Revalidates all schedule-related caches
 */
export async function revalidateSchedules() {
  revalidateTag(CACHE_TAGS.SCHEDULES);
  revalidateTag(CACHE_TAGS.SCHEDULE_LIST);
  revalidatePath('/dashboard/schedules');
}

/**
 * Revalidates all room-related caches
 */
export async function revalidateRooms() {
  revalidateTag(CACHE_TAGS.ROOMS);
  revalidateTag(CACHE_TAGS.ROOM_LIST);
  revalidatePath('/dashboard/rooms');
}

/**
 * Revalidates all instructor-related caches
 */
export async function revalidateInstructors() {
  revalidateTag(CACHE_TAGS.INSTRUCTORS);
  revalidateTag(CACHE_TAGS.INSTRUCTOR_LIST);
  revalidatePath('/dashboard/instructors');
}

/**
 * Revalidates all exam-related caches
 */
export async function revalidateExams() {
  revalidateTag(CACHE_TAGS.EXAMS);
  revalidateTag(CACHE_TAGS.EXAM_LIST);
  revalidatePath('/dashboard/exams');
}

/**
 * Revalidates academic term caches
 */
export async function revalidateAcademicTerms() {
  revalidateTag(CACHE_TAGS.ACADEMIC_TERMS);
  revalidateTag(CACHE_TAGS.CURRENT_TERM);
  revalidatePath('/dashboard/timeline');
}

/**
 * Revalidates timeline-related caches
 */
export async function revalidateTimeline() {
  revalidateTag(CACHE_TAGS.TIMELINE);
  revalidateTag(CACHE_TAGS.TIMELINE_EVENTS);
  revalidatePath('/dashboard/timeline');
}

/**
 * Revalidates elective preferences caches
 */
export async function revalidateElectivePreferences() {
  revalidateTag(CACHE_TAGS.ELECTIVE_PREFERENCES);
  revalidatePath('/dashboard/elective-preferences');
}

/**
 * Revalidates teaching load caches
 */
export async function revalidateTeachingLoad() {
  revalidateTag(CACHE_TAGS.TEACHING_LOAD);
  revalidatePath('/dashboard/teaching-load');
}

/**
 * Revalidates student-related caches
 */
export async function revalidateStudents() {
  revalidateTag(CACHE_TAGS.STUDENTS);
  revalidateTag(CACHE_TAGS.STUDENT_ENROLLMENTS);
  revalidatePath('/dashboard/student');
}

/**
 * Revalidates multiple resource types at once
 */
export async function revalidateMultiple(tags: string[]) {
  for (const tag of tags) {
    revalidateTag(tag);
  }
}

