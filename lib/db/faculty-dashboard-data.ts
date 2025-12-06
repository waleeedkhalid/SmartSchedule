/**
 * Optimized Faculty Dashboard Data Fetching
 *
 * This module provides a single optimized function to fetch all faculty dashboard data
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
import { getActiveTerm } from "@/lib/db/term";
import type {
  FacultyProfile,
  FacultySection,
  DayAvailability,
} from "./faculty/types";

export interface FacultyDashboardData {
  profile: FacultyProfile | null;
  sections: FacultySection[];
  uniqueCoursesCount: number;
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
 * Fetch all faculty dashboard data in a single optimized call
 * Uses a single Supabase client and parallel queries
 */
export const getFacultyDashboardData = cache(
  async (userId: string): Promise<FacultyDashboardData> => {
    const supabase = await createClient();

    // First, get the faculty profile to get the profile ID
    const { data: profileData } = await supabase
      .from("faculty_profile")
      .select("*")
      .eq("user_id", userId)
      .single();

    // If no profile, return early with minimal data
    if (!profileData) {
      // Still fetch notifications for the user
      const { data: notifications } = await supabase
        .from("notification")
        .select("id, user_id, type, payload, read_at, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);

      return {
        profile: null,
        sections: [],
        uniqueCoursesCount: 0,
        deadlines: [],
        notifications: notifications || [],
      };
    }

    // Build the profile object
    const profile: FacultyProfile = {
      id: profileData.id,
      name: profileData.name || "",
      email: profileData.email,
      user_id: profileData.user_id,
      max_load_per_week: profileData.max_load_per_week,
      preferred_times: profileData.preferred_times as DayAvailability[] | null,
      unavailable_times: profileData.unavailable_times as
        | DayAvailability[]
        | null,
      department: profileData.department,
    };

    const activeTerm = await getActiveTerm();

    if (!activeTerm) {
      // Still fetch notifications/deadlines but no sections
      const [deadlinesResult, notificationsResult] = await Promise.all([
        supabase.rpc("get_upcoming_deadlines_for_role", {
          role_name: "faculty",
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
        profile,
        sections: [],
        uniqueCoursesCount: 0,
        deadlines: deadlinesResult.data || [],
        notifications: notificationsResult.data || [],
      };
    }

    // Execute remaining queries in parallel
    const [sectionsResult, deadlinesResult, notificationsResult] =
      await Promise.all([
        // Get sections assigned to this faculty member - Filter by Active Term
        supabase
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
            course:course!section_course_code_fkey(title, credits),
            schedule:schedule!schedule_section_id_fkey!inner(term_id)
          `
          )
          .eq("instructor_id", profileData.id)
          .eq("schedule.term_id", activeTerm.id)
          .order("course_code", { ascending: true })
          .order("section_no", { ascending: true }),

        // Get upcoming deadlines for faculty role
        supabase.rpc("get_upcoming_deadlines_for_role", {
          role_name: "faculty",
          days_ahead: 30,
        }),

        // Get recent notifications
        supabase
          .from("notification")
          .select("id, user_id, type, payload, read_at, created_at")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

    const sectionsData = sectionsResult.data || [];

    // Get enrollment counts for sections if there are any
    const enrollmentCounts: Record<string, number> = {};
    if (sectionsData.length > 0) {
      const sectionIds = sectionsData.map((s: { id: string }) => s.id);
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

    // Map sections to the expected format
    const sections: FacultySection[] = sectionsData.map(
      (section: {
        id: string;
        course_code: string;
        section_no: string;
        room_code: string | null;
        capacity: number;
        meeting_pattern: {
          days: string[];
          start: string;
          duration: number;
          is_lab?: boolean;
        } | null;
        group_level: number | null;
        state: string;
        activity: string | null;
        course:
        | { title: string; credits: number }
        | { title: string; credits: number }[];
      }) => {
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
          meeting_pattern: section.meeting_pattern,
          group_level: section.group_level,
          state: section.state as "draft" | "released",
          activity: section.activity,
          credits: courseData?.credits,
        };
      }
    );

    // Calculate unique courses count
    const uniqueCoursesCount = new Set(sections.map((s) => s.course_code)).size;

    return {
      profile,
      sections,
      uniqueCoursesCount,
      deadlines: deadlinesResult.data || [],
      notifications: notificationsResult.data || [],
    };
  }
);
