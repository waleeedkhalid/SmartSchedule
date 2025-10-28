import { createClient } from '@/supabase/server'

/**
 * Get comprehensive statistics grouped by course level
 */
export async function getLevelStatistics() {
  const supabase = await createClient()

  // Get course counts by level
  const { data: courseCounts, error: courseError } = await supabase
    .from('courses')
    .select('level')
    .order('level')

  if (courseError) throw courseError

  // Get section counts by level (through courses)
  const { data: sections, error: sectionsError } = await supabase
    .from('sections')
    .select('course_code, courses!inner(level)')
    .order('courses.level')

  if (sectionsError) throw sectionsError

  // Get instructor assignments by level
  const { data: instructorAssignments, error: instructorError } = await supabase
    .from('sections')
    .select('instructor_id, courses!inner(level)')
    .not('instructor_id', 'is', null)

  if (instructorError) throw instructorError

  // Get conflicts by level
  const { data: allSections, error: allSectionsError } = await supabase
    .from('sections')
    .select(`
      id,
      course_code,
      section_number,
      meeting_days,
      start_time,
      end_time,
      room_id,
      instructor_id,
      courses!inner(level)
    `)

  if (allSectionsError) throw allSectionsError

  // Process data
  const levelMap = new Map<number, {
    courseCount: number
    sectionCount: number
    instructorCount: number
    conflictCount: number
    averageSectionsPerCourse: number
  }>()

  // Count courses by level
  courseCounts?.forEach((course: any) => {
    const level = course.level
    if (!levelMap.has(level)) {
      levelMap.set(level, {
        courseCount: 0,
        sectionCount: 0,
        instructorCount: 0,
        conflictCount: 0,
        averageSectionsPerCourse: 0
      })
    }
    const stats = levelMap.get(level)!
    stats.courseCount++
  })

  // Count sections by level
  sections?.forEach((section: any) => {
    const level = section.courses.level
    if (levelMap.has(level)) {
      levelMap.get(level)!.sectionCount++
    }
  })

  // Count unique instructors by level
  const instructorsByLevel = new Map<number, Set<string>>()
  instructorAssignments?.forEach((assignment: any) => {
    const level = assignment.courses.level
    if (!instructorsByLevel.has(level)) {
      instructorsByLevel.set(level, new Set())
    }
    instructorsByLevel.get(level)!.add(assignment.instructor_id)
  })

  instructorsByLevel.forEach((instructors, level) => {
    if (levelMap.has(level)) {
      levelMap.get(level)!.instructorCount = instructors.size
    }
  })

  // Calculate average sections per course
  levelMap.forEach((stats, level) => {
    if (stats.courseCount > 0) {
      stats.averageSectionsPerCourse = stats.sectionCount / stats.courseCount
    }
  })

  // Simple conflict detection (sections at same time in same room)
  const conflictsByLevel = new Map<number, number>()
  allSections?.forEach((section: any, index: number) => {
    const level = section.courses.level
    
    // Check against all other sections
    for (let i = index + 1; i < allSections.length; i++) {
      const other = allSections[i]
      
      // Check room conflict
      if (section.room_id && other.room_id && section.room_id === other.room_id) {
        if (hasTimeOverlap(section, other) && hasDayOverlap(section.meeting_days, other.meeting_days)) {
          conflictsByLevel.set(level, (conflictsByLevel.get(level) || 0) + 1)
          break // Count each section only once
        }
      }
    }
  })

  conflictsByLevel.forEach((count, level) => {
    if (levelMap.has(level)) {
      levelMap.get(level)!.conflictCount = count
    }
  })

  // Convert to array and sort by level
  const result = Array.from(levelMap.entries())
    .map(([level, stats]) => ({
      level,
      ...stats
    }))
    .sort((a, b) => a.level - b.level)

  return result
}

/**
 * Get detailed course information for a specific level
 */
export async function getCoursesByLevel(level: number) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('courses')
    .select(`
      *,
      sections(
        id,
        section_number,
        instructor:instructors(name),
        room:rooms(name),
        meeting_days,
        start_time,
        end_time,
        is_lab
      )
    `)
    .eq('level', level)
    .order('code')

  if (error) throw error
  return data
}

/**
 * Get instructor workload breakdown by level
 */
export async function getInstructorWorkloadByLevel() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sections')
    .select(`
      instructor_id,
      instructors!inner(name),
      courses!inner(level, credits)
    `)
    .not('instructor_id', 'is', null)

  if (error) throw error

  // Group by level and instructor
  const workloadMap = new Map<number, Map<string, { name: string; credits: number }>>()

  data?.forEach((section: any) => {
    const level = section.courses.level
    const instructorId = section.instructor_id
    const instructorName = section.instructors.name
    const credits = section.courses.credits || 3

    if (!workloadMap.has(level)) {
      workloadMap.set(level, new Map())
    }

    const levelMap = workloadMap.get(level)!
    if (!levelMap.has(instructorId)) {
      levelMap.set(instructorId, { name: instructorName, credits: 0 })
    }

    levelMap.get(instructorId)!.credits += credits
  })

  // Convert to array format
  const result = Array.from(workloadMap.entries()).map(([level, instructors]) => ({
    level,
    instructors: Array.from(instructors.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      credits: data.credits
    })).sort((a, b) => b.credits - a.credits)
  })).sort((a, b) => a.level - b.level)

  return result
}

// Helper functions
function hasTimeOverlap(section1: any, section2: any): boolean {
  if (!section1.start_time || !section2.start_time) return false
  
  const start1 = timeToMinutes(section1.start_time)
  const end1 = start1 + (section1.end_time ? timeToMinutes(section1.end_time) - timeToMinutes(section1.start_time) : 60)
  
  const start2 = timeToMinutes(section2.start_time)
  const end2 = start2 + (section2.end_time ? timeToMinutes(section2.end_time) - timeToMinutes(section2.start_time) : 60)
  
  return start1 < end2 && start2 < end1
}

function hasDayOverlap(days1: string[] | null, days2: string[] | null): boolean {
  if (!days1 || !days2) return false
  return days1.some(day => days2.includes(day))
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

