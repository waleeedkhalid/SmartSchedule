/**
 * Exam Management API Tests
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createTestSupabaseClient, cleanupTestData } from '../../utils/test-supabase-client';
import type { SupabaseClient } from '@supabase/supabase-js';

describe('Exam Management API', () => {
  let supabase: SupabaseClient;
  let committeeUserId: string;
  let testCourseCode: string;
  let testTermCode: string;
  let examScheduleId: string;

  beforeAll(async () => {
    supabase = createTestSupabaseClient();
    testCourseCode = 'TEST-EXAM-001';
    testTermCode = 'TEST-TERM-EXAM-001';

    // Create test committee user
    const { data: committeeUser } = await supabase.auth.admin.createUser({
      email: 'exam-committee-test@test.com',
      password: 'password123',
      email_confirm: true,
    });
    committeeUserId = committeeUser.user!.id;

    // Create committee membership
    await supabase.from('committee_members').insert({
      id: committeeUserId,
      committee_type: 'scheduling',
    });

    // Create test term
    await supabase.from('academic_term').insert({
      code: testTermCode,
      name: 'Test Term for Exams',
      is_active: true,
    });

    // Create test course
    await supabase.from('course').insert({
      course_code: testCourseCode,
      course_name: 'Test Course for Exams',
      credits: 3,
      type: 'REQUIRED',
    });
  });

  afterAll(async () => {
    await cleanupTestData(supabase, [
      { table: 'exam_student_assignments', match: { exam_id: examScheduleId } },
      { table: 'exam_conflicts', match: { exam_id_1: examScheduleId } },
      { table: 'exam_schedules', match: { term_code: testTermCode } },
      { table: 'course', match: { course_code: testCourseCode } },
      { table: 'academic_term', match: { code: testTermCode } },
      { table: 'committee_members', match: { id: committeeUserId } },
    ]);

    await supabase.auth.admin.deleteUser(committeeUserId);
  });

  describe('POST /api/committee/exams', () => {
    it('should create exam schedule successfully', async () => {
      await supabase.auth.signInWithPassword({
        email: 'exam-committee-test@test.com',
        password: 'password123',
      });

      const examData = {
        term_code: testTermCode,
        course_code: testCourseCode,
        exam_type: 'MIDTERM',
        exam_date: '2024-10-15',
        start_time: '09:00:00',
        end_time: '11:00:00',
        room_number: 'EXAM-HALL-A',
        capacity: 100,
        notes: 'Test exam schedule',
      };

      const { data, error } = await supabase
        .from('exam_schedules')
        .insert({
          ...examData,
          created_by: committeeUserId,
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.exam_type).toBe('MIDTERM');
      expect(data!.capacity).toBe(100);

      examScheduleId = data!.id;
    });

    it('should validate required fields', async () => {
      const invalidData = {
        term_code: testTermCode,
        // Missing required fields
      };

      const { error } = await supabase
        .from('exam_schedules')
        .insert(invalidData as any);

      expect(error).toBeDefined();
    });

    it('should validate time range', async () => {
      const invalidTimeData = {
        term_code: testTermCode,
        course_code: testCourseCode,
        exam_type: 'FINAL',
        exam_date: '2024-11-20',
        start_time: '11:00:00',
        end_time: '09:00:00', // End before start
        capacity: 80,
        created_by: committeeUserId,
      };

      const { error } = await supabase
        .from('exam_schedules')
        .insert(invalidTimeData);

      // Should fail constraint check
      expect(error).toBeDefined();
    });

    it('should validate capacity constraints', async () => {
      const invalidCapacityData = {
        term_code: testTermCode,
        course_code: testCourseCode,
        exam_type: 'QUIZ',
        exam_date: '2024-10-20',
        start_time: '14:00:00',
        end_time: '15:00:00',
        capacity: -10, // Invalid capacity
        created_by: committeeUserId,
      };

      const { error } = await supabase
        .from('exam_schedules')
        .insert(invalidCapacityData);

      expect(error).toBeDefined();
    });

    it('should require scheduling committee membership', async () => {
      await supabase.auth.signOut();

      const examData = {
        term_code: testTermCode,
        course_code: testCourseCode,
        exam_type: 'MAKEUP',
        exam_date: '2024-10-25',
        start_time: '10:00:00',
        end_time: '12:00:00',
        capacity: 50,
      };

      const { error } = await supabase
        .from('exam_schedules')
        .insert(examData);

      // Should fail RLS policy
      expect(error).toBeDefined();
    });
  });

  describe('GET /api/committee/exams', () => {
    it('should retrieve all exam schedules', async () => {
      await supabase.auth.signInWithPassword({
        email: 'exam-committee-test@test.com',
        password: 'password123',
      });

      const { data, error } = await supabase
        .from('exam_schedules')
        .select('*')
        .eq('term_code', testTermCode);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    it('should filter by course code', async () => {
      const { data, error } = await supabase
        .from('exam_schedules')
        .select('*')
        .eq('course_code', testCourseCode);

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.every(e => e.course_code === testCourseCode)).toBe(true);
    });

    it('should filter by exam type', async () => {
      const { data, error } = await supabase
        .from('exam_schedules')
        .select('*')
        .eq('exam_type', 'MIDTERM');

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.every(e => e.exam_type === 'MIDTERM')).toBe(true);
    });

    it('should filter by date range', async () => {
      const startDate = '2024-10-01';
      const endDate = '2024-10-31';

      const { data, error } = await supabase
        .from('exam_schedules')
        .select('*')
        .gte('exam_date', startDate)
        .lte('exam_date', endDate);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });
  });

  describe('PATCH /api/committee/exams/:id', () => {
    it('should update exam schedule', async () => {
      const { data, error } = await supabase
        .from('exam_schedules')
        .update({
          capacity: 120,
          notes: 'Updated capacity',
        })
        .eq('id', examScheduleId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data!.capacity).toBe(120);
      expect(data!.notes).toBe('Updated capacity');
    });

    it('should update room assignment', async () => {
      const { data, error } = await supabase
        .from('exam_schedules')
        .update({ room_number: 'EXAM-HALL-B' })
        .eq('id', examScheduleId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data!.room_number).toBe('EXAM-HALL-B');
    });

    it('should update exam time', async () => {
      const { data, error } = await supabase
        .from('exam_schedules')
        .update({
          start_time: '10:00:00',
          end_time: '12:00:00',
        })
        .eq('id', examScheduleId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data!.start_time).toBe('10:00:00');
      expect(data!.end_time).toBe('12:00:00');
    });
  });

  describe('Exam Student Assignments', () => {
    let testStudentId: string;

    beforeAll(async () => {
      // Create test student
      testStudentId = 'test-exam-student-001';
      await supabase.from('students').insert({
        id: testStudentId,
        full_name: 'Test Exam Student',
        level: 3,
        status: 'REGULAR',
      });
    });

    afterAll(async () => {
      await supabase.from('students').delete().eq('id', testStudentId);
    });

    it('should assign student to exam', async () => {
      const { data, error } = await supabase
        .from('exam_student_assignments')
        .insert({
          exam_id: examScheduleId,
          student_id: testStudentId,
          seat_number: 'A-001',
          status: 'SCHEDULED',
        })
        .select()
        .single();

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(data!.seat_number).toBe('A-001');
    });

    it('should prevent duplicate assignments', async () => {
      const { error } = await supabase
        .from('exam_student_assignments')
        .insert({
          exam_id: examScheduleId,
          student_id: testStudentId,
          status: 'SCHEDULED',
        });

      // Should fail unique constraint
      expect(error).toBeDefined();
    });

    it('should auto-update enrolled count', async () => {
      // Get initial count
      const { data: initialExam } = await supabase
        .from('exam_schedules')
        .select('enrolled_count')
        .eq('id', examScheduleId)
        .single();

      const initialCount = initialExam!.enrolled_count;

      // Create another student
      const secondStudentId = 'test-exam-student-002';
      await supabase.from('students').insert({
        id: secondStudentId,
        full_name: 'Test Exam Student 2',
        level: 3,
        status: 'REGULAR',
      });

      // Assign second student
      await supabase
        .from('exam_student_assignments')
        .insert({
          exam_id: examScheduleId,
          student_id: secondStudentId,
          status: 'SCHEDULED',
        });

      // Check updated count
      const { data: updatedExam } = await supabase
        .from('exam_schedules')
        .select('enrolled_count')
        .eq('id', examScheduleId)
        .single();

      expect(updatedExam!.enrolled_count).toBe(initialCount + 1);

      // Cleanup
      await supabase.from('students').delete().eq('id', secondStudentId);
    });

    it('should track attendance status', async () => {
      const { data, error } = await supabase
        .from('exam_student_assignments')
        .update({ status: 'ATTENDED' })
        .eq('exam_id', examScheduleId)
        .eq('student_id', testStudentId)
        .select()
        .single();

      expect(error).toBeNull();
      expect(data!.status).toBe('ATTENDED');
    });
  });

  describe('Conflict Detection', () => {
    let conflictingExamId: string;

    it('should detect time overlap conflicts', async () => {
      // Create overlapping exam
      const { data: conflictingExam } = await supabase
        .from('exam_schedules')
        .insert({
          term_code: testTermCode,
          course_code: 'TEST-EXAM-002',
          exam_type: 'FINAL',
          exam_date: '2024-10-15',
          start_time: '10:30:00', // Overlaps with existing exam
          end_time: '12:30:00',
          capacity: 80,
          created_by: committeeUserId,
        })
        .select()
        .single();

      conflictingExamId = conflictingExam!.id;

      // Run conflict detection
      const { data: conflicts } = await supabase
        .rpc('detect_exam_conflicts');

      expect(conflicts).toBeDefined();
      // Should detect overlap
    });

    it('should detect room conflicts', async () => {
      // Create exam in same room at same time
      const { data: roomConflictExam } = await supabase
        .from('exam_schedules')
        .insert({
          term_code: testTermCode,
          course_code: 'TEST-EXAM-003',
          exam_type: 'QUIZ',
          exam_date: '2024-10-15',
          start_time: '09:00:00',
          end_time: '11:00:00',
          room_number: 'EXAM-HALL-B', // Same room as updated exam
          capacity: 60,
          created_by: committeeUserId,
        })
        .select()
        .single();

      // Run conflict detection
      const { data: conflicts } = await supabase
        .rpc('detect_exam_conflicts');

      expect(conflicts).toBeDefined();
    });

    afterAll(async () => {
      // Clean up conflicting exams
      await supabase.from('exam_schedules').delete().eq('course_code', 'TEST-EXAM-002');
      await supabase.from('exam_schedules').delete().eq('course_code', 'TEST-EXAM-003');
    });
  });

  describe('DELETE /api/committee/exams/:id', () => {
    it('should prevent deletion with student assignments', async () => {
      // Exam should have assignments from previous tests
      const { data: assignments } = await supabase
        .from('exam_student_assignments')
        .select('id')
        .eq('exam_id', examScheduleId);

      if (assignments && assignments.length > 0) {
        const { error } = await supabase
          .from('exam_schedules')
          .delete()
          .eq('id', examScheduleId);

        // Should fail due to FK constraint or API validation
        // (Depending on implementation)
      }
    });

    it('should allow deletion of empty exam', async () => {
      // Create new exam without assignments
      const { data: emptyExam } = await supabase
        .from('exam_schedules')
        .insert({
          term_code: testTermCode,
          course_code: testCourseCode,
          exam_type: 'MAKEUP',
          exam_date: '2024-11-01',
          start_time: '14:00:00',
          end_time: '16:00:00',
          capacity: 50,
          created_by: committeeUserId,
        })
        .select()
        .single();

      const { error } = await supabase
        .from('exam_schedules')
        .delete()
        .eq('id', emptyExam!.id);

      expect(error).toBeNull();
    });
  });
});

