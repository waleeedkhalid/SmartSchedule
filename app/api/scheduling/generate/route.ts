import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { generateSchedule } from "@/lib/scheduling/algorithm";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user has scheduling role
    const { data: userRole } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (userRole?.role !== "scheduling") {
      return NextResponse.json(
        { error: "Only scheduling committee can generate schedules" },
        { status: 403 }
      );
    }

    // Fetch all unassigned or draft sections
    const { data: sections, error: sectionsError } = await supabase
      .from("section")
      .select("*")
      .eq("state", "draft");

    if (sectionsError) throw sectionsError;

    // Fetch all rooms
    const { data: rooms, error: roomsError } = await supabase
      .from("room")
      .select("*");

    if (roomsError) throw roomsError;

    // Fetch time grid configuration
    const { data: timeGridData, error: configError } = await supabase
      .from("time_grid_config")
      .select("*")
      .single();

    if (configError) throw configError;

    // Run the scheduling algorithm
    const result = await generateSchedule({
      sections: sections.map((s) => ({
        id: s.id,
        course_code: s.course_code,
        section_no: s.section_no,
        instructor_id: s.instructor_id,
        room_code: s.room_code,
        capacity: s.capacity,
        group_level: s.group_level,
        meeting_pattern: s.meeting_pattern as any,
      })),
      rooms: rooms.map((r) => ({
        code: r.code,
        type: r.type as "Lecture" | "Lab",
        capacity: r.capacity,
      })),
      timeGridConfig: {
        teaching_days: timeGridData.teaching_days,
        daily_start_time: timeGridData.daily_start_time,
        daily_end_time: timeGridData.daily_end_time,
        slot_duration_minutes: timeGridData.slot_duration_minutes,
        break_start_time: timeGridData.break_start_time,
        break_end_time: timeGridData.break_end_time,
        typical_lab_duration_minutes: timeGridData.typical_lab_duration_minutes,
      },
    });

    // If successful, update the sections in the database
    if (result.success || result.assignments.length > 0) {
      const updatePromises = result.assignments.map((assignment) =>
        supabase
          .from("section")
          .update({
            room_code: assignment.room_code,
            meeting_pattern: {
              days: assignment.time_slot.days,
              start: assignment.time_slot.start_time,
              duration: assignment.time_slot.duration,
              is_lab: assignment.is_lab,
            },
          })
          .eq("id", assignment.section_id)
      );

      await Promise.all(updatePromises);
    }

    return NextResponse.json({
      success: result.success,
      stats: result.stats,
      unassigned: result.unassigned,
      message: result.success
        ? "Schedule generated successfully!"
        : `Partial schedule generated. ${result.unassigned.length} sections could not be assigned.`,
    });
  } catch (error) {
    console.error("Error generating schedule:", error);
    return NextResponse.json(
      { error: "Failed to generate schedule" },
      { status: 500 }
    );
  }
}

// Get current scheduling status
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Count sections by state
    const { data: draftSections, count: draftCount } = await supabase
      .from("section")
      .select("*", { count: "exact", head: false })
      .eq("state", "draft");

    const { data: releasedSections, count: releasedCount } = await supabase
      .from("section")
      .select("*", { count: "exact", head: false })
      .eq("state", "released");

    // Count sections with assigned rooms and times
    const assignedCount = draftSections?.filter(
      (s) => s.room_code && s.meeting_pattern?.start
    ).length || 0;

    const unassignedCount = (draftCount || 0) - assignedCount;

    return NextResponse.json({
      draft: {
        total: draftCount || 0,
        assigned: assignedCount,
        unassigned: unassignedCount,
      },
      released: {
        total: releasedCount || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching scheduling status:", error);
    return NextResponse.json(
      { error: "Failed to fetch status" },
      { status: 500 }
    );
  }
}

