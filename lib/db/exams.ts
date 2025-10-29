/**
 * Database queries for exams
 * 
 * REFACTORED: Added semester context (REQUIRED) and exam_type
 * - Added academic_semester_id to all query functions
 * - Added exam_type support ('midterm' | 'midterm2' | 'final')
 * - Exams are already course-level (no section_id)
 */
import { createClient } from '@/supabase/server';
import { Exam, ExamInput } from '@/lib/types/database';
import { getCurrentSemester } from './semesters';

/**
 * Get all exams for a semester (DEPRECATED - use getExamsPaginated instead)
 * @deprecated Use getExamsPaginated for better performance
 * @param semesterId - Semester ID (defaults to current semester)
 */
export async function getExams(semesterId?: string) {
  const supabase = await createClient();
  const semester = semesterId || (await getCurrentSemester())?.id;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester ID or set a current semester.');
  }
  
  const { data, error } = await supabase
    .from('exam')
    .select('*')
    .eq('academic_semester_id', semester)
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
 * @param filters - Optional filters: { semesterId?, courseCode?, examType?, startDate?, endDate? }
 * @param sortBy - Field to sort by (default: 'date')
 * @param sortOrder - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns Object containing exams array, total count, and total pages
 */
export async function getExamsPaginated(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    semesterId?: string
    courseCode?: string
    examType?: 'midterm' | 'midterm2' | 'final'
    startDate?: string
    endDate?: string
  },
  sortBy: 'date' | 'start_time' | 'course_code' = 'date',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const supabase = await createClient()
  
  // Get semester ID (required)
  const semester = filters?.semesterId || (await getCurrentSemester())?.id;
  if (!semester) {
    throw new Error('No semester found. Please specify a semester ID or set a current semester.');
  }
  
  // Calculate range for pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  // Build query with count - select specific columns for better performance
  let query = supabase
    .from('exam')
    .select(`
      id,
      course_code,
      exam_type,
      date,
      start_time,
      duration_minutes,
      room_codes,
      academic_semester_id,
      created_at,
      created_by,
      updated_at
    `, { count: 'exact' })
    .eq('academic_semester_id', semester)
  
  // Apply filters if provided
  if (filters?.courseCode) {
    query = query.eq('course_code', filters.courseCode)
  }
  if (filters?.examType) {
    query = query.eq('exam_type', filters.examType)
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

export async function getExamsByCourse(courseCode: string, semesterId?: string) {
  const supabase = await createClient();
  const semester = semesterId || (await getCurrentSemester())?.id;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester ID or set a current semester.');
  }
  
  const { data, error } = await supabase
    .from('exam')
    .select('*')
    .eq('course_code', courseCode)
    .eq('academic_semester_id', semester)
    .order('date', { ascending: true });
  
  if (error) throw error;
  return data as Exam[];
}

export async function getExamsByDate(date: string, semesterId?: string) {
  const supabase = await createClient();
  const semester = semesterId || (await getCurrentSemester())?.id;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester ID or set a current semester.');
  }
  
  const { data, error } = await supabase
    .from('exam')
    .select('*')
    .eq('date', date)
    .eq('academic_semester_id', semester)
    .order('start_time', { ascending: true });
  
  if (error) throw error;
  return data as Exam[];
}

export async function getExamsByDateRange(startDate: string, endDate: string, semesterId?: string) {
  const supabase = await createClient();
  const semester = semesterId || (await getCurrentSemester())?.id;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester ID or set a current semester.');
  }
  
  const { data, error } = await supabase
    .from('exam')
    .select('*')
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('academic_semester_id', semester)
    .order('date', { ascending: true })
    .order('start_time', { ascending: true });
  
  if (error) throw error;
  return data as Exam[];
}

export async function createExam(exam: ExamInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Validate semester_id is provided
  if (!exam.academic_semester_id) {
    const currentSemester = await getCurrentSemester();
    if (!currentSemester) {
      throw new Error('academic_semester_id is required. No current semester found.');
    }
    exam.academic_semester_id = currentSemester.id;
  }
  
  // Validate exam_type (must be one of the allowed values)
  if (!exam.exam_type || !['midterm', 'midterm2', 'final'].includes(exam.exam_type)) {
    throw new Error('exam_type is required and must be one of: midterm, midterm2, final');
  }
  
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

