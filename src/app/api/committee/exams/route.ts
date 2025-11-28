/**
 * Exam Schedules API
 * GET: Retrieve exam schedules (with optional filters)
 * POST: Create new exam schedule
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const examScheduleSchema = z.object({
  term_code: z.string().min(1),
  course_code: z.string().min(1),
  exam_type: z.enum(['MIDTERM', 'FINAL', 'QUIZ', 'MAKEUP']),
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/), // HH:MM:SS
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/), // HH:MM:SS
  room_number: z.string().optional(),
  invigilator_id: z.string().uuid().optional(),
  capacity: z.number().int().min(0),
  notes: z.string().max(500).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const termCode = searchParams.get('term_code');
    const courseCode = searchParams.get('course_code');
    const examType = searchParams.get('exam_type');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    // Build query
    let query = supabase
      .from('exam_schedules')
      .select(`
        *,
        course:course_code (
          course_code,
          course_name,
          credits
        ),
        invigilator:invigilator_id (
          id,
          full_name,
          email
        ),
        created_by_user:created_by (
          id,
          full_name
        )
      `)
      .order('exam_date', { ascending: true })
      .order('start_time', { ascending: true });

    // Apply filters
    if (termCode) {
      query = query.eq('term_code', termCode);
    }

    if (courseCode) {
      query = query.eq('course_code', courseCode);
    }

    if (examType) {
      query = query.eq('exam_type', examType);
    }

    if (startDate) {
      query = query.gte('exam_date', startDate);
    }

    if (endDate) {
      query = query.lte('exam_date', endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch exam schedules' },
        { status: 500 }
      );
    }

    // Calculate statistics
    const stats = {
      total: data?.length || 0,
      by_type: {
        midterm: data?.filter(e => e.exam_type === 'MIDTERM').length || 0,
        final: data?.filter(e => e.exam_type === 'FINAL').length || 0,
        quiz: data?.filter(e => e.exam_type === 'QUIZ').length || 0,
        makeup: data?.filter(e => e.exam_type === 'MAKEUP').length || 0,
      },
      total_capacity: data?.reduce((sum, e) => sum + e.capacity, 0) || 0,
      total_enrolled: data?.reduce((sum, e) => sum + e.enrolled_count, 0) || 0,
    };

    return NextResponse.json({
      success: true,
      data: data || [],
      stats,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify user is scheduling committee member
    const { data: membership, error: membershipError } = await supabase
      .from('committee_members')
      .select('id, committee_type')
      .eq('id', user.id)
      .maybeSingle();

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Committee membership not found' },
        { status: 404 }
      );
    }

    if (membership.committee_type !== 'scheduling') {
      return NextResponse.json(
        { error: 'Only scheduling committee members can create exam schedules' },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validated = examScheduleSchema.parse(body);

    // Verify term exists
    const { data: term, error: termError } = await supabase
      .from('academic_term')
      .select('code')
      .eq('code', validated.term_code)
      .maybeSingle();

    if (termError || !term) {
      return NextResponse.json(
        { error: 'Academic term not found' },
        { status: 404 }
      );
    }

    // Verify course exists
    const { data: course, error: courseError } = await supabase
      .from('course')
      .select('course_code')
      .eq('course_code', validated.course_code)
      .maybeSingle();

    if (courseError || !course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      );
    }

    // Check for conflicts
    const { data: conflicts } = await supabase
      .from('exam_schedules')
      .select('id, course_code, room_number')
      .eq('term_code', validated.term_code)
      .eq('exam_date', validated.exam_date)
      .or(`room_number.eq.${validated.room_number}`)
      .overlaps('start_time', 'end_time', validated.start_time, validated.end_time);

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json(
        {
          error: 'Exam schedule conflicts detected',
          conflicts: conflicts.map(c => ({
            course_code: c.course_code,
            room_number: c.room_number,
          })),
        },
        { status: 409 }
      );
    }

    // Insert exam schedule
    const { data: insertedExam, error: insertError } = await supabase
      .from('exam_schedules')
      .insert({
        ...validated,
        enrolled_count: 0,
        created_by: user.id,
      })
      .select(`
        *,
        course:course_code (
          course_code,
          course_name,
          credits
        )
      `)
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create exam schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Exam schedule created successfully',
      data: insertedExam,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

