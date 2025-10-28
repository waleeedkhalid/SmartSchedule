/**
 * Student Schedule Database Access Layer
 * 
 * Purpose: Fetch complete student schedule combining required and elective courses
 * 
 * Schedule Composition:
 * 1. Required Courses (Auto-enrolled):
 *    - All non-elective courses matching student's level
 *    - Automatically included in schedule
 *    - No enrollment record needed
 * 
 * 2. Elective Courses (Manually registered):
 *    - Elective courses student has enrolled in
 *    - Tracked in student_enrollment table
 *    - Subject to capacity and credit constraints
 * 
 * Data Flow:
 * 1. Get student level from user_roles
 * 2. Query all sections for required courses at that level
 * 3. Query enrolled elective sections
 * 4. Merge and return combined schedule
 */

import { createClient } from '@/supabase/server';
import type { StudentScheduleView, ExamView } from '@/lib/types/database';

/**
 * Get complete schedule for a student (required + elective sections)
 * 
 * Logic:
 * 1. Fetch student's level
 * 2. Get all sections for required courses (is_elective=false, level matches)
 * 3. Get enrolled elective sections from student_enrollment
 * 4. Combine both sets into unified schedule view
 * 5. Calculate total credits
 * 
 * @param studentId - UUID of the student
 * @returns Complete schedule with all sections and credit info
 */
export async function getStudentSchedule(studentId: string): Promise<StudentScheduleView | null> {
  const supabase = await createClient();
  
  // Step 1: Get student level
  const { data: student, error: studentError } = await supabase
    .from('user_roles')
    .select('level')
    .eq('user_id', studentId)
    .eq('role', 'student')
    .single();
  
  if (studentError || !student || !student.level) {
    console.error('Student not found or level not set:', studentError);
    return null;
  }
  
  const studentLevel = student.level;
  
  // Step 2: Get all sections for REQUIRED courses at student's level
  // Required courses: is_elective = false AND level = student level
  const { data: requiredSections, error: requiredError } = await supabase
    .from('section')
    .select(`
      id,
      course_code,
      section_no,
      instructor_id,
      room_code,
      meeting_pattern,
      state,
      course:course!section_course_code_fkey(
        code,
        title,
        level,
        credits,
        weekly_hours,
        is_elective
      ),
      instructor:instructor!section_instructor_id_fkey(
        id,
        name,
        email
      )
    `)
    .eq('group_level', studentLevel)
    .eq('state', 'released') // Only show released sections
    .order('course_code', { ascending: true });
  
  if (requiredError) {
    console.error('Error fetching required sections:', requiredError);
  }
  
  // Filter to only non-elective courses
  const requiredCourseSections = (requiredSections || []).filter(
    (section: any) => section.course && !section.course.is_elective
  );
  
  // Step 3: Get enrolled ELECTIVE sections
  const { data: electiveEnrollments, error: electiveError } = await supabase
    .from('student_enrollment')
    .select(`
      id,
      section_id,
      section:section!student_enrollment_section_id_fkey(
        id,
        course_code,
        section_no,
        instructor_id,
        room_code,
        meeting_pattern,
        state,
        course:course!section_course_code_fkey(
          code,
          title,
          level,
          credits,
          weekly_hours,
          is_elective
        ),
        instructor:instructor!section_instructor_id_fkey(
          id,
          name,
          email
        )
      )
    `)
    .eq('student_id', studentId)
    .eq('status', 'registered');
  
  if (electiveError) {
    console.error('Error fetching elective enrollments:', electiveError);
  }
  
  const electiveSections = (electiveEnrollments || [])
    .map((enrollment: any) => enrollment.section)
    .filter((section: any) => section && section.course);
  
  // Step 4: Combine required and elective sections
  const allSections = [
    // Required courses (is_enrolled = false because auto-enrolled, not in student_enrollment)
    ...requiredCourseSections.map((section: any) => ({
      id: section.id,
      course_code: section.course_code,
      course_title: section.course.title,
      section_no: section.section_no,
      credits: section.course.credits,
      is_elective: false,
      is_enrolled: false, // Auto-enrolled, not manual registration
      is_swe_scheduled: section.course_code.startsWith('SWE') && section.course.level >= 4 && section.course.level <= 8,
      instructor_name: section.instructor?.name || null,
      room_code: section.room_code,
      meeting_pattern: section.meeting_pattern,
      state: section.state,
    })),
    // Elective courses (is_enrolled = true because in student_enrollment)
    ...electiveSections.map((section: any) => ({
      id: section.id,
      course_code: section.course_code,
      course_title: section.course.title,
      section_no: section.section_no,
      credits: section.course.credits,
      is_elective: true,
      is_enrolled: true, // Manually registered
      is_swe_scheduled: section.course_code.startsWith('SWE') && section.course.level >= 4 && section.course.level <= 8,
      instructor_name: section.instructor?.name || null,
      room_code: section.room_code,
      meeting_pattern: section.meeting_pattern,
      state: section.state,
    })),
  ];
  
  // Step 5: Calculate total credits
  const requiredCredits = requiredCourseSections.reduce(
    (sum: number, section: any) => sum + (section.course?.credits || 0),
    0
  );
  
  const electiveCredits = electiveSections.reduce(
    (sum: number, section: any) => sum + (section.course?.credits || 0),
    0
  );
  
  return {
    student_id: studentId,
    level: studentLevel,
    total_credits: requiredCredits + electiveCredits,
    required_credits: requiredCredits,
    elective_credits: electiveCredits,
    sections: allSections,
  };
}

/**
 * Get exam timetable for a student
 * Includes all exams for courses in student's schedule (required + electives)
 * 
 * Logic:
 * 1. Get student's schedule (all courses)
 * 2. Query exams for those courses
 * 3. Detect conflicts (exams at same time)
 * 4. Sort by date/time
 * 
 * @param studentId - UUID of the student
 * @returns Array of exams with conflict information
 */
export async function getStudentExams(studentId: string): Promise<ExamView[]> {
  const supabase = await createClient();
  
  // Step 1: Get student's schedule to know which courses they're taking
  const schedule = await getStudentSchedule(studentId);
  
  if (!schedule || schedule.sections.length === 0) {
    return []; // No courses, no exams
  }
  
  // Extract course codes from schedule
  const courseCodes = schedule.sections.map(s => s.course_code);
  
  // Step 2: Query all exams for these courses
  const { data: exams, error: examsError } = await supabase
    .from('exam')
    .select(`
      *,
      course:course!exam_course_code_fkey(code, title),
      section:section!exam_section_id_fkey(id, section_no)
    `)
    .in('course_code', courseCodes)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });
  
  if (examsError) {
    console.error('Error fetching exams:', examsError);
    return [];
  }
  
  if (!exams || exams.length === 0) {
    return [];
  }
  
  // Step 3: Detect conflicts
  // An exam conflicts if another exam overlaps in time on the same date
  const examViews: ExamView[] = exams.map((exam: any) => {
    // Calculate end time
    const startTime = new Date(`2000-01-01T${exam.start_time}`);
    const endTime = new Date(startTime.getTime() + exam.duration_minutes * 60000);
    const endTimeStr = endTime.toTimeString().substring(0, 8);
    
    // Find conflicts: same date, overlapping time
    const conflicts = exams.filter((other: any) => {
      if (other.id === exam.id) return false; // Don't compare with self
      if (other.date !== exam.date) return false; // Different dates, no conflict
      
      // Check time overlap
      const otherStart = new Date(`2000-01-01T${other.start_time}`);
      const otherEnd = new Date(otherStart.getTime() + other.duration_minutes * 60000);
      
      // Overlap if: start1 < end2 AND start2 < end1
      return startTime < otherEnd && otherStart < endTime;
    });
    
    return {
      id: exam.id,
      course_code: exam.course_code,
      course_title: exam.course?.title || '',
      section_id: exam.section_id,
      section_no: exam.section?.section_no || null,
      date: exam.date,
      start_time: exam.start_time,
      duration_minutes: exam.duration_minutes,
      end_time: endTimeStr,
      room_codes: exam.room_codes,
      has_conflict: conflicts.length > 0,
      conflicting_exams: conflicts.map((c: any) => {
        const cStart = new Date(`2000-01-01T${c.start_time}`);
        const cEnd = new Date(cStart.getTime() + c.duration_minutes * 60000);
        return {
          id: c.id,
          course_code: c.course_code,
          course_title: c.course?.title || '',
          start_time: c.start_time,
          end_time: cEnd.toTimeString().substring(0, 8),
        };
      }),
    };
  });
  
  return examViews;
}

/**
 * Get schedule statistics for overview display
 * 
 * @param studentId - UUID of the student
 * @returns Summary statistics about student's schedule
 */
export async function getScheduleStats(studentId: string) {
  const schedule = await getStudentSchedule(studentId);
  
  if (!schedule) {
    return {
      total_sections: 0,
      required_sections: 0,
      elective_sections: 0,
      total_credits: 0,
      required_credits: 0,
      elective_credits: 0,
      total_contact_hours: 0,
    };
  }
  
  const requiredSections = schedule.sections.filter(s => !s.is_elective);
  const electiveSections = schedule.sections.filter(s => s.is_elective);
  
  // Calculate total weekly contact hours
  const totalContactHours = schedule.sections.reduce(
    (sum, section) => sum + (section.meeting_pattern.duration || 0) / 60,
    0
  );
  
  return {
    total_sections: schedule.sections.length,
    required_sections: requiredSections.length,
    elective_sections: electiveSections.length,
    total_credits: schedule.total_credits,
    required_credits: schedule.required_credits,
    elective_credits: schedule.elective_credits,
    total_contact_hours: Math.round(totalContactHours),
  };
}

/**
 * Check if student's schedule has any time conflicts
 * Required courses should never conflict (handled by scheduling committee)
 * but electives might conflict if student registers unwisely
 * 
 * @param studentId - UUID of the student
 * @returns Conflict information
 */
export async function checkScheduleConflicts(studentId: string) {
  const schedule = await getStudentSchedule(studentId);
  
  if (!schedule || schedule.sections.length === 0) {
    return { has_conflicts: false, conflicts: [] };
  }
  
  const conflicts: any[] = [];
  
  // Check each section against all others for time conflicts
  schedule.sections.forEach((section1, i) => {
    schedule.sections.slice(i + 1).forEach((section2) => {
      // Check if days overlap
      const days1 = section1.meeting_pattern.days;
      const days2 = section2.meeting_pattern.days;
      const daysOverlap = days1.some(day => days2.includes(day));
      
      if (!daysOverlap) return; // No overlap in days
      
      // Check if times overlap
      const start1 = new Date(`2000-01-01T${section1.meeting_pattern.start}:00`);
      const end1 = new Date(start1.getTime() + section1.meeting_pattern.duration * 60000);
      
      const start2 = new Date(`2000-01-01T${section2.meeting_pattern.start}:00`);
      const end2 = new Date(start2.getTime() + section2.meeting_pattern.duration * 60000);
      
      if (start1 < end2 && start2 < end1) {
        // Time conflict detected
        conflicts.push({
          section1: {
            course_code: section1.course_code,
            section_no: section1.section_no,
            is_elective: section1.is_elective,
          },
          section2: {
            course_code: section2.course_code,
            section_no: section2.section_no,
            is_elective: section2.is_elective,
          },
          overlapping_days: days1.filter(day => days2.includes(day)),
        });
      }
    });
  });
  
  return {
    has_conflicts: conflicts.length > 0,
    conflicts,
  };
}

