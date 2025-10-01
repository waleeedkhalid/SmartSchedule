// types.ts — SmartSchedule SWE Department (Phase 3)
// Flat, simple, JSON-friendly types for in-memory data

// ============================================================================
// STUDENT COUNTS
// ============================================================================

export interface StudentCount {
  code: string; // "SWE211"
  name: string; // "Introduction to Software Engineering"
  level: number; // 4, 5, 6...
  total_students: number;
}

// ============================================================================
// ELECTIVE PACKAGES
// ============================================================================

export interface ElectiveCourse {
  code: string;
  name: string;
  credits: number;
  prerequisites?: string[]; // course codes
}

export interface ElectivePackage {
  id: string; // "islamic"
  label: string; // "Islamic Studies"
  rangeLabel: string; // "2-4 hours"
  minHours: number;
  maxHours: number;
  courses: ElectiveCourse[];
}

// ============================================================================
// IRREGULAR STUDENTS
// ============================================================================

export interface IrregularStudent {
  id: string;
  name: string;
  requiredCourses: string[]; // course codes
}

// ============================================================================
// COURSE OFFERINGS (CANONICAL)
// ============================================================================

export interface ExamInfo {
  date: string; // "2025-03-12"
  time: string; // "16:00"
  duration: number; // minutes
}

export interface SectionTime {
  day: string; // "Sunday"
  start: string; // "08:00"
  end: string; // "08:50"
}

export interface Section {
  id: string; // "MATH203-01"
  courseCode: string; // "MATH203"
  instructor: string; // "Dr. Omar"
  times: SectionTime[];
  room: string; // "4"
  capacity?: number; // optional
}

export interface CourseOffering {
  code: string; // "MATH203"
  name: string; // "Linear Algebra"
  credits: number;
  department: string; // "Mathematics", "SWE", etc.
  level: number; // 2, 3, 4...
  type: "REQUIRED" | "ELECTIVE";
  prerequisites: string[]; // course codes
  exams: {
    midterm?: ExamInfo;
    midterm2?: ExamInfo;
    final: ExamInfo;
  };
  sections: Section[];
}

// ============================================================================
// ELECTIVE PREFERENCES
// ============================================================================

export interface ElectivePreference {
  id: string;
  studentId: string;
  courseCode: string;
  priority: number; // 1 = highest
}

// ============================================================================
// COMMENTS & NOTIFICATIONS
// ============================================================================

export type CommentTarget = "SECTION" | "EXAM" | "SCHEDULE";

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  targetType: CommentTarget;
  targetId: string; // sectionId, examId, etc.
  text: string;
  createdAt: string;
}

export type NotificationType = "COMMENT" | "ASSIGNMENT" | "SCHEDULE";

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  readAt?: string;
  createdAt: string;
}

// ============================================================================
// CONFLICTS (RULE CHECK RESULTS)
// ============================================================================

export interface Conflict {
  id: string;
  type: "TIME" | "ROOM" | "INSTRUCTOR" | "RULE";
  severity: "ERROR" | "WARNING";
  message: string;
  affected: { id: string; label: string }[];
  detectedAt: string;
}

// ============================================================================
// SCHEDULE GENERATION
// ============================================================================

export interface TimeSlot {
  day: string; // "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"
  startTime: string; // "08:00"
  endTime: string; // "08:50"
}

export interface FacultyAvailability {
  instructorId: string;
  instructorName: string;
  department: string; // "SWE"
  availableSlots: TimeSlot[];
  maxTeachingHours: number; // per week
  preferences?: string[]; // preferred course codes
}

export interface SWEStudent {
  id: string;
  name: string;
  level: number; // 4, 5, 6, 7, 8
  electivePreferences: string[]; // course codes, ranked by priority
  isIrregular?: boolean;
  irregularCourses?: string[]; // only if irregular
}

export interface SWECurriculumLevel {
  level: number;
  requiredSWECourses: string[]; // e.g., ["SWE211", "SWE226"]
  externalCourses: string[]; // e.g., ["MATH203", "PHY104"]
  totalCredits: number;
  electiveSlots: number; // how many elective courses this level can take
}

export interface ScheduleGenerationRequest {
  semester: string; // "Fall 2025"
  levels: number[]; // [4, 5, 6, 7, 8]
  considerIrregularStudents: boolean;
  optimizationGoals?: (
    | "minimize-conflicts"
    | "balance-load"
    | "prefer-morning"
  )[];
}

export interface GeneratedSchedule {
  id: string;
  semester: string;
  generatedAt: string; // ISO date
  levels: LevelSchedule[];
  conflicts: Conflict[];
  metadata: ScheduleMetadata;
}

export interface LevelSchedule {
  level: number;
  studentCount: number;
  courses: CourseOffering[]; // SWE courses with generated sections
  externalCourses: CourseOffering[]; // External courses (read-only reference)
  conflicts: Conflict[];
}

export interface ScheduleMetadata {
  totalSections: number;
  totalExams: number;
  facultyUtilization: number; // percentage 0-100
  roomUtilization: number; // percentage 0-100
}
