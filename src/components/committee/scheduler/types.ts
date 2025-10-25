/**
 * Shared types for scheduler dashboard components
 */

export interface SchedulerData {
  name: string;
  email: string;
  role: string;
  totalCourses: number;
  totalStudents: number;
  totalSections: number;
  publishedSections: number;
  lastGeneratedAt: string | null;
  scheduleStatus: "not_generated" | "draft" | "published";
}

export interface DashboardStats {
  totalCourses: number;
  totalStudents: number;
  totalSections: number;
  publishedSections: number;
  totalEnrollments: number;
  unresolvedConflicts: number;
  conflictsBySeverity: {
    critical: number;
    error: number;
    warning: number;
    info: number;
  };
  scheduleStatus: "not_generated" | "draft" | "published";
  lastGeneratedAt: string | null;
  preferenceSubmissionRate: number;
  totalPreferences: number;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  event_type: string;
  start_date: string;
  end_date: string;
  category: string;
}

export interface FeedbackSettings {
  feedback_open: boolean;
  schedule_published: boolean;
}

