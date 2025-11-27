/**
 * Scheduling Dashboard Statistics
 * 
 * Provides real-time statistics for the scheduling committee dashboard
 */

import { createClient } from "@/supabase/server";

export interface SchedulingStats {
  coursesCount: number;
  sectionsCount: number;
  roomsCount: number;
  instructorsCount: number;
  draftSectionsCount: number;
  releasedSectionsCount: number;
  assignedSectionsCount: number;
  unassignedSectionsCount: number;
}

export interface ScheduleStatus {
  draft: {
    total: number;
    assigned: number;
    unassigned: number;
  };
  released: {
    total: number;
  };
}

/**
 * Get real-time scheduling statistics from database
 */
export async function getSchedulingStats(): Promise<SchedulingStats> {
  const supabase = await createClient();

  // Fetch all counts in parallel
  const [
    coursesResult,
    sectionsResult,
    roomsResult,
    instructorsResult,
  ] = await Promise.all([
    supabase.from("course").select("*", { count: "exact", head: true }),
    supabase.from("section").select("*", { count: "exact", head: true }),
    supabase.from("room").select("*", { count: "exact", head: true }),
    supabase.from("instructor").select("*", { count: "exact", head: true }),
  ]);

  const coursesCount = coursesResult.count || 0;
  const sectionsCount = sectionsResult.count || 0;
  const roomsCount = roomsResult.count || 0;
  const instructorsCount = instructorsResult.count || 0;

  // Get section state breakdown
  const { data: sections, error: sectionsError } = await supabase
    .from("section")
    .select("state, room_code, meeting_pattern");

  if (sectionsError) {
    console.error("Error fetching section details:", sectionsError);
  }

  const sectionsData = sections || [];
  const draftSections = sectionsData.filter((s) => s.state === "draft");
  const releasedSections = sectionsData.filter((s) => s.state === "released");
  
  // Count assigned sections (have room and meeting pattern)
  const assignedSections = draftSections.filter(
    (s) => s.room_code && s.meeting_pattern && Object.keys(s.meeting_pattern).length > 0
  );

  return {
    coursesCount,
    sectionsCount,
    roomsCount,
    instructorsCount,
    draftSectionsCount: draftSections.length,
    releasedSectionsCount: releasedSections.length,
    assignedSectionsCount: assignedSections.length,
    unassignedSectionsCount: draftSections.length - assignedSections.length,
  };
}

/**
 * Get schedule status for schedule generator
 */
export async function getScheduleStatus(): Promise<ScheduleStatus> {
  const supabase = await createClient();

  const { data: sections, error } = await supabase
    .from("section")
    .select("state, room_code, meeting_pattern");

  if (error) {
    console.error("Error fetching schedule status:", error);
    return {
      draft: { total: 0, assigned: 0, unassigned: 0 },
      released: { total: 0 },
    };
  }

  const sectionsData = sections || [];
  const draftSections = sectionsData.filter((s) => s.state === "draft");
  const releasedSections = sectionsData.filter((s) => s.state === "released");
  
  const assignedSections = draftSections.filter(
    (s) => s.room_code && s.meeting_pattern && Object.keys(s.meeting_pattern).length > 0
  );

  return {
    draft: {
      total: draftSections.length,
      assigned: assignedSections.length,
      unassigned: draftSections.length - assignedSections.length,
    },
    released: {
      total: releasedSections.length,
    },
  };
}

