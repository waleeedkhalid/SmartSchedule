import { AcademicLevel, TimeSlot } from '../common';

/** Course type (required or elective) */
export enum CourseType {
  Required = 'REQUIRED',
  Elective = 'ELECTIVE',
  General = 'GENERAL'
}

/** Course difficulty level */
export enum CourseLevel {
  Introductory = 'INTRODUCTORY',
  Intermediate = 'INTERMEDIATE',
  Advanced = 'ADVANCED',
  Graduate = 'GRADUATE'
}

/** Course prerequisites relationship type */
export enum PrerequisiteType {
  Prerequisite = 'PREREQUISITE',
  Corequisite = 'COREQUISITE',
  Antirequisite = 'ANTIREQUISITE'
}

/** Prerequisite course relationship */
export interface CourseRequirement {
  courseCode: string;
  type: PrerequisiteType;
  minimumGrade?: string; // e.g., 'C' or 'B+'
}

/** Base course information */
export interface CourseBase {
  id: string;
  code: string; // e.g., "CS101", "MATH201"
  title: string;
  description: string;
  creditHours: number;
  lectureHours: number;
  labHours: number;
  level: AcademicLevel;
  type: CourseType;
  department: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Course with detailed information */
export interface Course extends CourseBase {
  prerequisites: CourseRequirement[];
  learningOutcomes: string[];
  isOffered: {
    fall: boolean;
    spring: boolean;
    summer: boolean;
  };
  restrictions?: string[]; // Any restrictions on who can take the course
  notes?: string;
}

/** Course section information */
export interface CourseSection {
  id: string;
  courseId: string;
  sectionNumber: string; // e.g., "01", "02A"
  termId: string;
  instructorId: string;
  roomId?: string;
  schedule: TimeSlot[];
  capacity: number;
  enrolled: number;
  waitlistCount: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/** Course offering in a specific term */
export interface CourseOffering extends CourseBase {
  sections: CourseSection[];
  termId: string;
  availableSeats: number;
  totalSeats: number;
  waitlistCount: number;
}

/** Student enrollment in a course section */
export interface CourseEnrollment {
  id: string;
  studentId: string;
  sectionId: string;
  status: 'REGISTERED' | 'WAITLISTED' | 'DROPPED' | 'COMPLETED';
  grade?: string;
  gradePoints?: number;
  isAudit: boolean;
  registeredAt: string;
  updatedAt: string;
}

/** Student's academic record for a course */
export interface StudentCourseRecord {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  creditHours: number;
  termId: string;
  termName: string;
  grade: string;
  gradePoints: number;
  isCompleted: boolean;
  isTransfer: boolean;
  transferInstitution?: string;
}

/** Course search filters */
export interface CourseSearchFilters {
  termId?: string;
  department?: string;
  level?: AcademicLevel;
  courseType?: CourseType;
  days?: string[];
  timeRange?: {
    start: string;
    end: string;
  };
  instructorId?: string;
  searchQuery?: string;
  onlyOpenSections?: boolean;
  page?: number;
  pageSize?: number;
}
