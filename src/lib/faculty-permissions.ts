/**
 * Faculty Permission Helpers
 * Phase-based access control for faculty features
 */

import type { AcademicTerm } from "@/types/database";

export type FacultyAction =
  | "view_courses"
  | "view_schedule"
  | "view_feedback"
  | "submit_suggestions"
  | "view_students";

interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

/**
 * Check if a faculty member can perform an action based on the current term phase
 */
export function canFacultyPerformAction(
  action: FacultyAction,
  term: AcademicTerm | null
): PermissionCheck {
  if (!term) {
    return {
      allowed: false,
      reason: "No active academic term",
    };
  }

  switch (action) {
    case "view_courses":
      // Can view courses once schedule is published
      if (!term.schedule_published) {
        return {
          allowed: false,
          reason: "Course assignments not yet published",
        };
      }
      return { allowed: true };

    case "view_schedule":
      // Can view schedule once it's published
      if (!term.schedule_published) {
        return {
          allowed: false,
          reason: "Schedule not yet published",
        };
      }
      return { allowed: true };

    case "view_feedback":
      // Can only view feedback after the feedback period closes
      if (term.feedback_open) {
        return {
          allowed: false,
          reason: "Feedback period still active. Results available after closure to ensure anonymity.",
        };
      }
      return { allowed: true };

    case "submit_suggestions":
      // Faculty can submit availability when the availability submission window is open
      if (!term.is_faculty_availability_open) {
        return {
          allowed: false,
          reason: "Faculty availability submission is currently closed. Contact scheduling committee if you need to make changes.",
        };
      }
      return { allowed: true };

    case "view_students":
      // Can view student lists once schedule is published and registration is open
      if (!term.schedule_published) {
        return {
          allowed: false,
          reason: "Student lists available after schedule publication",
        };
      }
      return { allowed: true };

    default:
      return {
        allowed: false,
        reason: "Unknown action",
      };
  }
}

/**
 * Get current academic phase description for faculty
 */
export function getCurrentFacultyPhase(term: AcademicTerm | null): {
  phase: string;
  description: string;
  allowedActions: FacultyAction[];
} {
  if (!term) {
    return {
      phase: "inactive",
      description: "No active academic term",
      allowedActions: [],
    };
  }

  const allowedActions: FacultyAction[] = [];

  // Check which actions are currently allowed
  if (term.schedule_published) {
    allowedActions.push("view_courses", "view_schedule", "view_students");
  }

  if (term.is_faculty_availability_open) {
    allowedActions.push("submit_suggestions");
  }

  if (!term.feedback_open && term.schedule_published) {
    allowedActions.push("view_feedback");
  }

  // Determine current phase
  if (term.is_faculty_availability_open && !term.schedule_published) {
    return {
      phase: "availability_submission",
      description: "Availability submission window is open. Submit your teaching preferences.",
      allowedActions,
    };
  }

  if (!term.schedule_published) {
    return {
      phase: "scheduling",
      description: "Schedule is being prepared by the committee.",
      allowedActions,
    };
  }

  if (term.registration_open) {
    return {
      phase: "registration",
      description: "Students are registering for courses. Your schedule is published.",
      allowedActions,
    };
  }

  if (term.feedback_open) {
    return {
      phase: "feedback_collection",
      description: "Feedback is being collected. Results will be available after closure.",
      allowedActions,
    };
  }

  return {
    phase: "active_term",
    description: "Academic term is active. All course information is available.",
    allowedActions,
  };
}

/**
 * Helper to check if faculty can access feedback
 */
export function canAccessFeedback(term: AcademicTerm | null): PermissionCheck {
  return canFacultyPerformAction("view_feedback", term);
}

/**
 * Helper to check if faculty can view their courses
 */
export function canViewCourses(term: AcademicTerm | null): PermissionCheck {
  return canFacultyPerformAction("view_courses", term);
}

/**
 * Helper to check if faculty can submit schedule suggestions
 */
export function canSubmitSuggestions(term: AcademicTerm | null): PermissionCheck {
  return canFacultyPerformAction("submit_suggestions", term);
}

