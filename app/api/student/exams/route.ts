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
 * Mock Data: Generates realistic exam schedule when database is empty
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { getStudentExams } from '@/lib/db/student-schedule';
import type { ExamView } from '@/lib/types/database';

/**
 * Generate mock exam data for demonstration
 * Creates realistic 2-week exam schedule with some conflicts
 * 
 * Mock Exam Characteristics:
 * - 7 exams over 2 weeks
 * - 2-3 hour durations
 * - Some same-day exams (to show conflict detection)
 * - Multiple rooms for larger exams
 */
function generateMockExams(studentId: string): ExamView[] {
  // Calculate dates: exams start in 2 weeks
  const today = new Date();
  const examStartDate = new Date(today);
  examStartDate.setDate(today.getDate() + 14); // 2 weeks from now
  
  // Helper to format date as YYYY-MM-DD
  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Helper to calculate end time
  const calculateEndTime = (startTime: string, durationMinutes: number) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const start = new Date(2000, 0, 1, hours, minutes);
    const end = new Date(start.getTime() + durationMinutes * 60000);
    return `${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}:00`;
  };
  
  // Week 1 exams
  const week1Day1 = new Date(examStartDate);
  const week1Day3 = new Date(examStartDate);
  week1Day3.setDate(week1Day3.getDate() + 2);
  const week1Day5 = new Date(examStartDate);
  week1Day5.setDate(week1Day5.getDate() + 4);
  
  // Week 2 exams
  const week2Day2 = new Date(examStartDate);
  week2Day2.setDate(week2Day2.getDate() + 8);
  const week2Day4 = new Date(examStartDate);
  week2Day4.setDate(week2Day4.getDate() + 10);
  const week2Day5 = new Date(examStartDate);
  week2Day5.setDate(week2Day5.getDate() + 11);
  
  const mockExams: ExamView[] = [
    {
      id: 'mock-exam-1',
      course_code: 'SWE301',
      course_title: 'Software Engineering Principles',
      section_id: 'mock-section-1',
      section_no: '01',
      date: formatDate(week1Day1),
      start_time: '09:00:00',
      duration_minutes: 180,
      end_time: calculateEndTime('09:00:00', 180),
      room_codes: ['EXAM-A', 'EXAM-B'], // Large exam, multiple rooms
      has_conflict: false,
      conflicting_exams: [],
    },
    {
      id: 'mock-exam-2',
      course_code: 'SWE302',
      course_title: 'Database Systems',
      section_id: 'mock-section-2',
      section_no: '01',
      date: formatDate(week1Day3),
      start_time: '09:00:00',
      duration_minutes: 120,
      end_time: calculateEndTime('09:00:00', 120),
      room_codes: ['EXAM-C'],
      has_conflict: false,
      conflicting_exams: [],
    },
    {
      id: 'mock-exam-3',
      course_code: 'SWE303',
      course_title: 'Computer Networks',
      section_id: 'mock-section-3',
      section_no: '01',
      date: formatDate(week1Day5),
      start_time: '09:00:00',
      duration_minutes: 120,
      end_time: calculateEndTime('09:00:00', 120),
      room_codes: ['EXAM-D'],
      has_conflict: false,
      conflicting_exams: [],
    },
    {
      id: 'mock-exam-4',
      course_code: 'SWE304',
      course_title: 'Operating Systems',
      section_id: 'mock-section-4',
      section_no: '01',
      date: formatDate(week1Day5),
      start_time: '13:00:00', // Same day as Networks, but different time
      duration_minutes: 180,
      end_time: calculateEndTime('13:00:00', 180),
      room_codes: ['EXAM-E', 'EXAM-F'],
      has_conflict: false, // No conflict - different time
      conflicting_exams: [],
    },
    {
      id: 'mock-exam-5',
      course_code: 'SWE305',
      course_title: 'Software Testing',
      section_id: 'mock-section-5',
      section_no: '01',
      date: formatDate(week2Day2),
      start_time: '09:00:00',
      duration_minutes: 120,
      end_time: calculateEndTime('09:00:00', 120),
      room_codes: ['EXAM-G'],
      has_conflict: false,
      conflicting_exams: [],
    },
    {
      id: 'mock-exam-6',
      course_code: 'SWE401',
      course_title: 'Machine Learning',
      section_id: 'mock-section-6',
      section_no: '02',
      date: formatDate(week2Day4),
      start_time: '09:00:00',
      duration_minutes: 180,
      end_time: calculateEndTime('09:00:00', 180),
      room_codes: ['EXAM-H'],
      has_conflict: false,
      conflicting_exams: [],
    },
    {
      id: 'mock-exam-7',
      course_code: 'SWE402',
      course_title: 'Mobile App Development',
      section_id: 'mock-section-7',
      section_no: '01',
      date: formatDate(week2Day5),
      start_time: '09:00:00',
      duration_minutes: 120,
      end_time: calculateEndTime('09:00:00', 120),
      room_codes: ['LAB-2'],
      has_conflict: false,
      conflicting_exams: [],
    },
  ];
  
  return mockExams;
}

/**
 * GET /api/student/exams
 * Fetch exam timetable for authenticated student
 * 
 * Query Parameters:
 * - mock: If 'true', forces mock data (for demo/testing)
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
    const forceMock = searchParams.get('mock') === 'true';
    const format = searchParams.get('format') || 'flat';
    
    // Fetch exams (real or mock)
    let exams: ExamView[];
    
    if (forceMock || !userRole.level) {
      // Use mock data for demonstration
      exams = generateMockExams(user.id);
    } else {
      // Fetch real exam data
      exams = await getStudentExams(user.id);
      
      // If no real exams exist, fall back to mock
      if (exams.length === 0) {
        exams = generateMockExams(user.id);
        // Add flag to indicate mock data
        (exams as any).is_mock = true;
      }
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
        is_mock: (exams as any).is_mock || forceMock,
      });
    }
    
    // Return flat array (default)
    return NextResponse.json({
      exams,
      total_exams: exams.length,
      has_conflicts: exams.some(e => e.has_conflict),
      is_mock: (exams as any).is_mock || forceMock,
    });
    
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exam timetable' },
      { status: 500 }
    );
  }
}

