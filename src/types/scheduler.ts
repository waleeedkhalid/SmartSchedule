/**
 * Type Definitions for Scheduler Domain
 * Centralized types for better maintainability
 */

// ============================================================================
// Student Types
// ============================================================================

export interface Student {
  id: string;
  full_name: string;
  email: string;
  student_number: string;
  level: number;
  department: string;
}

export interface StudentsByLevel {
  level: number;
  count: number;
  students: Student[];
}

export interface StudentsResponse {
  byLevel: StudentsByLevel[];
  total: number;
}

// ============================================================================
// Course Types
// ============================================================================

export interface Course {
  code: string;
  name: string;
  credits: number;
  level: number;
  type: "REQUIRED" | "ELECTIVE";
  department: string;
  is_active: boolean;
  is_swe_managed?: boolean;
}

export interface CourseSection {
  id: string;
  course_code: string;
  capacity: number;
  room_id?: string;
  room?: {
    id: string;
    number: string;
  };
  section_type: "LECTURE" | "LAB" | "TUTORIAL";
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  instructor_id?: string;
  instructor_name?: string;
  enrolled_count?: number;
  time_slots?: TimeSlot[];
}

export interface CourseWithSections {
  course: Course;
  sections: CourseSection[];
  total_enrolled: number;
}

// ============================================================================
// Time Slot Types
// ============================================================================

export interface TimeSlot {
  id: string;
  day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday";
  start_time: string;
  end_time: string;
}

// ============================================================================
// Term Types
// ============================================================================

export interface AcademicTerm {
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

// ============================================================================
// Elective Survey Types
// ============================================================================

export interface ElectiveSurveySettings {
  is_open: boolean;
  term_code: string;
  open_date?: string;
  close_date?: string;
}

export interface ElectiveSurveyResponse {
  id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  level: number;
  preferences: CoursePreference[];
  submitted_at: string;
}

export interface CoursePreference {
  course_code: string;
  course_name: string;
  priority: number;
}

// ============================================================================
// Dashboard Stats Types
// ============================================================================

export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalSections: number;
  publishedSections: number;
  activeConflicts: number;
  resolvedConflicts: number;
  lastGeneratedAt?: string;
}

// ============================================================================
// Conflict Types
// ============================================================================

export interface Conflict {
  id: string;
  type: "TIME_OVERLAP" | "ROOM_DOUBLE_BOOKING" | "INSTRUCTOR_OVERLOAD";
  severity: "HIGH" | "MEDIUM" | "LOW";
  description: string;
  affected_sections: string[];
  status: "ACTIVE" | "RESOLVED" | "IGNORED";
  created_at: string;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// ============================================================================
// Student Enrollment Management Types
// ============================================================================

export interface EnrollmentDetail {
  id: string;
  course_code: string;
  course_name: string;
  section_number: string;
  credits: number;
  status: "ENROLLED" | "WAITLIST" | "DROPPED";
  enrolled_at: string;
}

export interface StudentEnrollmentDetail {
  id: string;
  full_name: string;
  email: string;
  student_number: string;
  level: number;
  status: "regular" | "irregular";
  enrolled_courses: number;
  required_courses: number;
  completion_percentage: number;
  is_irregular: boolean;
  irregular_reason?: string;
  enrollments: EnrollmentDetail[];
}

export interface IrregularStudentRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  level: number;
  term_code: string;
  reason: string;
  courses_needed: string[];
  status: "pending" | "notified" | "resolved";
  reported_by: string;
  reported_by_name?: string;
  notified_at?: string;
  resolved_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CapacityThreshold {
  id: string;
  course_code: string;
  course_name: string;
  term_code: string;
  base_capacity: number;
  threshold_percentage: number;
  is_swe_course: boolean;
  max_capacity: number; // calculated: base_capacity + (base_capacity * threshold_percentage / 100)
  updated_by: string;
  updated_by_name?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationRecord {
  id: string;
  recipient_id: string;
  sender_id?: string;
  type: "irregular_student" | "threshold_update" | "enrollment_alert" | "general";
  title: string;
  message: string;
  data: Record<string, any>;
  read: boolean;
  read_at?: string;
  created_at: string;
}

// ============================================================================
// Student Enrollment Summary Types
// ============================================================================

export interface StudentEnrollmentSummary {
  total_students: number;
  regular_students: number;
  irregular_students: number;
  avg_completion_percentage: number;
  fully_enrolled: number;
  partially_enrolled: number;
  not_enrolled: number;
}

export interface SectionCapacityInfo {
  section_id: string;
  course_code: string;
  course_name: string;
  section_number: string;
  base_capacity: number;
  threshold_percentage: number;
  max_capacity: number;
  enrolled_count: number;
  available_slots: number;
  utilization_percentage: number;
  status: "OPEN" | "FULL" | "OVER_CAPACITY";
  is_swe_course: boolean;
}

// ============================================================================
// Student Enrollment Data (for existing tables)
// ============================================================================

export interface StudentEnrollmentData {
  course_code: string;
  course_name: string;
  course_type: "CORE" | "REQUIRED" | "ELECTIVE";
  level: number;
  total_students: number;
  enrolled_students: number;
  sections_needed: number;
  preference_counts?: PreferenceCount[];
}

export interface PreferenceCount {
  preference_rank: number;
  student_count: number;
}

export interface LevelEnrollmentSummary {
  level: number;
  total_students: number;
  enrolled_students: number;
  avg_courses: number;
}

export interface CourseTypeEnrollmentSummary {
  course_type: "CORE" | "REQUIRED" | "ELECTIVE";
  total_courses: number;
  total_capacity: number;
  enrolled_students: number;
  utilization_percentage: number;
}
