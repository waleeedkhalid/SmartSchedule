import { DayOfWeek, TimeRange } from '../../common';

/** Base interface for all scheduling rules */
export interface BaseRule {
  /** Unique identifier for the rule */
  id: string;
  
  /** Type of the rule */
  type: RuleType;
  
  /** Human-readable name for the rule */
  name: string;
  
  /** Detailed description of the rule */
  description: string;
  
  /** Whether the rule is currently active */
  isActive: boolean;
  
  /** Priority of the rule (1-10, where 10 is highest) */
  priority: number;
  
  /** Date when the rule was created */
  createdAt: string;
  
  /** Date when the rule was last updated */
  updatedAt: string;
  
  /** User who created the rule */
  createdBy: string;
  
  /** User who last updated the rule */
  updatedBy: string;
}

/** Time block rule type */
export interface TimeBlockRule extends BaseRule {
  type: RuleType.TimeBlock;
  
  /** Time ranges when the rule applies */
  timeRanges: Array<{
    /** Days of the week when this time range applies */
    days: DayOfWeek[];
    
    /** Time range when the rule is active */
    timeRange: TimeRange;
  }>;
  
  /** Whether this is a blacklist or whitelist rule */
  blockType: 'BLACKLIST' | 'WHITELIST';
  
  /** Optional course codes this rule applies to (if empty, applies to all) */
  courseCodes?: string[];
  
  /** Optional faculty IDs this rule applies to (if empty, applies to all) */
  facultyIds?: string[];
  
  /** Optional room IDs this rule applies to (if empty, applies to all) */
  roomIds?: string[];
}

/** Day restriction rule type */
export interface DayRestrictionRule extends BaseRule {
  type: RuleType.DayRestriction;
  
  /** Days to restrict */
  restrictedDays: DayOfWeek[];
  
  /** Whether to block or allow only these days */
  restrictionType: 'BLACKLIST' | 'WHITELIST';
  
  /** Optional course codes this rule applies to (if empty, applies to all) */
  courseCodes?: string[];
}

/** Faculty availability rule type */
export interface FacultyAvailabilityRule extends BaseRule {
  type: RuleType.FacultyAvailability;
  
  /** Faculty ID this rule applies to */
  facultyId: string;
  
  /** Available time slots for the faculty */
  availableSlots: Array<{
    days: DayOfWeek[];
    timeRange: TimeRange;
  }>;
  
  /** Whether these are the only available slots (true) or just preferred slots (false) */
  isStrict: boolean;
}

/** Room availability rule type */
export interface RoomAvailabilityRule extends BaseRule {
  type: RuleType.RoomAvailability;
  
  /** Room ID this rule applies to */
  roomId: string;
  
  /** Available time slots for the room */
  availableSlots: Array<{
    days: DayOfWeek[];
    timeRange: TimeRange;
  }>;
  
  /** Whether these are the only available slots (true) or just preferred slots (false) */
  isStrict: boolean;
}

/** Course prerequisite rule type */
export interface CoursePrerequisiteRule extends BaseRule {
  type: RuleType.CoursePrerequisite;
  
  /** Course code that has prerequisites */
  courseCode: string;
  
  /** List of prerequisite course codes */
  prerequisiteCourseCodes: string[];
  
  /** Minimum grade required in prerequisite courses */
  minimumGrade?: string;
  
  /** Whether all prerequisites must be met (AND) or any one of them (OR) */
  requireAll: boolean;
}

/** Faculty load rule type */
export interface FacultyLoadRule extends BaseRule {
  type: RuleType.FacultyLoad;
  
  /** Faculty ID this rule applies to */
  facultyId: string;
  
  /** Maximum number of course sections that can be assigned */
  maxSections: number;
  
  /** Maximum number of credit hours that can be assigned */
  maxCredits: number;
  
  /** Preferred course codes (optional) */
  preferredCourseCodes?: string[];
  
  /** Maximum number of different course preps */
  maxPreps: number;
}

/** Student conflict rule type */
export interface StudentConflictRule extends BaseRule {
  type: RuleType.StudentConflict;
  
  /** Course codes that cannot be scheduled at the same time */
  courseCodes: string[];
  
  /** Whether this is a hard conflict (cannot be overridden) or soft conflict (warning only) */
  isHardConflict: boolean;
  
  /** Reason for the conflict */
  reason: string;
}

/** Preferred time rule type */
export interface PreferredTimeRule extends BaseRule {
  type: RuleType.PreferredTime;
  
  /** Type of entity this preference applies to */
  entityType: 'COURSE' | 'FACULTY' | 'DEPARTMENT' | 'PROGRAM';
  
  /** ID of the entity this preference applies to */
  entityId: string;
  
  /** Preferred time slots */
  preferredSlots: Array<{
    days: DayOfWeek[];
    timeRange: TimeRange;
  }>;
  
  /** Weight of this preference (1-10, where 10 is strongest) */
  preferenceWeight: number;
  
  /** Reason for the preference */
  reason?: string;
}

/** Rule type enum */
export enum RuleType {
  TimeBlock = 'TIME_BLOCK',
  DayRestriction = 'DAY_RESTRICTION',
  FacultyAvailability = 'FACULTY_AVAILABILITY',
  RoomAvailability = 'ROOM_AVAILABILITY',
  CoursePrerequisite = 'COURSE_PREREQUISITE',
  FacultyLoad = 'FACULTY_LOAD',
  StudentConflict = 'STUDENT_CONFLICT',
  PreferredTime = 'PREFERRED_TIME'
}

/** Union type of all rule types */
export type ScheduleRule = 
  | TimeBlockRule
  | DayRestrictionRule
  | FacultyAvailabilityRule
  | RoomAvailabilityRule
  | CoursePrerequisiteRule
  | FacultyLoadRule
  | StudentConflictRule
  | PreferredTimeRule;
