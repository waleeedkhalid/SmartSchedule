export type UserRole =
  | "student"
  | "faculty"
  | "committee"
  | "registrar"
  | "loadCommittee"
  | "external"
  | "deanship";

export interface User {
  id: string;
  role: UserRole;
  name: string;
  email: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  sectionSize: number;
  campus: string;
}

export interface Section {
  id: string;
  courseId: string;
  instructorId: string;
  studentCount: number;
  timeslot: string;
  room: string;
}

export type ScheduleStatus = "draft" | "reviewed" | "final";

export interface Schedule {
  id: string;
  version: number;
  createdAt: string;
  status: ScheduleStatus;
  sections: string[];
  feedback: string[];
}

export type FeedbackType = "structured" | "freeText";

export type StructuredFeedbackContent = Record<string, unknown>;

export interface StructuredFeedback {
  id: string;
  scheduleId: string;
  userId: string;
  type: "structured";
  content: StructuredFeedbackContent;
  createdAt: string;
}

export interface FreeTextFeedback {
  id: string;
  scheduleId: string;
  userId: string;
  type: "freeText";
  content: string;
  createdAt: string;
}

export type Feedback = StructuredFeedback | FreeTextFeedback;

export interface IrregularStudent {
  id: string;
  name: string;
  coursesNeeded: string[];
  notes: string;
}

export interface ScheduleWithDetails extends Schedule {
  sectionDetails?: Section[];
}
