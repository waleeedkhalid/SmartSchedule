/**
 * Mock Data Types for Scheduler Features
 * These types match the database schema for easy migration
 * Once backend is ready, replace mock data with actual API calls
 */

// ============================================================================
// STUDENT MANAGEMENT TYPES
// ============================================================================

export interface MockStudent {
  id: string;
  student_number: string;
  full_name: string;
  email: string;
  level: 1 | 2 | 3 | 4;
  department: string;
  status: "regular" | "irregular";
  gpa?: number;
  total_credits: number;
  enrolled_courses: number;
  created_at: string;
}

export interface MockEnrollment {
  id: string;
  student_id: string;
  section_id: string;
  course_code: string;
  course_name: string;
  credits: number;
  status: "enrolled" | "waitlist" | "dropped";
  enrolled_at: string;
}

export interface MockCapacityThreshold {
  id: string;
  course_code: string;
  course_name: string;
  term_code: string;
  base_capacity: number;
  threshold_percentage: number;
  max_capacity: number; // base + (base * threshold / 100)
  is_swe_managed: boolean;
  updated_by: string;
  updated_at: string;
}

export interface MockIrregularStudent {
  id: string;
  student_id: string;
  student_name: string;
  student_number: string;
  level: number;
  reason: string;
  courses_needed: string[];
  status: "pending" | "notified" | "resolved";
  reported_by: string;
  reported_by_name: string;
  created_at: string;
  notes?: string;
}

export interface MockStudentEnrollmentSummary {
  total_students: number;
  regular_students: number;
  irregular_students: number;
  fully_enrolled: number;
  partially_enrolled: number;
  not_enrolled: number;
  avg_credits_per_student: number;
}

// ============================================================================
// COURSE & SECTION MANAGEMENT TYPES
// ============================================================================

export interface MockCourse {
  course_code: string;
  course_name: string;
  credits: number;
  level: number;
  type: "CORE" | "REQUIRED" | "ELECTIVE";
  department: string;
  description?: string;
  prerequisites?: string[];
  is_active: boolean;
  is_swe_managed: boolean;
  max_students?: number;
}

export interface MockSection {
  section_id: string;
  course_code: string;
  course_name: string;
  capacity: number;
  enrolled_count: number;
  instructor_id?: string;
  instructor_name?: string;
  room_id?: string;
  room?: MockRoom;
  section_type: "LECTURE" | "LAB" | "TUTORIAL";
  status: "DRAFT" | "PUBLISHED" | "CANCELLED";
  time_slots?: MockTimeSlot[];
}

export interface MockTimeSlot {
  id: string;
  day: "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday";
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
}

export interface MockRoom {
  room_id: string;
  building: string;
  room_number: string;
  capacity: number;
  room_type: "LECTURE_HALL" | "LAB" | "CLASSROOM" | "EXAM_HALL";
  equipment: string[];
  is_available: boolean;
}

export interface MockCourseWithSections {
  course: MockCourse;
  sections: MockSection[];
  total_enrolled: number;
  total_capacity: number;
  utilization_percentage: number;
}

// ============================================================================
// TIME & RESOURCE MANAGEMENT TYPES
// ============================================================================

export interface MockAcademicTerm {
  code: string;
  name: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  current_phase: AcademicPhase;
}

export type AcademicPhase =
  | "PLANNING"
  | "SCHEDULE_GENERATION"
  | "FACULTY_ASSIGNMENT"
  | "REGISTRATION_OPEN"
  | "REGISTRATION_CLOSED"
  | "TERM_ACTIVE"
  | "EXAMS"
  | "TERM_ENDED";

export interface MockAcademicEvent {
  id: string;
  title: string;
  description?: string;
  event_type: "DEADLINE" | "MILESTONE" | "REGISTRATION" | "EXAM" | "HOLIDAY";
  start_date: string;
  end_date?: string;
  term_code: string;
  status: "UPCOMING" | "ACTIVE" | "COMPLETED";
  priority: "HIGH" | "MEDIUM" | "LOW";
}

export interface MockTimelinePhase {
  phase: AcademicPhase;
  name: string;
  start_date: string;
  end_date: string;
  status: "COMPLETED" | "ACTIVE" | "UPCOMING";
  progress: number; // 0-100
  tasks: MockPhaseTask[];
}

export interface MockPhaseTask {
  id: string;
  title: string;
  completed: boolean;
  required: boolean;
  assigned_to?: string;
}

// ============================================================================
// RULES MANAGEMENT TYPES
// ============================================================================

export interface MockSchedulingRule {
  id: string;
  rule_name: string;
  rule_type:
    | "TIME_CONSTRAINT"
    | "ROOM_CONSTRAINT"
    | "INSTRUCTOR_CONSTRAINT"
    | "ENROLLMENT_CONSTRAINT"
    | "CUSTOM";
  description: string;
  priority: number; // 1-10, higher = more important
  is_active: boolean;
  parameters: Record<string, any>;
  created_by: string;
  created_at: string;
  last_modified: string;
}

export interface MockRulePriority {
  id: string;
  category: "STUDENT_PREFERENCES" | "FACULTY_AVAILABILITY" | "ROOM_OPTIMIZATION" | "TIME_DISTRIBUTION";
  weight: number; // 0-100
  description: string;
}

export interface MockConstraint {
  id: string;
  constraint_type: "HARD" | "SOFT";
  name: string;
  description: string;
  rule_ids: string[]; // Associated rules
  violation_penalty?: number; // For soft constraints
  is_active: boolean;
}

export interface MockRuleTestResult {
  rule_id: string;
  rule_name: string;
  test_date: string;
  passed: boolean;
  violations: MockRuleViolation[];
  affected_sections: number;
  recommended_action?: string;
}

export interface MockRuleViolation {
  id: string;
  severity: "CRITICAL" | "WARNING" | "INFO";
  message: string;
  affected_entity: string; // section_id, course_code, etc.
  suggested_fix?: string;
}

// ============================================================================
// EXAM SCHEDULING TYPES
// ============================================================================

export interface MockExam {
  id: string;
  course_code: string;
  course_name: string;
  exam_type: "MIDTERM" | "FINAL" | "QUIZ";
  exam_date: string;
  start_time: string;
  end_time: string;
  room_id?: string;
  room_number?: string;
  capacity?: number;
  students_count: number;
  invigilator_id?: string;
  invigilator_name?: string;
  status: "SCHEDULED" | "CONFIRMED" | "CANCELLED";
  notes?: string;
}

export interface MockExamConflict {
  id: string;
  conflict_type: "STUDENT_OVERLAP" | "ROOM_OVERLAP" | "INSTRUCTOR_OVERLAP";
  severity: "HIGH" | "MEDIUM" | "LOW";
  exam_ids: string[];
  affected_count: number; // students or resources affected
  description: string;
  resolution_status: "UNRESOLVED" | "IN_PROGRESS" | "RESOLVED";
}

// ============================================================================
// DASHBOARD & STATISTICS TYPES
// ============================================================================

export interface MockSchedulerDashboardStats {
  term_code: string;
  term_name: string;
  current_phase: AcademicPhase;
  
  // Student stats
  total_students: number;
  enrolled_students: number;
  irregular_students: number;
  
  // Course stats
  total_courses: number;
  active_courses: number;
  total_sections: number;
  published_sections: number;
  
  // Capacity stats
  total_capacity: number;
  total_enrolled: number;
  utilization_percentage: number;
  
  // Conflict stats
  active_conflicts: number;
  resolved_conflicts: number;
  
  // Progress
  schedule_progress: number; // 0-100
  last_generated_at?: string;
  last_modified_by?: string;
}

export interface MockQuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  action_type: "NAVIGATE" | "DIALOG" | "FUNCTION";
  target?: string; // route or function name
  enabled: boolean;
  badge?: string; // notification badge
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface MockFilterOptions {
  levels?: number[];
  departments?: string[];
  statuses?: string[];
  course_types?: ("CORE" | "REQUIRED" | "ELECTIVE")[];
  term_codes?: string[];
}

export interface MockSortOption {
  field: string;
  direction: "asc" | "desc";
}

export interface MockPaginationInfo {
  current_page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

// ============================================================================
// API RESPONSE TYPES (for future migration)
// ============================================================================

export interface MockApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface MockPaginatedResponse<T> {
  data: T[];
  pagination: MockPaginationInfo;
}

