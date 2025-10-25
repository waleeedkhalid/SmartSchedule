/**
 * Scheduler Courses API
 * CRUD operations for courses and sections
 */

import { NextRequest } from "next/server";
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api";

/**
 * GET /api/committee/scheduler/courses
 * Get all courses with sections for a term
 * Query params:
 * - term_code: string (required)
 * - course_type: 'REQUIRED' | 'ELECTIVE' (optional)
 * - level: number (optional)
 * - include_sections: boolean (default: true)
 */
export async function GET(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // Verify user is scheduling committee
  const { data: committee } = await supabase
    .from("committee_members")
    .select("committee_type")
    .eq("id", user.id)
    .maybeSingle();

  if (!committee || committee.committee_type !== "scheduling_committee") {
    return errorResponse("Unauthorized: Must be scheduling committee member", 403);
  }

  const searchParams = request.nextUrl.searchParams;
  const termCode = searchParams.get("term_code");
  const courseType = searchParams.get("course_type");
  const level = searchParams.get("level");
  const includeSections = searchParams.get("include_sections") !== "false";

  if (!termCode) {
    return validationErrorResponse({ message: "term_code is required" });
  }

  try {
    // Build courses query
    let coursesQuery = supabase
      .from("course")
      .select("*")
      .eq("is_swe_managed", true)
      .order("code");

    if (courseType) {
      coursesQuery = coursesQuery.eq("type", courseType);
    }

    if (level) {
      coursesQuery = coursesQuery.eq("level", parseInt(level));
    }

    const { data: courses, error: coursesError } = await coursesQuery;

    if (coursesError) {
      return errorResponse(coursesError.message);
    }

    if (!includeSections) {
      return successResponse(courses);
    }

    // Get sections for each course in this term
    const coursesWithSections = await Promise.all(
      courses.map(async (course) => {
        const { data: sections, error: sectionsError } = await supabase
          .from("section")
          .select(`
            *,
            instructor:users!section_instructor_id_fkey(id, full_name),
            time_slots:section_time(*)
          `)
          .eq("course_code", course.code)
          .eq("term_code", termCode)
          .order("id");

        if (sectionsError) {
          console.error(`Error fetching sections for ${course.code}:`, sectionsError);
        }

        // Get enrollment stats
        const { data: enrollmentStats } = await supabase
          .from("section_enrollment")
          .select("section_id")
          .in(
            "section_id",
            sections?.map((s) => s.id) || []
          )
          .eq("enrollment_status", "ENROLLED");

        const totalEnrolled = enrollmentStats?.length || 0;

        return {
          course,
          sections: sections || [],
          total_enrolled: totalEnrolled,
        };
      })
    );

    return successResponse(coursesWithSections);
  } catch (error) {
    console.error("Error in GET /api/committee/scheduler/courses:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * POST /api/committee/scheduler/courses
 * Create a new section for a course
 * Body: {
 *   course_code: string;
 *   term_code: string;
 *   section_id: string;
 *   instructor_id?: string;
 *   room_number?: string;
 *   capacity?: number;
 *   section_type?: 'LECTURE' | 'LAB' | 'TUTORIAL';
 *   time_slots: Array<{ day: string; start_time: string; end_time: string }>;
 * }
 */
export async function POST(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // Verify user is scheduling committee
  const { data: committee } = await supabase
    .from("committee_members")
    .select("committee_type")
    .eq("id", user.id)
    .maybeSingle();

  if (!committee || committee.committee_type !== "scheduling_committee") {
    return errorResponse("Unauthorized: Must be scheduling committee member", 403);
  }

  try {
    const body = await request.json();
    const {
      course_code,
      term_code,
      section_id,
      instructor_id,
      room_number,
      capacity = 50,
      section_type = "LECTURE",
      time_slots,
    } = body;

    // Validate required fields
    if (!course_code || !term_code || !section_id || !time_slots || !Array.isArray(time_slots)) {
      return validationErrorResponse({
        message: "Missing required fields: course_code, term_code, section_id, time_slots",
      });
    }

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from("course")
      .select("code")
      .eq("code", course_code)
      .maybeSingle();

    if (courseError || !course) {
      return errorResponse("Course not found", 404);
    }

    // Verify term exists
    const { data: term, error: termError } = await supabase
      .from("academic_term")
      .select("code")
      .eq("code", term_code)
      .maybeSingle();

    if (termError || !term) {
      return errorResponse("Academic term not found", 404);
    }

    // Create section
    const { data: section, error: sectionError } = await supabase
      .from("section")
      .insert({
        id: section_id,
        course_code,
        term_code,
        instructor_id,
        room_number,
        capacity,
        section_type,
        status: "DRAFT",
      })
      .select()
      .single();

    if (sectionError) {
      return errorResponse(sectionError.message);
    }

    // Create time slots
    const timeSlotInserts = time_slots.map((slot: {day: string; start_time: string; end_time: string}) => ({
      section_id: section.id,
      day: slot.day,
      start_time: slot.start_time,
      end_time: slot.end_time,
    }));

    const { error: timeSlotsError } = await supabase
      .from("section_time")
      .insert(timeSlotInserts);

    if (timeSlotsError) {
      // Rollback section creation
      await supabase.from("section").delete().eq("id", section.id);
      return errorResponse(timeSlotsError.message);
    }

    // Detect conflicts
    const { data: conflicts } = await supabase.rpc("detect_section_time_conflicts", {
      p_section_id: section.id,
    });

    return successResponse(
      {
        section,
        time_slots: timeSlotInserts,
        conflicts: conflicts || [],
      },
      "Section created successfully"
    );
  } catch (error) {
    console.error("Error in POST /api/committee/scheduler/courses:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * PATCH /api/committee/scheduler/courses
 * Update an existing section
 * Body: {
 *   section_id: string;
 *   instructor_id?: string;
 *   room_number?: string;
 *   capacity?: number;
 *   status?: 'DRAFT' | 'PUBLISHED' | 'CANCELLED';
 *   time_slots?: Array<{ day: string; start_time: string; end_time: string }>;
 * }
 */
export async function PATCH(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // Verify user is scheduling committee
  const { data: committee } = await supabase
    .from("committee_members")
    .select("committee_type")
    .eq("id", user.id)
    .maybeSingle();

  if (!committee || committee.committee_type !== "scheduling_committee") {
    return errorResponse("Unauthorized: Must be scheduling committee member", 403);
  }

  try {
    const body = await request.json();
    const { section_id, instructor_id, room_number, capacity, status, time_slots } = body;

    if (!section_id) {
      return validationErrorResponse({ message: "section_id is required" });
    }

    // Update section
    const updateData: Record<string, unknown> = {};
    if (instructor_id !== undefined) updateData.instructor_id = instructor_id;
    if (room_number !== undefined) updateData.room_number = room_number;
    if (capacity !== undefined) updateData.capacity = capacity;
    if (status !== undefined) updateData.status = status;

    if (Object.keys(updateData).length > 0) {
      const { error: sectionError } = await supabase
        .from("section")
        .update(updateData)
        .eq("id", section_id);

      if (sectionError) {
        return errorResponse(sectionError.message);
      }
    }

    // Update time slots if provided
    if (time_slots && Array.isArray(time_slots)) {
      // Delete existing time slots
      await supabase.from("section_time").delete().eq("section_id", section_id);

      // Insert new time slots
      const timeSlotInserts = time_slots.map((slot: {day: string; start_time: string; end_time: string}) => ({
        section_id,
        day: slot.day,
        start_time: slot.start_time,
        end_time: slot.end_time,
      }));

      const { error: timeSlotsError } = await supabase
        .from("section_time")
        .insert(timeSlotInserts);

      if (timeSlotsError) {
        return errorResponse(timeSlotsError.message);
      }
    }

    // Get updated section with time slots
    const { data: updatedSection, error: fetchError } = await supabase
      .from("section")
      .select(`
        *,
        instructor:users!section_instructor_id_fkey(id, full_name),
        time_slots:section_time(*)
      `)
      .eq("id", section_id)
      .single();

    if (fetchError) {
      return errorResponse(fetchError.message);
    }

    // Detect conflicts
    const { data: conflicts } = await supabase.rpc("detect_section_time_conflicts", {
      p_section_id: section_id,
    });

    return successResponse(
      {
        section: updatedSection,
        conflicts: conflicts || [],
      },
      "Section updated successfully"
    );
  } catch (error) {
    console.error("Error in PATCH /api/committee/scheduler/courses:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * DELETE /api/committee/scheduler/courses
 * Delete a section
 * Query params:
 * - section_id: string (required)
 */
export async function DELETE(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // Verify user is scheduling committee
  const { data: committee } = await supabase
    .from("committee_members")
    .select("committee_type")
    .eq("id", user.id)
    .maybeSingle();

  if (!committee || committee.committee_type !== "scheduling_committee") {
    return errorResponse("Unauthorized: Must be scheduling committee member", 403);
  }

  const searchParams = request.nextUrl.searchParams;
  const sectionId = searchParams.get("section_id");

  if (!sectionId) {
    return validationErrorResponse({ message: "section_id is required" });
  }

  try {
    // Check if section has enrollments
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("section_enrollment")
      .select("id")
      .eq("section_id", sectionId)
      .eq("enrollment_status", "ENROLLED")
      .limit(1);

    if (enrollmentError) {
      return errorResponse(enrollmentError.message);
    }

    if (enrollments && enrollments.length > 0) {
      return errorResponse(
        "Cannot delete section with enrolled students. Please cancel the section instead.",
        400
      );
    }

    // Delete section (cascades to section_time)
    const { error: deleteError } = await supabase
      .from("section")
      .delete()
      .eq("id", sectionId);

    if (deleteError) {
      return errorResponse(deleteError.message);
    }

    return successResponse({ section_id: sectionId }, "Section deleted successfully");
  } catch (error) {
    console.error("Error in DELETE /api/committee/scheduler/courses:", error);
    return errorResponse("Internal server error");
  }
}

