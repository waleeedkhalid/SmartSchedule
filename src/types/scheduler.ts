/**
 * Scheduler System Types
 * Comprehensive type definitions for the automated scheduling system
 */

import type { DayOfWeek } from '@/types/database';

// =====================================================
// COURSE & SECTION TYPES
// =====================================================

export interface SchedulerCourse {
  code: string;
  name: string;
  description?: string | null;
  credits: number;
  department: string;
  level: number | null;
  type: 'REQUIRED' | 'ELECTIVE';
  prerequisites: string[] | null;
  is_swe_managed: boolean;
  created_at: string;
  updated_at: string | null;
}

export interface SchedulerSection {
  id: string;
  course_code: string;
  instructor_id: string | null;
  instructor_name?: string | null;
  room_number: string | null;
  capacity: number;
  enrolled_count?: number;
  time_slots: SectionTimeSlot[];
  created_at: string;
  updated_at: string | null;
}

export interface SectionTimeSlot {
  id: string;
  section_id: string;
  day: DayOfWeek;
  start_time: string; // HH:MM format
  end_time: string;   // HH:MM format
}

export interface CourseWithSections {
  course: SchedulerCourse;
  sections: SchedulerSection[];
  total_enrolled: number;
}

// =====================================================
// SCHEDULE GENERATION TYPES
// =====================================================

export interface ScheduleGenerationRequest {
  term_code: string;
  target_level?: number | null; // Generate for specific level or all
  force_regenerate?: boolean;    // Regenerate even if schedules exist
  rules_config?: SchedulingRulesConfig;
  constraints?: ScheduleConstraints;
}

export interface ScheduleGenerationResponse {
  success: boolean;
  generated_count: number;
  failed_count: number;
  schedules: GeneratedSchedule[];
  conflicts: ScheduleConflict[];
  warnings: string[];
  execution_time_ms: number;
}

export interface GeneratedSchedule {
  id: string;
  student_id: string;
  term_code: string;
  data: ScheduleData;
  conflicts: ScheduleConflict[];
  quality_score: number; // 0-100, based on student preferences and constraints
  is_published: boolean;
  version: number;
  created_at: string;
  updated_at: string | null;
}

export interface ScheduleData {
  sections: ScheduledSection[];
  exams: ScheduledExam[];
  total_credits: number;
  metadata: {
    generation_method: 'automatic' | 'manual' | 'hybrid';
    generation_timestamp: string;
    constraints_applied: string[];
    preferences_satisfied: number; // percentage
  };
}

export interface ScheduledSection {
  section_id: string;
  course_code: string;
  course_name: string;
  credits: number;
  instructor_name: string | null;
  room_number: string | null;
  time_slots: SectionTimeSlot[];
}

export interface ScheduledExam {
  id: string;
  course_code: string;
  course_name: string;
  type: 'MIDTERM' | 'MIDTERM2' | 'FINAL';
  date: string;
  time: string;
  duration: number; // in minutes
  room_number: string | null;
}

// =====================================================
// SCHEDULING RULES TYPES
// =====================================================

export interface SchedulingRulesConfig {
  id?: string;
  term_code: string;
  rules: SchedulingRules;
  priority_weights: PriorityWeights;
  is_active: boolean;
  created_by: string;
  created_at?: string;
  updated_at?: string | null;
}

export interface SchedulingRules {
  // Time constraints
  max_daily_hours: number;            // Maximum hours per day
  min_gap_between_classes: number;    // Minimum minutes between classes
  max_gap_between_classes: number;    // Maximum minutes gap allowed
  earliest_class_time: string;        // HH:MM format
  latest_class_time: string;          // HH:MM format
  
  // Weekly constraints
  max_weekly_hours: number;
  preferred_days_off: DayOfWeek[];    // Preferred days with no classes
  allow_back_to_back: boolean;        // Allow classes with no gap
  
  // Section constraints
  max_students_per_section: number;
  min_students_per_section: number;
  allow_section_overflow: boolean;    // Allow slight capacity overflow
  overflow_percentage: number;        // Maximum overflow (e.g., 10 for 10%)
  
  // Faculty constraints
  respect_faculty_availability: boolean;
  max_faculty_daily_hours: number;
  min_gap_between_faculty_classes: number;
  
  // Exam constraints
  min_days_between_exams: number;     // Minimum days between student exams
  avoid_exam_conflicts: boolean;
  max_exams_per_day: number;
  
  // Elective preferences
  honor_elective_preferences: boolean;
  min_preference_rank_to_honor: number; // Only honor top N preferences
  
  // Room constraints
  require_room_assignment: boolean;
  respect_room_capacity: boolean;
}

export interface PriorityWeights {
  time_preference: number;      // Weight for preferred time slots
  faculty_preference: number;   // Weight for faculty preferences
  elective_preference: number;  // Weight for student elective preferences
  minimize_gaps: number;        // Weight for minimizing gaps
  room_optimization: number;    // Weight for room utilization
  load_balancing: number;       // Weight for balanced faculty load
}

// =====================================================
// CONFLICT TYPES
// =====================================================

export interface ScheduleConflict {
  id?: string;
  type: ConflictType;
  severity: 'critical' | 'error' | 'warning' | 'info';
  title: string;
  description: string;
  affected_entities: AffectedEntity[];
  resolution_suggestions: string[];
  auto_resolvable: boolean;
  detected_at?: string;
}

export type ConflictType =
  | 'time_overlap'           // Two classes scheduled at same time
  | 'exam_overlap'          // Two exams scheduled at same time
  | 'capacity_exceeded'     // Section capacity exceeded
  | 'prerequisite_violation' // Missing prerequisites
  | 'room_conflict'         // Room double-booked
  | 'faculty_conflict'      // Faculty double-booked
  | 'constraint_violation'  // Scheduling rule violated
  | 'elective_unavailable'  // Preferred elective not available
  | 'excessive_daily_load'  // Too many hours in one day
  | 'excessive_weekly_load' // Too many hours in one week
  | 'large_gap'            // Large gap between classes
  | 'faculty_unavailable'   // Faculty not available at scheduled time
  | 'missing_required_course'; // Required course not in schedule

export interface AffectedEntity {
  type: 'student' | 'course' | 'section' | 'faculty' | 'room' | 'exam';
  id: string;
  name?: string;
}

export interface ConflictResolution {
  conflict_id: string;
  resolution_type: 'auto' | 'manual';
  action_taken: string;
  resolved_by: string;
  resolved_at: string;
  notes?: string;
}

// =====================================================
// EXAM SCHEDULING TYPES
// =====================================================

export interface ExamScheduleRequest {
  term_code: string;
  exam_type: 'MIDTERM' | 'MIDTERM2' | 'FINAL';
  course_codes?: string[]; // If not provided, schedule all courses
  preferred_dates?: string[];
  constraints?: ExamConstraints;
}

export interface ExamConstraints {
  available_rooms: string[];
  time_slots: ExamTimeSlot[];
  min_days_between_exams: number;
  max_exams_per_day: number;
  avoid_weekends: boolean;
  respect_student_conflicts: boolean;
}

export interface ExamTimeSlot {
  start_time: string; // HH:MM format
  duration: number;   // in minutes
}

export interface ExamScheduleResult {
  success: boolean;
  scheduled_exams: ScheduledExam[];
  conflicts: ScheduleConflict[];
  unscheduled_courses: string[];
  warnings: string[];
}

// =====================================================
// STUDENT COUNT & ENROLLMENT TYPES
// =====================================================

export interface StudentEnrollmentData {
  course_code: string;
  course_name: string;
  course_type: 'REQUIRED' | 'ELECTIVE';
  level: number | null;
  total_students: number;
  enrolled_students: number;
  preference_counts: ElectivePreferenceCount[];
  sections_needed: number; // Calculated based on capacity
}

export interface ElectivePreferenceCount {
  preference_rank: number;
  student_count: number;
}

export interface StudentCountSummary {
  term_code: string;
  by_level: LevelEnrollmentSummary[];
  by_course_type: CourseTypeEnrollmentSummary[];
  total_students: number;
  total_sections_needed: number;
}

export interface LevelEnrollmentSummary {
  level: number;
  student_count: number;
  required_courses: number;
  elective_selections: number;
}

export interface CourseTypeEnrollmentSummary {
  type: 'REQUIRED' | 'ELECTIVE';
  course_count: number;
  total_enrollments: number;
  avg_students_per_course: number;
}

// =====================================================
// SCHEDULE CONSTRAINTS TYPES
// =====================================================

export interface ScheduleConstraints {
  hard_constraints: HardConstraint[];
  soft_constraints: SoftConstraint[];
}

export interface HardConstraint {
  type: 'no_time_conflicts' | 'capacity_limit' | 'prerequisites' | 'room_availability' | 'faculty_availability';
  enabled: boolean;
  parameters?: Record<string, unknown>;
}

export interface SoftConstraint {
  type: 'minimize_gaps' | 'preferred_times' | 'load_balance' | 'student_preferences';
  weight: number; // 0-1, importance of this constraint
  parameters?: Record<string, unknown>;
}

// =====================================================
// SCHEDULE OPTIMIZATION TYPES
// =====================================================

export interface OptimizationMetrics {
  schedule_id: string;
  quality_score: number;
  metrics: {
    time_conflict_score: number;
    capacity_utilization: number;
    preference_satisfaction: number;
    gap_optimization: number;
    faculty_load_balance: number;
    room_utilization: number;
  };
  calculated_at: string;
}

export interface ScheduleComparison {
  schedule_a_id: string;
  schedule_b_id: string;
  differences: ScheduleDifference[];
  recommendation: 'schedule_a' | 'schedule_b' | 'neither';
  reason: string;
}

export interface ScheduleDifference {
  type: 'section' | 'exam' | 'conflict' | 'quality';
  field: string;
  value_a: unknown;
  value_b: unknown;
  impact: 'positive' | 'negative' | 'neutral';
}

// =====================================================
// BULK OPERATIONS TYPES
// =====================================================

export interface BulkScheduleOperation {
  operation: 'create' | 'update' | 'delete' | 'publish' | 'unpublish';
  schedule_ids: string[];
  parameters?: Record<string, unknown>;
}

export interface BulkOperationResult {
  success: boolean;
  processed: number;
  failed: number;
  results: {
    schedule_id: string;
    success: boolean;
    error?: string;
  }[];
}

// =====================================================
// SCHEDULE VALIDATION TYPES
// =====================================================

export interface ScheduleValidationRequest {
  schedule_id?: string;
  schedule_data?: ScheduleData;
  term_code: string;
  validation_level: 'basic' | 'standard' | 'strict';
}

export interface ScheduleValidationResult {
  is_valid: boolean;
  validation_level: string;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  passed_checks: string[];
  failed_checks: string[];
}

export interface ValidationError {
  code: string;
  message: string;
  field?: string;
  value?: unknown;
}

export interface ValidationWarning {
  code: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
}

// =====================================================
// ROOM & RESOURCE TYPES
// =====================================================

export interface RoomSchedule {
  room_number: string;
  capacity: number;
  schedule: RoomTimeSlot[];
  utilization_percentage: number;
}

export interface RoomTimeSlot {
  day: DayOfWeek;
  start_time: string;
  end_time: string;
  section_id: string;
  course_code: string;
  instructor_name: string | null;
  students_enrolled: number;
}

export interface RoomAvailability {
  room_number: string;
  available_slots: TimeSlotAvailability[];
}

export interface TimeSlotAvailability {
  day: DayOfWeek;
  start_time: string;
  end_time: string;
  is_available: boolean;
  reserved_by?: string; // section_id if reserved
}

// =====================================================
// REPORTING TYPES
// =====================================================

export interface ScheduleReport {
  term_code: string;
  generated_at: string;
  summary: ScheduleReportSummary;
  details: ScheduleReportDetails;
  recommendations: string[];
}

export interface ScheduleReportSummary {
  total_students: number;
  total_schedules_generated: number;
  total_conflicts: number;
  average_quality_score: number;
  completion_percentage: number;
}

export interface ScheduleReportDetails {
  by_level: LevelScheduleDetails[];
  by_course: CourseScheduleDetails[];
  faculty_load: FacultyLoadDetails[];
  room_utilization: RoomUtilizationDetails[];
}

export interface LevelScheduleDetails {
  level: number;
  students: number;
  schedules_generated: number;
  conflicts: number;
  avg_quality_score: number;
}

export interface CourseScheduleDetails {
  course_code: string;
  course_name: string;
  sections_created: number;
  total_enrolled: number;
  capacity_utilization: number;
}

export interface FacultyLoadDetails {
  faculty_id: string;
  faculty_name: string;
  sections_assigned: number;
  total_hours: number;
  utilization_percentage: number;
}

export interface RoomUtilizationDetails {
  room_number: string;
  capacity: number;
  hours_used: number;
  hours_available: number;
  utilization_percentage: number;
}

