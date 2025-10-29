import { createClient } from '@/supabase/server'

/**
 * Get comprehensive statistics for all courses
 */
export async function getCourseStatistics() {
  const supabase = await createClient()

  const { data: courses, error: coursesError } = await supabase
    .from('course')
    .select(`
      *,
      section(
        id,
        section_no,
        instructor_id,
        room_code,
        meeting_pattern,
        instructor:instructor!section_instructor_id_fkey(name),
        room:room!section_room_code_fkey(code)
      )
    `)
    .order('code')

  if (coursesError) throw coursesError

  // Calculate statistics for each course
  const stats = courses?.map(course => {
    const sections = course.section || []
    const sectionCount = sections.length
    const assignedSections = sections.filter((s: any) => s.instructor_id && s.room_code).length
    const labSections = sections.filter((s: any) => s.meeting_pattern?.is_lab).length
    const lectureSections = sectionCount - labSections
    
    // Calculate average section capacity (using capacity from section, not room)
    const sectionCapacities = sections
      .filter((s: any) => s.capacity)
      .map((s: any) => s.capacity)
    const avgCapacity = sectionCapacities.length > 0
      ? sectionCapacities.reduce((sum: number, cap: number) => sum + cap, 0) / sectionCapacities.length
      : 0

    // Get unique instructors
    const uniqueInstructors = new Set(
      sections
        .filter((s: any) => s.instructor_id)
        .map((s: any) => s.instructor_id)
    )

    return {
      code: course.code,
      name: course.title,
      level: course.level,
      credits: course.credits,
      type: course.is_elective ? 'Elective' : 'Required',
      sectionCount,
      assignedSections,
      labSections,
      lectureSections,
      instructorCount: uniqueInstructors.size,
      avgCapacity: Math.round(avgCapacity),
      completionRate: sectionCount > 0 ? (assignedSections / sectionCount) * 100 : 0
    }
  }) || []

  return stats
}

/**
 * Get detailed information for a specific course
 */
export async function getCourseDetails(courseCode: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('course')
    .select(`
      *,
      section(
        id,
        section_no,
        meeting_pattern,
        state,
        capacity,
        instructor:instructor!section_instructor_id_fkey(id, name, email),
        room:room!section_room_code_fkey(code, type)
      )
    `)
    .eq('code', courseCode)
    .single()

  if (error) throw error
  return data
}

/**
 * Get course distribution by type
 */
export async function getCourseDistributionByType() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('course')
    .select('is_elective')

  if (error) throw error

  // Count courses by type (elective vs required)
  const distribution = data?.reduce((acc: Record<string, number>, course: any) => {
    const type = course.is_elective ? 'Elective' : 'Required'
    acc[type] = (acc[type] || 0) + 1
    return acc
  }, {})

  return Object.entries(distribution || {}).map(([type, count]) => ({
    type,
    count
  }))
}

/**
 * Get section utilization statistics
 */
export async function getSectionUtilization() {
  const supabase = await createClient()

  const { data: sections, error } = await supabase
    .from('section')
    .select(`
      id,
      course_code,
      instructor_id,
      room_code,
      state,
      capacity
    `)

  if (error) throw error

  const total = sections?.length || 0
  const assigned = sections?.filter((s: any) => s.instructor_id && s.room_code).length || 0
  const draft = sections?.filter((s: any) => s.state === 'draft').length || 0
  const released = sections?.filter((s: any) => s.state === 'released').length || 0

  return {
    total,
    assigned,
    unassigned: total - assigned,
    draft,
    released,
    assignmentRate: total > 0 ? (assigned / total) * 100 : 0
  }
}

/**
 * Get courses with most sections
 */
export async function getTopCoursesBySections(limit: number = 10) {
  const supabase = await createClient()

  const { data: courses, error } = await supabase
    .from('course')
    .select(`
      code,
      title,
      level,
      section(id)
    `)

  if (error) throw error

  // Count sections and sort
  const coursesWithCounts = courses?.map(course => ({
    code: course.code,
    name: course.title,
    level: course.level,
    sectionCount: course.section?.length || 0
  }))
    .sort((a, b) => b.sectionCount - a.sectionCount)
    .slice(0, limit)

  return coursesWithCounts || []
}

/**
 * Get instructor workload by course
 */
export async function getInstructorWorkloadByCourse() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('section')
    .select(`
      course_code,
      instructor_id,
      instructor:instructor!section_instructor_id_fkey!inner(name),
      course:course!section_course_code_fkey!inner(title, credits)
    `)
    .not('instructor_id', 'is', null)

  if (error) throw error

  // Group by course
  const courseMap = new Map<string, {
    courseName: string
    credits: number
    instructors: Map<string, { name: string; sectionCount: number }>
  }>()

  data?.forEach((section: any) => {
    const courseCode = section.course_code
    const instructorId = section.instructor_id
    const instructorName = section.instructor.name
    const courseName = section.course.title
    const credits = section.course.credits || 3

    if (!courseMap.has(courseCode)) {
      courseMap.set(courseCode, {
        courseName,
        credits,
        instructors: new Map()
      })
    }

    const course = courseMap.get(courseCode)!
    if (!course.instructors.has(instructorId)) {
      course.instructors.set(instructorId, { name: instructorName, sectionCount: 0 })
    }

    course.instructors.get(instructorId)!.sectionCount++
  })

  // Convert to array format
  const result = Array.from(courseMap.entries()).map(([code, data]) => ({
    courseCode: code,
    courseName: data.courseName,
    credits: data.credits,
    instructors: Array.from(data.instructors.entries()).map(([id, instructor]) => ({
      id,
      name: instructor.name,
      sectionCount: instructor.sectionCount
    }))
  }))

  return result
}

