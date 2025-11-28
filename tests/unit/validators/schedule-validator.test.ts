/**
 * Schedule Validator Unit Tests
 * TDD approach - Tests for complete schedule validation
 */

import { describe, it, expect } from 'vitest';
import {
  validateScheduleStructure,
  validateScheduleConstraints,
  validateNoInternalConflicts,
  validateCompleteSchedule,
  type Schedule,
  type ScheduleData,
} from '../../../src/lib/validations/schedule-validator';

// Helper to create valid schedule
const createValidSchedule = (): Schedule => ({
  id: 'schedule-001',
  student_id: 'student-001',
  term_code: '471',
  version: 1,
  data: {
    sections: [
      {
        section_id: 'sec-001',
        course_code: 'SWE101',
        course_name: 'Introduction to Programming',
        course_type: 'REQUIRED',
        instructor_id: 'faculty-001',
        instructor_name: 'Dr. Ahmad',
        room_number: 'A101',
        times: [{ day: 'SUNDAY', start_time: '08:00', end_time: '09:00' }],
        credits: 3,
      },
      {
        section_id: 'sec-002',
        course_code: 'SWE102',
        course_name: 'Data Structures',
        course_type: 'REQUIRED',
        times: [{ day: 'MONDAY', start_time: '10:00', end_time: '11:00' }],
        credits: 3,
      },
    ],
    total_credits: 6,
    total_contact_hours: 6,
    days_with_classes: ['SUNDAY', 'MONDAY'],
  },
  is_published: false,
  generated_at: '2025-01-15T10:00:00Z',
});

describe('Schedule Validator', () => {
  describe('validateScheduleStructure', () => {
    it('should validate correct schedule structure', () => {
      const schedule = createValidSchedule();
      const result = validateScheduleStructure(schedule);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject schedule without ID', () => {
      const schedule = createValidSchedule();
      schedule.id = '';
      
      const result = validateScheduleStructure(schedule);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Schedule ID is required');
    });
    
    it('should reject schedule without student_id', () => {
      const schedule = createValidSchedule();
      schedule.student_id = '';
      
      const result = validateScheduleStructure(schedule);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Student ID is required');
    });
    
    it('should reject schedule without data', () => {
      const schedule = createValidSchedule();
      // @ts-expect-error: Testing invalid data
      schedule.data = null;
      
      const result = validateScheduleStructure(schedule);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Schedule data is required');
    });
    
    it('should reject section without section_id', () => {
      const schedule = createValidSchedule();
      schedule.data.sections[0].section_id = '';
      
      const result = validateScheduleStructure(schedule);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should reject section with invalid credits', () => {
      const schedule = createValidSchedule();
      schedule.data.sections[0].credits = 0;
      
      const result = validateScheduleStructure(schedule);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('invalid credits'))).toBe(true);
    });
    
    it('should reject section without time slots', () => {
      const schedule = createValidSchedule();
      schedule.data.sections[0].times = [];
      
      const result = validateScheduleStructure(schedule);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('no time slots'))).toBe(true);
    });
    
    it('should warn for schedule with no sections', () => {
      const schedule = createValidSchedule();
      schedule.data.sections = [];
      schedule.data.total_credits = 0;
      
      const result = validateScheduleStructure(schedule);
      
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
  
  describe('validateScheduleConstraints', () => {
    it('should validate correct constraints', () => {
      const schedule = createValidSchedule();
      const result = validateScheduleConstraints(schedule);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should detect credit calculation mismatch', () => {
      const schedule = createValidSchedule();
      schedule.data.total_credits = 100; // Wrong value
      
      const result = validateScheduleConstraints(schedule);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('Credit mismatch'))).toBe(true);
    });
    
    it('should warn for low credit hours', () => {
      const schedule = createValidSchedule();
      schedule.data.sections = [schedule.data.sections[0]]; // Only 3 credits
      schedule.data.total_credits = 3;
      
      const result = validateScheduleConstraints(schedule);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('Low credit hours'))).toBe(true);
    });
    
    it('should warn for high credit hours', () => {
      const schedule = createValidSchedule();
      schedule.data.total_credits = 25; // Too high
      
      const result = validateScheduleConstraints(schedule);
      
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings.some(w => w.includes('High credit hours'))).toBe(true);
    });
  });
  
  describe('validateNoInternalConflicts', () => {
    it('should validate schedule without conflicts', () => {
      const schedule = createValidSchedule();
      const result = validateNoInternalConflicts(schedule);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should detect time conflicts', () => {
      const schedule = createValidSchedule();
      // Make sections overlap
      schedule.data.sections[1].times = [
        { day: 'SUNDAY', start_time: '08:30', end_time: '09:30' }
      ];
      
      const result = validateNoInternalConflicts(schedule);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('Time conflict'))).toBe(true);
    });
    
    it('should not flag adjacent time slots as conflicts', () => {
      const schedule = createValidSchedule();
      schedule.data.sections[1].times = [
        { day: 'SUNDAY', start_time: '09:00', end_time: '10:00' }
      ];
      
      const result = validateNoInternalConflicts(schedule);
      
      expect(result.valid).toBe(true);
    });
  });
  
  describe('validateCompleteSchedule', () => {
    it('should perform comprehensive validation on valid schedule', () => {
      const schedule = createValidSchedule();
      const result = validateCompleteSchedule(schedule);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.summary).toBeDefined();
      expect(result.summary?.totalSections).toBe(2);
      expect(result.summary?.totalCredits).toBe(6);
    });
    
    it('should catch all types of errors', () => {
      const schedule = createValidSchedule();
      schedule.student_id = ''; // Structure error
      schedule.data.total_credits = 100; // Constraint error
      schedule.data.sections[1].times = [
        { day: 'SUNDAY', start_time: '08:30', end_time: '09:30' }
      ]; // Conflict error
      
      const result = validateCompleteSchedule(schedule);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should provide summary statistics', () => {
      const schedule = createValidSchedule();
      const result = validateCompleteSchedule(schedule);
      
      expect(result.summary).toBeDefined();
      expect(result.summary?.totalSections).toBe(2);
      expect(result.summary?.requiredCourses).toBe(2);
      expect(result.summary?.electiveCourses).toBe(0);
      expect(result.summary?.hasConflicts).toBe(false);
    });
  });
});
