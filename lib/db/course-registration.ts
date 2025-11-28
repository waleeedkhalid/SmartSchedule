/**
 * Course Registration Data Access Layer
 * 
 * Handles course registration logic including:
 * - Fetching available courses with prerequisite validation
 * - Checking if students can register for courses
 * - Determining course lock status based on prerequisites
 */

import { createClient } from '@/supabase/server';
import type { Database } from '@/lib/types/database';

type Course = Database['public']['Tables']['course']['Row'];
type CoursePrerequisite = {
  course_code: string;
  prerequisite_course_code: string;
};

export interface StudentCourseHistory {
  course_code: string;
  status: 'Passed' | 'Failed' | 'Registered' | 'Dropped';
}

export interface AvailableCourse {
  code: string;
  title: string;
  credits: number;
  weekly_hours: number;
  is_elective: boolean;
  recommended_level: number | null;
  is_locked: boolean;
  missing_prerequisites: string[]; // Course codes of missing prerequisites
  prerequisites: string[]; // All prerequisite course codes
}

/**
 * Get all available courses for a student with prerequisite validation
 * 
 * @param studentId - The student's user ID
 * @returns Array of available courses with lock status
 */
export async function getAvailableCoursesForStudent(
  studentId: string
): Promise<AvailableCourse[]> {
  const supabase = await createClient();

  // Step 1: Get student's course history (completed/passed courses)
  const { data: enrollments } = await supabase
    .from('student_enrollment')
    .select(`
      course_code:section!student_enrollment_section_id_fkey(
        course_code
      ),
      status
    `)
    .eq('student_id', studentId);

  // Extract passed course codes from student history
  // For now, we'll consider courses with status 'registered' as potentially passed
  // In a full implementation, you'd have a separate grades/completion table
  const passedCourseCodes = new Set<string>();
  (enrollments || []).forEach((enrollment: any) => {
    const courseCode = enrollment.course_code?.course_code;
    if (courseCode && enrollment.status === 'registered') {
      // Note: In production, you'd check a grade/completion status
      // For now, we'll assume registered courses are passed
      passedCourseCodes.add(courseCode);
    }
  });

  // Step 2: Get all courses with their prerequisites
  const { data: courses } = await supabase
    .from('course')
    .select(`
      code,
      title,
      credits,
      weekly_hours,
      is_elective,
      recommended_level
    `)
    .order('code');

  if (!courses) {
    return [];
  }

  // Step 3: Get all prerequisites for these courses
  const courseCodes = courses.map((c) => c.code);
  const { data: prerequisites } = await supabase
    .from('course_prerequisite')
    .select('course_code, prerequisite_course_code')
    .in('course_code', courseCodes);

  // Build prerequisite map: course_code -> array of prerequisite codes
  const prerequisiteMap = new Map<string, string[]>();
  (prerequisites || []).forEach((prereq: CoursePrerequisite) => {
    const existing = prerequisiteMap.get(prereq.course_code) || [];
    existing.push(prereq.prerequisite_course_code);
    prerequisiteMap.set(prereq.course_code, existing);
  });

  // Step 4: Build result with lock status
  return courses.map((course) => {
    const coursePrerequisites = prerequisiteMap.get(course.code) || [];
    const missingPrerequisites = coursePrerequisites.filter(
      (prereqCode) => !passedCourseCodes.has(prereqCode)
    );
    const isLocked = missingPrerequisites.length > 0;

    return {
      code: course.code,
      title: course.title,
      credits: course.credits,
      weekly_hours: course.weekly_hours,
      is_elective: course.is_elective,
      recommended_level: course.recommended_level,
      is_locked,
      missing_prerequisites: missingPrerequisites,
      prerequisites: coursePrerequisites,
    };
  });
}

/**
 * Get a single course with prerequisite information
 * 
 * @param courseCode - The course code to fetch
 * @param studentId - Optional student ID to check lock status
 * @returns Course with prerequisite info, or null if not found
 */
export async function getCourseWithPrerequisites(
  courseCode: string,
  studentId?: string
): Promise<AvailableCourse | null> {
  const supabase = await createClient();

  // Get course
  const { data: course, error } = await supabase
    .from('course')
    .select('code, title, credits, weekly_hours, is_elective, recommended_level')
    .eq('code', courseCode)
    .single();

  if (error || !course) {
    return null;
  }

  // Get prerequisites
  const { data: prerequisites } = await supabase
    .from('course_prerequisite')
    .select('prerequisite_course_code')
    .eq('course_code', courseCode);

  const prerequisiteCodes =
    prerequisites?.map((p) => p.prerequisite_course_code) || [];

  // If student ID provided, use optimized SQL function to check lock status
  let isLocked = false;
  let missingPrerequisites: string[] = [];

  if (studentId) {
    const { data: lockStatus, error: lockError } = await supabase.rpc(
      'check_course_prerequisites',
      {
        p_student_id: studentId,
        p_course_code: courseCode,
      }
    );

    if (!lockError && lockStatus && lockStatus.length > 0) {
      isLocked = lockStatus[0].is_locked;
      missingPrerequisites = lockStatus[0].missing_prerequisites || [];
    } else {
      // Fallback to manual check if function fails
      const { data: enrollments } = await supabase
        .from('student_enrollment')
        .select(`
          course_code:section!student_enrollment_section_id_fkey(
            course_code
          ),
          status
        `)
        .eq('student_id', studentId);

      const passedCourseCodes = new Set<string>();
      (enrollments || []).forEach((enrollment: any) => {
        const code = enrollment.course_code?.course_code;
        if (code && enrollment.status === 'registered') {
          passedCourseCodes.add(code);
        }
      });

      missingPrerequisites = prerequisiteCodes.filter(
        (code) => !passedCourseCodes.has(code)
      );
      isLocked = missingPrerequisites.length > 0;
    }
  }

  return {
    code: course.code,
    title: course.title,
    credits: course.credits,
    weekly_hours: course.weekly_hours,
    is_elective: course.is_elective,
    recommended_level: course.recommended_level,
    is_locked,
    missing_prerequisites: missingPrerequisites,
    prerequisites: prerequisiteCodes,
  };
}

