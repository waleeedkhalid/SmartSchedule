/**
 * Irregular Student Validator Unit Tests
 * TDD approach - Tests for irregular student validation
 */

import { describe, it, expect } from 'vitest';
import {
  validateMissingCourses,
  validatePrerequisites,
  validateCreditHourLimit,
  validateIrregularStudent,
  type IrregularStudentInfo,
  type CoursePrerequisite,
} from '../../../src/lib/validations/irregular-student-validator';

describe('Irregular Student Validator', () => {
  describe('validateMissingCourses', () => {
    it('should validate when all missing courses are scheduled', () => {
      const studentInfo: IrregularStudentInfo = {
        student_id: 'student-001',
        current_level: 3,
        missing_courses: ['SWE101', 'SWE102'],
        current_credit_hours: 12,
        max_credit_hours: 21,
      };
      
      const scheduledCourses = ['SWE101', 'SWE102', 'SWE301'];
      const result = validateMissingCourses(studentInfo, scheduledCourses);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject when missing courses are not scheduled', () => {
      const studentInfo: IrregularStudentInfo = {
        student_id: 'student-001',
        current_level: 3,
        missing_courses: ['SWE101', 'SWE102'],
        current_credit_hours: 12,
        max_credit_hours: 21,
      };
      
      const scheduledCourses = ['SWE301']; // Missing SWE101, SWE102
      const result = validateMissingCourses(studentInfo, scheduledCourses);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.missingPrerequisites).toContain('SWE101');
      expect(result.missingPrerequisites).toContain('SWE102');
    });
  });
  
  describe('validatePrerequisites', () => {
    it('should validate when prerequisites are met', () => {
      const plannedCourses = ['SWE201', 'SWE202'];
      const completedCourses = ['SWE101', 'SWE102'];
      const prerequisites: CoursePrerequisite[] = [
        { course_code: 'SWE201', prerequisites: ['SWE101'] },
        { course_code: 'SWE202', prerequisites: ['SWE102'] },
      ];
      
      const result = validatePrerequisites(plannedCourses, completedCourses, prerequisites);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject when prerequisites are missing', () => {
      const plannedCourses = ['SWE201'];
      const completedCourses = ['SWE102']; // Missing SWE101
      const prerequisites: CoursePrerequisite[] = [
        { course_code: 'SWE201', prerequisites: ['SWE101'] },
      ];
      
      const result = validatePrerequisites(plannedCourses, completedCourses, prerequisites);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.missingPrerequisites).toContain('SWE101');
    });
    
    it('should handle multiple prerequisites', () => {
      const plannedCourses = ['SWE301'];
      const completedCourses = ['SWE101']; // Missing SWE201
      const prerequisites: CoursePrerequisite[] = [
        { course_code: 'SWE301', prerequisites: ['SWE101', 'SWE201'] },
      ];
      
      const result = validatePrerequisites(plannedCourses, completedCourses, prerequisites);
      
      expect(result.valid).toBe(false);
      expect(result.missingPrerequisites).toContain('SWE201');
    });
  });
  
  describe('validateCreditHourLimit', () => {
    it('should validate when under credit hour limit', () => {
      const studentInfo: IrregularStudentInfo = {
        student_id: 'student-001',
        current_level: 3,
        missing_courses: [],
        current_credit_hours: 12,
        max_credit_hours: 21,
      };
      
      const result = validateCreditHourLimit(studentInfo, 6);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject when exceeding credit hour limit', () => {
      const studentInfo: IrregularStudentInfo = {
        student_id: 'student-001',
        current_level: 3,
        missing_courses: [],
        current_credit_hours: 18,
        max_credit_hours: 21,
      };
      
      const result = validateCreditHourLimit(studentInfo, 6); // 18 + 6 = 24 > 21
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Credit hour limit exceeded');
    });
    
    it('should warn when approaching credit hour limit', () => {
      const studentInfo: IrregularStudentInfo = {
        student_id: 'student-001',
        current_level: 3,
        missing_courses: [],
        current_credit_hours: 18,
        max_credit_hours: 21,
      };
      
      const result = validateCreditHourLimit(studentInfo, 2); // 18 + 2 = 20 (within 3 of 21)
      
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
  
  describe('validateIrregularStudent (comprehensive)', () => {
    it('should validate valid irregular student schedule', () => {
      const studentInfo: IrregularStudentInfo = {
        student_id: 'student-001',
        current_level: 3,
        missing_courses: ['SWE101'],
        current_credit_hours: 12,
        max_credit_hours: 21,
      };
      
      const scheduledCourses = ['SWE101', 'SWE301'];
      const completedCourses = ['SWE102', 'SWE201'];
      const prerequisites: CoursePrerequisite[] = [
        { course_code: 'SWE301', prerequisites: ['SWE201'] },
      ];
      
      const result = validateIrregularStudent(
        studentInfo,
        scheduledCourses,
        completedCourses,
        prerequisites,
        6
      );
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should catch multiple validation errors', () => {
      const studentInfo: IrregularStudentInfo = {
        student_id: 'student-001',
        current_level: 3,
        missing_courses: ['SWE101', 'SWE102'],
        current_credit_hours: 18,
        max_credit_hours: 21,
      };
      
      const scheduledCourses = ['SWE301']; // Missing required courses
      const completedCourses = []; // No prerequisites met
      const prerequisites: CoursePrerequisite[] = [
        { course_code: 'SWE301', prerequisites: ['SWE201'] },
      ];
      
      const result = validateIrregularStudent(
        studentInfo,
        scheduledCourses,
        completedCourses,
        prerequisites,
        6 // Will exceed credit limit
      );
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
