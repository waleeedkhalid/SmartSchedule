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

import { DayOfWeek, TimeRange } from './common';

export { DayOfWeek }; // Re-export for backward compatibility

export interface DayTimeRange {
  days: DayOfWeek[];
  timeRange: TimeRange;
}

export interface BaseRule {
  id: string;
  type: RuleType;
  name: string;
  description: string;
  isActive: boolean;
  priority: number; // 1-10, where 10 is highest priority
}

export interface TimeBlockRule extends BaseRule {
  type: RuleType.TimeBlock;
  timeRanges: DayTimeRange[];
  blockType: 'BLACKLIST' | 'WHITELIST';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface DayRestrictionRule extends BaseRule {
  type: RuleType.DayRestriction;
  restrictedDays: DayOfWeek[];
  restrictionType: 'BLACKLIST' | 'WHITELIST';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface FacultyAvailabilityRule extends BaseRule {
  type: RuleType.FacultyAvailability;
  facultyId: string;
  availableSlots: DayTimeRange[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface RoomAvailabilityRule extends BaseRule {
  type: RuleType.RoomAvailability;
  roomId: string;
  availableSlots: DayTimeRange[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface CoursePrerequisiteRule extends BaseRule {
  type: RuleType.CoursePrerequisite;
  courseId: string;
  prerequisiteCourseIds: string[];
  minGrade?: string; // e.g., 'C' or 'B+'
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface FacultyLoadRule extends BaseRule {
  type: RuleType.FacultyLoad;
  facultyId: string;
  maxCourses: number;
  maxCredits: number;
  preferredCourseIds?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface StudentConflictRule extends BaseRule {
  type: RuleType.StudentConflict;
  courseIds: string[]; // Courses that cannot be scheduled at the same time
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export interface PreferredTimeRule extends BaseRule {
  type: RuleType.PreferredTime;
  entityType: 'COURSE' | 'INSTRUCTOR';
  entityId: string;
  preferredSlots: DayTimeRange[];
  preferenceWeight: number; // 1-10, where 10 is strongest preference
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

export type ScheduleRule = 
  | TimeBlockRule
  | DayRestrictionRule
  | FacultyAvailabilityRule
  | RoomAvailabilityRule
  | CoursePrerequisiteRule
  | FacultyLoadRule
  | StudentConflictRule
  | PreferredTimeRule;

// Helper function to create default timestamps
const createDefaultTimestamps = () => ({
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: 'system',
  updatedBy: 'system'
});

// Default rules that can be used across the application
export const DEFAULT_RULES: Record<string, ScheduleRule> = {
  LUNCH_BREAK: {
    id: 'lunch-break',
    type: RuleType.TimeBlock,
    name: 'Lunch Break',
    description: 'No classes scheduled during lunch hours',
    isActive: true,
    priority: 8,
    timeRanges: [
      {
        days: [
          DayOfWeek.MONDAY,
          DayOfWeek.TUESDAY,
          DayOfWeek.WEDNESDAY,
          DayOfWeek.THURSDAY,
          DayOfWeek.FRIDAY
        ],
        timeRange: { start: '12:00', end: '13:00' }
      }
    ],
    blockType: 'BLACKLIST',
    ...createDefaultTimestamps()
  },
  NO_CLASSES_WEEKENDS: {
    id: 'no-weekend-classes',
    type: RuleType.DayRestriction,
    name: 'No Weekend Classes',
    description: 'Prevent scheduling classes on weekends',
    isActive: true,
    priority: 10,
    restrictedDays: [DayOfWeek.SATURDAY, DayOfWeek.SUNDAY],
    restrictionType: 'BLACKLIST',
    ...createDefaultTimestamps()
  },
};

// Helper functions
export const isTimeInRange = (time: string, range: TimeRange): boolean => {
  const [hours, minutes] = time.split(':').map(Number);
  const [startHours, startMinutes] = range.start.split(':').map(Number);
  const [endHours, endMinutes] = range.end.split(':').map(Number);
  
  const totalMinutes = hours * 60 + minutes;
  const startTotal = startHours * 60 + startMinutes;
  const endTotal = endHours * 60 + endMinutes;
  
  return totalMinutes >= startTotal && totalMinutes <= endTotal;
};

export const getActiveRules = (rules: ScheduleRule[]): ScheduleRule[] => {
  return rules.filter(rule => rule.isActive);
};

export const sortRulesByPriority = (rules: ScheduleRule[]): ScheduleRule[] => {
  return [...rules].sort((a, b) => b.priority - a.priority);
};
