/**
 * Faculty Availability API
 * 
 * GET - Get faculty availability preferences
 * PATCH - Update faculty availability preferences
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { z } from "zod";
import { 
  getFacultyProfile, 
  updateFacultyAvailability,
  type DayAvailability 
} from "@/lib/db/faculty-data";

// Validation schema for availability update
const timeSlotSchema = z.object({
  start: z.string().regex(/^\d{2}:\d{2}$/),
  end: z.string().regex(/^\d{2}:\d{2}$/),
  type: z.enum(['preferred', 'unavailable']),
});

const dayAvailabilitySchema = z.object({
  day: z.string(),
  slots: z.array(timeSlotSchema),
});

const updateAvailabilitySchema = z.object({
  preferred_times: z.array(dayAvailabilitySchema),
  unavailable_times: z.array(dayAvailabilitySchema),
});

/**
 * GET /api/v1/faculty/availability
 * Get the authenticated faculty member's availability preferences
 */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is faculty
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (userRole?.role !== 'faculty') {
      return NextResponse.json(
        { error: "Forbidden: Only faculty members can access this endpoint" },
        { status: 403 }
      );
    }

    // Get faculty profile
    const profile = await getFacultyProfile(user.id);

    if (!profile) {
      return NextResponse.json(
        { error: "Faculty profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      preferred_times: profile.preferred_times || [],
      unavailable_times: profile.unavailable_times || [],
      max_load_per_week: profile.max_load_per_week || 12,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/faculty/availability
 * Update the authenticated faculty member's availability preferences
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is faculty
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (userRole?.role !== 'faculty') {
      return NextResponse.json(
        { error: "Forbidden: Only faculty members can access this endpoint" },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = updateAvailabilitySchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { preferred_times, unavailable_times } = validationResult.data;

    // Update availability
    const result = await updateFacultyAvailability(
      user.id,
      preferred_times as DayAvailability[],
      unavailable_times as DayAvailability[]
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update availability" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Availability updated successfully",
      preferred_times,
      unavailable_times,
    });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

