import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { updateComment, deleteComment } from '@/lib/db/schedule-comments';

/**
 * PATCH /api/schedule-comments/[id]
 * Update an existing comment (only if unresolved and user owns it)
 * 
 * Body: {
 *   comment_text: string
 * }
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    const body = await request.json();
    const { comment_text } = body;
    
    // Validate comment text
    if (!comment_text || typeof comment_text !== 'string') {
      return NextResponse.json(
        { error: 'comment_text is required and must be a string' },
        { status: 400 }
      );
    }
    
    // Update comment
    const result = await updateComment(id, user.id, comment_text);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update comment' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Comment updated successfully',
    });
  } catch (error) {
    console.error('Error updating comment:', error);
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schedule-comments/[id]
 * Delete a comment (only if unresolved and user owns it)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id } = await params;
    
    // Delete comment
    const result = await deleteComment(id, user.id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete comment' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Comment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    );
  }
}

