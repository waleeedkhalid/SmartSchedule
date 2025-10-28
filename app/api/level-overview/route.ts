import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import { getLevelStatistics, getCoursesByLevel, getInstructorWorkloadByLevel } from '@/lib/db/level-stats'

/**
 * GET /api/level-overview
 * Get comprehensive level statistics
 * 
 * Query params:
 * - level: specific level to get detailed data for (optional)
 * - type: 'statistics' | 'courses' | 'workload' (default: 'statistics')
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
    const level = searchParams.get('level')
    const type = searchParams.get('type') || 'statistics'

    // Route to appropriate function
    if (type === 'workload') {
      const data = await getInstructorWorkloadByLevel()
      return NextResponse.json(data)
    }

    if (level) {
      const levelNum = parseInt(level, 10)
      if (isNaN(levelNum)) {
        return NextResponse.json(
          { error: 'Invalid level parameter' },
          { status: 400 }
        )
      }

      if (type === 'courses') {
        const data = await getCoursesByLevel(levelNum)
        return NextResponse.json(data)
      }
    }

    // Default: return statistics
    const data = await getLevelStatistics()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Error fetching level overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch level overview data' },
      { status: 500 }
    )
  }
}

