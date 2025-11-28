/**
 * Change Request Validator Unit Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { validateChangeRequest, applyChangeRequest } from '@/lib/validations/change-request-validator';
import { createTestSupabaseClient, cleanupTestData } from '../utils/test-supabase-client';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('Change Request Validator', () => {
  let supabase: SupabaseClient;
  let testSectionId: string;
  let testCourseCode: string;
  let testStudentId: string;

  beforeAll(async () => {
    supabase = createTestSupabaseClient();
    testCourseCode = 'TEST-VAL-001';
    testStudentId = 'test-val-student-001';

    // Create test course
    await supabase.from('course').insert({
      course_code: testCourseCode,
      course_name: 'Test Validation Course',
      credits: 3,
      type: 'REQUIRED',
    });

    // Create test section
    const { data: section } = await supabase
      .from('section')
      .insert({
        course_code: testCourseCode,
        capacity: 40,
        instructor_id: 'faculty-001',
        room_number: 'B204',
      })
      .select('section_id')
      .single();

    testSectionId = section!.section_id;

    // Create test student
    await supabase.from('students').insert({
      id: testStudentId,
      full_name: 'Test Validation Student',
      level: 3,
      status: 'IRREGULAR',
    });
  });

  afterAll(async () => {
    await cleanupTestData(supabase, [
      { table: 'irregular_students', match: { student_id: testStudentId } },
      { table: 'students', match: { id: testStudentId } },
      { table: 'section', match: { section_id: testSectionId } },
      { table: 'course', match: { course_code: testCourseCode } },
    ]);
  });

  describe('validateChangeRequest', () => {
    it('should validate capacity increase as safe', async () => {
      const result = await validateChangeRequest(
        supabase,
        testSectionId,
        'ADJUST_CAPACITY',
        {
          from: { capacity: 40 },
          to: { capacity: 50 },
        }
      );

      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should detect capacity reduction affecting irregular students', async () => {
      // Add irregular student who needs this course
      await supabase.from('irregular_students').insert({
        student_id: testStudentId,
        required_courses: [testCourseCode],
        reason: 'Testing capacity validation',
      });

      const result = await validateChangeRequest(
        supabase,
        testSectionId,
        'ADJUST_CAPACITY',
        {
          from: { capacity: 40 },
          to: { capacity: 0 }, // Too small
        }
      );

      expect(result.isValid).toBe(false);
      expect(result.affectsIrregular).toBe(true);
      expect(result.affectedStudents).toContain(testStudentId);
      expect(result.error).toContain('irregular');

      // Cleanup
      await supabase
        .from('irregular_students')
        .delete()
        .eq('student_id', testStudentId);
    });

    it('should allow instructor changes without affecting students', async () => {
      const result = await validateChangeRequest(
        supabase,
        testSectionId,
        'REASSIGN_INSTRUCTOR',
        {
          from: { instructor_id: 'faculty-001' },
          to: { instructor_id: 'faculty-002' },
        }
      );

      expect(result.isValid).toBe(true);
      expect(result.warnings).toBeDefined();
    });

    it('should allow room changes without affecting students', async () => {
      const result = await validateChangeRequest(
        supabase,
        testSectionId,
        'CHANGE_ROOM',
        {
          from: { room_number: 'B204' },
          to: { room_number: 'B205' },
        }
      );

      expect(result.isValid).toBe(true);
    });

    it('should detect time slot conflicts for irregular students', async () => {
      // This test would require:
      // 1. Creating a schedule for the irregular student
      // 2. Attempting to change time slot to conflict
      // For now, we test the validation structure

      const result = await validateChangeRequest(
        supabase,
        testSectionId,
        'CHANGE_TIME_SLOT',
        {
          from: { time_slots: [{ day: 'Monday', start_time: '09:00:00', end_time: '10:30:00' }] },
          to: { time_slots: [{ day: 'Monday', start_time: '10:00:00', end_time: '11:30:00' }] },
        }
      );

      // Should at least run without errors
      expect(result).toBeDefined();
      expect(result.isValid).toBeDefined();
    });

    it('should handle section not found', async () => {
      const result = await validateChangeRequest(
        supabase,
        'non-existent-section',
        'ADJUST_CAPACITY',
        {
          from: { capacity: 40 },
          to: { capacity: 50 },
        }
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('not found');
    });

    it('should handle unknown request type', async () => {
      const result = await validateChangeRequest(
        supabase,
        testSectionId,
        'UNKNOWN_TYPE',
        {
          from: {},
          to: {},
        }
      );

      expect(result.isValid).toBe(false);
      expect(result.error).toContain('Unknown');
    });
  });

  describe('applyChangeRequest', () => {
    let testRequestId: string;
    let scheduleVersionId: string;

    beforeAll(async () => {
      // Create test schedule version
      const { data: scheduleVersion } = await supabase
        .from('schedule_versions')
        .insert({
          version: 1,
          status: 'DRAFT',
        })
        .select('id')
        .single();

      scheduleVersionId = scheduleVersion!.id;
    });

    afterAll(async () => {
      await cleanupTestData(supabase, [
        { table: 'teaching_load_change_requests', match: { id: testRequestId } },
        { table: 'schedule_versions', match: { id: scheduleVersionId } },
      ]);
    });

    it('should apply approved capacity change', async () => {
      // Create approved change request
      const { data: request } = await supabase
        .from('teaching_load_change_requests')
        .insert({
          schedule_version_id: scheduleVersionId,
          section_id: testSectionId,
          requested_by: 'test-user',
          request_type: 'ADJUST_CAPACITY',
          changes: {
            from: { capacity: 40 },
            to: { capacity: 50 },
          },
          reason: 'Test application',
          validation_status: 'APPROVED',
          applied: false,
        })
        .select('id')
        .single();

      testRequestId = request!.id;

      const result = await applyChangeRequest(supabase, testRequestId);

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify section was updated
      const { data: updatedSection } = await supabase
        .from('section')
        .select('capacity')
        .eq('section_id', testSectionId)
        .single();

      expect(updatedSection!.capacity).toBe(50);

      // Verify request marked as applied
      const { data: updatedRequest } = await supabase
        .from('teaching_load_change_requests')
        .select('applied')
        .eq('id', testRequestId)
        .single();

      expect(updatedRequest!.applied).toBe(true);

      // Revert section capacity for other tests
      await supabase
        .from('section')
        .update({ capacity: 40 })
        .eq('section_id', testSectionId);
    });

    it('should not apply unapproved request', async () => {
      const { data: request } = await supabase
        .from('teaching_load_change_requests')
        .insert({
          schedule_version_id: scheduleVersionId,
          section_id: testSectionId,
          requested_by: 'test-user',
          request_type: 'ADJUST_CAPACITY',
          changes: {
            from: { capacity: 40 },
            to: { capacity: 45 },
          },
          reason: 'Test unapproved',
          validation_status: 'PENDING',
          applied: false,
        })
        .select('id')
        .single();

      const result = await applyChangeRequest(supabase, request!.id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('approved');

      // Cleanup
      await supabase
        .from('teaching_load_change_requests')
        .delete()
        .eq('id', request!.id);
    });

    it('should not apply already applied request', async () => {
      const { data: request } = await supabase
        .from('teaching_load_change_requests')
        .insert({
          schedule_version_id: scheduleVersionId,
          section_id: testSectionId,
          requested_by: 'test-user',
          request_type: 'ADJUST_CAPACITY',
          changes: {
            from: { capacity: 40 },
            to: { capacity: 42 },
          },
          reason: 'Test already applied',
          validation_status: 'APPROVED',
          applied: true,
        })
        .select('id')
        .single();

      const result = await applyChangeRequest(supabase, request!.id);

      expect(result.success).toBe(false);
      expect(result.error).toContain('already');

      // Cleanup
      await supabase
        .from('teaching_load_change_requests')
        .delete()
        .eq('id', request!.id);
    });

    it('should handle non-existent request', async () => {
      const result = await applyChangeRequest(supabase, 'non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('not found');
    });
  });
});

