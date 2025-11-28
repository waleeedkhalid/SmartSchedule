/**
 * Irregular Students Fixtures
 * Students with special scheduling requirements (missing courses, etc.)
 */

import type { Database } from '../../src/types/test-schema';
import { CURRENT_TERM } from './academic-term.fixture';
import { TEST_USERS } from './users.fixture';

type IrregularStudent = Database['public']['Tables']['irregular_students']['Row'];

// Generate test UUIDs
const generateIrregularUUID = (index: number): string => {
  return `irregular-${String(index).padStart(4, '0')}-0000-0000-000000000000`;
};

// =====================================================
// IRREGULAR STUDENTS
// =====================================================

export const IRREGULAR_STUDENTS: IrregularStudent[] = [
  {
    id: generateIrregularUUID(1),
    student_id: TEST_USERS.students[5].id, // Student 2-1 (level 2, missing level 1 course)
    term_code: CURRENT_TERM.code,
    reason: 'Failed SWE102 in previous term',
    courses_needed: ['SWE102'], // Must take SWE102 from level 1
    status: 'pending',
    reported_by: TEST_USERS.quickRef.committee.registrar.id,
    notified_at: null,
    resolved_at: null,
    notes: 'Needs SWE102 to proceed with level 2 courses. Must be accommodated in schedule.',
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-09-01T10:00:00Z',
  },
  {
    id: generateIrregularUUID(2),
    student_id: TEST_USERS.students[11].id, // Student 3-2 (level 3, missing level 2 course)
    term_code: CURRENT_TERM.code,
    reason: 'Failed SWE201 in previous term',
    courses_needed: ['SWE201'], // Must take SWE201 from level 2
    status: 'notified',
    reported_by: TEST_USERS.quickRef.committee.registrar.id,
    notified_at: '2025-09-05T14:00:00Z',
    resolved_at: null,
    notes: 'Student notified. Scheduled for SWE201-02 section.',
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-09-05T14:00:00Z',
  },
  {
    id: generateIrregularUUID(3),
    student_id: TEST_USERS.students[17].id, // Student 4-3 (level 4, missing multiple courses)
    term_code: CURRENT_TERM.code,
    reason: 'Transfer student - missing prerequisites',
    courses_needed: ['SWE201', 'SWE301'], // Needs 2 courses from previous levels
    status: 'pending',
    reported_by: TEST_USERS.quickRef.committee.registrar.id,
    notified_at: null,
    resolved_at: null,
    notes: 'Transfer student needs to catch up on core courses before taking level 4 courses.',
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-09-01T10:00:00Z',
  },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getIrregularStudentById = (id: string): IrregularStudent | undefined => {
  return IRREGULAR_STUDENTS.find(s => s.id === id);
};

export const getIrregularStudentsByStatus = (status: IrregularStudent['status']): IrregularStudent[] => {
  return IRREGULAR_STUDENTS.filter(s => s.status === status);
};

export const getIrregularStudentByStudentId = (studentId: string): IrregularStudent | undefined => {
  return IRREGULAR_STUDENTS.find(s => s.student_id === studentId);
};

export const getIrregularStudentsByCourse = (courseCode: string): IrregularStudent[] => {
  return IRREGULAR_STUDENTS.filter(s => s.courses_needed.includes(courseCode));
};

// =====================================================
// STATISTICS
// =====================================================

export const getIrregularStudentsStatistics = () => {
  return {
    total: IRREGULAR_STUDENTS.length,
    by_status: {
      pending: getIrregularStudentsByStatus('pending').length,
      notified: getIrregularStudentsByStatus('notified').length,
      resolved: getIrregularStudentsByStatus('resolved').length,
      cancelled: getIrregularStudentsByStatus('cancelled').length,
    },
    total_courses_needed: IRREGULAR_STUDENTS.reduce((sum, s) => sum + s.courses_needed.length, 0),
    avg_courses_per_student: (
      IRREGULAR_STUDENTS.reduce((sum, s) => sum + s.courses_needed.length, 0) / IRREGULAR_STUDENTS.length
    ).toFixed(2),
  };
};

// Export for easy access
export const TEST_IRREGULAR_STUDENT_DATA = {
  all: IRREGULAR_STUDENTS,
  helpers: {
    getById: getIrregularStudentById,
    getByStatus: getIrregularStudentsByStatus,
    getByStudentId: getIrregularStudentByStudentId,
    getByCourse: getIrregularStudentsByCourse,
    getStatistics: getIrregularStudentsStatistics,
  },
};


