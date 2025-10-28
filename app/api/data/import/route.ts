import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

interface ImportData {
  version?: string;
  data: {
    courses?: any[];
    rooms?: any[];
    instructors?: any[];
    student_groups?: any[];
    sections?: any[];
    exams?: any[];
    rules?: any[];
    time_grid_config?: any;
  };
}

export async function POST(request: Request) {
  try {
    const body: ImportData = await request.json();
    
    if (!body.data) {
      return NextResponse.json(
        { error: "Invalid import format: missing 'data' field" },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const results: Record<string, any> = {};

    // Import courses
    if (body.data.courses && body.data.courses.length > 0) {
      const coursesToImport = body.data.courses.map((c) => ({
        code: c.code,
        title: c.title,
        level: c.level,
        credits: c.credits,
        weekly_hours: c.weekly_hours,
        is_elective: c.is_elective,
        created_by: user?.id,
      }));

      const { data, error } = await supabase
        .from("course")
        .upsert(coursesToImport, { onConflict: "code" })
        .select();

      results.courses = {
        success: !error,
        count: data?.length || 0,
        error: error?.message,
      };
    }

    // Import rooms
    if (body.data.rooms && body.data.rooms.length > 0) {
      const roomsToImport = body.data.rooms.map((r) => ({
        code: r.code,
        type: r.type,
        created_by: user?.id,
      }));

      const { data, error } = await supabase
        .from("room")
        .upsert(roomsToImport, { onConflict: "code" })
        .select();

      results.rooms = {
        success: !error,
        count: data?.length || 0,
        error: error?.message,
      };
    }

    // Import instructors
    if (body.data.instructors && body.data.instructors.length > 0) {
      const instructorsToImport = body.data.instructors.map((i) => ({
        id: i.id,
        name: i.name,
        email: i.email,
        preferred_times: i.preferred_times || [],
        unavailable_times: i.unavailable_times || [],
        max_load_per_week: i.max_load_per_week || 12,
        created_by: user?.id,
      }));

      const { data, error } = await supabase
        .from("instructor")
        .upsert(instructorsToImport, { onConflict: "id" })
        .select();

      results.instructors = {
        success: !error,
        count: data?.length || 0,
        error: error?.message,
      };
    }

    // Import student groups
    if (body.data.student_groups && body.data.student_groups.length > 0) {
      const groupsToImport = body.data.student_groups.map((g) => ({
        id: g.id,
        level: g.level,
        size: g.size,
        name: g.name,
        created_by: user?.id,
      }));

      const { data, error } = await supabase
        .from("student_group")
        .upsert(groupsToImport, { onConflict: "id" })
        .select();

      results.student_groups = {
        success: !error,
        count: data?.length || 0,
        error: error?.message,
      };
    }

    // Import sections
    if (body.data.sections && body.data.sections.length > 0) {
      const sectionsToImport = body.data.sections.map((s) => ({
        id: s.id,
        course_code: s.course_code,
        section_no: s.section_no,
        instructor_id: s.instructor_id,
        room_code: s.room_code,
        capacity: s.capacity,
        meeting_pattern: s.meeting_pattern,
        group_level: s.group_level,
        state: s.state || 'draft',
        created_by: user?.id,
      }));

      const { data, error } = await supabase
        .from("section")
        .upsert(sectionsToImport, { onConflict: "id" })
        .select();

      results.sections = {
        success: !error,
        count: data?.length || 0,
        error: error?.message,
      };
    }

    // Import exams
    if (body.data.exams && body.data.exams.length > 0) {
      const examsToImport = body.data.exams.map((e) => ({
        id: e.id,
        course_code: e.course_code,
        section_id: e.section_id,
        date: e.date,
        start_time: e.start_time,
        duration_minutes: e.duration_minutes,
        room_codes: e.room_codes || [],
        created_by: user?.id,
      }));

      const { data, error } = await supabase
        .from("exam")
        .upsert(examsToImport, { onConflict: "id" })
        .select();

      results.exams = {
        success: !error,
        count: data?.length || 0,
        error: error?.message,
      };
    }

    return NextResponse.json({
      success: true,
      results,
      message: "Import completed",
    });
  } catch (error) {
    console.error("Error importing data:", error);
    return NextResponse.json(
      { error: "Failed to import data", details: (error as Error).message },
      { status: 500 }
    );
  }
}

