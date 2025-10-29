import { createClient } from '@/supabase/server'
import type { Tables, TablesInsert, TablesUpdate } from '@/lib/types/database'

type CourseOffering = Tables<'course_offering'>
type CourseOfferingInput = TablesInsert<'course_offering'>
type CourseOfferingUpdate = TablesUpdate<'course_offering'>

/**
 * Get all active course offerings
 * @returns Array of active course offerings with course and semester details
 */
export async function getActiveCourseOfferings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('course_offering')
    .select(`
      *,
      course:course(*),
      semester:academic_semesters(*)
    `)
    .eq('is_active', true)
    .order('semester_code')
    .order('course_code')
  
  if (error) throw error
  return data
}

/**
 * Get course offerings for a specific semester
 * @param semesterCode - The semester code (e.g., '471', '472')
 * @returns Array of course offerings for the semester
 */
export async function getCourseOfferingsBySemester(semesterCode: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('course_offering')
    .select(`
      *,
      course:course(*),
      semester:academic_semesters(*)
    `)
    .eq('semester_code', semesterCode)
    .order('course_code')
  
  if (error) throw error
  return data
}

/**
 * Get course offering by ID
 * @param id - Course offering UUID
 * @returns Course offering with related data
 */
export async function getCourseOfferingById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('course_offering')
    .select(`
      *,
      course:course(*),
      semester:academic_semesters(*)
    `)
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as CourseOffering
}

/**
 * Create a new course offering
 * @param offering - Course offering data
 * @returns Created course offering
 */
export async function createCourseOffering(offering: CourseOfferingInput) {
  const supabase = await createClient()
  
  // Get current user for created_by field
  const { data: { user } } = await supabase.auth.getUser()
  
  const { data, error } = await supabase
    .from('course_offering')
    .insert({
      ...offering,
      created_by: user?.id
    })
    .select()
    .single()
  
  if (error) throw error
  return data as CourseOffering
}

/**
 * Update a course offering
 * @param id - Course offering UUID
 * @param updates - Fields to update
 * @returns Updated course offering
 */
export async function updateCourseOffering(id: string, updates: CourseOfferingUpdate) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('course_offering')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data as CourseOffering
}

/**
 * Delete a course offering
 * @param id - Course offering UUID
 */
export async function deleteCourseOffering(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('course_offering')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

/**
 * Check if a course is offered in a specific semester
 * @param courseCode - Course code
 * @param semesterCode - Semester code
 * @returns True if course is offered in the semester
 */
export async function isCourseOfferedInSemester(courseCode: string, semesterCode: string): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('course_offering')
    .select('id')
    .eq('course_code', courseCode)
    .eq('semester_code', semesterCode)
    .eq('is_active', true)
    .maybeSingle()
  
  if (error) throw error
  return data !== null
}

/**
 * Bulk create course offerings for a semester
 * @param courseCodes - Array of course codes
 * @param semesterCode - Semester code
 * @returns Array of created course offerings
 */
export async function bulkCreateCourseOfferings(courseCodes: string[], semesterCode: string) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  const offerings = courseCodes.map(courseCode => ({
    course_code: courseCode,
    semester_code: semesterCode,
    is_active: true,
    created_by: user?.id
  }))
  
  const { data, error } = await supabase
    .from('course_offering')
    .insert(offerings)
    .select()
  
  if (error) throw error
  return data
}

