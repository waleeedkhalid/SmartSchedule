/**
 * Student Schedule API Route
 * 
 * REFACTORED: Uses get_student_schedule() database function
 * 
 * Purpose: Provide complete student schedule view for a semester
 * 
 * Schedule includes:
 * - Course enrollments with section assignments
 * - Meeting patterns, instructors, rooms
 * - Credit totals
 * 
 * Production: Returns only real data from database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { getCurrentSemester } from '@/lib/db/semesters';
import { getStudentProfile } from '@/lib/db/student-profiles';
import { getStudentEnrollmentsWithSections } from '@/lib/db/enrollments';

/**
 * GET /api/student/schedule
 * Fetch complete schedule for authenticated student
 * 
 * Query Parameters:
 * - semester_id: Optional semester ID (defaults to current semester)
 * 
 * Returns:
 * - 200: Schedule data with enrollments and sections
 * - 401: Not authenticated
 * - 403: Not a student
 * - 404: Student profile not found or no schedule data
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
    
    // Verify user is a student
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role, name')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (roleError || !userRole || userRole.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can access schedules' },
        { status: 403 }
      );
    }
    
    // Get student profile
    const profile = await getStudentProfile(user.id);
    if (!profile) {
      return NextResponse.json(
        { 
          error: 'Student profile not found. Contact administrator.',
          is_empty: true,
          setup_required: true
        },
        { status: 404 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semester_id');
    
    // Get semester context
    const currentSemester = await getCurrentSemester();
    const targetSemester = semesterId || currentSemester?.id;
    
    if (!targetSemester) {
      return NextResponse.json(
        { 
          error: 'No semester found. Please specify a semester ID or set a current semester.',
          is_empty: true
        },
        { status: 404 }
      );
    }
    
    // Fetch schedule using get_student_schedule database function
    // Try database function first
    const { data: scheduleData, error: scheduleError } = await supabase
      .rpc('get_student_schedule', {
        student_id: user.id,
        semester_id: targetSemester
      });
    
    if (!scheduleError && scheduleData) {
      return NextResponse.json({
        student_id: user.id,
        level: profile.current_level,
        student_name: userRole.name,
        semester_id: targetSemester,
        schedule: scheduleData,
        is_empty: scheduleData.length === 0
      });
    }
    
    // Fallback: Use enrollments query
    const enrollments = await getStudentEnrollmentsWithSections(user.id, targetSemester);
    
    // If no schedule data exists, return empty state with helpful message
    if (!enrollments || enrollments.length === 0) {
      return NextResponse.json({
        student_id: user.id,
        level: profile.current_level,
        student_name: userRole.name,
        semester_id: targetSemester,
        schedule: [],
        is_empty: true,
        message: 'No schedule data available. Please enroll in sections.',
      });
    }
    
    return NextResponse.json({
      student_id: user.id,
      level: profile.current_level,
      student_name: userRole.name,
      semester_id: targetSemester,
      schedule: enrollments,
      is_empty: false
    });
    
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedule' },
      { status: 500 }
    );
  }
}

