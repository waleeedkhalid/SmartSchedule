/**
 * Individual Exam Schedule API
 * GET: Retrieve a specific exam schedule
 * PATCH: Update exam schedule
 * DELETE: Delete exam schedule
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateExamSchema = z.object({
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  end_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional(),
  room_number: z.string().optional(),
  invigilator_id: z.string().uuid().optional(),
  capacity: z.number().int().min(0).optional(),
  notes: z.string().max(500).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data, error } = await supabase
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
      .eq('id', params.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Exam schedule not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    // Get student assignments
    const { data: assignments } = await supabase
      .from('exam_student_assignments')
      .select(`
        *,
        student:student_id (
          id,
          full_name,
          email,
          level
        )
      `)
      .eq('exam_id', params.id);

    return NextResponse.json({
      success: true,
      data: {
        ...data,
        student_assignments: assignments || [],
      },
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { data: membership } = await supabase
      .from('committee_members')
      .select('id, committee_type')
      .eq('id', user.id)
      .maybeSingle();

    if (!membership || membership.committee_type !== 'scheduling') {
      return NextResponse.json(
        { error: 'Only scheduling committee members can update exam schedules' },
        { status: 403 }
      );
    }

    // Parse and validate body
    const body = await request.json();
    const validated = updateExamSchema.parse(body);

    // Get current exam
    const { data: currentExam, error: fetchError } = await supabase
      .from('exam_schedules')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !currentExam) {
      return NextResponse.json(
        { error: 'Exam schedule not found' },
        { status: 404 }
      );
    }

    // Update exam
    const { data: updatedExam, error: updateError } = await supabase
      .from('exam_schedules')
      .update(validated)
      .eq('id', params.id)
      .select(`
        *,
        course:course_code (
          course_code,
          course_name,
          credits
        )
      `)
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update exam schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Exam schedule updated successfully',
      data: updatedExam,
    });

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { data: membership } = await supabase
      .from('committee_members')
      .select('id, committee_type')
      .eq('id', user.id)
      .maybeSingle();

    if (!membership || membership.committee_type !== 'scheduling') {
      return NextResponse.json(
        { error: 'Only scheduling committee members can delete exam schedules' },
        { status: 403 }
      );
    }

    // Check if exam has student assignments
    const { data: assignments } = await supabase
      .from('exam_student_assignments')
      .select('id')
      .eq('exam_id', params.id)
      .limit(1);

    if (assignments && assignments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete exam schedule with student assignments' },
        { status: 400 }
      );
    }

    // Delete exam
    const { error: deleteError } = await supabase
      .from('exam_schedules')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete exam schedule' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Exam schedule deleted successfully',
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

