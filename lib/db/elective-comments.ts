// Database queries for elective comments and feedback
import { createClient } from '@/supabase/server';
import { ElectiveComment } from '@/lib/types/database';

export async function getElectiveCommentsByStudent(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('elective_comment')
    .select(`
      *,
      course:course(code, title, level, credits)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getElectiveCommentsByCourse(courseCode: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('elective_comment')
    .select(`
      *,
      student:user_roles!elective_comment_student_id_fkey(name, email)
    `)
    .eq('course_code', courseCode)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getAllElectiveComments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('elective_comment')
    .select(`
      *,
      course:course(code, title, level, credits),
      student:user_roles!elective_comment_student_id_fkey(name, email)
    `)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return data;
}

export async function getElectiveCommentById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('elective_comment')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as ElectiveComment;
}

export async function createElectiveComment(
  studentId: string,
  courseCode: string,
  comment: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('elective_comment')
    .insert({
      student_id: studentId,
      course_code: courseCode,
      comment,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as ElectiveComment;
}

export async function updateElectiveComment(
  id: string,
  comment: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('elective_comment')
    .update({ comment })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as ElectiveComment;
}

export async function deleteElectiveComment(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('elective_comment')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function resolveElectiveComment(
  id: string,
  resolvedBy: string
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('elective_comment')
    .update({ 
      is_resolved: true,
      resolved_by: resolvedBy,
      resolved_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as ElectiveComment;
}

export async function unresolveElectiveComment(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('elective_comment')
    .update({ 
      is_resolved: false,
      resolved_by: null,
      resolved_at: null
    })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as ElectiveComment;
}

// Get comment statistics for scheduling committee
export async function getElectiveCommentStats() {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('elective_comment')
    .select(`
      course_code,
      is_resolved,
      course:course(code, title, level)
    `);
  
  if (error) throw error;
  
  // Aggregate by course
  const stats: Record<string, {
    course_code: string;
    course_title: string;
    level: number;
    total_comments: number;
    resolved_comments: number;
    unresolved_comments: number;
  }> = {};
  
  data.forEach((comment: any) => {
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

