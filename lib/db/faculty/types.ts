/**
 * Faculty Module Type Definitions
 * Shared types for faculty-related database operations
 */

export interface TimeSlot {
  start: string;
  end: string;
  type: "preferred" | "unavailable";
}

export interface DayAvailability {
  day: string;
  slots: TimeSlot[];
}

export interface FacultyProfile {
  id: string;
  name: string;
  email: string | null;
  user_id: string | null;
  max_load_per_week: number | null;
  preferred_times: DayAvailability[] | null;
  unavailable_times: DayAvailability[] | null;
  department: string;
}

export interface FacultySection {
  id: string;
  course_code: string;
  course_title: string;
  section_no: string;
  room_code: string | null;
  capacity: number;
  current_enrollment?: number;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
    is_lab?: boolean;
  } | null;
  group_level: number | null;
  state: "draft" | "released";
  activity: string | null;
  credits?: number;
}

export interface FacultyComment {
  id: string;
  section_id: string | null;
  schedule_id: string | null;
  comment_text: string;
  rating: number | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  section?: {
    course_code: string;
    section_no: string;
  } | null;
}

export interface FacultyStats {
  totalSections: number;
  totalCourses: number;
  totalStudents: number;
  weeklyHours: number;
  draftSections: number;
  releasedSections: number;
  averageClassSize: number;
}
