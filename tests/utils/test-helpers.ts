/**
 * Test Helpers
 * Setup, teardown, and utility functions for testing
 */

import { createTestClient } from './test-supabase-client';
import {
  loadFixturesToDatabase,
  clearFixturesFromDatabase,
  TEST_FIXTURES,
} from '../fixtures';

// =====================================================
// TEST ENVIRONMENT SETUP
// =====================================================

/**
 * Sets up the test environment with all fixtures
 * Call this in beforeAll() or beforeEach()
 */
export async function setupTestEnvironment() {
  const supabase = createTestClient();
  
  // Clear any existing test data
  await clearFixturesFromDatabase(supabase);
  
  // Load fresh fixtures
  const results = await loadFixturesToDatabase(supabase);
  
  if (results.errors.length > 0) {
    throw new Error(`Failed to load fixtures: ${results.errors.join(', ')}`);
  }
  
  return {
    supabase,
    fixtures: TEST_FIXTURES,
    results,
  };
}

/**
 * Cleans up the test environment
 * Call this in afterAll() or afterEach()
 */
export async function cleanupTestEnvironment() {
  const supabase = createTestClient();
  const results = await clearFixturesFromDatabase(supabase);
  
  if (results.errors.length > 0) {
    console.warn(`Cleanup warnings: ${results.errors.join(', ')}`);
  }
  
  return results;
}

// =====================================================
// TEST DATA HELPERS
// =====================================================

/**
 * Get a test user by role
 */
export function getTestUser(role: 'student' | 'faculty' | 'committee' | 'registrar', index: number = 0) {
  switch (role) {
    case 'student':
      return TEST_FIXTURES.users.students[index];
    case 'faculty':
      return TEST_FIXTURES.users.faculty[index];
    case 'committee':
      return TEST_FIXTURES.users.schedulingCommittee[index];
    case 'registrar':
      return TEST_FIXTURES.users.registrar[index];
    default:
      throw new Error(`Invalid role: ${role}`);
  }
}

/**
 * Get current active term
 */
export function getCurrentTerm() {
  return TEST_FIXTURES.terms.current;
}

/**
 * Get sections for a specific course
 */
export function getCourseSections(courseCode: string) {
  return TEST_FIXTURES.sections.helpers.getByCourse(courseCode);
}

/**
 * Get schedule for a student
 */
export function getStudentSchedule(studentId: string, version: number = 2) {
  return TEST_FIXTURES.schedules.helpers.getByStudent(studentId, version);
}

// =====================================================
// AUTHENTICATION HELPERS
// =====================================================

/**
 * Mock authenticated user for testing
 */
export function mockAuthUser(userId: string) {
  // This would integrate with your auth mocking strategy
  return {
    id: userId,
    aud: 'authenticated',
    role: 'authenticated',
    email: TEST_FIXTURES.users.all.find(u => u.id === userId)?.email,
  };
}

/**
 * Authenticate as a specific user for testing
 * Sets up the auth session to simulate logged-in user
 */
export async function authenticateAs(user: { id: string; email?: string }) {
  const supabase = createTestClient();
  
  // In a real test environment, you would mock the auth state
  // For now, we'll create a mock session object
  // This should be adapted based on your actual auth mocking setup
  
  // Note: This is a simplified version. In a real test environment,
  // you would use Supabase's test helpers or mock the auth.getUser() method
  const mockSession = {
    user: {
      id: user.id,
      email: user.email || 'test@example.com',
      aud: 'authenticated',
      role: 'authenticated',
    },
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
  };
  
  // Store the mock session for use in tests
  // In a real implementation, you'd integrate with vi.mock or similar
  return mockSession;
}

/**
 * Teardown test environment
 * Alias for cleanupTestEnvironment for consistency with test naming
 */
export async function teardown() {
  return await cleanupTestEnvironment();
}

// =====================================================
// ASSERTION HELPERS
// =====================================================

/**
 * Assert schedule has no conflicts
 */
export function assertNoScheduleConflicts(schedule: any) {
  expect(schedule.data.validation.has_conflicts).toBe(false);
  expect(schedule.data.validation.conflicts).toHaveLength(0);
}

/**
 * Assert schedule meets minimum requirements
 */
export function assertScheduleValid(schedule: any, minCourses: number = 1) {
  expect(schedule.data.sections).toBeDefined();
  expect(schedule.data.sections.length).toBeGreaterThanOrEqual(minCourses);
  expect(schedule.data.statistics).toBeDefined();
  assertNoScheduleConflicts(schedule);
}

/**
 * Assert change request validation
 */
export function assertChangeRequestValid(request: any) {
  expect(request.validation_status).not.toBe('INVALID');
  expect(request.validation_error).toBeNull();
  expect(request.affects_irregular_students).toBe(false);
}

// =====================================================
// TIME HELPERS
// =====================================================

/**
 * Check if two time slots overlap
 */
export function timeSlotsOverlap(
  slot1: { day: string; start: string; end: string },
  slot2: { day: string; start: string; end: string }
): boolean {
  if (slot1.day !== slot2.day) return false;
  
  const start1 = parseTime(slot1.start);
  const end1 = parseTime(slot1.end);
  const start2 = parseTime(slot2.start);
  const end2 = parseTime(slot2.end);
  
  return start1 < end2 && start2 < end1;
}

/**
 * Parse time string to minutes since midnight
 */
function parseTime(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Format minutes to HH:MM
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

// =====================================================
// STATISTICS HELPERS
// =====================================================

/**
 * Calculate schedule utilization
 */
export function calculateScheduleUtilization(sections: any[]) {
  const totalCapacity = sections.reduce((sum, s) => sum + s.capacity, 0);
  const totalEnrolled = sections.reduce((sum, s) => sum + s.enrolled_count, 0);
  return totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0;
}

/**
 * Calculate faculty load distribution
 */
export function calculateFacultyLoad(sections: any[]) {
  const loadByFaculty = sections.reduce((acc, section) => {
    const instructorId = section.instructor_id;
    if (!instructorId) return acc;
    
    acc[instructorId] = (acc[instructorId] || 0) + section.credits;
    return acc;
  }, {} as Record<string, number>);
  
  const loads = Object.values(loadByFaculty);
  const avgLoad = loads.reduce((sum, load) => sum + load, 0) / loads.length;
  const maxLoad = Math.max(...loads);
  const minLoad = Math.min(...loads);
  const variance = loads.reduce((sum, load) => sum + Math.pow(load - avgLoad, 2), 0) / loads.length;
  
  return {
    loadByFaculty,
    avgLoad,
    maxLoad,
    minLoad,
    variance: Math.sqrt(variance),
  };
}

// =====================================================
// VALIDATION HELPERS
// =====================================================

/**
 * Validate that all foreign keys are satisfied
 */
export async function validateForeignKeys(supabase: any) {
  const checks = [
    // Sections reference courses
    `SELECT s.id FROM section s LEFT JOIN course c ON s.course_code = c.code WHERE c.code IS NULL`,
    // Sections reference rooms
    `SELECT s.id FROM section s LEFT JOIN room r ON s.room_number = r.number WHERE s.room_number IS NOT NULL AND r.number IS NULL`,
    // Section times reference sections
    `SELECT st.id FROM section_time st LEFT JOIN section s ON st.section_id = s.id WHERE s.id IS NULL`,
    // Schedules reference students
    `SELECT sch.id FROM schedules sch LEFT JOIN users u ON sch.student_id = u.id WHERE u.id IS NULL`,
  ];
  
  const results = [];
  for (const check of checks) {
    const { data, error } = await supabase.rpc('execute_sql', { query: check });
    if (error) {
      results.push({ check, error: error.message });
    } else if (data && data.length > 0) {
      results.push({ check, orphaned: data.length });
    }
  }
  
  return results;
}

// =====================================================
// SNAPSHOT HELPERS
// =====================================================

/**
 * Create a snapshot of current database state
 */
export async function createDatabaseSnapshot(supabase: any) {
  const tables = [
    'users', 'academic_term', 'room', 'course', 'section', 'section_time',
    'elective_preferences', 'faculty_availability', 'scheduling_rules',
    'schedule_versions', 'schedules', 'irregular_students',
    'capacity_thresholds', 'feedback', 'teaching_load_change_requests',
  ];
  
  const snapshot: Record<string, any[]> = {};
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*');
    if (!error && data) {
      snapshot[table] = data;
    }
  }
  
  return snapshot;
}

/**
 * Compare two database snapshots
 */
export function compareSnapshots(before: any, after: any) {
  const changes: Record<string, { added: number; removed: number; modified: number }> = {};
  
  for (const table in before) {
    const beforeIds = new Set(before[table].map((r: any) => r.id));
    const afterIds = new Set(after[table]?.map((r: any) => r.id) || []);
    
    const added = afterIds.size - beforeIds.size;
    const removed = beforeIds.size - afterIds.size;
    
    changes[table] = {
      added: Math.max(0, added),
      removed: Math.max(0, removed),
      modified: 0, // Simplified - would need deep comparison
    };
  }
  
  return changes;
}

// =====================================================
// EXPORTS
// =====================================================

export const testHelpers = {
  setup: setupTestEnvironment,
  cleanup: cleanupTestEnvironment,
  teardown, // Alias for cleanup
  getTestUser,
  getCurrentTerm,
  getCourseSections,
  getStudentSchedule,
  mockAuthUser,
  authenticateAs,
  assertNoScheduleConflicts,
  assertScheduleValid,
  assertChangeRequestValid,
  timeSlotsOverlap,
  formatTime,
  calculateScheduleUtilization,
  calculateFacultyLoad,
  validateForeignKeys,
  createDatabaseSnapshot,
  compareSnapshots,
};

export default testHelpers;


