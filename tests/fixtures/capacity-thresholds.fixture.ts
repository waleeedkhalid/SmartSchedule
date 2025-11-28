/**
 * Capacity Thresholds Fixtures
 * Registrar-managed capacity increase thresholds for SWE courses
 */

import type { Database } from '../../src/types/test-schema';
import { CURRENT_TERM } from './academic-term.fixture';
import { TEST_USERS } from './users.fixture';

type CapacityThreshold = Database['public']['Tables']['capacity_thresholds']['Row'];

const generateThresholdUUID = (index: number): string => {
  return `threshold-${String(index).padStart(4, '0')}-0000-0000-000000000000`;
};

export const CAPACITY_THRESHOLDS: CapacityThreshold[] = [
  {
    id: generateThresholdUUID(1),
    course_code: 'SWE101',
    term_code: CURRENT_TERM.code,
    base_capacity: 25,
    threshold_percentage: 10, // Can increase by 10% (2-3 seats)
    is_swe_course: true,
    updated_by: TEST_USERS.quickRef.committee.registrar.id,
    max_capacity_override: 30,
    current_utilization: 92.0, // 23/25
    threshold_reached: true,
    last_checked_at: '2025-10-15T10:00:00Z',
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-10-15T10:00:00Z',
  },
  {
    id: generateThresholdUUID(2),
    course_code: 'SWE102',
    term_code: CURRENT_TERM.code,
    base_capacity: 25,
    threshold_percentage: 10,
    is_swe_course: true,
    updated_by: TEST_USERS.quickRef.committee.registrar.id,
    max_capacity_override: 30,
    current_utilization: 80.0,
    threshold_reached: false,
    last_checked_at: '2025-10-15T10:00:00Z',
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-10-15T10:00:00Z',
  },
  {
    id: generateThresholdUUID(3),
    course_code: 'SWE201',
    term_code: CURRENT_TERM.code,
    base_capacity: 20,
    threshold_percentage: 15, // Can increase by 15% (3 seats)
    is_swe_course: true,
    updated_by: TEST_USERS.quickRef.committee.registrar.id,
    max_capacity_override: 25,
    current_utilization: 95.0,
    threshold_reached: true,
    last_checked_at: '2025-10-15T10:00:00Z',
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-10-15T10:00:00Z',
  },
  {
    id: generateThresholdUUID(4),
    course_code: 'SWE301',
    term_code: CURRENT_TERM.code,
    base_capacity: 20,
    threshold_percentage: 15,
    is_swe_course: true,
    updated_by: TEST_USERS.quickRef.committee.registrar.id,
    max_capacity_override: 25,
    current_utilization: 75.0,
    threshold_reached: false,
    last_checked_at: '2025-10-15T10:00:00Z',
    created_at: '2025-09-01T10:00:00Z',
    updated_at: '2025-10-15T10:00:00Z',
  },
];

export const TEST_CAPACITY_THRESHOLD_DATA = {
  all: CAPACITY_THRESHOLDS,
  helpers: {
    getByCourse: (courseCode: string) => CAPACITY_THRESHOLDS.find(t => t.course_code === courseCode),
    getThresholdReached: () => CAPACITY_THRESHOLDS.filter(t => t.threshold_reached),
    getStatistics: () => ({
      total: CAPACITY_THRESHOLDS.length,
      threshold_reached: CAPACITY_THRESHOLDS.filter(t => t.threshold_reached).length,
      avg_utilization: (CAPACITY_THRESHOLDS.reduce((sum, t) => sum + t.current_utilization, 0) / CAPACITY_THRESHOLDS.length).toFixed(2),
    }),
  },
};


