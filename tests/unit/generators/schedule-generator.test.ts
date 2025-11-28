/**
 * Schedule Generator Unit Tests
 * Tests schedule generation algorithms
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TEST_FIXTURES } from '../../fixtures';
import { testHelpers } from '../../utils/test-helpers';
import {
  generateScheduleForStudent,
  generateSchedulesForStudents,
  balanceSectionEnrollment,
  generateOptimizedSchedules,
  type Student,
  type Section,
  type GeneratedSchedule,
} from '@/lib/schedule-generator';

// =====================================================
// TESTS
// =====================================================

describe('Schedule Generator', () => {
  // No setup/cleanup needed - these are pure unit tests
  // that don't require database access
  
  describe('generateScheduleForStudent', () => {
    it('should generate valid schedule for level 1 student', () => {
      const student: Student = {
        id: TEST_FIXTURES.users.students[0].id,
        level: 1,
      };
      
      const sections: Section[] = [
        {
          id: 'SWE101-01',
          course_code: 'SWE101',
          instructor_id: 'FAC1',
          room_number: 'A101',
          capacity: 25,
          enrolled_count: 20,
          times: [
            { day: 'SUNDAY', start: '08:00', end: '09:30' },
          ],
        },
        {
          id: 'SWE102-01',
          course_code: 'SWE102',
          instructor_id: 'FAC2',
          room_number: 'A102',
          capacity: 25,
          enrolled_count: 20,
          times: [
            { day: 'SUNDAY', start: '10:00', end: '11:30' },
          ],
        },
      ];
      
      const schedule = generateScheduleForStudent(student, sections);
      
      expect(schedule.student_id).toBe(student.id);
      expect(schedule.sections).toHaveLength(2);
      expect(schedule.statistics.total_credits).toBe(6);
      expect(schedule.warnings).toHaveLength(0);
    });
    
    it('should detect no available sections', () => {
      const student: Student = {
        id: TEST_FIXTURES.users.students[0].id,
        level: 1,
      };
      
      const sections: Section[] = []; // No sections available
      
      const schedule = generateScheduleForStudent(student, sections);
      
      expect(schedule.sections).toHaveLength(0);
      expect(schedule.warnings.length).toBeGreaterThan(0);
      expect(schedule.warnings.some(w => w.includes('No sections available'))).toBe(true);
    });
    
    it('should detect full sections', () => {
      const student: Student = {
        id: TEST_FIXTURES.users.students[0].id,
        level: 1,
      };
      
      const sections: Section[] = [
        {
          id: 'SWE101-01',
          course_code: 'SWE101',
          instructor_id: 'FAC1',
          room_number: 'A101',
          capacity: 25,
          enrolled_count: 25, // Full
          times: [{ day: 'SUNDAY', start: '08:00', end: '09:30' }],
        },
      ];
      
      const schedule = generateScheduleForStudent(student, sections);
      
      expect(schedule.warnings.some(w => w.includes('All sections full'))).toBe(true);
    });
    
    it('should detect time conflicts', () => {
      const student: Student = {
        id: TEST_FIXTURES.users.students[0].id,
        level: 1,
      };
      
      const sections: Section[] = [
        {
          id: 'SWE101-01',
          course_code: 'SWE101',
          instructor_id: 'FAC1',
          room_number: 'A101',
          capacity: 25,
          enrolled_count: 20,
          times: [{ day: 'SUNDAY', start: '08:00', end: '09:30' }],
        },
        {
          id: 'SWE102-01',
          course_code: 'SWE102',
          instructor_id: 'FAC2',
          room_number: 'A102',
          capacity: 25,
          enrolled_count: 20,
          times: [{ day: 'SUNDAY', start: '09:00', end: '10:30' }], // Conflicts with SWE101
        },
      ];
      
      const schedule = generateScheduleForStudent(student, sections);
      
      expect(schedule.sections.length).toBeLessThan(2);
      expect(schedule.warnings.some(w => w.includes('conflict'))).toBe(true);
    });
    
    it('should handle different student levels', () => {
      const level2Student: Student = {
        id: TEST_FIXTURES.users.students[5].id,
        level: 2,
      };
      
      const sections: Section[] = [
        {
          id: 'SWE201-01',
          course_code: 'SWE201',
          instructor_id: 'FAC1',
          room_number: 'B201',
          capacity: 20,
          enrolled_count: 15,
          times: [{ day: 'MONDAY', start: '08:00', end: '09:30' }],
        },
      ];
      
      const schedule = generateScheduleForStudent(level2Student, sections);
      
      expect(schedule.sections).toHaveLength(1);
      expect(schedule.sections[0].course_code).toBe('SWE201');
    });
  });
  
  describe('generateSchedulesForStudents', () => {
    it('should generate schedules for multiple students', () => {
      const students: Student[] = [
        { id: 'STU1', level: 1 },
        { id: 'STU2', level: 1 },
        { id: 'STU3', level: 1 },
      ];
      
      const sections: Section[] = [
        {
          id: 'SWE101-01',
          course_code: 'SWE101',
          instructor_id: 'FAC1',
          room_number: 'A101',
          capacity: 25,
          enrolled_count: 0,
          times: [{ day: 'SUNDAY', start: '08:00', end: '09:30' }],
        },
        {
          id: 'SWE102-01',
          course_code: 'SWE102',
          instructor_id: 'FAC2',
          room_number: 'A102',
          capacity: 25,
          enrolled_count: 0,
          times: [{ day: 'MONDAY', start: '08:00', end: '09:30' }],
        },
      ];
      
      const schedules = generateSchedulesForStudents(students, sections);
      
      expect(schedules).toHaveLength(3);
      schedules.forEach(schedule => {
        expect(schedule.sections).toHaveLength(2);
      });
    });
  });
  
  describe('balanceSectionEnrollment', () => {
    it('should detect balanced enrollment', () => {
      const schedules: GeneratedSchedule[] = [
        {
          student_id: 'STU1',
          sections: [{ id: 'SEC1' } as Section],
          statistics: { total_credits: 3, total_courses: 1, conflicts: 0 },
          warnings: [],
        },
        {
          student_id: 'STU2',
          sections: [{ id: 'SEC2' } as Section],
          statistics: { total_credits: 3, total_courses: 1, conflicts: 0 },
          warnings: [],
        },
      ];
      
      const balance = balanceSectionEnrollment(schedules);
      
      expect(balance.balanced).toBe(true);
      expect(balance.maxEnrollment).toBe(1);
      expect(balance.minEnrollment).toBe(1);
    });
    
    it('should detect unbalanced enrollment', () => {
      const schedules: GeneratedSchedule[] = [
        ...Array(10).fill(null).map((_, i) => ({
          student_id: `STU${i}`,
          sections: [{ id: 'SEC1' } as Section],
          statistics: { total_credits: 3, total_courses: 1, conflicts: 0 },
          warnings: [],
        })),
        {
          student_id: 'STU11',
          sections: [{ id: 'SEC2' } as Section],
          statistics: { total_credits: 3, total_courses: 1, conflicts: 0 },
          warnings: [],
        },
      ];
      
      const balance = balanceSectionEnrollment(schedules);
      
      expect(balance.balanced).toBe(false);
      expect(balance.maxEnrollment).toBeGreaterThan(balance.minEnrollment);
    });
  });
  
  describe('generateOptimizedSchedules', () => {
    it('should optimize schedule generation', () => {
      const students: Student[] = Array(10).fill(null).map((_, i) => ({
        id: `STU${i}`,
        level: 1,
      }));
      
      const sections: Section[] = [
        {
          id: 'SWE101-01',
          course_code: 'SWE101',
          instructor_id: 'FAC1',
          room_number: 'A101',
          capacity: 25,
          enrolled_count: 0,
          times: [{ day: 'SUNDAY', start: '08:00', end: '09:30' }],
        },
        {
          id: 'SWE102-01',
          course_code: 'SWE102',
          instructor_id: 'FAC2',
          room_number: 'A102',
          capacity: 25,
          enrolled_count: 0,
          times: [{ day: 'MONDAY', start: '08:00', end: '09:30' }],
        },
      ];
      
      const result = generateOptimizedSchedules(students, sections);
      
      expect(result.schedules).toHaveLength(10);
      expect(result.iterations).toBeGreaterThan(0);
      expect(result.iterations).toBeLessThanOrEqual(10);
    });
  });
  
  describe('Integration with Fixtures', () => {
    it('should generate schedules using fixture data', () => {
      const students = TEST_FIXTURES.users.students.slice(0, 5).map((s, i) => ({
        id: s.id,
        level: 1,
      }));
      
      const sections = TEST_FIXTURES.sections.sections.slice(0, 4).map(s => {
        const times = TEST_FIXTURES.sections.helpers.getTimesForSection(s.id);
        return {
          id: s.id,
          course_code: s.course_code,
          instructor_id: s.instructor_id,
          room_number: s.room_number,
          capacity: s.capacity,
          enrolled_count: s.enrolled_count,
          times: times.map(t => ({
            day: t.day,
            start: t.start_time,
            end: t.end_time,
          })),
        };
      });
      
      const schedules = generateSchedulesForStudents(students, sections);
      
      expect(schedules).toHaveLength(5);
      schedules.forEach(schedule => {
        expect(schedule.sections.length).toBeGreaterThanOrEqual(0);
      });
    });
  });
});

