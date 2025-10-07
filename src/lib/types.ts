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

// Patch-style update object for modifying an exam in place (centralized from local-state)
export interface ExamUpdate {
  date?: string;
  time?: string;
  duration?: number;
}

// Normalized meeting time (numeric) replacing previous duplicated SectionTime definitions (DECISION: 1C)
export interface SectionMeeting {
  day: number; // 1-5 (Sunday-Thursday)
  startMinutes: number;
  endMinutes: number;
  room?: string;
}

export interface Section {
  id: string;
  courseCode: string;
  instructor: string;
  // Legacy field kept for committee & generation logic
  times: { day: string; start: string; end: string }[];
  room: string;
  capacity?: number;
  // Optional normalized meetings if student layer enriches
  meetings?: SectionMeeting[];
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

export interface Course {
  courseId: number;
  courseCode: string;
  courseName: string;
  section: string;
  activity: string; // 'محاضرة' (LEC), 'تمارين' (TUT), 'عملي' (LAB)
  hours: string;
  status: string;
  sectionMeetings: SectionMeeting[]; // student registration usage only
  instructor: string;
  examDay: string;
  examTime: string;
  examDate: string; // ISO date (student view may format to Hijri later)
  sectionAllocations: string;
  parentLectureId?: number; // For TUT/LAB sections, references the lecture courseId
  linkedSectionId?: number; // For LEC sections, references linked TUT/LAB courseId
}

export interface NormalizedTimeSlot {
  day: number; // 1-5 (Sunday-Thursday)
  startMinutes: number; // Minutes from midnight
  endMinutes: number;
  room?: string;
}

export interface CourseSection {
  course: Course;
  normalizedSlots: NormalizedTimeSlot[];
  examSlot?: {
    day: number;
    startMinutes: number;
    endMinutes: number;
    date: string; // ISO date
  };
}

export interface CourseStructure {
  courseCode: string;
  courseName: string;
  hasLecture: boolean;
  hasTutorial: boolean;
  hasLab: boolean;
  lectureRequired: boolean;
  tutorialRequired: boolean;
  labRequired: boolean;
  sections: Course[];
  lectureToTutorials: Map<number, Course[]>; // lectureId -> tutorials
  lectureToLabs: Map<number, Course[]>; // lectureId -> labs
  standaloneActivities: Course[]; // For courses without lectures (Lab-only)
}

export interface CourseSelectionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequiredSections: string[];
  duplicateLectures: string[];
  orphanedSections: string[]; // TUT/LAB without selected lecture
}

export interface Schedule {
  id: string;
  sections: CourseSection[];
  score: number;
  conflicts: string[];
  metadata: {
    totalHours: number;
    daysUsed: number[];
    earliestStart: number;
    latestEnd: number;
    totalGaps: number;
  };
}

export interface Constraint {
  id: string;
  name: string;
  type: "required" | "preferred" | "forbidden";
  description: string;
  weight: number; // 1-10 for scoring
  validator: (schedule: Schedule) => boolean;
}

export interface UserPreferences {
  maxSolutionsToGenerate: number;
  avoidMorningClasses: boolean; // Before 9 AM
  avoidEveningClasses: boolean; // After 1:50 PM
  preferCompactSchedule: boolean;
  minimizeDays: boolean;
  requiredSections: string[]; // Section IDs that must be included
  forbiddenTimeSlots: NormalizedTimeSlot[];
}

export interface RegistrationState {
  selectedCourses: Map<string, Course[]>; // courseCode -> selected sections
  constraints: Constraint[];
  preferences: UserPreferences;
  favoriteSchedules: string[];
  disabledCourses: Set<string>; // courseCode -> disabled for generation
}
