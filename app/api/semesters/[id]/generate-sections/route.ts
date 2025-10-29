/**
 * API Route for Auto-Creating Sections
 * 
 * REFACTORED: New endpoint
 * POST /api/semesters/[id]/generate-sections - Auto-create sections (scheduling only)
 * Calls auto_create_all_sections(semester_id) database function
 * This is the "Generate Schedule" button trigger
 */
import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const courseCode = body.course_code; // Optional: specific course only
    
    const supabase = await createClient();
    
    // Call the appropriate database function
    if (courseCode) {
      // Generate sections for specific course
      const { data, error } = await supabase.rpc('auto_create_sections', {
        semester_id: id,
        course_code: courseCode
      });
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        course_code: courseCode,
        result: data
      });
    } else {
      // Generate sections for all courses
      const { data, error } = await supabase.rpc('auto_create_all_sections', {
        semester_id: id
      });
      
      if (error) throw error;
      
      return NextResponse.json({
        success: true,
        result: data
      });
    }
  } catch (error) {
    console.error("Error generating sections:", error);
    return NextResponse.json(
      { error: "Failed to generate sections. Ensure migration 016 is applied." },
      { status: 500 }
    );
  }
}

