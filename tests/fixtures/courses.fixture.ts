/**
 * Course Fixtures
 * Creates 5 test courses (realistic scenario)
 */

export interface TestCourse {
  code: string;
  name: string;
  credits: number;
  department: string;
  level: number;
  type: 'REQUIRED' | 'ELECTIVE';
  has_lab: boolean;
  lab_credits?: number;
  prerequisites?: string[];
  description?: string;
}

// =====================================================
// REQUIRED COURSES (4 courses)
// =====================================================
export const REQUIRED_COURSES: TestCourse[] = [
  {
    code: 'SWE101',
    name: 'Introduction to Programming',
    credits: 3,
    department: 'SWE',
    level: 1,
    type: 'REQUIRED',
    has_lab: true,
    lab_credits: 1,
    prerequisites: [],
    description: 'Fundamental concepts of programming using Python',
  },
  {
    code: 'SWE102',
    name: 'Data Structures',
    credits: 3,
    department: 'SWE',
    level: 1,
    type: 'REQUIRED',
    has_lab: true,
    lab_credits: 1,
    prerequisites: ['SWE101'],
    description: 'Arrays, linked lists, stacks, queues, trees, and graphs',
  },
  {
    code: 'SWE201',
    name: 'Algorithms',
    credits: 3,
    department: 'SWE',
    level: 2,
    type: 'REQUIRED',
    has_lab: false,
    prerequisites: ['SWE102'],
    description: 'Algorithm design, analysis, and complexity',
  },
  {
    code: 'SWE301',
    name: 'Software Engineering',
    credits: 3,
    department: 'SWE',
    level: 3,
    type: 'REQUIRED',
    has_lab: false,
    prerequisites: ['SWE201'],
    description: 'Software development lifecycle, design patterns, testing',
  },
];

// =====================================================
// ELECTIVE COURSES (1 course - not in generated schedule)
// =====================================================
export const ELECTIVE_COURSES: TestCourse[] = [
  {
    code: 'SWE401',
    name: 'Machine Learning',
    credits: 3,
    department: 'SWE',
    level: 4,
    type: 'ELECTIVE',
    has_lab: false,
    prerequisites: ['SWE201'],
    description: 'Introduction to machine learning algorithms and applications',
  },
];

// =====================================================
// ALL COURSES (5 total)
// =====================================================
export const ALL_COURSES: TestCourse[] = [
  ...REQUIRED_COURSES,
  ...ELECTIVE_COURSES,
];

// =====================================================
// EXTERNAL DEPARTMENT COURSES (for constraints)
// =====================================================
export interface ExternalCourse {
  code: string;
  name: string;
  department: string;
  time_slots: Array<{
    day: string;
    start_time: string;
    end_time: string;
  }>;
}

export const EXTERNAL_COURSES: ExternalCourse[] = [
  {
    code: 'CS111',
    name: 'Computer Science Fundamentals',
    department: 'CS',
    time_slots: [
      { day: 'SUNDAY', start_time: '10:00', end_time: '11:30' },
      { day: 'TUESDAY', start_time: '10:00', end_time: '11:30' },
    ],
  },
  {
    code: 'MATH201',
    name: 'Discrete Mathematics',
    department: 'MATH',
    time_slots: [
      { day: 'MONDAY', start_time: '12:00', end_time: '14:00' },
      { day: 'WEDNESDAY', start_time: '12:00', end_time: '14:00' },
    ],
  },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getCourseByCode = (code: string): TestCourse | undefined => {
  return ALL_COURSES.find((c) => c.code === code);
};

export const getCoursesByLevel = (level: number): TestCourse[] => {
  return ALL_COURSES.filter((c) => c.level === level);
};

export const getRequiredCoursesByLevel = (level: number): TestCourse[] => {
  return REQUIRED_COURSES.filter((c) => c.level === level);
};

export const getCoursesWithLabs = (): TestCourse[] => {
  return ALL_COURSES.filter((c) => c.has_lab);
};

export const getCoursePrerequisites = (code: string): string[] => {
  const course = getCourseByCode(code);
  return course?.prerequisites || [];
};

// =====================================================
// QUICK REFERENCE
// =====================================================

export const COURSES_QUICK_REF = {
  level1Required: getRequiredCoursesByLevel(1), // SWE101, SWE102
  level2Required: getRequiredCoursesByLevel(2), // SWE201
  level3Required: getRequiredCoursesByLevel(3), // SWE301
  electives: ELECTIVE_COURSES,
  withLabs: getCoursesWithLabs(),
  external: EXTERNAL_COURSES,
};

// Export for easy access
export const TEST_COURSES = {
  all: ALL_COURSES,
  required: REQUIRED_COURSES,
  electives: ELECTIVE_COURSES,
  external: EXTERNAL_COURSES,
  quickRef: COURSES_QUICK_REF,
  helpers: {
    getByCode: getCourseByCode,
    getByLevel: getCoursesByLevel,
    getRequiredByLevel: getRequiredCoursesByLevel,
    getWithLabs: getCoursesWithLabs,
    getPrerequisites: getCoursePrerequisites,
  },
};

