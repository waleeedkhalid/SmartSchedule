/**
 * Faculty Sections Operations
 *
 * Functions for fetching sections assigned to faculty members
 */

import { createClient } from "@/supabase/server";
import type { FacultySection } from "./types";

/**
 * Get all sections assigned to a faculty member
 * Looks up the faculty_profile id for the authenticated user before querying sections
 */
export async function getFacultySections(
  userId: string | null
): Promise<FacultySection[]> {
  const supabase = await createClient();

  if (!userId) {
    return [];
  }

  const { data: profile } = await supabase
    .from("faculty_profile")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (!profile?.id) {
    return [];
  }

  const { data: sections, error } = await supabase
    .from("section")
    .select(
      `
      id,
      course_code,
      section_no,
      room_code,
      capacity,
      meeting_pattern,
      group_level,
      state,
      activity,
      course:course!section_course_code_fkey(title, credits)
    `
    )
    .eq("instructor_id", profile.id)
    .order("course_code", { ascending: true })
    .order("section_no", { ascending: true });

  if (error) {
    return [];
  }

  // Get enrollment counts for each section
  const sectionIds = (sections || []).map((s: { id: string }) => s.id);
  const enrollmentCounts: Record<string, number> = {};

  if (sectionIds.length > 0) {
    const { data: enrollments } = await supabase
      .from("student_enrollment")
      .select("section_id")
      .in("section_id", sectionIds)
      .eq("status", "registered");

    if (enrollments) {
      enrollments.forEach((e: { section_id: string }) => {
        enrollmentCounts[e.section_id] =
          (enrollmentCounts[e.section_id] || 0) + 1;
      });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (sections || []).map((section: any) => {
    const courseData = Array.isArray(section.course)
      ? section.course[0]
      : section.course;

    return {
      id: section.id,
      course_code: section.course_code,
      course_title: courseData?.title || "",
      section_no: section.section_no,
      room_code: section.room_code,
      capacity: section.capacity,
      current_enrollment: enrollmentCounts[section.id] || 0,
      meeting_pattern: section.meeting_pattern as {
        days: string[];
        start: string;
        duration: number;
        is_lab?: boolean;
      },
      group_level: section.group_level,
      state: section.state as "draft" | "released",
      activity: section.activity,
      credits: courseData?.credits,
    };
  });
}
