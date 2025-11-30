/**
 * Student Module Type Definitions
 * Shared types for student-related database operations
 */

import type { Database } from "@/lib/types/database";

export type Course = Database["public"]["Tables"]["course"]["Row"];

export interface CreditStats {
  total: number;
  required_credits: number;
  elective_credits: number;
  completed_credits: number;
}

export interface StudentEnrollment {
  id: string;
  section_id: string;
  course_code: string;
  course_title: string;
  section_no: string;
  instructor_name: string | null;
  room_code: string | null;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  } | null;
  status: "registered" | "dropped";
  enrolled_at: string;
}

export interface StudentExam {
  id: string;
  course_code: string;
  course_title: string;
  date: string;
  start: string;
  duration: number;
  room_codes: string[];
}

export interface AvailableElectiveSection {
  section_id: string;
  course_code: string;
  course_title: string;
  course_credits: number;
  section_no: string;
  instructor_name: string | null;
  room_code: string | null;
  capacity: number;
  enrolled_count: number;
  available_seats: number;
  is_full: boolean;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  } | null;
}

export interface RegistrationStatus {
  is_open: boolean;
  semester: {
    code: string;
    name: string;
  } | null;
  message: string;
}
