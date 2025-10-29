/**
 * Database queries for course enrollments and section assignments
 * 
 * REFACTORED: Replaces student-enrollments.ts
 * Implements dual enrollment model:
 * - course_enrollment: Academic record (course-level)
 * - section_assignment: Scheduling detail (section-level)
 */
import { createClient } from '@/supabase/server';
import { getCurrentSemester } from './semesters';

export interface CourseEnrollment {
  id: string;
  student_id: string;
  course_code: string;
  academic_semester_id: string;
  enrollment_type: 'required' | 'elective' | 'retake';
  status: 'enrolled' | 'dropped' | 'completed' | 'failed' | 'withdrawn';
  enrolled_at: string;
  dropped_at: string | null;
  grade: string | null;
  credits_earned: number | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface SectionAssignment {
  id: string;
  course_enrollment_id: string;
  section_id: string;
  assignment_type: 'lecture' | 'lab' | 'tutorial';
  assigned_at: string;
  created_at: string | null;
}

export interface EnrollmentValidation {
  valid: boolean;
  error?: string;
  warnings?: string[];
  current_credits?: number;
  max_credits?: number;
  section_capacity?: number;
  section_enrollment?: number;
}

export interface EnrollmentFilters {
  student_id?: string;
  semester_id?: string;
  course_code?: string;
  status?: 'enrolled' | 'dropped' | 'completed' | 'failed' | 'withdrawn';
  enrollment_type?: 'required' | 'elective' | 'retake';
}

/**
 * Validate if a student can enroll in a section
 * Uses the database function validate_enrollment() if available
 * @param studentId - Student ID
 * @param sectionId - Section ID
 * @returns Validation result
 */
export async function validateEnrollment(
  studentId: string,
  sectionId: string
): Promise<EnrollmentValidation> {
  const supabase = await createClient();
  
  // Try using database function first
  const { data: fnData, error: fnError } = await supabase
    .rpc('validate_enrollment', { 
      student_id: studentId,
      section_id: sectionId
    });
  
  if (!fnError && fnData) {
    return fnData as EnrollmentValidation;
  }
  
  // Fallback to manual validation
  // This is a simplified version - the database function is more comprehensive
  
  // 1. Check if section exists and get details
  const { data: section, error: sectionError } = await supabase
    .from('section')
    .select('id, capacity, current_enrollment, course_code, academic_semester_id')
    .eq('id', sectionId)
    .single();
  
  if (sectionError || !section) {
    return {
      valid: false,
      error: 'Section not found'
    };
  }
  
  // 2. Check capacity
  if (section.current_enrollment >= section.capacity) {
    return {
      valid: false,
      error: 'Section is full',
      section_capacity: section.capacity,
      section_enrollment: section.current_enrollment
    };
  }
  
  // 3. Check if already enrolled
  const { data: existingEnrollment } = await supabase
    .from('course_enrollment')
    .select(`
      id,
      section_assignment!inner (section_id)
    `)
    .eq('student_id', studentId)
    .eq('course_code', section.course_code)
    .eq('academic_semester_id', section.academic_semester_id)
    .eq('status', 'enrolled')
    .single();
  
  if (existingEnrollment) {
    return {
      valid: false,
      error: 'Already enrolled in this course'
    };
  }
  
  return {
    valid: true
  };
}

/**
 * Assign a student to a section (enroll)
 * Uses the database function assign_student_to_section() if available
 * This handles both course enrollment and section assignment
 * @param studentId - Student ID
 * @param sectionId - Section ID
 * @param enrollmentType - Type of enrollment ('required' | 'elective' | 'retake')
 * @returns Enrollment result
 */
export async function assignStudentToSection(
  studentId: string,
  sectionId: string,
  enrollmentType: 'required' | 'elective' | 'retake' = 'elective'
): Promise<{ success: boolean; enrollment_id?: string; error?: string }> {
  const supabase = await createClient();
  
  // Try using database function first
  const { data: fnData, error: fnError } = await supabase
    .rpc('assign_student_to_section', { 
      student_id: studentId,
      section_id: sectionId,
      enrollment_type: enrollmentType
    });
  
  if (!fnError && fnData) {
    return {
      success: true,
      enrollment_id: fnData
    };
  }
  
  // If function doesn't exist, return error asking to use database function
  return {
    success: false,
    error: 'Database function assign_student_to_section() not available. Please run migration 015.'
  };
}

/**
 * Drop a section (unenroll a student)
 * Uses the database function drop_section() if available
 * @param studentId - Student ID
 * @param sectionId - Section ID
 * @returns Success status
 */
export async function dropSection(
  studentId: string,
  sectionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Try using database function first
  const { data: fnData, error: fnError } = await supabase
    .rpc('drop_section', { 
      student_id: studentId,
      section_id: sectionId
    });
  
  if (!fnError) {
    return { success: true };
  }
  
  // If function doesn't exist, return error asking to use database function
  return {
    success: false,
    error: 'Database function drop_section() not available. Please run migration 015.'
  };
}

/**
 * Get student's total credits for a semester
 * Uses the database function get_student_total_credits() if available
 * @param studentId - Student ID
 * @param semesterId - Semester ID (defaults to current semester)
 * @returns Total credits
 */
export async function getStudentTotalCredits(
  studentId: string,
  semesterId?: string
): Promise<number> {
  const supabase = await createClient();
  const semester = semesterId || (await getCurrentSemester())?.id;
  
  if (!semester) return 0;
  
  // Try using database function first
  const { data: fnData, error: fnError } = await supabase
    .rpc('get_student_total_credits', { 
      student_id: studentId,
      semester_id: semester
    });
  
  if (!fnError && fnData !== null) {
    return fnData;
  }
  
  // Fallback to manual calculation
  const { data: enrollments } = await supabase
    .from('course_enrollment')
    .select(`
      course:course!inner (credits)
    `)
    .eq('student_id', studentId)
    .eq('academic_semester_id', semester)
    .eq('status', 'enrolled');
  
  if (!enrollments) return 0;
  
  return enrollments.reduce((total, enrollment: any) => {
    return total + (enrollment.course?.credits || 0);
  }, 0);
}

/**
 * Get course enrollments with filters
 * @param filters - Filter criteria
 * @returns Array of course enrollments
 */
export async function getCourseEnrollments(filters: EnrollmentFilters = {}): Promise<CourseEnrollment[]> {
  const supabase = await createClient();
  let query = supabase
    .from('course_enrollment')
    .select('*')
    .order('enrolled_at', { ascending: false });
  
  if (filters.student_id) {
    query = query.eq('student_id', filters.student_id);
  }
  if (filters.semester_id) {
    query = query.eq('academic_semester_id', filters.semester_id);
  }
  if (filters.course_code) {
    query = query.eq('course_code', filters.course_code);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.enrollment_type) {
    query = query.eq('enrollment_type', filters.enrollment_type);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return data as CourseEnrollment[];
}

/**
 * Get section assignments for a course enrollment
 * @param enrollmentId - Course enrollment ID
 * @returns Array of section assignments
 */
export async function getSectionAssignments(enrollmentId: string): Promise<SectionAssignment[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section_assignment')
    .select('*')
    .eq('course_enrollment_id', enrollmentId)
    .order('assignment_type');
  
  if (error) throw error;
  return data as SectionAssignment[];
}

/**
 * Get a student's enrollments with section details for a semester
 * @param studentId - Student ID
 * @param semesterId - Semester ID (defaults to current semester)
 * @returns Array of enrollments with sections
 */
export async function getStudentEnrollmentsWithSections(
  studentId: string,
  semesterId?: string
) {
  const supabase = await createClient();
  const semester = semesterId || (await getCurrentSemester())?.id;
  
  if (!semester) return [];
  
  const { data, error } = await supabase
    .from('course_enrollment')
    .select(`
      *,
      course:course (
        code,
        name,
        credits,
        level
      ),
      section_assignments:section_assignment (
        id,
        assignment_type,
        assigned_at,
        section:section (
          id,
          section_no,
          section_type,
          meeting_pattern,
          room_code,
          instructor:instructor (
            id,
            name
          )
        )
      )
    `)
    .eq('student_id', studentId)
    .eq('academic_semester_id', semester)
    .order('enrolled_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

/**
 * Get enrollment count for a course in a semester
 * Uses the database function get_course_enrollment_count() if available
 * @param courseCode - Course code
 * @param semesterId - Semester ID (defaults to current semester)
 * @returns Enrollment count
 */
export async function getCourseEnrollmentCount(
  courseCode: string,
  semesterId?: string
): Promise<number> {
  const supabase = await createClient();
  const semester = semesterId || (await getCurrentSemester())?.id;
  
  if (!semester) return 0;
  
  // Try using database function first
  const { data: fnData, error: fnError } = await supabase
    .rpc('get_course_enrollment_count', { 
      course_code: courseCode,
      semester_id: semester
    });
  
  if (!fnError && fnData !== null) {
    return fnData;
  }
  
  // Fallback to manual count
  const { count, error } = await supabase
    .from('course_enrollment')
    .select('*', { count: 'exact', head: true })
    .eq('course_code', courseCode)
    .eq('academic_semester_id', semester)
    .eq('status', 'enrolled');
  
  if (error) throw error;
  return count || 0;
}

/**
 * Get course enrollment by ID
 * @param enrollmentId - Enrollment ID
 * @returns Course enrollment or null
 */
export async function getCourseEnrollment(enrollmentId: string): Promise<CourseEnrollment | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course_enrollment')
    .select('*')
    .eq('id', enrollmentId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data as CourseEnrollment;
}


