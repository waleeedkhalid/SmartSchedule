/**
 * Student Exams API Route
 * 
 * Purpose: Provide exam timetable for student's courses
 * 
 * Exam Data:
 * - Includes exams for all courses in student's schedule (required + electives)
 * - Detects time conflicts (overlapping exams)
 * - Sorted by date and time
 * 
 * Production: Returns only real data from database
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { getStudentExams } from '@/lib/db/student-schedule';

/**
 * GET /api/student/exams
 * Fetch exam timetable for authenticated student
 * 
 * Query Parameters:
 * - format: 'grouped' returns exams grouped by date (default: flat array)
 * 
 * Returns:
 * - 200: Array of exams with conflict information
 * - 401: Not authenticated
 * - 403: Not a student
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
      .select('role, level')
      .eq('user_id', user.id)
      .single();
    
    if (roleError || !userRole || userRole.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can access exam timetables' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'flat';
    
    // Fetch real exam data from database
    const exams = await getStudentExams(user.id);
    
    // If no exams exist, return empty state with helpful message
    if (exams.length === 0) {
      return NextResponse.json({
        exams: [],
        total_exams: 0,
        has_conflicts: false,
        is_empty: true,
        message: 'No exam schedule available yet. Please check back later or contact your department.',
        setup_required: true
      });
    }
    
    // Return based on format
    if (format === 'grouped') {
      // Group exams by date for calendar-style display
      const groupedByDate = exams.reduce((groups: any, exam) => {
        const date = exam.date;
        if (!groups[date]) {
          groups[date] = [];
        }
        groups[date].push(exam);
        return groups;
      }, {});
      
      return NextResponse.json({
        grouped: groupedByDate,
        total_exams: exams.length,
        has_conflicts: exams.some(e => e.has_conflict),
      });
    }
    
    // Return flat array (default)
    return NextResponse.json({
      exams,
      total_exams: exams.length,
      has_conflicts: exams.some(e => e.has_conflict),
    });
    
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam timetable' },
      { status: 500 }
    );
  }
}

