// Database queries for exams
import { createClient } from '@/supabase/server';
import { Exam, ExamInput } from '@/lib/types/database';

/**
 * Get all exams (DEPRECATED - use getExamsPaginated instead)
 * @deprecated Use getExamsPaginated for better performance
 */
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

/**
 * Get paginated exams with optional filtering and sorting
 * Implements server-side pagination for optimal performance
 * 
 * NOTE: All exams are course-level (apply to all sections of a course)
 * 
 * @param page - Page number (1-based)
 * @param pageSize - Number of exams per page (default: 20)
 * @param filters - Optional filters: { courseCode?, startDate?, endDate? }
 * @param sortBy - Field to sort by (default: 'date')
 * @param sortOrder - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns Object containing exams array, total count, and total pages
 */
export async function getExamsPaginated(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    courseCode?: string
    startDate?: string
    endDate?: string
  },
  sortBy: 'date' | 'start_time' | 'course_code' = 'date',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const supabase = await createClient()
  
  // Calculate range for pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  // Build query with count - select specific columns for better performance
  let query = supabase
    .from('exam')
    .select(`
      id,
      course_code,
      date,
      start_time,
      duration_minutes,
      room_codes,
      created_at,
      updated_at
    `, { count: 'exact' })
  
  // Apply filters if provided
  if (filters?.courseCode) {
    query = query.eq('course_code', filters.courseCode)
  }
  if (filters?.startDate) {
    query = query.gte('date', filters.startDate)
  }
  if (filters?.endDate) {
    query = query.lte('date', filters.endDate)
  }
  
  // Apply sorting and pagination
  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to)
  
  const { data, error, count } = await query
  
  if (error) throw error
  
  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)
  
  return {
    exams: data as Exam[],
    totalCount,
    totalPages,
    currentPage: page,
    pageSize
  }
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

