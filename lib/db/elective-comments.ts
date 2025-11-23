// Database queries for elective comments and feedback
// MIGRATED: Now uses Prisma ORM instead of Supabase Client
import { db } from '@/lib/db';
import { ElectiveComment } from '@/lib/types/database';

export async function getElectiveCommentsByStudent(studentId: string) {
  const comments = await db.electiveComment.findMany({
    where: { student_id: studentId },
    include: {
      course: {
        select: {
          code: true,
          title: true,
          level: true,
          credits: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });
  
  return comments;
}

export async function getElectiveCommentsByCourse(courseCode: string) {
  const comments = await db.electiveComment.findMany({
    where: { course_code: courseCode },
    include: {
      student: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });
  
  return comments;
}

export async function getAllElectiveComments() {
  const comments = await db.electiveComment.findMany({
    include: {
      course: {
        select: {
          code: true,
          title: true,
          level: true,
          credits: true
        }
      },
      student: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: { created_at: 'desc' }
  });
  
  return comments;
}

export async function getElectiveCommentById(id: string) {
  const comment = await db.electiveComment.findUnique({
    where: { id }
  });
  
  if (!comment) {
    throw new Error(`Elective comment with id ${id} not found`);
  }
  
  return comment as ElectiveComment;
}

export async function createElectiveComment(
  studentId: string,
  courseCode: string,
  comment: string
) {
  const created = await db.electiveComment.create({
    data: {
      student_id: studentId,
      course_code: courseCode,
      comment
    }
  });
  
  return created as ElectiveComment;
}

export async function updateElectiveComment(
  id: string,
  comment: string
) {
  const updated = await db.electiveComment.update({
    where: { id },
    data: { comment }
  });
  
  return updated as ElectiveComment;
}

export async function deleteElectiveComment(id: string) {
  await db.electiveComment.delete({
    where: { id }
  });
}

export async function resolveElectiveComment(
  id: string,
  resolvedBy: string
) {
  const updated = await db.electiveComment.update({
    where: { id },
    data: {
      is_resolved: true,
      resolved_by: resolvedBy,
      resolved_at: new Date()
    }
  });
  
  return updated as ElectiveComment;
}

export async function unresolveElectiveComment(id: string) {
  const updated = await db.electiveComment.update({
    where: { id },
    data: {
      is_resolved: false,
      resolved_by: null,
      resolved_at: null
    }
  });
  
  return updated as ElectiveComment;
}

// Get comment statistics for scheduling committee
export async function getElectiveCommentStats() {
  const comments = await db.electiveComment.findMany({
    include: {
      course: {
        select: {
          code: true,
          title: true,
          level: true
        }
      }
    }
  });
  
  // Aggregate by course
  const stats: Record<string, {
    course_code: string;
    course_title: string;
    level: number;
    total_comments: number;
    resolved_comments: number;
    unresolved_comments: number;
  }> = {};
  
  comments.forEach((comment) => {
    const code = comment.course_code;
    if (!stats[code]) {
      stats[code] = {
        course_code: code,
        course_title: comment.course?.title || '',
        level: comment.course?.level || 0,
        total_comments: 0,
        resolved_comments: 0,
        unresolved_comments: 0,
      };
    }
    
    stats[code].total_comments++;
    if (comment.is_resolved) {
      stats[code].resolved_comments++;
    } else {
      stats[code].unresolved_comments++;
    }
  });
  
  return Object.values(stats).sort((a, b) => b.unresolved_comments - a.unresolved_comments);
}

