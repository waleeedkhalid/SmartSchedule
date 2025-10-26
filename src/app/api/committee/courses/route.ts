/**
 * Courses API
 * Handles both read and mutation operations for courses and sections
 * 
 * ✅ EXTRACTED from /api/committee/scheduler/courses
 * 
 * NOTE: 
 * - Server Components should use cached queries from lib/queries/scheduler.ts
 * - Client Components (like SectionManager) should use the GET endpoint
 * - All mutations use POST, PATCH, DELETE with revalidation
 * 
 * Following best practices from data-fetching.mdc and api-error-handling.mdc
 */

import { NextRequest } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getAuthenticatedUser,
  successResponse,
  errorResponse,
  unauthorizedResponse,
  validationErrorResponse,
} from "@/lib/api";

/**
 * Verify committee membership helper
 * Extracted for reuse across mutation endpoints
 */
async function verifyCommitteeMembership(userId: string, supabase: any) {
  const { data: committee } = await supabase
    .from("committee_members")
    .select("committee_type")
    .eq("id", userId)
    .maybeSingle();

  if (!committee || committee.committee_type !== "scheduling_committee") {
    return false;
  }
  
  return true;
}

/**
 * GET /api/committee/courses
 * Get courses with sections for client components (SectionManager)
 * Query params:
 * - term_code: string (required)
 * - course_type: string (optional)
 * - level: string (optional)
 * - include_sections: boolean (optional, default: false)
 */
export async function GET(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // Verify committee membership
  const isAuthorized = await verifyCommitteeMembership(user.id, supabase);
  if (!isAuthorized) {
    return errorResponse("Unauthorized: Must be scheduling committee member", 403);
  }

  const searchParams = request.nextUrl.searchParams;
  const termCode = searchParams.get("term_code");
  const courseType = searchParams.get("course_type");
  const level = searchParams.get("level");
  const includeSections = searchParams.get("include_sections") === "true";

  if (!termCode) {
    return validationErrorResponse({
      message: "term_code is required",
    });
  }

  try {
    // Build query
    let query = supabase
      .from("course")
      .select(
        `
        code,
        name,
        credits,
        course_type,
        level,
        department
      `
      )
      .order("code", { ascending: true });

    // Apply filters
    if (courseType) {
      query = query.eq("course_type", courseType);
    }
    if (level) {
      query = query.eq("level", level);
    }

    const { data: courses, error: coursesError } = await query;

    if (coursesError) {
      return errorResponse(coursesError.message);
    }

    // If include_sections, fetch sections for each course
    if (includeSections && courses) {
      const coursesWithSections = await Promise.all(
        courses.map(async (course) => {
          const { data: sections, error: sectionsError } = await supabase
            .from("section")
            .select(
              `
              id,
              course_code,
              term_code,
              instructor_id,
              room_number,
              capacity,
              section_type,
              status,
              instructor:users!section_instructor_id_fkey(id, full_name),
              time_slots:section_time(day, start_time, end_time),
              enrolled_count:section_enrollment(count)
            `
            )
            .eq("course_code", course.code)
            .eq("term_code", termCode);

          if (sectionsError) {
            console.error(
              `Error fetching sections for ${course.code}:`,
              sectionsError
            );
          }

          // Process enrolled count
          const processedSections = sections?.map((section: any) => ({
            ...section,
            instructor_name: (section.instructor as any)?.full_name || null,
            enrolled_count:
              Array.isArray(section.enrolled_count) && section.enrolled_count.length > 0
                ? section.enrolled_count[0].count
                : 0,
          }));

          return {
            course,
            sections: processedSections || [],
          };
        })
      );

      return successResponse({
        data: coursesWithSections,
        count: coursesWithSections.length,
      });
    } else {
      const coursesWithoutSections = courses?.map((course) => ({
        course,
        sections: [],
      })) || [];

      return successResponse({
        data: coursesWithoutSections,
        count: coursesWithoutSections.length,
      });
    }
  } catch (error) {
    console.error("Error in GET /api/committee/courses:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * POST /api/committee/courses
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

  // ✅ OPTIMIZED: Use helper function
  const isAuthorized = await verifyCommitteeMembership(user.id, supabase);
  if (!isAuthorized) {
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

    // ✅ OPTIMIZED: Revalidate page cache after mutation
    revalidatePath("/committee/courses");

    return successResponse(
      {
        section,
        time_slots: timeSlotInserts,
        conflicts: conflicts || [],
      },
      "Section created successfully"
    );
  } catch (error) {
    console.error("Error in POST /api/committee/courses:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * PATCH /api/committee/courses
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

  // ✅ OPTIMIZED: Use helper function
  const isAuthorized = await verifyCommitteeMembership(user.id, supabase);
  if (!isAuthorized) {
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

    // ✅ OPTIMIZED: Revalidate page cache after mutation
    revalidatePath("/committee/courses");

    return successResponse(
      {
        section: updatedSection,
        conflicts: conflicts || [],
      },
      "Section updated successfully"
    );
  } catch (error) {
    console.error("Error in PATCH /api/committee/courses:", error);
    return errorResponse("Internal server error");
  }
}

/**
 * DELETE /api/committee/courses
 * Delete a section
 * Query params:
 * - section_id: string (required)
 */
export async function DELETE(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  // ✅ OPTIMIZED: Use helper function
  const isAuthorized = await verifyCommitteeMembership(user.id, supabase);
  if (!isAuthorized) {
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

    // ✅ OPTIMIZED: Revalidate page cache after mutation
    revalidatePath("/committee/courses");

    return successResponse({ section_id: sectionId }, "Section deleted successfully");
  } catch (error) {
    console.error("Error in DELETE /api/committee/courses:", error);
    return errorResponse("Internal server error");
  }
}

