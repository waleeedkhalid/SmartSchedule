// Database queries for exams
import { createClient } from '@/supabase/server';
import { Exam, ExamInput } from '@/lib/types/database';

export async function getExams() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exam')
    .select('*')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });
  
  if (error) throw error;
  return data as Exam[];
}

export async function getExamById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exam')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Exam;
}

export async function getExamsByCourse(courseCode: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exam')
    .select('*')
    .eq('course_code', courseCode)
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data as Exam[];
}

export async function getExamsByDate(date: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exam')
    .select('*')
    .eq('date', date)
    .order('start_time', { ascending: true });
  
  if (error) throw error;
  return data as Exam[];
}

export async function getExamsByDateRange(startDate: string, endDate: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exam')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });
  
  if (error) throw error;
  return data as Exam[];
}

export async function createExam(exam: ExamInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('exam')
    .insert({ ...exam, created_by: user?.id })
    .select()
    .single();
  
  if (error) throw error;
  return data as Exam;
}

export async function updateExam(id: string, updates: Partial<ExamInput>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('exam')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Exam;
}

export async function deleteExam(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('exam')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function getExamConflicts(examId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_exam_conflicts', { p_exam_id: examId });
  
  if (error) throw error;
  return data;
}

export async function getAllExamConflicts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_all_exam_conflicts');
  
  if (error) throw error;
  return data;
}

