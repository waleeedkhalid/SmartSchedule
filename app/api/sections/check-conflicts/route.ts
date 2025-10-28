import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

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

    const body = await request.json();
    const {
      room_code,
      instructor_id,
      group_level,
      meeting_days,
      meeting_start,
      meeting_duration,
      exclude_section_id,
    } = body;

    const conflicts: {
      room_conflicts: any[];
      instructor_conflicts: any[];
      student_conflicts: any[];
      has_conflicts: boolean;
    } = {
      room_conflicts: [],
      instructor_conflicts: [],
      student_conflicts: [],
      has_conflicts: false,
    };

    // Check room conflicts if room is assigned
    if (room_code) {
      const { data: roomConflicts, error: roomError } = await supabase.rpc(
        "check_room_conflicts",
        {
          p_room_code: room_code,
          p_days: meeting_days,
          p_start_time: meeting_start,
          p_duration: meeting_duration,
          p_exclude_section_id: exclude_section_id || null,
        }
      );

      if (roomError) throw roomError;
      conflicts.room_conflicts = roomConflicts || [];
    }

    // Check instructor conflicts if instructor is assigned
    if (instructor_id) {
      const { data: instructorConflicts, error: instructorError } =
        await supabase.rpc("check_instructor_conflicts", {
          p_instructor_id: instructor_id,
          p_days: meeting_days,
          p_start_time: meeting_start,
          p_duration: meeting_duration,
          p_exclude_section_id: exclude_section_id || null,
        });

      if (instructorError) throw instructorError;
      conflicts.instructor_conflicts = instructorConflicts || [];
    }

    // Check student level conflicts
    const { data: studentConflicts, error: studentError } = await supabase.rpc(
      "check_student_level_conflicts",
      {
        p_group_level: group_level,
        p_days: meeting_days,
        p_start_time: meeting_start,
        p_duration: meeting_duration,
        p_exclude_section_id: exclude_section_id || null,
      }
    );

    if (studentError) throw studentError;
    conflicts.student_conflicts = studentConflicts || [];

    // Determine if there are any conflicts
    conflicts.has_conflicts =
      conflicts.room_conflicts.length > 0 ||
      conflicts.instructor_conflicts.length > 0 ||
      conflicts.student_conflicts.length > 0;

    return NextResponse.json(conflicts);
  } catch (error) {
    console.error("Error checking conflicts:", error);
    return NextResponse.json(
      { error: "Failed to check conflicts" },
      { status: 500 }
    );
  }
}

