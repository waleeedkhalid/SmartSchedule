// Import types for re-export
import type { 
  DayOfWeek, 
  TimeRange, 
  TimeSlot,
  AcademicLevel,
  AcademicTerm
} from './common';

// Re-export all common types
export * from './common';

// Re-export types with type keyword for isolatedModules
export type { DayOfWeek, TimeRange, AcademicLevel, AcademicTerm };

// User types
export * from './users';

// Academic domain types
export * from './academic/course';

// Note: academic/student and academic/faculty are deprecated in favor of the new user types in ./users

// Scheduling domain types
export * from './scheduling/schedule';
export * from './scheduling/validation';

// Rules types
export * from './scheduling/rules/base';

// Re-export types with better names for backward compatibility
export type { TimeSlot as ScheduleSlot };

// Legacy type exports for backward compatibility
// TODO: Remove these deprecated types after migration

/**
 * @deprecated Use types from './users' instead
 */
export type { User } from './users';

/**
 * @deprecated Use CourseSection from './academic/course' instead
 */
export interface Section {
  id: string;
  courseId: string;
  sectionNumber: string;
  professorId: string;
  roomId: string;
  schedule: TimeSlot[];
  maxStudents: number;
  currentEnrollment: number;
  isActive: boolean;
  level: AcademicLevel;
}

/**
 * @deprecated Use CourseEnrollment from './academic/course' instead
 */
export interface Enrollment {
  id: string;
  studentId: string;
  sectionId: string;
  status: 'REGISTERED' | 'DROPPED' | 'COMPLETED' | 'WAITLISTED';
  grade?: string;
  registeredAt: string;
  updatedAt: string;
}

/**
 * @deprecated Use Course from './academic/course' instead
 */
export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  department: string;
  level: AcademicLevel;
  type: 'REQUIRED' | 'ELECTIVE';
  prerequisites: string[];
  corequisites: string[];
  isActive: boolean;
}

/**
 * @deprecated Use SchedulePreference from './scheduling/schedule' instead
 */
export interface SchedulePreference {
  id: string;
  userId: string;
  preferredDays: DayOfWeek[];
  preferredTimes: TimeRange[];
  unwantedTimes: Array<{
    day: DayOfWeek;
    startTime: string;
    endTime: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

