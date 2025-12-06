/**
 * Registrar Enrollment Override API
 *
 * POST /api/v1/registrar/enrollments/override - Register student with capacity override
 *
 * Handles registrar-specific enrollment operations including capacity overrides.
 * Only registrar role can use this endpoint.
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

const enrollmentOverrideSchema = z.object({
  student_id: z.string().uuid("Invalid student ID"),
  section_id: z.string().uuid("Invalid section ID"),
  override_type: z
    .enum(["capacity", "conflict", "credit_limit"])
    .default("capacity"),
  reason: z.string().optional(),
});

/**
 * POST - Register student with override (registrar only)
 * Allows registrar to bypass capacity limits (up to 25% override)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);

    // Only registrar can use this endpoint
    requireRole(user, ["registrar"]);

    const body = await request.json();
    const parsed = enrollmentOverrideSchema.safeParse(body);

    if (!parsed.success) {
      return createErrorResponse(
        400,
        ErrorCodes.VALIDATION_ERROR,
        parsed.error.message
      );
    }

    const { student_id, section_id, override_type, reason } = parsed.data;

    // Create Supabase client
    const supabase = await createClient();

    // Step 1: Verify section exists
    const { data: section, error: sectionError } = await supabase
      .from("section")
      .select("id, capacity, course_code, state")
      .eq("id", section_id)
      .single();

    if (sectionError || !section) {
      return createErrorResponse(
        404,
        ErrorCodes.NOT_FOUND,
        "Section not found"
      );
    }

    // Step 2: Check if section is released
    if (section.state !== "released") {
      return createErrorResponse(
        409,
        ErrorCodes.CONFLICT,
        "Section is not released for registration"
      );
    }

    // Step 3: Get current enrollment count
    const { data: enrollments, error: enrollError } = await supabase
      .from("student_enrollment")
      .select("id", { count: "exact" })
      .eq("section_id", section_id)
      .eq("status", "registered");

    if (enrollError) {
      throw enrollError;
    }

    const currentEnrollmentCount = enrollments?.length || 0;

    // Step 4: Get capacity thresholds for override percentage
    const { data: threshold } = await supabase
      .from("capacity_thresholds")
      .select("override_percentage")
      .eq("course_code", section.course_code)
      .single();

    const overridePercentage = threshold?.override_percentage || 25;
    const maxCapacityWithOverride = Math.floor(
      section.capacity * (1 + overridePercentage / 100)
    );

    // Step 5: Check if override capacity is exceeded
    if (currentEnrollmentCount >= maxCapacityWithOverride) {
      return createErrorResponse(
        409,
        ErrorCodes.CONFLICT,
        `Section override capacity (${maxCapacityWithOverride}) reached. Cannot register student.`
      );
    }

    // Step 6: Call register_student function with override parameters
    const { data: result, error: rpcError } = await supabase.rpc(
      "register_student",
      {
        p_student_id: student_id,
        p_section_id: section_id,
        p_registrar_id: user.id,
        p_allow_override: true, // Enable override for registrar
      }
    );

    if (rpcError) {
      throw rpcError;
    }

    // Handle failure from DB function
    if (!result.success) {
      const msg = result.message || "Registration failed";
      const statusMap: { [key: string]: number } = {
        "Already enrolled": 409,
        "Section not found": 404,
        "Section is not released": 409,
        "override capacity": 409,
      };

      const status =
        Object.entries(statusMap).find(([key]) => msg.includes(key))?.[1] ||
        400;

      return createErrorResponse(status, ErrorCodes.CONFLICT, msg);
    }

    // Step 7: Log the override in audit table
    const { error: logError } = await supabase.rpc("log_registrar_override", {
      p_student_id: student_id,
      p_section_id: section_id,
      p_registrar_id: user.id,
      p_override_type: override_type,
      p_reason: reason || null,
    });

    if (logError) {
      console.error("Error logging override:", logError);
      // Don't fail the request if logging fails
    }

    // Return success
    return createSuccessResponse(
      {
        success: true,
        message: result.message,
        enrollment: {
          student_id,
          section_id,
          status: "registered",
          enrolled_at: new Date().toISOString(),
        },
        override_info: {
          type: override_type,
          registrar_id: user.id,
          current_enrollment: currentEnrollmentCount + 1,
          capacity: section.capacity,
          max_with_override: maxCapacityWithOverride,
          override_percentage: overridePercentage,
          percentage_over_capacity:
            Math.round(
              ((currentEnrollmentCount + 1 - section.capacity) /
                section.capacity) *
                100 *
                10
            ) / 10,
        },
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
