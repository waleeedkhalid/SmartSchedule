/**
 * Database queries for academic semesters
 * 
 * REFACTORED: New file for semester management
 * Supports semester-based scheduling context
 */
import { createClient } from '@/supabase/server';

export interface Semester {
  id: string;
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  registration_start_date: string | null;
  registration_end_date: string | null;
  add_drop_deadline: string | null;
  status: 'planning' | 'registration_open' | 'active' | 'completed' | 'archived';
  is_current: boolean;
  created_at: string | null;
  created_by: string | null;
  updated_at: string | null;
}

export interface SemesterCreate {
  name: string;
  code: string;
  start_date: string;
  end_date: string;
  registration_start_date?: string;
  registration_end_date?: string;
  add_drop_deadline?: string;
  status?: 'planning' | 'registration_open' | 'active' | 'completed' | 'archived';
  is_current?: boolean;
}

export interface SemesterUpdate {
  name?: string;
  code?: string;
  start_date?: string;
  end_date?: string;
  registration_start_date?: string;
  registration_end_date?: string;
  add_drop_deadline?: string;
  status?: 'planning' | 'registration_open' | 'active' | 'completed' | 'archived';
  is_current?: boolean;
}

/**
 * Get the current active semester
 * @returns Current semester or null if no current semester is set
 */
export async function getCurrentSemester(): Promise<Semester | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('academic_semester')
    .select('*')
    .eq('is_current', true)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No current semester set
      return null;
    }
    throw error;
  }
  return data as Semester;
}

/**
 * Get all semesters, ordered by start_date descending (most recent first)
 * @returns Array of semesters
 */
export async function getSemesters(): Promise<Semester[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('academic_semester')
    .select('*')
    .order('start_date', { ascending: false });
  
  if (error) throw error;
  return data as Semester[];
}

/**
 * Get a specific semester by ID
 * @param id - Semester ID
 * @returns Semester or null if not found
 */
export async function getSemester(id: string): Promise<Semester | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('academic_semester')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data as Semester;
}

/**
 * Create a new semester
 * @param semesterData - Semester data
 * @returns Created semester
 */
export async function createSemester(semesterData: SemesterCreate): Promise<Semester> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('academic_semester')
    .insert({ 
      ...semesterData, 
      created_by: user?.id,
      status: semesterData.status || 'planning'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as Semester;
}

/**
 * Update an existing semester
 * @param id - Semester ID
 * @param updates - Fields to update
 * @returns Updated semester
 */
export async function updateSemester(id: string, updates: SemesterUpdate): Promise<Semester> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('academic_semester')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Semester;
}

/**
 * Delete a semester
 * @param id - Semester ID
 */
export async function deleteSemester(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('academic_semester')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

/**
 * Archive a semester (sets status to 'archived' and is_current to false)
 * Uses the database function archive_semester() if available
 * @param id - Semester ID
 * @returns Updated semester
 */
export async function archiveSemester(id: string): Promise<Semester> {
  const supabase = await createClient();
  
  // Try using database function first
  const { data: fnData, error: fnError } = await supabase
    .rpc('archive_semester', { semester_id: id });
  
  if (!fnError && fnData) {
    // Function succeeded, return the archived semester
    return await getSemester(id) as Semester;
  }
  
  // Fallback to direct update if function doesn't exist
  return await updateSemester(id, {
    status: 'archived',
    is_current: false
  });
}

/**
 * Check if registration is currently open for a semester
 * @param semesterId - Semester ID (defaults to current semester)
 * @returns True if registration is open
 */
export async function isRegistrationOpen(semesterId?: string): Promise<boolean> {
  const supabase = await createClient();
  const id = semesterId || (await getCurrentSemester())?.id;
  
  if (!id) return false;
  
  // Try database function first
  const { data: fnData, error: fnError } = await supabase
    .rpc('is_registration_open', { semester_id: id });
  
  if (!fnError && fnData !== null) {
    return fnData;
  }
  
  // Fallback to manual check
  const semester = await getSemester(id);
  if (!semester || semester.status !== 'registration_open') return false;
  
  const now = new Date();
  const start = semester.registration_start_date ? new Date(semester.registration_start_date) : null;
  const end = semester.registration_end_date ? new Date(semester.registration_end_date) : null;
  
  if (!start || !end) return false;
  
  return now >= start && now <= end;
}

/**
 * Check if add/drop period is currently open for a semester
 * @param semesterId - Semester ID (defaults to current semester)
 * @returns True if add/drop is open
 */
export async function isAddDropOpen(semesterId?: string): Promise<boolean> {
  const supabase = await createClient();
  const id = semesterId || (await getCurrentSemester())?.id;
  
  if (!id) return false;
  
  // Try database function first
  const { data: fnData, error: fnError } = await supabase
    .rpc('is_add_drop_open', { semester_id: id });
  
  if (!fnError && fnData !== null) {
    return fnData;
  }
  
  // Fallback to manual check
  const semester = await getSemester(id);
  if (!semester || semester.status !== 'active') return false;
  
  const now = new Date();
  const deadline = semester.add_drop_deadline ? new Date(semester.add_drop_deadline) : null;
  
  if (!deadline) return false;
  
  return now <= deadline;
}

/**
 * Get semesters by status
 * @param status - Semester status
 * @returns Array of semesters
 */
export async function getSemestersByStatus(
  status: 'planning' | 'registration_open' | 'active' | 'completed' | 'archived'
): Promise<Semester[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('academic_semester')
    .select('*')
    .eq('status', status)
    .order('start_date', { ascending: false });
  
  if (error) throw error;
  return data as Semester[];
}

/**
 * Set a semester as current (and unset all others)
 * @param id - Semester ID
 * @returns Updated semester
 */
export async function setCurrentSemester(id: string): Promise<Semester> {
  const supabase = await createClient();
  
  // First, unset all current semesters
  await supabase
    .from('academic_semester')
    .update({ is_current: false })
    .eq('is_current', true);
  
  // Then set the new current semester
  const { data, error } = await supabase
    .from('academic_semester')
    .update({ is_current: true })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Semester;
}

