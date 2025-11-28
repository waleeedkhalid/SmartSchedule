/**
 * Conflict Detector Unit Tests
 * TDD approach - Tests for schedule conflict detection
 */

import { describe, it, expect } from 'vitest';
import {
  doTimeSlotsOverlap,
  detectTimeOverlapConflicts,
  detectRoomDoubleBooking,
  detectFacultyConflicts,
  detectStudentScheduleConflicts,
  detectAllConflicts,
  type TimeSlot,
  type SectionTimeInfo,
  type StudentScheduleInfo,
} from '../../../src/lib/validations/conflict-detector';

// =====================================================
// TEST: Time Slot Overlap Detection
// =====================================================

describe('Conflict Detector', () => {
  describe('doTimeSlotsOverlap', () => {
    it('should detect overlapping time slots on same day', () => {
      const slot1: TimeSlot = {
        day: 'SUNDAY',
        start_time: '08:00',
        end_time: '09:00',
      };
      const slot2: TimeSlot = {
        day: 'SUNDAY',
        start_time: '08:30',
        end_time: '09:30',
      };
      
      expect(doTimeSlotsOverlap(slot1, slot2)).toBe(true);
    });
    
    it('should not detect overlap on different days', () => {
      const slot1: TimeSlot = {
        day: 'SUNDAY',
        start_time: '08:00',
        end_time: '09:00',
      };
      const slot2: TimeSlot = {
        day: 'MONDAY',
        start_time: '08:00',
        end_time: '09:00',
      };
      
      expect(doTimeSlotsOverlap(slot1, slot2)).toBe(false);
    });
    
    it('should not detect overlap for adjacent time slots', () => {
      const slot1: TimeSlot = {
        day: 'SUNDAY',
        start_time: '08:00',
        end_time: '09:00',
      };
      const slot2: TimeSlot = {
        day: 'SUNDAY',
        start_time: '09:00',
        end_time: '10:00',
      };
      
      expect(doTimeSlotsOverlap(slot1, slot2)).toBe(false);
    });
    
    it('should detect complete overlap (one contains other)', () => {
      const slot1: TimeSlot = {
        day: 'SUNDAY',
        start_time: '08:00',
        end_time: '12:00',
      };
      const slot2: TimeSlot = {
        day: 'SUNDAY',
        start_time: '09:00',
        end_time: '10:00',
      };
      
      expect(doTimeSlotsOverlap(slot1, slot2)).toBe(true);
    });
    
    it('should detect partial overlap', () => {
      const slot1: TimeSlot = {
        day: 'TUESDAY',
        start_time: '10:00',
        end_time: '11:30',
      };
      const slot2: TimeSlot = {
        day: 'TUESDAY',
        start_time: '11:00',
        end_time: '12:30',
      };
      
      expect(doTimeSlotsOverlap(slot1, slot2)).toBe(true);
    });
    
    it('should not detect overlap for completely separate times', () => {
      const slot1: TimeSlot = {
        day: 'WEDNESDAY',
        start_time: '08:00',
        end_time: '09:00',
      };
      const slot2: TimeSlot = {
        day: 'WEDNESDAY',
        start_time: '13:00',
        end_time: '14:00',
      };
      
      expect(doTimeSlotsOverlap(slot1, slot2)).toBe(false);
    });
  });
  
  // =====================================================
  // TEST: Time Overlap Conflicts
  // =====================================================
  
  describe('detectTimeOverlapConflicts', () => {
    it('should detect conflict between two overlapping sections', () => {
      const sections: SectionTimeInfo[] = [
        {
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          times: [{
            day: 'SUNDAY',
            start_time: '08:00',
            end_time: '09:00',
          }],
        },
        {
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          times: [{
            day: 'SUNDAY',
            start_time: '08:30',
            end_time: '09:30',
          }],
        },
      ];
      
      const conflicts = detectTimeOverlapConflicts(sections);
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('TIME_OVERLAP');
      expect(conflicts[0].severity).toBe('HARD');
    });
    
    it('should not detect conflicts for non-overlapping sections', () => {
      const sections: SectionTimeInfo[] = [
        {
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          times: [{
            day: 'SUNDAY',
            start_time: '08:00',
            end_time: '09:00',
          }],
        },
        {
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          times: [{
            day: 'SUNDAY',
            start_time: '09:00',
            end_time: '10:00',
          }],
        },
      ];
      
      const conflicts = detectTimeOverlapConflicts(sections);
      
      expect(conflicts).toHaveLength(0);
    });
    
    it('should detect multiple conflicts across different days', () => {
      const sections: SectionTimeInfo[] = [
        {
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          times: [
            { day: 'SUNDAY', start_time: '08:00', end_time: '09:00' },
            { day: 'TUESDAY', start_time: '10:00', end_time: '11:00' },
          ],
        },
        {
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          times: [
            { day: 'SUNDAY', start_time: '08:30', end_time: '09:30' },
            { day: 'TUESDAY', start_time: '10:30', end_time: '11:30' },
          ],
        },
      ];
      
      const conflicts = detectTimeOverlapConflicts(sections);
      
      expect(conflicts.length).toBeGreaterThan(0);
    });
  });
  
  // =====================================================
  // TEST: Room Double-Booking
  // =====================================================
  
  describe('detectRoomDoubleBooking', () => {
    it('should detect room double-booking', () => {
      const sections: SectionTimeInfo[] = [
        {
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          room_number: 'A101',
          times: [{
            day: 'SUNDAY',
            start_time: '08:00',
            end_time: '09:00',
          }],
        },
        {
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          room_number: 'A101', // Same room
          times: [{
            day: 'SUNDAY',
            start_time: '08:30',
            end_time: '09:30',
          }],
        },
      ];
      
      const conflicts = detectRoomDoubleBooking(sections);
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('ROOM_DOUBLE_BOOKING');
      expect(conflicts[0].severity).toBe('HARD');
      expect(conflicts[0].details.room).toBe('A101');
    });
    
    it('should not detect conflicts for same room at different times', () => {
      const sections: SectionTimeInfo[] = [
        {
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          room_number: 'A101',
          times: [{
            day: 'SUNDAY',
            start_time: '08:00',
            end_time: '09:00',
          }],
        },
        {
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          room_number: 'A101', // Same room
          times: [{
            day: 'SUNDAY',
            start_time: '09:00',
            end_time: '10:00', // Different time
          }],
        },
      ];
      
      const conflicts = detectRoomDoubleBooking(sections);
      
      expect(conflicts).toHaveLength(0);
    });
    
    it('should not detect conflicts for different rooms', () => {
      const sections: SectionTimeInfo[] = [
        {
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          room_number: 'A101',
          times: [{
            day: 'SUNDAY',
            start_time: '08:00',
            end_time: '09:00',
          }],
        },
        {
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          room_number: 'A102', // Different room
          times: [{
            day: 'SUNDAY',
            start_time: '08:00',
            end_time: '09:00',
          }],
        },
      ];
      
      const conflicts = detectRoomDoubleBooking(sections);
      
      expect(conflicts).toHaveLength(0);
    });
  });
  
  // =====================================================
  // TEST: Faculty Conflicts
  // =====================================================
  
  describe('detectFacultyConflicts', () => {
    it('should detect faculty teaching two sections at same time', () => {
      const sections: SectionTimeInfo[] = [
        {
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          instructor_id: 'faculty-001',
          times: [{
            day: 'SUNDAY',
            start_time: '08:00',
            end_time: '09:00',
          }],
        },
        {
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          instructor_id: 'faculty-001', // Same faculty
          times: [{
            day: 'SUNDAY',
            start_time: '08:30',
            end_time: '09:30',
          }],
        },
      ];
      
      const conflicts = detectFacultyConflicts(sections);
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('FACULTY_CONFLICT');
      expect(conflicts[0].severity).toBe('HARD');
      expect(conflicts[0].details.instructor_id).toBe('faculty-001');
    });
    
    it('should not detect conflicts for same faculty at different times', () => {
      const sections: SectionTimeInfo[] = [
        {
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          instructor_id: 'faculty-001',
          times: [{
            day: 'SUNDAY',
            start_time: '08:00',
            end_time: '09:00',
          }],
        },
        {
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          instructor_id: 'faculty-001', // Same faculty
          times: [{
            day: 'SUNDAY',
            start_time: '09:00',
            end_time: '10:00', // Different time
          }],
        },
      ];
      
      const conflicts = detectFacultyConflicts(sections);
      
      expect(conflicts).toHaveLength(0);
    });
    
    it('should not detect conflicts for different faculty', () => {
      const sections: SectionTimeInfo[] = [
        {
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          instructor_id: 'faculty-001',
          times: [{
            day: 'SUNDAY',
            start_time: '08:00',
            end_time: '09:00',
          }],
        },
        {
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          instructor_id: 'faculty-002', // Different faculty
          times: [{
            day: 'SUNDAY',
            start_time: '08:00',
            end_time: '09:00',
          }],
        },
      ];
      
      const conflicts = detectFacultyConflicts(sections);
      
      expect(conflicts).toHaveLength(0);
    });
  });
  
  // =====================================================
  // TEST: Student Schedule Conflicts
  // =====================================================
  
  describe('detectStudentScheduleConflicts', () => {
    it('should detect student enrolled in conflicting sections', () => {
      const studentSchedule: StudentScheduleInfo = {
        student_id: 'student-001',
        sections: [
          {
            section_id: 'sec-001',
            course_code: 'SWE101',
            section_number: 1,
            times: [{
              day: 'SUNDAY',
              start_time: '08:00',
              end_time: '09:00',
            }],
          },
          {
            section_id: 'sec-002',
            course_code: 'SWE102',
            section_number: 1,
            times: [{
              day: 'SUNDAY',
              start_time: '08:30',
              end_time: '09:30',
            }],
          },
        ],
      };
      
      const conflicts = detectStudentScheduleConflicts(studentSchedule);
      
      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].type).toBe('STUDENT_CONFLICT');
      expect(conflicts[0].severity).toBe('HARD');
      expect(conflicts[0].details.student_id).toBe('student-001');
    });
    
    it('should not detect conflicts for valid schedule', () => {
      const studentSchedule: StudentScheduleInfo = {
        student_id: 'student-001',
        sections: [
          {
            section_id: 'sec-001',
            course_code: 'SWE101',
            section_number: 1,
            times: [{
              day: 'SUNDAY',
              start_time: '08:00',
              end_time: '09:00',
            }],
          },
          {
            section_id: 'sec-002',
            course_code: 'SWE102',
            section_number: 1,
            times: [{
              day: 'SUNDAY',
              start_time: '09:00',
              end_time: '10:00',
            }],
          },
        ],
      };
      
      const conflicts = detectStudentScheduleConflicts(studentSchedule);
      
      expect(conflicts).toHaveLength(0);
    });
  });
  
  // =====================================================
  // TEST: Comprehensive Conflict Detection
  // =====================================================
  
  describe('detectAllConflicts', () => {
    it('should detect all types of conflicts', () => {
      const sections: SectionTimeInfo[] = [
        {
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          room_number: 'A101',
          instructor_id: 'faculty-001',
          times: [{
            day: 'SUNDAY',
            start_time: '08:00',
            end_time: '09:00',
          }],
        },
        {
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          room_number: 'A101', // Same room
          instructor_id: 'faculty-001', // Same faculty
          times: [{
            day: 'SUNDAY',
            start_time: '08:30',
            end_time: '09:30',
          }],
        },
      ];
      
      const result = detectAllConflicts(sections);
      
      expect(result.hasConflicts).toBe(true);
      expect(result.conflicts.length).toBeGreaterThan(0);
      expect(result.summary.total).toBeGreaterThan(0);
    });
    
    it('should return no conflicts for valid schedule', () => {
      const sections: SectionTimeInfo[] = [
        {
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          room_number: 'A101',
          instructor_id: 'faculty-001',
          times: [{
            day: 'SUNDAY',
            start_time: '08:00',
            end_time: '09:00',
          }],
        },
        {
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          room_number: 'A102',
          instructor_id: 'faculty-002',
          times: [{
            day: 'SUNDAY',
            start_time: '09:00',
            end_time: '10:00',
          }],
        },
      ];
      
      const result = detectAllConflicts(sections);
      
      expect(result.hasConflicts).toBe(false);
      expect(result.conflicts).toHaveLength(0);
      expect(result.summary.total).toBe(0);
    });
    
    it('should provide conflict summary by type and severity', () => {
      const sections: SectionTimeInfo[] = [
        {
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          room_number: 'A101',
          instructor_id: 'faculty-001',
          times: [{
            day: 'SUNDAY',
            start_time: '08:00',
            end_time: '09:00',
          }],
        },
        {
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          room_number: 'A101',
          instructor_id: 'faculty-001',
          times: [{
            day: 'SUNDAY',
            start_time: '08:30',
            end_time: '09:30',
          }],
        },
      ];
      
      const result = detectAllConflicts(sections);
      
      expect(result.summary.byType).toBeDefined();
      expect(result.summary.bySeverity).toBeDefined();
      expect(result.summary.bySeverity.HARD).toBeGreaterThan(0);
    });
  });
});
