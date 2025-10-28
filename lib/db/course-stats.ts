import { createClient } from '@/supabase/server'

/**
 * Get comprehensive statistics for all courses
 */
export async function getCourseStatistics() {
  const supabase = await createClient()

  const { data: courses, error: coursesError } = await supabase
    .from('courses')
    .select(`
      *,
      sections(
        id,
        section_number,
        instructor_id,
        room_id,
        meeting_days,
        start_time,
        end_time,
        is_lab,
        instructors(name),
        rooms(name, capacity)
      )
    `)
    .order('code')

  if (coursesError) throw coursesError

  // Calculate statistics for each course
  const stats = courses?.map(course => {
    const sections = course.sections || []
    const sectionCount = sections.length
    const assignedSections = sections.filter((s: any) => s.instructor_id && s.room_id).length
    const labSections = sections.filter((s: any) => s.is_lab).length
    const lectureSections = sectionCount - labSections
    
    // Calculate average room capacity
    const roomCapacities = sections
      .filter((s: any) => s.rooms?.capacity)
      .map((s: any) => s.rooms.capacity)
    const avgCapacity = roomCapacities.length > 0
      ? roomCapacities.reduce((sum: number, cap: number) => sum + cap, 0) / roomCapacities.length
      : 0

    // Get unique instructors
    const uniqueInstructors = new Set(
      sections
        .filter((s: any) => s.instructor_id)
        .map((s: any) => s.instructor_id)
    )

    return {
      code: course.code,
      name: course.name,
      level: course.level,
      credits: course.credits,
      type: course.type,
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
    .from('courses')
    .select(`
      *,
      sections(
        id,
        section_number,
        meeting_days,
        start_time,
        end_time,
        is_lab,
        status,
        instructors(id, name, email),
        rooms(id, name, capacity, type)
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
    .from('courses')
    .select('type')

  if (error) throw error

  // Count courses by type
  const distribution = data?.reduce((acc: Record<string, number>, course: any) => {
    const type = course.type || 'unknown'
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
    .from('sections')
    .select(`
      id,
      course_code,
      instructor_id,
      room_id,
      status,
      rooms(capacity)
    `)

  if (error) throw error

  const total = sections?.length || 0
  const assigned = sections?.filter((s: any) => s.instructor_id && s.room_id).length || 0
  const draft = sections?.filter((s: any) => s.status === 'draft').length || 0
  const released = sections?.filter((s: any) => s.status === 'released').length || 0

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
    .from('courses')
    .select(`
      code,
      name,
      level,
      sections(id)
    `)

  if (error) throw error

  // Count sections and sort
  const coursesWithCounts = courses?.map(course => ({
    code: course.code,
    name: course.name,
    level: course.level,
    sectionCount: course.sections?.length || 0
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
    .from('sections')
    .select(`
      course_code,
      instructor_id,
      instructors!inner(name),
      courses!inner(name, credits)
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
    const instructorName = section.instructors.name
    const courseName = section.courses.name
    const credits = section.courses.credits || 3

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

