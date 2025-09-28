/**
 * Common types used across the application
 */

/** Day of week enum in English */
export enum DayOfWeek {
  SUNDAY = 'SUNDAY',
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY'
}

/** Time range with start and end times in 24-hour format (HH:MM) */
export interface TimeRange {
  start: string;
  end: string;
}

/** Basic time slot for scheduling */
export interface TimeSlot {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  roomId?: string;
}

/** Pagination parameters for API requests */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

/** Standard paginated response */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Standard API response format */
export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
  success: boolean;
}

/** User roles in the scheduling system */
export enum UserRole {
  Student = 'STUDENT',
  Faculty = 'FACULTY',
  Registrar = 'REGISTRAR',
  Scheduler = 'SCHEDULER',
  LoadCommittee = 'LOAD_COMMITTEE'
}

/** Academic level (year) */
export enum AcademicLevel {
  Freshman = 100,
  Sophomore = 200,
  Junior = 300,
  Senior = 400,
  Graduate = 500
}

/** Academic term (semester) */
export interface AcademicTerm {
  id: string;
  name: string; // e.g., "Fall 2024"
  code: string; // e.g., "FA24"
  startDate: string;
  endDate: string;
  isActive: boolean;
  registrationStart: string;
  registrationEnd: string;
  addDropDeadline: string;
}
