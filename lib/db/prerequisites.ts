// Database queries for course prerequisites
import { createClient } from '@/supabase/server'

export interface Prerequisite {
  id: string
  course_code: string
  prerequisite_code: string
  created_at: string
}

export interface CourseWithPrerequisites {
  code: string
  title: string
  prerequisites: Array<{
    code: string
    title: string
  }>
}

/**
 * Get all prerequisites for a course
 * @param courseCode - The course code
 * @returns Array of prerequisite courses
 */
export async function getCoursePrerequisites(courseCode: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('course_prerequisite')
    .select(`
      prerequisite_code,
      prerequisite:prerequisite_code (
        code,
        title,
        level
      )
    `)
    .eq('course_code', courseCode)
  
  if (error) throw error
  
  return data.map(item => item.prerequisite).filter(Boolean)
}

/**
 * Get all courses that have this course as a prerequisite
 * @param courseCode - The course code
 * @returns Array of courses that require this course
 */
export async function getCourseDependents(courseCode: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('course_prerequisite')
    .select(`
      course_code,
      course:course_code (
        code,
        title,
        level
      )
    `)
    .eq('prerequisite_code', courseCode)
  
  if (error) throw error
  
  return data.map(item => item.course).filter(Boolean)
}

/**
 * Check if a student has completed all prerequisites for a course
 * @param studentId - The student's user ID
 * @param courseCode - The course code to check
 * @returns Object with completion status and missing prerequisites
 */
export async function checkStudentPrerequisites(studentId: string, courseCode: string) {
  const supabase = await createClient()
  
  // Get all prerequisites for the course
  const prerequisites = await getCoursePrerequisites(courseCode)
  
  if (prerequisites.length === 0) {
    return {
      has_all_prerequisites: true,
      missing_prerequisites: [],
      completed_prerequisites: []
    }
  }
  
  // Get student's completed courses (from enrollments)
  const { data: enrollments, error } = await supabase
    .from('student_enrollment')
    .select(`
      section:section_id (
        course_code
      )
    `)
    .eq('student_id', studentId)
  
  if (error) throw error
  
  const completedCourseCodes = new Set(
    enrollments?.map(e => e.section?.course_code).filter(Boolean) || []
  )
  
  // Check which prerequisites are missing
  const missingPrerequisites = prerequisites.filter(
    prereq => !completedCourseCodes.has(prereq.code)
  )
  
  const completedPrerequisites = prerequisites.filter(
    prereq => completedCourseCodes.has(prereq.code)
  )
  
  return {
    has_all_prerequisites: missingPrerequisites.length === 0,
    missing_prerequisites: missingPrerequisites,
    completed_prerequisites: completedPrerequisites
  }
}

/**
 * Get all courses with their prerequisites
 * @returns Array of courses with prerequisite information
 */
export async function getAllCoursesWithPrerequisites() {
  const supabase = await createClient()
  
  // Get all courses
  const { data: courses, error: coursesError } = await supabase
    .from('course')
    .select('code, title, level')
    .order('level')
    .order('code')
  
  if (coursesError) throw coursesError
  
  // Get all prerequisites
  const { data: prerequisites, error: prereqError } = await supabase
    .from('course_prerequisite')
    .select(`
      course_code,
      prerequisite_code,
      prerequisite:prerequisite_code (
        code,
        title
      )
    `)
  
  if (prereqError) throw prereqError
  
  // Map prerequisites to courses
  const coursesWithPrereqs: CourseWithPrerequisites[] = courses.map(course => ({
    code: course.code,
    title: course.title,
    prerequisites: prerequisites
      .filter(p => p.course_code === course.code)
      .map(p => ({
        code: p.prerequisite?.code || '',
        title: p.prerequisite?.title || ''
      }))
      .filter(p => p.code)
  }))
  
  return coursesWithPrereqs
}

/**
 * Get available courses for a student based on completed prerequisites
 * @param studentId - The student's user ID
 * @param level - Optional: filter by student level
 * @returns Array of courses the student can take
 */
export async function getAvailableCoursesForStudent(studentId: string, level?: number) {
  const supabase = await createClient()
  
  // Get all courses (optionally filtered by level)
  let query = supabase
    .from('course')
    .select('code, title, level, credits, is_elective')
    .order('level')
    .order('code')
  
  if (level !== undefined) {
    query = query.eq('level', level)
  }
  
  const { data: courses, error: coursesError } = await query
  
  if (coursesError) throw coursesError
  
  // Check prerequisites for each course
  const availableCourses = []
  
  for (const course of courses) {
    const { has_all_prerequisites } = await checkStudentPrerequisites(studentId, course.code)
    
    if (has_all_prerequisites) {
      availableCourses.push(course)
    }
  }
  
  return availableCourses
}

/**
 * Add a prerequisite relationship
 * @param courseCode - The course that requires the prerequisite
 * @param prerequisiteCode - The prerequisite course
 */
export async function addPrerequisite(courseCode: string, prerequisiteCode: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('course_prerequisite')
    .insert({ course_code: courseCode, prerequisite_code: prerequisiteCode })
    .select()
    .single()
  
  if (error) throw error
  return data
}

/**
 * Remove a prerequisite relationship
 * @param courseCode - The course code
 * @param prerequisiteCode - The prerequisite to remove
 */
export async function removePrerequisite(courseCode: string, prerequisiteCode: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('course_prerequisite')
    .delete()
    .eq('course_code', courseCode)
    .eq('prerequisite_code', prerequisiteCode)
  
  if (error) throw error
}

/**
 * Get prerequisite chain for a course (recursive)
 * Returns all prerequisites and their prerequisites
 * @param courseCode - The course code
 * @returns Array of all prerequisite courses in the chain
 */
export async function getPrerequisiteChain(courseCode: string) {
  const supabase = await createClient()
  const visited = new Set<string>()
  const chain: Array<{ code: string; title: string; level: number }> = []
  
  async function traverse(code: string) {
    if (visited.has(code)) return
    visited.add(code)
    
    const prereqs = await getCoursePrerequisites(code)
    
    for (const prereq of prereqs) {
      if (!visited.has(prereq.code)) {
        chain.push(prereq)
        await traverse(prereq.code)
      }
    }
  }
  
  await traverse(courseCode)
  
  return chain
}

