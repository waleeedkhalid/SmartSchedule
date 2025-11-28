/**
 * Feedback Fixtures
 * Student and faculty feedback on published schedules
 */

import type { Database } from '../../src/types/test-schema';
import { TEST_USERS } from './users.fixture';
import { SCHEDULE_VERSION_V2 } from './schedule-versions.fixture';

type Feedback = Database['public']['Tables']['feedback']['Row'];

const generateFeedbackUUID = (index: number): string => {
  return `feedback-${String(index).padStart(4, '0')}-0000-0000-000000000000`;
};

export const FEEDBACK_ITEMS: Feedback[] = [
  {
    id: generateFeedbackUUID(1),
    student_id: TEST_USERS.students[0].id,
    schedule_id: `schedule-${TEST_USERS.students[0].id}-2`,
    rating: 5,
    feedback_text: 'Perfect schedule! No conflicts and good time slots.',
    feedback_category: 'QUALITY',
    severity: 'LOW',
    schedule_version: 2,
    reviewed_by: null,
    resolution: null,
    resolution_date: null,
    is_resolved: false,
    created_at: '2025-10-16T10:00:00Z',
    updated_at: '2025-10-16T10:00:00Z',
  },
  {
    id: generateFeedbackUUID(2),
    student_id: TEST_USERS.students[5].id,
    schedule_id: `schedule-${TEST_USERS.students[5].id}-2`,
    rating: 3,
    feedback_text: 'Good schedule but would prefer different time slots for SWE102.',
    feedback_category: 'TIMING',
    severity: 'MEDIUM',
    schedule_version: 2,
    reviewed_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    resolution: 'Noted for future scheduling. Current slots optimal for majority.',
    resolution_date: '2025-10-17T14:00:00Z',
    is_resolved: true,
    created_at: '2025-10-16T11:00:00Z',
    updated_at: '2025-10-17T14:00:00Z',
  },
  {
    id: generateFeedbackUUID(3),
    student_id: TEST_USERS.students[11].id,
    schedule_id: `schedule-${TEST_USERS.students[11].id}-2`,
    rating: 2,
    feedback_text: 'Schedule has a long gap between classes on Sunday.',
    feedback_category: 'PREFERENCE',
    severity: 'HIGH',
    schedule_version: 2,
    reviewed_by: null,
    resolution: null,
    resolution_date: null,
    is_resolved: false,
    created_at: '2025-10-16T12:00:00Z',
    updated_at: '2025-10-16T12:00:00Z',
  },
];

export const TEST_FEEDBACK_DATA = {
  all: FEEDBACK_ITEMS,
  helpers: {
    getByStudent: (studentId: string) => FEEDBACK_ITEMS.filter(f => f.student_id === studentId),
    getByRating: (rating: number) => FEEDBACK_ITEMS.filter(f => f.rating === rating),
    getByCategory: (category: Feedback['feedback_category']) => FEEDBACK_ITEMS.filter(f => f.feedback_category === category),
    getUnresolved: () => FEEDBACK_ITEMS.filter(f => !f.is_resolved),
    getStatistics: () => ({
      total: FEEDBACK_ITEMS.length,
      avg_rating: (FEEDBACK_ITEMS.reduce((sum, f) => sum + f.rating, 0) / FEEDBACK_ITEMS.length).toFixed(2),
      resolved: FEEDBACK_ITEMS.filter(f => f.is_resolved).length,
      unresolved: FEEDBACK_ITEMS.filter(f => !f.is_resolved).length,
    }),
  },
};


