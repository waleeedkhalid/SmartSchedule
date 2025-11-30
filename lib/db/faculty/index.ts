/**
 * Faculty Module - Barrel Export
 *
 * Re-exports all faculty-related database functions from focused modules.
 * Import from this file for convenience, or import directly from sub-modules
 * for better tree-shaking.
 */

// Types
export type {
  TimeSlot,
  DayAvailability,
  FacultyProfile,
  FacultySection,
  FacultyComment,
  FacultyStats,
} from "./types";

// Profile operations
export {
  getFacultyProfile,
  updateFacultyAvailability,
  updateFacultyMaxLoad,
  linkFacultyProfileToInstructor,
} from "./profile";

// Section operations
export { getFacultySections } from "./sections";

// Statistics & teaching load
export {
  getFacultyStats,
  getFacultyWeeklySchedule,
  getFacultyTeachingLoad,
} from "./stats";

// Comments/feedback operations
export {
  getFacultyComments,
  submitFacultyComment,
  updateFacultyComment,
  deleteFacultyComment,
} from "./comments";
