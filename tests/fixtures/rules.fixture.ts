/**
 * Scheduling Rules Fixtures
 * Committee-defined rules for schedule generation
 */

import { TEST_TERM_CODE } from './sections.fixture';
import { TEST_USERS } from './users.fixture';
import type { SchedulingRule, RuleData } from '../../src/types/test-schema';

// =====================================================
// HARD CONSTRAINTS (MUST be satisfied)
// =====================================================

export const HARD_CONSTRAINTS: Omit<SchedulingRule, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    term_code: TEST_TERM_CODE,
    rule_type: 'HARD_CONSTRAINT',
    priority: 100,
    name: 'No Student Time Conflicts',
    description: 'Students cannot have overlapping course times',
    rule_data: {
      type: 'no_overlap',
      scope: 'student',
      entities: ['sections'],
    },
    is_active: true,
    created_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    yjs_document_id: 'rule-doc-001',
  },
  {
    term_code: TEST_TERM_CODE,
    rule_type: 'HARD_CONSTRAINT',
    priority: 100,
    name: 'No Faculty Overlaps',
    description: 'Faculty cannot teach multiple sections at the same time',
    rule_data: {
      type: 'no_overlap',
      scope: 'faculty',
      entities: ['sections'],
    },
    is_active: true,
    created_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    yjs_document_id: 'rule-doc-002',
  },
  {
    term_code: TEST_TERM_CODE,
    rule_type: 'HARD_CONSTRAINT',
    priority: 100,
    name: 'No Room Double Booking',
    description: 'Rooms cannot be used by multiple sections simultaneously',
    rule_data: {
      type: 'no_overlap',
      scope: 'room',
      entities: ['sections'],
    },
    is_active: true,
    created_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    yjs_document_id: 'rule-doc-003',
  },
  {
    term_code: TEST_TERM_CODE,
    rule_type: 'HARD_CONSTRAINT',
    priority: 100,
    name: 'Section Capacity Limits',
    description: 'Enrollment cannot exceed section capacity',
    rule_data: {
      type: 'capacity_check',
      field: 'enrolled_count',
      operator: '<=',
      compare_field: 'capacity',
    },
    is_active: true,
    created_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    yjs_document_id: 'rule-doc-004',
  },
  {
    term_code: TEST_TERM_CODE,
    rule_type: 'HARD_CONSTRAINT',
    priority: 95,
    name: 'Lunch Break (12-1 PM)',
    description: 'No classes scheduled during lunch time',
    rule_data: {
      type: 'time_block',
      blocked_times: [
        { day: 'SUNDAY', start: '12:00', end: '13:00' },
        { day: 'MONDAY', start: '12:00', end: '13:00' },
        { day: 'TUESDAY', start: '12:00', end: '13:00' },
        { day: 'WEDNESDAY', start: '12:00', end: '13:00' },
        { day: 'THURSDAY', start: '12:00', end: '13:00' },
      ],
    },
    is_active: true,
    created_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    yjs_document_id: 'rule-doc-005',
  },
  {
    term_code: TEST_TERM_CODE,
    rule_type: 'HARD_CONSTRAINT',
    priority: 100,
    name: 'Irregular Students Priority',
    description: 'All irregular student required courses must be accommodated',
    rule_data: {
      type: 'irregular_priority',
      priority: 'highest',
      must_assign: true,
    },
    is_active: true,
    created_by: TEST_USERS.quickRef.committee.registrar.id,
    yjs_document_id: 'rule-doc-006',
  },
];

// =====================================================
// SOFT CONSTRAINTS (SHOULD be optimized)
// =====================================================

export const SOFT_CONSTRAINTS: Omit<SchedulingRule, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    term_code: TEST_TERM_CODE,
    rule_type: 'SOFT_CONSTRAINT',
    priority: 50,
    name: 'Minimize Schedule Gaps',
    description: 'Try to minimize idle time between classes for students',
    rule_data: {
      type: 'minimize_gaps',
      max_gap_minutes: 120,
      weight: 0.7,
    },
    is_active: true,
    created_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    yjs_document_id: 'rule-doc-007',
  },
  {
    term_code: TEST_TERM_CODE,
    rule_type: 'SOFT_CONSTRAINT',
    priority: 40,
    name: 'Balance Faculty Load',
    description: 'Distribute teaching hours evenly among faculty',
    rule_data: {
      type: 'balance_load',
      entity: 'faculty',
      metric: 'credit_hours',
      variance_threshold: 3,
    },
    is_active: true,
    created_by: TEST_USERS.quickRef.committee.loadChair.id,
    yjs_document_id: 'rule-doc-008',
  },
  {
    term_code: TEST_TERM_CODE,
    rule_type: 'SOFT_CONSTRAINT',
    priority: 35,
    name: 'Respect Faculty Availability',
    description: 'Try to match faculty preferred time slots',
    rule_data: {
      type: 'faculty_preference',
      weight: 0.6,
      prefer_status: 'PREFERRED',
      avoid_status: 'UNAVAILABLE',
    },
    is_active: true,
    created_by: TEST_USERS.quickRef.committee.loadChair.id,
    yjs_document_id: 'rule-doc-009',
  },
  {
    term_code: TEST_TERM_CODE,
    rule_type: 'SOFT_CONSTRAINT',
    priority: 30,
    name: 'Same Course Sections Spread',
    description: 'Different sections of same course at different times',
    rule_data: {
      type: 'spread_sections',
      scope: 'course',
      min_gap_hours: 2,
    },
    is_active: true,
    created_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    yjs_document_id: 'rule-doc-010',
  },
];

// =====================================================
// PREFERENCES (Nice-to-have)
// =====================================================

export const PREFERENCES: Omit<SchedulingRule, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    term_code: TEST_TERM_CODE,
    rule_type: 'PREFERENCE',
    priority: 20,
    name: 'Early Morning Classes',
    description: 'Prefer scheduling core courses in morning slots',
    rule_data: {
      type: 'time_preference',
      course_types: ['REQUIRED'],
      preferred_hours: [8, 9, 10],
    },
    is_active: true,
    created_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    yjs_document_id: 'rule-doc-011',
  },
  {
    term_code: TEST_TERM_CODE,
    rule_type: 'PREFERENCE',
    priority: 15,
    name: 'Lab Sessions Afternoon',
    description: 'Try to schedule labs in afternoon time slots',
    rule_data: {
      type: 'time_preference',
      section_types: ['LAB'],
      preferred_hours: [13, 14, 15],
    },
    is_active: true,
    created_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    yjs_document_id: 'rule-doc-012',
  },
];

// =====================================================
// ALL RULES COMBINED
// =====================================================

export const ALL_RULES = [
  ...HARD_CONSTRAINTS,
  ...SOFT_CONSTRAINTS,
  ...PREFERENCES,
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getRulesByType = (type: SchedulingRule['rule_type']) => {
  return ALL_RULES.filter((r) => r.rule_type === type);
};

export const getRulesByPriority = (minPriority: number) => {
  return ALL_RULES.filter((r) => r.priority >= minPriority).sort((a, b) => b.priority - a.priority);
};

export const getActiveRules = () => {
  return ALL_RULES.filter((r) => r.is_active);
};

// =====================================================
// STATISTICS
// =====================================================

export const getRuleStatistics = () => {
  return {
    total_rules: ALL_RULES.length,
    hard_constraints: HARD_CONSTRAINTS.length,
    soft_constraints: SOFT_CONSTRAINTS.length,
    preferences: PREFERENCES.length,
    active_rules: getActiveRules().length,
    highest_priority: Math.max(...ALL_RULES.map((r) => r.priority)),
    lowest_priority: Math.min(...ALL_RULES.map((r) => r.priority)),
  };
};

// =====================================================
// QUICK REFERENCE
// =====================================================

export const RULES_QUICK_REF = {
  hardConstraints: HARD_CONSTRAINTS,
  softConstraints: SOFT_CONSTRAINTS,
  preferences: PREFERENCES,
  active: getActiveRules(),
  highPriority: getRulesByPriority(50),
  statistics: getRuleStatistics(),
};

// Export for easy access
export const TEST_RULES = {
  all: ALL_RULES,
  quickRef: RULES_QUICK_REF,
  helpers: {
    getByType: getRulesByType,
    getByPriority: getRulesByPriority,
    getActive: getActiveRules,
    getStatistics: getRuleStatistics,
  },
};

