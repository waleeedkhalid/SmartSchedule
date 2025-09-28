import { DayOfWeek, TimeRange } from '../common';
import { ValidationResult } from './validation';
import { ScheduleRule } from './rules/base';

/** Status of a schedule */
export enum ScheduleStatus {
  /** Initial draft, not yet validated */
  Draft = 'DRAFT',
  
  /** Currently being validated */
  Validating = 'VALIDATING',
  
  /** Validation complete with issues */
  NeedsReview = 'NEEDS_REVIEW',
  
  /** Validation complete with no issues */
  Valid = 'VALID',
  
  /** Published and active */
  Published = 'PUBLISHED',
  
  /** Archived (read-only) */
  Archived = 'ARCHIVED',
  
  /** Rejected during review */
  Rejected = 'REJECTED'
}

/** Schedule metadata */
export interface ScheduleMetadata {
  /** Unique identifier for the schedule */
  id: string;
  
  /** Human-readable name for the schedule */
  name: string;
  
  /** Description of the schedule */
  description?: string;
  
  /** Academic term this schedule applies to */
  termId: string;
  
  /** Current status of the schedule */
  status: ScheduleStatus;
  
  /** Version number (incremented on each update) */
  version: number;
  
  /** Whether this is the current active version */
  isCurrent: boolean;
  
  /** ID of the user who created the schedule */
  createdBy: string;
  
  /** ID of the user who last updated the schedule */
  updatedBy: string;
  
  /** Date when the schedule was created */
  createdAt: string;
  
  /** Date when the schedule was last updated */
  updatedAt: string;
  
  /** Date when the schedule was published (if applicable) */
  publishedAt?: string;
  
  /** ID of the user who published the schedule (if applicable) */
  publishedBy?: string;
  
  /** Notes or comments about the schedule */
  notes?: string;
  
  /** Tags for categorizing the schedule */
  tags?: string[];
  
  /** Custom metadata */
  metadata?: Record<string, unknown>;
}

/** Schedule section assignment */
export interface SectionAssignment {
  /** Unique identifier for the assignment */
  id: string;
  
  /** ID of the course section */
  sectionId: string;
  
  /** ID of the faculty member assigned to teach the section */
  facultyId: string;
  
  /** ID of the room where the section meets */
  roomId: string;
  
  /** Days of the week when the section meets */
  days: DayOfWeek[];
  
  /** Time range when the section meets */
  timeRange: TimeRange;
  
  /** Start date of the section */
  startDate: string;
  
  /** End date of the section */
  endDate: string;
  
  /** Whether this is the primary instructor (for team-taught courses) */
  isPrimaryInstructor: boolean;
  
  /** Load credit for this assignment (in credit hours) */
  loadCredit: number;
  
  /** Notes about this assignment */
  notes?: string;
  
  /** Date when the assignment was created */
  createdAt: string;
  
  /** Date when the assignment was last updated */
  updatedAt: string;
}

/** Schedule constraints */
export interface ScheduleConstraints {
  /** Minimum time between classes (in minutes) */
  minTimeBetweenClasses: number;
  
  /** Maximum number of consecutive classes */
  maxConsecutiveClasses: number;
  
  /** Preferred teaching times */
  preferredTimes: Array<{
    days: DayOfWeek[];
    timeRange: TimeRange;
    weight: number; // 1-10, where 10 is most preferred
  }>;
  
  /** Unavailable times */
  unavailableTimes: Array<{
    days: DayOfWeek[];
    timeRange: TimeRange;
    reason: string;
  }>;
  
  /** Preferred classroom types */
  preferredRoomTypes: string[];
  
  /** Maximum number of different rooms per day */
  maxRoomsPerDay: number;
  
  /** Maximum number of teaching days per week */
  maxTeachingDays: number;
  
  /** Whether to avoid single classes on a day */
  avoidSingleClassDays: boolean;
  
  /** Whether to prefer morning/afternoon blocks */
  preferTimeBlocks: boolean;
  
  /** Custom constraints */
  customConstraints: Record<string, unknown>;
}

/** Schedule statistics */
export interface ScheduleStats {
  /** Total number of sections scheduled */
  totalSections: number;
  
  /** Number of faculty assigned */
  facultyCount: number;
  
  /** Number of rooms used */
  roomCount: number;
  
  /** Total student capacity */
  totalCapacity: number;
  
  /** Average class size */
  averageClassSize: number;
  
  /** Room utilization rate (0-1) */
  roomUtilization: number;
  
  /** Faculty load distribution */
  facultyLoad: Array<{
    facultyId: string;
    creditHours: number;
    sectionCount: number;
    prepCount: number;
  }>;
  
  /** Time distribution */
  timeDistribution: Array<{
    day: DayOfWeek;
    hour: number;
    sectionCount: number;
  }>;
  
  /** Room usage distribution */
  roomUsage: Array<{
    roomId: string;
    usagePercentage: number;
    peakHours: string[];
  }>;
}

/** A complete schedule */
export interface Schedule {
  /** Schedule metadata */
  metadata: ScheduleMetadata;
  
  /** Section assignments */
  assignments: SectionAssignment[];
  
  /** Applied rules */
  rules: ScheduleRule[];
  
  /** Schedule constraints */
  constraints: ScheduleConstraints;
  
  /** Validation results */
  validation?: ValidationResult;
  
  /** Schedule statistics */
  stats: ScheduleStats;
  
  /** Version history */
  history: Array<{
    version: number;
    timestamp: string;
    userId: string;
    changes: string[];
    comment?: string;
  }>;
  
  /** Custom data */
  customData?: Record<string, unknown>;
}

/** Schedule filter options */
export interface ScheduleFilterOptions {
  /** Filter by term ID */
  termId?: string;
  
  /** Filter by status */
  status?: ScheduleStatus | ScheduleStatus[];
  
  /** Filter by faculty ID */
  facultyId?: string;
  
  /** Filter by room ID */
  roomId?: string;
  
  /** Filter by course code */
  courseCode?: string;
  
  /** Filter by creation date range */
  createdAfter?: string;
  createdBefore?: string;
  
  /** Filter by update date range */
  updatedAfter?: string;
  updatedBefore?: string;
  
  /** Search text (searches name, description, and notes) */
  searchText?: string;
  
  /** Tags to filter by */
  tags?: string[];
  
  /** Whether to include archived schedules */
  includeArchived?: boolean;
  
  /** Whether to include validation results */
  includeValidation?: boolean;
  
  /** Maximum number of results to return */
  limit?: number;
  
  /** Number of results to skip */
  offset?: number;
  
  /** Sort field */
  sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'status' | 'version';
  
  /** Sort order */
  sortOrder?: 'asc' | 'desc';
}
