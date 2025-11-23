/**
 * Demo Data Service
 * 
 * Provides realistic mock data for all entities in the application.
 * This replaces all database calls for the standalone demo version.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UserRole = 'scheduling' | 'teaching_load' | 'faculty' | 'student' | 'registrar';

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  level?: number;
  department?: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface MockCourse {
  code: string;
  title: string;
  credits: number;
  level: number;
  weekly_hours: number;
  is_elective: boolean;
  elective_group_id?: string;
  department: string;
}

export interface MockInstructor {
  id: string;
  name: string;
  email: string;
  user_id: string | null;
  max_load_per_week: number | null;
  preferred_times: any;
  unavailable_times: any;
  created_at: string;
  updated_at: string;
}

export interface MockRoom {
  code: string;
  type: 'Lecture' | 'Lab';
  capacity?: number;
}

export interface MockSection {
  id: string;
  course_code: string;
  section_no: string;
  instructor_id: string | null;
  room_code: string | null;
  capacity: number;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
    is_lab: boolean;
    linked_lab_section?: string;
  };
  group_level: number;
  state: 'draft' | 'released';
}

export interface MockEnrollment {
  id: string;
  student_id: string;
  section_id: string;
  status: 'registered' | 'dropped';
  enrolled_at: string;
  dropped_at: string | null;
}

export interface MockExam {
  id: string;
  course_code: string;
  section_id: string;
  date: string;
  start: string;
  duration: number;
  room_codes: string[];
}

export interface MockStudentGroup {
  id: string;
  level: number;
  size: number;
  name: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const DEMO_USER_ID = 'demo-user-123';
const DEMO_STUDENT_ID = 'demo-student-456';

// Demo account credentials (password is "demo123" for all accounts)
export const DEMO_ACCOUNTS = {
  student: {
    email: 'student@demo.com',
    password: 'demo123',
    role: 'student' as UserRole,
  },
  faculty: {
    email: 'faculty@demo.com',
    password: 'demo123',
    role: 'faculty' as UserRole,
  },
  scheduling: {
    email: 'scheduling@demo.com',
    password: 'demo123',
    role: 'scheduling' as UserRole,
  },
  teaching_load: {
    email: 'teaching-load@demo.com',
    password: 'demo123',
    role: 'teaching_load' as UserRole,
  },
  registrar: {
    email: 'registrar@demo.com',
    password: 'demo123',
    role: 'registrar' as UserRole,
  },
};

export const mockUsers: MockUser[] = [
  {
    id: DEMO_USER_ID,
    email: DEMO_ACCOUNTS.student.email,
    name: 'Alexandra Martinez',
    role: 'student',
    level: 4,
    department: 'Computer Science',
    onboarding_completed: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 'faculty-001',
    email: DEMO_ACCOUNTS.faculty.email,
    name: 'Dr. James Chen',
    role: 'faculty',
    department: 'Computer Science',
    onboarding_completed: true,
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'scheduling-001',
    email: DEMO_ACCOUNTS.scheduling.email,
    name: 'Sarah Johnson',
    role: 'scheduling',
    department: 'Administration',
    onboarding_completed: true,
    created_at: '2024-01-05T09:00:00Z',
    updated_at: '2024-01-05T09:00:00Z',
  },
  {
    id: 'teaching-load-001',
    email: DEMO_ACCOUNTS.teaching_load.email,
    name: 'Michael Thompson',
    role: 'teaching_load',
    department: 'Administration',
    onboarding_completed: true,
    created_at: '2024-01-08T09:00:00Z',
    updated_at: '2024-01-08T09:00:00Z',
  },
  {
    id: 'registrar-001',
    email: DEMO_ACCOUNTS.registrar.email,
    name: 'Emily Rodriguez',
    role: 'registrar',
    department: 'Administration',
    onboarding_completed: true,
    created_at: '2024-01-06T09:00:00Z',
    updated_at: '2024-01-06T09:00:00Z',
  },
];

export const mockCourses: MockCourse[] = [
  // Required Courses
  { code: 'CS101', title: 'Introduction to Computer Science', credits: 3, level: 1, weekly_hours: 3, is_elective: false, department: 'Computer Science' },
  { code: 'CS102', title: 'Programming Fundamentals', credits: 4, level: 1, weekly_hours: 4, is_elective: false, department: 'Computer Science' },
  { code: 'CS201', title: 'Data Structures and Algorithms', credits: 4, level: 2, weekly_hours: 4, is_elective: false, department: 'Computer Science' },
  { code: 'CS202', title: 'Object-Oriented Programming', credits: 3, level: 2, weekly_hours: 3, is_elective: false, department: 'Computer Science' },
  { code: 'CS301', title: 'Database Systems', credits: 3, level: 3, weekly_hours: 3, is_elective: false, department: 'Computer Science' },
  { code: 'CS302', title: 'Software Engineering Principles', credits: 3, level: 3, weekly_hours: 3, is_elective: false, department: 'Computer Science' },
  { code: 'CS401', title: 'Advanced Algorithms', credits: 3, level: 4, weekly_hours: 3, is_elective: false, department: 'Computer Science' },
  { code: 'CS402', title: 'Operating Systems', credits: 4, level: 4, weekly_hours: 4, is_elective: false, department: 'Computer Science' },
  
  // Elective Courses
  { code: 'CS450', title: 'Machine Learning Fundamentals', credits: 3, level: 4, weekly_hours: 3, is_elective: true, elective_group_id: 'ai-group', department: 'Computer Science' },
  { code: 'CS451', title: 'Deep Learning Applications', credits: 3, level: 5, weekly_hours: 3, is_elective: true, elective_group_id: 'ai-group', department: 'Computer Science' },
  { code: 'CS460', title: 'Web Development Frameworks', credits: 3, level: 4, weekly_hours: 3, is_elective: true, elective_group_id: 'web-group', department: 'Computer Science' },
  { code: 'CS461', title: 'Mobile Application Development', credits: 3, level: 5, weekly_hours: 3, is_elective: true, elective_group_id: 'web-group', department: 'Computer Science' },
  { code: 'CS470', title: 'Cybersecurity Principles', credits: 3, level: 4, weekly_hours: 3, is_elective: true, elective_group_id: 'security-group', department: 'Computer Science' },
  { code: 'CS471', title: 'Network Security', credits: 3, level: 5, weekly_hours: 3, is_elective: true, elective_group_id: 'security-group', department: 'Computer Science' },
  { code: 'CS480', title: 'Cloud Computing Architecture', credits: 3, level: 5, weekly_hours: 3, is_elective: true, elective_group_id: 'cloud-group', department: 'Computer Science' },
  { code: 'CS490', title: 'Capstone Project Preparation', credits: 2, level: 6, weekly_hours: 2, is_elective: true, elective_group_id: 'project-group', department: 'Computer Science' },
];

export const mockInstructors: MockInstructor[] = [
  {
    id: 'instructor-001',
    name: 'Dr. James Chen',
    email: DEMO_ACCOUNTS.faculty.email,
    user_id: 'faculty-001',
    max_load_per_week: 12,
    preferred_times: [
      {
        day: 'Monday',
        slots: [
          { start: '09:00', end: '12:00', type: 'preferred' },
          { start: '13:00', end: '15:00', type: 'preferred' }
        ]
      },
      {
        day: 'Wednesday',
        slots: [
          { start: '09:00', end: '12:00', type: 'preferred' },
          { start: '13:00', end: '15:00', type: 'preferred' }
        ]
      }
    ],
    unavailable_times: [
      {
        day: 'Tuesday',
        slots: [
          { start: '14:00', end: '16:00', type: 'unavailable' }
        ]
      }
    ],
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'instructor-002',
    name: 'Dr. Maria Rodriguez',
    email: 'maria.rodriguez@university.edu',
    user_id: null,
    max_load_per_week: 10,
    preferred_times: [
      {
        day: 'Tuesday',
        slots: [
          { start: '10:00', end: '13:00', type: 'preferred' },
          { start: '14:00', end: '16:00', type: 'preferred' }
        ]
      },
      {
        day: 'Thursday',
        slots: [
          { start: '10:00', end: '13:00', type: 'preferred' },
          { start: '14:00', end: '16:00', type: 'preferred' }
        ]
      }
    ],
    unavailable_times: [],
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'instructor-003',
    name: 'Dr. Robert Kim',
    email: 'robert.kim@university.edu',
    user_id: null,
    max_load_per_week: 12,
    preferred_times: [
      {
        day: 'Sunday',
        slots: [
          { start: '08:00', end: '11:00', type: 'preferred' },
          { start: '12:00', end: '14:00', type: 'preferred' }
        ]
      },
      {
        day: 'Tuesday',
        slots: [
          { start: '08:00', end: '11:00', type: 'preferred' },
          { start: '12:00', end: '14:00', type: 'preferred' }
        ]
      }
    ],
    unavailable_times: [],
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
  {
    id: 'instructor-004',
    name: 'Dr. Emily Watson',
    email: 'emily.watson@university.edu',
    user_id: null,
    max_load_per_week: 10,
    preferred_times: [
      {
        day: 'Monday',
        slots: [
          { start: '09:00', end: '12:00', type: 'preferred' },
          { start: '13:00', end: '15:00', type: 'preferred' }
        ]
      },
      {
        day: 'Wednesday',
        slots: [
          { start: '09:00', end: '12:00', type: 'preferred' },
          { start: '13:00', end: '15:00', type: 'preferred' }
        ]
      },
      {
        day: 'Thursday',
        slots: [
          { start: '09:00', end: '12:00', type: 'preferred' }
        ]
      }
    ],
    unavailable_times: [],
    created_at: '2024-01-10T08:00:00Z',
    updated_at: '2024-01-10T08:00:00Z',
  },
];

export const mockRooms: MockRoom[] = [
  { code: 'A101', type: 'Lecture', capacity: 50 },
  { code: 'A102', type: 'Lecture', capacity: 60 },
  { code: 'A201', type: 'Lecture', capacity: 80 },
  { code: 'A202', type: 'Lecture', capacity: 100 },
  { code: 'B101', type: 'Lab', capacity: 30 },
  { code: 'B102', type: 'Lab', capacity: 25 },
  { code: 'B201', type: 'Lab', capacity: 40 },
  { code: 'B202', type: 'Lab', capacity: 35 },
  { code: 'C101', type: 'Lecture', capacity: 120 },
  { code: 'C102', type: 'Lecture', capacity: 90 },
];

export const mockSections: MockSection[] = [
  // Required Course Sections (Level 4)
  {
    id: 'section-001',
    course_code: 'CS401',
    section_no: '01',
    instructor_id: 'instructor-001',
    room_code: 'A101',
    capacity: 50,
    meeting_pattern: {
      days: ['Sunday', 'Tuesday'],
      start: '09:00',
      duration: 90,
      is_lab: false,
    },
    group_level: 4,
    state: 'released',
  },
  {
    id: 'section-002',
    course_code: 'CS402',
    section_no: '01',
    instructor_id: 'instructor-002',
    room_code: 'A201',
    capacity: 60,
    meeting_pattern: {
      days: ['Monday', 'Wednesday'],
      start: '10:00',
      duration: 120,
      is_lab: false,
    },
    group_level: 4,
    state: 'released',
  },
  {
    id: 'section-003',
    course_code: 'CS402',
    section_no: '02',
    instructor_id: 'instructor-002',
    room_code: 'B101',
    capacity: 30,
    meeting_pattern: {
      days: ['Thursday'],
      start: '14:00',
      duration: 120,
      is_lab: true,
    },
    group_level: 4,
    state: 'released',
  },
  
  // Elective Sections
  {
    id: 'section-101',
    course_code: 'CS450',
    section_no: '01',
    instructor_id: 'instructor-003',
    room_code: 'A102',
    capacity: 40,
    meeting_pattern: {
      days: ['Sunday', 'Tuesday'],
      start: '11:00',
      duration: 90,
      is_lab: false,
    },
    group_level: 4,
    state: 'released',
  },
  {
    id: 'section-102',
    course_code: 'CS450',
    section_no: '02',
    instructor_id: 'instructor-003',
    room_code: 'A202',
    capacity: 45,
    meeting_pattern: {
      days: ['Monday', 'Wednesday'],
      start: '13:00',
      duration: 90,
      is_lab: false,
    },
    group_level: 4,
    state: 'released',
  },
  {
    id: 'section-103',
    course_code: 'CS460',
    section_no: '01',
    instructor_id: 'instructor-004',
    room_code: 'B201',
    capacity: 35,
    meeting_pattern: {
      days: ['Sunday', 'Tuesday'],
      start: '14:00',
      duration: 120,
      is_lab: true,
    },
    group_level: 4,
    state: 'released',
  },
  {
    id: 'section-104',
    course_code: 'CS470',
    section_no: '01',
    instructor_id: 'instructor-001',
    room_code: 'C101',
    capacity: 60,
    meeting_pattern: {
      days: ['Monday', 'Wednesday'],
      start: '08:00',
      duration: 90,
      is_lab: false,
    },
    group_level: 4,
    state: 'released',
  },
  {
    id: 'section-105',
    course_code: 'CS480',
    section_no: '01',
    instructor_id: 'instructor-002',
    room_code: 'A201',
    capacity: 50,
    meeting_pattern: {
      days: ['Tuesday', 'Thursday'],
      start: '10:00',
      duration: 90,
      is_lab: false,
    },
    group_level: 5,
    state: 'released',
  },
];

export const mockEnrollments: MockEnrollment[] = [
  {
    id: 'enrollment-001',
    student_id: DEMO_STUDENT_ID,
    section_id: 'section-001',
    status: 'registered',
    enrolled_at: '2024-01-20T10:00:00Z',
    dropped_at: null,
  },
  {
    id: 'enrollment-002',
    student_id: DEMO_STUDENT_ID,
    section_id: 'section-002',
    status: 'registered',
    enrolled_at: '2024-01-20T10:00:00Z',
    dropped_at: null,
  },
  {
    id: 'enrollment-003',
    student_id: DEMO_STUDENT_ID,
    section_id: 'section-003',
    status: 'registered',
    enrolled_at: '2024-01-20T10:00:00Z',
    dropped_at: null,
  },
  {
    id: 'enrollment-101',
    student_id: DEMO_STUDENT_ID,
    section_id: 'section-101',
    status: 'registered',
    enrolled_at: '2024-01-25T14:00:00Z',
    dropped_at: null,
  },
];

export const mockExams: MockExam[] = [
  {
    id: 'exam-001',
    course_code: 'CS401',
    section_id: 'section-001',
    date: '2024-05-15',
    start: '09:00',
    duration: 120,
    room_codes: ['A101', 'A102'],
  },
  {
    id: 'exam-002',
    course_code: 'CS402',
    section_id: 'section-002',
    date: '2024-05-16',
    start: '10:00',
    duration: 150,
    room_codes: ['A201'],
  },
  {
    id: 'exam-003',
    course_code: 'CS450',
    section_id: 'section-101',
    date: '2024-05-17',
    start: '11:00',
    duration: 120,
    room_codes: ['A102'],
  },
];

export const mockStudentGroups: MockStudentGroup[] = [
  { id: 'group-1', level: 1, size: 45, name: 'Level 1 - Freshman' },
  { id: 'group-2', level: 2, size: 52, name: 'Level 2 - Sophomore' },
  { id: 'group-3', level: 3, size: 48, name: 'Level 3 - Junior' },
  { id: 'group-4', level: 4, size: 55, name: 'Level 4 - Senior' },
  { id: 'group-5', level: 5, size: 42, name: 'Level 5 - Graduate Prep' },
  { id: 'group-6', level: 6, size: 38, name: 'Level 6 - Advanced' },
  { id: 'group-7', level: 7, size: 35, name: 'Level 7 - Research' },
  { id: 'group-8', level: 8, size: 30, name: 'Level 8 - Thesis' },
];

// ============================================================================
// MOCK SERVICE FUNCTIONS
// ============================================================================

/**
 * Simulate network delay
 */
async function delay(ms: number = 100): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get current demo user (always logged in)
 */
export async function getMockUser(): Promise<MockUser> {
  await delay(50);
  return mockUsers[0]; // Return demo student
}

/**
 * Get user role by user_id (checks cookie for demo user)
 */
export async function getMockUserRole(userId?: string): Promise<MockUser | null> {
  await delay(50);
  
  // If userId is provided, use it
  if (userId) {
    return mockUsers.find(u => u.id === userId) || null;
  }
  
  // Otherwise, try to get from cookie (for server components)
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const demoUserId = cookieStore.get('demo_user_id')?.value;
    
    if (demoUserId) {
      const user = mockUsers.find(u => u.id === demoUserId);
      if (user) return user;
    }
  } catch (error) {
    // If cookies() fails (e.g., in client component), fall back to default
  }
  
  // Default to student
  return mockUsers[0];
}

/**
 * Get user by email (for login)
 */
export async function getMockUserByEmail(email: string): Promise<MockUser | null> {
  await delay(50);
  return mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Verify demo account credentials
 */
export function verifyDemoCredentials(email: string, password: string): { valid: boolean; user?: MockUser } {
  const account = Object.values(DEMO_ACCOUNTS).find(acc => acc.email.toLowerCase() === email.toLowerCase());
  
  if (!account) {
    return { valid: false };
  }
  
  if (account.password !== password) {
    return { valid: false };
  }
  
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (!user) {
    return { valid: false };
  }
  
  return { valid: true, user };
}

/**
 * Get all courses
 */
export async function getMockCourses(): Promise<MockCourse[]> {
  await delay(100);
  return mockCourses;
}

/**
 * Get course by code
 */
export async function getMockCourse(code: string): Promise<MockCourse | null> {
  await delay(50);
  return mockCourses.find(c => c.code === code) || null;
}

/**
 * Get all sections
 */
export async function getMockSections(): Promise<MockSection[]> {
  await delay(100);
  return mockSections;
}

/**
 * Get section by ID
 */
export async function getMockSection(id: string): Promise<MockSection | null> {
  await delay(50);
  return mockSections.find(s => s.id === id) || null;
}

/**
 * Get sections by course code
 */
export async function getMockSectionsByCourse(courseCode: string): Promise<MockSection[]> {
  await delay(50);
  return mockSections.filter(s => s.course_code === courseCode);
}

/**
 * Get sections by level
 */
export async function getMockSectionsByLevel(level: number): Promise<MockSection[]> {
  await delay(50);
  return mockSections.filter(s => s.group_level === level);
}

/**
 * Get elective sections (available for registration)
 */
export async function getMockElectiveSections(): Promise<MockSection[]> {
  await delay(100);
  const electiveCourses = mockCourses.filter(c => c.is_elective);
  const electiveCourseCodes = electiveCourses.map(c => c.code);
  return mockSections.filter(s => 
    electiveCourseCodes.includes(s.course_code) && s.state === 'released'
  );
}

/**
 * Get student enrollments
 */
export async function getMockEnrollments(studentId?: string): Promise<MockEnrollment[]> {
  await delay(100);
  const targetId = studentId || DEMO_STUDENT_ID;
  return mockEnrollments.filter(e => e.student_id === targetId && e.status === 'registered');
}

/**
 * Get enrollments with section details
 */
export async function getMockEnrollmentsWithDetails(studentId?: string) {
  await delay(150);
  const enrollments = await getMockEnrollments(studentId);
  
  // Deduplicate enrollments by ID to avoid duplicates
  const uniqueEnrollments = Array.from(
    new Map(enrollments.map(e => [e.id, e])).values()
  );
  
  return uniqueEnrollments.map(enrollment => {
    const section = mockSections.find(s => s.id === enrollment.section_id);
    const course = section ? mockCourses.find(c => c.code === section.course_code) : null;
    const instructor = section?.instructor_id 
      ? mockInstructors.find(i => i.id === section.instructor_id) 
      : null;
    
    return {
      ...enrollment,
      section: section ? {
        ...section,
        course: course || null,
        instructor: instructor || null,
      } : null,
    };
  });
}

/**
 * Get all instructors
 */
export async function getMockInstructors(): Promise<MockInstructor[]> {
  await delay(100);
  return mockInstructors;
}

/**
 * Get instructor by ID
 */
export async function getMockInstructor(id: string): Promise<MockInstructor | null> {
  await delay(50);
  return mockInstructors.find(i => i.id === id) || null;
}

/**
 * Get all rooms
 */
export async function getMockRooms(): Promise<MockRoom[]> {
  await delay(50);
  return mockRooms;
}

/**
 * Get room by code
 */
export async function getMockRoom(code: string): Promise<MockRoom | null> {
  await delay(30);
  return mockRooms.find(r => r.code === code) || null;
}

/**
 * Get all exams
 */
export async function getMockExams(): Promise<MockExam[]> {
  await delay(100);
  return mockExams;
}

/**
 * Get exam by ID
 */
export async function getMockExam(id: string): Promise<MockExam | null> {
  await delay(50);
  return mockExams.find(e => e.id === id) || null;
}

/**
 * Get courses with pagination, search, and sorting
 */
export async function getMockCoursesPaginated(
  page: number = 1,
  pageSize: number = 20,
  searchTerm: string = '',
  sortBy: 'code' | 'title' | 'level' | 'credits' | 'weekly_hours' = 'code',
  sortOrder: 'asc' | 'desc' = 'asc'
): Promise<{
  courses: MockCourse[];
  totalCount: number;
  totalPages: number;
  pageSize: number;
}> {
  await delay(150);
  
  let filtered = [...mockCourses];
  
  // Apply search filter
  if (searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    filtered = filtered.filter(c => 
      c.code.toLowerCase().includes(searchLower) ||
      c.title.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let aVal: any, bVal: any;
    switch (sortBy) {
      case 'code':
        aVal = a.code;
        bVal = b.code;
        break;
      case 'title':
        aVal = a.title;
        bVal = b.title;
        break;
      case 'level':
        aVal = a.level;
        bVal = b.level;
        break;
      case 'credits':
        aVal = a.credits;
        bVal = b.credits;
        break;
      case 'weekly_hours':
        aVal = a.weekly_hours;
        bVal = b.weekly_hours;
        break;
      default:
        aVal = a.code;
        bVal = b.code;
    }
    
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });
  
  // Apply pagination
  const totalCount = filtered.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const courses = filtered.slice(startIndex, endIndex);
  
  return {
    courses,
    totalCount,
    totalPages,
    pageSize,
  };
}

/**
 * Get exams for a student
 */
export async function getMockStudentExams(studentId?: string): Promise<MockExam[]> {
  await delay(100);
  const enrollments = await getMockEnrollments(studentId);
  const enrolledSectionIds = enrollments.map(e => e.section_id);
  return mockExams.filter(e => enrolledSectionIds.includes(e.section_id));
}

/**
 * Get student groups
 */
export async function getMockStudentGroups(): Promise<MockStudentGroup[]> {
  await delay(50);
  return mockStudentGroups;
}

/**
 * Get student group by ID
 */
export async function getMockStudentGroupById(id: string): Promise<MockStudentGroup | null> {
  await delay(50);
  return mockStudentGroups.find(g => g.id === id) || null;
}

/**
 * Get student schedule (required + elective courses)
 */
export async function getMockStudentSchedule(studentId?: string, level?: number): Promise<any> {
  await delay(150);
  const targetLevel = level || 4;
  const enrollments = await getMockEnrollments(studentId);
  
  // Get required courses for level
  const requiredCourses = mockCourses.filter(c => !c.is_elective && c.level === targetLevel);
  const requiredSections = mockSections.filter(s => 
    requiredCourses.some(c => c.code === s.course_code) && s.group_level === targetLevel
  );
  
  // Get enrolled elective sections
  const enrolledSectionIds = enrollments.map(e => e.section_id);
  const enrolledSections = mockSections.filter(s => enrolledSectionIds.includes(s.id));
  
  // Combine and deduplicate by section ID (in case a required section is also enrolled)
  const allSectionIds = new Set([
    ...requiredSections.map(s => s.id),
    ...enrolledSections.map(s => s.id)
  ]);
  const uniqueSections = mockSections.filter(s => allSectionIds.has(s.id));
  
  // Format sections
  const allSections = uniqueSections.map(section => {
    const course = mockCourses.find(c => c.code === section.course_code);
    const instructor = section.instructor_id 
      ? mockInstructors.find(i => i.id === section.instructor_id) 
      : null;
    const isEnrolled = enrolledSectionIds.includes(section.id);
    const isElective = course?.is_elective || false;
    
    return {
      id: section.id,
      course_code: section.course_code,
      course_title: course?.title || '',
      section_no: section.section_no,
      credits: course?.credits || 0,
      is_elective: isElective,
      is_enrolled: isEnrolled,
      instructor_name: instructor?.name || null,
      room_code: section.room_code,
      meeting_pattern: section.meeting_pattern,
      state: section.state,
    };
  });
  
  const totalCredits = allSections.reduce((sum, s) => sum + s.credits, 0);
  const requiredCredits = requiredSections.reduce((sum, s) => {
    const course = mockCourses.find(c => c.code === s.course_code);
    return sum + (course?.credits || 0);
  }, 0);
  const electiveCredits = totalCredits - requiredCredits;
  
  return {
    student_id: studentId || DEMO_STUDENT_ID,
    level: targetLevel,
    total_credits: totalCredits,
    required_credits: requiredCredits,
    elective_credits: electiveCredits,
    sections: allSections,
  };
}

/**
 * Get available elective sections with enrollment counts
 */
export async function getMockAvailableElectiveSections(): Promise<any[]> {
  await delay(150);
  const electiveSections = await getMockElectiveSections();
  
  return electiveSections.map(section => {
    const course = mockCourses.find(c => c.code === section.course_code);
    const instructor = section.instructor_id 
      ? mockInstructors.find(i => i.id === section.instructor_id) 
      : null;
    
    // Count enrollments
    const enrolledCount = mockEnrollments.filter(
      e => e.section_id === section.id && e.status === 'registered'
    ).length;
    
    return {
      section_id: section.id,
      course_code: section.course_code,
      course_title: course?.title || '',
      course_credits: course?.credits || 0,
      section_no: section.section_no,
      instructor_name: instructor?.name || null,
      room_code: section.room_code,
      capacity: section.capacity,
      enrolled_count: enrolledCount,
      available_seats: section.capacity - enrolledCount,
      is_full: enrolledCount >= section.capacity,
      meeting_pattern: section.meeting_pattern,
    };
  });
}

/**
 * Get credit statistics for a student
 */
export async function getMockCreditStats(studentId?: string): Promise<any> {
  await delay(100);
  const enrollments = await getMockEnrollments(studentId);
  const enrolledSections = mockSections.filter(s => 
    enrollments.some(e => e.section_id === s.id)
  );
  
  let requiredCredits = 0;
  let electiveCredits = 0;
  
  enrolledSections.forEach(section => {
    const course = mockCourses.find(c => c.code === section.course_code);
    if (course) {
      if (course.is_elective) {
        electiveCredits += course.credits;
      } else {
        requiredCredits += course.credits;
      }
    }
  });
  
  return {
    enrolled_sections: enrollments.length,
    required_credits: requiredCredits,
    elective_credits: electiveCredits,
    total: requiredCredits + electiveCredits,
    available_credits: 20 - (requiredCredits + electiveCredits),
  };
}

/**
 * Get faculty profile by user ID
 */
export async function getMockFacultyProfile(userId: string): Promise<MockInstructor | null> {
  await delay(100);
  // Find instructor linked to this user
  return mockInstructors.find(i => i.user_id === userId) || null;
}

/**
 * Get faculty sections (sections assigned to an instructor)
 */
export async function getMockFacultySections(instructorId: string): Promise<any[]> {
  await delay(150);
  const instructorSections = mockSections.filter(s => s.instructor_id === instructorId);
  
  return instructorSections.map(section => {
    const course = mockCourses.find(c => c.code === section.course_code);
    const instructor = mockInstructors.find(i => i.id === instructorId);
    
    return {
      id: section.id,
      course_code: section.course_code,
      course_title: course?.title || '',
      section_no: section.section_no,
      instructor_id: section.instructor_id,
      instructor_name: instructor?.name || null,
      room_code: section.room_code,
      capacity: section.capacity,
      meeting_pattern: section.meeting_pattern,
      group_level: section.group_level,
      level: section.group_level,
      credits: course?.credits || 0,
      state: section.state,
    };
  });
}

/**
 * Get faculty availability (preferred and unavailable times)
 */
export async function getMockFacultyAvailability(instructorId: string): Promise<{
  preferred_times: any;
  unavailable_times: any;
}> {
  await delay(100);
  const instructor = mockInstructors.find(i => i.id === instructorId);
  
  if (!instructor) {
    return {
      preferred_times: [],
      unavailable_times: [],
    };
  }
  
  // Convert instructor's preferred/unavailable times to DayAvailability format
  const preferredTimes = instructor.preferred_times ? 
    (Array.isArray(instructor.preferred_times) ? instructor.preferred_times : []) : [];
  const unavailableTimes = instructor.unavailable_times ? 
    (Array.isArray(instructor.unavailable_times) ? instructor.unavailable_times : []) : [];
  
  return {
    preferred_times: preferredTimes,
    unavailable_times: unavailableTimes,
  };
}

/**
 * Get scheduling dashboard statistics
 */
export async function getMockSchedulingStats(): Promise<{
  coursesCount: number;
  sectionsCount: number;
  roomsCount: number;
  instructorsCount: number;
  groupsCount: number;
  draftSectionsCount: number;
  releasedSectionsCount: number;
  assignedSectionsCount: number;
  unassignedSectionsCount: number;
}> {
  await delay(150);
  
  const draftSections = mockSections.filter(s => s.state === 'draft');
  const releasedSections = mockSections.filter(s => s.state === 'released');
  const assignedSections = draftSections.filter(s => s.room_code && s.meeting_pattern?.start);
  
  return {
    coursesCount: mockCourses.length,
    sectionsCount: mockSections.length,
    roomsCount: mockRooms.length,
    instructorsCount: mockInstructors.length,
    groupsCount: mockStudentGroups.length,
    draftSectionsCount: draftSections.length,
    releasedSectionsCount: releasedSections.length,
    assignedSectionsCount: assignedSections.length,
    unassignedSectionsCount: draftSections.length - assignedSections.length,
  };
}

/**
 * Get schedule status for generator
 */
export async function getMockScheduleStatus(): Promise<{
  draft: {
    total: number;
    assigned: number;
    unassigned: number;
  };
  released: {
    total: number;
  };
}> {
  await delay(100);
  const stats = await getMockSchedulingStats();
  
  return {
    draft: {
      total: stats.draftSectionsCount,
      assigned: stats.assignedSectionsCount,
      unassigned: stats.unassignedSectionsCount,
    },
    released: {
      total: stats.releasedSectionsCount,
    },
  };
}

/**
 * Get time grid configuration
 */
export async function getMockTimeGridConfig(): Promise<any> {
  await delay(100);
  
  return {
    id: 'config-001',
    teaching_days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    daily_start_time: '08:00:00',
    daily_end_time: '18:00:00',
    slot_duration_minutes: 90,
    break_start_time: '12:00:00',
    break_end_time: '13:00:00',
    exam_days: ['Saturday', 'Sunday'],
    exam_start_time: '09:00:00',
    exam_end_time: '17:00:00',
    typical_lab_duration_minutes: 120,
  };
}

/**
 * Get dashboard statistics for charts
 */
export async function getMockDashboardStats(): Promise<any> {
  await delay(200);
  
  // Calculate enrollment stats by level
  const enrollmentsByLevel: Record<number, number> = {};
  mockEnrollments.forEach(enrollment => {
    const section = mockSections.find(s => s.id === enrollment.section_id);
    if (section) {
      enrollmentsByLevel[section.group_level] = (enrollmentsByLevel[section.group_level] || 0) + 1;
    }
  });
  
  // Calculate room utilization
  const roomUtilization = mockRooms.map(room => {
    const sectionsInRoom = mockSections.filter(s => s.room_code === room.code);
    return {
      room: room.code,
      used: sectionsInRoom.length,
      total: 20, // Assume 20 time slots per week
      utilization: (sectionsInRoom.length / 20) * 100,
    };
  });
  
  // Calculate instructor workload
  const instructorWorkload = mockInstructors.map(instructor => {
    const sections = mockSections.filter(s => s.instructor_id === instructor.id);
    return {
      id: instructor.id,
      name: instructor.name,
      sections: sections.length,
      maxLoad: instructor.max_load_per_week || 12,
      utilization: ((sections.length / (instructor.max_load_per_week || 12)) * 100),
    };
  });
  
  // Calculate time slot distribution
  const timeSlotDistribution: Record<string, number> = {};
  mockSections.forEach(section => {
    const time = section.meeting_pattern.start;
    timeSlotDistribution[time] = (timeSlotDistribution[time] || 0) + 1;
  });
  
  // Calculate elective enrollment stats
  const electiveEnrollments = mockEnrollments.filter(e => {
    const section = mockSections.find(s => s.id === e.section_id);
    if (!section) return false;
    const course = mockCourses.find(c => c.code === section.course_code);
    return course?.is_elective;
  });
  
  const electiveStats = mockCourses
    .filter(c => c.is_elective)
    .map(course => {
      const sections = mockSections.filter(s => s.course_code === course.code);
      const enrollments = sections.reduce((sum, section) => {
        return sum + mockEnrollments.filter(e => e.section_id === section.id && e.status === 'registered').length;
      }, 0);
      return {
        course_code: course.code,
        course_title: course.title,
        sections: sections.length,
        enrollments: enrollments,
        capacity: sections.reduce((sum, s) => sum + s.capacity, 0),
      };
    });
  
  return {
    enrollments: {
      byLevel: Object.entries(enrollmentsByLevel).map(([level, count]) => ({
        level: parseInt(level),
        count,
      })),
      total: mockEnrollments.filter(e => e.status === 'registered').length,
    },
    rooms: {
      utilization: roomUtilization,
      total: mockRooms.length,
      used: new Set(mockSections.map(s => s.room_code).filter(Boolean)).size,
    },
    workload: {
      instructors: instructorWorkload,
      average: instructorWorkload.reduce((sum, i) => sum + i.sections, 0) / instructorWorkload.length,
    },
    timeslots: {
      distribution: Object.entries(timeSlotDistribution).map(([time, count]) => ({
        time,
        count,
      })),
    },
    electives: {
      courses: electiveStats,
      totalEnrollments: electiveEnrollments.length,
    },
    progress: {
      totalSections: mockSections.length,
      assigned: mockSections.filter(s => s.room_code && s.meeting_pattern?.start).length,
      unassigned: mockSections.filter(s => !s.room_code || !s.meeting_pattern?.start).length,
    },
  };
}

