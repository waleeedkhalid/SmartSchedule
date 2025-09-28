import { DayOfWeek } from '../common';
import { ScheduleRule } from './rules/base';

/** Severity level of a validation issue */
export enum ValidationSeverity {
  /** Information only, doesn't affect scheduling */
  Info = 'INFO',
  
  /** Warning - potential issue but doesn't prevent scheduling */
  Warning = 'WARNING',
  
  /** Error - must be resolved before scheduling can proceed */
  Error = 'ERROR',
  
  /** Critical error - schedule is not valid */
  Critical = 'CRITICAL'
}

/** Type of validation issue */
export enum ValidationIssueType {
  /** Time conflict between two or more sections */
  TimeConflict = 'TIME_CONFLICT',
  
  /** Faculty member is scheduled outside their availability */
  FacultyUnavailable = 'FACULTY_UNAVAILABLE',
  
  /** Room is double-booked */
  RoomConflict = 'ROOM_CONFLICT',
  
  /** Student is enrolled in conflicting sections */
  StudentConflict = 'STUDENT_CONFLICT',
  
  /** Faculty member is over their assigned load */
  FacultyOverload = 'FACULTY_OVERLOAD',
  
  /** Section is scheduled on a restricted day */
  DayRestriction = 'DAY_RESTRICTION',
  
  /** Section is scheduled during a blackout period */
  BlackoutConflict = 'BLACKOUT_CONFLICT',
  
  /** Missing prerequisite for a course */
  PrerequisiteNotMet = 'PREREQUISITE_NOT_MET',
  
  /** Room capacity exceeded */
  CapacityExceeded = 'CAPACITY_EXCEEDED',
  
  /** Other type of issue */
  Other = 'OTHER'
}

/** A single validation issue */
export interface ValidationIssue {
  /** Unique identifier for this issue */
  id: string;
  
  /** Type of issue */
  type: ValidationIssueType;
  
  /** Severity of the issue */
  severity: ValidationSeverity;
  
  /** Human-readable message describing the issue */
  message: string;
  
  /** Detailed description of the issue */
  description?: string;
  
  /** IDs of the affected entities (sections, courses, faculty, rooms, etc.) */
  affectedIds: string[];
  
  /** Related rule that was violated, if any */
  relatedRuleId?: string;
  
  /** Whether this issue has been manually overridden */
  isOverridden: boolean;
  
  /** Reason for override, if applicable */
  overrideReason?: string;
  
  /** User who overrode the issue, if applicable */
  overriddenBy?: string;
  
  /** Date when the issue was created */
  createdAt: string;
  
  /** Date when the issue was last updated */
  updatedAt: string;
}

/** Result of a validation check */
export interface ValidationResult {
  /** Whether the validation passed (no errors or only warnings) */
  isValid: boolean;
  
  /** List of all validation issues found */
  issues: ValidationIssue[];
  
  /** Count of issues by severity */
  issueCounts: {
    [ValidationSeverity.Info]: number;
    [ValidationSeverity.Warning]: number;
    [ValidationSeverity.Error]: number;
    [ValidationSeverity.Critical]: number;
    total: number;
  };
  
  /** Whether there are any unaddressed errors */
  hasErrors: boolean;
  
  /** Whether there are any unaddressed warnings */
  hasWarnings: boolean;
  
  /** Timestamp when the validation was performed */
  validatedAt: string;
  
  /** ID of the user who performed the validation */
  validatedBy: string;
  
  /** Version of the validation rules used */
  rulesVersion: string;
}

/** Options for running validation */
export interface ValidationOptions {
  /** Whether to include info-level issues in the results */
  includeInfo?: boolean;
  
  /** Whether to include warning-level issues in the results */
  includeWarnings?: boolean;
  
  /** Whether to include error-level issues in the results */
  includeErrors?: boolean;
  
  /** Maximum number of issues to return (for performance) */
  maxIssues?: number;
  
  /** Whether to include resolved issues in the results */
  includeResolved?: boolean;
  
  /** Specific rule types to check (if not provided, all rules are checked) */
  ruleTypesToCheck?: string[];
  
  /** Specific sections to validate (if not provided, all sections are validated) */
  sectionIdsToCheck?: string[];
  
  /** Whether to run in quick mode (faster but less thorough) */
  quickMode?: boolean;
}

/** Context information for validation */
export interface ValidationContext {
  /** Current term ID */
  termId: string;
  
  /** Current date (for time-based validations) */
  currentDate: string;
  
  /** Whether the user has admin privileges */
  isAdmin: boolean;
  
  /** Additional context data */
  [key: string]: unknown;
}

/** Function that validates a schedule against a rule */
export type RuleValidator<T extends ScheduleRule> = (
  rule: T,
  schedule: any, // TODO: Replace with actual schedule type
  context: ValidationContext,
  options?: ValidationOptions
) => Promise<ValidationIssue[]>;

/** Registry of rule validators */
export interface RuleValidatorRegistry {
  [ruleType: string]: RuleValidator<any>;
}

/** Function that fixes a validation issue */
export type IssueFixer = (
  issue: ValidationIssue,
  schedule: any, // TODO: Replace with actual schedule type
  context: ValidationContext
) => Promise<{
  /** Whether the fix was successful */
  success: boolean;
  
  /** Updated schedule (if the fix was applied) */
  updatedSchedule?: any;
  
  /** New issues that may have been introduced by the fix */
  newIssues?: ValidationIssue[];
  
  /** Message describing the result of the fix */
  message: string;
}>;

/** Registry of issue fixers */
export interface IssueFixerRegistry {
  [issueType: string]: IssueFixer;
}
