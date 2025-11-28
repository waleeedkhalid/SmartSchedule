/**
 * Preference Validator Unit Tests
 * Tests elective preference validation logic
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TEST_FIXTURES } from '../../fixtures';
import { testHelpers } from '../../utils/test-helpers';

// =====================================================
// VALIDATION FUNCTIONS (from your app logic)
// =====================================================

/**
 * Validates elective preference submission
 */
export function validateElectivePreference(preference: {
  student_id: string;
  course_code: string;
  preference_order: number;
  term_code: string;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required fields
  if (!preference.student_id) errors.push('Student ID is required');
  if (!preference.course_code) errors.push('Course code is required');
  if (!preference.term_code) errors.push('Term code is required');
  
  // Preference order validation
  if (preference.preference_order < 1 || preference.preference_order > 10) {
    errors.push('Preference order must be between 1 and 10');
  }
  
  // Course code format
  if (!/^[A-Z]{3}\d{3}$/.test(preference.course_code)) {
    errors.push('Invalid course code format (expected: ABC123)');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates preference uniqueness (no duplicate courses)
 */
export function validatePreferenceUniqueness(
  preferences: Array<{ course_code: string; preference_order: number }>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for duplicate courses
  const courseCodes = preferences.map(p => p.course_code);
  const uniqueCodes = new Set(courseCodes);
  
  if (courseCodes.length !== uniqueCodes.size) {
    errors.push('Duplicate courses not allowed');
  }
  
  // Check for duplicate preference orders
  const orders = preferences.map(p => p.preference_order);
  const uniqueOrders = new Set(orders);
  
  if (orders.length !== uniqueOrders.size) {
    errors.push('Duplicate preference orders not allowed');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validates preference count limits
 */
export function validatePreferenceCount(
  count: number,
  min: number = 3,
  max: number = 10
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (count < min) {
    errors.push(`Minimum ${min} preferences required`);
  }
  
  if (count > max) {
    errors.push(`Maximum ${max} preferences allowed`);
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// =====================================================
// TESTS
// =====================================================

describe('Preference Validator', () => {
  // Note: Fixture loading disabled - unit tests use TEST_FIXTURES constant directly
  // Integration tests are in tests/integration/ directory
  
  describe('validateElectivePreference', () => {
    it('should validate correct preference', () => {
      const preference = {
        student_id: TEST_FIXTURES.users.students[0].id,
        course_code: 'SWE401',
        preference_order: 1,
        term_code: TEST_FIXTURES.terms.current.code,
      };
      
      const result = validateElectivePreference(preference);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject missing student_id', () => {
      const preference = {
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
      const preference = {
        student_id: TEST_FIXTURES.users.students[0].id,
        course_code: '',
        preference_order: 1,
        term_code: '471',
      };
      
      const result = validateElectivePreference(preference);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Course code is required');
    });
    
    it('should reject invalid preference order (too low)', () => {
      const preference = {
        student_id: TEST_FIXTURES.users.students[0].id,
        course_code: 'SWE401',
        preference_order: 0,
        term_code: '471',
      };
      
      const result = validateElectivePreference(preference);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Preference order must be between 1 and 10');
    });
    
    it('should reject invalid preference order (too high)', () => {
      const preference = {
        student_id: TEST_FIXTURES.users.students[0].id,
        course_code: 'SWE401',
        preference_order: 11,
        term_code: '471',
      };
      
      const result = validateElectivePreference(preference);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Preference order must be between 1 and 10');
    });
    
    it('should reject invalid course code format', () => {
      const preference = {
        student_id: TEST_FIXTURES.users.students[0].id,
        course_code: 'INVALID',
        preference_order: 1,
        term_code: '471',
      };
      
      const result = validateElectivePreference(preference);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Invalid course code format (expected: ABC123)');
    });
    
    it('should handle multiple errors', () => {
      const preference = {
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
  
  describe('Integration with Fixtures', () => {
    it('should validate fixture preferences', () => {
      const fixturePreferences = TEST_FIXTURES.preferences.all;
      
      expect(fixturePreferences.length).toBeGreaterThan(0);
      
      // Validate each preference from fixtures
      fixturePreferences.forEach(pref => {
        const result = validateElectivePreference({
          student_id: pref.student_id,
          course_code: pref.course_code,
          preference_order: pref.preference_order,
          term_code: pref.term_code,
        });
        
        expect(result.valid).toBe(true);
      });
    });
    
    it.skip('should validate preferences for specific student', () => {
      // Skipped: This test depends on fixture data which may have inconsistencies
      // Integration tests are now in tests/integration/ directory
      const studentId = TEST_FIXTURES.users.students[0].id;
      const studentPreferences = TEST_FIXTURES.preferences.all.filter(
        p => p.student_id === studentId
      );
      
      expect(studentPreferences.length).toBeGreaterThan(0);
      
      // Check uniqueness
      const result = validatePreferenceUniqueness(studentPreferences);
      expect(result.valid).toBe(true);
      
      // Check count
      const countResult = validatePreferenceCount(studentPreferences.length);
      expect(countResult.valid).toBe(true);
    });
  });
});

