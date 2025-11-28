/**
 * Elective Preferences Fixtures
 * Student preferences for elective courses (ranked 1-5)
 */

import { TEST_USERS } from './users.fixture';
import { TEST_COURSES } from './courses.fixture';
import { TEST_TERM_CODE } from './sections.fixture';

export interface TestElectivePreference {
  id: string;
  student_id: string;
  course_code: string;
  term_code: string;
  preference_order: number; // 1-5 (1 = highest priority)
  status: 'pending' | 'approved' | 'rejected' | 'assigned';
  submitted_at: string | null;
}

// =====================================================
// GENERATE PREFERENCES FOR ALL STUDENTS
// =====================================================
export const createTestPreferences = (): TestElectivePreference[] => {
  const preferences: TestElectivePreference[] = [];
  const students = TEST_USERS.students;
  const electives = TEST_COURSES.electives;
  
  // Each student submits 3-5 preferences
  students.forEach((student, index) => {
    const numPrefs = 3 + (index % 3); // 3, 4, or 5 preferences
    
    for (let i = 0; i < numPrefs; i++) {
      // Most students prefer SWE401 (Machine Learning)
      // This creates realistic preference distribution
      const courseIndex = i % electives.length;
      
      preferences.push({
        id: `pref-${student.id}-${i + 1}`,
        student_id: student.id,
        course_code: electives[courseIndex].code,
        term_code: TEST_TERM_CODE,
        preference_order: i + 1,
        status: 'pending',
        submitted_at: '2024-10-01T10:00:00Z',
      });
    }
  });
  
  return preferences;
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getPreferencesByStudent = (studentId: string): TestElectivePreference[] => {
  return createTestPreferences().filter((p) => p.student_id === studentId);
};

export const getPreferencesByCourse = (courseCode: string): TestElectivePreference[] => {
  return createTestPreferences().filter((p) => p.course_code === courseCode);
};

export const getSubmittedPreferences = (): TestElectivePreference[] => {
  return createTestPreferences().filter((p) => p.submitted_at !== null);
};

export const getPreferencesByStatus = (status: TestElectivePreference['status']): TestElectivePreference[] => {
  return createTestPreferences().filter((p) => p.status === status);
};

// =====================================================
// STATISTICS
// =====================================================

export const getPreferenceStatistics = () => {
  const all = createTestPreferences();
  const byStudent = TEST_USERS.students.length;
  const submitted = getSubmittedPreferences().length;
  const submissionRate = (submitted / (byStudent * 5)) * 100; // Assuming max 5 prefs per student
  
  const courseDemand = TEST_COURSES.electives.map((elective) => ({
    course_code: elective.code,
    course_name: elective.name,
    total_requests: getPreferencesByCourse(elective.code).length,
    first_choice_count: getPreferencesByCourse(elective.code).filter((p) => p.preference_order === 1).length,
  }));
  
  return {
    total_students: byStudent,
    total_preferences: all.length,
    submission_rate: submissionRate,
    average_preferences_per_student: all.length / byStudent,
    course_demand: courseDemand,
  };
};

// =====================================================
// QUICK REFERENCE
// =====================================================

export const PREFERENCES_QUICK_REF = {
  firstStudent: getPreferencesByStudent(TEST_USERS.students[0].id),
  lastStudent: getPreferencesByStudent(TEST_USERS.students[24].id),
  mlCourse: getPreferencesByCourse('SWE401'),
  submitted: getSubmittedPreferences(),
  pending: getPreferencesByStatus('pending'),
  statistics: getPreferenceStatistics(),
};

// Export for easy access
export const TEST_PREFERENCES = {
  all: createTestPreferences(),
  quickRef: PREFERENCES_QUICK_REF,
  helpers: {
    getByStudent: getPreferencesByStudent,
    getByCourse: getPreferencesByCourse,
    getSubmitted: getSubmittedPreferences,
    getByStatus: getPreferencesByStatus,
    getStatistics: getPreferenceStatistics,
  },
};

