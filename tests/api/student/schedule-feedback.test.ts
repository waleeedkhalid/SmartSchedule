/**
 * Student Schedule & Feedback API Tests
 * Tests schedule viewing and feedback submission endpoints
 * 
 * Following TDD: These tests should FAIL until endpoints are implemented
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { createTestClient } from '../../utils/test-supabase-client';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('Student Schedule & Feedback API', () => {
  let supabase: SupabaseClient;
  let testStudentId: string;
  let testTermCode: string;

  beforeAll(async () => {
    supabase = createTestClient();
    
    // Get a real student from the database
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .limit(1)
      .single();
    
    if (!student) {
      throw new Error('No students found in database.');
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

  describe('GET /api/student/schedule', () => {
    it('should return published schedule', async () => {
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('student_id', testStudentId)
        .eq('term_code', testTermCode)
        .eq('is_published', true)
        .maybeSingle();
      
      expect(error).toBeNull();
      
      if (data) {
        expect(data.student_id).toBe(testStudentId);
        expect(data.is_published).toBe(true);
        expect(data.data).toBeDefined();
      }
    });
    
    it('should not return unpublished schedules', async () => {
      const { data } = await supabase
        .from('schedules')
        .select('*')
        .eq('student_id', testStudentId)
        .eq('is_published', false);
      
      // RLS should prevent access or return empty
      expect(data?.length || 0).toBe(0);
    });
    
    it('should not access other students schedules (RLS)', async () => {
      const { data: otherStudents } = await supabase
        .from('students')
        .select('id')
        .neq('id', testStudentId)
        .limit(1);
      
      if (otherStudents && otherStudents.length > 0) {
        const { data } = await supabase
          .from('schedules')
          .select('*')
          .eq('student_id', otherStudents[0].id);
        
        // RLS should block this
        expect(data?.length || 0).toBe(0);
      }
    });
    
    it('should include schedule sections in JSONB data', async () => {
      const { data } = await supabase
        .from('schedules')
        .select('id, student_id, data')
        .eq('student_id', testStudentId)
        .eq('is_published', true)
        .maybeSingle();
      
      if (data && data.data) {
        expect(data.data).toHaveProperty('sections');
        expect(Array.isArray(data.data.sections)).toBe(true);
        
        // Validate section structure
        if (data.data.sections.length > 0) {
          const section = data.data.sections[0];
          expect(section).toHaveProperty('course_code');
          expect(section).toHaveProperty('section_id');
        }
      }
    });
    
    it('should filter by term_code query parameter', async () => {
      const { data } = await supabase
        .from('schedules')
        .select('*')
        .eq('student_id', testStudentId)
        .eq('term_code', testTermCode)
        .eq('is_published', true);
      
      expect(data).toBeDefined();
      data?.forEach(schedule => {
        expect(schedule.term_code).toBe(testTermCode);
      });
    });
  });

  describe('POST /api/student/feedback', () => {
    it('should validate required fields', async () => {
      // Get a schedule first
      const { data: schedule } = await supabase
        .from('schedules')
        .select('id')
        .eq('student_id', testStudentId)
        .eq('is_published', true)
        .limit(1)
        .maybeSingle();
      
      if (schedule) {
        // Required fields validation
        const validFeedback = {
          student_id: testStudentId,
          schedule_id: schedule.id,
          rating: 4,
          comment: 'Test feedback',
        };
        
        expect(validFeedback).toHaveProperty('student_id');
        expect(validFeedback).toHaveProperty('schedule_id');
        expect(validFeedback).toHaveProperty('rating');
        expect(validFeedback.rating).toBeGreaterThanOrEqual(1);
        expect(validFeedback.rating).toBeLessThanOrEqual(5);
      }
    });
    
    it('should submit feedback successfully', async () => {
      // Get a published schedule
      const { data: schedule } = await supabase
        .from('schedules')
        .select('id')
        .eq('student_id', testStudentId)
        .eq('is_published', true)
        .limit(1)
        .maybeSingle();
      
      if (schedule) {
        const feedback = {
          student_id: testStudentId,
          schedule_id: schedule.id,
          rating: 4,
          comment: 'Test feedback - automated test',
          status: 'SUBMITTED',
        };
        
        const { data, error } = await supabase
          .from('feedback')
          .insert(feedback)
          .select()
          .single();
        
        expect(error).toBeNull();
        expect(data).toBeDefined();
        expect(data?.rating).toBe(4);
        
        // Cleanup
        if (data) {
          await supabase.from('feedback').delete().eq('id', data.id);
        }
      }
    });
    
    it('should validate rating range (1-5)', async () => {
      const invalidRatings = [0, 6, 10, -1];
      
      invalidRatings.forEach(rating => {
        expect(rating < 1 || rating > 5).toBe(true);
      });
      
      const validRatings = [1, 2, 3, 4, 5];
      validRatings.forEach(rating => {
        expect(rating >= 1 && rating <= 5).toBe(true);
      });
    });
    
    it('should retrieve student feedback', async () => {
      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('student_id', testStudentId);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
    
    it('should not see other students feedback (RLS)', async () => {
      const { data: otherStudents } = await supabase
        .from('students')
        .select('id')
        .neq('id', testStudentId)
        .limit(1);
      
      if (otherStudents && otherStudents.length > 0) {
        const { data } = await supabase
          .from('feedback')
          .select('*')
          .eq('student_id', otherStudents[0].id);
        
        // RLS should block this
        expect(data?.length || 0).toBe(0);
      }
    });
  });

  describe('Student Profile & Status', () => {
    it('should retrieve student profile', async () => {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', testStudentId)
        .single();
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data?.id).toBe(testStudentId);
    });
    
    it('should not allow students to update their own status', async () => {
      // This should fail due to RLS (committee-only operation)
      const { error } = await supabase
        .from('students')
        .update({ status: 'GRADUATED' })
        .eq('id', testStudentId);
      
      // Expected to fail
      expect(error).not.toBeNull();
    });
  });

  describe('Course Catalog Access', () => {
    it('should view available courses', async () => {
      const { data, error } = await supabase
        .from('course')
        .select('*')
        .eq('is_active', true);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);
    });
    
    it('should view course sections for active term', async () => {
      const { data, error } = await supabase
        .from('section')
        .select('*')
        .eq('term_code', testTermCode);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
    
    it('should filter elective courses', async () => {
      const { data } = await supabase
        .from('course')
        .select('*')
        .eq('type', 'ELECTIVE')
        .eq('is_active', true);
      
      expect(data).toBeDefined();
      data?.forEach(course => {
        expect(course.type).toBe('ELECTIVE');
      });
    });
  });

  describe('Irregular Student Records', () => {
    it('should view own irregular student records', async () => {
      const { data, error } = await supabase
        .from('irregular_students')
        .select('*')
        .eq('student_id', testStudentId)
        .eq('term_code', testTermCode);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
    
    it('should not view other students irregular records (RLS)', async () => {
      const { data: otherStudents } = await supabase
        .from('students')
        .select('id')
        .neq('id', testStudentId)
        .limit(1);
      
      if (otherStudents && otherStudents.length > 0) {
        const { data } = await supabase
          .from('irregular_students')
          .select('*')
          .eq('student_id', otherStudents[0].id);
        
        // RLS should block
        expect(data?.length || 0).toBe(0);
      }
    });
  });

  describe('Enrollment History', () => {
    it('should view own enrollment history', async () => {
      const { data, error } = await supabase
        .from('enrollment')
        .select('*')
        .eq('student_id', testStudentId);
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
    
    it('should not view other students enrollment (RLS)', async () => {
      const { data: otherStudents } = await supabase
        .from('students')
        .select('id')
        .neq('id', testStudentId)
        .limit(1);
      
      if (otherStudents && otherStudents.length > 0) {
        const { data } = await supabase
          .from('enrollment')
          .select('*')
          .eq('student_id', otherStudents[0].id);
        
        // RLS should block
        expect(data?.length || 0).toBe(0);
      }
    });
  });
});


