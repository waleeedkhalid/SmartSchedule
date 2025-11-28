/**
 * Version Diff Generator Unit Tests
 * Tests schedule version comparison and delta generation
 */

import { describe, it, expect } from 'vitest';
import { TEST_FIXTURES } from '../../fixtures';
import {
  generateDelta,
  generateHumanReadableComparison,
  calculateChangeStatistics,
  generateRollbackDelta,
  type Schedule,
  type VersionDelta,
  type ChangeStatistics,
  type ComparisonResult,
} from '@/lib/generators/version-diff';

// =====================================================
// TESTS
// =====================================================

describe('Version Diff Generator', () => {
  describe('generateDelta', () => {
    it('should generate delta from v1 to v2', () => {
      const v1 = TEST_FIXTURES.schedules.v1;
      const v2 = TEST_FIXTURES.schedules.v2;
      
      const delta = generateDelta(v1, v2);
      
      expect(delta).toHaveProperty('added');
      expect(delta).toHaveProperty('modified');
      expect(delta).toHaveProperty('deleted');
      expect(delta).toHaveProperty('unchanged');
    });
    
    it('should detect added schedules', () => {
      const v1: Schedule[] = [
        {
          id: 'sch-1',
          student_id: 'STU1',
          data: { sections: [] },
        } as Schedule,
      ];
      
      const v2: Schedule[] = [
        ...v1,
        {
          id: 'sch-2',
          student_id: 'STU2',
          data: { sections: [] },
        } as Schedule,
      ];
      
      const delta = generateDelta(v1, v2);
      
      expect(delta.added).toHaveLength(1);
      expect(delta.added[0].student_id).toBe('STU2');
    });
    
    it('should detect deleted schedules', () => {
      const v1: Schedule[] = [
        {
          id: 'sch-1',
          student_id: 'STU1',
          data: { sections: [] },
        } as Schedule,
        {
          id: 'sch-2',
          student_id: 'STU2',
          data: { sections: [] },
        } as Schedule,
      ];
      
      const v2: Schedule[] = [v1[0]];
      
      const delta = generateDelta(v1, v2);
      
      expect(delta.deleted).toHaveLength(1);
      expect(delta.deleted[0].student_id).toBe('STU2');
    });
    
    it('should detect modified schedules', () => {
      const v1: Schedule[] = [
        {
          id: 'sch-1',
          student_id: 'STU1',
          data: {
            sections: [
              { section_id: 'SEC1', course_code: 'SWE101' },
            ],
          },
        } as any,
      ];
      
      const v2: Schedule[] = [
        {
          id: 'sch-1',
          student_id: 'STU1',
          data: {
            sections: [
              { section_id: 'SEC2', course_code: 'SWE101' }, // Different section
            ],
          },
        } as any,
      ];
      
      const delta = generateDelta(v1, v2);
      
      expect(delta.modified).toHaveLength(1);
      expect(delta.modified[0].student_id).toBe('STU1');
    });
    
    it('should track unchanged schedules', () => {
      const v1: Schedule[] = [
        {
          id: 'sch-1',
          student_id: 'STU1',
          data: {
            sections: [
              { section_id: 'SEC1', course_code: 'SWE101' },
            ],
          },
        } as any,
      ];
      
      const v2: Schedule[] = [
        {
          id: 'sch-1',
          student_id: 'STU1',
          data: {
            sections: [
              { section_id: 'SEC1', course_code: 'SWE101' }, // Same
            ],
          },
        } as any,
      ];
      
      const delta = generateDelta(v1, v2);
      
      expect(delta.unchanged).toHaveLength(1);
      expect(delta.unchanged[0].student_id).toBe('STU1');
    });
  });
  
  describe('generateHumanReadableComparison', () => {
    it('should create human-readable comparison', () => {
      const v1 = TEST_FIXTURES.schedules.v1.slice(0, 2);
      const v2 = TEST_FIXTURES.schedules.v2.slice(0, 2);
      
      const comparison = generateHumanReadableComparison(v1, v2);
      
      expect(comparison).toHaveProperty('summary');
      expect(comparison).toHaveProperty('details');
      expect(comparison.summary).toContain('Changes:');
      expect(comparison.details).toBeInstanceOf(Array);
    });
    
    it('should describe added schedules', () => {
      const v1: Schedule[] = [];
      const v2: Schedule[] = [
        {
          id: 'sch-1',
          student_id: 'STU1',
          data: { sections: [] },
        } as Schedule,
      ];
      
      const comparison = generateHumanReadableComparison(v1, v2);
      
      expect(comparison.summary).toContain('1 added');
    });
    
    it('should describe deleted schedules', () => {
      const v1: Schedule[] = [
        {
          id: 'sch-1',
          student_id: 'STU1',
          data: { sections: [] },
        } as Schedule,
      ];
      const v2: Schedule[] = [];
      
      const comparison = generateHumanReadableComparison(v1, v2);
      
      expect(comparison.summary).toContain('1 deleted');
    });
    
    it('should describe modified schedules', () => {
      const v1: Schedule[] = [
        {
          id: 'sch-1',
          student_id: 'STU1',
          data: { sections: [{ section_id: 'SEC1', course_code: 'SWE101' }] },
        } as any,
      ];
      const v2: Schedule[] = [
        {
          id: 'sch-1',
          student_id: 'STU1',
          data: { sections: [{ section_id: 'SEC2', course_code: 'SWE101' }] },
        } as any,
      ];
      
      const comparison = generateHumanReadableComparison(v1, v2);
      
      expect(comparison.summary).toContain('1 modified');
    });
  });
  
  describe('calculateChangeStatistics', () => {
    it('should calculate change statistics', () => {
      const v1 = TEST_FIXTURES.schedules.v1.slice(0, 5);
      const v2 = TEST_FIXTURES.schedules.v2.slice(0, 5);
      
      const stats = calculateChangeStatistics(v1, v2);
      
      expect(stats).toHaveProperty('totalSchedules');
      expect(stats).toHaveProperty('addedCount');
      expect(stats).toHaveProperty('deletedCount');
      expect(stats).toHaveProperty('modifiedCount');
      expect(stats).toHaveProperty('unchangedCount');
      expect(stats).toHaveProperty('changePercentage');
    });
    
    it('should calculate change percentage correctly', () => {
      const v1: Schedule[] = [
        { id: '1', student_id: 'S1', data: { sections: [] } } as Schedule,
        { id: '2', student_id: 'S2', data: { sections: [] } } as Schedule,
      ];
      
      // Modify 1 out of 2 = 50%
      const v2: Schedule[] = [
        { id: '1', student_id: 'S1', data: { sections: [{ section_id: 'SEC1' }] } } as any,
        { id: '2', student_id: 'S2', data: { sections: [] } } as Schedule,
      ];
      
      const stats = calculateChangeStatistics(v1, v2);
      
      expect(stats.changePercentage).toBe(50);
    });
    
    it('should handle empty version correctly', () => {
      const stats = calculateChangeStatistics([], []);
      
      expect(stats.totalSchedules).toBe(0);
      expect(stats.changePercentage).toBe(0);
    });
    
    it('should count section-level changes', () => {
      const v1: Schedule[] = [
        {
          id: '1',
          student_id: 'S1',
          data: {
            sections: [
              { section_id: 'SEC1', course_code: 'SWE101' },
              { section_id: 'SEC2', course_code: 'SWE102' },
            ],
          },
        } as any,
      ];
      
      const v2: Schedule[] = [
        {
          id: '1',
          student_id: 'S1',
          data: {
            sections: [
              { section_id: 'SEC1', course_code: 'SWE101' }, // Same
              { section_id: 'SEC3', course_code: 'SWE102' }, // Different section
            ],
          },
        } as any,
      ];
      
      const stats = calculateChangeStatistics(v1, v2);
      
      expect(stats.sectionChangesCount).toBeGreaterThan(0);
    });
  });
  
  describe('generateRollbackDelta', () => {
    it('should generate rollback delta', () => {
      const v1 = TEST_FIXTURES.schedules.v1.slice(0, 2);
      const v2 = TEST_FIXTURES.schedules.v2.slice(0, 2);
      
      const rollback = generateRollbackDelta(v1, v2);
      
      expect(rollback).toHaveProperty('added');
      expect(rollback).toHaveProperty('modified');
      expect(rollback).toHaveProperty('deleted');
    });
    
    it('should reverse add/delete operations', () => {
      const v1: Schedule[] = [
        { id: '1', student_id: 'S1', data: { sections: [] } } as Schedule,
      ];
      
      const v2: Schedule[] = [
        { id: '1', student_id: 'S1', data: { sections: [] } } as Schedule,
        { id: '2', student_id: 'S2', data: { sections: [] } } as Schedule, // Added in v2
      ];
      
      const rollback = generateRollbackDelta(v1, v2);
      
      // Rollback should DELETE what was added
      expect(rollback.deleted).toHaveLength(1);
      expect(rollback.deleted[0].student_id).toBe('S2');
    });
    
    it('should restore deleted schedules', () => {
      const v1: Schedule[] = [
        { id: '1', student_id: 'S1', data: { sections: [] } } as Schedule,
        { id: '2', student_id: 'S2', data: { sections: [] } } as Schedule,
      ];
      
      const v2: Schedule[] = [
        { id: '1', student_id: 'S1', data: { sections: [] } } as Schedule,
        // S2 deleted in v2
      ];
      
      const rollback = generateRollbackDelta(v1, v2);
      
      // Rollback should ADD back what was deleted
      expect(rollback.added).toHaveLength(1);
      expect(rollback.added[0].student_id).toBe('S2');
    });
    
    it('should restore modified schedules to original', () => {
      const v1: Schedule[] = [
        {
          id: '1',
          student_id: 'S1',
          data: { sections: [{ section_id: 'SEC1', course_code: 'SWE101' }] },
        } as any,
      ];
      
      const v2: Schedule[] = [
        {
          id: '1',
          student_id: 'S1',
          data: { sections: [{ section_id: 'SEC2', course_code: 'SWE101' }] },
        } as any,
      ];
      
      const rollback = generateRollbackDelta(v1, v2);
      
      // Rollback should restore to SEC1
      expect(rollback.modified).toHaveLength(1);
      expect(rollback.modified[0].data.sections[0].section_id).toBe('SEC1');
    });
  });
});
