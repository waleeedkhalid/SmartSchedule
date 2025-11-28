/**
 * Cache Tag Constants
 * 
 * Defines cache tags for fine-grained cache invalidation.
 * Tags are used with unstable_cache and revalidateTag to invalidate
 * specific groups of cached data.
 */

export const CACHE_TAGS = {
  // Course-related caches
  COURSES: 'courses',
  COURSE_LIST: 'courses:list',
  COURSE_DETAIL: 'courses:detail',
  
  // Section-related caches
  SECTIONS: 'sections',
  SECTION_LIST: 'sections:list',
  SECTION_DETAIL: 'sections:detail',
  
  // Schedule-related caches
  SCHEDULES: 'schedules',
  SCHEDULE_LIST: 'schedules:list',
  SCHEDULE_DETAIL: 'schedules:detail',
  
  // Room-related caches
  ROOMS: 'rooms',
  ROOM_LIST: 'rooms:list',
  ROOM_DETAIL: 'rooms:detail',
  
  // Instructor-related caches
  INSTRUCTORS: 'instructors',
  INSTRUCTOR_LIST: 'instructors:list',
  INSTRUCTOR_DETAIL: 'instructors:detail',
  
  // Exam-related caches
  EXAMS: 'exams',
  EXAM_LIST: 'exams:list',
  EXAM_DETAIL: 'exams:detail',
  
  // Academic term caches
  ACADEMIC_TERMS: 'academic-terms',
  CURRENT_TERM: 'academic-terms:current',
  
  // Student-related caches
  STUDENTS: 'students',
  STUDENT_ENROLLMENTS: 'students:enrollments',
  ENROLLMENTS: 'enrollments',
  
  // Timeline caches
  TIMELINE: 'timeline',
  TIMELINE_EVENTS: 'timeline:events',
  
  // Elective preferences
  ELECTIVE_PREFERENCES: 'elective-preferences',
  
  // Teaching load
  TEACHING_LOAD: 'teaching-load',
} as const;

export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS];

