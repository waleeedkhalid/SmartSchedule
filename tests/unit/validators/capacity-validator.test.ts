/**
 * Capacity Validator Unit Tests
 * TDD approach - Tests for capacity validation
 */

import { describe, it, expect } from 'vitest';
import {
  calculateUtilization,
  validateSectionEnrollment,
  validateSectionRoomCapacity,
  validateRoomCapacity,
  validateMultipleSections,
  canAddEnrollment,
  getCapacityStatistics,
  type SectionCapacityInfo,
  type RoomCapacityInfo,
  type CapacityInfo,
} from '../../../src/lib/validations/capacity-validator';

// =====================================================
// TEST: Utilization Calculation
// =====================================================

describe('Capacity Validator', () => {
  describe('calculateUtilization', () => {
    it('should calculate utilization percentage', () => {
      expect(calculateUtilization(50, 100)).toBe(50);
    });
    
    it('should return 100 when at capacity', () => {
      expect(calculateUtilization(100, 100)).toBe(100);
    });
    
    it('should return over 100 when over capacity', () => {
      expect(calculateUtilization(110, 100)).toBeCloseTo(110, 1);
    });
    
    it('should return 0 for zero capacity', () => {
      expect(calculateUtilization(10, 0)).toBe(0);
    });
    
    it('should handle fractional percentages', () => {
      expect(calculateUtilization(33, 100)).toBe(33);
    });
  });
  
  // =====================================================
  // TEST: Section Enrollment Validation
  // =====================================================
  
  describe('validateSectionEnrollment', () => {
    it('should validate enrollment within capacity', () => {
      const section: SectionCapacityInfo = {
        entity_id: 'sec-001',
        entity_type: 'SECTION',
        section_id: 'sec-001',
        course_code: 'SWE101',
        section_number: 1,
        current: 30,
        capacity: 40,
        utilization: 75,
      };
      
      const result = validateSectionEnrollment(section);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject enrollment exceeding capacity', () => {
      const section: SectionCapacityInfo = {
        entity_id: 'sec-001',
        entity_type: 'SECTION',
        section_id: 'sec-001',
        course_code: 'SWE101',
        section_number: 1,
        current: 45,
        capacity: 40,
        utilization: 112.5,
      };
      
      const result = validateSectionEnrollment(section);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('over capacity');
    });
    
    it('should warn when approaching capacity threshold', () => {
      const section: SectionCapacityInfo = {
        entity_id: 'sec-001',
        entity_type: 'SECTION',
        section_id: 'sec-001',
        course_code: 'SWE101',
        section_number: 1,
        current: 37,
        capacity: 40,
        utilization: 92.5,
      };
      
      const result = validateSectionEnrollment(section);
      
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
    
    it('should reject negative enrollment', () => {
      const section: SectionCapacityInfo = {
        entity_id: 'sec-001',
        entity_type: 'SECTION',
        section_id: 'sec-001',
        course_code: 'SWE101',
        section_number: 1,
        current: -5,
        capacity: 40,
        utilization: 0,
      };
      
      const result = validateSectionEnrollment(section);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Section SWE101-1 has negative enrollment: -5');
    });
    
    it('should reject zero or negative capacity', () => {
      const section: SectionCapacityInfo = {
        entity_id: 'sec-001',
        entity_type: 'SECTION',
        section_id: 'sec-001',
        course_code: 'SWE101',
        section_number: 1,
        current: 30,
        capacity: 0,
        utilization: 0,
      };
      
      const result = validateSectionEnrollment(section);
      
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Section SWE101-1 has invalid capacity: 0');
    });
    
    it('should use custom threshold', () => {
      const section: SectionCapacityInfo = {
        entity_id: 'sec-001',
        entity_type: 'SECTION',
        section_id: 'sec-001',
        course_code: 'SWE101',
        section_number: 1,
        current: 33,
        capacity: 40,
        utilization: 82.5,
      };
      
      const result = validateSectionEnrollment(section, { warning: 80, critical: 100 });
      
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
  
  // =====================================================
  // TEST: Section vs Room Capacity
  // =====================================================
  
  describe('validateSectionRoomCapacity', () => {
    it('should validate when section capacity is within room capacity', () => {
      const result = validateSectionRoomCapacity(40, 50, 'SWE101', 1, 'A101');
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject when section capacity exceeds room capacity', () => {
      const result = validateSectionRoomCapacity(50, 40, 'SWE101', 1, 'A101');
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('exceeds room');
    });
    
    it('should warn when section capacity is very close to room capacity', () => {
      const result = validateSectionRoomCapacity(48, 50, 'SWE101', 1, 'A101');
      
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
  
  // =====================================================
  // TEST: Room Capacity Validation
  // =====================================================
  
  describe('validateRoomCapacity', () => {
    it('should validate occupancy within capacity', () => {
      const room: RoomCapacityInfo = {
        entity_id: 'A101',
        entity_type: 'ROOM',
        room_number: 'A101',
        current: 30,
        capacity: 50,
        utilization: 60,
      };
      
      const result = validateRoomCapacity(room);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    it('should reject occupancy exceeding capacity', () => {
      const room: RoomCapacityInfo = {
        entity_id: 'A101',
        entity_type: 'ROOM',
        room_number: 'A101',
        current: 55,
        capacity: 50,
        utilization: 110,
      };
      
      const result = validateRoomCapacity(room);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    it('should warn when approaching capacity', () => {
      const room: RoomCapacityInfo = {
        entity_id: 'A101',
        entity_type: 'ROOM',
        room_number: 'A101',
        current: 46,
        capacity: 50,
        utilization: 92,
      };
      
      const result = validateRoomCapacity(room);
      
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });
  
  // =====================================================
  // TEST: Multiple Sections Validation
  // =====================================================
  
  describe('validateMultipleSections', () => {
    it('should validate multiple sections and provide summary', () => {
      const sections: SectionCapacityInfo[] = [
        {
          entity_id: 'sec-001',
          entity_type: 'SECTION',
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          current: 30,
          capacity: 40,
          utilization: 75,
        },
        {
          entity_id: 'sec-002',
          entity_type: 'SECTION',
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          current: 25,
          capacity: 40,
          utilization: 62.5,
        },
      ];
      
      const result = validateMultipleSections(sections);
      
      expect(result.valid).toBe(true);
      expect(result.summary.total).toBe(2);
      expect(result.summary.valid).toBe(2);
      expect(result.summary.overCapacity).toBe(0);
    });
    
    it('should detect over-capacity sections', () => {
      const sections: SectionCapacityInfo[] = [
        {
          entity_id: 'sec-001',
          entity_type: 'SECTION',
          section_id: 'sec-001',
          course_code: 'SWE101',
          section_number: 1,
          current: 45,
          capacity: 40,
          utilization: 112.5,
        },
        {
          entity_id: 'sec-002',
          entity_type: 'SECTION',
          section_id: 'sec-002',
          course_code: 'SWE102',
          section_number: 1,
          current: 25,
          capacity: 40,
          utilization: 62.5,
        },
      ];
      
      const result = validateMultipleSections(sections);
      
      expect(result.valid).toBe(false);
      expect(result.summary.overCapacity).toBe(1);
      expect(result.summary.avgUtilization).toBeGreaterThan(50);
    });
  });
  
  // =====================================================
  // TEST: Can Add Enrollment
  // =====================================================
  
  describe('canAddEnrollment', () => {
    it('should allow adding student when under capacity', () => {
      const result = canAddEnrollment(30, 40, 1);
      
      expect(result.canAdd).toBe(true);
      expect(result.newUtilization).toBe(77.5);
    });
    
    it('should reject adding student when at capacity', () => {
      const result = canAddEnrollment(40, 40, 1);
      
      expect(result.canAdd).toBe(false);
      expect(result.reason).toBeDefined();
    });
    
    it('should handle adding multiple students', () => {
      const result = canAddEnrollment(30, 40, 5);
      
      expect(result.canAdd).toBe(true);
      expect(result.newUtilization).toBe(87.5);
    });
    
    it('should reject when adding multiple students exceeds capacity', () => {
      const result = canAddEnrollment(30, 40, 15);
      
      expect(result.canAdd).toBe(false);
      expect(result.reason).toContain('exceed capacity');
    });
    
    it('should default to adding 1 student', () => {
      const result = canAddEnrollment(30, 40);
      
      expect(result.canAdd).toBe(true);
    });
  });
  
  // =====================================================
  // TEST: Capacity Statistics
  // =====================================================
  
  describe('getCapacityStatistics', () => {
    it('should calculate statistics for multiple entities', () => {
      const entities: CapacityInfo[] = [
        {
          entity_id: 'sec-001',
          entity_type: 'SECTION',
          current: 30,
          capacity: 40,
          utilization: 75,
        },
        {
          entity_id: 'sec-002',
          entity_type: 'SECTION',
          current: 45,
          capacity: 40,
          utilization: 112.5,
        },
        {
          entity_id: 'sec-003',
          entity_type: 'SECTION',
          current: 20,
          capacity: 40,
          utilization: 50,
        },
      ];
      
      const stats = getCapacityStatistics(entities);
      
      expect(stats.total).toBe(3);
      expect(stats.overCapacity).toBe(1);
      expect(stats.avgUtilization).toBeGreaterThan(0);
      expect(stats.minUtilization).toBe(50);
      expect(stats.maxUtilization).toBe(112.5);
    });
    
    it('should handle empty array', () => {
      const stats = getCapacityStatistics([]);
      
      expect(stats.total).toBe(0);
      expect(stats.avgUtilization).toBe(0);
    });
    
    it('should count near capacity entities', () => {
      const entities: CapacityInfo[] = [
        {
          entity_id: 'sec-001',
          entity_type: 'SECTION',
          current: 38,
          capacity: 40,
          utilization: 95,
        },
        {
          entity_id: 'sec-002',
          entity_type: 'SECTION',
          current: 40,
          capacity: 40,
          utilization: 100,
        },
      ];
      
      const stats = getCapacityStatistics(entities);
      
      expect(stats.nearCapacity).toBeGreaterThan(0);
      expect(stats.atCapacity).toBe(1);
    });
    
    it('should count under-utilized entities', () => {
      const entities: CapacityInfo[] = [
        {
          entity_id: 'sec-001',
          entity_type: 'SECTION',
          current: 10,
          capacity: 40,
          utilization: 25,
        },
        {
          entity_id: 'sec-002',
          entity_type: 'SECTION',
          current: 15,
          capacity: 40,
          utilization: 37.5,
        },
      ];
      
      const stats = getCapacityStatistics(entities);
      
      expect(stats.underUtilized).toBe(2);
    });
  });
});
