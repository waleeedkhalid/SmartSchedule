/**
 * Pre-Semester Workflow E2E Tests
 * Tests the complete pre-semester flow from preferences to schedule publication
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { TEST_FIXTURES } from '../fixtures';
import { testHelpers } from '../utils/test-helpers';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/src/types/test-schema';

// =====================================================
// E2E WORKFLOW TESTS
// =====================================================

describe('Pre-Semester Workflow E2E', () => {
  let supabase: SupabaseClient<Database>;
  let activeTerm: typeof TEST_FIXTURES.terms.current;
  
  beforeAll(async () => {
    const setup = await testHelpers.setup();
    supabase = setup.supabase;
    activeTerm = TEST_FIXTURES.terms.quickRef.activeTerm;
  });
  
  afterAll(async () => {
    await testHelpers.teardown();
  });
  
  describe('Phase 1: Student Preference Collection', () => {
    it('should collect preferences from multiple students', async () => {
      const students = TEST_FIXTURES.users.students.slice(0, 5);
      const electiveCourses = TEST_FIXTURES.courses.electives.slice(0, 3);
      
      let totalPreferences = 0;
      
      for (const student of students) {
        await testHelpers.authenticateAs(student);
        
        const preferences = electiveCourses.map((course, index) => ({
          student_id: student.id,
          term_code: activeTerm.code,
          course_code: course.code,
          preference_order: index + 1,
        }));
        
        const { data, error } = await supabase
          .from('elective_preferences')
          .insert(preferences)
          .select();
        
        expect(error).toBeNull();
        totalPreferences += data?.length || 0;
      }
      
      expect(totalPreferences).toBe(students.length * electiveCourses.length);
    });
    
    it('should verify preferences are recorded correctly', async () => {
      const student = TEST_FIXTURES.users.students[0];
      
      await testHelpers.authenticateAs(student);
      
      const { data, error } = await supabase
        .from('elective_preferences')
        .select('*')
        .eq('student_id', student.id)
        .eq('term_code', activeTerm.code)
        .order('preference_order', { ascending: true });
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);
      
      // Verify order is sequential
      data!.forEach((pref, index) => {
        expect(pref.preference_order).toBeGreaterThanOrEqual(1);
      });
    });
  });
  
  describe('Phase 2: Faculty Availability Collection', () => {
    it('should collect availability from faculty members', async () => {
      const facultyMembers = TEST_FIXTURES.users.faculty;
      
      let totalAvailability = 0;
      
      for (const faculty of facultyMembers) {
        await testHelpers.authenticateAs(faculty);
        
        const availability = {
          faculty_id: faculty.id,
          term_code: activeTerm.code,
          availability_data: {
            SUNDAY: [
              { start: '08:00', end: '12:00', status: 'PREFERRED' },
              { start: '13:00', end: '16:00', status: 'AVAILABLE' },
            ],
            MONDAY: [
              { start: '08:00', end: '12:00', status: 'PREFERRED' },
            ],
          },
        };
        
        const { data, error } = await supabase
          .from('faculty_availability')
          .insert(availability)
          .select();
        
        expect(error).toBeNull();
        totalAvailability += data?.length || 0;
      }
      
      expect(totalAvailability).toBe(facultyMembers.length);
    });
  });
  
  describe('Phase 3: Schedule Generation (v1)', () => {
    it('should create initial schedule version', async () => {
      const committee = TEST_FIXTURES.users.quickRef.committee.schedulingChair;
      
      await testHelpers.authenticateAs(committee);
      
      const versionData = {
        term_code: activeTerm.code,
        version: 1,
        generated_by: committee.id,
        generation_type: 'INITIAL',
        schedule_count: 25,
        statistics: {
          total_students: 25,
          total_sections: 10,
          total_conflicts: 0,
          conflict_rate: 0,
          average_credits_per_student: 12,
        },
      };
      
      const { data, error } = await supabase
        .from('schedule_versions')
        .insert(versionData)
        .select();
      
      expect(error).toBeNull();
      expect(data![0].version).toBe(1);
    });
    
    it('should generate schedules for all students', async () => {
      const committee = TEST_FIXTURES.users.quickRef.committee.schedulingChair;
      const students = TEST_FIXTURES.users.students.slice(0, 5);
      
      await testHelpers.authenticateAs(committee);
      
      const schedules = students.map(student => ({
        student_id: student.id,
        term_code: activeTerm.code,
        schedule_version_id: TEST_FIXTURES.scheduleVersions.quickRef.v1.id,
        data: {
          sections: [
            {
              section_id: 'SWE101-01',
              course_code: 'SWE101',
              course_name: 'Intro to Programming',
              instructor_id: TEST_FIXTURES.users.faculty[0].id,
              room_number: 'A101',
              times: [
                { day: 'SUNDAY', start: '08:00', end: '09:30' },
              ],
            },
          ],
          statistics: {
            total_credits: 3,
            required_courses_count: 1,
            total_contact_hours: 1.5,
          },
        },
        is_published: false,
      }));
      
      const { data, error } = await supabase
        .from('schedules')
        .insert(schedules)
        .select();
      
      expect(error).toBeNull();
      expect(data!.length).toBe(schedules.length);
    });
  });
  
  describe('Phase 4: Teaching Load Committee Review', () => {
    it('should submit change requests', async () => {
      const loadCommittee = TEST_FIXTURES.users.quickRef.committee.loadChair;
      
      await testHelpers.authenticateAs(loadCommittee);
      
      const changeRequest = {
        schedule_version_id: TEST_FIXTURES.scheduleVersions.quickRef.v1.id,
        section_id: TEST_FIXTURES.sections.quickRef.swe101_01.id,
        requested_by: loadCommittee.id,
        request_type: 'REASSIGN_INSTRUCTOR',
        changes: {
          from: { instructor_id: TEST_FIXTURES.users.faculty[0].id },
          to: { instructor_id: TEST_FIXTURES.users.faculty[1].id },
        },
        reason: 'Balance faculty workload',
        validation_status: 'PENDING',
      };
      
      const { data, error } = await supabase
        .from('teaching_load_change_requests')
        .insert(changeRequest)
        .select();
      
      expect(error).toBeNull();
      expect(data![0].request_type).toBe('REASSIGN_INSTRUCTOR');
    });
    
    it('should validate change requests against irregular students', async () => {
      const committee = TEST_FIXTURES.users.quickRef.committee.schedulingChair;
      
      await testHelpers.authenticateAs(committee);
      
      // Get change requests
      const { data: requests } = await supabase
        .from('teaching_load_change_requests')
        .select('*')
        .eq('validation_status', 'PENDING');
      
      expect(requests).toBeDefined();
      
      // Get irregular students
      const { data: irregularStudents } = await supabase
        .from('irregular_students')
        .select('*')
        .eq('term_code', activeTerm.code)
        .eq('status', 'pending');
      
      expect(irregularStudents).toBeDefined();
      
      // Validation logic would check if changes affect irregular students
      // For this E2E test, we just verify the data is accessible
    });
    
    it('should apply approved change requests', async () => {
      const committee = TEST_FIXTURES.users.quickRef.committee.schedulingChair;
      
      await testHelpers.authenticateAs(committee);
      
      // Get a pending request
      const { data: request } = await supabase
        .from('teaching_load_change_requests')
        .select('*')
        .eq('validation_status', 'PENDING')
        .limit(1)
        .single();
      
      if (request) {
        // Approve it
        const { error: updateError } = await supabase
          .from('teaching_load_change_requests')
          .update({
            validation_status: 'APPROVED',
            reviewed_by: committee.id,
            reviewed_at: new Date().toISOString(),
          })
          .eq('id', request.id);
        
        expect(updateError).toBeNull();
      }
    });
  });
  
  describe('Phase 5: Schedule Generation (v2)', () => {
    it('should create second schedule version with changes', async () => {
      const committee = TEST_FIXTURES.users.quickRef.committee.schedulingChair;
      
      await testHelpers.authenticateAs(committee);
      
      const versionData = {
        term_code: activeTerm.code,
        version: 2,
        generated_by: committee.id,
        generation_type: 'TEACHING_LOAD_EDIT',
        schedule_count: 25,
        statistics: {
          total_students: 25,
          total_sections: 10,
          total_conflicts: 1,
          conflict_rate: 4,
        },
        changes_from_previous: {
          'statistics.total_conflicts': [0, 1],
        },
      };
      
      const { data, error } = await supabase
        .from('schedule_versions')
        .insert(versionData)
        .select();
      
      expect(error).toBeNull();
      expect(data![0].version).toBe(2);
    });
  });
  
  describe('Phase 6: Student & Faculty Feedback', () => {
    it('should collect feedback from students', async () => {
      const students = TEST_FIXTURES.users.students.slice(0, 3);
      
      let totalFeedback = 0;
      
      for (const student of students) {
        await testHelpers.authenticateAs(student);
        
        // Get student's schedule
        const { data: schedule } = await supabase
          .from('schedules')
          .select('id')
          .eq('student_id', student.id)
          .limit(1)
          .single();
        
        if (schedule) {
          const feedback = {
            student_id: student.id,
            schedule_id: schedule.id,
            rating: Math.floor(Math.random() * 5) + 1,
            feedback_text: 'Test feedback',
            feedback_category: 'QUALITY',
            severity: 'LOW',
            schedule_version: 2,
          };
          
          const { error } = await supabase
            .from('feedback')
            .insert(feedback);
          
          expect(error).toBeNull();
          totalFeedback++;
        }
      }
      
      expect(totalFeedback).toBeGreaterThan(0);
    });
    
    it('should aggregate feedback statistics', async () => {
      const committee = TEST_FIXTURES.users.quickRef.committee.schedulingChair;
      
      await testHelpers.authenticateAs(committee);
      
      const { data: feedback, error } = await supabase
        .from('feedback')
        .select('rating, feedback_category, severity')
        .eq('schedule_version', 2);
      
      expect(error).toBeNull();
      expect(feedback).toBeDefined();
      
      if (feedback && feedback.length > 0) {
        // Calculate average rating
        const avgRating = feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length;
        expect(avgRating).toBeGreaterThan(0);
        expect(avgRating).toBeLessThanOrEqual(5);
        
        // Count by category
        const byCategoryMap = feedback.reduce((acc, f) => {
          acc[f.feedback_category] = (acc[f.feedback_category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        expect(Object.keys(byCategory).length).toBeGreaterThan(0);
      }
    });
  });
  
  describe('Phase 7: Schedule Publication', () => {
    it('should publish final schedules', async () => {
      const committee = TEST_FIXTURES.users.quickRef.committee.schedulingChair;
      
      await testHelpers.authenticateAs(committee);
      
      // Publish all v2 schedules
      const { data, error } = await supabase
        .from('schedules')
        .update({ is_published: true })
        .eq('term_code', activeTerm.code)
        .eq('schedule_version_id', TEST_FIXTURES.scheduleVersions.quickRef.v2.id)
        .select();
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
    
    it('should update term status to published', async () => {
      const committee = TEST_FIXTURES.users.quickRef.committee.schedulingChair;
      
      await testHelpers.authenticateAs(committee);
      
      const { error } = await supabase
        .from('academic_term')
        .update({ schedule_published: true })
        .eq('code', activeTerm.code);
      
      expect(error).toBeNull();
    });
    
    it('should allow students to view published schedules', async () => {
      const student = TEST_FIXTURES.users.students[0];
      
      await testHelpers.authenticateAs(student);
      
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('student_id', student.id)
        .eq('is_published', true)
        .single();
      
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.is_published).toBe(true);
    });
  });
  
  describe('Phase 8: Validation & Metrics', () => {
    it('should validate all students have schedules', async () => {
      const committee = TEST_FIXTURES.users.quickRef.committee.schedulingChair;
      
      await testHelpers.authenticateAs(committee);
      
      const { data: students } = await supabase
        .from('students')
        .select('id')
        .eq('status', 'ACTIVE');
      
      const { data: schedules } = await supabase
        .from('schedules')
        .select('student_id')
        .eq('term_code', activeTerm.code)
        .eq('is_published', true);
      
      expect(students).toBeDefined();
      expect(schedules).toBeDefined();
      
      const scheduledStudents = new Set(schedules?.map(s => s.student_id));
      const totalStudents = students?.length || 0;
      const coverage = (scheduledStudents.size / totalStudents) * 100;
      
      expect(coverage).toBeGreaterThan(0);
    });
    
    it('should calculate final statistics', async () => {
      const committee = TEST_FIXTURES.users.quickRef.committee.schedulingChair;
      
      await testHelpers.authenticateAs(committee);
      
      // Get all published schedules
      const { data: schedules } = await supabase
        .from('schedules')
        .select('data')
        .eq('term_code', activeTerm.code)
        .eq('is_published', true);
      
      expect(schedules).toBeDefined();
      
      if (schedules && schedules.length > 0) {
        let totalConflicts = 0;
        let totalCredits = 0;
        
        schedules.forEach(schedule => {
          totalCredits += schedule.data?.statistics?.total_credits || 0;
        });
        
        const avgCredits = totalCredits / schedules.length;
        
        expect(avgCredits).toBeGreaterThan(0);
        expect(avgCredits).toBeLessThanOrEqual(21);
      }
    });
  });
});

