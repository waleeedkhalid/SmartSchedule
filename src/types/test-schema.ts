/**
 * Test Schema Types
 * Enhanced types for comprehensive testing system
 * Includes schedule_versions, teaching_load_change_requests, and scheduling_rules
 * 
 * This file provides TypeScript types for the test database schema.
 * Compatible with Supabase's Database type structure.
 */

// =====================================================
// BASE TYPES
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

// =====================================================
// SCHEDULE VERSION TYPES
// =====================================================

export type ScheduleGenerationType = 
  | 'INITIAL' 
  | 'TEACHING_LOAD_EDIT' 
  | 'MANUAL_ADJUSTMENT' 
  | 'REGENERATION';

export interface ScheduleVersion {
  id: string;
  term_code: string;
  version: number;
  generated_at: string;
  generated_by: string | null;
  generation_type: ScheduleGenerationType;
  input_hash: string | null;
  schedule_count: number;
  statistics: ScheduleVersionStatistics;
  changes_from_previous: Record<string, unknown> | null; // jsondiffpatch delta
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleVersionStatistics {
  total_students: number;
  total_sections: number;
  total_conflicts: number;
  conflict_rate: number; // percentage
  average_credits_per_student: number;
  average_contact_hours: number;
  room_utilization: {
    total_rooms: number;
    utilized_rooms: number;
    utilization_rate: number;
    peak_usage_time: string;
  };
  faculty_load: {
    total_faculty: number;
    average_load: number;
    min_load: number;
    max_load: number;
    load_variance: number;
  };
  irregular_students: {
    total: number;
    fully_accommodated: number;
    partially_accommodated: number;
    not_accommodated: number;
  };
}

// =====================================================
// TEACHING LOAD CHANGE REQUEST TYPES
// =====================================================

export type ChangeRequestType = 
  | 'REASSIGN_INSTRUCTOR' 
  | 'CHANGE_TIME_SLOT' 
  | 'ADJUST_CAPACITY' 
  | 'OTHER';

export type ValidationStatus = 
  | 'PENDING' 
  | 'VALID' 
  | 'INVALID' 
  | 'APPROVED' 
  | 'REJECTED';

export interface TeachingLoadChangeRequest {
  id: string;
  schedule_version_id: string | null;
  section_id: string;
  requested_by: string;
  request_type: ChangeRequestType;
  changes: TeachingLoadChanges;
  reason: string | null;
  validation_status: ValidationStatus;
  validation_error: string | null;
  affects_irregular_students: boolean;
  irregular_students_affected: string[];
  reviewed_by: string | null;
  reviewed_at: string | null;
  applied: boolean;
  applied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeachingLoadChanges {
  from: Partial<SectionChange>;
  to: Partial<SectionChange>;
}

export interface SectionChange {
  instructor_id: string;
  room_number: string;
  capacity: number;
  time_slots: Array<{
    day: string;
    start_time: string;
    end_time: string;
  }>;
}

// =====================================================
// SCHEDULING RULES TYPES
// =====================================================

export type RuleType = 
  | 'HARD_CONSTRAINT' 
  | 'SOFT_CONSTRAINT' 
  | 'PREFERENCE' 
  | 'CONFIGURATION';

export interface SchedulingRule {
  id: string;
  term_code: string;
  rule_type: RuleType;
  priority: number;
  name: string;
  description: string | null;
  rule_data: RuleData;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  yjs_document_id: string | null;
}

export interface RuleData {
  type: string;
  scope?: string;
  entities?: string[];
  field?: string;
  operator?: string;
  compare_field?: string;
  value?: unknown;
  weight?: number;
  max_gap_minutes?: number;
  metric?: string;
  variance_threshold?: number;
}

// Hard Constraint Examples
export interface NoOverlapRule extends RuleData {
  type: 'no_overlap';
  scope: 'student' | 'faculty' | 'room';
  entities: ['sections'] | ['exams'];
}

export interface CapacityCheckRule extends RuleData {
  type: 'capacity_check';
  field: 'enrolled_count';
  operator: '<=' | '<' | '=' | '>' | '>=';
  compare_field: 'capacity';
}

// Soft Constraint Examples
export interface MinimizeGapsRule extends RuleData {
  type: 'minimize_gaps';
  max_gap_minutes: number;
  weight: number;
}

export interface BalanceLoadRule extends RuleData {
  type: 'balance_load';
  entity: 'faculty' | 'student';
  metric: 'credit_hours' | 'contact_hours' | 'courses';
  variance_threshold: number;
}

// =====================================================
// SCHEDULING RULES COLLABORATION TYPES
// =====================================================

export type CollaborationAction = 
  | 'EDIT' 
  | 'COMMENT' 
  | 'VIEW' 
  | 'APPROVE' 
  | 'REJECT';

export interface SchedulingRulesCollaboration {
  id: string;
  rule_id: string;
  user_id: string | null;
  action: CollaborationAction;
  changes: Record<string, unknown> | null;
  session_id: string | null;
  created_at: string;
}

// =====================================================
// ENHANCED SCHEDULE TYPES
// =====================================================

export type ScheduleStatus = 
  | 'DRAFT' 
  | 'PUBLISHED_DRAFT' 
  | 'FINAL' 
  | 'ARCHIVED';

export interface Schedule {
  id: string;
  student_id: string;
  term_code: string | null;
  data: ScheduleData;
  version: number;
  is_published: boolean;
  schedule_version_id: string | null;
  status: ScheduleStatus;
  published_by: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScheduleData {
  version: number;
  status: ScheduleStatus;
  generated_at: string;
  generated_by: string;
  sections: ScheduleSection[];
  statistics: StudentScheduleStatistics;
  validation: ScheduleValidation;
}

export interface ScheduleSection {
  section_id: string;
  course_code: string;
  course_name: string;
  course_type: 'REQUIRED' | 'ELECTIVE';
  instructor_id: string | null;
  instructor_name: string | null;
  room_number: string | null;
  times: ScheduleTimeSlot[];
  credits: number;
  capacity: number;
  enrolled_count: number;
}

export interface ScheduleTimeSlot {
  day: 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY';
  start: string; // HH:MM format
  end: string;   // HH:MM format
}

export interface StudentScheduleStatistics {
  total_credits: number;
  required_courses_count: number;
  total_contact_hours: number;
  days_with_classes: string[];
  days_off: string[];
  earliest_class: string;
  latest_class: string;
  gaps_count: number;
  longest_gap_minutes: number;
}

export interface ScheduleValidation {
  has_conflicts: boolean;
  conflicts: ScheduleConflict[];
  warnings: ScheduleWarning[];
}

export interface ScheduleConflict {
  type: 'TIME_OVERLAP' | 'CAPACITY_EXCEEDED' | 'PREREQUISITE_MISSING';
  severity: 'ERROR' | 'WARNING';
  message: string;
  affected_sections: string[];
}

export interface ScheduleWarning {
  type: 'LONG_GAP' | 'EARLY_CLASS' | 'LATE_CLASS' | 'TOO_MANY_HOURS';
  message: string;
  details: Record<string, unknown>;
}

// =====================================================
// ENHANCED FEEDBACK TYPES
// =====================================================

export type FeedbackCategory = 
  | 'CONFLICT' 
  | 'PREFERENCE' 
  | 'TIMING' 
  | 'WORKLOAD' 
  | 'QUALITY' 
  | 'OTHER';

export type FeedbackSeverity = 
  | 'HIGH' 
  | 'MEDIUM' 
  | 'LOW';

export interface Feedback {
  id: string;
  student_id: string;
  schedule_id: string | null;
  rating: number; // 1-5
  feedback_text: string;
  feedback_category: FeedbackCategory;
  severity: FeedbackSeverity;
  schedule_version: number | null;
  reviewed_by: string | null;
  resolution: string | null;
  resolution_date: string | null;
  is_resolved: boolean;
  created_at: string;
  updated_at: string;
}

// =====================================================
// ENHANCED CAPACITY THRESHOLD TYPES
// =====================================================

export interface CapacityThreshold {
  id: string;
  course_code: string;
  term_code: string;
  base_capacity: number;
  threshold_percentage: number;
  is_swe_course: boolean;
  updated_by: string;
  max_capacity_override: number | null;
  current_utilization: number;
  threshold_reached: boolean;
  last_checked_at: string | null;
  created_at: string;
  updated_at: string;
}

// =====================================================
// FUNCTION RETURN TYPES
// =====================================================

export interface CreateScheduleVersionParams {
  term_code: string;
  generated_by: string;
  generation_type: ScheduleGenerationType;
  statistics?: ScheduleVersionStatistics;
}

export interface ValidateChangeResult {
  is_valid: boolean;
  error_message: string | null;
  affected_students: string[];
}

// =====================================================
// CHARTS.JS DATA TYPES
// =====================================================

export interface DashboardChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// Faculty Workload Chart
export interface FacultyWorkloadData {
  faculty_name: string;
  credit_hours: number;
  contact_hours: number;
  course_count: number;
  prep_count: number;
}

// Room Utilization Heatmap
export interface RoomUtilizationData {
  room_number: string;
  time_slots: {
    day: string;
    hour: number;
    utilization: number; // 0-100
    sections: string[];
  }[];
}

// Feedback Distribution
export interface FeedbackDistributionData {
  category: FeedbackCategory;
  count: number;
  average_rating: number;
  severity_breakdown: {
    high: number;
    medium: number;
    low: number;
  };
}

// =====================================================
// YJS COLLABORATION TYPES
// =====================================================

export interface YjsAwareness {
  user_id: string;
  user_name: string;
  color: string;
  cursor?: {
    anchor: number;
    head: number;
  };
  selection?: {
    start: number;
    end: number;
  };
}

export interface YjsSessionInfo {
  session_id: string;
  user_id: string;
  rule_id: string;
  connected_at: string;
  last_activity: string;
}

// =====================================================
// JSONDIFFPATCH TYPES
// =====================================================

export interface DiffDelta {
  [key: string]: DiffValue | DiffDelta;
}

export type DiffValue = 
  | [unknown] // Added
  | [unknown, unknown] // Modified
  | [unknown, 0, 0] // Deleted
  | [unknown, unknown, unknown]; // Text diff

export interface VersionComparison {
  from_version: number;
  to_version: number;
  changes: DiffDelta;
  summary: {
    added: number;
    modified: number;
    deleted: number;
  };
}

// =====================================================
// DATABASE TYPE (Supabase Compatible)
// =====================================================

export type Database = {
  public: {
    Tables: {
      academic_term: {
        Row: {
          code: string;
          name: string;
          type: 'FALL' | 'SPRING' | 'SUMMER';
          start_date: string;
          end_date: string;
          is_active: boolean | null;
          schedule_published: boolean | null;
          electives_survey_open: boolean | null;
          feedback_open: boolean | null;
          is_faculty_availability_open: boolean | null;
          registration_open: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['academic_term']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['academic_term']['Row']>;
        Relationships: [];
      };
      room: {
        Row: {
          number: string;
          building: string | null;
          capacity: number;
          type: 'CLASSROOM' | 'LAB' | 'AUDITORIUM' | null;
          equipment: Json | null;
          is_available: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['room']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['room']['Row']>;
        Relationships: [];
      };
      section_time: {
        Row: {
          id: string;
          section_id: string;
          day: 'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY';
          start_time: string;
          end_time: string;
          created_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['section_time']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['section_time']['Row']>;
        Relationships: [];
      };
      irregular_students: {
        Row: {
          id: string;
          student_id: string;
          term_code: string;
          reason: string;
          courses_needed: string[];
          status: 'pending' | 'notified' | 'resolved' | 'cancelled' | null;
          reported_by: string | null;
          notified_at: string | null;
          resolved_at: string | null;
          notes: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['irregular_students']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['irregular_students']['Row']>;
        Relationships: [
          {
            foreignKeyName: 'irregular_students_student_id_fkey';
            columns: ['student_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'irregular_students_term_code_fkey';
            columns: ['term_code'];
            referencedRelation: 'academic_term';
            referencedColumns: ['code'];
          }
        ];
      };
      schedule_versions: {
        Row: ScheduleVersion;
        Insert: Omit<ScheduleVersion, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<ScheduleVersion>;
        Relationships: [
          {
            foreignKeyName: 'schedule_versions_term_code_fkey';
            columns: ['term_code'];
            referencedRelation: 'academic_term';
            referencedColumns: ['code'];
          }
        ];
      };
      teaching_load_change_requests: {
        Row: TeachingLoadChangeRequest;
        Insert: Omit<TeachingLoadChangeRequest, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<TeachingLoadChangeRequest>;
        Relationships: [
          {
            foreignKeyName: 'teaching_load_change_requests_schedule_version_id_fkey';
            columns: ['schedule_version_id'];
            referencedRelation: 'schedule_versions';
            referencedColumns: ['id'];
          }
        ];
      };
      scheduling_rules: {
        Row: SchedulingRule;
        Insert: Omit<SchedulingRule, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<SchedulingRule>;
        Relationships: [
          {
            foreignKeyName: 'scheduling_rules_term_code_fkey';
            columns: ['term_code'];
            referencedRelation: 'academic_term';
            referencedColumns: ['code'];
          }
        ];
      };
      scheduling_rules_collaboration: {
        Row: SchedulingRulesCollaboration;
        Insert: Omit<SchedulingRulesCollaboration, 'id' | 'created_at'>;
        Update: Partial<SchedulingRulesCollaboration>;
        Relationships: [
          {
            foreignKeyName: 'scheduling_rules_collaboration_rule_id_fkey';
            columns: ['rule_id'];
            referencedRelation: 'scheduling_rules';
            referencedColumns: ['id'];
          }
        ];
      };
      schedules: {
        Row: Schedule;
        Insert: Omit<Schedule, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Schedule>;
        Relationships: [
          {
            foreignKeyName: 'schedules_term_code_fkey';
            columns: ['term_code'];
            referencedRelation: 'academic_term';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'schedules_schedule_version_id_fkey';
            columns: ['schedule_version_id'];
            referencedRelation: 'schedule_versions';
            referencedColumns: ['id'];
          }
        ];
      };
      capacity_thresholds: {
        Row: CapacityThreshold;
        Insert: Omit<CapacityThreshold, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<CapacityThreshold>;
        Relationships: [];
      };
      feedback: {
        Row: Feedback;
        Insert: Omit<Feedback, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Feedback>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {
      create_schedule_version: {
        Args: {
          p_term_code: string;
          p_generated_by: string;
          p_generation_type: ScheduleGenerationType;
          p_statistics?: ScheduleVersionStatistics;
        };
        Returns: string; // UUID
      };
      validate_teaching_load_change: {
        Args: {
          p_request_id: string;
        };
        Returns: ValidateChangeResult[];
      };
    };
    Enums: {
      schedule_generation_type: ScheduleGenerationType;
      change_request_type: ChangeRequestType;
      validation_status: ValidationStatus;
      rule_type: RuleType;
      collaboration_action: CollaborationAction;
      schedule_status: ScheduleStatus;
      feedback_category: FeedbackCategory;
      feedback_severity: FeedbackSeverity;
    };
  };
}

