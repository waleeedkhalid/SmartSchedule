import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/faculty/availability
 * Fetch faculty availability for the current active term
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is faculty
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userData?.role !== "faculty") {
      return NextResponse.json(
        { success: false, error: "Faculty access required" },
        { status: 403 }
      );
    }

    // Get active term
    const { data: activeTerm, error: termError } = await supabase
      .from("academic_term")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (termError) {
      console.error("Error fetching active term:", termError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch active term" },
        { status: 500 }
      );
    }

    if (!activeTerm) {
      return NextResponse.json(
        { success: false, error: "No active academic term" },
        { status: 404 }
      );
    }

    // Fetch availability for current term
    const { data: availability, error: availError } = await supabase
      .from("faculty_availability")
      .select("*")
      .eq("faculty_id", user.id)
      .eq("term_code", activeTerm.code)
      .maybeSingle();

    if (availError) {
      console.error("Error fetching availability:", availError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch availability" },
        { status: 500 }
      );
    }

    // Return availability data or empty state
    return NextResponse.json({
      success: true,
      data: availability
        ? {
            availability_data: availability.availability_data,
            lastUpdated: availability.updated_at,
            termCode: availability.term_code,
          }
        : null,
    });
  } catch (error) {
    console.error("Error in /api/faculty/availability GET:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/faculty/availability
 * Save or update faculty availability for the current active term
 */
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Verify user is faculty
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError || userData?.role !== "faculty") {
      return NextResponse.json(
        { success: false, error: "Faculty access required" },
        { status: 403 }
      );
    }

    // Get active term
    const { data: activeTerm, error: termError } = await supabase
      .from("academic_term")
      .select("*")
      .eq("is_active", true)
      .maybeSingle();

    if (termError) {
      console.error("Error fetching active term:", termError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch active term" },
        { status: 500 }
      );
    }

    if (!activeTerm) {
      return NextResponse.json(
        { success: false, error: "No active academic term" },
        { status: 404 }
      );
    }

    // Check if faculty availability submission is open
    if (!activeTerm.is_faculty_availability_open) {
      return NextResponse.json(
        {
          success: false,
          error: "Faculty availability submission is currently closed",
        },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { availability } = body;

    if (!availability || typeof availability !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid availability data" },
        { status: 400 }
      );
    }

    // Upsert availability record
    const { data, error: upsertError } = await supabase
      .from("faculty_availability")
      .upsert(
        {
          faculty_id: user.id,
          term_code: activeTerm.code,
          availability_data: availability,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "faculty_id,term_code",
        }
      )
      .select()
      .single();

    if (upsertError) {
      console.error("Error upserting availability:", upsertError);
      return NextResponse.json(
        { success: false, error: "Failed to save availability" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Availability saved successfully",
      data: {
        availability_data: data.availability_data,
        lastUpdated: data.updated_at,
        termCode: data.term_code,
      },
    });
  } catch (error) {
    console.error("Error in /api/faculty/availability POST:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

