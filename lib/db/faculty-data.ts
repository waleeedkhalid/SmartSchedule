/**
 * Faculty Dashboard Data
 *
 * Provides real-time data for faculty dashboard including faculty profile and sections
 *
 * Note: After consolidation, all instructor data is stored directly in faculty_profile table
 */

import { createClient } from "@/supabase/server";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface TimeSlot {
  start: string;
  end: string;
  type: "preferred" | "unavailable";
}

export interface DayAvailability {
  day: string;
  slots: TimeSlot[];
}

export interface FacultyProfile {
  id: string;
  name: string;
  email: string | null;
  user_id: string | null;
  max_load_per_week: number | null;
  preferred_times: DayAvailability[] | null;
  unavailable_times: DayAvailability[] | null;
  department: string;
}

export interface FacultySection {
  id: string;
  course_code: string;
  course_title: string;
  section_no: string;
  room_code: string | null;
  capacity: number;
  current_enrollment?: number;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
    is_lab?: boolean;
  };
  group_level: number;
  state: "draft" | "released";
  activity: string | null;
  credits?: number;
}

export interface FacultyComment {
  id: string;
  section_id: string | null;
  schedule_id: string | null;
  comment_text: string;
  rating: number | null;
  is_resolved: boolean;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  section?: {
    course_code: string;
    section_no: string;
  } | null;
}

export interface FacultyStats {
  totalSections: number;
  totalCourses: number;
  totalStudents: number;
  weeklyHours: number;
  draftSections: number;
  releasedSections: number;
  averageClassSize: number;
}

// ============================================================================
// FACULTY PROFILE FUNCTIONS
// ============================================================================

/**
 * Get faculty profile by user ID
 * Now queries faculty_profile directly (no need to join with instructor table)
 */
export async function getFacultyProfile(
  userId: string
): Promise<FacultyProfile | null> {
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("faculty_profile")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error || !profile) {
    if (error?.code !== "PGRST116") {
      // PGRST116 is "not found" which is expected for new users
    }
    return null;
  }

  return {
    id: profile.id,
    name: profile.name || "",
    email: profile.email,
    user_id: profile.user_id,
    max_load_per_week: profile.max_load_per_week,
    preferred_times: profile.preferred_times as DayAvailability[] | null,
    unavailable_times: profile.unavailable_times as DayAvailability[] | null,
    department: profile.department,
  };
}

/**
 * Update faculty availability preferences
 */
export async function updateFacultyAvailability(
  userId: string,
  preferredTimes: DayAvailability[],
  unavailableTimes: DayAvailability[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("faculty_profile")
    .update({
      preferred_times: preferredTimes,
      unavailable_times: unavailableTimes,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Update faculty max load per week
 */
export async function updateFacultyMaxLoad(
  userId: string,
  maxLoadPerWeek: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("faculty_profile")
    .update({
      max_load_per_week: maxLoadPerWeek,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================================
// FACULTY SECTIONS FUNCTIONS
// ============================================================================

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

/**
 * Get faculty statistics for dashboard
 */
export async function getFacultyStats(userId: string): Promise<FacultyStats> {
  const supabase = await createClient();

  // Get sections assigned to faculty
  const { data: sections } = await supabase
    .from("section")
    .select(
      `
      id,
      course_code,
      capacity,
      state,
      meeting_pattern,
      course:course!section_course_code_fkey(credits, weekly_hours)
    `
    )
    .eq("instructor_id", userId);

  const sectionsList = sections || [];

  // Get unique courses
  const uniqueCourses = new Set(
    sectionsList.map((s: { course_code: string }) => s.course_code)
  );

  // Get enrollment counts
  const sectionIds = sectionsList.map((s: { id: string }) => s.id);
  let totalStudents = 0;

  if (sectionIds.length > 0) {
    const { count } = await supabase
      .from("student_enrollment")
      .select("*", { count: "exact", head: true })
      .in("section_id", sectionIds)
      .eq("status", "registered");

    totalStudents = count || 0;
  }

  // Calculate weekly hours
  let weeklyHours = 0;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sectionsList.forEach((section: any) => {
    const pattern = section.meeting_pattern;
    const courseData = Array.isArray(section.course)
      ? section.course[0]
      : section.course;

    if (pattern && pattern.duration && pattern.days) {
      weeklyHours += (pattern.duration / 60) * pattern.days.length;
    } else if (courseData?.weekly_hours) {
      weeklyHours += courseData.weekly_hours;
    }
  });

  // Calculate average class size
  const totalCapacity = sectionsList.reduce(
    (sum: number, s: { capacity: number }) => sum + s.capacity,
    0
  );
  const averageClassSize =
    sectionsList.length > 0
      ? Math.round(totalCapacity / sectionsList.length)
      : 0;

  return {
    totalSections: sectionsList.length,
    totalCourses: uniqueCourses.size,
    totalStudents,
    weeklyHours: Math.round(weeklyHours * 10) / 10,
    draftSections: sectionsList.filter(
      (s: { state: string }) => s.state === "draft"
    ).length,
    releasedSections: sectionsList.filter(
      (s: { state: string }) => s.state === "released"
    ).length,
    averageClassSize,
  };
}

/**
 * Get weekly schedule data for charts
 */
export async function getFacultyWeeklySchedule(userId: string): Promise<
  {
    day: string;
    hours: number;
    sections: number;
  }[]
> {
  const sections = await getFacultySections(userId);

  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
  const weeklyData = days.map((day) => ({
    day,
    hours: 0,
    sections: 0,
  }));

  sections.forEach((section) => {
    const pattern = section.meeting_pattern;
    if (pattern && pattern.days && pattern.duration) {
      pattern.days.forEach((day) => {
        const dayData = weeklyData.find((d) => d.day === day);
        if (dayData) {
          dayData.hours += pattern.duration / 60;
          dayData.sections += 1;
        }
      });
    }
  });

  return weeklyData;
}

/**
 * Get teaching load by course for charts
 */
export async function getFacultyTeachingLoad(userId: string): Promise<
  {
    course_code: string;
    course_title: string;
    sections: number;
    total_capacity: number;
    enrolled: number;
  }[]
> {
  const sections = await getFacultySections(userId);

  const courseMap = new Map<
    string,
    {
      course_code: string;
      course_title: string;
      sections: number;
      total_capacity: number;
      enrolled: number;
    }
  >();

  sections.forEach((section) => {
    const existing = courseMap.get(section.course_code);
    if (existing) {
      existing.sections += 1;
      existing.total_capacity += section.capacity;
      existing.enrolled += section.current_enrollment || 0;
    } else {
      courseMap.set(section.course_code, {
        course_code: section.course_code,
        course_title: section.course_title,
        sections: 1,
        total_capacity: section.capacity,
        enrolled: section.current_enrollment || 0,
      });
    }
  });

  return Array.from(courseMap.values());
}

// ============================================================================
// FACULTY COMMENTS/FEEDBACK FUNCTIONS
// ============================================================================

/**
 * Get comments submitted by a faculty member
 */
export async function getFacultyComments(
  userId: string
): Promise<FacultyComment[]> {
  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from("schedule_comment")
    .select(
      `
      id,
      section_id,
      schedule_id,
      comment_text,
      rating,
      is_resolved,
      resolved_at,
      resolved_by,
      created_at,
      section:section!schedule_comment_section_id_fkey(course_code, section_no)
    `
    )
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    return [];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (comments || []).map((comment: any) => {
    const sectionData = Array.isArray(comment.section)
      ? comment.section[0]
      : comment.section;

    return {
      id: comment.id,
      section_id: comment.section_id,
      schedule_id: comment.schedule_id,
      comment_text: comment.comment_text,
      rating: comment.rating,
      is_resolved: comment.is_resolved || false,
      resolved_at: comment.resolved_at,
      resolved_by: comment.resolved_by,
      created_at: comment.created_at || new Date().toISOString(),
      section: sectionData,
    };
  });
}

/**
 * Submit a new comment/feedback on a section or schedule
 */
export async function submitFacultyComment(
  userId: string,
  sectionId: string | null,
  scheduleId: string | null,
  commentText: string,
  rating?: number
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("schedule_comment")
    .insert({
      author_id: userId,
      section_id: sectionId,
      schedule_id: scheduleId,
      comment_text: commentText,
      rating: rating || null,
      is_resolved: false,
    })
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, id: data.id };
}

/**
 * Update an existing comment
 */
export async function updateFacultyComment(
  commentId: string,
  userId: string,
  commentText: string,
  rating?: number
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("schedule_comment")
    .update({
      comment_text: commentText,
      rating: rating || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", commentId)
    .eq("author_id", userId); // Ensure user owns the comment

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Delete a comment
 */
export async function deleteFacultyComment(
  commentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  const { error } = await supabase
    .from("schedule_comment")
    .delete()
    .eq("id", commentId)
    .eq("author_id", userId); // Ensure user owns the comment

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================================================
// FACULTY PROFILE CREATION/UPDATE
// ============================================================================

/**
 * Create or update faculty profile with instructor information
 *
 * This function:
 * 1. Creates or updates faculty_profile with name, email, and other instructor data
 * 2. No longer needs to link to a separate instructor table
 *
 * @param userId - The user ID from auth.users
 * @param userName - The user's name from user_roles
 * @param userEmail - The user's email from auth.users
 * @returns The user_id if successful, null otherwise
 * @throws Error with descriptive message if creation/update fails due to RLS or other constraints
 */
export async function linkFacultyProfileToInstructor(
  userId: string,
  userName: string,
  userEmail: string
): Promise<string | null> {
  const supabase = await createClient();

  try {
    // Check if faculty_profile already exists
    const { data: existingProfile, error: findError } = await supabase
      .from("faculty_profile")
      .select("user_id, name, email, max_load_per_week")
      .eq("user_id", userId)
      .maybeSingle();

    if (findError && findError.code !== "PGRST116") {
      // PGRST116 is "not found" which is expected for new profiles
      const errorMessage = findError.message || "Unknown error";
      const errorCode = findError.code || "UNKNOWN";

      // Check for RLS violations
      if (findError.code?.startsWith("PGRST")) {
        throw new Error(
          `Permission denied: Unable to search for faculty profile. ` +
            `This may be due to Row Level Security policies. Error: ${errorMessage} (${errorCode})`
        );
      }

      throw new Error(
        `Failed to search for faculty profile: ${errorMessage} (${errorCode})`
      );
    }

    if (existingProfile) {
      // Profile exists - update it with instructor information
      const { error: updateError } = await supabase
        .from("faculty_profile")
        .update({
          name: userName,
          email: userEmail,
          max_load_per_week: existingProfile.max_load_per_week || 12, // Keep existing or default
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId);

      if (updateError) {
        const errorMessage = updateError.message || "Unknown error";
        const errorCode = updateError.code || "UNKNOWN";

        // Check for RLS violations
        if (updateError.code?.startsWith("PGRST")) {
          throw new Error(
            `Permission denied: Unable to update faculty profile. ` +
              `This may be due to Row Level Security policies. ` +
              `Please ensure you have the faculty role. Error: ${errorMessage} (${errorCode})`
          );
        }

        throw new Error(
          `Failed to update faculty profile: ${errorMessage} (${errorCode})`
        );
      }

      return userId;
    } else {
      // Profile doesn't exist - this shouldn't happen during onboarding
      // (profile should be created first), but handle it gracefully
      const { error: createError } = await supabase
        .from("faculty_profile")
        .insert({
          user_id: userId,
          department: "Software Engineering",
          name: userName,
          email: userEmail,
          max_load_per_week: 12,
          preferred_times: [], // Empty array for JSONB
          unavailable_times: [], // Empty array for JSONB
        })
        .select("user_id")
        .single();

      if (createError) {
        const errorMessage = createError.message || "Unknown error";
        const errorCode = createError.code || "UNKNOWN";

        // Check for RLS violations or constraint violations
        if (createError.code?.startsWith("PGRST")) {
          throw new Error(
            `Permission denied: Unable to create faculty profile. ` +
              `This may be due to Row Level Security policies. ` +
              `Please ensure you have the faculty role. Error: ${errorMessage} (${errorCode})`
          );
        }

        // Check for unique constraint violations
        if (createError.code === "23505") {
          throw new Error(
            `Faculty profile with user_id ${userId} or email ${userEmail} already exists. ` +
              `Please contact support if you believe this is an error.`
          );
        }

        throw new Error(
          `Failed to create faculty profile: ${errorMessage} (${errorCode})`
        );
      }

      return userId;
    }
  } catch (error) {
    // Re-throw if it's already an Error with a message
    if (error instanceof Error) {
      throw error;
    }

    // Otherwise wrap in Error
    console.error("Unexpected error updating faculty profile:", error);
    throw new Error(
      `Unexpected error updating faculty profile: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}
