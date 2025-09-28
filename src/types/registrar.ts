import { DayOfWeek } from "./rules";

/**
 * Represents a course in the system
 */
export interface Course {
  code: string;
  name: string;
  credits: number;
  department: string;
  level: number; // 100, 200, 300, 400
  type: 'REQUIRED' | 'ELECTIVE';
  prerequisites: string[]; // Course codes
  corequisites: string[];  // Course codes
  isActive: boolean;
}

/**
 * Represents a course section in the software engineering department
 */
export interface CourseSection {
  id: string;
  courseCode: string;
  sectionNumber: string;
  semester: string; // e.g., 'FALL_2023', 'SPRING_2024'
  
  /** Scheduling information */
  schedule: Array<{
    day: DayOfWeek;
    startTime: string; // Format: 'HH:MM'
    endTime: string;   // Format: 'HH:MM'
    room?: string;
  }>;
  
  /** Instructor information */
  instructor?: {
    id: string;
    name: string;
    email: string;
  };
  
  /** Capacity and enrollment */
  capacity: number;
  enrolled: number;
  
  /** Status flags */
  isActive: boolean;
  level: number; // 100, 200, 300, 400 - for level-based scheduling
  
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

/**
 * Student academic information
 */
export interface StudentAcademicRecord {
  studentId: string;
  level: number; // 1, 2, 3, 4 (year)
  gpa: number;
  totalCredits: number;
  completedCourses: Array<{
    courseCode: string;
    grade: string;
    semester: string;
  }>;
  enrolledCourses: string[]; // Course codes
  failedCourses: string[];   // Course codes that need to be retaken
  academicStatus: 'REGULAR' | 'PROBATION' | 'WARNING';
  isIrregular: boolean;
  irregularStatus?: {
    reason: string;
    requiredCourses: string[]; // Course codes required by registrar
    recommendedCourses: string[]; // Course codes recommended to avoid falling behind
    notes: string;
  };
}

/**
 * Request to generate schedule for a specific student level
 */
export interface GenerateScheduleRequest {
  semester: string;
  level: number; // 100, 200, 300, 400
  
  /** Optional filters */
  filters?: {
    courseType?: 'REQUIRED' | 'ELECTIVE';
    department?: string;
  };
  
  /** Scheduling constraints */
  constraints?: {
    maxCoursesPerDay?: number;
    preferMorningSlots?: boolean;
    avoidDays?: DayOfWeek[];
    minGapBetweenClasses?: number; // in minutes
  };
}

/**
 * Generated schedule for a student level
 */
export interface LevelSchedule {
  level: number;
  semester: string;
  courses: Array<{
    courseCode: string;
    sectionId: string;
    sectionNumber: string;
    schedule: Array<{
      day: DayOfWeek;
      startTime: string;
      endTime: string;
      room?: string;
    }>;
    instructor?: string;
  }>;
  conflicts: Array<{
    type: 'TIME_CONFLICT' | 'PREREQ_NOT_MET' | 'CAPACITY';
    courseCode: string;
    sectionId: string;
    message: string;
  }>;
  warnings: string[];
}

/**
 * Request to mark a student as irregular and specify required courses
 */
export interface MarkIrregularStudentRequest {
  studentId: string;
  reason: string;
  requiredCourses: string[]; // Course codes
  recommendedCourses?: string[]; // Course codes
  notes?: string;
  semester: string;
}

/**
 * Request to generate schedule for irregular students
 */
export interface GenerateIrregularScheduleRequest {
  semester: string;
  studentIds?: string[]; // If empty, generates for all irregular students
  
  /** Scheduling constraints */
  constraints?: {
    maxCoursesPerDay?: number;
    preferMorningSlots?: boolean;
    avoidDays?: DayOfWeek[];
    prioritizeRequiredCourses?: boolean;
  };
}

/**
 * Response for irregular student schedule generation
 */
export interface IrregularScheduleResponse {
  studentId: string;
  schedule: LevelSchedule;
  missingPrerequisites: string[];
  warnings: string[];
  errors: string[];
}

/**
 * Request to check for potential schedule conflicts
 */
export interface CheckScheduleConflictsRequest {
  semester: string;
  level?: number; // If not provided, checks all levels
  
  /** Types of conflicts to check */
  checkTypes?: Array<
    'TIME_OVERLAP' | 
    'PREREQ_NOT_MET' | 
    'CAPACITY' | 
    'INSTRUCTOR_CONFLICT' | 
    'ROOM_CONFLICT'
  >;
}

/**
 * Detected schedule conflicts
 */
export interface ScheduleConflicts {
  timeOverlaps: Array<{
    course1: string;
    section1: string;
    course2: string;
    section2: string;
    day: DayOfWeek;
    time: string;
  }>;
  missingPrerequisites: Array<{
    course: string;
    missingPrereq: string;
    studentCount: number;
  }>;
  capacityIssues: Array<{
    course: string;
    section: string;
    capacity: number;
    enrolled: number;
    waitlist: number;
  }>;
  instructorConflicts: Array<{
    instructorId: string;
    instructorName: string;
    conflictDetails: string;
  }>;
  roomConflicts: Array<{
    room: string;
    day: DayOfWeek;
    time: string;
    course1: string;
    section1: string;
    course2: string;
    section2: string;
  }>;
}
