/**
 * Schedule Generation and Validation Types
 * For the scheduling algorithm and conflict detection
 */

import type { DayOfWeek } from '@/types/database';

// =====================================================
// SCHEDULE GENERATION TYPES
// =====================================================

export interface CoursesWithStudentCount {
  courseCode: string;
  level: number;
  totalStudents: number;
}

export interface CourseOffering {
  courseId: number;
  exams: {
    midterm?: ExamInfo;
    midterm2?: ExamInfo;
    final: ExamInfo;
  };
  sections: SectionDetail[];
}

export interface SectionDetail {
  courseId: number;
  sectionId: string;
  activity: string; // 'محاضرة' (LEC), 'تمارين' (TUT), 'عملي' (LAB)
  status: string;
  Classes: SectionClass[];
  instructor: string;
  parentLectureId?: number;
  linkedSectionId?: number;
}

export interface SectionClass {
  day: number; // 1-5 (Sunday-Thursday)
  startMinutes: number;
  endMinutes: number;
  room?: string;
}

export interface ExamInfo {
  date: string;
  time: string;
  duration: number;
}

// =====================================================
// TIME SLOT TYPES
// =====================================================

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

export interface TimeSlotMinutes {
  day: DayOfWeek;
  startMinutes: number;
  endMinutes: number;
}

// =====================================================
// STUDENT TYPES
// =====================================================

export interface Student {
  id: string;
  name: string;
  level: number;
  electivePreferences: string[];
  isIrregular?: boolean;
  remainingCourses?: string[];
}

export interface IrregularStudent {
  studentId: string;
  remainingCourses: string[];
}

// =====================================================
// FACULTY TYPES
// =====================================================

export interface ScheduleFacultyAvailability {
  instructorId: string;
  availableSlots: TimeSlot[];
}

export interface FacultyAssignment {
  instructorId: string;
  sectionId: string;
}

export interface FacultyPreferences {
  instructorId: string;
  coursesPreferences?: string[];
}

// =====================================================
// CURRICULUM TYPES
// =====================================================

export interface SWELevel {
  level: number;
  requiredSWECourses: string[];
  externalCourses: string[];
}

export interface ElectivePackage {
  id: string;
  name: string;
  range: string;
  hours: number;
  courses: string[];
}

// =====================================================
// CONFLICT DETECTION TYPES
// =====================================================

export interface ScheduleConflict {
  type: 'time' | 'capacity' | 'prerequisite' | 'exam';
  severity: 'error' | 'warning';
  description: string;
  affectedEntities: string[];
}

export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: ScheduleConflict[];
}

