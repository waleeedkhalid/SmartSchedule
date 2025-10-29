/**
 * Faculty Database Access Layer
 * 
 * Purpose: Helper functions for faculty-specific operations
 * - Link users to instructor profiles
 * - Manage availability preferences
 * - Fetch assigned sections
 */

import { createClient } from '@/supabase/server';
import type { Database } from '@/lib/types/database';
import type { MeetingPattern } from '@/lib/types/scheduling';
import { parseMeetingPattern } from '@/lib/types/scheduling';

type Instructor = Database['public']['Tables']['instructor']['Row'];
type Section = Database['public']['Tables']['section']['Row'];

export interface TimeSlot {
  start: string; // "08:00"
  end: string;   // "10:00"
  type: 'preferred' | 'unavailable';
}

export interface DayAvailability {
  day: string; // "Sunday", "Monday", etc.
  slots: TimeSlot[];
}

export type WeeklyAvailability = DayAvailability[];

export interface FacultySection {
  id: string;
  course_code: string;
  course_title: string;
  section_no: string;
  capacity: number;
  meeting_pattern: MeetingPattern | null;
  room_code: string | null;
  credits?: number;
  level?: number;
}

/**
 * Get faculty profile (instructor record) by user ID
 * Links authenticated user to their instructor profile via email
 * 
 * @param userId - UUID of the authenticated user
 * @returns Instructor record or null if not found
 */
export async function getFacultyProfile(userId: string): Promise<Instructor | null> {
  const supabase = await createClient();
  
  // First, get user's email from user_roles
  const { data: userRole, error: userError } = await supabase
    .from('user_roles')
    .select('email')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (userError || !userRole) {
    return null;
  }
  
  // Then find instructor by email
  const { data: instructor, error: instructorError } = await supabase
    .from('instructor')
    .select('*')
    .eq('email', userRole.email)
    .maybeSingle();
  
  if (instructorError) {
    return null;
  }
  
  return instructor;
}

/**
 * Get instructor record by email address
 * 
 * @param email - Email address to search for
 * @returns Instructor record or null if not found
 */
export async function getInstructorByUserEmail(email: string): Promise<Instructor | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('instructor')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  
  if (error) {
    return null;
  }
  
  return data;
}

/**
 * Get sections assigned to a faculty member
 * 
 * @param instructorId - UUID of the instructor
 * @param semesterId - Optional semester ID (defaults to current semester)
 * @returns Array of sections with course information
 * @throws Error if database query fails
 */
export async function getFacultySections(instructorId: string, semesterId?: string): Promise<FacultySection[]> {
  const supabase = await createClient();
  
  // Get semester ID if not provided
  let semester = semesterId;
  if (!semester) {
    const { getCurrentSemester } = await import('./semesters');
    const currentSemester = await getCurrentSemester();
    if (!currentSemester) {
      // Return empty array if no semester exists
      return [];
    }
    semester = currentSemester.id;
  }
  
  const { data, error } = await supabase
    .from('section')
    .select(`
      id,
      course_code,
      section_no,
      capacity,
      meeting_pattern,
      room_code,
      academic_semester_id,
      course:course!section_course_code_fkey(title, credits, level)
    `)
    .eq('instructor_id', instructorId)
    .eq('academic_semester_id', semester)
    .order('course_code');
  
  if (error) {
    console.error('Error fetching faculty sections:', error);
    throw new Error('Failed to fetch faculty sections');
  }
  
  // Transform to FacultySection format with proper type parsing
  return (data || []).map((section) => {
    // Handle course data which may be an array or object from Supabase join
    const courseData = Array.isArray(section.course) ? section.course[0] : section.course
    
    return {
      id: section.id,
      course_code: section.course_code,
      course_title: courseData?.title || section.course_code,
      section_no: section.section_no,
      capacity: section.capacity,
      meeting_pattern: parseMeetingPattern(section.meeting_pattern),
      room_code: section.room_code,
      credits: courseData?.credits,
      level: courseData?.level,
    }
  });
}

/**
 * Update faculty availability preferences
 * Updates preferred_times and unavailable_times in instructor table
 * 
 * @param instructorId - UUID of the instructor
 * @param availability - Weekly availability data
 * @returns Success status with updated instructor record
 */
export async function updateFacultyAvailability(
  instructorId: string,
  availability: {
    preferred_times?: WeeklyAvailability;
    unavailable_times?: WeeklyAvailability;
  }
): Promise<{ success: boolean; instructor?: Instructor; error?: string }> {
  const supabase = await createClient();
  
  // Build update object
  const updates: any = {
    updated_at: new Date().toISOString(),
  };
  
  if (availability.preferred_times !== undefined) {
    updates.preferred_times = availability.preferred_times;
  }
  
  if (availability.unavailable_times !== undefined) {
    updates.unavailable_times = availability.unavailable_times;
  }
  
  const { data, error } = await supabase
    .from('instructor')
    .update(updates)
    .eq('id', instructorId)
    .select()
    .maybeSingle();
  
  if (error) {
    return { success: false, error: 'Failed to update availability preferences' };
  }
  
  return { success: true, instructor: data };
}

/**
 * Get faculty availability preferences
 * 
 * @param instructorId - UUID of the instructor
 * @returns Availability preferences or null
 */
export async function getFacultyAvailability(
  instructorId: string
): Promise<{
  preferred_times: WeeklyAvailability | null;
  unavailable_times: WeeklyAvailability | null;
} | null> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('instructor')
    .select('preferred_times, unavailable_times')
    .eq('id', instructorId)
    .maybeSingle();
  
  if (error) {
    return null;
  }
  
  return {
    preferred_times: (data.preferred_times as WeeklyAvailability) || null,
    unavailable_times: (data.unavailable_times as WeeklyAvailability) || null,
  };
}

/**
 * Check if user has faculty role
 * 
 * @param userId - UUID of the user
 * @returns True if user is faculty, false otherwise
 */
export async function isFacultyUser(userId: string): Promise<boolean> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error || !data) {
    return false;
  }
  
  return data.role === 'faculty';
}

/**
 * Get faculty statistics (sections, load, etc.)
 * 
 * @param instructorId - UUID of the instructor
 * @param semesterId - Optional semester ID (defaults to current semester)
 * @returns Statistics object
 */
export async function getFacultyStats(instructorId: string, semesterId?: string) {
  const supabase = await createClient();
  
  // Get semester ID if not provided
  let semester = semesterId;
  if (!semester) {
    const { getCurrentSemester } = await import('./semesters');
    const currentSemester = await getCurrentSemester();
    if (!currentSemester) {
      // Return default stats if no semester exists
      return {
        totalSections: 0,
        uniqueCourses: 0,
        maxLoadPerWeek: 12,
        currentLoad: 0,
        loadPercentage: 0,
      };
    }
    semester = currentSemester.id;
  }
  
  // Get instructor info
  const { data: instructor } = await supabase
    .from('instructor')
    .select('max_load_per_week')
    .eq('id', instructorId)
    .maybeSingle();
  
  // Get sections count for current semester
  const { data: sections } = await supabase
    .from('section')
    .select('id, course_code, academic_semester_id')
    .eq('instructor_id', instructorId)
    .eq('academic_semester_id', semester);
  
  const sectionCount = sections?.length || 0;
  const uniqueCourses = new Set(sections?.map(s => s.course_code)).size;
  
  return {
    totalSections: sectionCount,
    uniqueCourses: uniqueCourses,
    maxLoadPerWeek: instructor?.max_load_per_week || 12,
    currentLoad: sectionCount,
    loadPercentage: Math.round((sectionCount / (instructor?.max_load_per_week || 12)) * 100),
  };
}

/**
 * Get complete faculty dashboard data
 * Combines instructor profile, sections, and stats in one call
 * 
 * @param userId - UUID of the authenticated user
 * @returns Complete dashboard data or null if profile not found
 */
export async function getFacultyDashboardData(userId: string) {
  const instructor = await getFacultyProfile(userId);
  
  if (!instructor) {
    return null;
  }
  
  const [sections, stats] = await Promise.all([
    getFacultySections(instructor.id),
    getFacultyStats(instructor.id),
  ]);
  
  return {
    instructor,
    sections,
    stats,
  };
}

