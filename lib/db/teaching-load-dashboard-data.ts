/**
 * Optimized data fetching for the Teaching Load Dashboard
 * Uses React.cache() for request-level memoization and Promise.all for parallel queries
 */

import { cache } from "react";
import { createClient } from "@/supabase/server";
import { extractJoinedRelation } from "@/lib/utils";
import { getActiveTerm } from "@/lib/db/term";
import type { Database } from "@/lib/types/database";

// Types for normalized section data
type SectionRow = Database["public"]["Tables"]["section"]["Row"];

export interface NormalizedSection extends SectionRow {
  course: { code: string; title: string; credits: number } | null;
  instructor: {
    id?: string;
    user_id?: string | null;
    name: string;
    email: string | null;
  } | null;
  room: { code: string; type: string } | null;
}

export interface InstructorForTable {
  id: string;
  user_id: string | null;
  name: string;
  email?: string;
}

export interface RoomForTable {
  code: string;
  type: string;
}

export interface TeachingLoadDashboardData {
  instructorsCount: number;
  sectionsCount: number;
  coursesCount: number;
  normalizedSections: NormalizedSection[];
  instructorsList: InstructorForTable[];
  roomsList: RoomForTable[];
}

/**
 * Fetches all data needed for the teaching load dashboard in parallel
 * Cached at the request level to prevent duplicate fetches
 */


export const getTeachingLoadDashboardData = cache(
  async (): Promise<TeachingLoadDashboardData> => {
    const supabase = await createClient();

    const activeTerm = await getActiveTerm();

    if (!activeTerm) {
      return {
        instructorsCount: 0,
        sectionsCount: 0,
        coursesCount: 0,
        normalizedSections: [],
        instructorsList: [],
        roomsList: [],
      };
    }

    // Fetch all counts and lists in parallel
    const [
      instructorsResult,
      sectionsCountResult,
      coursesCountResult,
      instructorsListResult,
      roomsListResult,
    ] = await Promise.all([
      // Get instructors count
      supabase
        .from("faculty_profile")
        .select("id", { count: "exact", head: true })
        .eq("department", "SWE"),
      // Get sections count - Filter by Active Term
      supabase
        .from("section")
        .select("id, schedule!inner(term_id)", { count: "exact", head: true })
        .like("course_code", "SWE%")
        .eq("schedule.term_id", activeTerm.id),
      // Get courses count
      supabase.from("course").select("*", { count: "exact", head: true }),
      // Get instructors list for table
      supabase
        .from("faculty_profile")
        .select("id, user_id, name, email")
        .eq("department", "SWE")
        .order("name", { ascending: true }),
      // Get rooms list for table
      supabase
        .from("room")
        .select("code, type")
        .order("code", { ascending: true }),
    ]);

    // Build sections query with related data - Filter by Active Term
    const { data: sections } = await supabase
      .from("section")
      .select(
        `
      *,
      course:course!section_course_code_fkey(code, title, credits),
      instructor:faculty_profile!section_instructor_id_fkey(id, user_id, name, email),
      room:room!section_room_code_fkey(code, type),
      schedule:schedule!schedule_section_id_fkey!inner(term_id)
    `
      )
      .like("course_code", "SWE%")
      .eq("schedule.term_id", activeTerm.id)
      .order("course_code", { ascending: true });

    // Normalize sections data - Supabase joins can return arrays
    const normalizedSections: NormalizedSection[] = (sections || []).map(
      (section) => ({
        ...section,
        course: extractJoinedRelation(section.course),
        instructor: extractJoinedRelation(section.instructor),
        room: extractJoinedRelation(section.room),
      })
    );

    // Map instructors list for table
    const instructorsList: InstructorForTable[] = (
      instructorsListResult.data || []
    ).map((instructor) => ({
      id: instructor.id,
      user_id: instructor.user_id,
      name: instructor.name || "",
      email: instructor.email || undefined,
    }));

    // Map rooms list for table
    const roomsList: RoomForTable[] = (roomsListResult.data || []).map((r) => ({
      code: r.code,
      type: r.type,
    }));

    return {
      instructorsCount: instructorsResult.count || 0,
      sectionsCount: sectionsCountResult.count || 0,
      coursesCount: coursesCountResult.count || 0,
      normalizedSections,
      instructorsList,
      roomsList,
    };
  }
);
