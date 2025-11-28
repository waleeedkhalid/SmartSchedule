/**
 * User Fixtures
 * Creates 33 test users across all roles
 */

export interface TestUser {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'faculty' | 'scheduling_committee' | 'teaching_load_committee' | 'registrar';
  password: string; // For testing only
}

// Generate consistent UUIDs for testing
const generateTestUUID = (prefix: string, index: number): string => {
  return `${prefix}-${String(index).padStart(4, '0')}-0000-0000-000000000000`;
};

// =====================================================
// STUDENTS (25 total - 5 per level)
// =====================================================
export const createTestStudents = (): TestUser[] => {
  const students: TestUser[] = [];
  const levels = [1, 2, 3, 4, 5];
  
  levels.forEach((level) => {
    for (let i = 1; i <= 5; i++) {
      const studentNum = (level - 1) * 5 + i;
      students.push({
        id: generateTestUUID('student', studentNum),
        email: `student${studentNum}@test.edu`,
        full_name: `Student ${level}-${i}`,
        role: 'student',
        password: 'password123',
      });
    }
  });
  
  return students;
};

// =====================================================
// FACULTY (3 members)
// =====================================================
export const createTestFaculty = (): TestUser[] => {
  return [
    {
      id: generateTestUUID('faculty', 1),
      email: 'dr.ahmad@test.edu',
      full_name: 'Dr. Ahmad Al-Rashid',
      role: 'faculty',
      password: 'password123',
    },
    {
      id: generateTestUUID('faculty', 2),
      email: 'dr.fatima@test.edu',
      full_name: 'Dr. Fatima Al-Mansour',
      role: 'faculty',
      password: 'password123',
    },
    {
      id: generateTestUUID('faculty', 3),
      email: 'dr.khalid@test.edu',
      full_name: 'Dr. Khalid Al-Hassan',
      role: 'faculty',
      password: 'password123',
    },
  ];
};

// =====================================================
// SCHEDULING COMMITTEE (2 members)
// =====================================================
export const createTestSchedulingCommittee = (): TestUser[] => {
  return [
    {
      id: generateTestUUID('sched-comm', 1),
      email: 'scheduling.chair@test.edu',
      full_name: 'Dr. Sarah Al-Khalifa',
      role: 'scheduling_committee',
      password: 'password123',
    },
    {
      id: generateTestUUID('sched-comm', 2),
      email: 'scheduling.member@test.edu',
      full_name: 'Dr. Omar Al-Said',
      role: 'scheduling_committee',
      password: 'password123',
    },
  ];
};

// =====================================================
// TEACHING LOAD COMMITTEE (2 members)
// =====================================================
export const createTestTeachingLoadCommittee = (): TestUser[] => {
  return [
    {
      id: generateTestUUID('load-comm', 1),
      email: 'loadchair@test.edu',
      full_name: 'Dr. Layla Al-Amin',
      role: 'teaching_load_committee',
      password: 'password123',
    },
    {
      id: generateTestUUID('load-comm', 2),
      email: 'loadmember@test.edu',
      full_name: 'Dr. Noor Al-Din',
      role: 'teaching_load_committee',
      password: 'password123',
    },
  ];
};

// =====================================================
// REGISTRAR (1 member)
// =====================================================
export const createTestRegistrar = (): TestUser[] => {
  return [
    {
      id: generateTestUUID('registrar', 1),
      email: 'registrar@test.edu',
      full_name: 'Ms. Hanan Al-Qahtani',
      role: 'registrar',
      password: 'password123',
    },
  ];
};

// =====================================================
// ALL USERS COMBINED (33 total)
// =====================================================
export const getAllTestUsers = (): TestUser[] => {
  return [
    ...createTestStudents(),        // 25
    ...createTestFaculty(),          // 3
    ...createTestSchedulingCommittee(), // 2
    ...createTestTeachingLoadCommittee(), // 2
    ...createTestRegistrar(),        // 1
  ];
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getStudentsByLevel = (level: number): TestUser[] => {
  const students = createTestStudents();
  const startIndex = (level - 1) * 5;
  return students.slice(startIndex, startIndex + 5);
};

export const getStudentById = (id: string): TestUser | undefined => {
  return createTestStudents().find((s) => s.id === id);
};

export const getFacultyById = (id: string): TestUser | undefined => {
  return createTestFaculty().find((f) => f.id === id);
};

export const getCommitteeMemberById = (id: string): TestUser | undefined => {
  const all = [
    ...createTestSchedulingCommittee(),
    ...createTestTeachingLoadCommittee(),
    ...createTestRegistrar(),
  ];
  return all.find((u) => u.id === id);
};

// =====================================================
// QUICK REFERENCE
// =====================================================

export const QUICK_REFERENCE = {
  students: {
    level1: getStudentsByLevel(1),
    level2: getStudentsByLevel(2),
    level3: getStudentsByLevel(3),
    level4: getStudentsByLevel(4),
    level5: getStudentsByLevel(5),
    firstStudent: createTestStudents()[0],
    lastStudent: createTestStudents()[24],
  },
  faculty: {
    drAhmad: createTestFaculty()[0],
    drFatima: createTestFaculty()[1],
    drKhalid: createTestFaculty()[2],
  },
  committee: {
    schedulingChair: createTestSchedulingCommittee()[0],
    schedulingMember: createTestSchedulingCommittee()[1],
    loadChair: createTestTeachingLoadCommittee()[0],
    loadMember: createTestTeachingLoadCommittee()[1],
    registrar: createTestRegistrar()[0],
  },
};

// Export for easy access
export const TEST_USERS = {
  all: getAllTestUsers(),
  students: createTestStudents(),
  faculty: createTestFaculty(),
  schedulingCommittee: createTestSchedulingCommittee(),
  teachingLoadCommittee: createTestTeachingLoadCommittee(),
  registrar: createTestRegistrar(),
  quickRef: QUICK_REFERENCE,
};

