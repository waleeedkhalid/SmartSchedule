/**
 * Student Schedule API Route
 * 
 * Purpose: Provide complete student schedule view
 * 
 * Schedule Composition:
 * - Required courses: Auto-enrolled based on student level
 * - Elective courses: Manually registered sections
 * 
 * Mock Data: When no real sections exist, generates sample schedule
 * for demonstration purposes with inline documentation
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { 
  getStudentSchedule, 
  getScheduleStats,
  checkScheduleConflicts
} from '@/lib/db/student-schedule';

/**
 * Generate mock schedule data for demonstration
 * Used when database has no sections yet
 * 
 * Mock Data Structure:
 * - 5 required courses (Level 3 example)
 * - 2 elective courses (registered)
 * - Realistic time slots and instructors
 * - Total: 20 credits (at limit)
 */
function generateMockSchedule(studentId: string, level: number = 3) {
  // Mock required courses for Level 3
  const mockRequiredSections = [
    {
      id: 'mock-req-1',
      course_code: 'SWE301',
      course_title: 'Software Engineering Principles',
      section_no: '01',
      credits: 3,
      is_elective: false,
      is_enrolled: false, // Auto-enrolled
      instructor_name: 'Dr. Sarah Johnson',
      room_code: 'A101',
      meeting_pattern: {
        days: ['Sunday', 'Tuesday'],
        start: '08:00',
        duration: 90,
        is_lab: false,
      },
      state: 'released' as const,
    },
    {
      id: 'mock-req-2',
      course_code: 'SWE302',
      course_title: 'Database Systems',
      section_no: '01',
      credits: 3,
      is_elective: false,
      is_enrolled: false,
      instructor_name: 'Dr. Ahmed Hassan',
      room_code: 'B205',
      meeting_pattern: {
        days: ['Monday', 'Wednesday'],
        start: '10:00',
        duration: 90,
        is_lab: false,
      },
      state: 'released' as const,
    },
    {
      id: 'mock-req-3',
      course_code: 'SWE303',
      course_title: 'Computer Networks',
      section_no: '01',
      credits: 3,
      is_elective: false,
      is_enrolled: false,
      instructor_name: 'Dr. Fatima Ali',
      room_code: 'C102',
      meeting_pattern: {
        days: ['Sunday', 'Tuesday'],
        start: '12:00',
        duration: 90,
        is_lab: false,
      },
      state: 'released' as const,
    },
    {
      id: 'mock-req-4',
      course_code: 'SWE304',
      course_title: 'Operating Systems',
      section_no: '01',
      credits: 4,
      is_elective: false,
      is_enrolled: false,
      instructor_name: 'Dr. Omar Khalil',
      room_code: 'LAB-1',
      meeting_pattern: {
        days: ['Monday'],
        start: '13:00',
        duration: 180, // 3-hour lab
        is_lab: true,
      },
      state: 'released' as const,
    },
    {
      id: 'mock-req-5',
      course_code: 'SWE305',
      course_title: 'Software Testing',
      section_no: '01',
      credits: 3,
      is_elective: false,
      is_enrolled: false,
      instructor_name: 'Dr. Layla Mohammed',
      room_code: 'A203',
      meeting_pattern: {
        days: ['Wednesday', 'Thursday'],
        start: '08:00',
        duration: 75,
        is_lab: false,
      },
      state: 'released' as const,
    },
  ];
  
  // Mock elective courses (registered)
  const mockElectiveSections = [
    {
      id: 'mock-elec-1',
      course_code: 'SWE401',
      course_title: 'Machine Learning',
      section_no: '02',
      credits: 3,
      is_elective: true,
      is_enrolled: true, // Manually registered
      instructor_name: 'Dr. Youssef Ibrahim',
      room_code: 'LAB-3',
      meeting_pattern: {
        days: ['Tuesday', 'Thursday'],
        start: '14:00',
        duration: 90,
        is_lab: false,
      },
      state: 'released' as const,
    },
    {
      id: 'mock-elec-2',
      course_code: 'SWE402',
      course_title: 'Mobile App Development',
      section_no: '01',
      credits: 1,
      is_elective: true,
      is_enrolled: true,
      instructor_name: 'Dr. Nour Hassan',
      room_code: 'LAB-2',
      meeting_pattern: {
        days: ['Thursday'],
        start: '10:00',
        duration: 120,
        is_lab: true,
      },
      state: 'released' as const,
    },
  ];
  
  return {
    student_id: studentId,
    level: level,
    total_credits: 20, // 16 required + 4 elective
    required_credits: 16,
    elective_credits: 4,
    sections: [...mockRequiredSections, ...mockElectiveSections],
  };
}

/**
 * GET /api/student/schedule
 * Fetch complete schedule for authenticated student
 * 
 * Query Parameters:
 * - stats: If 'true', returns statistics instead of full schedule
 * - conflicts: If 'true', returns conflict check results
 * - mock: If 'true', forces mock data (for demo/testing)
 * 
 * Returns:
 * - 200: Schedule data (or stats/conflicts based on params)
 * - 401: Not authenticated
 * - 403: Not a student
 * - 404: Student level not set
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
    const forceMock = searchParams.get('mock') === 'true';
    
    // Handle different response types
    if (wantsStats) {
      // Return schedule statistics
      if (forceMock) {
        const mockSchedule = generateMockSchedule(user.id, userRole.level || 3);
        return NextResponse.json({
          total_sections: mockSchedule.sections.length,
          required_sections: mockSchedule.sections.filter(s => !s.is_elective).length,
          elective_sections: mockSchedule.sections.filter(s => s.is_elective).length,
          total_credits: mockSchedule.total_credits,
          required_credits: mockSchedule.required_credits,
          elective_credits: mockSchedule.elective_credits,
          total_contact_hours: mockSchedule.sections.reduce(
            (sum, s) => sum + s.meeting_pattern.duration / 60,
            0
          ),
        });
      }
      
      const stats = await getScheduleStats(user.id);
      return NextResponse.json(stats);
    }
    
    if (wantsConflicts) {
      // Return conflict check results
      if (forceMock) {
        return NextResponse.json({
          has_conflicts: false,
          conflicts: [],
          message: 'Mock data has no conflicts',
        });
      }
      
      const conflicts = await checkScheduleConflicts(user.id);
      return NextResponse.json(conflicts);
    }
    
    // Fetch full schedule
    // If student level not set, return error
    if (!userRole.level) {
      return NextResponse.json(
        { 
          error: 'Student level not set. Contact administrator.',
          mock_available: true,
          hint: 'Add ?mock=true to see sample schedule'
        },
        { status: 404 }
      );
    }
    
    // Try to get real schedule
    const schedule = await getStudentSchedule(user.id);
    
    // If no schedule data exists (no sections in DB), use mock data
    if (!schedule || schedule.sections.length === 0 || forceMock) {
      const mockSchedule = generateMockSchedule(user.id, userRole.level);
      return NextResponse.json({
        ...mockSchedule,
        is_mock: true,
        message: 'Using mock data for demonstration. Real schedule will appear once sections are created.',
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

