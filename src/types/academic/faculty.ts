import { UserBase, UserRole, TimeSlot } from "../common";
import { Course, CourseSection } from "./course";

export interface Faculty extends UserBase {
  role: UserRole.Faculty;
  department: string;
  email: string;
  availability?: string[]; // e.g. ["Mon 10-12", "Wed 2-4"]
  preferences?: string[]; // elective/course preferences
}

/** Faculty teaching load */
export interface TeachingLoad {
  facultyId: string;
  termId: string;
  maxCredits: number;
  assignedCredits: number;
  maxPreps: number;
  assignedPreps: number;
  preferredCourses: string[]; // Course codes
  preferredSchedules: TimeSlot[];
  preferredClassTimes: TimeSlot[];
  unavailableTimes: TimeSlot[];
  notes?: string;
}

/** Faculty course assignment */
export interface FacultyAssignment {
  id: string;
  facultyId: string;
  sectionId: string;
  course: Pick<Course, "id" | "code" | "title" | "creditHours">;
  section: Pick<CourseSection, "sectionNumber" | "schedule">;
  termId: string;
  termName: string;
  isPrimaryInstructor: boolean;
  loadCredit: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Faculty availability */
export interface FacultyAvailability {
  facultyId: string;
  termId: string;
  availableSlots: TimeSlot[];
  preferredSlots: TimeSlot[];
  unavailableSlots: TimeSlot[];
  notes?: string;
  lastUpdated: string;
}

/** Faculty teaching evaluation */
export interface TeachingEvaluation {
  id: string;
  facultyId: string;
  sectionId: string;
  termId: string;
  evaluationPeriod: {
    start: string;
    end: string;
  };
  responseRate: number;
  scores: {
    overall: number;
    preparation: number;
    communication: number;
    feedback: number;
    availability: number;
    // Add more evaluation criteria as needed
  };
  comments: string[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Faculty research interests */
export interface ResearchInterest {
  id: string;
  facultyId: string;
  interest: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Faculty publication */
export interface Publication {
  id: string;
  facultyId: string;
  title: string;
  authors: string[];
  journal?: string;
  conference?: string;
  year: number;
  doi?: string;
  url?: string;
  abstract?: string;
  isPeerReviewed: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Faculty service record */
export interface FacultyService {
  id: string;
  facultyId: string;
  type:
    | "COMMITTEE"
    | "DEPARTMENT"
    | "COLLEGE"
    | "UNIVERSITY"
    | "PROFESSIONAL"
    | "COMMUNITY";
  title: string;
  organization: string;
  role: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
