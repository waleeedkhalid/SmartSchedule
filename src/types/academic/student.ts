import { UserBase, UserRole, AcademicLevel } from '../common';
import { CourseEnrollment, StudentCourseRecord } from './course';

/** Student academic status */
export enum AcademicStatus {
  GoodStanding = 'GOOD_STANDING',
  AcademicWarning = 'WARNING',
  AcademicProbation = 'PROBATION',
  AcademicSuspension = 'SUSPENSION',
  AcademicDismissal = 'DISMISSAL'
}

/** Student degree program */
export interface DegreeProgram {
  id: string;
  code: string;
  name: string;
  department: string;
  totalCreditsRequired: number;
  isActive: boolean;
}

/** Student major information */
export interface StudentMajor {
  id: string;
  studentId: string;
  programId: string;
  programName: string;
  catalogYear: string;
  isPrimary: boolean;
  declaredDate: string;
  expectedGradTerm?: string;
}

/** Student minor information */
export interface StudentMinor {
  id: string;
  studentId: string;
  programId: string;
  programName: string;
  catalogYear: string;
  declaredDate: string;
}

/** Student academic hold */
export interface StudentHold {
  id: string;
  studentId: string;
  type: 'FINANCIAL' | 'ACADEMIC' | 'ADMINISTRATIVE' | 'OTHER';
  reason: string;
  description: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  placedBy: string;
  notes?: string;
}

/** Student academic standing */
export interface AcademicStanding {
  termId: string;
  termName: string;
  level: AcademicLevel;
  status: AcademicStatus;
  gpa: number;
  creditsAttempted: number;
  creditsEarned: number;
  creditsInProgress: number;
  isGraduating: boolean;
  academicActions?: string[];
}

/** Student degree audit information */
export interface DegreeAudit {
  studentId: string;
  programId: string;
  programName: string;
  catalogYear: string;
  auditDate: string;
  status: 'IN_PROGRESS' | 'PENDING' | 'COMPLETED';
  requirements: DegreeRequirement[];
  totalCredits: {
    required: number;
    completed: number;
    inProgress: number;
    remaining: number;
  };
  gpa: {
    cumulative: number;
    major: number;
    institution: number;
  };
  canGraduate: boolean;
  missingRequirements: string[];
}

/** Degree requirement for audit */
export interface DegreeRequirement {
  id: string;
  code: string;
  description: string;
  type: 'COURSE' | 'CREDIT' | 'GPA' | 'RESIDENCY' | 'OTHER';
  required: number;
  completed: number;
  inProgress: number;
  isSatisfied: boolean;
  courses: Array<{
    courseId: string;
    courseCode: string;
    courseTitle: string;
    credits: number;
    termId?: string;
    termName?: string;
    grade?: string;
    isInProgress: boolean;
    isTransfer: boolean;
    satisfiesRequirement: boolean;
  }>;
  subRequirements?: DegreeRequirement[];
}

/** Student information */
export interface Student extends UserBase {
  role: UserRole.Student;
  studentId: string;
  level: AcademicLevel;
  program: string;
  major: string;
  minors?: string[];
  gpa: number;
  totalCredits: number;
  enrollmentStatus: 'FULL_TIME' | 'PART_TIME' | 'GRADUATED' | 'INACTIVE';
  entryTerm: string;
  expectedGraduationTerm?: string;
  advisorId?: string;
  advisorName?: string;
  holds: StudentHold[];
  isInternational: boolean;
  isActive: boolean;
  lastActiveTerm?: string;
  createdAt: string;
  updatedAt: string;
}

/** Student academic profile */
export interface StudentAcademicProfile {
  student: Student;
  currentTerm: {
    id: string;
    name: string;
    status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  };
  enrollment: {
    currentTerm: CourseEnrollment[];
    previousTerms: Array<{
      termId: string;
      termName: string;
      courses: CourseEnrollment[];
    }>;
  };
  academicHistory: StudentCourseRecord[];
  academicStanding: AcademicStanding;
  degreeAudit?: DegreeAudit;
  holds: StudentHold[];
  isOnProbation: boolean;
  canRegister: boolean;
  registrationHolds: string[];
  maxCreditsAllowed: number;
  currentCredits: number;
  addDropDeadline: string;
  withdrawalDeadline: string;
}
