/**
 * Schedule Fixtures
 * Generated student schedules (REQUIRED COURSES ONLY)
 */

import { TEST_USERS } from './users.fixture';
import { TEST_SECTIONS, getSectionTimesForSection } from './sections.fixture';
import { TEST_TERM_CODE } from './sections.fixture';
import type { Schedule, ScheduleData, ScheduleSection } from '../../src/types/test-schema';

// =====================================================
// GENERATE SCHEDULES FOR STUDENTS
// =====================================================

/**
 * Generates a schedule for a student based on their level
 * IMPORTANT: Only REQUIRED courses are included (NO electives)
 */
export const generateScheduleForStudent = (
  studentId: string,
  level: number,
  version: number = 1
): Schedule => {
  const scheduleId = `schedule-${studentId}-${version}`;
  
  // Get sections for this level's required courses
  const levelSections = TEST_SECTIONS.filter((section) => {
    const course = section.course_code;
    // Only include required courses for this level
    if (level === 1) return ['SWE101', 'SWE102'].includes(course);
    if (level === 2) return ['SWE201'].includes(course);
    if (level === 3) return ['SWE301'].includes(course);
    return false;
  });
  
  // Assign student to sections (alternate between section 1 and 2)
  const studentIndex = parseInt(studentId.split('-')[1]) || 0;
  const sectionIndex = studentIndex % 2; // 0 or 1
  
  const assignedSections: ScheduleSection[] = levelSections
    .filter((_, idx) => idx % 2 === sectionIndex)
    .filter((section) => section.section_type === 'LECTURE') // Only lectures in main schedule
    .map((section) => ({
      section_id: section.id,
      course_code: section.course_code,
      course_name: getCourseNameByCode(section.course_code),
      course_type: 'REQUIRED',
      instructor_id: section.instructor_id,
      instructor_name: getInstructorName(section.instructor_id),
      room_number: section.room_number,
      times: getSectionTimesForSection(section.id).map(t => ({
        day: t.day,
        start: t.start_time,
        end: t.end_time,
      })),
      credits: 3,
      capacity: section.capacity,
      enrolled_count: section.enrolled_count + 1,
    }));
  
  // Calculate statistics
  const totalCredits = assignedSections.reduce((sum, s) => sum + s.credits, 0);
  const contactHours = assignedSections.reduce((sum, s) => sum + (s.times.length * 1.5), 0); // 1.5 hours per time slot
  const daysWithClasses = [...new Set(assignedSections.flatMap((s) => s.times.map((t) => t.day)))];
  const allDays: Array<'SUNDAY' | 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY'> = 
    ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY'];
  const daysOff = allDays.filter((d) => !daysWithClasses.includes(d));
  
  const scheduleData: ScheduleData = {
    version,
    status: version === 1 ? 'DRAFT' : 'PUBLISHED_DRAFT',
    generated_at: version === 1 ? '2024-10-10T10:00:00Z' : '2024-10-15T14:00:00Z',
    generated_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    sections: assignedSections,
    statistics: {
      total_credits: totalCredits,
      required_courses_count: assignedSections.length,
      total_contact_hours: contactHours,
      days_with_classes: daysWithClasses,
      days_off: daysOff,
      earliest_class: '08:00',
      latest_class: '14:30',
      gaps_count: 0,
      longest_gap_minutes: 0,
    },
    validation: {
      has_conflicts: false,
      conflicts: [],
      warnings: [],
    },
  };
  
  return {
    id: scheduleId,
    student_id: studentId,
    term_code: TEST_TERM_CODE,
    data: scheduleData,
    version,
    is_published: version > 1,
    schedule_version_id: version === 1 ? 'version-001' : 'version-002',
    status: version === 1 ? 'DRAFT' : 'PUBLISHED_DRAFT',
    published_by: version > 1 ? TEST_USERS.quickRef.committee.schedulingChair.id : null,
    published_at: version > 1 ? '2024-10-15T14:30:00Z' : null,
    created_at: '2024-10-10T10:00:00Z',
    updated_at: version > 1 ? '2024-10-15T14:30:00Z' : '2024-10-10T10:00:00Z',
  };
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

const getCourseNameByCode = (code: string): string => {
  const names: Record<string, string> = {
    SWE101: 'Introduction to Programming',
    SWE102: 'Data Structures',
    SWE201: 'Algorithms',
    SWE301: 'Software Engineering',
  };
  return names[code] || code;
};

const getInstructorName = (instructorId: string | null): string | null => {
  if (!instructorId) return null;
  const faculty = TEST_USERS.faculty.find((f) => f.id === instructorId);
  return faculty?.full_name || null;
};

// =====================================================
// GENERATE ALL SCHEDULES
// =====================================================

export const createTestSchedules = (version: number = 1): Schedule[] => {
  const schedules: Schedule[] = [];
  
  TEST_USERS.students.forEach((student, index) => {
    const level = Math.floor(index / 5) + 1; // 5 students per level
    schedules.push(generateScheduleForStudent(student.id, level, version));
  });
  
  return schedules;
};

// =====================================================
// IRREGULAR STUDENT SCHEDULES
// =====================================================

export interface IrregularStudentRequirement {
  student_id: string;
  level: number;
  missing_courses: string[]; // From previous levels
  current_courses: string[]; // From current level
}

export const IRREGULAR_STUDENTS_DATA: IrregularStudentRequirement[] = [
  {
    student_id: TEST_USERS.students[5].id, // Student 2-1
    level: 2,
    missing_courses: ['SWE102'], // Missing from level 1
    current_courses: ['SWE201'], // Level 2 course
  },
  {
    student_id: TEST_USERS.students[11].id, // Student 3-2
    level: 3,
    missing_courses: ['SWE201'], // Missing from level 2
    current_courses: ['SWE301'], // Level 3 course
  },
];

// =====================================================
// HELPER FUNCTIONS FOR SCHEDULES
// =====================================================

export const getScheduleByStudent = (studentId: string, version: number = 1): Schedule | undefined => {
  return createTestSchedules(version).find((s) => s.student_id === studentId);
};

export const getSchedulesByLevel = (level: number, version: number = 1): Schedule[] => {
  const levelStudents = TEST_USERS.students.slice((level - 1) * 5, level * 5);
  return createTestSchedules(version).filter((s) => levelStudents.some((st) => st.id === s.student_id));
};

export const getPublishedSchedules = (): Schedule[] => {
  return createTestSchedules(2).filter((s) => s.is_published);
};

export const getDraftSchedules = (): Schedule[] => {
  return createTestSchedules(1).filter((s) => !s.is_published);
};

// =====================================================
// SCHEDULE STATISTICS
// =====================================================

export const getScheduleStatistics = (version: number = 1) => {
  const schedules = createTestSchedules(version);
  
  const totalCredits = schedules.reduce((sum, s) => sum + s.data.statistics.total_credits, 0);
  const avgCredits = totalCredits / schedules.length;
  
  const totalConflicts = schedules.reduce((sum, s) => sum + s.data.validation.conflicts.length, 0);
  
  const studentsWithDaysOff = schedules.filter((s) => s.data.statistics.days_off.length > 0).length;
  
  return {
    total_schedules: schedules.length,
    total_credits: totalCredits,
    average_credits: avgCredits,
    total_conflicts: totalConflicts,
    conflict_rate: (totalConflicts / schedules.length) * 100,
    students_with_days_off: studentsWithDaysOff,
    days_off_rate: (studentsWithDaysOff / schedules.length) * 100,
  };
};

// =====================================================
// VERSION COMPARISON (for jsondiffpatch testing)
// =====================================================

export const getVersionComparison = () => {
  const v1Schedules = createTestSchedules(1);
  const v2Schedules = createTestSchedules(2);
  
  // Count changes between versions
  const changes = {
    instructor_changes: 0,
    time_changes: 0,
    room_changes: 0,
  };
  
  v1Schedules.forEach((v1Schedule, idx) => {
    const v2Schedule = v2Schedules[idx];
    
    v1Schedule.data.sections.forEach((v1Section, secIdx) => {
      const v2Section = v2Schedule.data.sections[secIdx];
      
      if (v1Section.instructor_id !== v2Section.instructor_id) {
        changes.instructor_changes++;
      }
      if (JSON.stringify(v1Section.times) !== JSON.stringify(v2Section.times)) {
        changes.time_changes++;
      }
      if (v1Section.room_number !== v2Section.room_number) {
        changes.room_changes++;
      }
    });
  });
  
  return {
    version_1_count: v1Schedules.length,
    version_2_count: v2Schedules.length,
    changes,
    total_changes: changes.instructor_changes + changes.time_changes + changes.room_changes,
  };
};

// =====================================================
// QUICK REFERENCE
// =====================================================

export const SCHEDULES_QUICK_REF = {
  v1: {
    all: createTestSchedules(1),
    firstStudent: getScheduleByStudent(TEST_USERS.students[0].id, 1),
    level1: getSchedulesByLevel(1, 1),
    level2: getSchedulesByLevel(2, 1),
    statistics: getScheduleStatistics(1),
  },
  v2: {
    all: createTestSchedules(2),
    firstStudent: getScheduleByStudent(TEST_USERS.students[0].id, 2),
    level1: getSchedulesByLevel(1, 2),
    published: getPublishedSchedules(),
    statistics: getScheduleStatistics(2),
  },
  comparison: getVersionComparison(),
  irregularStudents: IRREGULAR_STUDENTS_DATA,
};

// Export for easy access
export const TEST_SCHEDULES = {
  v1: createTestSchedules(1),
  v2: createTestSchedules(2),
  quickRef: SCHEDULES_QUICK_REF,
  helpers: {
    getByStudent: getScheduleByStudent,
    getByLevel: getSchedulesByLevel,
    getPublished: getPublishedSchedules,
    getDraft: getDraftSchedules,
    getStatistics: getScheduleStatistics,
    getVersionComparison,
  },
};

