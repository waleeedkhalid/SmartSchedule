// ============================================================================
// FIRST STEP - GET COUNTS AND EXTERNAL COURSES OFFERINGS
// ============================================================================

export interface CoursesWithStudentCount {
  courseCode: string; // "SWE211"
  level: number; // 4, 5, 6...
  totalStudents: number;
}

export interface CourseOffering {
  courseId: number; // courseId
  exams: {
    midterm?: ExamInfo;
    midterm2?: ExamInfo;
    final: ExamInfo;
  };
  sections: Section[];
}

export interface Course {
  courseId: number;
  code: string;
  name: string;
  credits: number;
  level: number;
  type: "REQUIRED" | "ELECTIVE";
  prerequisites?: string[]; // course Ids
}

export interface IrregularStudent {
  studentId: string;
  remainingCourses: string[]; // course Ids
}

// ============================================================================
// SWE STUDENTS PLAN => REQUIRED AND ELECTIVE COURSES
// ============================================================================

export interface SWELevel {
  level: number; // 4, 5, 6, 7, 8
  requiredSWECourses: string[]; // e.g., courses Ids
  externalCourses: string[]; // e.g., courses Ids
}

export interface ElectivePackage {
  id: string; // "islamic"
  name: string; // "Islamic Studies"
  range: string; // "2-4 hours"
  hours: number; // 2, 3, or 4
  courses: string[]; // Ids
}
// ============================================================================
// COURSE OFFERINGS (CANONICAL)
// ============================================================================

export interface ExamInfo {
  date: string; // "2025-03-12"
  time: string; // "16:00"
  duration: number; // minutes
}

export interface SectionClass {
  day: number; // 1-5 (Sunday-Thursday)
  startMinutes: number;
  endMinutes: number;
  room?: string;
}

// ============================================================================
// ELECTIVE PREFERENCES
// ============================================================================

export interface ElectivePreference {
  id: string;
  studentId: string;
  courseCode: string;
  priority: number; // 1 = highest
}

export interface TimeSlot {
  day: string; // "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"
  startTime: string; // "08:00"
  endTime: string; // "08:50"
}

export interface FacultyAvailability {
  instructorId: string;
  availableSlots: TimeSlot[];
}

export interface FacultyAssignment {
  instructorId: string;
  sectionId: string;
}

export interface FacultyPreferences {
  instructorId: string;
  coursesPreferences?: string[]; // preferred course codes
}

export interface Section {
  courseId: number;
  sectionId: string;
  activity: string; // 'محاضرة' (LEC), 'تمارين' (TUT), 'عملي' (LAB)
  status: string;
  Classes: SectionClass[];
  instructor: string;
  parentLectureId?: number; // For TUT/LAB sections, references the lecture courseId
  linkedSectionId?: number; // For LEC sections, references linked TUT/LAB courseId
}

export interface Student {
  id: string;
  name: string;
  level: number; // 4, 5, 6, 7, 8
  electivePreferences: string[]; // course codes, ranked by priority
  isIrregular?: boolean;
  remainingCourses?: string[]; // only if irregular
}
