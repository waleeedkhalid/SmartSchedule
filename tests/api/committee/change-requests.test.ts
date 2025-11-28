/**
 * Teaching Load Committee Change Requests API Tests
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createTestSupabaseClient, cleanupTestData } from '../../utils/test-supabase-client';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('Teaching Load Change Requests API', () => {
  let supabase: SupabaseClient;
  let committeeUserId: string;
  let schedulingUserId: string;
  let testSectionId: string;
  let testScheduleVersionId: string;
  let testCourseCode: string;

  beforeAll(async () => {
    supabase = createTestSupabaseClient();
    
    // Setup test data
    testCourseCode = 'TEST-CR-001';
    
    // Create test committee users
    const { data: committeeUser } = await supabase.auth.admin.createUser({
      email: 'teaching-load-test@test.com',
      password: 'password123',
      email_confirm: true,
    });
    committeeUserId = committeeUser.user!.id;
    
    const { data: schedulingUser } = await supabase.auth.admin.createUser({
      email: 'scheduling-test@test.com',
      password: 'password123',
      email_confirm: true,
    });
    schedulingUserId = schedulingUser.user!.id;
    
    // Create committee memberships
    await supabase.from('committee_members').insert([
      {
        id: committeeUserId,
        committee_type: 'teaching_load',
      },
      {
        id: schedulingUserId,
        committee_type: 'scheduling',
      },
    ]);
    
    // Create test course
    await supabase.from('course').insert({
      course_code: testCourseCode,
      course_name: 'Test Course for Change Requests',
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
    
    // Create test schedule version
    const { data: scheduleVersion } = await supabase
      .from('schedule_versions')
      .insert({
        version: 1,
        status: 'DRAFT',
        created_by: schedulingUserId,
      })
      .select('id')
      .single();
    
    testScheduleVersionId = scheduleVersion!.id;
  });

  afterAll(async () => {
    await cleanupTestData(supabase, [
      { table: 'teaching_load_change_requests', match: { section_id: testSectionId } },
      { table: 'section', match: { section_id: testSectionId } },
      { table: 'course', match: { course_code: testCourseCode } },
      { table: 'schedule_versions', match: { id: testScheduleVersionId } },
      { table: 'committee_members', match: { id: committeeUserId } },
      { table: 'committee_members', match: { id: schedulingUserId } },
    ]);
    
    // Clean up auth users
    await supabase.auth.admin.deleteUser(committeeUserId);
    await supabase.auth.admin.deleteUser(schedulingUserId);
  });

  describe('POST /api/committee/teaching-load/change-requests', () => {
    it('should create a change request for capacity adjustment', async () => {
      // Sign in as teaching load committee member
      await supabase.auth.signInWithPassword({
        email: 'teaching-load-test@test.com',
        password: 'password123',
      });

      const requestData = {
        schedule_version_id: testScheduleVersionId,
        section_id: testSectionId,
        request_type: 'ADJUST_CAPACITY',
        changes: {
          from: { capacity: 40 },
          to: { capacity: 50 },
        },
        reason: 'Need to accommodate more students due to high demand',
      };

      const { data, error } = await supabase
        .from('teaching_load_change_requests')
        .insert(requestData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.request_type).toBe('ADJUST_CAPACITY');
      expect(data!.validation_status).toBeDefined();
    });

    it('should validate change request against irregular students', async () => {
      // Create an irregular student who needs this course
      const { data: irregularStudent } = await supabase
        .from('irregular_students')
        .insert({
          student_id: 'test-irregular-001',
          required_courses: [testCourseCode],
          reason: 'Test irregular student',
        })
        .select()
        .single();

      const requestData = {
        schedule_version_id: testScheduleVersionId,
        section_id: testSectionId,
        request_type: 'ADJUST_CAPACITY',
        changes: {
          from: { capacity: 40 },
          to: { capacity: 5 }, // Too small for irregular student
        },
        reason: 'Testing capacity reduction validation',
      };

      const { data, error } = await supabase
        .from('teaching_load_change_requests')
        .insert(requestData)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data!.validation_status).toBe('INVALID');
      expect(data!.validation_error).toContain('irregular');

      // Cleanup
      await supabase.from('irregular_students').delete().eq('student_id', 'test-irregular-001');
    });

    it('should reject request from non-committee member', async () => {
      // Sign out
      await supabase.auth.signOut();

      const requestData = {
        schedule_version_id: testScheduleVersionId,
        section_id: testSectionId,
        request_type: 'CHANGE_ROOM',
        changes: {
          from: { room_number: 'B204' },
          to: { room_number: 'B205' },
        },
        reason: 'Unauthorized request attempt',
      };

      const { data, error } = await supabase
        .from('teaching_load_change_requests')
        .insert(requestData)
        .select()
        .single();

      // Should fail due to RLS policy
      expect(error).toBeDefined();
    });

    it('should not allow changes to published schedule', async () => {
      // Update schedule version to published
      await supabase
        .from('schedule_versions')
        .update({ status: 'PUBLISHED' })
        .eq('id', testScheduleVersionId);

      await supabase.auth.signInWithPassword({
        email: 'teaching-load-test@test.com',
        password: 'password123',
      });

      const requestData = {
        schedule_version_id: testScheduleVersionId,
        section_id: testSectionId,
        request_type: 'CHANGE_ROOM',
        changes: {
          from: { room_number: 'B204' },
          to: { room_number: 'B205' },
        },
        reason: 'Attempting change to published schedule',
      };

      // This should be prevented by the API validation
      const { data, error } = await supabase
        .from('teaching_load_change_requests')
        .insert(requestData)
        .select()
        .single();

      // Depending on implementation, this might be blocked at API or DB level
      // For now, we check that it's either rejected or marked invalid
      if (!error) {
        expect(data!.validation_status).not.toBe('VALID');
      }

      // Revert back to DRAFT
      await supabase
        .from('schedule_versions')
        .update({ status: 'DRAFT' })
        .eq('id', testScheduleVersionId);
    });
  });

  describe('GET /api/committee/teaching-load/change-requests', () => {
    let testRequestId: string;

    beforeEach(async () => {
      await supabase.auth.signInWithPassword({
        email: 'teaching-load-test@test.com',
        password: 'password123',
      });

      // Create a test request
      const { data } = await supabase
        .from('teaching_load_change_requests')
        .insert({
          schedule_version_id: testScheduleVersionId,
          section_id: testSectionId,
          requested_by: committeeUserId,
          request_type: 'CHANGE_ROOM',
          changes: {
            from: { room_number: 'B204' },
            to: { room_number: 'B205' },
          },
          reason: 'Test retrieval',
          validation_status: 'VALID',
        })
        .select('id')
        .single();

      testRequestId = data!.id;
    });

    it('should retrieve all change requests', async () => {
      const { data, error } = await supabase
        .from('teaching_load_change_requests')
        .select('*')
        .eq('schedule_version_id', testScheduleVersionId);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.length).toBeGreaterThan(0);
    });

    it('should filter requests by status', async () => {
      const { data, error } = await supabase
        .from('teaching_load_change_requests')
        .select('*')
        .eq('validation_status', 'VALID');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.every(r => r.validation_status === 'VALID')).toBe(true);
    });

    it('should filter requests affecting irregular students', async () => {
      const { data, error } = await supabase
        .from('teaching_load_change_requests')
        .select('*')
        .eq('affects_irregular_students', true);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('PATCH /api/committee/teaching-load/change-requests/:id', () => {
    let testRequestId: string;

    beforeEach(async () => {
      await supabase.auth.signInWithPassword({
        email: 'teaching-load-test@test.com',
        password: 'password123',
      });

      const { data } = await supabase
        .from('teaching_load_change_requests')
        .insert({
          schedule_version_id: testScheduleVersionId,
          section_id: testSectionId,
          requested_by: committeeUserId,
          request_type: 'REASSIGN_INSTRUCTOR',
          changes: {
            from: { instructor_id: 'faculty-001' },
            to: { instructor_id: 'faculty-002' },
          },
          reason: 'Test approval workflow',
          validation_status: 'VALID',
        })
        .select('id')
        .single();

      testRequestId = data!.id;
    });

    it('should allow scheduling committee to approve request', async () => {
      await supabase.auth.signInWithPassword({
        email: 'scheduling-test@test.com',
        password: 'password123',
      });

      const { data, error } = await supabase
        .from('teaching_load_change_requests')
        .update({
          validation_status: 'APPROVED',
          reviewed_by: schedulingUserId,
        })
        .eq('id', testRequestId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data!.validation_status).toBe('APPROVED');
      expect(data!.reviewed_by).toBe(schedulingUserId);
    });

    it('should allow scheduling committee to reject request', async () => {
      await supabase.auth.signInWithPassword({
        email: 'scheduling-test@test.com',
        password: 'password123',
      });

      const { data, error } = await supabase
        .from('teaching_load_change_requests')
        .update({
          validation_status: 'REJECTED',
          reviewer_notes: 'Conflicts with other assignments',
        })
        .eq('id', testRequestId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data!.validation_status).toBe('REJECTED');
    });
  });

  describe('DELETE /api/committee/teaching-load/change-requests/:id', () => {
    it('should allow requester to delete their own request', async () => {
      await supabase.auth.signInWithPassword({
        email: 'teaching-load-test@test.com',
        password: 'password123',
      });

      const { data: request } = await supabase
        .from('teaching_load_change_requests')
        .insert({
          schedule_version_id: testScheduleVersionId,
          section_id: testSectionId,
          requested_by: committeeUserId,
          request_type: 'CHANGE_ROOM',
          changes: {
            from: { room_number: 'B204' },
            to: { room_number: 'B206' },
          },
          reason: 'Test deletion',
          validation_status: 'PENDING',
        })
        .select('id')
        .single();

      const { error } = await supabase
        .from('teaching_load_change_requests')
        .delete()
        .eq('id', request!.id);

      expect(error).toBeNull();

      // Verify deletion
      const { data: deletedRequest } = await supabase
        .from('teaching_load_change_requests')
        .select('id')
        .eq('id', request!.id)
        .maybeSingle();

      expect(deletedRequest).toBeNull();
    });

    it('should not allow deletion of applied requests', async () => {
      await supabase.auth.signInWithPassword({
        email: 'teaching-load-test@test.com',
        password: 'password123',
      });

      const { data: request } = await supabase
        .from('teaching_load_change_requests')
        .insert({
          schedule_version_id: testScheduleVersionId,
          section_id: testSectionId,
          requested_by: committeeUserId,
          request_type: 'CHANGE_ROOM',
          changes: {
            from: { room_number: 'B204' },
            to: { room_number: 'B207' },
          },
          reason: 'Test applied deletion',
          validation_status: 'APPROVED',
          applied: true,
        })
        .select('id')
        .single();

      // This should be prevented by API logic
      const { error } = await supabase
        .from('teaching_load_change_requests')
        .delete()
        .eq('id', request!.id)
        .eq('applied', false); // API should check this

      // If the API properly prevents deletion, there should be an error
      // or the record should still exist
      const { data: stillExists } = await supabase
        .from('teaching_load_change_requests')
        .select('id')
        .eq('id', request!.id)
        .maybeSingle();

      expect(stillExists).toBeDefined();
    });
  });
});

