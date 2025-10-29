/**
 * Database queries for sections
 * 
 * REFACTORED: Added semester context (REQUIRED for all queries)
 * - Added academic_semester_id to all query functions
 * - Added section_type support ('lecture' | 'lab' | 'tutorial')
 * - Using current_enrollment from database (cached via trigger)
 */
import { createClient } from '@/supabase/server';
import { Section, SectionInput, SectionConflicts } from '@/lib/types/database';
import { getCurrentSemester } from './semesters';

/**
 * Get all sections for a semester (DEPRECATED - use getSectionsPaginated instead)
 * @deprecated Use getSectionsPaginated for better performance
 * @param semesterId - Semester ID (defaults to current semester)
 */
export async function getSections(semesterId?: string) {
  const supabase = await createClient();
  const semester = semesterId || (await getCurrentSemester())?.id;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester ID or set a current semester.');
  }
  
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .eq('academic_semester_id', semester)
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
 * @param filters - Optional filters: { semesterId?, level?, state?, courseCode?, instructorId?, sectionType? }
 * @param sortBy - Field to sort by (default: 'course_code')
 * @param sortOrder - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns Object containing sections array, total count, and total pages
 */
export async function getSectionsPaginated(
  page: number = 1,
  pageSize: number = 20,
  filters?: {
    semesterId?: string
    level?: number
    state?: 'draft' | 'released'
    courseCode?: string
    instructorId?: string
    sectionType?: 'lecture' | 'lab' | 'tutorial'
  },
  sortBy: 'course_code' | 'section_no' | 'group_level' | 'state' = 'course_code',
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
  
  // Build query with count
  let query = supabase
    .from('section')
    .select(`
      id,
      course_code,
      section_no,
      section_type,
      instructor_id,
      room_code,
      capacity,
      current_enrollment,
      meeting_pattern,
      group_level,
      state,
      activity,
      academic_semester_id,
      created_at,
      created_by,
      updated_at
    `, { count: 'exact' })
    .eq('academic_semester_id', semester)
  
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
  if (filters?.sectionType) {
    query = query.eq('section_type', filters.sectionType)
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

export async function getSectionsByCourse(courseCode: string, semesterId?: string) {
  const supabase = await createClient();
  const semester = semesterId || (await getCurrentSemester())?.id;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester ID or set a current semester.');
  }
  
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .eq('course_code', courseCode)
    .eq('academic_semester_id', semester)
    .order('section_no');
  
  if (error) throw error;
  return data as Section[];
}

export async function getSectionsByInstructor(instructorId: string, semesterId?: string) {
  const supabase = await createClient();
  const semester = semesterId || (await getCurrentSemester())?.id;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester ID or set a current semester.');
  }
  
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .eq('instructor_id', instructorId)
    .eq('academic_semester_id', semester)
    .order('course_code');
  
  if (error) throw error;
  return data as Section[];
}

export async function getSectionsByLevel(level: number, semesterId?: string) {
  const supabase = await createClient();
  const semester = semesterId || (await getCurrentSemester())?.id;
  
  if (!semester) {
    throw new Error('No semester found. Please specify a semester ID or set a current semester.');
  }
  
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .eq('group_level', level)
    .eq('academic_semester_id', semester)
    .order('course_code');
  
  if (error) throw error;
  return data as Section[];
}

export async function createSection(section: SectionInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Validate semester_id is provided
  if (!section.academic_semester_id) {
    // Try to use current semester as default
    const currentSemester = await getCurrentSemester();
    if (!currentSemester) {
      throw new Error('academic_semester_id is required. No current semester found.');
    }
    section.academic_semester_id = currentSemester.id;
  }
  
  // Infer section_type from section_no suffix if not provided
  let sectionType = section.section_type;
  if (!sectionType && section.section_no) {
    if (section.section_no.endsWith('L')) sectionType = 'lecture';
    else if (section.section_no.endsWith('T')) sectionType = 'tutorial';
    else if (section.section_no.endsWith('B')) sectionType = 'lab';
    else sectionType = 'lecture'; // Default
  }
  
  const { data, error } = await supabase
    .from('section')
    .insert({ 
      ...section, 
      section_type: sectionType || 'lecture',
      created_by: user?.id 
    })
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

