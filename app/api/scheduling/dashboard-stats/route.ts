import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import {
  getFacultyAvailabilityStats,
  getRoomUtilizationStats,
  getSchedulingProgressStats,
  getInstructorWorkloadStats,
  getEnrollmentTrendsStats,
  getTimeSlotUtilizationStats
} from '@/lib/db/scheduling-stats'
import { getElectivePreferenceStats } from '@/lib/db/elective-preferences'

/**
 * GET /api/scheduling/dashboard-stats
 * Get comprehensive statistics for scheduling dashboard
 * 
 * Query params:
 * - type: 'all' | 'faculty' | 'rooms' | 'progress' | 'workload' | 'enrollments' | 'timeslots' | 'electives'
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user has scheduling role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    if (userRole?.role !== 'scheduling') {
      return NextResponse.json(
        { error: 'Forbidden - Scheduling role required' },
        { status: 403 }
      )
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'all'

    // Fetch requested statistics
    let result: any = {}

    if (type === 'all' || type === 'faculty') {
      result.faculty = await getFacultyAvailabilityStats()
    }

    if (type === 'all' || type === 'rooms') {
      result.rooms = await getRoomUtilizationStats()
    }

    if (type === 'all' || type === 'progress') {
      result.progress = await getSchedulingProgressStats()
    }

    if (type === 'all' || type === 'workload') {
      result.workload = await getInstructorWorkloadStats()
    }

    if (type === 'all' || type === 'enrollments') {
      result.enrollments = await getEnrollmentTrendsStats()
    }

    if (type === 'all' || type === 'timeslots') {
      result.timeslots = await getTimeSlotUtilizationStats()
    }

    if (type === 'all' || type === 'electives') {
      result.electives = await getElectivePreferenceStats()
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error fetching scheduling dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    )
  }
}

