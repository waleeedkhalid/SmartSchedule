import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entities = searchParams.get("entities")?.split(",") || ["all"];
    
    const supabase = await createClient();
    const exportData: Record<string, any> = {
      exported_at: new Date().toISOString(),
      version: "1.0",
      data: {},
    };

    // Export courses
    if (entities.includes("all") || entities.includes("courses")) {
      const { data: courses } = await supabase
        .from("course")
        .select("*")
        .order("code");
      exportData.data.courses = courses || [];
    }

    // Export rooms
    if (entities.includes("all") || entities.includes("rooms")) {
      const { data: rooms } = await supabase
        .from("room")
        .select("*")
        .order("code");
      exportData.data.rooms = rooms || [];
    }

    // Export instructors
    if (entities.includes("all") || entities.includes("instructors")) {
      const { data: instructors } = await supabase
        .from("instructor")
        .select("*")
        .order("name");
      exportData.data.instructors = instructors || [];
    }

    // Export student groups
    if (entities.includes("all") || entities.includes("student_groups")) {
      const { data: student_groups } = await supabase
        .from("student_group")
        .select("*")
        .order("level", { ascending: true });
      exportData.data.student_groups = student_groups || [];
    }

    // Export sections
    if (entities.includes("all") || entities.includes("sections")) {
      const { data: sections } = await supabase
        .from("section")
        .select("*")
        .order("course_code");
      exportData.data.sections = sections || [];
    }

    // Export exams
    if (entities.includes("all") || entities.includes("exams")) {
      const { data: exams } = await supabase
        .from("exam")
        .select("*")
        .order("date");
      exportData.data.exams = exams || [];
    }

    // Export rules
    if (entities.includes("all") || entities.includes("rules")) {
      const { data: rules } = await supabase
        .from("rule")
        .select("*");
      exportData.data.rules = rules || [];
    }

    // Export time grid config
    if (entities.includes("all") || entities.includes("config")) {
      const { data: config } = await supabase
        .from("time_grid_config")
        .select("*")
        .limit(1)
        .single();
      exportData.data.time_grid_config = config || null;
    }

    return NextResponse.json(exportData, {
      headers: {
        "Content-Disposition": `attachment; filename="smartschedule-export-${new Date().toISOString().split('T')[0]}.json"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}

