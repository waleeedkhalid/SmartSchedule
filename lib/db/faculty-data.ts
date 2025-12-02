/**
 * Faculty Dashboard Data
 *
 * @deprecated This file re-exports from focused modules for backward compatibility.
 * Import directly from '@/lib/db/faculty' or specific sub-modules for better tree-shaking.
 *
 * Example:
 *   import { getFacultySections } from '@/lib/db/faculty/sections'
 *   // or
 *   import { getFacultySections } from '@/lib/db/faculty'
 */

// Re-export all types and functions from focused modules
export type {
  TimeSlot,
  DayAvailability,
  FacultyProfile,
  FacultySection,
  FacultyComment,
  FacultyStats,
} from "./faculty/types";

export {
  getFacultyProfile,
  updateFacultyAvailability,
  updateFacultyMaxLoad,
  linkFacultyProfileToInstructor,
} from "./faculty/profile";

export { getFacultySections } from "./faculty/sections";

export {
  getFacultyStats,
  getFacultyWeeklySchedule,
  getFacultyTeachingLoad,
} from "./faculty/stats";

export {
  getFacultyComments,
  submitFacultyComment,
  updateFacultyComment,
  deleteFacultyComment,
} from "./faculty/comments";
