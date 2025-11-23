/**
 * Schedule Comments Database Access Layer
 * 
 * Purpose: Manage student feedback on schedules (dual-layer comment system)
 * 
 * Comment Types:
 * 1. General Schedule Feedback (sectionId = NULL)
 *    - Overall course load opinions
 *    - Time preference issues
 *    - General scheduling concerns
 * 
 * 2. Section-Specific Comments (sectionId set)
 *    - Feedback on specific class times
 *    - Room/instructor concerns
 *    - Lab/lecture specific issues
 * 
 * Resolution Workflow:
 * 1. User creates comment (isResolved = false)
 * 2. Scheduling committee/registrar reviews
 * 3. Admin marks as resolved (sets resolvedBy, resolvedAt)
 * 4. Users can view resolution status
 * 
 * MIGRATED: Now uses Prisma ORM with authorId instead of student_id
 */

import { db } from '@/lib/db';

/**
 * View interface for schedule comments with joined user and section data
 */
export interface ScheduleCommentView {
  id: string;
  author_id: string;
  section_id: string | null;
  comment_text: string;
  is_resolved: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  author: {
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
  const comments = await db.scheduleComment.findMany({
    where: {
      authorId: userId
    },
    include: {
      author: {
        include: {
          studentProfile: true
        }
      },
      section: {
        include: {
          course: true
        }
      },
      resolver: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  // Transform to view interface
  return comments.map((comment) => {
    const authorLevel = comment.author.studentProfile?.level || null;
    
    return {
      id: comment.id,
      author_id: comment.authorId,
      section_id: comment.sectionId,
      comment_text: comment.commentText,
      is_resolved: comment.isResolved,
      resolved_by: comment.resolvedBy,
      resolved_at: comment.resolvedAt?.toISOString() || null,
      created_at: comment.createdAt.toISOString(),
      updated_at: comment.updatedAt.toISOString(),
      author: {
        name: comment.author.name,
        email: comment.author.email,
        level: authorLevel,
        role: comment.author.role,
      },
      section: comment.section ? {
        course_code: comment.section.courseCode,
        section_no: comment.section.sectionNo,
        course_title: comment.section.course.title,
      } : null,
      resolver: comment.resolver ? {
        name: comment.resolver.name,
        email: comment.resolver.email,
      } : null,
    };
  });
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
  const comments = await db.scheduleComment.findMany({
    where: {
      sectionId
    },
    include: {
      author: {
        include: {
          studentProfile: true
        }
      },
      section: {
        include: {
          course: true
        }
      },
      resolver: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return comments.map((comment) => {
    const authorLevel = comment.author.studentProfile?.level || null;
    
    return {
      id: comment.id,
      author_id: comment.authorId,
      section_id: comment.sectionId,
      comment_text: comment.commentText,
      is_resolved: comment.isResolved,
      resolved_by: comment.resolvedBy,
      resolved_at: comment.resolvedAt?.toISOString() || null,
      created_at: comment.createdAt.toISOString(),
      updated_at: comment.updatedAt.toISOString(),
      author: {
        name: comment.author.name,
        email: comment.author.email,
        level: authorLevel,
        role: comment.author.role,
      },
      section: comment.section ? {
        course_code: comment.section.courseCode,
        section_no: comment.section.sectionNo,
        course_title: comment.section.course.title,
      } : null,
      resolver: comment.resolver ? {
        name: comment.resolver.name,
        email: comment.resolver.email,
      } : null,
    };
  });
}

/**
 * Get all general schedule comments (not tied to specific sections)
 * Used by scheduling committee to see overall feedback
 * 
 * @returns Array of general comments
 */
export async function getGeneralComments(): Promise<ScheduleCommentView[]> {
  const comments = await db.scheduleComment.findMany({
    where: {
      sectionId: null
    },
    include: {
      author: {
        include: {
          studentProfile: true
        }
      },
      resolver: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  
  return comments.map((comment) => {
    const authorLevel = comment.author.studentProfile?.level || null;
    
    return {
      id: comment.id,
      author_id: comment.authorId,
      section_id: null,
      comment_text: comment.commentText,
      is_resolved: comment.isResolved,
      resolved_by: comment.resolvedBy,
      resolved_at: comment.resolvedAt?.toISOString() || null,
      created_at: comment.createdAt.toISOString(),
      updated_at: comment.updatedAt.toISOString(),
      author: {
        name: comment.author.name,
        email: comment.author.email,
        level: authorLevel,
        role: comment.author.role,
      },
      section: null,
      resolver: comment.resolver ? {
        name: comment.resolver.name,
        email: comment.resolver.email,
      } : null,
    };
  });
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
  try {
    // Validate comment text length
    if (!commentText || commentText.length === 0) {
      return { success: false, error: 'Comment text cannot be empty' };
    }
    
    if (commentText.length > 2000) {
      return { success: false, error: 'Comment text cannot exceed 2000 characters' };
    }
    
    // Create comment
    const comment = await db.scheduleComment.create({
      data: {
        authorId,
        sectionId: sectionId || null,
        commentText,
        isResolved: false,
      }
    });
    
    return {
      success: true,
      commentId: comment.id,
    };
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return { success: false, error: error.message || 'Failed to create comment' };
  }
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
  try {
    // Validate text
    if (!commentText || commentText.length === 0) {
      return { success: false, error: 'Comment text cannot be empty' };
    }
    
    if (commentText.length > 2000) {
      return { success: false, error: 'Comment text cannot exceed 2000 characters' };
    }
    
    // Verify comment exists, belongs to user, and is unresolved
    const comment = await db.scheduleComment.findFirst({
      where: {
        id: commentId,
        authorId,
        isResolved: false
      }
    });
    
    if (!comment) {
      return { success: false, error: 'Comment not found or cannot be updated' };
    }
    
    // Update comment
    await db.scheduleComment.update({
      where: { id: commentId },
      data: {
        commentText
      }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating comment:', error);
    return { success: false, error: error.message || 'Failed to update comment' };
  }
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
  try {
    // Verify comment exists, belongs to user, and is unresolved
    const comment = await db.scheduleComment.findFirst({
      where: {
        id: commentId,
        authorId,
        isResolved: false
      }
    });
    
    if (!comment) {
      return { success: false, error: 'Comment not found or cannot be deleted' };
    }
    
    // Delete comment
    await db.scheduleComment.delete({
      where: { id: commentId }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    return { success: false, error: error.message || 'Failed to delete comment' };
  }
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
  try {
    // Verify comment exists and is unresolved
    const comment = await db.scheduleComment.findFirst({
      where: {
        id: commentId,
        isResolved: false
      }
    });
    
    if (!comment) {
      return { success: false, error: 'Comment not found or already resolved' };
    }
    
    // Update comment to resolved status
    await db.scheduleComment.update({
      where: { id: commentId },
      data: {
        isResolved: true,
        resolvedBy,
        resolvedAt: new Date()
      }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error resolving comment:', error);
    return { success: false, error: error.message || 'Failed to resolve comment' };
  }
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
  try {
    // Verify comment exists and is resolved
    const comment = await db.scheduleComment.findFirst({
      where: {
        id: commentId,
        isResolved: true
      }
    });
    
    if (!comment) {
      return { success: false, error: 'Comment not found or not resolved' };
    }
    
    // Update comment to unresolved status
    await db.scheduleComment.update({
      where: { id: commentId },
      data: {
        isResolved: false,
        resolvedBy: null,
        resolvedAt: null
      }
    });
    
    return { success: true };
  } catch (error: any) {
    console.error('Error unresolving comment:', error);
    return { success: false, error: error.message || 'Failed to unresolve comment' };
  }
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
  const comments = await db.scheduleComment.findMany({
    where: {
      authorId: userId
    },
    select: {
      id: true,
      isResolved: true,
      sectionId: true
    }
  });
  
  return {
    total: comments.length,
    resolved: comments.filter(c => c.isResolved).length,
    unresolved: comments.filter(c => !c.isResolved).length,
    general: comments.filter(c => c.sectionId === null).length,
    section_specific: comments.filter(c => c.sectionId !== null).length,
  };
}
