/**
 * TypeScript Types for API Requests and Responses
 * 
 * These types define the contract between the mobile client and backend API.
 * They ensure type safety and make it clear what data structures are expected.
 * 
 * Why this supports reusability: These same types can be shared with React Native,
 * iOS (Swift), or Android (Kotlin) clients, ensuring contract consistency.
 */

// ============================================================================
// Authentication Types
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    level?: number;
  };
}

export interface UserResponse {
  id: string;
  email: string;
  name: string;
  role: string;
  level?: number;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

// ============================================================================
// Semester Types
// ============================================================================

export interface Semester {
  id: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  registration_start_date: string;
  registration_end_date: string;
  add_drop_deadline: string;
  status: "planning" | "registration_open" | "active" | "completed" | "archived";
  is_current: boolean;
  created_at: string;
}

// ============================================================================
// Course Types
// ============================================================================

export interface Course {
  code: string;
  name: string;
  credits: number;
  level: number;
  course_type: "required" | "elective";
  created_at: string;
}

// ============================================================================
// Section Types
// ============================================================================

export interface MeetingPattern {
  days: string[];
  start_time: string;
  duration_minutes: number;
  type?: string;
}

export interface Instructor {
  id: string;
  name: string;
  email: string;
}

export interface Room {
  code: string;
  type: string;
}

export interface Section {
  id: string;
  course_code: string;
  section_no: string;
  section_type: string;
  instructor_id: string | null;
  instructor: Instructor | null;
  room_code: string | null;
  room: Room | null;
  capacity: number;
  current_enrollment: number;
  meeting_pattern: MeetingPattern;
  group_level: number;
  state: "draft" | "released";
  academic_semester_id: string;
  created_at: string;
}

// ============================================================================
// Enrollment Types
// ============================================================================

export interface Enrollment {
  id: string;
  student_id: string;
  section_id: string;
  course_code: string | null;
  academic_semester_id: string;
  enrollment_type: "required" | "elective";
  status: "enrolled" | "dropped";
  enrolled_at: string;
  dropped_at: string | null;
  course: {
    code: string;
    name: string;
    credits: number;
  } | null;
  section: {
    id: string;
    section_no: string;
    meeting_pattern: MeetingPattern;
  } | null;
}

export interface CreateEnrollmentRequest {
  section_id: string;
  semester_id?: string;
}

export interface DeleteEnrollmentResponse {
  success: boolean;
  enrollment: Enrollment;
}

// ============================================================================
// Schedule Types
// ============================================================================

export interface ScheduleSection {
  section_id: string;
  section_no: string;
  type: string;
  instructor: string;
  room: string;
  meeting_pattern: MeetingPattern;
}

export interface ScheduleCourse {
  enrollment_id: string;
  course_code: string;
  course_name: string;
  credits: number;
  sections: ScheduleSection[];
}

export interface StudentSchedule {
  student_id: string;
  level: number | undefined;
  student_name: string;
  semester_id: string | null;
  schedule: ScheduleCourse[];
  is_empty: boolean;
}

export interface FacultySchedule {
  instructor_id: string | null;
  instructor_name: string;
  semester_id: string;
  schedule: Array<{
    section_id: string;
    section_no: string;
    course_code: string;
    course_name: string;
    credits: number;
    room: string;
    meeting_pattern: MeetingPattern;
    capacity: number;
    current_enrollment: number;
  }>;
  is_empty: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

export interface ApiError {
  error: string;
  code: string;
  details?: unknown;
}

