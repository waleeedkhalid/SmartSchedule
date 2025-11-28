/**
 * Registration Status Endpoint
 * 
 * GET /api/v1/registration-status - Check if registration is currently open
 * 
 * Returns the registration status for the active semester.
 * All authenticated users can check registration status.
 */

import { NextRequest } from "next/server";
import { authenticateRequest } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";

export async function GET(request: NextRequest) {
  try {
    await authenticateRequest(request);
    const supabase = await createClient();

    // Check if registration is open using the database function
    const { data: isOpen, error: rpcError } = await supabase.rpc("is_registration_open");

    // If function doesn't exist, check manually
    if (rpcError) {
      // Fallback: Check academic_semesters table directly
      const { data: activeSemester, error: semesterError } = await supabase
        .from("academic_semesters")
        .select("registration_open, code, name")
        .eq("is_active", true)
        .single();

      if (semesterError) {
        // If academic_semesters doesn't exist, check academic_term and semester_timeline
        const { data: activeTerm } = await supabase
          .from("academic_term")
          .select("code, name, status")
          .in("status", ["draft", "released"])
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (activeTerm) {
          // Check if there's a registration event in timeline
          const { data: registrationEvent } = await supabase
            .from("semester_timeline")
            .select("start_date, end_date, status")
            .eq("term_code", activeTerm.code)
            .eq("event_type", "registration")
            .order("start_date", { ascending: false })
            .limit(1)
            .single();

          if (registrationEvent) {
            const now = new Date();
            const startDate = new Date(registrationEvent.start_date);
            const endDate = new Date(registrationEvent.end_date);
            const isOpen = now >= startDate && now <= endDate && registrationEvent.status === "in_progress";

            return createSuccessResponse(
              {
                is_open: isOpen,
                semester: {
                  code: activeTerm.code,
                  name: activeTerm.name,
                },
                message: isOpen
                  ? "Registration is currently open"
                  : "Registration is closed. Check the timeline for registration dates.",
              },
              200
            );
          }
        }

        return createSuccessResponse(
          {
            is_open: false,
            message: "Unable to determine registration status. Please contact your department.",
          },
          200
        );
      }

      return createSuccessResponse(
        {
          is_open: activeSemester?.registration_open || false,
          semester: activeSemester
            ? {
                code: activeSemester.code,
                name: activeSemester.name,
              }
            : null,
          message: activeSemester?.registration_open
            ? "Registration is currently open"
            : "Registration is closed. Check the timeline for registration dates.",
        },
        200
      );
    }

    // Get active semester info for context
    const { data: activeSemester } = await supabase
      .from("academic_semesters")
      .select("code, name")
      .eq("is_active", true)
      .single();

    return createSuccessResponse(
      {
        is_open: isOpen || false,
        semester: activeSemester
          ? {
              code: activeSemester.code,
              name: activeSemester.name,
            }
          : null,
        message: isOpen
          ? "Registration is currently open"
          : "Registration is closed. Check the timeline for registration dates.",
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}

