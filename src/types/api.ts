/**
 * API Request/Response Types
 * For consistent API communication patterns
 */

import type { 
  User,
  Course,
  // Section,
  // Elective,
  // StudentElective,
  // Feedback,
  // Schedule,
  // ScheduleData,
} from './database';

// =====================================================
// GENERIC API RESPONSE TYPES
// =====================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// =====================================================
// AUTH API TYPES
// =====================================================

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignUpRequest {
  email: string;
  password: string;
  full_name: string;
  role: string;
}

export interface AuthResponse extends ApiResponse {
  user?: User;
  session?: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
  };
}

// =====================================================
// STUDENT API TYPES
// =====================================================

export interface ElectivesResponse extends ApiResponse {
  electives?: Elective[];
}

export interface StudentElectiveWithDetails extends StudentElective {
  elective?: Elective;
}

export interface StudentElectivesResponse extends ApiResponse {
  preferences?: StudentElectiveWithDetails[];
}

export interface FeedbackResponse extends ApiResponse {
  feedback?: Feedback | Feedback[];
}

export interface ScheduleResponse extends ApiResponse {
  schedule?: Schedule;
}

export interface MockScheduleResponse extends ApiResponse {
  schedule?: ScheduleData;
}

// =====================================================
// COURSE API TYPES
// =====================================================

export interface CoursesResponse extends ApiResponse {
  courses?: Course[];
}

export interface CourseWithSections extends Course {
  sections?: Section[];
}

export interface CourseDetailsResponse extends ApiResponse {
  course?: CourseWithSections;
}

// =====================================================
// PROFILE API TYPES
// =====================================================

export interface ProfileResponse extends ApiResponse {
  user?: User;
}

export interface UpdateProfileRequest {
  full_name?: string;
  email?: string;
}

