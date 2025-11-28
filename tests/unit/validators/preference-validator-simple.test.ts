/**
 * Preference Validator Unit Tests
 * TDD approach - Tests for elective preference validation logic
 */

import { describe, it, expect } from 'vitest';
import {
  validateElectivePreference,
  validatePreferenceUniqueness,
  validatePreferenceCount,
  validatePackageRequirements,
  validateAllPreferences,
  type ElectivePreference,
} from '../../../src/lib/validations/preference-validator';

// =====================================================
// TEST: validateElectivePreference
// =====================================================

describe('Preference Validator', () => {
  describe('validateElectivePreference', () => {
    it('should validate correct preference', () => {
      const preference: ElectivePreference = {
        student_id: 'student-0001-0000-0000-000000000000',
        course_code: 'SWE401',
        preference_order: 1,
        term_code: '471',
      };
      
      const result = validateElectivePreference(preference);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject missing student_id', () => {
      const preference: ElectivePreference = {
        student_id: '',
        course_code: 'SWE401',
        preference_order: 1,
        term_code: '471',
      };
      
      const result = validateElectivePreference(preference);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Student ID is required');
    });
    
    it('should reject missing course_code', () => {
      const preference: ElectivePreference = {
        student_id: 'student-0001-0000-0000-000000000000',
        course_code: '',
        preference_order: 1,
        term_code: '471',
      };
      
      const result = validateElectivePreference(preference);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Course code is required');
    });
    
    it('should reject invalid preference order (too low)', () => {
      const preference: ElectivePreference = {
        student_id: 'student-0001-0000-0000-000000000000',
        course_code: 'SWE401',
        preference_order: 0,
        term_code: '471',
      };
      
      const result = validateElectivePreference(preference);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Preference order must be between 1 and 10');
    });
    
    it('should reject invalid preference order (too high)', () => {
      const preference: ElectivePreference = {
        student_id: 'student-0001-0000-0000-000000000000',
        course_code: 'SWE401',
        preference_order: 11,
        term_code: '471',
      };
      
      const result = validateElectivePreference(preference);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Preference order must be between 1 and 10');
    });
    
    it('should reject invalid course code format', () => {
      const preference: ElectivePreference = {
        student_id: 'student-0001-0000-0000-000000000000',
        course_code: 'INVALID',
        preference_order: 1,
        term_code: '471',
      };
      
      const result = validateElectivePreference(preference);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid course code format (expected: ABC123)');
    });
    
    it('should handle multiple errors', () => {
      const preference: ElectivePreference = {
        student_id: '',
        course_code: 'INVALID',
        preference_order: 99,
        term_code: '',
      };
      
      const result = validateElectivePreference(preference);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(2);
    });
  });
  
  // =====================================================
  // TEST: validatePreferenceUniqueness
  // =====================================================
  
  describe('validatePreferenceUniqueness', () => {
    it('should validate unique preferences', () => {
      const preferences = [
        { course_code: 'SWE401', preference_order: 1 },
        { course_code: 'SWE402', preference_order: 2 },
        { course_code: 'SWE403', preference_order: 3 },
      ];
      
      const result = validatePreferenceUniqueness(preferences);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject duplicate course codes', () => {
      const preferences = [
        { course_code: 'SWE401', preference_order: 1 },
        { course_code: 'SWE401', preference_order: 2 }, // Duplicate
        { course_code: 'SWE403', preference_order: 3 },
      ];
      
      const result = validatePreferenceUniqueness(preferences);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duplicate courses not allowed');
    });
    
    it('should reject duplicate preference orders', () => {
      const preferences = [
        { course_code: 'SWE401', preference_order: 1 },
        { course_code: 'SWE402', preference_order: 1 }, // Duplicate order
        { course_code: 'SWE403', preference_order: 3 },
      ];
      
      const result = validatePreferenceUniqueness(preferences);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Duplicate preference orders not allowed');
    });
    
    it('should handle empty preference list', () => {
      const preferences: Array<{ course_code: string; preference_order: number }> = [];
      
      const result = validatePreferenceUniqueness(preferences);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
  
  // =====================================================
  // TEST: validatePreferenceCount
  // =====================================================
  
  describe('validatePreferenceCount', () => {
    it('should validate correct count', () => {
      const result = validatePreferenceCount(5);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject count below minimum', () => {
      const result = validatePreferenceCount(2, 3, 10);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Minimum 3 preferences required');
    });
    
    it('should reject count above maximum', () => {
      const result = validatePreferenceCount(11, 3, 10);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Maximum 10 preferences allowed');
    });
    
    it('should accept count at minimum boundary', () => {
      const result = validatePreferenceCount(3, 3, 10);
      
      expect(result.valid).toBe(true);
    });
    
    it('should accept count at maximum boundary', () => {
      const result = validatePreferenceCount(10, 3, 10);
      
      expect(result.valid).toBe(true);
    });
    
    it('should support custom min/max', () => {
      const result = validatePreferenceCount(7, 5, 8);
      
      expect(result.valid).toBe(true);
    });
  });
  
  // =====================================================
  // TEST: validatePackageRequirements
  // =====================================================
  
  describe('validatePackageRequirements', () => {
    it('should validate when package requirements are met', () => {
      const preferences = [
        { course_code: 'SWE401', package_name: 'humanities' },
        { course_code: 'SWE402', package_name: 'technical' },
        { course_code: 'SWE403', package_name: 'technical' },
      ];
      
      const requirements = {
        humanities: { min: 1, max: 2 },
        technical: { min: 2, max: 4 },
      };
      
      const result = validatePackageRequirements(preferences, requirements);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject when minimum package requirements not met', () => {
      const preferences = [
        { course_code: 'SWE401', package_name: 'technical' },
        { course_code: 'SWE402', package_name: 'technical' },
      ];
      
      const requirements = {
        humanities: { min: 1 },
        technical: { min: 2 },
      };
      
      const result = validatePackageRequirements(preferences, requirements);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Minimum 1 courses required from humanities package');
    });
    
    it('should reject when maximum package requirements exceeded', () => {
      const preferences = [
        { course_code: 'SWE401', package_name: 'humanities' },
        { course_code: 'SWE402', package_name: 'humanities' },
        { course_code: 'SWE403', package_name: 'humanities' },
      ];
      
      const requirements = {
        humanities: { min: 1, max: 2 },
      };
      
      const result = validatePackageRequirements(preferences, requirements);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Maximum 2 courses allowed from humanities package');
    });
  });
  
  // =====================================================
  // TEST: validateAllPreferences (Integration)
  // =====================================================
  
  describe('validateAllPreferences', () => {
    it('should validate complete valid preference set', () => {
      const preferences: ElectivePreference[] = [
        {
          student_id: 'student-0001-0000-0000-000000000000',
          course_code: 'SWE401',
          preference_order: 1,
          term_code: '471',
        },
        {
          student_id: 'student-0001-0000-0000-000000000000',
          course_code: 'SWE402',
          preference_order: 2,
          term_code: '471',
        },
        {
          student_id: 'student-0001-0000-0000-000000000000',
          course_code: 'SWE403',
          preference_order: 3,
          term_code: '471',
        },
      ];
      
      const result = validateAllPreferences(preferences);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should catch count, format, and uniqueness errors', () => {
      const preferences: ElectivePreference[] = [
        {
          student_id: 'student-0001-0000-0000-000000000000',
          course_code: 'INVALID',
          preference_order: 1,
          term_code: '471',
        },
        {
          student_id: 'student-0001-0000-0000-000000000000',
          course_code: 'SWE401',
          preference_order: 1, // Duplicate order
          term_code: '471',
        },
      ];
      
      const result = validateAllPreferences(preferences);
      
      expect(result.valid).toBe(false);
      // Should have multiple errors
      expect(result.errors.length).toBeGreaterThan(2);
    });
  });
});

