/**
 * Teaching Load Instructor Assignments API
 *
 * GET /api/v1/teaching-load/assignments - List all instructor assignments
 * POST /api/v1/teaching-load/assignments - Create new assignment
 * PATCH /api/v1/teaching-load/assignments/:id - Update assignment
 * DELETE /api/v1/teaching-load/assignments/:id - Delete assignment
 *
 * Handles instructor course assignment management for teaching load committee.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import {
  createSuccessResponse,
  handleApiError,
  createErrorResponse,
  ErrorCodes,
} from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { z } from "zod";

const assignmentCreateSchema = z.object({
  instructor_id: z.string().uuid("Invalid instructor ID"),
  section_id: z.string().uuid("Invalid section ID"),
  notes: z.string().optional(),
});

const assignmentUpdateSchema = z.object({
  notes: z.string().optional(),
});

/**
 * GET - List all instructor assignments
 * Can filter by instructor_id, section_id, or term_id
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Teaching load committee can view assignments
    requireRole(user, ["teaching_load", "scheduling"]);

    const supabase = await createClient();
    const { searchParams } = new URL(request.url);

    const instructor_id = searchParams.get("instructor_id");
    const section_id = searchParams.get("section_id");
    const term_id = searchParams.get("term_id");

    // Build query
    let query = supabase
      .from("section")
      .select(
        `
        id,
        section_no,
        course_code,
        course:course_code(*),
        instructor_id,
        instructor:instructor_id(
          id,
          name,
          email,
          max_load_per_week
        ),
        meeting_pattern,
        capacity,
        created_at,
        updated_at
      `
      )
      .eq("instructor_id", "is not", null);

    // Apply filters
    if (instructor_id) {
      query = query.eq("instructor_id", instructor_id);
    }

    if (section_id) {
      query = query.eq("id", section_id);
    }

    if (term_id) {
      // Filter by term via schedule table
      const { data: scheduleData } = await supabase
        .from("schedule")
        .select("section_id")
        .eq("term_id", term_id);

      const sectionIds = scheduleData?.map((s) => s.section_id) || [];
      if (sectionIds.length > 0) {
        query = query.in("id", sectionIds);
      } else {
        return createSuccessResponse([], 200);
      }
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return createSuccessResponse(data || [], 200);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST - Create new instructor assignment
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Only teaching load committee can create assignments
    requireRole(user, ["teaching_load", "scheduling"]);

    const body = await request.json();
    const parsed = assignmentCreateSchema.safeParse(body);

    if (!parsed.success) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        parsed.error.message
      );
    }

    const { instructor_id, section_id, notes } = parsed.data;

    const supabase = await createClient();

    // Step 1: Verify instructor exists
    const { data: instructor, error: instructorError } = await supabase
      .from("faculty_profile")
      .select("id, name, max_load_per_week")
      .eq("id", instructor_id)
      .single();

    if (instructorError || !instructor) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Instructor not found"
      );
    }

    // Step 2: Verify section exists
    const { data: section, error: sectionError } = await supabase
      .from("section")
      .select("id, course_code, section_no, meeting_pattern")
      .eq("id", section_id)
      .single();

    if (sectionError || !section) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Section not found"
      );
    }

    // Step 3: Check if instructor already assigned to this section
    const { data: existing } = await supabase
      .from("section")
      .select("instructor_id")
      .eq("id", section_id)
      .eq("instructor_id", instructor_id)
      .single();

    if (existing?.instructor_id) {
      return createErrorResponse(
        409,
        ErrorCodes.CONFLICT,
        "Instructor already assigned to this section"
      );
    }

    // Step 4: Check instructor time conflicts
    const { data: conflictSections } = await supabase
      .from("section")
      .select("id, meeting_pattern, course_code, section_no")
      .eq("instructor_id", instructor_id);

    if (conflictSections && conflictSections.length > 0) {
      // Check for time overlaps
      const sectionDays = section.meeting_pattern?.["days"] || [];
      const sectionStart = section.meeting_pattern?.["start"] || "";
      const sectionDuration = section.meeting_pattern?.["duration"] || 0;

      for (const existing of conflictSections) {
        const existingDays = existing.meeting_pattern?.["days"] || [];
        const existingStart = existing.meeting_pattern?.["start"] || "";
        const existingDuration = existing.meeting_pattern?.["duration"] || 0;

        // Simple overlap check (day overlap)
        const daysOverlap = sectionDays.some((day: string) =>
          existingDays.includes(day)
        );

        if (daysOverlap && sectionStart && existingStart) {
          // Time overlap check (would need helper function for exact check)
          console.warn(
            `Potential time conflict: Instructor ${instructor.name} assigned to ${section.course_code}-${section.section_no} but already has ${existing.course_code}-${existing.section_no}`
          );
        }
      }
    }

    // Step 5: Check teaching load
    const { data: instructorSections } = await supabase
      .from("section")
      .select("course_code")
      .eq("instructor_id", instructor_id);

    let totalWeeklyHours = 0;
    if (instructorSections && instructorSections.length > 0) {
      const { data: coursesData } = await supabase
        .from("course")
        .select("weekly_hours")
        .in(
          "code",
          instructorSections.map((s) => s.course_code)
        );

      totalWeeklyHours =
        (coursesData?.reduce((sum, c) => sum + (c.weekly_hours || 0), 0) || 0) +
        (section?.meeting_pattern?.["duration"] || 0);
    }

    if (totalWeeklyHours > (instructor.max_load_per_week || 12)) {
      console.warn(
        `Warning: Instructor ${instructor.name} teaching load (${totalWeeklyHours}h) exceeds max (${instructor.max_load_per_week}h)`
      );
      // Don't reject, just warn
    }

    // Step 6: Assign instructor to section
    const { data: updated, error: updateError } = await supabase
      .from("section")
      .update({
        instructor_id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", section_id)
      .select()
      .single();

    if (updateError) {
      throw updateError;
    }

    // Step 7: Log the assignment in schedule_comment or audit table
    if (notes) {
      await supabase.from("schedule_comment").insert({
        section_id,
        author_id: user.id,
        comment_text: `Assignment notes: ${notes}`,
      });
    }

    return createSuccessResponse(
      {
        success: true,
        message: `Instructor ${instructor.name} assigned to ${section.course_code}-${section.section_no}`,
        assignment: {
          section_id,
          instructor_id,
          instructor_name: instructor.name,
          course_code: section.course_code,
          section_no: section.section_no,
          assigned_at: new Date().toISOString(),
        },
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH - Update instructor assignment
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Only teaching load committee can update assignments
    requireRole(user, ["teaching_load", "scheduling"]);

    const { searchParams } = new URL(request.url);
    const section_id = searchParams.get("section_id");

    if (!section_id) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "section_id query parameter required"
      );
    }

    const body = await request.json();
    const parsed = assignmentUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        parsed.error.message
      );
    }

    const { notes } = parsed.data;

    const supabase = await createClient();

    // Add notes to assignment
    if (notes) {
      const { error } = await supabase.from("schedule_comment").insert({
        section_id,
        author_id: user.id,
        comment_text: `Assignment update: ${notes}`,
      });

      if (error) {
        throw error;
      }
    }

    // Get updated section info
    const { data: updated, error: selectError } = await supabase
      .from("section")
      .select(
        `
        id,
        section_no,
        course_code,
        instructor:instructor_id(name)
      `
      )
      .eq("id", section_id)
      .single();

    if (selectError) {
      throw selectError;
    }

    return createSuccessResponse(
      {
        success: true,
        message: "Assignment updated",
        assignment: updated,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE - Remove instructor assignment
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Only teaching load committee can delete assignments
    requireRole(user, ["teaching_load", "scheduling"]);

    const { searchParams } = new URL(request.url);
    const section_id = searchParams.get("section_id");

    if (!section_id) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        "section_id query parameter required"
      );
    }

    const supabase = await createClient();

    // Get section info before deletion
    const { data: section } = await supabase
      .from("section")
      .select("id, course_code, section_no, instructor_id")
      .eq("id", section_id)
      .single();

    if (!section) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Section not found"
      );
    }

    // Remove instructor assignment
    const { error: updateError } = await supabase
      .from("section")
      .update({
        instructor_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", section_id);

    if (updateError) {
      throw updateError;
    }

    return createSuccessResponse(
      {
        success: true,
        message: `Instructor removed from ${section.course_code}-${section.section_no}`,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
