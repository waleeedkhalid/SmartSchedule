import type { Course, Section, SchedulePreference, Enrollment, User, DayOfWeek, ScheduleSlot } from './index';

export interface Student extends User {
  studentId: string;
  major: string;
  level: number;
  gpa?: number;
  advisorId?: string;
  enrolledSections: Enrollment[];
  completedCourses: CompletedCourse[];
  schedulePreferences?: SchedulePreference;
}

export interface CompletedCourse {
  courseId: string;
  course: Course;
  term: string; // e.g., 'SPRING_2023'
  grade: string;
  creditsEarned: number;
}

export interface CourseSearchResult extends Course {
  isEnrolled: boolean;
  availableSections: Section[];
  conflictsWithCurrentSchedule: boolean;
  hasPrerequisitesMet: boolean;
  isWaitlisted: boolean;
}

export interface StudentDashboardData {
  enrolledSections: Array<{
    section: Section;
    course: Course;
    schedule: ScheduleSlot[];
    professor: {
      id: string;
      name: string;
      email: string;
    };
    enrollmentStatus: 'REGISTERED' | 'WAITLISTED';
    waitlistPosition?: number;
  }>;
  scheduleConflicts: Array<{
    section1: {
      id: string;
      courseCode: string;
      sectionNumber: string;
    };
    section2: {
      id: string;
      courseCode: string;
      sectionNumber: string;
    };
    conflictType: 'TIME' | 'PREREQUISITE' | 'MAX_CREDITS';
  }>;
  registrationStatus: {
    isRegistrationOpen: boolean;
    registrationStartDate: string;
    registrationEndDate: string;
    currentTerm: string;
    nextTerm: string;
  };
  academicProgress: {
    completedCredits: number;
    totalRequiredCredits: number;
    gpa: number;
    majorRequirements: Array<{
      requirementId: string;
      name: string;
      completed: boolean;
      requiredCourses: Array<{
        courseId: string;
        code: string;
        name: string;
        completed: boolean;
        inProgress: boolean;
      }>;
      requiredCredits: number;
      completedCredits: number;
    }>;
  };
  holds: Array<{
    id: string;
    type: 'FINANCIAL' | 'ACADEMIC' | 'ADMINISTRATIVE' | 'OTHER';
    reason: string;
    datePlaced: string;
    resolved: boolean;
    resolutionNotes?: string;
  }>;
  notifications: Array<{
    id: string;
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
    title: string;
    message: string;
    date: string;
    read: boolean;
    action?: {
      label: string;
      url: string;
    };
  }>;
}

export interface CourseRegistrationRequest {
  sectionId: string;
  action: 'REGISTER' | 'DROP' | 'SWAP';
  swapWithSectionId?: string;
  isWaitlist: boolean;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  registrationResult?: {
    sectionId: string;
    courseCode: string;
    sectionNumber: string;
    action: string;
    status: 'SUCCESS' | 'WAITLISTED' | 'FAILED';
    waitlistPosition?: number;
  };
  conflicts?: Array<{
    type: 'TIME_CONFLICT' | 'PREREQUISITE_NOT_MET' | 'MAX_CREDITS_EXCEEDED' | 'HOLD' | 'OTHER';
    message: string;
    details?: any;
  }>;
}
