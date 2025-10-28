// Database queries for courses
import { createClient } from '@/supabase/server';
import { Course, CourseInput } from '@/lib/types/database';

export async function getCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .order('code');
  
  if (error) throw error;
  return data as Course[];
}

export async function getCourseByCode(code: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .eq('code', code)
    .single();
  
  if (error) throw error;
  return data as Course;
}

export async function getCoursesByLevel(level: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .eq('level', level)
    .order('code');
  
  if (error) throw error;
  return data as Course[];
}

export async function getElectiveCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .eq('is_elective', true)
    .order('code');
  
  if (error) throw error;
  return data as Course[];
}

export async function createCourse(course: CourseInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('course')
    .insert({ ...course, created_by: user?.id })
    .select()
    .single();
  
  if (error) throw error;
  return data as Course;
}

export async function updateCourse(code: string, updates: Partial<CourseInput>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course')
    .update(updates)
    .eq('code', code)
    .select()
    .single();
  
  if (error) throw error;
  return data as Course;
}

export async function deleteCourse(code: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('course')
    .delete()
    .eq('code', code);
  
  if (error) throw error;
}

/**
 * Get SWE department courses for scheduling (levels 4-8 only)
 * These are the courses managed by the scheduling algorithm
 * 
 * @returns Array of SWE courses in levels 4-8
 */
export async function getSWECoursesForScheduling() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .gte('level', 4)
    .lte('level', 8)
    .ilike('code', 'SWE%')
    .order('level', { ascending: true })
    .order('code', { ascending: true });
  
  if (error) throw error;
  return data as Course[];
}

/**
 * Get external department courses (non-SWE)
 * These are reference/mock courses, not scheduled by the system
 * 
 * @returns Array of external department courses
 */
export async function getExternalCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .not('code', 'ilike', 'SWE%')
    .order('level', { ascending: true })
    .order('code', { ascending: true });
  
  if (error) throw error;
  return data as Course[];
}

/**
 * Check if a course is schedulable by the system (SWE course in levels 4-8)
 * 
 * @param courseCode - Course code to check
 * @param level - Course level
 * @returns True if course should be scheduled by algorithm
 */
// Note: isSWESchedulableCourse has been moved to lib/utils/course-utils.ts
// to allow safe imports in Client Components

/**
 * Get all courses with their elective group information
 * @returns Array of courses with elective group details
 */
export async function getCoursesWithElectiveGroups() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('course')
    .select(`
      *,
      elective_group:elective_group_id (
        id,
        name,
        required_credit_hours
      )
    `)
    .order('level')
    .order('code')
  
  if (error) throw error
  return data
}

/**
 * Get elective courses by group ID
 * @param groupId - The elective group ID
 * @returns Array of courses in the elective group
 */
export async function getCoursesByElectiveGroup(groupId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .eq('elective_group_id', groupId)
    .order('code')
  
  if (error) throw error
  return data
}

/**
 * Get required (non-elective) courses by level
 * @param level - The level (1-8)
 * @returns Array of required courses for that level
 */
export async function getRequiredCoursesByLevel(level: number) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .eq('level', level)
    .eq('is_elective', false)
    .order('code')
  
  if (error) throw error
  return data
}

/**
 * Get paginated courses with optional search and sorting
 * Implements server-side pagination for optimal performance
 * 
 * @param page - Page number (1-based)
 * @param pageSize - Number of courses per page (default: 20)
 * @param searchTerm - Optional search term for filtering by code or title
 * @param sortBy - Field to sort by (default: 'code')
 * @param sortOrder - Sort direction: 'asc' or 'desc' (default: 'asc')
 * @returns Object containing courses array, total count, and total pages
 */
export async function getCoursesPaginated(
  page: number = 1,
  pageSize: number = 20,
  searchTerm?: string,
  sortBy: 'code' | 'title' | 'level' | 'credits' | 'weekly_hours' = 'code',
  sortOrder: 'asc' | 'desc' = 'asc'
) {
  const supabase = await createClient()
  
  // Calculate range for pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  
  // Build query with count
  let query = supabase
    .from('course')
    .select('*', { count: 'exact' })
  
  // Apply search filter if provided
  if (searchTerm && searchTerm.trim()) {
    const searchPattern = `%${searchTerm.trim()}%`
    query = query.or(`code.ilike.${searchPattern},title.ilike.${searchPattern}`)
  }
  
  // Apply sorting and pagination
  query = query.order(sortBy, { ascending: sortOrder === 'asc' }).range(from, to)
  
  const { data, error, count } = await query
  
  if (error) throw error
  
  const totalCount = count ?? 0
  const totalPages = Math.ceil(totalCount / pageSize)
  
  return {
    courses: data as Course[],
    totalCount,
    totalPages,
    currentPage: page,
    pageSize
  }
}

