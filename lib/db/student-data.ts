/**
 * Student Dashboard Data
 *
 * @deprecated This file re-exports from focused modules for backward compatibility.
 * Import directly from '@/lib/db/student' or specific sub-modules for better tree-shaking.
 *
 * Example:
 *   import { getStudentEnrollments } from '@/lib/db/student/enrollments'
 *   // or
 *   import { getStudentEnrollments } from '@/lib/db/student'
 */

// Re-export all types and functions from focused modules
export type {
  CreditStats,
  StudentEnrollment,
  StudentExam,
  AvailableElectiveSection,
  RegistrationStatus,
} from "./student/types";

export { getStudentLevel, getStudentNumber } from "./student/profile";
export { getStudentCreditStats } from "./student/credits";
export {
  getStudentEnrollments,
  getStudentExams,
  getAvailableElectiveSections,
} from "./student/enrollments";
export {
  getUpcomingDeadlines,
  getUserNotifications,
  getRegistrationStatus,
} from "./student/notifications";
