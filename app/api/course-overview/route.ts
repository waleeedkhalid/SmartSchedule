import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import {
  getCourseStatistics,
  getCourseDetails,
  getCourseDistributionByType,
  getSectionUtilization,
  getTopCoursesBySections,
  getInstructorWorkloadByCourse
} from '@/lib/db/course-stats'

/**
 * GET /api/course-overview
 * Get comprehensive course statistics
 * 
 * Query params:
 * - type: 'statistics' | 'distribution' | 'utilization' | 'top' | 'workload' (default: 'statistics')
 * - course: specific course code to get details for (optional)
 * - limit: number of results for 'top' type (default: 10)
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') || 'statistics'
    const course = searchParams.get('course')
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    // Route to appropriate function
    if (course) {
      const data = await getCourseDetails(course)
      return NextResponse.json(data)
    }

    switch (type) {
      case 'distribution':
        const distribution = await getCourseDistributionByType()
        return NextResponse.json(distribution)

      case 'utilization':
        const utilization = await getSectionUtilization()
        return NextResponse.json(utilization)

      case 'top':
        const topCourses = await getTopCoursesBySections(limit)
        return NextResponse.json(topCourses)

      case 'workload':
        const workload = await getInstructorWorkloadByCourse()
        return NextResponse.json(workload)

      default:
        const statistics = await getCourseStatistics()
        return NextResponse.json(statistics)
    }

  } catch (error) {
    console.error('Error fetching course overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch course overview data' },
      { status: 500 }
    )
  }
}

