// Database queries for sections
import { createClient } from '@/supabase/server';
import { Section, SectionInput, SectionConflicts } from '@/lib/types/database';

/**
 * Get all sections (DEPRECATED - use getSectionsPaginated instead)
 * @deprecated Use getSectionsPaginated for better performance
 */
export async function getSections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .order('course_code');
  
  if (error) throw error;
  return data as Section[];
}

/**
 * Get paginated sections with optional filtering and sorting
 * Implements server-side pagination for optimal performance
 * 
 * @param page - Page number (1-based)
 * @param pageSize - Number of sections per page (default: 20)
 * @param filters - Optional filters: { level?, state?, courseCode?, instructorId? }
 * @param sortBy - Field to sort by (default: 'course_code')
 * @param sortOrder - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns Object containing sections array, total count, and total pages
 */
export async function getSectionsPaginated(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    level?: number
    state?: 'draft' | 'released'
    courseCode?: string
    instructorId?: string
  },
  sortBy: 'course_code' | 'section_no' | 'group_level' | 'state' = 'course_code',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const supabase = await createClient()
  
  // Calculate range for pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  // Build query with count
  let query = supabase
    .from('section')
    .select(`
      id,
      course_code,
      section_no,
      instructor_id,
      room_code,
      capacity,
      meeting_pattern,
      group_level,
      state,
      created_at,
      updated_at
    `, { count: 'exact' })
  
  // Apply filters if provided
  if (filters?.level) {
    query = query.eq('group_level', filters.level)
  }
  if (filters?.state) {
    query = query.eq('state', filters.state)
  }
  if (filters?.courseCode) {
    query = query.eq('course_code', filters.courseCode)
  }
  if (filters?.instructorId) {
    query = query.eq('instructor_id', filters.instructorId)
  }
  
  // Apply sorting and pagination
  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to)
  
  const { data, error, count } = await query
  
  if (error) throw error
  
  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)
  
  return {
    sections: data as Section[],
    totalCount,
    totalPages,
    currentPage: page,
    pageSize
  }
}

export async function getSectionById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Section;
}

export async function getSectionsByCourse(courseCode: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .eq('course_code', courseCode)
    .order('section_no');
  
  if (error) throw error;
  return data as Section[];
}

export async function getSectionsByInstructor(instructorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('course_code');
  
  if (error) throw error;
  return data as Section[];
}

export async function getSectionsByLevel(level: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .eq('group_level', level)
    .order('course_code');
  
  if (error) throw error;
  return data as Section[];
}

export async function createSection(section: SectionInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('section')
    .insert({ ...section, created_by: user?.id })
    .select()
    .single();
  
  if (error) throw error;
  return data as Section;
}

export async function updateSection(id: string, updates: Partial<SectionInput>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Section;
}

export async function deleteSection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('section')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function getSectionConflicts(sectionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_section_conflicts', { p_section_id: sectionId });
  
  if (error) throw error;
  return data as SectionConflicts;
}

export async function getAllScheduleConflicts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_all_schedule_conflicts');
  
  if (error) throw error;
  return data as SectionConflicts[];
}

/**
 * Get sections for SWE courses only (for scheduling algorithm)
 * Filters to SWE courses in levels 4-8
 * 
 * @param state - Section state to filter by (default: 'draft')
 * @returns Array of SWE course sections ready for scheduling
 */
export async function getSWESectionsForScheduling(state: 'draft' | 'released' = 'draft') {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section')
    .select(`
      *,
      course:course!section_course_code_fkey(code, level),
      course_offering:course_offering(semester_code, is_active, semester:academic_semesters(*))
    `)
    .eq('state', state)
    .eq('is_scheduled_by_algorithm', true); // Use new explicit field instead of code filtering
  
  if (error) throw error;
  return data as Section[];
}

