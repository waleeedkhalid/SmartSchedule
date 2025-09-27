export interface SectionTime {
  day: string; // e.g., "1 3 5"
  time: string; // e.g., "11:00 AM - 11:50 AM"
  room?: string;
}

export interface Course {
  courseId: number;
  courseCode: string;
  courseName: string;
  section: string;
  activity: string;
  hours: string;
  status: string;
  sectionTimes: SectionTime[];
  instructor: string;
  examDay: string;
  examTime: string;
  examDate: string;
  sectionAllocations: string;
  parentLectureId?: number;
  linkedSectionId?: number;
}

export interface NormalizedTimeSlot {
  day: number;
  startMinutes: number;
  endMinutes: number;
  room?: string;
}

export interface CourseSection {
  course: Course;
  normalizedSlots: NormalizedTimeSlot[];
  examSlot?: {
    day: number;
    startMinutes: number;
    endMinutes: number;
    date: string;
  };
}

export interface Schedule {
  id: string;
  sections: CourseSection[];
  score: number;
  conflicts: string[];
  metadata: {
    totalHours: number;
    daysUsed: number[];
    earliestStart: number;
    latestEnd: number;
    totalGaps: number;
  };
}
