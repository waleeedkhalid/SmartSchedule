import type { User, Course, Section, ScheduleRule, PaginatedResponse, DayOfWeek, ScheduleSlot } from './index';

export interface CommitteeMember extends User {
  committeeRole: 'Scheduler' | 'Teaching Load' | 'Registrar';
  department: string;
  responsibilities: string[];
  isActive: boolean;
}

export interface ScheduleDraft {
  id: string;
  name: string;
  description?: string;
  term: string;
  status: 'DRAFT' | 'TEACHING_LOAD_REVIEW' | 'STUDENT_FACULTY_REVIEW' | 'SCHEDULER_REVIEW' | 'PUBLISHED' | 'ARCHIVED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  sections: ScheduledSection[];
  rules: ScheduleRule[];
  conflicts: ScheduleConflict[];
  notes: ScheduleNote[];
}

export interface ScheduledSection {
  id: string;
  course: Course;
  section: Section;
  professor: {
    id: string;
    name: string;
    email: string;
  };
  schedule: ScheduleSlot[];
  enrollment: {
    current: number;
    max: number;
    waitlist: number;
  };
  status: 'PRELIMINARY' | 'CONFIRMED' | 'CANCELLED';
  notes?: string;
}

export interface ScheduleConflict {
  id: string;
  type: 'TIME' | 'ROOM' | 'INSTRUCTOR' | 'STUDENT' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  affectedEntities: Array<{
    type: 'SECTION' | 'INSTRUCTOR' | 'ROOM';
    id: string;
    name: string;
  }>;
  suggestedResolutions?: string[];
  resolved: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}

export interface ScheduleNote {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
  mentions?: Array<{
    userId: string;
    name: string;
    email: string;
  }>;
}

export interface TeachingLoad {
  facultyId: string;
  name: string;
  department: string;
  currentLoad: number;
  maxLoad: number;
  assignedSections: Array<{
    course: string;
    section: string;
    credits: number;
    schedule: string;
  }>;
  preferredCourses: string[];
  preferredTimeSlots: Array<{
    days: string[];
    startTime: string;
    endTime: string;
  }>;
  conflicts: Array<{
    type: 'OVERLOAD' | 'PREFERENCE_VIOLATION' | 'OTHER';
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
  }>;
}

export interface CommitteeDashboardData {
  currentTerm: string;
  upcomingTerms: Array<{
    term: string;
    status: 'PLANNING' | 'REGISTRATION_OPEN' | 'IN_PROGRESS' | 'COMPLETED';
    startDate: string;
    endDate: string;
  }>;
  recentScheduleDrafts: Array<{
    id: string;
    name: string;
    term: string;
    status: string;
    lastUpdated: string;
    conflicts: number;
    createdBy: string;
  }>;
  teachingLoadSummary: {
    totalFaculty: number;
    facultyWithConflicts: number;
    averageLoad: number;
    departmentBreakdown: Array<{
      department: string;
      facultyCount: number;
      averageLoad: number;
    }>;
  };
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
  pendingTasks: Array<{
    id: string;
    title: string;
    type: 'REVIEW' | 'APPROVAL' | 'CONFLICT_RESOLUTION' | 'OTHER';
    dueDate?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'COMPLETED';
    assignedTo: string[];
  }>;
}

export interface CreateScheduleDraftRequest {
  name: string;
  description?: string;
  term: string;
  baseOnPreviousTerm?: boolean;
  previousTermId?: string;
}

export interface UpdateScheduleDraftRequest {
  name?: string;
  description?: string;
  status?: 'DRAFT' | 'CONFIRMED' | 'CANCELLED';
  sections?: Array<{
    id: string;
    courseId: string;
    professorId: string;
    schedule: Array<{
      day: DayOfWeek;
      startTime: string;
      endTime: string;
      roomId: string;
    }>;
    maxStudents: number;
  }>;
  rules?: ScheduleRule[];
}

export interface ScheduleDraftResponse extends ScheduleDraft {
  _count: {
    sections: number;
    conflicts: number;
    notes: number;
  };
  updatedBy: string;
  updatedAt: string;
}

export interface ScheduleDraftListResponse extends PaginatedResponse<ScheduleDraft> {}

export interface TeachingLoadReport {
  faculty: Array<{
    id: string;
    name: string;
    department: string;
    currentLoad: number;
    maxLoad: number;
    assignedSections: Array<{
      course: string;
      section: string;
      credits: number;
      schedule: string;
    }>;
    conflicts: Array<{
      type: string;
      message: string;
      severity: 'LOW' | 'MEDIUM' | 'HIGH';
    }>;
  }>;
  summary: {
    totalFaculty: number;
    facultyWithConflicts: number;
    averageLoad: number;
    departmentBreakdown: Array<{
      department: string;
      facultyCount: number;
      averageLoad: number;
      conflictCount: number;
    }>;
  };
}
