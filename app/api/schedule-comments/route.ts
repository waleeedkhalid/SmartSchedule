import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { getUserComments, createComment, getCommentStats } from '@/lib/db/schedule-comments';
import { getFacultyProfile } from '@/lib/db/faculty';

/**
 * GET /api/schedule-comments
 * Fetch authenticated user's schedule comments
 * Works for all roles: students, faculty, staff
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user's comments
    const comments = await getUserComments(user.id);
    
    // Get comment statistics
    const stats = await getCommentStats(user.id);
    
    return NextResponse.json({
      comments,
      stats,
    });
  } catch (error) {
    console.error('Error fetching schedule comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schedule-comments
 * Create a new schedule comment
 * Works for all roles: students, faculty, staff
 * 
 * Body: {
 *   comment_text: string,
 *   section_id?: string | null // null for general feedback
 * }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role, email')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (!userRole) {
      return NextResponse.json({ error: 'User role not found' }, { status: 404 });
    }
    
    // Parse request body
    const body = await request.json();
    const { comment_text, section_id } = body;
    
    // Validate comment text
    if (!comment_text || typeof comment_text !== 'string') {
      return NextResponse.json(
        { error: 'comment_text is required and must be a string' },
        { status: 400 }
      );
    }
    
    if (comment_text.length === 0) {
      return NextResponse.json(
        { error: 'Comment text cannot be empty' },
        { status: 400 }
      );
    }
    
    if (comment_text.length > 2000) {
      return NextResponse.json(
        { error: 'Comment text cannot exceed 2000 characters' },
        { status: 400 }
      );
    }
    
    // If section_id is provided and user is faculty, validate they're assigned to that section
    if (section_id && userRole.role === 'faculty') {
      const instructor = await getFacultyProfile(user.id);
      
      if (instructor) {
        // Check if faculty is assigned to this section
        const { data: section } = await supabase
          .from('section')
          .select('instructor_id')
          .eq('id', section_id)
          .single();
        
        if (section && section.instructor_id !== instructor.id) {
          return NextResponse.json(
            { error: 'You can only comment on sections you are assigned to' },
            { status: 403 }
          );
        }
      }
    }
    
    // Create comment
    const result = await createComment(user.id, comment_text, section_id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create comment' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        success: true,
        message: 'Comment created successfully',
        comment_id: result.commentId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating schedule comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}

