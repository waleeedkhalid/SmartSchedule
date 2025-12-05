/**
 * Cached Data Queries
 *
 * Provides cached data fetching functions using Next.js unstable_cache.
 * These functions are suitable for data that doesn't depend on cookies/headers
 * and can be shared across requests.
 *
 * For user-specific data that requires authentication, use the functions in
 * lib/data/*.ts which use React.cache() for request memoization.
 *
 * @see https://nextjs.org/docs/app/guides/caching#data-cache
 */

import { unstable_cache } from "next/cache";
import { createClient } from "@/supabase/server";
import { CACHE_TAGS, CACHE_DURATIONS, createDynamicTag } from "./tags";

/**
 * Get all courses (cached for 1 hour)
 * Safe to use across requests as course data is not user-specific
 *
 * Note: This creates a new Supabase client per call, which is fine
 * because unstable_cache handles the caching layer.
 */
export const getCachedCourses = unstable_cache(
  async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("course")
      .select(
        "code, title, credits, weekly_hours, is_elective, recommended_level"
      )
      .order("code", { ascending: true });

    if (error) {
      console.error("Error fetching cached courses:", error);
      throw new Error(`Failed to fetch courses: ${error.message}`);
    }

    return data || [];
  },
  ["courses-all"], // Cache key
  {
    tags: [CACHE_TAGS.COURSES, CACHE_TAGS.COURSE_LIST],
    revalidate: CACHE_DURATIONS.VERY_LONG, // 1 hour
  }
);

/**
 * Get a single course by code (cached for 1 hour)
 */
export const getCachedCourseByCode = (courseCode: string) =>
  unstable_cache(
    async () => {
      const supabase = await createClient();

      const { data, error } = await supabase
        .from("course")
        .select("*")
        .eq("code", courseCode)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null; // Not found
        throw new Error(`Failed to fetch course: ${error.message}`);
      }

      return data;
    },
    [`course-${courseCode}`],
    {
      tags: [
        CACHE_TAGS.COURSE_DETAIL,
        createDynamicTag(CACHE_TAGS.COURSE_DETAIL, courseCode),
      ],
      revalidate: CACHE_DURATIONS.VERY_LONG,
    }
  )();

/**
 * Get all rooms (cached for 1 hour)
 * Room data is relatively static
 */
export const getCachedRooms = unstable_cache(
  async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("room")
      .select("code, type, capacity")
      .order("code", { ascending: true });

    if (error) {
      console.error("Error fetching cached rooms:", error);
      throw new Error(`Failed to fetch rooms: ${error.message}`);
    }

    return data || [];
  },
  ["rooms-all"],
  {
    tags: [CACHE_TAGS.ROOMS, CACHE_TAGS.ROOM_LIST],
    revalidate: CACHE_DURATIONS.VERY_LONG,
  }
);

/**
 * Get all instructors (cached for 30 minutes)
 */
export const getCachedInstructors = unstable_cache(
  async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("faculty_profile")
      .select("id, user_id, name, email, max_load_per_week")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching cached instructors:", error);
      throw new Error(`Failed to fetch instructors: ${error.message}`);
    }

    return (data || []).map((faculty) => ({
      id: faculty.id || faculty.user_id,
      name: faculty.name || "",
      email: faculty.email || "",
      max_load_per_week: faculty.max_load_per_week,
    }));
  },
  ["instructors-all"],
  {
    tags: [CACHE_TAGS.INSTRUCTORS, CACHE_TAGS.INSTRUCTOR_LIST],
    revalidate: CACHE_DURATIONS.LONG, // 15 minutes (instructors change less frequently)
  }
);

/**
 * Get current academic term (cached for 1 hour)
 * Current term rarely changes
 */
export const getCachedCurrentTerm = unstable_cache(
  async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("academic_term")
      .select("id, code, name, status, start_date, end_date")
      .in("status", ["draft", "released"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No current term
      console.error("Error fetching current term:", error);
      return null;
    }

    return data;
  },
  ["current-term"],
  {
    tags: [CACHE_TAGS.CURRENT_TERM, CACHE_TAGS.ACADEMIC_TERMS],
    revalidate: CACHE_DURATIONS.VERY_LONG,
  }
);

/**
 * Get all academic terms (cached for 1 hour)
 */
export const getCachedAcademicTerms = unstable_cache(
  async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("academic_term")
      .select("id, code, name, status, start_date, end_date, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching academic terms:", error);
      throw new Error(`Failed to fetch academic terms: ${error.message}`);
    }

    return data || [];
  },
  ["academic-terms-all"],
  {
    tags: [CACHE_TAGS.ACADEMIC_TERMS, CACHE_TAGS.TERM_LIST],
    revalidate: CACHE_DURATIONS.VERY_LONG,
  }
);

/**
 * Get sections by term (cached for 5 minutes)
 * Sections change more frequently during scheduling
 */
export const getCachedSectionsByTerm = (termId: string) =>
  unstable_cache(
    async () => {
      const supabase = await createClient();

      // First get section IDs from schedule
      const { data: scheduleSections } = await supabase
        .from("schedule")
        .select("section_id")
        .eq("term_id", termId);

      const sectionIds = (scheduleSections || []).map((s) => s.section_id);

      if (sectionIds.length === 0) {
        return [];
      }

      // Then get section details
      const { data, error } = await supabase
        .from("section")
        .select(
          `
          id,
          course_code,
          section_no,
          activity,
          instructor_id,
          room_code,
          capacity,
          meeting_pattern,
          group_level,
          state,
          course:course_code (code, title, credits, is_elective),
          instructor:faculty_profile!section_instructor_id_fkey (id, user_id, name),
          room:room_code (code, type)
        `
        )
        .in("id", sectionIds)
        .order("course_code", { ascending: true });

      if (error) {
        console.error("Error fetching sections by term:", error);
        throw new Error(`Failed to fetch sections: ${error.message}`);
      }

      return data || [];
    },
    [`sections-term-${termId}`],
    {
      tags: [
        CACHE_TAGS.SECTIONS,
        CACHE_TAGS.SECTION_LIST,
        createDynamicTag(CACHE_TAGS.SECTION_BY_TERM, termId),
      ],
      revalidate: CACHE_DURATIONS.MEDIUM, // 5 minutes
    }
  )();

/**
 * Get exam count by course (cached for 15 minutes)
 * Useful for dashboard statistics
 */
export const getCachedExamStats = unstable_cache(
  async () => {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("exam")
      .select("course_code, exam_type");

    if (error) {
      console.error("Error fetching exam stats:", error);
      return { total: 0, byType: {} };
    }

    const exams = data || [];
    const byType: Record<string, number> = {};

    exams.forEach((exam) => {
      byType[exam.exam_type] = (byType[exam.exam_type] || 0) + 1;
    });

    return {
      total: exams.length,
      byType,
    };
  },
  ["exam-stats"],
  {
    tags: [CACHE_TAGS.EXAMS, CACHE_TAGS.DASHBOARD_STATS],
    revalidate: CACHE_DURATIONS.LONG,
  }
);

/**
 * Get elective preference statistics (cached for 10 minutes)
 */
export const getCachedElectiveStats = unstable_cache(
  async () => {
    const supabase = await createClient();

    const { data, error } = await supabase.from("elective_preference").select(`
        course_code,
        rank,
        course:course!elective_preference_course_code_fkey(code, title, recommended_level)
      `);

    if (error) {
      console.error("Error fetching elective stats:", error);
      return { stats: [], summary: { totalRequests: 0, totalCourses: 0 } };
    }

    // Group by course
    const statsMap = new Map<
      string,
      {
        course_code: string;
        course_title: string;
        total_requests: number;
        first_choice: number;
        second_choice: number;
        third_choice: number;
      }
    >();

    data?.forEach((pref) => {
      const courseData = pref.course as unknown as {
        code: string;
        title: string;
      } | null;
      if (!courseData) return;

      if (!statsMap.has(pref.course_code)) {
        statsMap.set(pref.course_code, {
          course_code: pref.course_code,
          course_title: courseData.title,
          total_requests: 0,
          first_choice: 0,
          second_choice: 0,
          third_choice: 0,
        });
      }

      const stat = statsMap.get(pref.course_code)!;
      stat.total_requests++;

      if (pref.rank === 1) stat.first_choice++;
      else if (pref.rank === 2) stat.second_choice++;
      else if (pref.rank === 3) stat.third_choice++;
    });

    const stats = Array.from(statsMap.values()).sort((a, b) =>
      a.course_code.localeCompare(b.course_code)
    );

    return {
      stats,
      summary: {
        totalRequests: stats.reduce((sum, s) => sum + s.total_requests, 0),
        totalCourses: stats.length,
      },
    };
  },
  ["elective-stats"],
  {
    tags: [CACHE_TAGS.ELECTIVE_STATS, CACHE_TAGS.ELECTIVE_PREFERENCES],
    revalidate: CACHE_DURATIONS.MEDIUM, // 5 minutes
  }
);

/**
 * Get dashboard statistics (cached for 5 minutes)
 * Aggregated stats for the main dashboard
 */
export const getCachedDashboardStats = unstable_cache(
  async () => {
    const supabase = await createClient();

    // Fetch counts in parallel
    const [
      { count: courseCount },
      { count: sectionCount },
      { count: roomCount },
      { count: instructorCount },
      { count: examCount },
    ] = await Promise.all([
      supabase.from("course").select("*", { count: "exact", head: true }),
      supabase.from("section").select("*", { count: "exact", head: true }),
      supabase.from("room").select("*", { count: "exact", head: true }),
      supabase
        .from("faculty_profile")
        .select("*", { count: "exact", head: true }),
      supabase.from("exam").select("*", { count: "exact", head: true }),
    ]);

    return {
      courses: courseCount || 0,
      sections: sectionCount || 0,
      rooms: roomCount || 0,
      instructors: instructorCount || 0,
      exams: examCount || 0,
    };
  },
  ["dashboard-stats"],
  {
    tags: [CACHE_TAGS.DASHBOARD_STATS],
    revalidate: CACHE_DURATIONS.MEDIUM,
  }
);
