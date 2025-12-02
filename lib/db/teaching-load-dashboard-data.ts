/**
 * Optimized data fetching for the Teaching Load Dashboard
 * Uses React.cache() for request-level memoization and Promise.all for parallel queries
 */

import { cache } from "react";
import { createClient } from "@/supabase/server";
import { extractJoinedRelation } from "@/lib/utils";
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
  capacity: number | null;
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

    // Fetch all counts and lists in parallel
    const [
      instructorsResult,
      sectionsCountResult,
      coursesCountResult,
      currentTermResult,
      instructorsListResult,
      roomsListResult,
    ] = await Promise.all([
      // Get instructors count
      supabase
        .from("faculty_profile")
        .select("id", { count: "exact", head: true }),
      // Get sections count
      supabase.from("section").select("*", { count: "exact", head: true }),
      // Get courses count
      supabase.from("course").select("*", { count: "exact", head: true }),
      // Get current active term
      supabase
        .from("academic_term")
        .select("id")
        .in("status", ["draft", "released"])
        .order("created_at", { ascending: false })
        .limit(1)
        .single(),
      // Get instructors list for table
      supabase
        .from("faculty_profile")
        .select("id, user_id, name, email")
        .order("name", { ascending: true }),
      // Get rooms list for table
      supabase
        .from("room")
        .select("code, type, capacity")
        .order("code", { ascending: true }),
    ]);

    // Get section IDs for current term
    let sectionIds: string[] | null = null;
    if (currentTermResult.data) {
      const { data: scheduleSections } = await supabase
        .from("schedule")
        .select("section_id")
        .eq("term_id", currentTermResult.data.id);

      sectionIds = (scheduleSections || []).map(
        (s: { section_id: string }) => s.section_id
      );
    }

    // Build sections query with related data
    let sectionsQuery = supabase.from("section").select(`
      *,
      course:course!section_course_code_fkey(code, title, credits),
      instructor:faculty_profile!section_instructor_id_fkey(id, user_id, name, email),
      room:room!section_room_code_fkey(code, type)
    `);

    if (currentTermResult.data && sectionIds && sectionIds.length > 0) {
      sectionsQuery = sectionsQuery.in("id", sectionIds);
    }

    const { data: sections } = await sectionsQuery.order("course_code", {
      ascending: true,
    });

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
      capacity: r.capacity,
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
