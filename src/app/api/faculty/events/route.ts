import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";

/**
 * GET /api/faculty/events
 * Fetches academic events relevant to faculty members
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Get current user
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

    // Get active academic term
    const { data: activeTerm, error: termError } = await supabase
      .from("academic_term")
      .select("code")
      .eq("is_active", true)
      .maybeSingle();

    if (termError) {
      return NextResponse.json(
        { success: false, error: "Failed to fetch active term" },
        { status: 500 }
      );
    }

    if (!activeTerm) {
      return NextResponse.json({
        success: true,
        data: { events: [] },
      });
    }

    // Get events for the active term
    // Filter for events relevant to faculty (either general or with faculty audience)
    const { data: events, error: eventsError } = await supabase
      .from("term_events")
      .select("*")
      .eq("term_code", activeTerm.code)
      .order("start_date", { ascending: true });

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      return NextResponse.json(
        { success: false, error: "Failed to fetch events" },
        { status: 500 }
      );
    }

    // Filter events relevant to faculty
    const facultyRelevantEvents = (events || []).filter((event) => {
      const metadata = event.metadata as { audience?: string } | null;
      // Include events with no specific audience or specifically for faculty
      return !metadata?.audience || metadata.audience === "faculty" || metadata.audience === "all";
    });

    return NextResponse.json({
      success: true,
      data: {
        events: facultyRelevantEvents,
        termCode: activeTerm.code,
      },
    });
  } catch (error) {
    console.error("Error in /api/faculty/events:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

