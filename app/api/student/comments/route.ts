/**
 * Student Comments API Route
 * 
 * Purpose: Manage student feedback on schedules (dual-layer comment system)
 * 
 * Comment Types:
 * 1. General feedback: section_id = null (overall schedule concerns)
 * 2. Section-specific: section_id set (feedback on particular class)
 * 
 * Permissions:
 * - Students: Create, update (own unresolved), delete (own unresolved), view (own)
 * - Staff: View all, resolve comments
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import {
  getStudentComments,
  createComment,
  updateComment,
  deleteComment,
  getCommentStats,
} from '@/lib/db/schedule-comments';

/**
 * GET /api/student/comments
 * Fetch comments by the authenticated student
 * 
 * Query Parameters:
 * - stats: If 'true', returns comment statistics
 * - section_id: Filter to comments for specific section
 * - resolved: 'true' or 'false' to filter by resolution status
 * 
 * Returns:
 * - 200: Array of comments (or stats)
 * - 401: Not authenticated
 * - 403: Not a student
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify user is a student
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (roleError || !userRole || userRole.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can access comments' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const wantsStats = searchParams.get('stats') === 'true';
    const sectionId = searchParams.get('section_id');
    const resolvedFilter = searchParams.get('resolved');
    
    // Return stats if requested
    if (wantsStats) {
      const stats = await getCommentStats(user.id);
      return NextResponse.json(stats);
    }
    
    // Fetch comments
    let comments = await getStudentComments(user.id);
    
    // Apply filters
    if (sectionId) {
      comments = comments.filter(c => c.section_id === sectionId);
    }
    
    if (resolvedFilter === 'true') {
      comments = comments.filter(c => c.is_resolved);
    } else if (resolvedFilter === 'false') {
      comments = comments.filter(c => !c.is_resolved);
    }
    
    return NextResponse.json({
      comments,
      total: comments.length,
    });
    
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/student/comments
 * Create a new comment
 * 
 * Request Body:
 * {
 *   comment_text: string  // Required, 1-2000 characters
 *   section_id?: string   // Optional, null for general feedback
 * }
 * 
 * Returns:
 * - 201: Comment created successfully
 * - 400: Invalid request (missing text, too long, etc.)
 * - 401: Not authenticated
 * - 403: Not a student
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify user is a student
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (roleError || !userRole || userRole.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can create comments' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { comment_text, section_id } = body;
    
    if (!comment_text) {
      return NextResponse.json(
        { error: 'comment_text is required' },
        { status: 400 }
      );
    }
    
    // Create comment
    const result = await createComment(
      user.id,
      comment_text,
      section_id || null
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        comment_id: result.commentId,
        message: 'Comment created successfully',
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/student/comments
 * Update an existing comment (only if unresolved and owned by student)
 * 
 * Request Body:
 * {
 *   comment_id: string     // Required
 *   comment_text: string   // Required, updated text
 * }
 * 
 * Returns:
 * - 200: Comment updated successfully
 * - 400: Invalid request or comment already resolved
 * - 401: Not authenticated
 * - 403: Not authorized (not owner or already resolved)
 * - 500: Server error
 */
export async function PATCH(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify user is a student
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (roleError || !userRole || userRole.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can update comments' },
        { status: 403 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { comment_id, comment_text } = body;
    
    if (!comment_id || !comment_text) {
      return NextResponse.json(
        { error: 'comment_id and comment_text are required' },
        { status: 400 }
      );
    }
    
    // Update comment
    // Function checks: student owns comment, comment is unresolved
    const result = await updateComment(comment_id, user.id, comment_text);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Cannot update comment (may be resolved or not owned)' },
        { status: 403 }
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
 * DELETE /api/student/comments
 * Delete a comment (only if unresolved and owned by student)
 * 
 * Query Parameters:
 * - id: comment_id to delete
 * 
 * Returns:
 * - 200: Comment deleted successfully
 * - 400: Missing comment ID or comment already resolved
 * - 401: Not authenticated
 * - 403: Not authorized (not owner or already resolved)
 * - 500: Server error
 */
export async function DELETE(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify user is a student
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (roleError || !userRole || userRole.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can delete comments' },
        { status: 403 }
      );
    }
    
    // Get comment ID from query params
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');
    
    if (!commentId) {
      return NextResponse.json(
        { error: 'comment id is required' },
        { status: 400 }
      );
    }
    
    // Delete comment
    // Function checks: student owns comment, comment is unresolved
    const result = await deleteComment(commentId, user.id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Cannot delete comment (may be resolved or not owned)' },
        { status: 403 }
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

