/**
 * Optimized Scheduling Dashboard Data Fetching
 *
 * This module provides a single optimized function to fetch all scheduling dashboard data
 * in parallel with minimal database round-trips.
 *
 * Performance optimizations:
 * 1. Single Supabase client creation
 * 2. Parallel Promise.all for all queries
 * 3. Minimal data selection (only what's needed for initial render)
 * 4. React.cache() for request-level memoization
 */

import { cache } from "react";
import { createClient } from "@/supabase/server";

export interface SchedulingStats {
  coursesCount: number;
  sectionsCount: number;
  roomsCount: number;
  instructorsCount: number;
  studentsCount: number;
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

export interface SchedulingDashboardData {
  stats: SchedulingStats;
  scheduleStatus: ScheduleStatus;
  activeTermId: string | null;
  deadlines: Array<{
    id: string;
    title: string;
    description: string | null;
    event_type: string;
    start_date: string;
    end_date: string;
    days_until_start?: number | null;
    days_until_end?: number | null;
    priority: string;
    status: string;
    requires_action: boolean;
  }>;
  notifications: Array<{
    id: string;
    user_id: string;
    type: string;
    payload: Record<string, unknown>;
    read_at: string | null;
    created_at: string;
  }>;
}

/**
 * Fetch all scheduling dashboard data in a single optimized call
 * Uses a single Supabase client and parallel queries
 */
import { getActiveTerm } from "@/lib/db/term";

// ... (keep existing imports)

// ...

export const getSchedulingDashboardData = cache(
  async (userId: string): Promise<SchedulingDashboardData> => {
    const supabase = await createClient();

    const activeTerm = await getActiveTerm();

    if (!activeTerm) {
      // Still fetch notifications/deadlines but zero stats
      const [deadlinesResult, notificationsResult] = await Promise.all([
        supabase.rpc("get_upcoming_deadlines_for_role", {
          role_name: "scheduling",
          days_ahead: 30,
        }),
        supabase
          .from("notification")
          .select("id, user_id, type, payload, read_at, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      return {
        stats: {
          coursesCount: 0,
          sectionsCount: 0,
          roomsCount: 0,
          instructorsCount: 0,
          studentsCount: 0,
          draftSectionsCount: 0,
          releasedSectionsCount: 0,
          assignedSectionsCount: 0,
          unassignedSectionsCount: 0,
        },
        scheduleStatus: {
          draft: { total: 0, assigned: 0, unassigned: 0 },
          released: { total: 0 },
        },
        activeTermId: null,
        deadlines: deadlinesResult.data || [],
        notifications: notificationsResult.data || [],
      };
    }

    // Execute all queries in parallel with a single client
    const [
      coursesResult,
      sectionsResult,
      roomsResult,
      instructorsResult,
      studentsResult,
      deadlinesResult,
      notificationsResult,
    ] = await Promise.all([
      // 1. Courses count
      supabase.from("course").select("*", { count: "exact", head: true }),

      // 2. Sections with state and assignment info - Filter by Active Term
      supabase
        .from("section")
        .select("state, room_code, meeting_pattern, schedule!inner(term_id)")
        .eq("schedule.term_id", activeTerm.id),

      // 3. Rooms count
      supabase.from("room").select("*", { count: "exact", head: true }),

      // 4. Instructors count
      supabase
        .from("faculty_profile")
        .select("*", { count: "exact", head: true }),

      // 5. Students count
      supabase
        .from("student_profile")
        .select("*", { count: "exact", head: true }),

      // 6. Upcoming deadlines for scheduling role
      supabase.rpc("get_upcoming_deadlines_for_role", {
        role_name: "scheduling",
        days_ahead: 30,
      }),

      // 7. Recent notifications
      supabase
        .from("notification")
        .select("id, user_id, type, payload, read_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

    // Process counts
    const coursesCount = coursesResult.count || 0;
    const roomsCount = roomsResult.count || 0;
    const instructorsCount = instructorsResult.count || 0;
    const studentsCount = studentsResult.count || 0;

    // Process sections data
    const sectionsData = sectionsResult.data || [];
    const sectionsCount = sectionsData.length;

    const draftSections = sectionsData.filter(
      (s: { state: string }) => s.state === "draft"
    );
    const releasedSections = sectionsData.filter(
      (s: { state: string }) => s.state === "released"
    );

    // Count assigned sections (have room and meeting pattern)
    const assignedSections = draftSections.filter(
      (s: {
        room_code: string | null;
        meeting_pattern: Record<string, unknown> | null;
      }) =>
        s.room_code &&
        s.meeting_pattern &&
        Object.keys(s.meeting_pattern).length > 0
    );

    const stats: SchedulingStats = {
      coursesCount,
      sectionsCount,
      roomsCount,
      instructorsCount,
      studentsCount,
      draftSectionsCount: draftSections.length,
      releasedSectionsCount: releasedSections.length,
      assignedSectionsCount: assignedSections.length,
      unassignedSectionsCount: draftSections.length - assignedSections.length,
    };

    const scheduleStatus: ScheduleStatus = {
      draft: {
        total: draftSections.length,
        assigned: assignedSections.length,
        unassigned: draftSections.length - assignedSections.length,
      },
      released: {
        total: releasedSections.length,
      },
    };

    return {
      stats,
      scheduleStatus,
      activeTermId: activeTerm.id,
      deadlines: deadlinesResult.data || [],
      notifications: notificationsResult.data || [],
    };
  }
);
