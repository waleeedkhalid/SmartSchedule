import { createClient } from "@/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const entitiesParam = searchParams.get("entities");
    const entities = entitiesParam ? entitiesParam.split(",") : ["all"];

    const supabase = await createClient();
    const exportData: Record<string, any> = {};

    // Helper to fetch data if entity is selected or 'all' is selected
    const shouldFetch = (entity: string) =>
      entities.includes("all") || entities.includes(entity);

    if (shouldFetch("courses")) {
      const { data, error } = await supabase.from("course").select("*");
      if (error) throw error;
      exportData.courses = data;
    }

    if (shouldFetch("rooms")) {
      const { data, error } = await supabase.from("room").select("*");
      if (error) throw error;
      exportData.rooms = data;
    }

    if (shouldFetch("instructors")) {
      const { data, error } = await supabase
        .from("faculty_profile")
        .select("*");
      if (error) throw error;
      exportData.instructors = data;
    }

    if (shouldFetch("sections")) {
      const { data, error } = await supabase.from("section").select("*");
      if (error) throw error;
      exportData.sections = data;
    }

    if (shouldFetch("exams")) {
      const { data, error } = await supabase.from("exam").select("*");
      if (error) throw error;
      exportData.exams = data;
    }

    if (shouldFetch("rules")) {
      // Try to fetch rules, but don't fail if table doesn't exist (as it might be named differently or not exist yet)
      try {
        const { data, error } = await supabase.from("rule").select("*");
        if (!error) {
          exportData.rules = data;
        }
      } catch (e) {
        console.warn("Could not fetch rules:", e);
      }
    }

    if (shouldFetch("config")) {
      const { data, error } = await supabase
        .from("time_grid_config")
        .select("*");
      if (error) throw error;
      exportData.config = data;
    }

    // Add metadata
    exportData.metadata = {
      exported_at: new Date().toISOString(),
      version: "1.0",
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error("Export failed:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
