/**
 * Teaching Load Change Requests Fixtures
 * Change requests from teaching load committee with validation
 */

import type { Database } from '../../src/types/test-schema';
import { TEST_USERS } from './users.fixture';
import { SCHEDULE_VERSION_V1 } from './schedule-versions.fixture';
import { IRREGULAR_STUDENTS } from './irregular-students.fixture';

type TeachingLoadChangeRequest = Database['public']['Tables']['teaching_load_change_requests']['Row'];

const generateRequestUUID = (index: number): string => {
  return `request-${String(index).padStart(4, '0')}-0000-0000-000000000000`;
};

export const TEACHING_LOAD_CHANGE_REQUESTS: TeachingLoadChangeRequest[] = [
  // VALID REQUEST - Reassign instructor (doesn't affect irregular students)
  {
    id: generateRequestUUID(1),
    schedule_version_id: SCHEDULE_VERSION_V1.id,
    section_id: 'SWE201-01',
    requested_by: TEST_USERS.quickRef.committee.loadChair.id,
    request_type: 'REASSIGN_INSTRUCTOR',
    changes: {
      from: { instructor_id: 'faculty-0001-0000-0000-000000000000' },
      to: { instructor_id: 'faculty-0002-0000-0000-000000000000' },
    },
    reason: 'Balance faculty workload - Dr. Ahmad has too many sections',
    validation_status: 'VALID',
    validation_error: null,
    affects_irregular_students: false,
    irregular_students_affected: [],
    reviewed_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    reviewed_at: '2025-10-12T14:00:00Z',
    applied: true,
    applied_at: '2025-10-15T14:00:00Z',
    created_at: '2025-10-11T10:00:00Z',
    updated_at: '2025-10-15T14:00:00Z',
  },
  
  // INVALID REQUEST - Would affect irregular student requirement
  {
    id: generateRequestUUID(2),
    schedule_version_id: SCHEDULE_VERSION_V1.id,
    section_id: 'SWE102-01',
    requested_by: TEST_USERS.quickRef.committee.loadMember.id,
    request_type: 'CHANGE_TIME_SLOT',
    changes: {
      from: {
        time_slots: [
          { day: 'SUNDAY', start_time: '10:00:00', end_time: '11:30:00' },
          { day: 'TUESDAY', start_time: '10:00:00', end_time: '11:30:00' },
        ],
      },
      to: {
        time_slots: [
          { day: 'MONDAY', start_time: '13:00:00', end_time: '14:30:00' },
          { day: 'WEDNESDAY', start_time: '13:00:00', end_time: '14:30:00' },
        ],
      },
    },
    reason: 'Spread sections across different days',
    validation_status: 'INVALID',
    validation_error: 'Change would create time conflict for irregular student (student-0006-0000-0000-000000000000) who must take SWE102',
    affects_irregular_students: true,
    irregular_students_affected: [IRREGULAR_STUDENTS[0].student_id],
    reviewed_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    reviewed_at: '2025-10-12T15:00:00Z',
    applied: false,
    applied_at: null,
    created_at: '2025-10-11T11:00:00Z',
    updated_at: '2025-10-12T15:00:00Z',
  },
  
  // PENDING REQUEST - Awaiting validation
  {
    id: generateRequestUUID(3),
    schedule_version_id: SCHEDULE_VERSION_V1.id,
    section_id: 'SWE301-02',
    requested_by: TEST_USERS.quickRef.committee.loadChair.id,
    request_type: 'ADJUST_CAPACITY',
    changes: {
      from: { capacity: 20 },
      to: { capacity: 22 },
    },
    reason: 'Increase capacity due to high demand',
    validation_status: 'PENDING',
    validation_error: null,
    affects_irregular_students: false,
    irregular_students_affected: [],
    reviewed_by: null,
    reviewed_at: null,
    applied: false,
    applied_at: null,
    created_at: '2025-10-13T10:00:00Z',
    updated_at: '2025-10-13T10:00:00Z',
  },
  
  // APPROVED REQUEST - Ready to apply
  {
    id: generateRequestUUID(4),
    schedule_version_id: SCHEDULE_VERSION_V1.id,
    section_id: 'SWE301-02',
    requested_by: TEST_USERS.quickRef.committee.loadChair.id,
    request_type: 'REASSIGN_INSTRUCTOR',
    changes: {
      from: { room_number: 'B204' },
      to: { room_number: 'B203' },
    },
    reason: 'Room B203 has better equipment for this course',
    validation_status: 'APPROVED',
    validation_error: null,
    affects_irregular_students: false,
    irregular_students_affected: [],
    reviewed_by: TEST_USERS.quickRef.committee.schedulingChair.id,
    reviewed_at: '2025-10-14T10:00:00Z',
    applied: false,
    applied_at: null,
    created_at: '2025-10-13T14:00:00Z',
    updated_at: '2025-10-14T10:00:00Z',
  },
];

export const TEST_TEACHING_LOAD_CHANGE_REQUEST_DATA = {
  all: TEACHING_LOAD_CHANGE_REQUESTS,
  helpers: {
    getByStatus: (status: TeachingLoadChangeRequest['validation_status']) => 
      TEACHING_LOAD_CHANGE_REQUESTS.filter(r => r.validation_status === status),
    getByType: (type: TeachingLoadChangeRequest['request_type']) => 
      TEACHING_LOAD_CHANGE_REQUESTS.filter(r => r.request_type === type),
    getByVersion: (versionId: string) => 
      TEACHING_LOAD_CHANGE_REQUESTS.filter(r => r.schedule_version_id === versionId),
    getAffectingIrregular: () => 
      TEACHING_LOAD_CHANGE_REQUESTS.filter(r => r.affects_irregular_students),
    getApplied: () => 
      TEACHING_LOAD_CHANGE_REQUESTS.filter(r => r.applied),
    getStatistics: () => ({
      total: TEACHING_LOAD_CHANGE_REQUESTS.length,
      by_status: {
        pending: TEACHING_LOAD_CHANGE_REQUESTS.filter(r => r.validation_status === 'PENDING').length,
        valid: TEACHING_LOAD_CHANGE_REQUESTS.filter(r => r.validation_status === 'VALID').length,
        invalid: TEACHING_LOAD_CHANGE_REQUESTS.filter(r => r.validation_status === 'INVALID').length,
        approved: TEACHING_LOAD_CHANGE_REQUESTS.filter(r => r.validation_status === 'APPROVED').length,
        rejected: TEACHING_LOAD_CHANGE_REQUESTS.filter(r => r.validation_status === 'REJECTED').length,
      },
      applied: TEACHING_LOAD_CHANGE_REQUESTS.filter(r => r.applied).length,
      affecting_irregular: TEACHING_LOAD_CHANGE_REQUESTS.filter(r => r.affects_irregular_students).length,
    }),
  },
};


