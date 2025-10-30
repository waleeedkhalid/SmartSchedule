/**
 * Schedule Comments Database Access Layer
 * 
 * Purpose: Manage student feedback on schedules (dual-layer comment system)
 * 
 * Comment Types:
 * 1. General Schedule Feedback (section_id = NULL)
 *    - Overall course load opinions
 *    - Time preference issues
 *    - General scheduling concerns
 * 
 * 2. Section-Specific Comments (section_id set)
 *    - Feedback on specific class times
 *    - Room/instructor concerns
 *    - Lab/lecture specific issues
 * 
 * Resolution Workflow:
 * 1. Student creates comment (is_resolved = false)
 * 2. Scheduling committee/registrar reviews
 * 3. Admin marks as resolved (sets resolved_by, resolved_at)
 * 4. Students can view resolution status
 */

import { createClient } from '@/supabase/server';

/**
 * View interface for schedule comments with joined user and section data
 */
export interface ScheduleCommentView {
  id: string;
  student_id: string;
  section_id: string | null;
  comment_text: string;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  student: {
    name: string;
    email: string;
    level: number | null;
    role?: string;
  };
  section: {
    course_code: string;
    section_no: string;
    course_title: string;
  } | null;
  resolver: {
    name: string;
    email: string;
  } | null;
}

/**
 * Get all comments by a user (general + section-specific)
 * Works for all user roles: students, faculty, staff
 * Includes resolved status and resolver information
 * 
 * @param userId - UUID of the user (student, faculty, or staff)
 * @returns Array of comments with joined user/section data
 */
export async function getUserComments(userId: string): Promise<ScheduleCommentView[]> {
  const supabase = await createClient();
  
  // Query comments with all related data
  // Joins: author info, section info (if section-specific), resolver info (if resolved)
  const { data, error } = await supabase
    .from('schedule_comment')
    .select(`
      *,
      student:user_roles!schedule_comment_author_id_fkey(user_id, name, email, level, role),
      section:section!schedule_comment_section_id_fkey(
        id,
        course_code,
        section_no,
        course:course!section_course_code_fkey(title)
      ),
      resolver:user_roles!schedule_comment_resolved_by_fkey(user_id, name, email)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  // Transform to view interface
  return (data || []).map((comment: any) => ({
    id: comment.id,
    student_id: comment.author_id, // Keep for backward compatibility
    section_id: comment.section_id,
    comment_text: comment.comment_text,
    is_resolved: comment.is_resolved,
    resolved_by: comment.resolved_by,
    resolved_at: comment.resolved_at,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    student: {
      name: comment.student.name,
      email: comment.student.email,
      level: comment.student.level,
      role: comment.student.role, // Include role for display
    },
    section: comment.section ? {
      course_code: comment.section.course_code,
      section_no: comment.section.section_no,
      course_title: comment.section.course?.title || '',
    } : null,
    resolver: comment.resolver ? {
      name: comment.resolver.name,
      email: comment.resolver.email,
    } : null,
  }));
}

/**
 * Legacy function - redirects to getUserComments
 * @deprecated Use getUserComments instead
 */
export async function getStudentComments(studentId: string): Promise<ScheduleCommentView[]> {
  return getUserComments(studentId);
}

/**
 * Get all comments for a specific section
 * Used by faculty/scheduling to see feedback on particular sections
 * 
 * @param sectionId - UUID of the section
 * @returns Array of comments about this section
 */
export async function getSectionComments(sectionId: string): Promise<ScheduleCommentView[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('schedule_comment')
    .select(`
      *,
      student:user_roles!schedule_comment_author_id_fkey(user_id, name, email, level, role),
      section:section!schedule_comment_section_id_fkey(
        id,
        course_code,
        section_no,
        course:course!section_course_code_fkey(title)
      ),
      resolver:user_roles!schedule_comment_resolved_by_fkey(user_id, name, email)
    `)
    .eq('section_id', sectionId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map((comment: any) => ({
    id: comment.id,
    student_id: comment.author_id,
    section_id: comment.section_id,
    comment_text: comment.comment_text,
    is_resolved: comment.is_resolved,
    resolved_by: comment.resolved_by,
    resolved_at: comment.resolved_at,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    student: {
      name: comment.student.name,
      email: comment.student.email,
      level: comment.student.level,
      role: comment.student.role,
    },
    section: comment.section ? {
      course_code: comment.section.course_code,
      section_no: comment.section.section_no,
      course_title: comment.section.course?.title || '',
    } : null,
    resolver: comment.resolver ? {
      name: comment.resolver.name,
      email: comment.resolver.email,
    } : null,
  }));
}

/**
 * Get all general schedule comments (not tied to specific sections)
 * Used by scheduling committee to see overall feedback
 * 
 * @returns Array of general comments
 */
export async function getGeneralComments(): Promise<ScheduleCommentView[]> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('schedule_comment')
    .select(`
      *,
      student:user_roles!schedule_comment_author_id_fkey(user_id, name, email, level, role),
      resolver:user_roles!schedule_comment_resolved_by_fkey(user_id, name, email)
    `)
    .is('section_id', null) // Only comments without section_id
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map((comment: any) => ({
    id: comment.id,
    student_id: comment.author_id,
    section_id: null,
    comment_text: comment.comment_text,
    is_resolved: comment.is_resolved,
    resolved_by: comment.resolved_by,
    resolved_at: comment.resolved_at,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    student: {
      name: comment.student.name,
      email: comment.student.email,
      level: comment.student.level,
      role: comment.student.role,
    },
    section: null,
    resolver: comment.resolver ? {
      name: comment.resolver.name,
      email: comment.resolver.email,
    } : null,
  }));
}

/**
 * Create a new comment (general or section-specific)
 * Works for all user roles: students, faculty, staff
 * 
 * @param authorId - UUID of the user creating the comment
 * @param commentText - The comment content
 * @param sectionId - UUID of section (optional, null for general comments)
 * @returns Created comment ID
 */
export async function createComment(
  authorId: string,
  commentText: string,
  sectionId?: string | null
): Promise<{ success: boolean; commentId?: string; error?: string }> {
  const supabase = await createClient();
  
  // Validate comment text length (database has constraint, but check early)
  if (!commentText || commentText.length === 0) {
    return { success: false, error: 'Comment text cannot be empty' };
  }
  
  if (commentText.length > 2000) {
    return { success: false, error: 'Comment text cannot exceed 2000 characters' };
  }
  
  // Insert comment
  // RLS policies ensure authenticated users can create comments
  const { data, error } = await supabase
    .from('schedule_comment')
    .insert({
      author_id: authorId,
      section_id: sectionId || null,
      comment_text: commentText,
      is_resolved: false,
    })
    .select('id')
    .single();
  
  if (error) {
    return { success: false, error: 'Failed to create comment' };
  }
  
  return {
    success: true,
    commentId: data.id,
  };
}

/**
 * Update an existing comment (only allowed if unresolved and owns comment)
 * Works for all user roles
 * 
 * @param commentId - UUID of the comment
 * @param authorId - UUID of the user (for authorization)
 * @param commentText - Updated comment text
 * @returns Success status
 */
export async function updateComment(
  commentId: string,
  authorId: string,
  commentText: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Validate text
  if (!commentText || commentText.length === 0) {
    return { success: false, error: 'Comment text cannot be empty' };
  }
  
  if (commentText.length > 2000) {
    return { success: false, error: 'Comment text cannot exceed 2000 characters' };
  }
  
  // Update comment
  // RLS policies ensure:
  // 1. User owns the comment
  // 2. Comment is not yet resolved
  const { error } = await supabase
    .from('schedule_comment')
    .update({
      comment_text: commentText,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .eq('author_id', authorId) // Security: ensure user owns this
    .eq('is_resolved', false); // Only update unresolved comments
  
  if (error) {
    return { success: false, error: 'Failed to update comment' };
  }
  
  return { success: true };
}

/**
 * Delete a comment (only allowed if unresolved and owns comment)
 * Works for all user roles
 * 
 * @param commentId - UUID of the comment
 * @param authorId - UUID of the user (for authorization)
 * @returns Success status
 */
export async function deleteComment(
  commentId: string,
  authorId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Delete comment
  // RLS policies ensure user owns comment and it's unresolved
  const { error } = await supabase
    .from('schedule_comment')
    .delete()
    .eq('id', commentId)
    .eq('author_id', authorId)
    .eq('is_resolved', false);
  
  if (error) {
    return { success: false, error: 'Failed to delete comment' };
  }
  
  return { success: true };
}

/**
 * Resolve a comment (admin only - scheduling/registrar roles)
 * Marks comment as addressed and records who resolved it
 * 
 * @param commentId - UUID of the comment
 * @param resolvedBy - UUID of the admin user resolving
 * @returns Success status
 */
export async function resolveComment(
  commentId: string,
  resolvedBy: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Update comment to resolved status
  // RLS policies ensure only scheduling/registrar can do this
  const { error } = await supabase
    .from('schedule_comment')
    .update({
      is_resolved: true,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .eq('is_resolved', false); // Only resolve unresolved comments
  
  if (error) {
    return { success: false, error: 'Failed to resolve comment' };
  }
  
  return { success: true };
}

/**
 * Unresolve a comment (admin only - to reopen discussion)
 * 
 * @param commentId - UUID of the comment
 * @returns Success status
 */
export async function unresolveComment(
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from('schedule_comment')
    .update({
      is_resolved: false,
      resolved_by: null,
      resolved_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', commentId)
    .eq('is_resolved', true); // Only unresolve resolved comments
  
  if (error) {
    return { success: false, error: 'Failed to unresolve comment' };
  }
  
  return { success: true };
}

/**
 * Get comment statistics for a user
 * Useful for dashboard overview
 * Works for all user roles
 * 
 * @param userId - UUID of the user
 * @returns Comment counts by status
 */
export async function getCommentStats(userId: string) {
  const supabase = await createClient();
  
  // Get all comments for this user
  const { data, error } = await supabase
    .from('schedule_comment')
    .select('id, is_resolved, section_id')
    .eq('author_id', userId);
  
  if (error) throw error;
  
  const comments = data || [];
  
  return {
    total: comments.length,
    resolved: comments.filter(c => c.is_resolved).length,
    unresolved: comments.filter(c => !c.is_resolved).length,
    general: comments.filter(c => c.section_id === null).length,
    section_specific: comments.filter(c => c.section_id !== null).length,
  };
}

