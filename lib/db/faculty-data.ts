/**
 * Faculty Dashboard Data
 * 
 * Provides real-time data for faculty dashboard including instructor profile and sections
 */

import { createClient } from "@/supabase/server";
import type { Database } from "@/lib/types/database";

type Instructor = Database["public"]["Tables"]["instructor"]["Row"];
type Section = Database["public"]["Tables"]["section"]["Row"];
type Course = Database["public"]["Tables"]["course"]["Row"];

export interface FacultyProfile {
  id: string;
  name: string;
  email: string | null;
  user_id: string | null;
  max_load_per_week: number | null;
  preferred_times: any;
  unavailable_times: any;
}

export interface FacultySection {
  id: string;
  course_code: string;
  course_title: string;
  section_no: string;
  room_code: string | null;
  capacity: number;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  };
  group_level: number;
  state: "draft" | "released";
  activity: string | null;
}

/**
 * Get instructor profile by user ID
 */
export async function getFacultyProfile(userId: string): Promise<FacultyProfile | null> {
  const supabase = await createClient();

  // Get instructor_id from faculty_profile
  const { data: profile } = await supabase
    .from("faculty_profile")
    .select("instructor_id")
    .eq("user_id", userId)
    .single();

  if (!profile?.instructor_id) {
    return null;
  }

  // Get instructor details
  const { data: instructor, error } = await supabase
    .from("instructor")
    .select("*")
    .eq("id", profile.instructor_id)
    .single();

  if (error || !instructor) {
    console.error("Error fetching instructor:", error);
    return null;
  }

  return {
    id: instructor.id,
    name: instructor.name,
    email: instructor.email,
    user_id: instructor.user_id,
    max_load_per_week: instructor.max_load_per_week,
    preferred_times: instructor.preferred_times,
    unavailable_times: instructor.unavailable_times,
  };
}

/**
 * Get all sections assigned to an instructor
 */
export async function getFacultySections(instructorId: string): Promise<FacultySection[]> {
  const supabase = await createClient();

  const { data: sections, error } = await supabase
    .from("section")
    .select(`
      id,
      course_code,
      section_no,
      room_code,
      capacity,
      meeting_pattern,
      group_level,
      state,
      activity,
      course:course!section_course_code_fkey(title)
    `)
    .eq("instructor_id", instructorId)
    .order("course_code", { ascending: true })
    .order("section_no", { ascending: true });

  if (error) {
    console.error("Error fetching faculty sections:", error);
    return [];
  }

  return (sections || []).map((section: any) => ({
    id: section.id,
    course_code: section.course_code,
    course_title: section.course?.title || "",
    section_no: section.section_no,
    room_code: section.room_code,
    capacity: section.capacity,
    meeting_pattern: section.meeting_pattern as {
      days: string[];
      start: string;
      duration: number;
    },
    group_level: section.group_level,
    state: section.state as "draft" | "released",
    activity: section.activity,
  }));
}

