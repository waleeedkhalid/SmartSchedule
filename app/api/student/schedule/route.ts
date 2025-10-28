/**
 * Student Schedule API Route
 * 
 * Purpose: Provide complete student schedule view
 * 
 * Schedule Composition:
 * - Required courses: Auto-enrolled based on student level
 * - Elective courses: Manually registered sections
 * 
 * Production: Returns only real data from database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { 
  getStudentSchedule, 
  getScheduleStats,
  checkScheduleConflicts
} from '@/lib/db/student-schedule';

/**
 * GET /api/student/schedule
 * Fetch complete schedule for authenticated student
 * 
 * Query Parameters:
 * - stats: If 'true', returns statistics instead of full schedule
 * - conflicts: If 'true', returns conflict check results
 * 
 * Returns:
 * - 200: Schedule data (or stats/conflicts based on params)
 * - 401: Not authenticated
 * - 403: Not a student
 * - 404: Student level not set or no schedule data
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify user is a student and get level
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role, level, name')
      .eq('user_id', user.id)
      .single();
    
    if (roleError || !userRole || userRole.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can access schedules' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const wantsStats = searchParams.get('stats') === 'true';
    const wantsConflicts = searchParams.get('conflicts') === 'true';
    
    // Handle different response types
    if (wantsStats) {
      // Return schedule statistics
      const stats = await getScheduleStats(user.id);
      return NextResponse.json(stats);
    }
    
    if (wantsConflicts) {
      // Return conflict check results
      const conflicts = await checkScheduleConflicts(user.id);
      return NextResponse.json(conflicts);
    }
    
    // Fetch full schedule
    // If student level not set, return error
    if (!userRole.level) {
      return NextResponse.json(
        { 
          error: 'Student level not set. Contact administrator.',
          is_empty: true,
          setup_required: true
        },
        { status: 404 }
      );
    }
    
    // Get real schedule from database
    const schedule = await getStudentSchedule(user.id);
    
    // If no schedule data exists, return empty state with helpful message
    if (!schedule || schedule.sections.length === 0) {
      return NextResponse.json({
        student_id: user.id,
        level: userRole.level,
        sections: [],
        total_credits: 0,
        required_credits: 0,
        elective_credits: 0,
        is_empty: true,
        message: 'No schedule data available. Please contact your department administrator.',
        setup_required: true
      });
    }
    
    return NextResponse.json(schedule);
    
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

