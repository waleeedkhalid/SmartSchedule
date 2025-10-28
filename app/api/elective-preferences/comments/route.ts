import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { 
  getElectiveCommentsByStudent,
  createElectiveComment,
  getAllElectiveComments,
  getElectiveCommentStats
} from "@/lib/db/elective-comments";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { searchParams } = new URL(request.url);
    const statsParam = searchParams.get('stats');
    const allParam = searchParams.get('all');
    
    // Get user role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    // Stats endpoint for scheduling committee
    if (statsParam === 'true') {
      if (!userRole || (userRole.role !== 'scheduling' && userRole.role !== 'teaching_load')) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      
      const stats = await getElectiveCommentStats();
      return NextResponse.json(stats);
    }
    
    // All comments for scheduling committee
    if (allParam === 'true') {
      if (!userRole || (userRole.role !== 'scheduling' && userRole.role !== 'teaching_load')) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      
      const comments = await getAllElectiveComments();
      return NextResponse.json(comments);
    }
    
    // Get comments for current student
    const comments = await getElectiveCommentsByStudent(user.id);
    return NextResponse.json(comments);
  } catch (error) {
    console.error("Error fetching elective comments:", error);
    return NextResponse.json(
      { error: "Failed to fetch elective comments" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Verify user has student role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (!userRole || userRole.role !== 'student') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    const body = await request.json();
    const { course_code, comment } = body;
    
    if (!course_code || !comment) {
      return NextResponse.json(
        { error: "Missing required fields: course_code, comment" },
        { status: 400 }
      );
    }
    
    if (comment.trim().length < 10) {
      return NextResponse.json(
        { error: "Comment must be at least 10 characters" },
        { status: 400 }
      );
    }
    
    const newComment = await createElectiveComment(user.id, course_code, comment.trim());
    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error creating elective comment:", error);
    return NextResponse.json(
      { error: "Failed to create elective comment" },
      { status: 500 }
    );
  }
}

