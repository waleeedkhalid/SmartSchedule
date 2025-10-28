import { createClient } from '@/supabase/server'
import { notifyScheduleChange } from './notifications'

/**
 * Get all users who should be notified about a section change
 * This includes:
 * - The assigned instructor
 * - Students at the same level as the section
 * - Faculty members (for awareness)
 */
export async function getAffectedUsersBySection(sectionId: string) {
  const supabase = await createClient()

  // Get section details
  const { data: section, error: sectionError } = await supabase
    .from('sections')
    .select(`
      *,
      courses!inner(level)
    `)
    .eq('id', sectionId)
    .single()

  if (sectionError || !section) {
    console.error('Failed to fetch section:', sectionError)
    return []
  }

  const affectedUsers: string[] = []

  // Add assigned instructor
  if (section.instructor_id) {
    // Get instructor's user_id (if they have an account)
    const { data: instructor } = await supabase
      .from('instructors')
      .select('email')
      .eq('id', section.instructor_id)
      .single()

    if (instructor?.email) {
      // Try to find user by email
      const { data: userData } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', instructor.email)
        .single()

      if (userData?.id) {
        affectedUsers.push(userData.id)
      }
    }
  }

  // Add students at the same level
  const { data: students } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'student')

  if (students) {
    affectedUsers.push(...students.map(s => s.user_id))
  }

  // Add all faculty for awareness
  const { data: faculty } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'faculty')

  if (faculty) {
    affectedUsers.push(...faculty.map(f => f.user_id))
  }

  // Remove duplicates
  return [...new Set(affectedUsers)]
}

/**
 * Get all users who should be notified about an exam change
 */
export async function getAffectedUsersByExam(examId: string) {
  const supabase = await createClient()

  // Get exam details
  const { data: exam, error: examError } = await supabase
    .from('exams')
    .select(`
      *,
      courses!inner(level)
    `)
    .eq('id', examId)
    .single()

  if (examError || !exam) {
    console.error('Failed to fetch exam:', examError)
    return []
  }

  const affectedUsers: string[] = []

  // Add students at the same level
  const { data: students } = await supabase
    .from('user_roles')
    .select('user_id')
    .eq('role', 'student')

  if (students) {
    affectedUsers.push(...students.map(s => s.user_id))
  }

  // Add registrar and scheduling roles
  const { data: admin } = await supabase
    .from('user_roles')
    .select('user_id')
    .in('role', ['registrar', 'scheduling'])

  if (admin) {
    affectedUsers.push(...admin.map(a => a.user_id))
  }

  // Remove duplicates
  return [...new Set(affectedUsers)]
}

/**
 * Notify users when a section is updated
 */
export async function notifySectionUpdate(
  sectionId: string,
  courseCode: string,
  sectionNumber: string,
  details?: string
) {
  try {
    const affectedUsers = await getAffectedUsersBySection(sectionId)
    
    if (affectedUsers.length === 0) return

    await notifyScheduleChange(
      affectedUsers,
      'section_updated',
      {
        section_id: sectionId,
        course_code: courseCode,
        section_number: sectionNumber,
        details: details || 'Section details have been updated'
      }
    )

    console.log(`Notified ${affectedUsers.length} users about section update`)
  } catch (error) {
    console.error('Failed to send section update notifications:', error)
  }
}

/**
 * Notify users when a section is deleted
 */
export async function notifySectionDelete(
  courseCode: string,
  sectionNumber: string,
  level: number
) {
  try {
    const supabase = await createClient()
    
    // Get all students at this level and all faculty
    const { data: students } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'student')

    const { data: faculty } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'faculty')

    const affectedUsers = [
      ...(students?.map(s => s.user_id) || []),
      ...(faculty?.map(f => f.user_id) || [])
    ]

    if (affectedUsers.length === 0) return

    await notifyScheduleChange(
      affectedUsers,
      'section_deleted',
      {
        course_code: courseCode,
        section_number: sectionNumber,
        level,
        details: 'This section has been removed from the schedule'
      }
    )

    console.log(`Notified ${affectedUsers.length} users about section deletion`)
  } catch (error) {
    console.error('Failed to send section deletion notifications:', error)
  }
}

/**
 * Notify users when an exam is updated
 */
export async function notifyExamUpdate(
  examId: string,
  courseCode: string,
  details?: string
) {
  try {
    const affectedUsers = await getAffectedUsersByExam(examId)
    
    if (affectedUsers.length === 0) return

    await notifyScheduleChange(
      affectedUsers,
      'exam_updated',
      {
        exam_id: examId,
        course_code: courseCode,
        details: details || 'Exam schedule has been updated'
      }
    )

    console.log(`Notified ${affectedUsers.length} users about exam update`)
  } catch (error) {
    console.error('Failed to send exam update notifications:', error)
  }
}

/**
 * Notify users when an exam is deleted
 */
export async function notifyExamDelete(
  courseCode: string
) {
  try {
    const supabase = await createClient()
    
    // Get all students and registrar/scheduling roles
    const { data: students } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'student')

    const { data: admin } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['registrar', 'scheduling'])

    const affectedUsers = [
      ...(students?.map(s => s.user_id) || []),
      ...(admin?.map(a => a.user_id) || [])
    ]

    if (affectedUsers.length === 0) return

    await notifyScheduleChange(
      affectedUsers,
      'exam_deleted',
      {
        course_code: courseCode,
        details: 'This exam has been cancelled'
      }
    )

    console.log(`Notified ${affectedUsers.length} users about exam deletion`)
  } catch (error) {
    console.error('Failed to send exam deletion notifications:', error)
  }
}

/**
 * Notify users when schedule is released
 */
export async function notifyScheduleRelease(releaseTag: string) {
  try {
    const supabase = await createClient()
    
    // Get all users
    const { data: allUsers } = await supabase
      .from('user_roles')
      .select('user_id')

    const affectedUsers = allUsers?.map(u => u.user_id) || []

    if (affectedUsers.length === 0) return

    await notifyScheduleChange(
      affectedUsers,
      'schedule_released',
      {
        release_tag: releaseTag,
        details: `Schedule ${releaseTag} has been officially released`
      }
    )

    console.log(`Notified ${affectedUsers.length} users about schedule release`)
  } catch (error) {
    console.error('Failed to send schedule release notifications:', error)
  }
}

