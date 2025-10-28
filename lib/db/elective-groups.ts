// Database queries for elective groups
import { createClient } from '@/supabase/server'

export interface ElectiveGroup {
  id: string
  name: string
  required_credit_hours: number
  description: string | null
  created_at: string
  updated_at: string
}

export interface ElectiveGroupWithCourses extends ElectiveGroup {
  courses: Array<{
    code: string
    title: string
    credits: number
  }>
}

/**
 * Get all elective groups
 * @returns Array of elective groups
 */
export async function getElectiveGroups() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('elective_group')
    .select('*')
    .order('name')
  
  if (error) throw error
  return data as ElectiveGroup[]
}

/**
 * Get a single elective group by ID
 * @param id - The elective group ID
 * @returns The elective group
 */
export async function getElectiveGroupById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('elective_group')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) throw error
  return data as ElectiveGroup
}

/**
 * Get elective group with its courses
 * @param id - The elective group ID
 * @returns Elective group with list of courses
 */
export async function getElectiveGroupWithCourses(id: string) {
  const supabase = await createClient()
  
  // Get the group
  const { data: group, error: groupError } = await supabase
    .from('elective_group')
    .select('*')
    .eq('id', id)
    .single()
  
  if (groupError) throw groupError
  
  // Get courses in the group
  const { data: courses, error: coursesError } = await supabase
    .from('course')
    .select('code, title, credits')
    .eq('elective_group_id', id)
    .order('code')
  
  if (coursesError) throw coursesError
  
  return {
    ...group,
    courses: courses || []
  } as ElectiveGroupWithCourses
}

/**
 * Get all elective groups with their courses
 * @returns Array of elective groups with courses
 */
export async function getAllElectiveGroupsWithCourses() {
  const supabase = await createClient()
  
  // Get all groups
  const { data: groups, error: groupsError } = await supabase
    .from('elective_group')
    .select('*')
    .order('name')
  
  if (groupsError) throw groupsError
  
  // Get all elective courses
  const { data: courses, error: coursesError } = await supabase
    .from('course')
    .select('code, title, credits, elective_group_id')
    .eq('is_elective', true)
    .order('code')
  
  if (coursesError) throw coursesError
  
  // Group courses by elective_group_id
  const groupsWithCourses: ElectiveGroupWithCourses[] = groups.map(group => ({
    ...group,
    courses: courses
      .filter(c => c.elective_group_id === group.id)
      .map(c => ({
        code: c.code,
        title: c.title,
        credits: c.credits
      }))
  }))
  
  return groupsWithCourses
}

/**
 * Get elective courses by group name
 * @param groupName - The name of the elective group
 * @returns Array of courses in the group
 */
export async function getElectiveCoursesByGroupName(groupName: string) {
  const supabase = await createClient()
  
  // First get the group
  const { data: group, error: groupError } = await supabase
    .from('elective_group')
    .select('id')
    .eq('name', groupName)
    .single()
  
  if (groupError) throw groupError
  
  // Then get courses
  const { data: courses, error: coursesError } = await supabase
    .from('course')
    .select('*')
    .eq('elective_group_id', group.id)
    .order('code')
  
  if (coursesError) throw coursesError
  return courses
}

/**
 * Calculate total credits a student needs from each elective group
 * @param studentId - The student's user ID
 * @returns Array with group requirements and student progress
 */
export async function getStudentElectiveProgress(studentId: string) {
  const supabase = await createClient()
  
  // Get all elective groups
  const { data: groups, error: groupsError } = await supabase
    .from('elective_group')
    .select('*')
    .order('name')
  
  if (groupsError) throw groupsError
  
  // Get student's enrolled elective courses
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from('student_enrollment')
    .select(`
      section_id,
      section:section_id (
        course_code,
        course:course_code (
          code,
          title,
          credits,
          elective_group_id
        )
      )
    `)
    .eq('student_id', studentId)
  
  if (enrollmentsError) throw enrollmentsError
  
  // Calculate progress for each group
  const progress = groups.map(group => {
    const enrolledCourses = enrollments
      ?.filter(e => e.section?.course?.elective_group_id === group.id)
      .map(e => e.section?.course)
      .filter(Boolean) || []
    
    const earnedCredits = enrolledCourses.reduce((sum, course) => sum + (course?.credits || 0), 0)
    
    return {
      group_id: group.id,
      group_name: group.name,
      required_credits: group.required_credit_hours,
      earned_credits: earnedCredits,
      remaining_credits: Math.max(0, group.required_credit_hours - earnedCredits),
      is_complete: earnedCredits >= group.required_credit_hours,
      enrolled_courses: enrolledCourses
    }
  })
  
  return progress
}

