/**
 * Student Enrollment Database Access Layer
 * 
 * Purpose: Manage student registrations for elective sections
 * 
 * Key Concepts:
 * - Required courses: Auto-enrolled based on student level (no entries in this table)
 * - Elective courses: Student manually registers (tracked in student_enrollment table)
 * - Constraints: Max 20 credits total, section capacity limits, prerequisites
 * 
 * Data Flow:
 * 1. Student views available elective sections
 * 2. System validates: credit limit, capacity, prerequisites
 * 3. Enrollment created with status='registered'
 * 4. Student can drop enrollment (status updated to 'dropped')
 */

import { createClient } from '@/supabase/server';
import type { 
  StudentEnrollmentView, 
  AvailableElectiveSection,
  StudentCreditsInfo,
  SectionCapacityInfo,
  EnrollmentValidationResult
} from '@/lib/types/database';

/**
 * Get all enrollments for a student with full course/section details
 * @param studentId - UUID of the student
 * @returns Array of enrollments with joined data
 */
export async function getStudentEnrollments(studentId: string): Promise<StudentEnrollmentView[]> {
  const supabase = await createClient();
  
  // Query enrollments with all related data joined
  // This provides everything needed to display enrollment cards in the UI
  const { data, error } = await supabase
    .from('student_enrollment')
    .select(`
      *,
      section:section!student_enrollment_section_id_fkey(
        *,
        course:course!section_course_code_fkey(*),
        instructor:instructor!section_instructor_id_fkey(id, name, email)
      )
    `)
    .eq('student_id', studentId)
    .eq('status', 'registered') // Only active enrollments
    .order('enrolled_at', { ascending: false });
  
  if (error) throw error;
  
  // Transform database response to match our view interface
  return (data || []).map((enrollment: any) => ({
    id: enrollment.id,
    student_id: enrollment.student_id,
    section_id: enrollment.section_id,
    status: enrollment.status,
    enrolled_at: enrollment.enrolled_at,
    dropped_at: enrollment.dropped_at,
    section: {
      id: enrollment.section.id,
      course_code: enrollment.section.course_code,
      section_no: enrollment.section.section_no,
      instructor_id: enrollment.section.instructor_id,
      room_code: enrollment.section.room_code,
      capacity: enrollment.section.capacity,
      meeting_pattern: enrollment.section.meeting_pattern,
      group_level: enrollment.section.group_level,
      state: enrollment.section.state,
    },
    course: enrollment.section.course,
    instructor: enrollment.section.instructor,
  }));
}

/**
 * Get available elective sections for registration
 * Includes capacity info and filters for student's level
 * 
 * Logic:
 * 1. Query all elective course sections
 * 2. Calculate enrolled count per section
 * 3. Compute available seats
 * 4. Filter to appropriate level (optional)
 * 
 * @param level - Student level (1-5), optional filter
 * @returns Array of available sections with enrollment counts
 */
export async function getAvailableElectiveSections(level?: number): Promise<AvailableElectiveSection[]> {
  const supabase = await createClient();
  
  // Build query for elective course sections
  let query = supabase
    .from('section')
    .select(`
      *,
      course:course!section_course_code_fkey(code, title, level, credits, weekly_hours, is_elective),
      instructor:instructor!section_instructor_id_fkey(id, name, email)
    `)
    .order('course_code', { ascending: true })
    .order('section_no', { ascending: true });
  
  // Optionally filter by level (show electives for student's level or higher levels)
  if (level) {
    query = query.gte('group_level', level);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // For each section, get enrollment count
  const sectionsWithCapacity = await Promise.all(
    (data || [])
      .filter((section: any) => section.course?.is_elective) // Only electives
      .map(async (section: any) => {
        // Count current enrollments for this section
        const { count, error: countError } = await supabase
          .from('student_enrollment')
          .select('*', { count: 'exact', head: true })
          .eq('section_id', section.id)
          .eq('status', 'registered');
        
        if (countError) console.error('Error counting enrollments:', countError);
        
        const enrolledCount = count || 0;
        const availableSeats = section.capacity - enrolledCount;
        
        return {
          section_id: section.id,
          course_code: section.course_code,
          course_title: section.course.title,
          course_level: section.course.level,
          course_credits: section.course.credits,
          weekly_hours: section.course.weekly_hours,
          section_no: section.section_no,
          instructor_id: section.instructor_id,
          instructor_name: section.instructor?.name || null,
          room_code: section.room_code,
          capacity: section.capacity,
          enrolled_count: enrolledCount,
          available_seats: availableSeats,
          is_full: availableSeats <= 0,
          meeting_pattern: section.meeting_pattern,
          state: section.state,
        };
      })
  );
  
  return sectionsWithCapacity;
}

/**
 * Calculate total credits for a student (required + elective)
 * Uses database function get_student_total_credits for consistency
 * 
 * @param studentId - UUID of the student
 * @returns Credit breakdown object
 */
export async function calculateStudentCredits(studentId: string): Promise<StudentCreditsInfo> {
  const supabase = await createClient();
  
  // Call database function which handles all the credit calculation logic
  // This ensures consistency with enrollment validation
  const { data, error } = await supabase.rpc('get_student_total_credits', {
    p_student_id: studentId
  });
  
  if (error) throw error;
  
  return data as StudentCreditsInfo;
}

/**
 * Check section capacity and availability
 * 
 * @param sectionId - UUID of the section
 * @returns Capacity information
 */
export async function checkSectionCapacity(sectionId: string): Promise<SectionCapacityInfo> {
  const supabase = await createClient();
  
  // Call database function for accurate real-time capacity check
  const { data, error } = await supabase.rpc('check_section_capacity', {
    p_section_id: sectionId
  });
  
  if (error) throw error;
  
  return data as SectionCapacityInfo;
}

/**
 * Enroll a student in an elective section
 * Validates all constraints before creating enrollment
 * 
 * Validation Flow:
 * 1. Check if already enrolled (prevent duplicates)
 * 2. Validate credit limit (≤20 total)
 * 3. Check section capacity (seats available)
 * 4. Verify prerequisites (V1: always pass)
 * 5. Create enrollment record
 * 
 * @param studentId - UUID of the student
 * @param sectionId - UUID of the section to enroll in
 * @returns Success status and enrollment ID or error message
 */
export async function enrollInSection(
  studentId: string, 
  sectionId: string
): Promise<{ success: boolean; enrollmentId?: string; error?: string }> {
  const supabase = await createClient();
  
  // Step 1: Check if already enrolled
  const { data: existing, error: checkError } = await supabase
    .from('student_enrollment')
    .select('id')
    .eq('student_id', studentId)
    .eq('section_id', sectionId)
    .eq('status', 'registered')
    .maybeSingle();
  
  if (checkError) {
    return { success: false, error: 'Failed to check existing enrollment' };
  }
  
  if (existing) {
    return { success: false, error: 'Already enrolled in this section' };
  }
  
  // Step 2-4: Validate all constraints using database function
  const { data: validation, error: validationError } = await supabase.rpc('validate_enrollment', {
    p_student_id: studentId,
    p_section_id: sectionId
  });
  
  if (validationError) {
    return { success: false, error: 'Validation failed' };
  }
  
  const validationResult = validation as EnrollmentValidationResult;
  
  if (!validationResult.success) {
    return { success: false, error: validationResult.error };
  }
  
  // Step 5: All validations passed - create enrollment
  const { data: enrollment, error: insertError } = await supabase
    .from('student_enrollment')
    .insert({
      student_id: studentId,
      section_id: sectionId,
      status: 'registered',
    })
    .select('id')
    .single();
  
  if (insertError) {
    return { success: false, error: 'Failed to create enrollment' };
  }
  
  return { 
    success: true, 
    enrollmentId: enrollment.id 
  };
}

/**
 * Drop an enrollment (mark as dropped, not delete)
 * Maintains audit trail by updating status instead of deleting
 * 
 * @param enrollmentId - UUID of the enrollment record
 * @param studentId - UUID of the student (for authorization)
 * @returns Success status
 */
export async function dropEnrollment(
  enrollmentId: string,
  studentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Update enrollment status to 'dropped' and record timestamp
  // RLS policies ensure student can only drop their own enrollments
  const { error } = await supabase
    .from('student_enrollment')
    .update({
      status: 'dropped',
      dropped_at: new Date().toISOString(),
    })
    .eq('id', enrollmentId)
    .eq('student_id', studentId) // Security: ensure student owns this enrollment
    .eq('status', 'registered'); // Only drop active enrollments
  
  if (error) {
    return { success: false, error: 'Failed to drop enrollment' };
  }
  
  return { success: true };
}

/**
 * Get enrollment statistics for a student
 * Useful for displaying overview cards
 * 
 * @param studentId - UUID of the student
 * @returns Enrollment counts and credit totals
 */
export async function getEnrollmentStats(studentId: string) {
  const supabase = await createClient();
  
  // Get count of active enrollments
  const { count, error: countError } = await supabase
    .from('student_enrollment')
    .select('*', { count: 'exact', head: true })
    .eq('student_id', studentId)
    .eq('status', 'registered');
  
  if (countError) throw countError;
  
  // Get credit breakdown
  const credits = await calculateStudentCredits(studentId);
  
  return {
    enrolled_sections: count || 0,
    ...credits,
    available_credits: 20 - credits.total, // How many more credits can be added
  };
}

