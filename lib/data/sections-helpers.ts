/**
 * Helper functions for fetching data needed for section forms
 * Fetches all courses, instructors, and rooms (not paginated) for dropdowns
 * 
 * Wrapped with React.cache() for request memoization - ensures the same
 * data is only fetched once per request, even if called multiple times
 * in the same render tree.
 */

import { cache } from 'react';
import { createClient } from "@/supabase/server";
import type { Database } from "@/lib/types/database";
import type { Course } from "@/lib/data/courses";
import type { Room } from "@/lib/data/rooms";

type CourseRow = Database["public"]["Tables"]["course"]["Row"];
type FacultyProfile = Database["public"]["Tables"]["faculty_profile"]["Row"];

type SectionListItem = {
  id: string;
  course_code: string;
  section_no: string;
  instructor_id: string | null;
  room_code: string | null;
  capacity: number;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  };
  group_level: number;
  state: 'draft' | 'released';
  activity?: string | null;
};

/**
 * Fetches all courses from database (for dropdowns)
 * Returns full Course type with all fields including level property
 * Wrapped with React.cache() for request memoization
 * 
 * Note: Cannot use unstable_cache() because createClient() accesses cookies()
 */
export const getAllCourses = cache(async (): Promise<Course[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("course")
    .select("*")
    .order("code", { ascending: true });
  
  if (error) {
    console.error("Error fetching courses:", error);
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }
  
  // Map database results to Course type with level property for backward compatibility
  return (data || []).map((course: CourseRow): Course => ({
    code: course.code,
    title: course.title,
    credits: course.credits,
    weekly_hours: course.weekly_hours,
    is_elective: course.is_elective,
    recommended_level: course.recommended_level,
    created_at: course.created_at,
    updated_at: course.updated_at,
    created_by: course.created_by,
    // For backward compatibility, add level property that maps from recommended_level
    level: course.recommended_level ?? 0, // Map NULL to 0 for electives
  }));
});

/**
 * Fetches all faculty profiles from database (for dropdowns)
 * Wrapped with React.cache() for request memoization
 * 
 * Note: Cannot use unstable_cache() because createClient() accesses cookies()
 */
export const getAllInstructors = cache(async (): Promise<Array<{ id: string; name: string }>> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("faculty_profile")
    .select("user_id, name")
    .order("name", { ascending: true });
  
  if (error) {
    console.error("Error fetching faculty profiles:", error);
    throw new Error(`Failed to fetch faculty profiles: ${error.message}`);
  }
  
  return (data || []).map((faculty: FacultyProfile) => ({
    id: faculty.user_id,
    name: faculty.name || "",
  }));
});

/**
 * Fetches all rooms from database (for dropdowns)
 * Returns full Room type with all fields
 * Wrapped with React.cache() for request memoization
 * 
 * Note: Cannot use unstable_cache() because createClient() accesses cookies()
 */
export const getAllRooms = cache(async (): Promise<Room[]> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("room")
    .select("*")
    .order("code", { ascending: true });
  
  if (error) {
    console.error("Error fetching rooms:", error);
    throw new Error(`Failed to fetch rooms: ${error.message}`);
  }
  
  return (data || []) as Room[];
});

/**
 * Fetches all rooms from database (for list pages - includes capacity)
 * Wrapped with React.cache() for request memoization
 * 
 * Note: Cannot use unstable_cache() because createClient() accesses cookies()
 */
export const getAllRoomsList = cache(async (): Promise<Array<{
  code: string;
  type: string;
  capacity: number | null;
}>> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("room")
    .select("code, type, capacity")
    .order("code", { ascending: true });
  
  if (error) {
    console.error("Error fetching rooms:", error);
    throw new Error(`Failed to fetch rooms: ${error.message}`);
  }
  
  return (data || []).map((room: Room) => ({
    code: room.code,
    type: room.type,
    capacity: room.capacity,
  }));
});

/**
 * Fetches all faculty profiles from database (for list pages - includes email, preferences, and max load)
 * Wrapped with React.cache() for request memoization
 * 
 * Note: Cannot use unstable_cache() because createClient() accesses cookies()
 */
export const getAllInstructorsList = cache(async (): Promise<Array<{
  id: string;
  name: string;
  email: string | null;
  max_load_per_week: number | null;
  preferred_times: Array<{ day?: string; start?: string; end?: string }> | null;
  unavailable_times: Array<{ day?: string; start?: string; end?: string }> | null;
}>> => {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from("faculty_profile")
    .select("user_id, name, email, max_load_per_week, preferred_times, unavailable_times")
    .order("name", { ascending: true });
  
  if (error) {
    console.error("Error fetching faculty profiles:", error);
    throw new Error(`Failed to fetch faculty profiles: ${error.message}`);
  }
  
  return (data || []).map((faculty: FacultyProfile) => ({
    id: faculty.user_id,
    name: faculty.name || "",
    email: faculty.email,
    max_load_per_week: faculty.max_load_per_week,
    preferred_times: Array.isArray(faculty.preferred_times) ? faculty.preferred_times : null,
    unavailable_times: Array.isArray(faculty.unavailable_times) ? faculty.unavailable_times : null,
  }));
});

/**
 * Fetches all sections from database
 * Wrapped with React.cache() for request memoization
 * 
 * Note: Cannot use unstable_cache() because createClient() accesses cookies()
 */
export const getAllSections = cache(async (): Promise<SectionListItem[]> => {
  const supabase = await createClient();
  
  // Get current active term (status = 'draft' or 'released')
  const { data: currentTerm } = await supabase
    .from("academic_term")
    .select("id")
    .in("status", ["draft", "released"])
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let sectionIds: string[] | null = null;
  if (currentTerm) {
    const { data: scheduleSections } = await supabase
      .from("schedule")
      .select("section_id")
      .eq("term_id", currentTerm.id);
    
    sectionIds = (scheduleSections || []).map((s: { section_id: string }) => s.section_id);
  }

  // Build query
  let query = supabase
    .from("section")
    .select("*");

  // If we have a term and section IDs, filter by them
  if (currentTerm && sectionIds && sectionIds.length > 0) {
    query = query.in("id", sectionIds);
  } else if (currentTerm && sectionIds && sectionIds.length === 0) {
    // Term exists but has no sections - return empty array
    return [];
  }

  const { data, error } = await query.order("course_code", { ascending: true });

  if (error) {
    console.error("Error fetching sections:", error);
    throw new Error(`Failed to fetch sections: ${error.message}`);
  }

  return (data || []).map((section: Database["public"]["Tables"]["section"]["Row"]) => ({
    id: section.id,
    course_code: section.course_code,
    section_no: section.section_no,
    instructor_id: section.instructor_id,
    room_code: section.room_code,
    capacity: section.capacity,
    meeting_pattern: section.meeting_pattern as {
      days: string[];
      start: string;
      duration: number;
    },
    group_level: section.group_level,
    state: section.state as 'draft' | 'released',
    activity: section.activity || null,
  }));
});

