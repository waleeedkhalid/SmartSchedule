// Mock data for demo mode - comprehensive dataset for all personas

export type DemoRole = 'student' | 'faculty' | 'scheduling' | 'teaching_load' | 'registrar';

export interface DemoCourse {
  code: string;
  title: string;
  level: number;
  credits: number;
  weekly_hours: number;
  is_elective: boolean;
}

export interface DemoSection {
  id: string;
  course_code: string;
  course_title: string;
  section_no: string;
  instructor_id: string;
  instructor_name: string;
  room_code: string;
  capacity: number;
  enrolled: number;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
    is_lab: boolean;
  };
  group_level: number;
  state: 'draft' | 'released';
}

export interface DemoRoom {
  code: string;
  type: 'Lecture' | 'Lab';
  building?: string;
}

export interface DemoInstructor {
  id: string;
  name: string;
  email: string;
  max_load_per_week: number;
  section_count: number;
}

export interface DemoExam {
  id: string;
  course_code: string;
  course_title: string;
  section_id: string;
  date: string;
  start: string;
  duration: number;
  room_codes: string[];
}

export interface DemoComment {
  id: string;
  author_name: string;
  author_role: DemoRole;
  section_id: string | null;
  section_label: string | null;
  comment_text: string;
  is_resolved: boolean;
  created_at: string;
}

export interface DemoNotification {
  id: string;
  type: string;
  message: string;
  created_at: string;
  read: boolean;
}

// Mock Courses
export const mockCourses: DemoCourse[] = [
  // Level 4 Required
  { code: 'SWE401', title: 'Software Architecture', level: 4, credits: 3, weekly_hours: 3, is_elective: false },
  { code: 'SWE402', title: 'Database Systems', level: 4, credits: 3, weekly_hours: 3, is_elective: false },
  { code: 'SWE403', title: 'Web Development', level: 4, credits: 3, weekly_hours: 3, is_elective: false },
  
  // Level 5 Required
  { code: 'SWE501', title: 'Software Testing', level: 5, credits: 3, weekly_hours: 3, is_elective: false },
  { code: 'SWE502', title: 'Mobile Development', level: 5, credits: 3, weekly_hours: 3, is_elective: false },
  
  // Level 6 Required
  { code: 'SWE601', title: 'DevOps & CI/CD', level: 6, credits: 3, weekly_hours: 3, is_elective: false },
  { code: 'SWE602', title: 'Cloud Computing', level: 6, credits: 3, weekly_hours: 3, is_elective: false },
  
  // Level 7 Required
  { code: 'SWE701', title: 'Software Project Management', level: 7, credits: 3, weekly_hours: 3, is_elective: false },
  
  // Level 8 Required
  { code: 'SWE801', title: 'Capstone Project', level: 8, credits: 6, weekly_hours: 6, is_elective: false },
  
  // Electives
  { code: 'SWE410', title: 'Machine Learning Applications', level: 4, credits: 3, weekly_hours: 3, is_elective: true },
  { code: 'SWE411', title: 'Cybersecurity Fundamentals', level: 4, credits: 3, weekly_hours: 3, is_elective: true },
  { code: 'SWE510', title: 'Data Science', level: 5, credits: 3, weekly_hours: 3, is_elective: true },
  { code: 'SWE511', title: 'Game Development', level: 5, credits: 3, weekly_hours: 3, is_elective: true },
  { code: 'SWE610', title: 'Blockchain Technology', level: 6, credits: 3, weekly_hours: 3, is_elective: true },
  { code: 'SWE611', title: 'IoT Systems', level: 6, credits: 3, weekly_hours: 3, is_elective: true },
];

// Mock Instructors
export const mockInstructors: DemoInstructor[] = [
  { id: 'inst-1', name: 'Dr. Sarah Ahmed', email: 'sarah.ahmed@university.edu', max_load_per_week: 12, section_count: 3 },
  { id: 'inst-2', name: 'Prof. Mohammed Ali', email: 'mohammed.ali@university.edu', max_load_per_week: 12, section_count: 4 },
  { id: 'inst-3', name: 'Dr. Fatima Hassan', email: 'fatima.hassan@university.edu', max_load_per_week: 10, section_count: 2 },
  { id: 'inst-4', name: 'Dr. Omar Khalil', email: 'omar.khalil@university.edu', max_load_per_week: 12, section_count: 3 },
  { id: 'inst-5', name: 'Prof. Layla Ibrahim', email: 'layla.ibrahim@university.edu', max_load_per_week: 12, section_count: 3 },
  { id: 'inst-6', name: 'Dr. Youssef Mansour', email: 'youssef.mansour@university.edu', max_load_per_week: 10, section_count: 2 },
];

// Mock Rooms
export const mockRooms: DemoRoom[] = [
  { code: 'A101', type: 'Lecture', building: 'Building A' },
  { code: 'A102', type: 'Lecture', building: 'Building A' },
  { code: 'A103', type: 'Lecture', building: 'Building A' },
  { code: 'B201', type: 'Lecture', building: 'Building B' },
  { code: 'B202', type: 'Lecture', building: 'Building B' },
  { code: 'LAB1', type: 'Lab', building: 'Lab Building' },
  { code: 'LAB2', type: 'Lab', building: 'Lab Building' },
  { code: 'LAB3', type: 'Lab', building: 'Lab Building' },
];

// Mock Sections
export const mockSections: DemoSection[] = [
  // SWE401 - Software Architecture
  {
    id: 'sec-1',
    course_code: 'SWE401',
    course_title: 'Software Architecture',
    section_no: '01',
    instructor_id: 'inst-1',
    instructor_name: 'Dr. Sarah Ahmed',
    room_code: 'A101',
    capacity: 40,
    enrolled: 35,
    meeting_pattern: { days: ['Sunday', 'Tuesday'], start: '08:00', duration: 90, is_lab: false },
    group_level: 4,
    state: 'released',
  },
  {
    id: 'sec-2',
    course_code: 'SWE401',
    course_title: 'Software Architecture',
    section_no: '02',
    instructor_id: 'inst-1',
    instructor_name: 'Dr. Sarah Ahmed',
    room_code: 'A102',
    capacity: 40,
    enrolled: 38,
    meeting_pattern: { days: ['Monday', 'Wednesday'], start: '10:00', duration: 90, is_lab: false },
    group_level: 4,
    state: 'released',
  },
  
  // SWE402 - Database Systems
  {
    id: 'sec-3',
    course_code: 'SWE402',
    course_title: 'Database Systems',
    section_no: '01',
    instructor_id: 'inst-2',
    instructor_name: 'Prof. Mohammed Ali',
    room_code: 'B201',
    capacity: 35,
    enrolled: 32,
    meeting_pattern: { days: ['Sunday', 'Tuesday'], start: '10:00', duration: 90, is_lab: false },
    group_level: 4,
    state: 'released',
  },
  {
    id: 'sec-4',
    course_code: 'SWE402',
    course_title: 'Database Systems',
    section_no: '02',
    instructor_id: 'inst-2',
    instructor_name: 'Prof. Mohammed Ali',
    room_code: 'LAB1',
    capacity: 30,
    enrolled: 28,
    meeting_pattern: { days: ['Monday', 'Wednesday'], start: '13:00', duration: 120, is_lab: true },
    group_level: 4,
    state: 'released',
  },
  
  // SWE403 - Web Development
  {
    id: 'sec-5',
    course_code: 'SWE403',
    course_title: 'Web Development',
    section_no: '01',
    instructor_id: 'inst-3',
    instructor_name: 'Dr. Fatima Hassan',
    room_code: 'LAB2',
    capacity: 30,
    enrolled: 30,
    meeting_pattern: { days: ['Sunday', 'Tuesday'], start: '13:00', duration: 120, is_lab: true },
    group_level: 4,
    state: 'released',
  },
  
  // SWE501 - Software Testing
  {
    id: 'sec-6',
    course_code: 'SWE501',
    course_title: 'Software Testing',
    section_no: '01',
    instructor_id: 'inst-4',
    instructor_name: 'Dr. Omar Khalil',
    room_code: 'A103',
    capacity: 40,
    enrolled: 36,
    meeting_pattern: { days: ['Monday', 'Wednesday'], start: '08:00', duration: 90, is_lab: false },
    group_level: 5,
    state: 'released',
  },
  
  // SWE502 - Mobile Development
  {
    id: 'sec-7',
    course_code: 'SWE502',
    course_title: 'Mobile Development',
    section_no: '01',
    instructor_id: 'inst-4',
    instructor_name: 'Dr. Omar Khalil',
    room_code: 'LAB3',
    capacity: 30,
    enrolled: 29,
    meeting_pattern: { days: ['Sunday', 'Tuesday'], start: '15:30', duration: 120, is_lab: true },
    group_level: 5,
    state: 'released',
  },
  
  // SWE601 - DevOps
  {
    id: 'sec-8',
    course_code: 'SWE601',
    course_title: 'DevOps & CI/CD',
    section_no: '01',
    instructor_id: 'inst-5',
    instructor_name: 'Prof. Layla Ibrahim',
    room_code: 'B202',
    capacity: 35,
    enrolled: 30,
    meeting_pattern: { days: ['Monday', 'Wednesday'], start: '15:30', duration: 90, is_lab: false },
    group_level: 6,
    state: 'released',
  },
  
  // SWE602 - Cloud Computing
  {
    id: 'sec-9',
    course_code: 'SWE602',
    course_title: 'Cloud Computing',
    section_no: '01',
    instructor_id: 'inst-5',
    instructor_name: 'Prof. Layla Ibrahim',
    room_code: 'A101',
    capacity: 35,
    enrolled: 28,
    meeting_pattern: { days: ['Sunday', 'Tuesday'], start: '17:30', duration: 90, is_lab: false },
    group_level: 6,
    state: 'released',
  },
  
  // Elective Sections
  {
    id: 'sec-10',
    course_code: 'SWE410',
    course_title: 'Machine Learning Applications',
    section_no: '01',
    instructor_id: 'inst-6',
    instructor_name: 'Dr. Youssef Mansour',
    room_code: 'A102',
    capacity: 30,
    enrolled: 22,
    meeting_pattern: { days: ['Sunday', 'Tuesday'], start: '11:45', duration: 90, is_lab: false },
    group_level: 4,
    state: 'released',
  },
  {
    id: 'sec-11',
    course_code: 'SWE411',
    course_title: 'Cybersecurity Fundamentals',
    section_no: '01',
    instructor_id: 'inst-6',
    instructor_name: 'Dr. Youssef Mansour',
    room_code: 'A103',
    capacity: 30,
    enrolled: 18,
    meeting_pattern: { days: ['Monday', 'Wednesday'], start: '11:45', duration: 90, is_lab: false },
    group_level: 4,
    state: 'released',
  },
  {
    id: 'sec-12',
    course_code: 'SWE510',
    course_title: 'Data Science',
    section_no: '01',
    instructor_id: 'inst-3',
    instructor_name: 'Dr. Fatima Hassan',
    room_code: 'LAB1',
    capacity: 25,
    enrolled: 20,
    meeting_pattern: { days: ['Sunday', 'Tuesday'], start: '15:30', duration: 120, is_lab: true },
    group_level: 5,
    state: 'released',
  },
];

// Mock Exams
export const mockExams: DemoExam[] = [
  {
    id: 'exam-1',
    course_code: 'SWE401',
    course_title: 'Software Architecture',
    section_id: 'sec-1',
    date: '2025-12-15',
    start: '09:00',
    duration: 180,
    room_codes: ['A101', 'A102'],
  },
  {
    id: 'exam-2',
    course_code: 'SWE402',
    course_title: 'Database Systems',
    section_id: 'sec-3',
    date: '2025-12-17',
    start: '09:00',
    duration: 180,
    room_codes: ['B201', 'B202'],
  },
  {
    id: 'exam-3',
    course_code: 'SWE403',
    course_title: 'Web Development',
    section_id: 'sec-5',
    date: '2025-12-19',
    start: '13:00',
    duration: 180,
    room_codes: ['LAB2', 'LAB3'],
  },
  {
    id: 'exam-4',
    course_code: 'SWE501',
    course_title: 'Software Testing',
    section_id: 'sec-6',
    date: '2025-12-16',
    start: '09:00',
    duration: 180,
    room_codes: ['A103'],
  },
  {
    id: 'exam-5',
    course_code: 'SWE410',
    course_title: 'Machine Learning Applications',
    section_id: 'sec-10',
    date: '2025-12-18',
    start: '13:00',
    duration: 180,
    room_codes: ['A102'],
  },
];

// Mock Comments
export const mockComments: DemoComment[] = [
  {
    id: 'comment-1',
    author_name: 'Dr. Sarah Ahmed',
    author_role: 'faculty',
    section_id: 'sec-1',
    section_label: 'SWE401-01',
    comment_text: 'Room A101 has limited seating capacity. Considering the enrollment numbers, we might need a larger room.',
    is_resolved: false,
    created_at: '2025-10-25T10:30:00Z',
  },
  {
    id: 'comment-2',
    author_name: 'Ahmed Khaled',
    author_role: 'student',
    section_id: 'sec-10',
    section_label: 'SWE410-01',
    comment_text: 'Really excited about this Machine Learning elective! Great time slot too.',
    is_resolved: true,
    created_at: '2025-10-24T14:20:00Z',
  },
  {
    id: 'comment-3',
    author_name: 'Prof. Mohammed Ali',
    author_role: 'faculty',
    section_id: null,
    section_label: null,
    comment_text: 'Overall schedule looks good. The time gaps between sections are adequate for transitions.',
    is_resolved: true,
    created_at: '2025-10-23T09:15:00Z',
  },
  {
    id: 'comment-4',
    author_name: 'Mariam Hassan',
    author_role: 'student',
    section_id: 'sec-5',
    section_label: 'SWE403-01',
    comment_text: 'The Web Development lab sessions are very practical and hands-on. Thank you!',
    is_resolved: true,
    created_at: '2025-10-22T16:45:00Z',
  },
  {
    id: 'comment-5',
    author_name: 'Dr. Omar Khalil',
    author_role: 'faculty',
    section_id: 'sec-6',
    section_label: 'SWE501-01',
    comment_text: 'The Monday/Wednesday 8 AM slot works perfectly for this course.',
    is_resolved: true,
    created_at: '2025-10-21T11:00:00Z',
  },
];

// Mock Notifications
export const mockNotifications: DemoNotification[] = [
  {
    id: 'notif-1',
    type: 'schedule_update',
    message: 'SWE401 Section 01 room changed to A101',
    created_at: '2025-10-28T09:00:00Z',
    read: false,
  },
  {
    id: 'notif-2',
    type: 'comment_reply',
    message: 'Scheduling Committee replied to your comment on SWE410-01',
    created_at: '2025-10-27T14:30:00Z',
    read: false,
  },
  {
    id: 'notif-3',
    type: 'exam_scheduled',
    message: 'Final exam for SWE401 has been scheduled',
    created_at: '2025-10-26T10:15:00Z',
    read: true,
  },
  {
    id: 'notif-4',
    type: 'registration_opened',
    message: 'Elective registration is now open',
    created_at: '2025-10-25T08:00:00Z',
    read: true,
  },
];

// Mock user profiles for each persona
export const mockUserProfiles = {
  student: {
    id: 'user-student',
    name: 'Ahmed Khaled',
    email: 'ahmed.khaled@student.university.edu',
    role: 'student' as DemoRole,
    level: 5,
    registeredSections: ['sec-6', 'sec-7', 'sec-12'], // Required courses + one elective
    totalCredits: 9,
  },
  faculty: {
    id: 'user-faculty',
    name: 'Dr. Sarah Ahmed',
    email: 'sarah.ahmed@university.edu',
    role: 'faculty' as DemoRole,
    instructor_id: 'inst-1',
    sections: ['sec-1', 'sec-2'],
  },
  scheduling: {
    id: 'user-scheduling',
    name: 'Dr. Hassan Mahmoud',
    email: 'hassan.mahmoud@university.edu',
    role: 'scheduling' as DemoRole,
  },
  teaching_load: {
    id: 'user-teaching-load',
    name: 'Prof. Nadia Yousef',
    email: 'nadia.yousef@university.edu',
    role: 'teaching_load' as DemoRole,
  },
  registrar: {
    id: 'user-registrar',
    name: 'Ms. Laila Karim',
    email: 'laila.karim@university.edu',
    role: 'registrar' as DemoRole,
  },
};

// Helper functions
export function getSectionsByCourse(courseCode: string): DemoSection[] {
  return mockSections.filter(s => s.course_code === courseCode);
}

export function getSectionsByInstructor(instructorId: string): DemoSection[] {
  return mockSections.filter(s => s.instructor_id === instructorId);
}

export function getExamsByStudent(studentSections: string[]): DemoExam[] {
  return mockExams.filter(e => studentSections.includes(e.section_id));
}

export function getElectiveCourses(): DemoCourse[] {
  return mockCourses.filter(c => c.is_elective);
}

export function getRequiredCoursesByLevel(level: number): DemoCourse[] {
  return mockCourses.filter(c => !c.is_elective && c.level === level);
}

// Stats for dashboards
export function getSchedulingStats() {
  return {
    totalCourses: mockCourses.length,
    totalSections: mockSections.length,
    totalRooms: mockRooms.length,
    totalInstructors: mockInstructors.length,
    releasedSections: mockSections.filter(s => s.state === 'released').length,
    draftSections: mockSections.filter(s => s.state === 'draft').length,
    averageEnrollment: Math.round(mockSections.reduce((sum, s) => sum + (s.enrolled / s.capacity * 100), 0) / mockSections.length),
  };
}

export function getTeachingLoadStats() {
  return mockInstructors.map(inst => ({
    ...inst,
    sections: getSectionsByInstructor(inst.id),
    loadPercentage: Math.round((inst.section_count / inst.max_load_per_week) * 100),
  }));
}

