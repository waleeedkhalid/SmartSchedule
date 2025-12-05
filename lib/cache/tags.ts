/**
 * Cache Tag Constants
 *
 * Defines cache tags for fine-grained cache invalidation.
 * Tags are used with unstable_cache and revalidateTag to invalidate
 * specific groups of cached data.
 *
 * Following Next.js caching best practices:
 * @see https://nextjs.org/docs/app/guides/caching
 *
 * Tag naming convention:
 * - Use hierarchical naming: 'resource:scope' (e.g., 'courses:list')
 * - Allows invalidating entire resource or specific scopes
 */

export const CACHE_TAGS = {
  // Course-related caches
  COURSES: "courses",
  COURSE_LIST: "courses:list",
  COURSE_DETAIL: "courses:detail",

  // Section-related caches
  SECTIONS: "sections",
  SECTION_LIST: "sections:list",
  SECTION_DETAIL: "sections:detail",
  SECTION_BY_TERM: "sections:term", // For term-specific section queries

  // Schedule-related caches
  SCHEDULES: "schedules",
  SCHEDULE_LIST: "schedules:list",
  SCHEDULE_DETAIL: "schedules:detail",
  SCHEDULE_BY_TERM: "schedules:term", // For term-specific schedule queries

  // Room-related caches
  ROOMS: "rooms",
  ROOM_LIST: "rooms:list",
  ROOM_DETAIL: "rooms:detail",
  ROOM_AVAILABILITY: "rooms:availability", // For room availability queries

  // Instructor-related caches
  INSTRUCTORS: "instructors",
  INSTRUCTOR_LIST: "instructors:list",
  INSTRUCTOR_DETAIL: "instructors:detail",
  INSTRUCTOR_AVAILABILITY: "instructors:availability", // For faculty availability

  // Exam-related caches
  EXAMS: "exams",
  EXAM_LIST: "exams:list",
  EXAM_DETAIL: "exams:detail",
  EXAM_BY_COURSE: "exams:course", // For course-specific exam queries

  // Academic term caches
  ACADEMIC_TERMS: "academic-terms",
  CURRENT_TERM: "academic-terms:current",
  TERM_LIST: "academic-terms:list",

  // Student-related caches
  STUDENTS: "students",
  STUDENT_ENROLLMENTS: "students:enrollments",
  ENROLLMENTS: "enrollments",
  ENROLLMENT_BY_SECTION: "enrollments:section", // For section enrollment counts

  // Timeline caches
  TIMELINE: "timeline",
  TIMELINE_EVENTS: "timeline:events",

  // Elective preferences
  ELECTIVE_PREFERENCES: "elective-preferences",
  ELECTIVE_STATS: "elective-preferences:stats", // For aggregated stats

  // Teaching load
  TEACHING_LOAD: "teaching-load",
  TEACHING_LOAD_BY_INSTRUCTOR: "teaching-load:instructor",

  // Dashboard statistics (aggregated data)
  DASHBOARD_STATS: "dashboard:stats",
  REGISTRAR_STATS: "dashboard:registrar",
  FACULTY_STATS: "dashboard:faculty",
  STUDENT_STATS: "dashboard:student",
} as const;

export type CacheTag = (typeof CACHE_TAGS)[keyof typeof CACHE_TAGS];

/**
 * Cache duration constants (in seconds)
 * Use these for consistent cache timing across the app
 */
export const CACHE_DURATIONS = {
  /** 1 minute - For highly dynamic data */
  SHORT: 60,
  /** 5 minutes - For moderately dynamic data */
  MEDIUM: 300,
  /** 15 minutes - For less frequently changing data */
  LONG: 900,
  /** 1 hour - For relatively static data */
  VERY_LONG: 3600,
  /** 24 hours - For static reference data */
  DAY: 86400,
} as const;

/**
 * Helper to generate dynamic cache tags
 * @param base - Base tag from CACHE_TAGS
 * @param id - Dynamic identifier
 */
export function createDynamicTag(base: CacheTag, id: string): string {
  return `${base}:${id}`;
}
