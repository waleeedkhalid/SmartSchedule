/**
 * API Route for Semester Conflicts
 * 
 * REFACTORED: New endpoint
 * GET /api/semesters/[id]/conflicts - All conflicts for semester
 * Calls get_semester_conflicts(semester_id) database function
 */
import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    // Try calling the database function
    const { data, error } = await supabase.rpc('get_semester_conflicts', {
      semester_id: id
    });
    
    if (error) {
      // If function doesn't exist, return empty array
      console.warn("get_semester_conflicts function not available:", error);
      return NextResponse.json([]);
    }
    
    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Error fetching semester conflicts:", error);
    return NextResponse.json(
      { error: "Failed to fetch conflicts" },
      { status: 500 }
    );
  }
}

