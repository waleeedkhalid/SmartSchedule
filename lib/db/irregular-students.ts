/**
 * Irregular Students Database Access Layer
 * 
 * Purpose: Manage students with custom required course lists
 * 
 * Key Concepts:
 * - Regular students: Follow level-based curriculum (auto-enrolled in all required courses for their level)
 * - Irregular students: Have custom required course lists defined by registrar
 * - Use cases: Transfer students, special programs, students with course substitutions
 * 
 * Data Flow:
 * 1. Registrar identifies student needing custom curriculum
 * 2. Registrar specifies exact required courses for that student
 * 3. System uses custom list instead of level-based auto-enrollment
 */

import { createClient } from '@/supabase/server'

export interface IrregularStudent {
  id: string
  student_id: string
  required_course_codes: string[]
  notes: string | null
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface IrregularStudentView extends IrregularStudent {
  student_name: string
  student_email: string
  student_level: number | null
}

export interface IrregularStudentInput {
  student_id: string
  required_course_codes: string[]
  notes?: string
}

/**
 * Get all irregular students with student details
 * @returns Array of irregular students with joined user info
 */
export async function getAllIrregularStudents(): Promise<IrregularStudentView[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('irregular_student')
    .select(`
      *,
      student:user_roles!irregular_student_student_id_fkey(
        name,
        email,
        level
      )
    `)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  
  // Transform to view interface
  return (data || []).map((item: any) => ({
    id: item.id,
    student_id: item.student_id,
    required_course_codes: item.required_course_codes,
    notes: item.notes,
    created_at: item.created_at,
    updated_at: item.updated_at,
    created_by: item.created_by,
    student_name: item.student?.name || 'Unknown',
    student_email: item.student?.email || 'Unknown',
    student_level: item.student?.level || null,
  }))
}

/**
 * Get a specific irregular student by student ID
 * @param studentId - UUID of the student
 * @returns Irregular student record with details or null
 */
export async function getIrregularStudent(studentId: string): Promise<IrregularStudentView | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('irregular_student')
    .select(`
      *,
      student:user_roles!irregular_student_student_id_fkey(
        name,
        email,
        level
      )
    `)
    .eq('student_id', studentId)
    .maybeSingle()
  
  if (error) throw error
  if (!data) return null
  
  return {
    id: data.id,
    student_id: data.student_id,
    required_course_codes: data.required_course_codes,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at,
    created_by: data.created_by,
    student_name: data.student?.name || 'Unknown',
    student_email: data.student?.email || 'Unknown',
    student_level: data.student?.level || null,
  }
}

/**
 * Get irregular student by record ID
 * @param id - UUID of the irregular_student record
 * @returns Irregular student record or null
 */
export async function getIrregularStudentById(id: string): Promise<IrregularStudentView | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('irregular_student')
    .select(`
      *,
      student:user_roles!irregular_student_student_id_fkey(
        name,
        email,
        level
      )
    `)
    .eq('id', id)
    .maybeSingle()
  
  if (error) throw error
  if (!data) return null
  
  return {
    id: data.id,
    student_id: data.student_id,
    required_course_codes: data.required_course_codes,
    notes: data.notes,
    created_at: data.created_at,
    updated_at: data.updated_at,
    created_by: data.created_by,
    student_name: data.student?.name || 'Unknown',
    student_email: data.student?.email || 'Unknown',
    student_level: data.student?.level || null,
  }
}

/**
 * Create a new irregular student record
 * @param data - Irregular student data
 * @param createdBy - UUID of user creating the record
 * @returns Created irregular student record
 */
export async function createIrregularStudent(
  data: IrregularStudentInput,
  createdBy: string
): Promise<IrregularStudent> {
  const supabase = await createClient()
  
  // Verify student exists and has student role
  const { data: student, error: studentError } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', data.student_id)
    .single()
  
  if (studentError || !student) {
    throw new Error('Student not found')
  }
  
  if (student.role !== 'student') {
    throw new Error('User must have student role')
  }
  
  // Check if student is already irregular
  const existing = await getIrregularStudent(data.student_id)
  if (existing) {
    throw new Error('Student already has custom curriculum')
  }
  
  // Verify all course codes exist
  if (data.required_course_codes.length > 0) {
    const { data: courses, error: coursesError } = await supabase
      .from('course')
      .select('code')
      .in('code', data.required_course_codes)
    
    if (coursesError) throw coursesError
    
    const foundCodes = courses?.map(c => c.code) || []
    const missingCodes = data.required_course_codes.filter(code => !foundCodes.includes(code))
    
    if (missingCodes.length > 0) {
      throw new Error(`Invalid course codes: ${missingCodes.join(', ')}`)
    }
  }
  
  // Create record
  const { data: created, error } = await supabase
    .from('irregular_student')
    .insert({
      student_id: data.student_id,
      required_course_codes: data.required_course_codes,
      notes: data.notes || null,
      created_by: createdBy,
    })
    .select()
    .single()
  
  if (error) throw error
  
  return created
}

/**
 * Update an irregular student record
 * @param id - UUID of the irregular_student record
 * @param data - Updated data
 * @returns Updated irregular student record
 */
export async function updateIrregularStudent(
  id: string,
  data: Partial<IrregularStudentInput>
): Promise<IrregularStudent> {
  const supabase = await createClient()
  
  // If updating course codes, verify they exist
  if (data.required_course_codes && data.required_course_codes.length > 0) {
    const { data: courses, error: coursesError } = await supabase
      .from('course')
      .select('code')
      .in('code', data.required_course_codes)
    
    if (coursesError) throw coursesError
    
    const foundCodes = courses?.map(c => c.code) || []
    const missingCodes = data.required_course_codes.filter(code => !foundCodes.includes(code))
    
    if (missingCodes.length > 0) {
      throw new Error(`Invalid course codes: ${missingCodes.join(', ')}`)
    }
  }
  
  const { data: updated, error } = await supabase
    .from('irregular_student')
    .update({
      ...(data.required_course_codes && { required_course_codes: data.required_course_codes }),
      ...(data.notes !== undefined && { notes: data.notes }),
    })
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  
  return updated
}

/**
 * Delete an irregular student record
 * @param id - UUID of the irregular_student record
 * @returns Success status
 */
export async function deleteIrregularStudent(id: string): Promise<void> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('irregular_student')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

/**
 * Check if a student is irregular
 * @param studentId - UUID of the student
 * @returns True if student has custom curriculum
 */
export async function isIrregularStudent(studentId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data } = await supabase.rpc('is_irregular_student', {
    p_student_id: studentId
  })
  
  return data || false
}

/**
 * Get required courses for a student
 * Uses custom list for irregular students, level-based for regular students
 * @param studentId - UUID of the student
 * @returns Array of course codes
 */
export async function getStudentRequiredCourses(studentId: string): Promise<string[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase.rpc('get_student_required_courses', {
    p_student_id: studentId
  })
  
  if (error) throw error
  
  return data || []
}

/**
 * Get all students who are NOT irregular (regular students)
 * Useful for dropdown selection when adding new irregular students
 * @returns Array of students who follow standard curriculum
 */
export async function getRegularStudents() {
  const supabase = await createClient()
  
  // Get all students
  const { data: allStudents, error: studentsError } = await supabase
    .from('user_roles')
    .select('user_id, name, email, level')
    .eq('role', 'student')
    .order('name', { ascending: true })
  
  if (studentsError) throw studentsError
  
  // Get all irregular student IDs
  const { data: irregularIds, error: irregularError } = await supabase
    .from('irregular_student')
    .select('student_id')
  
  if (irregularError) throw irregularError
  
  const irregularSet = new Set(irregularIds?.map(i => i.student_id) || [])
  
  // Filter out irregular students
  return (allStudents || []).filter(s => !irregularSet.has(s.user_id))
}

