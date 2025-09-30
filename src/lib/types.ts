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
  room: string; // "12 05"
  times: SectionTime[];
}

export interface CourseOffering {
  code: string; // "MATH203"
  name: string; // "Linear Algebra"
  credits: number;
  department: string; // "Mathematics", "SWE", etc.
  level: number; // 2, 3, 4...
  type: "REQUIRED" | "ELECTIVE";
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
