import { createClient } from '@/supabase/server'

/**
 * Get comprehensive scheduling dashboard statistics
 */

// Faculty Availability Statistics
export async function getFacultyAvailabilityStats() {
  const supabase = await createClient()

  const { data: instructors, error } = await supabase
    .from('instructor')
    .select('id, name, preferred_times, unavailable_times, max_load_per_week')

  if (error) throw error

  let totalInstructors = instructors?.length || 0
  let withPreferences = 0
  let withUnavailability = 0
  let totalPreferredSlots = 0
  let totalUnavailableSlots = 0

  instructors?.forEach(instructor => {
    if (instructor.preferred_times && Array.isArray(instructor.preferred_times)) {
      withPreferences++
      instructor.preferred_times.forEach((day: any) => {
        totalPreferredSlots += day.slots?.length || 0
      })
    }
    if (instructor.unavailable_times && Array.isArray(instructor.unavailable_times)) {
      withUnavailability++
      instructor.unavailable_times.forEach((day: any) => {
        totalUnavailableSlots += day.slots?.length || 0
      })
    }
  })

  return {
    totalInstructors,
    withPreferences,
    withUnavailability,
    withoutPreferences: totalInstructors - withPreferences,
    avgPreferredSlots: withPreferences > 0 ? totalPreferredSlots / withPreferences : 0,
    avgUnavailableSlots: withUnavailability > 0 ? totalUnavailableSlots / withUnavailability : 0
  }
}

// Room Utilization Statistics
export async function getRoomUtilizationStats() {
  const supabase = await createClient()

  const { data: rooms, error: roomsError } = await supabase
    .from('room')
    .select('code, type')

  if (roomsError) throw roomsError

  const { data: sections, error: sectionsError } = await supabase
    .from('section')
    .select('room_code, meeting_pattern')
    .not('room_code', 'is', null)

  if (sectionsError) throw sectionsError

  const roomUsage = new Map<string, number>()
  
  sections?.forEach(section => {
    if (section.room_code) {
      roomUsage.set(section.room_code, (roomUsage.get(section.room_code) || 0) + 1)
    }
  })

  const lectureRooms = rooms?.filter(r => r.type === 'Lecture').length || 0
  const labRooms = rooms?.filter(r => r.type === 'Lab').length || 0
  const usedRooms = roomUsage.size
  const unusedRooms = (rooms?.length || 0) - usedRooms

  return {
    totalRooms: rooms?.length || 0,
    lectureRooms,
    labRooms,
    usedRooms,
    unusedRooms,
    utilizationRate: (rooms?.length || 0) > 0 ? (usedRooms / (rooms?.length || 0)) * 100 : 0,
    roomUsageDetails: Array.from(roomUsage.entries())
      .map(([code, count]) => ({ room: code, sections: count }))
      .sort((a, b) => b.sections - a.sections)
      .slice(0, 10)
  }
}

// Scheduling Progress Over Time
export async function getSchedulingProgressStats() {
  const supabase = await createClient()

  const { data: sections, error } = await supabase
    .from('section')
    .select('id, state, room_code, instructor_id, meeting_pattern, created_at')
    .order('created_at')

  if (error) throw error

  const total = sections?.length || 0
  const assigned = sections?.filter(s => s.room_code && s.meeting_pattern?.start).length || 0
  const withInstructor = sections?.filter(s => s.instructor_id).length || 0
  const withRoom = sections?.filter(s => s.room_code).length || 0
  const withTime = sections?.filter(s => s.meeting_pattern?.start).length || 0
  const draft = sections?.filter(s => s.state === 'draft').length || 0
  const released = sections?.filter(s => s.state === 'released').length || 0

  return {
    total,
    assigned,
    unassigned: total - assigned,
    withInstructor,
    withRoom,
    withTime,
    draft,
    released,
    completionRate: total > 0 ? (assigned / total) * 100 : 0,
    instructorAssignmentRate: total > 0 ? (withInstructor / total) * 100 : 0,
    roomAssignmentRate: total > 0 ? (withRoom / total) * 100 : 0,
    timeAssignmentRate: total > 0 ? (withTime / total) * 100 : 0
  }
}

// Instructor Workload Distribution
export async function getInstructorWorkloadStats() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('section')
    .select(`
      instructor_id,
      instructor:instructor!section_instructor_id_fkey(name, max_load_per_week),
      course:course!section_course_code_fkey(credits)
    `)
    .not('instructor_id', 'is', null)

  if (error) throw error

  const workloadMap = new Map<string, {
    name: string
    credits: number
    maxLoad: number
    sections: number
  }>()

  data?.forEach((section: any) => {
    const id = section.instructor_id
    const name = section.instructor?.name || 'Unknown'
    const credits = section.course?.credits || 3
    const maxLoad = section.instructor?.max_load_per_week || 12

    if (!workloadMap.has(id)) {
      workloadMap.set(id, { name, credits: 0, maxLoad, sections: 0 })
    }

    const instructor = workloadMap.get(id)!
    instructor.credits += credits
    instructor.sections++
  })

  const instructors = Array.from(workloadMap.entries()).map(([id, data]) => ({
    id,
    name: data.name,
    credits: data.credits,
    sections: data.sections,
    maxLoad: data.maxLoad,
    utilizationRate: (data.credits / data.maxLoad) * 100,
    status: data.credits > data.maxLoad ? 'overloaded' : 
            data.credits >= data.maxLoad * 0.9 ? 'near-capacity' : 
            data.credits >= data.maxLoad * 0.5 ? 'balanced' : 'underutilized'
  }))

  const overloaded = instructors.filter(i => i.status === 'overloaded').length
  const nearCapacity = instructors.filter(i => i.status === 'near-capacity').length
  const balanced = instructors.filter(i => i.status === 'balanced').length
  const underutilized = instructors.filter(i => i.status === 'underutilized').length

  return {
    instructors: instructors.sort((a, b) => b.utilizationRate - a.utilizationRate),
    overloaded,
    nearCapacity,
    balanced,
    underutilized,
    avgUtilization: instructors.length > 0 
      ? instructors.reduce((sum, i) => sum + i.utilizationRate, 0) / instructors.length 
      : 0
  }
}

// Student Enrollment Trends
export async function getEnrollmentTrendsStats() {
  const supabase = await createClient()

  const { data: enrollments, error: enrollmentError } = await supabase
    .from('student_enrollment')
    .select(`
      id,
      status,
      enrolled_at,
      section:section!student_enrollment_section_id_fkey(
        course:course!section_course_code_fkey(is_elective, level)
      )
    `)

  if (enrollmentError) throw enrollmentError

  const total = enrollments?.length || 0
  const active = enrollments?.filter(e => e.status === 'registered').length || 0
  const dropped = enrollments?.filter(e => e.status === 'dropped').length || 0
  const elective = enrollments?.filter(e => e.section?.course?.is_elective).length || 0

  // Group by level
  const byLevel = new Map<number, number>()
  enrollments?.forEach(e => {
    const level = e.section?.course?.level
    if (level) {
      byLevel.set(level, (byLevel.get(level) || 0) + 1)
    }
  })

  return {
    total,
    active,
    dropped,
    elective,
    required: active - elective,
    retentionRate: total > 0 ? ((total - dropped) / total) * 100 : 0,
    byLevel: Array.from(byLevel.entries())
      .map(([level, count]) => ({ level, enrollments: count }))
      .sort((a, b) => a.level - b.level)
  }
}

// Time Slot Utilization
export async function getTimeSlotUtilizationStats() {
  const supabase = await createClient()

  const { data: sections, error } = await supabase
    .from('section')
    .select('meeting_pattern')
    .not('meeting_pattern', 'is', null)

  if (error) throw error

  const timeSlots = new Map<string, number>()
  const daySlots = new Map<string, number>()

  sections?.forEach(section => {
    const pattern = section.meeting_pattern as any
    if (pattern?.start && pattern?.days) {
      timeSlots.set(pattern.start, (timeSlots.get(pattern.start) || 0) + 1)
      pattern.days.forEach((day: string) => {
        daySlots.set(day, (daySlots.get(day) || 0) + 1)
      })
    }
  })

  return {
    timeDistribution: Array.from(timeSlots.entries())
      .map(([time, count]) => ({ time, sections: count }))
      .sort((a, b) => a.time.localeCompare(b.time)),
    dayDistribution: Array.from(daySlots.entries())
      .map(([day, count]) => ({ day, sections: count }))
      .sort((a, b) => {
        const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day)
      }),
    totalScheduledSections: sections?.length || 0
  }
}

