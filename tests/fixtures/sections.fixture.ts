/**
 * Section Fixtures
 * Course sections with time slots (using section_time table)
 */

import type { Database } from '../../src/types/test-schema';

type Section = {
  id: string;
  course_code: string;
  instructor_id: string | null;
  room_number: string | null;
  term_code: string;
  capacity: number;
  enrolled_count: number;
  section_type: 'LECTURE' | 'LAB' | 'TUTORIAL';
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
  created_at: string;
  updated_at: string;
};

type SectionTime = Database['public']['Tables']['section_time']['Row'];

export const TEST_TERM_CODE = '471';

// =====================================================
// SECTIONS (10 total - 8 lectures, 2 labs)
// =====================================================

export const TEST_SECTIONS: Section[] = [
  // SWE101 - Introduction to Programming (Level 1)
  {
    id: 'SWE101-01',
    course_code: 'SWE101',
    instructor_id: 'faculty-0001-0000-0000-000000000000', // Dr. Ahmad
    room_number: 'A101',
    term_code: TEST_TERM_CODE,
    capacity: 25,
    enrolled_count: 0,
    section_type: 'LECTURE',
    status: 'PUBLISHED',
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'SWE101-02',
    course_code: 'SWE101',
    instructor_id: 'faculty-0002-0000-0000-000000000000', // Dr. Fatima
    room_number: 'A102',
    term_code: TEST_TERM_CODE,
    capacity: 25,
    enrolled_count: 0,
    section_type: 'LECTURE',
    status: 'PUBLISHED',
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-09-01T10:00:00Z',
  },
  
  // SWE102 - Data Structures (Level 1)
  {
    id: 'SWE102-01',
    course_code: 'SWE102',
    instructor_id: 'faculty-0002-0000-0000-000000000000', // Dr. Fatima
    room_number: 'A103',
    term_code: TEST_TERM_CODE,
    capacity: 25,
    enrolled_count: 0,
    section_type: 'LECTURE',
    status: 'PUBLISHED',
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'SWE102-02',
    course_code: 'SWE102',
    instructor_id: 'faculty-0003-0000-0000-000000000000', // Dr. Khalid
    room_number: 'A104',
    term_code: TEST_TERM_CODE,
    capacity: 25,
    enrolled_count: 0,
    section_type: 'LECTURE',
    status: 'PUBLISHED',
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-09-01T10:00:00Z',
  },
  
  // SWE201 - Algorithms (Level 2)
  {
    id: 'SWE201-01',
    course_code: 'SWE201',
    instructor_id: 'faculty-0001-0000-0000-000000000000', // Dr. Ahmad
    room_number: 'B201',
    term_code: TEST_TERM_CODE,
    capacity: 20,
    enrolled_count: 0,
    section_type: 'LECTURE',
    status: 'PUBLISHED',
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'SWE201-02',
    course_code: 'SWE201',
    instructor_id: 'faculty-0003-0000-0000-000000000000', // Dr. Khalid
    room_number: 'B202',
    term_code: TEST_TERM_CODE,
    capacity: 20,
    enrolled_count: 0,
    section_type: 'LECTURE',
    status: 'PUBLISHED',
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-09-01T10:00:00Z',
  },
  
  // SWE301 - Software Engineering (Level 3)
  {
    id: 'SWE301-01',
    course_code: 'SWE301',
    instructor_id: 'faculty-0002-0000-0000-000000000000', // Dr. Fatima
    room_number: 'B203',
    term_code: TEST_TERM_CODE,
    capacity: 20,
    enrolled_count: 0,
    section_type: 'LECTURE',
    status: 'PUBLISHED',
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'SWE301-02',
    course_code: 'SWE301',
    instructor_id: 'faculty-0001-0000-0000-000000000000', // Dr. Ahmad
    room_number: 'B204',
    term_code: TEST_TERM_CODE,
    capacity: 20,
    enrolled_count: 0,
    section_type: 'LECTURE',
    status: 'PUBLISHED',
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-09-01T10:00:00Z',
  },
  
  // LAB SECTIONS
  {
    id: 'SWE101-LAB01',
    course_code: 'SWE101',
    instructor_id: 'faculty-0003-0000-0000-000000000000', // Dr. Khalid
    room_number: 'LAB-101',
    term_code: TEST_TERM_CODE,
    capacity: 15,
    enrolled_count: 0,
    section_type: 'LAB',
    status: 'PUBLISHED',
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'SWE102-LAB01',
    course_code: 'SWE102',
    instructor_id: 'faculty-0001-0000-0000-000000000000', // Dr. Ahmad
    room_number: 'LAB-102',
    term_code: TEST_TERM_CODE,
    capacity: 15,
    enrolled_count: 0,
    section_type: 'LAB',
    status: 'PUBLISHED',
    created_at: '2024-09-01T10:00:00Z',
    updated_at: '2024-09-01T10:00:00Z',
  },
];

// =====================================================
// SECTION TIMES (Time slots for each section)
// =====================================================

export const TEST_SECTION_TIMES: SectionTime[] = [
  // SWE101-01 (Sun/Tue 8:00-9:30)
  {
    id: 'time-swe101-01-sun',
    section_id: 'SWE101-01',
    day: 'SUNDAY',
    start_time: '08:00:00',
    end_time: '09:30:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'time-swe101-01-tue',
    section_id: 'SWE101-01',
    day: 'TUESDAY',
    start_time: '08:00:00',
    end_time: '09:30:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  
  // SWE101-02 (Mon/Wed 8:00-9:30)
  {
    id: 'time-swe101-02-mon',
    section_id: 'SWE101-02',
    day: 'MONDAY',
    start_time: '08:00:00',
    end_time: '09:30:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'time-swe101-02-wed',
    section_id: 'SWE101-02',
    day: 'WEDNESDAY',
    start_time: '08:00:00',
    end_time: '09:30:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  
  // SWE102-01 (Sun/Tue 10:00-11:30)
  {
    id: 'time-swe102-01-sun',
    section_id: 'SWE102-01',
    day: 'SUNDAY',
    start_time: '10:00:00',
    end_time: '11:30:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'time-swe102-01-tue',
    section_id: 'SWE102-01',
    day: 'TUESDAY',
    start_time: '10:00:00',
    end_time: '11:30:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  
  // SWE102-02 (Mon/Wed 10:00-11:30)
  {
    id: 'time-swe102-02-mon',
    section_id: 'SWE102-02',
    day: 'MONDAY',
    start_time: '10:00:00',
    end_time: '11:30:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'time-swe102-02-wed',
    section_id: 'SWE102-02',
    day: 'WEDNESDAY',
    start_time: '10:00:00',
    end_time: '11:30:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  
  // SWE201-01 (Sun/Tue 9:00-10:30)
  {
    id: 'time-swe201-01-sun',
    section_id: 'SWE201-01',
    day: 'SUNDAY',
    start_time: '09:00:00',
    end_time: '10:30:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'time-swe201-01-tue',
    section_id: 'SWE201-01',
    day: 'TUESDAY',
    start_time: '09:00:00',
    end_time: '10:30:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  
  // SWE201-02 (Mon/Wed 9:00-10:30)
  {
    id: 'time-swe201-02-mon',
    section_id: 'SWE201-02',
    day: 'MONDAY',
    start_time: '09:00:00',
    end_time: '10:30:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'time-swe201-02-wed',
    section_id: 'SWE201-02',
    day: 'WEDNESDAY',
    start_time: '09:00:00',
    end_time: '10:30:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  
  // SWE301-01 (Sun/Tue 11:00-12:30) - Note: Crosses lunch break slightly
  {
    id: 'time-swe301-01-sun',
    section_id: 'SWE301-01',
    day: 'SUNDAY',
    start_time: '10:30:00',
    end_time: '12:00:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'time-swe301-01-tue',
    section_id: 'SWE301-01',
    day: 'TUESDAY',
    start_time: '10:30:00',
    end_time: '12:00:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  
  // SWE301-02 (Mon/Wed 11:00-12:30)
  {
    id: 'time-swe301-02-mon',
    section_id: 'SWE301-02',
    day: 'MONDAY',
    start_time: '10:30:00',
    end_time: '12:00:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  {
    id: 'time-swe301-02-wed',
    section_id: 'SWE301-02',
    day: 'WEDNESDAY',
    start_time: '10:30:00',
    end_time: '12:00:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  
  // LAB SECTIONS (Afternoon times)
  // SWE101-LAB01 (Thursday 13:00-15:00)
  {
    id: 'time-swe101-lab01-thu',
    section_id: 'SWE101-LAB01',
    day: 'THURSDAY',
    start_time: '13:00:00',
    end_time: '15:00:00',
    created_at: '2024-09-01T10:00:00Z',
  },
  
  // SWE102-LAB01 (Thursday 15:00-17:00)
  {
    id: 'time-swe102-lab01-thu',
    section_id: 'SWE102-LAB01',
    day: 'THURSDAY',
    start_time: '15:00:00',
    end_time: '17:00:00',
    created_at: '2024-09-01T10:00:00Z',
  },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getSectionById = (sectionId: string): Section | undefined => {
  return TEST_SECTIONS.find(s => s.id === sectionId);
};

export const getSectionsByCourse = (courseCode: string): Section[] => {
  return TEST_SECTIONS.filter(s => s.course_code === courseCode);
};

export const getSectionsByInstructor = (instructorId: string): Section[] => {
  return TEST_SECTIONS.filter(s => s.instructor_id === instructorId);
};

export const getSectionTimesForSection = (sectionId: string): SectionTime[] => {
  return TEST_SECTION_TIMES.filter(st => st.section_id === sectionId);
};

export const getLectureSections = (): Section[] => {
  return TEST_SECTIONS.filter(s => s.section_type === 'LECTURE');
};

export const getLabSections = (): Section[] => {
  return TEST_SECTIONS.filter(s => s.section_type === 'LAB');
};

// =====================================================
// STATISTICS
// =====================================================

export const getSectionStatistics = () => {
  return {
    total_sections: TEST_SECTIONS.length,
    lectures: getLectureSections().length,
    labs: getLabSections().length,
    total_capacity: TEST_SECTIONS.reduce((sum, s) => sum + s.capacity, 0),
    avg_capacity: TEST_SECTIONS.reduce((sum, s) => sum + s.capacity, 0) / TEST_SECTIONS.length,
    published_sections: TEST_SECTIONS.filter(s => s.status === 'PUBLISHED').length,
  };
};

// =====================================================
// QUICK REFERENCE
// =====================================================

export const SECTIONS_QUICK_REF = {
  swe101: getSectionsByCourse('SWE101'),
  swe102: getSectionsByCourse('SWE102'),
  swe201: getSectionsByCourse('SWE201'),
  swe301: getSectionsByCourse('SWE301'),
  lectures: getLectureSections(),
  labs: getLabSections(),
  statistics: getSectionStatistics(),
};

// Export for easy access
export const TEST_SECTION_DATA = {
  sections: TEST_SECTIONS,
  sectionTimes: TEST_SECTION_TIMES,
  quickRef: SECTIONS_QUICK_REF,
  helpers: {
    getById: getSectionById,
    getByCourse: getSectionsByCourse,
    getByInstructor: getSectionsByInstructor,
    getTimesForSection: getSectionTimesForSection,
    getLectures: getLectureSections,
    getLabs: getLabSections,
    getStatistics: getSectionStatistics,
  },
};
