/**
 * Student API Integration Tests
 * Tests the complete student workflow including preferences and schedule viewing
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { TEST_FIXTURES } from '../fixtures';
import { testHelpers } from '../utils/test-helpers';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/src/types/test-schema';

// =====================================================
// INTEGRATION TESTS
// =====================================================

describe('Student API Integration Tests', () => {
  let supabase: SupabaseClient<Database>;
  let student: typeof TEST_FIXTURES.users.students[0];
  let activeTerm: typeof TEST_FIXTURES.terms.current;
  
  beforeAll(async () => {
    const setup = await testHelpers.setup();
    supabase = setup.supabase;
    student = TEST_FIXTURES.users.quickRef.students.firstStudent;
    activeTerm = TEST_FIXTURES.terms.quickRef.activeTerm;
  });
  
  afterAll(async () => {
    await testHelpers.teardown();
  });
  
  beforeEach(async () => {
    // Authenticate as student before each test
    await testHelpers.authenticateAs(student);
  });
  
  describe('Elective Preferences', () => {
    it('should submit elective preferences', async () => {
      const preferences = [
        {
          student_id: student.id,
          term_code: activeTerm.code,
          course_code: TEST_FIXTURES.courses.electives[0].code,
          preference_order: 1,
        },
        {
          student_id: student.id,
          term_code: activeTerm.code,
          course_code: TEST_FIXTURES.courses.electives[1].code,
          preference_order: 2,
        },
      ];
      
      const { data, error } = await supabase
        .from('elective_preferences')
        .insert(preferences)
        .select();
      
      expect(error).toBeNull();
      expect(data).toHaveLength(2);
      expect(data![0].preference_order).toBe(1);
    });
    
    it('should retrieve student preferences', async () => {
      const { data, error } = await supabase
        .from('elective_preferences')
        .select('*')
        .eq('student_id', student.id)
        .eq('term_code', activeTerm.code)
        .order('preference_order', { ascending: true });
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
    
    it('should update preference order', async () => {
      // First, get an existing preference
      const { data: existing } = await supabase
        .from('elective_preferences')
        .select('*')
        .eq('student_id', student.id)
        .eq('term_code', activeTerm.code)
        .limit(1)
        .single();
      
      if (existing) {
        const { data, error } = await supabase
          .from('elective_preferences')
          .update({ preference_order: 10 })
          .eq('id', existing.id)
          .select();
        
        expect(error).toBeNull();
        expect(data![0].preference_order).toBe(10);
      }
    });
    
    it('should delete preference', async () => {
      // First create a preference to delete
      const { data: created } = await supabase
        .from('elective_preferences')
        .insert({
          student_id: student.id,
          term_code: activeTerm.code,
          course_code: 'SWE499',
          preference_order: 99,
        })
        .select()
        .single();
      
      if (created) {
        const { error } = await supabase
          .from('elective_preferences')
          .delete()
          .eq('id', created.id);
        
        expect(error).toBeNull();
      }
    });
    
    it('should prevent duplicate preferences for same course', async () => {
      const preference = {
        student_id: student.id,
        term_code: activeTerm.code,
        course_code: TEST_FIXTURES.courses.electives[0].code,
        preference_order: 1,
      };
      
      // Insert first preference
      await supabase
        .from('elective_preferences')
        .insert(preference);
      
      // Try to insert duplicate (should fail)
      const { error } = await supabase
        .from('elective_preferences')
        .insert(preference);
      
      expect(error).not.toBeNull();
    });
  });
  
  describe('Schedule Viewing', () => {
    it('should retrieve student schedule', async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('student_id', student.id)
        .eq('term_code', activeTerm.code)
        .eq('is_published', true)
        .single();
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.data).toBeDefined();
    });
    
    it('should not access unpublished schedules', async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('student_id', student.id)
        .eq('is_published', false);
      
      // RLS should prevent access or return empty
      expect(data).toBeDefined();
      expect(data?.length || 0).toBe(0);
    });
    
    it('should not access other students schedules', async () => {
      const otherStudent = TEST_FIXTURES.users.students[1];
      
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('student_id', otherStudent.id);
      
      // RLS should block this
      expect(data?.length || 0).toBe(0);
    });
    
    it('should retrieve schedule with sections', async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('id, student_id, data')
        .eq('student_id', student.id)
        .eq('term_code', activeTerm.code)
        .single();
      
      if (data) {
        expect(data.data).toBeDefined();
        expect(data.data.sections).toBeDefined();
        expect(Array.isArray(data.data.sections)).toBe(true);
      }
    });
  });
  
  describe('Feedback Submission', () => {
    it('should submit schedule feedback', async () => {
      // First get student's schedule
      const { data: schedule } = await supabase
        .from('schedules')
        .select('id')
        .eq('student_id', student.id)
        .eq('is_published', true)
        .single();
      
      if (schedule) {
        const feedback = {
          student_id: student.id,
          schedule_id: schedule.id,
          rating: 4,
          feedback_text: 'Good schedule overall',
          feedback_category: 'QUALITY',
          severity: 'LOW',
          schedule_version: 2,
        };
        
        const { data, error } = await supabase
          .from('feedback')
          .insert(feedback)
          .select();
        
        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data![0].rating).toBe(4);
      }
    });
    
    it('should retrieve student feedback', async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('student_id', student.id);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
    
    it('should not see other students feedback', async () => {
      const otherStudent = TEST_FIXTURES.users.students[1];
      
      const { data } = await supabase
        .from('feedback')
        .select('*')
        .eq('student_id', otherStudent.id);
      
      // RLS should block this
      expect(data?.length || 0).toBe(0);
    });
  });
  
  describe('Profile & Status', () => {
    it('should retrieve student profile', async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', student.id)
        .single();
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(student.id);
    });
    
    it('should not update own status (committee-only)', async () => {
      const { error } = await supabase
        .from('students')
        .update({ status: 'GRADUATED' })
        .eq('id', student.id);
      
      // Should fail due to RLS
      expect(error).not.toBeNull();
    });
  });
  
  describe('Course Catalog', () => {
    it('should view available courses', async () => {
      const { data, error } = await supabase
        .from('course')
        .select('*')
        .eq('type', 'ELECTIVE');
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);
    });
    
    it('should view course sections', async () => {
      const { data, error } = await supabase
        .from('section')
        .select('*')
        .eq('term_code', activeTerm.code);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });
  
  describe('Irregular Students', () => {
    it('should view own irregular student records', async () => {
      // Check if this student is irregular
      const { data, error } = await supabase
        .from('irregular_students')
        .select('*')
        .eq('student_id', student.id)
        .eq('term_code', activeTerm.code);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
    
    it('should not view other students irregular records', async () => {
      const otherStudent = TEST_FIXTURES.users.students[1];
      
      const { data } = await supabase
        .from('irregular_students')
        .select('*')
        .eq('student_id', otherStudent.id);
      
      // RLS should block
      expect(data?.length || 0).toBe(0);
    });
  });
  
  describe('Enrollment History', () => {
    it('should view own enrollment history', async () => {
      const { data, error } = await supabase
        .from('enrollment')
        .select('*')
        .eq('student_id', student.id);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
    
    it('should not view other students enrollment', async () => {
      const otherStudent = TEST_FIXTURES.users.students[1];
      
      const { data } = await supabase
        .from('enrollment')
        .select('*')
        .eq('student_id', otherStudent.id);
      
      // RLS should block
      expect(data?.length || 0).toBe(0);
    });
  });
});

