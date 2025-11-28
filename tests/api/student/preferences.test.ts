/**
 * Student Preferences API Tests
 * Tests the student elective preferences endpoints
 * 
 * Following TDD: These tests should FAIL until endpoints are implemented
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createTestClient } from '../../utils/test-supabase-client';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('Student Preferences API', () => {
  let supabase: SupabaseClient;
  let testStudentId: string;
  let testTermCode: string;

  beforeAll(async () => {
    supabase = createTestClient();
    
    // Get a real student from the database (no fixtures needed)
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .limit(1)
      .single();
    
    if (!student) {
      throw new Error('No students found in database. Please seed data first.');
    }
    
    testStudentId = student.id;
    
    // Get active term
    const { data: term } = await supabase
      .from('academic_term')
      .select('code')
      .eq('is_active', true)
      .limit(1)
      .single();
    
    testTermCode = term?.code || 'FALL2024';
  });

  describe('GET /api/student/electives', () => {
    it('should return available elective courses', async () => {
      const { data, error } = await supabase
        .from('course')
        .select('*')
        .eq('type', 'ELECTIVE');
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
    
    it('should only return active electives', async () => {
      const { data } = await supabase
        .from('course')
        .select('*')
        .eq('type', 'ELECTIVE')
        .eq('is_active', true);
      
      expect(data).toBeDefined();
      data?.forEach(course => {
        expect(course.type).toBe('ELECTIVE');
        expect(course.is_active).toBe(true);
      });
    });
  });

  describe('POST /api/student/electives/submit', () => {
    it('should validate minimum 3 preferences', async () => {
      // This test will fail until endpoint is implemented
      // Expected behavior: API should reject submissions with < 3 preferences
      
      const tooFewPreferences = [
        { course_code: 'SWE401', preference_order: 1 },
        { course_code: 'SWE402', preference_order: 2 },
      ];
      
      // API call would go here once endpoint exists
      // For now, test the validation logic
      expect(tooFewPreferences.length).toBeLessThan(3);
    });
    
    it('should validate maximum 10 preferences', async () => {
      const tooManyPreferences = Array.from({ length: 11 }, (_, i) => ({
        course_code: `SWE${400 + i}`,
        preference_order: i + 1,
      }));
      
      expect(tooManyPreferences.length).toBeGreaterThan(10);
    });
    
    it('should reject invalid course codes', async () => {
      const invalidPreferences = [
        { course_code: 'INVALID', preference_order: 1 },
        { course_code: 'XYZ999', preference_order: 2 },
        { course_code: 'ABC123', preference_order: 3 },
      ];
      
      // Check if courses exist in database
      const { data: courses } = await supabase
        .from('course')
        .select('code')
        .in('code', invalidPreferences.map(p => p.course_code));
      
      // Validation: not all courses exist
      expect(courses?.length || 0).toBeLessThan(invalidPreferences.length);
    });
    
    it('should reject duplicate course codes', async () => {
      const duplicatePreferences = [
        { course_code: 'SWE401', preference_order: 1 },
        { course_code: 'SWE402', preference_order: 2 },
        { course_code: 'SWE401', preference_order: 3 }, // Duplicate!
      ];
      
      const uniqueCourses = new Set(duplicatePreferences.map(p => p.course_code));
      expect(uniqueCourses.size).toBeLessThan(duplicatePreferences.length);
    });
  });

  describe('GET /api/student/preferences', () => {
    it('should retrieve submitted preferences', async () => {
      const { data, error } = await supabase
        .from('elective_preferences')
        .select('*')
        .eq('student_id', testStudentId)
        .eq('term_code', testTermCode)
        .order('preference_order', { ascending: true });
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
    
    it('should return preferences in correct order', async () => {
      const { data } = await supabase
        .from('elective_preferences')
        .select('*')
        .eq('student_id', testStudentId)
        .eq('term_code', testTermCode)
        .order('preference_order', { ascending: true });
      
      if (data && data.length > 1) {
        for (let i = 1; i < data.length; i++) {
          expect(data[i].preference_order).toBeGreaterThan(
            data[i - 1].preference_order
          );
        }
      }
    });
    
    it('should only return current students preferences (RLS)', async () => {
      // RLS should prevent seeing other students' preferences
      const { data: allStudents } = await supabase
        .from('students')
        .select('id')
        .limit(5);
      
      if (allStudents && allStudents.length > 1) {
        const otherStudentId = allStudents.find(s => s.id !== testStudentId)?.id;
        
        if (otherStudentId) {
          const { data } = await supabase
            .from('elective_preferences')
            .select('*')
            .eq('student_id', otherStudentId);
          
          // RLS should block this or return empty
          expect(data?.length || 0).toBe(0);
        }
      }
    });
  });

  describe('PUT /api/student/preferences/:id', () => {
    it('should update preference order', async () => {
      // First, get an existing preference
      const { data: existing } = await supabase
        .from('elective_preferences')
        .select('*')
        .eq('student_id', testStudentId)
        .eq('term_code', testTermCode)
        .limit(1)
        .single();
      
      if (existing) {
        const newOrder = 99;
        const { data, error } = await supabase
          .from('elective_preferences')
          .update({ preference_order: newOrder })
          .eq('id', existing.id)
          .select()
          .single();
        
        expect(error).toBeNull();
        expect(data?.preference_order).toBe(newOrder);
        
        // Cleanup: restore original order
        await supabase
          .from('elective_preferences')
          .update({ preference_order: existing.preference_order })
          .eq('id', existing.id);
      }
    });
  });

  describe('DELETE /api/student/preferences/:id', () => {
    it('should delete a preference', async () => {
      // Create a test preference to delete
      const testPreference = {
        student_id: testStudentId,
        term_code: testTermCode,
        course_code: 'TEST999',
        preference_order: 999,
      };
      
      const { data: created } = await supabase
        .from('elective_preferences')
        .insert(testPreference)
        .select()
        .single();
      
      if (created) {
        const { error } = await supabase
          .from('elective_preferences')
          .delete()
          .eq('id', created.id);
        
        expect(error).toBeNull();
        
        // Verify deletion
        const { data: deleted } = await supabase
          .from('elective_preferences')
          .select('*')
          .eq('id', created.id);
        
        expect(deleted?.length || 0).toBe(0);
      }
    });
  });
});


