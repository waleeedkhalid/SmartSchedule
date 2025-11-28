/**
 * Schedule Versions Fixtures
 * Version control for schedule generations
 */

import type { Database } from '../../src/types/test-schema';
import { CURRENT_TERM } from './academic-term.fixture';
import { TEST_USERS } from './users.fixture';

type ScheduleVersion = Database['public']['Tables']['schedule_versions']['Row'];

// Generate test UUIDs for versions
const generateVersionUUID = (version: number): string => {
  return `version-${String(version).padStart(4, '0')}-0000-0000-000000000000`;
};

// =====================================================
// VERSION 1 - INITIAL GENERATION
// =====================================================

export const SCHEDULE_VERSION_V1: ScheduleVersion = {
  id: generateVersionUUID(1),
  term_code: CURRENT_TERM.code,
  version: 1,
  generated_at: '2025-10-10T10:00:00Z',
  generated_by: TEST_USERS.quickRef.committee.schedulingChair.id,
  generation_type: 'INITIAL',
  input_hash: 'hash-v1-input-data-abc123',
  schedule_count: 25, // 25 students
  statistics: {
    total_students: 25,
    total_sections: 8, // 8 lecture sections
    total_conflicts: 0,
    conflict_rate: 0,
    average_credits_per_student: 6, // 2 courses × 3 credits
    average_contact_hours: 6, // 2 courses × 2 slots × 1.5 hours
    room_utilization: {
      total_rooms: 12,
      utilized_rooms: 8,
      utilization_rate: 66.67,
      peak_usage_time: '10:00',
    },
    faculty_load: {
      total_faculty: 3,
      average_load: 6, // Credits per faculty
      min_load: 6,
      max_load: 6,
      load_variance: 0,
    },
    irregular_students: {
      total: 2,
      fully_accommodated: 2,
      partially_accommodated: 0,
      not_accommodated: 0,
    },
  },
  changes_from_previous: null, // First version, no previous
  notes: 'Initial schedule generation for Fall 2025/2026',
  created_at: '2025-10-10T10:00:00Z',
  updated_at: '2025-10-10T10:00:00Z',
};

// =====================================================
// VERSION 2 - AFTER TEACHING LOAD COMMITTEE EDITS
// =====================================================

export const SCHEDULE_VERSION_V2: ScheduleVersion = {
  id: generateVersionUUID(2),
  term_code: CURRENT_TERM.code,
  version: 2,
  generated_at: '2025-10-15T14:00:00Z',
  generated_by: TEST_USERS.quickRef.committee.schedulingChair.id,
  generation_type: 'TEACHING_LOAD_EDIT',
  input_hash: 'hash-v2-input-data-def456',
  schedule_count: 25,
  statistics: {
    total_students: 25,
    total_sections: 8,
    total_conflicts: 0,
    conflict_rate: 0,
    average_credits_per_student: 6,
    average_contact_hours: 6,
    room_utilization: {
      total_rooms: 12,
      utilized_rooms: 8,
      utilization_rate: 66.67,
      peak_usage_time: '09:00', // Changed after load balancing
    },
    faculty_load: {
      total_faculty: 3,
      average_load: 6,
      min_load: 6,
      max_load: 6,
      load_variance: 0, // Better balanced now
    },
    irregular_students: {
      total: 2,
      fully_accommodated: 2,
      partially_accommodated: 0,
      not_accommodated: 0,
    },
  },
  changes_from_previous: {
    // jsondiffpatch delta
    sections: {
      'SWE201-01': {
        instructor_id: {
          _old: 'faculty-0001-0000-0000-000000000000',
          _new: 'faculty-0002-0000-0000-000000000000',
        },
      },
      'SWE301-02': {
        room_number: {
          _old: 'B204',
          _new: 'B203',
        },
      },
    },
    statistics: {
      faculty_load: {
        load_variance: {
          _old: 3.2,
          _new: 0,
        },
      },
    },
  },
  notes: 'Teaching load balanced after committee review',
  created_at: '2025-10-15T14:00:00Z',
  updated_at: '2025-10-15T14:00:00Z',
};

// =====================================================
// VERSION 3 - AFTER FEEDBACK ADJUSTMENTS (FUTURE)
// =====================================================

export const SCHEDULE_VERSION_V3: ScheduleVersion = {
  id: generateVersionUUID(3),
  term_code: CURRENT_TERM.code,
  version: 3,
  generated_at: '2025-10-20T16:00:00Z',
  generated_by: TEST_USERS.quickRef.committee.schedulingChair.id,
  generation_type: 'MANUAL_ADJUSTMENT',
  input_hash: 'hash-v3-input-data-ghi789',
  schedule_count: 25,
  statistics: {
    total_students: 25,
    total_sections: 8,
    total_conflicts: 0,
    conflict_rate: 0,
    average_credits_per_student: 6,
    average_contact_hours: 6,
    room_utilization: {
      total_rooms: 12,
      utilized_rooms: 8,
      utilization_rate: 66.67,
      peak_usage_time: '09:00',
    },
    faculty_load: {
      total_faculty: 3,
      average_load: 6,
      min_load: 6,
      max_load: 6,
      load_variance: 0,
    },
    irregular_students: {
      total: 2,
      fully_accommodated: 2,
      partially_accommodated: 0,
      not_accommodated: 0,
    },
  },
  changes_from_previous: {
    sections: {
      'SWE101-02': {
        times: {
          0: {
            day: {
              _old: 'MONDAY',
              _new: 'WEDNESDAY',
            },
          },
        },
      },
    },
  },
  notes: 'Minor adjustments based on student/faculty feedback',
  created_at: '2025-10-20T16:00:00Z',
  updated_at: '2025-10-20T16:00:00Z',
};

// =====================================================
// ALL VERSIONS
// =====================================================

export const ALL_SCHEDULE_VERSIONS: ScheduleVersion[] = [
  SCHEDULE_VERSION_V1,
  SCHEDULE_VERSION_V2,
  SCHEDULE_VERSION_V3,
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

export const getVersionById = (id: string): ScheduleVersion | undefined => {
  return ALL_SCHEDULE_VERSIONS.find(v => v.id === id);
};

export const getVersionByNumber = (version: number): ScheduleVersion | undefined => {
  return ALL_SCHEDULE_VERSIONS.find(v => v.version === version);
};

export const getVersionsByGenerationType = (type: ScheduleVersion['generation_type']): ScheduleVersion[] => {
  return ALL_SCHEDULE_VERSIONS.filter(v => v.generation_type === type);
};

export const getLatestVersion = (): ScheduleVersion => {
  return ALL_SCHEDULE_VERSIONS[ALL_SCHEDULE_VERSIONS.length - 1];
};

export const getVersionChanges = (fromVersion: number, toVersion: number): any => {
  const toVer = getVersionByNumber(toVersion);
  return toVer?.changes_from_previous || null;
};

// =====================================================
// VERSION COMPARISON
// =====================================================

export const compareVersions = (v1: number, v2: number) => {
  const version1 = getVersionByNumber(v1);
  const version2 = getVersionByNumber(v2);
  
  if (!version1 || !version2) {
    return null;
  }
  
  return {
    from_version: v1,
    to_version: v2,
    generation_type_changed: version1.generation_type !== version2.generation_type,
    schedule_count_changed: version1.schedule_count !== version2.schedule_count,
    statistics_diff: {
      conflict_rate_change: version2.statistics.conflict_rate - version1.statistics.conflict_rate,
      load_variance_change: version2.statistics.faculty_load.load_variance - version1.statistics.faculty_load.load_variance,
    },
    changes: version2.changes_from_previous,
  };
};

// =====================================================
// STATISTICS
// =====================================================

export const getVersionStatistics = () => {
  return {
    total_versions: ALL_SCHEDULE_VERSIONS.length,
    generation_types: {
      initial: getVersionsByGenerationType('INITIAL').length,
      teaching_load_edit: getVersionsByGenerationType('TEACHING_LOAD_EDIT').length,
      manual_adjustment: getVersionsByGenerationType('MANUAL_ADJUSTMENT').length,
      regeneration: getVersionsByGenerationType('REGENERATION').length,
    },
    average_schedule_count: Math.round(
      ALL_SCHEDULE_VERSIONS.reduce((sum, v) => sum + v.schedule_count, 0) / ALL_SCHEDULE_VERSIONS.length
    ),
    average_conflict_rate: (
      ALL_SCHEDULE_VERSIONS.reduce((sum, v) => sum + v.statistics.conflict_rate, 0) / ALL_SCHEDULE_VERSIONS.length
    ).toFixed(2),
  };
};

// =====================================================
// QUICK REFERENCE
// =====================================================

export const VERSIONS_QUICK_REF = {
  v1: SCHEDULE_VERSION_V1,
  v2: SCHEDULE_VERSION_V2,
  v3: SCHEDULE_VERSION_V3,
  latest: getLatestVersion(),
  all: ALL_SCHEDULE_VERSIONS,
  initial: getVersionsByGenerationType('INITIAL'),
  statistics: getVersionStatistics(),
};

// Export for easy access
export const TEST_SCHEDULE_VERSION_DATA = {
  all: ALL_SCHEDULE_VERSIONS,
  quickRef: VERSIONS_QUICK_REF,
  helpers: {
    getById: getVersionById,
    getByNumber: getVersionByNumber,
    getByGenerationType: getVersionsByGenerationType,
    getLatest: getLatestVersion,
    getChanges: getVersionChanges,
    compare: compareVersions,
    getStatistics: getVersionStatistics,
  },
};


