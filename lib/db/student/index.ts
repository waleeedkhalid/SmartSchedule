/**
 * Student Module - Barrel Export
 *
 * Re-exports all student-related database functions from focused modules.
 * Import from this file for convenience, or import directly from sub-modules
 * for better tree-shaking.
 */

// Types
export type {
  CreditStats,
  StudentEnrollment,
  StudentExam,
  AvailableElectiveSection,
  RegistrationStatus,
} from "./types";

// Dashboard data - optimized combined fetch
export {
  getStudentDashboardData,
  type StudentDashboardData,
} from "./dashboard-data";

// Profile operations
export { getStudentLevel, getStudentNumber } from "./profile";

// Credit tracking
export { getStudentCreditStats } from "./credits";

// Enrollment operations
export {
  getStudentEnrollments,
  getStudentExams,
  getAvailableElectiveSections,
} from "./enrollments";

// Notifications & deadlines
export {
  getUpcomingDeadlines,
  getUserNotifications,
  getRegistrationStatus,
} from "./notifications";
