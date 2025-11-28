/**
 * Student Feedback API
 * POST: Submit schedule feedback
 * GET: Retrieve student's feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for feedback
const feedbackSchema = z.object({
  schedule_id: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
  status: z.enum(['SUBMITTED', 'REVIEWED', 'RESOLVED']).default('SUBMITTED'),
});

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
    
    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('id')
      .eq('id', user.id)
      .single();
    
    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }
    
    // Parse and validate body
    const body = await request.json();
    const validated = feedbackSchema.parse(body);
    
    // Verify schedule exists and belongs to user
    const { data: schedule, error: scheduleError } = await supabase
      .from('schedules')
      .select('id, student_id, is_published')
      .eq('id', validated.schedule_id)
      .eq('student_id', user.id)
      .single();
    
    if (scheduleError || !schedule) {
      return NextResponse.json(
        { error: 'Schedule not found or access denied' },
        { status: 404 }
      );
    }
    
    if (!schedule.is_published) {
      return NextResponse.json(
        { error: 'Cannot submit feedback for unpublished schedules' },
        { status: 400 }
      );
    }
    
    // Check if feedback already exists for this schedule
    const { data: existingFeedback, error: existingError } = await supabase
      .from('feedback')
      .select('id')
      .eq('student_id', user.id)
      .eq('schedule_id', validated.schedule_id)
      .limit(1);
    
    if (existingError) {
      console.error('Existing feedback check error:', existingError);
    }
    
    if (existingFeedback && existingFeedback.length > 0) {
      return NextResponse.json(
        { error: 'Feedback already submitted for this schedule. Please update the existing feedback instead.' },
        { status: 409 }
      );
    }
    
    // Insert feedback
    const feedbackToInsert = {
      student_id: user.id,
      schedule_id: validated.schedule_id,
      rating: validated.rating,
      comment: validated.comment || null,
      status: validated.status,
      created_at: new Date().toISOString(),
    };
    
    const { data, error } = await supabase
      .from('feedback')
      .insert(feedbackToInsert)
      .select()
      .single();
    
    if (error) {
      console.error('Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to submit feedback' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Feedback submitted successfully',
      data
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues 
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
    const scheduleId = searchParams.get('schedule_id');
    
    // Build query
    let query = supabase
      .from('feedback')
      .select(`
        id,
        student_id,
        schedule_id,
        rating,
        comment,
        status,
        created_at,
        updated_at,
        schedule:schedule_id (
          id,
          term_code,
          version
        )
      `)
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });
    
    // Filter by schedule if provided
    if (scheduleId) {
      query = query.eq('schedule_id', scheduleId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch feedback' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      data: data || [],
      count: data?.length || 0
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
