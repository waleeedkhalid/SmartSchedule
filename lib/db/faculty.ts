/**
 * Faculty Database Access Layer
 * 
 * Purpose: Helper functions for faculty-specific operations
 * - Link users to instructor profiles
 * - Manage availability preferences
 * - Fetch assigned sections
 */

// MIGRATED: Now uses Prisma ORM instead of Supabase Client
import { db } from '@/lib/db';
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
  // First, get user's email from user_roles
  const userRole = await db.userRole.findUnique({
    where: { user_id: userId },
    select: { email: true }
  });
  
  if (!userRole) {
    return null;
  }
  
  // Then find instructor by email
  const instructor = await db.instructor.findUnique({
    where: { email: userRole.email }
  });
  
  return instructor as Instructor | null;
}

/**
 * Get instructor record by email address
 * 
 * @param email - Email address to search for
 * @returns Instructor record or null if not found
 */
export async function getInstructorByUserEmail(email: string): Promise<Instructor | null> {
  const instructor = await db.instructor.findUnique({
    where: { email }
  });
  
  return instructor as Instructor | null;
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
  
  const sections = await db.section.findMany({
    where: {
      instructor_id: instructorId,
      academic_semester_id: semester
    },
    include: {
      course: {
        select: {
          title: true,
          credits: true,
          level: true
        }
      }
    },
    orderBy: { course_code: 'asc' }
  });
  
  // Transform to FacultySection format
  return sections.map((section) => ({
    id: section.id,
    course_code: section.course_code,
    course_title: section.course?.title || section.course_code,
    section_no: section.section_no,
    capacity: section.capacity,
    meeting_pattern: parseMeetingPattern(section.meeting_pattern),
    room_code: section.room_code,
    credits: section.course?.credits,
    level: section.course?.level,
  }));
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
  
  const instructor = await db.instructor.update({
    where: { id: instructorId },
    data: updates
  });
  
  return { success: true, instructor: instructor as Instructor };
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
  
  const instructor = await db.instructor.findUnique({
    where: { id: instructorId },
    select: {
      preferred_times: true,
      unavailable_times: true
    }
  });
  
  if (!instructor) {
    return null;
  }
  
  return {
    preferred_times: (instructor.preferred_times as WeeklyAvailability) || null,
    unavailable_times: (instructor.unavailable_times as WeeklyAvailability) || null,
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
  
  const userRole = await db.userRole.findUnique({
    where: { user_id: userId },
    select: { role: true }
  });
  
  return userRole?.role === 'faculty';
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
  const instructor = await db.instructor.findUnique({
    where: { id: instructorId },
    select: { max_load_per_week: true }
  });
  
  // Get sections count for current semester
  const sections = await db.section.findMany({
    where: {
      instructor_id: instructorId,
      academic_semester_id: semester
    },
    select: {
      id: true,
      course_code: true
    }
  });
  
  const sectionCount = sections.length;
  const uniqueCourses = new Set(sections.map(s => s.course_code)).size;
  
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

