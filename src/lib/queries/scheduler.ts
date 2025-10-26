/**
 * Scheduler Data Fetching Functions
 * Cached server-side data fetching with React.cache()
 * Follows best practices from data-fetching.mdc and supabase-queries.mdc
 */

import { cache } from "react";
import { createServerClient } from "@/lib/supabase/server";
import type { CourseWithSections } from "@/types/scheduler";

/**
 * Get courses with sections for a term
 * Optimized with React.cache() and proper Supabase query patterns
 */
export const getCoursesWithSections = cache(
  async (
    termCode: string,
    filters?: {
      isSweManaged?: boolean;
      courseType?: "REQUIRED" | "ELECTIVE";
      level?: number;
    }
  ): Promise<CourseWithSections[]> => {
    const supabase = await createServerClient();

    // Build query with specific columns (not SELECT *)
    let coursesQuery = supabase
      .from("course")
      .select("code, name, level, type, credits, department, is_swe_managed")
      .order("code");

    // Apply filters
    if (filters?.isSweManaged !== undefined) {
      coursesQuery = coursesQuery.eq("is_swe_managed", filters.isSweManaged);
    }

    if (filters?.courseType) {
      coursesQuery = coursesQuery.eq("type", filters.courseType);
    }

    if (filters?.level) {
      coursesQuery = coursesQuery.eq("level", filters.level);
    }

    const { data: courses, error: coursesError } = await coursesQuery;

    if (coursesError) {
      console.error("Error fetching courses:", coursesError);
      throw new Error(`Failed to fetch courses: ${coursesError.message}`);
    }

    if (!courses || courses.length === 0) {
      return [];
    }

    // ✅ OPTIMIZED: Single query with join instead of N+1 queries
    // Get all sections for all courses at once with proper joins
    const { data: sections, error: sectionsError } = await supabase
      .from("section")
      .select(
        `
        id,
        course_code,
        capacity,
        room_number,
        section_type,
        status,
        instructor_id,
        instructor:users!section_instructor_id_fkey(
          id,
          full_name
        ),
        time_slots:section_time(
          id,
          day,
          start_time,
          end_time
        )
      `
      )
      .in(
        "course_code",
        courses.map((c) => c.code)
      )
      .eq("term_code", termCode)
      .order("id");

    if (sectionsError) {
      console.error("Error fetching sections:", sectionsError);
      // Don't throw, just return courses without sections
    }

    // ✅ OPTIMIZED: Get all enrollment counts in a single query
    const sectionIds = sections?.map((s) => s.id) || [];
    let enrollmentData: Array<{ section_id: string }> = [];

    if (sectionIds.length > 0) {
      const { data: enrollments } = await supabase
        .from("section_enrollment")
        .select("section_id")
        .in("section_id", sectionIds)
        .eq("enrollment_status", "ENROLLED");

      enrollmentData = enrollments || [];
    }

    // Build enrollment map for O(1) lookups
    const enrollmentMap = new Map<string, number>();
    enrollmentData.forEach((enrollment) => {
      const count = enrollmentMap.get(enrollment.section_id) || 0;
      enrollmentMap.set(enrollment.section_id, count + 1);
    });

    // Build section map by course code
    const sectionsByCourse = new Map<string, typeof sections>();
    sections?.forEach((section) => {
      const courseSections = sectionsByCourse.get(section.course_code) || [];
      courseSections.push({
        ...section,
        enrolled_count: enrollmentMap.get(section.id) || 0,
        instructor_name: section.instructor?.full_name || null,
      });
      sectionsByCourse.set(section.course_code, courseSections);
    });

    // Combine courses with their sections
    const coursesWithSections: CourseWithSections[] = courses.map((course) => {
      const courseSections = sectionsByCourse.get(course.code) || [];
      const totalEnrolled = courseSections.reduce(
        (sum, section) => sum + (section.enrolled_count || 0),
        0
      );

      return {
        course,
        sections: courseSections,
        total_enrolled: totalEnrolled,
      };
    });

    return coursesWithSections;
  }
);

/**
 * Get active academic term
 * Cached for request-level deduplication
 */
export const getActiveTerm = cache(async () => {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("academic_term")
    .select("code, name, start_date, end_date, is_active")
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    console.error("Error fetching active term:", error);
    return null;
  }

  return data;
});

/**
 * Get section details with conflicts
 * Used by SectionManager component
 */
export const getSectionDetails = cache(
  async (sectionId: string, termCode: string) => {
    const supabase = await createServerClient();

    // Parallel fetching with Promise.all
    const [sectionResult, conflictsResult] = await Promise.all([
      supabase
        .from("section")
        .select(
          `
        id,
        course_code,
        capacity,
        room_number,
        section_type,
        status,
        instructor_id,
        term_code,
        instructor:users!section_instructor_id_fkey(
          id,
          full_name,
          email
        ),
        time_slots:section_time(
          id,
          day,
          start_time,
          end_time
        ),
        course:course(
          code,
          name,
          credits
        )
      `
        )
        .eq("id", sectionId)
        .eq("term_code", termCode)
        .single(),
      supabase.rpc("detect_section_time_conflicts", {
        p_section_id: sectionId,
      }),
    ]);

    if (sectionResult.error) {
      throw new Error(
        `Failed to fetch section: ${sectionResult.error.message}`
      );
    }

    return {
      section: sectionResult.data,
      conflicts: conflictsResult.data || [],
    };
  }
);

/**
 * Get available instructors for scheduling
 * Cached and optimized
 */
export const getAvailableInstructors = cache(async () => {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email")
    .eq("role", "faculty")
    .order("full_name");

  if (error) {
    console.error("Error fetching instructors:", error);
    return [];
  }

  return data || [];
});

/**
 * Get enrollment statistics for a term
 * Useful for dashboard analytics
 */
export const getTermEnrollmentStats = cache(async (termCode: string) => {
  const supabase = await createServerClient();

  // Use database aggregation instead of client-side
  const { data, error } = await supabase.rpc("get_term_enrollment_stats", {
    p_term_code: termCode,
  });

  if (error) {
    console.error("Error fetching enrollment stats:", error);
    return null;
  }

  return data;
});

