import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { 
  getElectiveCommentById,
  updateElectiveComment,
  deleteElectiveComment,
  resolveElectiveComment,
  unresolveElectiveComment
} from "@/lib/db/elective-comments";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const comment = await getElectiveCommentById(params.id);
    
    // Verify ownership or scheduling role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    const isOwner = comment.student_id === user.id;
    const isScheduling = userRole?.role === 'scheduling' || userRole?.role === 'teaching_load';
    
    if (!isOwner && !isScheduling) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    return NextResponse.json(comment);
  } catch (error) {
    console.error("Error fetching elective comment:", error);
    return NextResponse.json(
      { error: "Failed to fetch elective comment" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { comment, resolve } = body;
    
    // Get user role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    // Handle resolve/unresolve (scheduling only)
    if (resolve !== undefined) {
      if (!userRole || (userRole.role !== 'scheduling' && userRole.role !== 'teaching_load')) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      
      const updatedComment = resolve 
        ? await resolveElectiveComment(params.id, user.id)
        : await unresolveElectiveComment(params.id);
      
      return NextResponse.json(updatedComment);
    }
    
    // Handle comment text update (student only, own comment only)
    if (comment !== undefined) {
      const existingComment = await getElectiveCommentById(params.id);
      
      if (existingComment.student_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      
      if (existingComment.is_resolved) {
        return NextResponse.json(
          { error: "Cannot edit resolved comment" },
          { status: 400 }
        );
      }
      
      if (comment.trim().length < 10) {
        return NextResponse.json(
          { error: "Comment must be at least 10 characters" },
          { status: 400 }
        );
      }
      
      const updatedComment = await updateElectiveComment(params.id, comment.trim());
      return NextResponse.json(updatedComment);
    }
    
    return NextResponse.json(
      { error: "No valid update fields provided" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error updating elective comment:", error);
    return NextResponse.json(
      { error: "Failed to update elective comment" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const comment = await getElectiveCommentById(params.id);
    
    // Only allow deletion by owner and only if not resolved
    if (comment.student_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    if (comment.is_resolved) {
      return NextResponse.json(
        { error: "Cannot delete resolved comment" },
        { status: 400 }
      );
    }
    
    await deleteElectiveComment(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting elective comment:", error);
    return NextResponse.json(
      { error: "Failed to delete elective comment" },
      { status: 500 }
    );
  }
}

