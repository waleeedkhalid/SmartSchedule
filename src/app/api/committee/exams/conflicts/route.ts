/**
 * Exam Conflicts Detection API
 * GET: Detect and retrieve exam conflicts
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

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

    // Run conflict detection function
    const { data: detectedConflicts, error: conflictError } = await supabase
      .rpc('detect_exam_conflicts');

    if (conflictError) {
      console.error('Conflict detection error:', conflictError);
      return NextResponse.json(
        { error: 'Failed to detect conflicts' },
        { status: 500 }
      );
    }

    // Get stored conflicts
    let conflictsQuery = supabase
      .from('exam_conflicts')
      .select(`
        *,
        exam_1:exam_id_1 (
          id,
          course_code,
          exam_type,
          exam_date,
          start_time,
          end_time,
          room_number
        ),
        exam_2:exam_id_2 (
          id,
          course_code,
          exam_type,
          exam_date,
          start_time,
          end_time,
          room_number
        )
      `)
      .order('detected_at', { ascending: false });

    if (termCode) {
      // Filter by term (requires joining with exam_schedules)
      conflictsQuery = conflictsQuery
        .eq('exam_1.term_code', termCode);
    }

    const { data: storedConflicts, error: storedError } = await conflictsQuery;

    if (storedError) {
      console.error('Stored conflicts error:', storedError);
    }

    // Calculate statistics
    const unresolvedConflicts = storedConflicts?.filter(c => !c.resolved) || [];
    const criticalConflicts = unresolvedConflicts.filter(c => c.severity === 'CRITICAL');

    const stats = {
      total: storedConflicts?.length || 0,
      unresolved: unresolvedConflicts.length,
      by_severity: {
        critical: criticalConflicts.length,
        high: unresolvedConflicts.filter(c => c.severity === 'HIGH').length,
        medium: unresolvedConflicts.filter(c => c.severity === 'MEDIUM').length,
        low: unresolvedConflicts.filter(c => c.severity === 'LOW').length,
      },
      by_type: {
        time_overlap: unresolvedConflicts.filter(c => c.conflict_type === 'TIME_OVERLAP').length,
        room_overlap: unresolvedConflicts.filter(c => c.conflict_type === 'ROOM_OVERLAP').length,
        student_overlap: unresolvedConflicts.filter(c => c.conflict_type === 'STUDENT_OVERLAP').length,
      },
    };

    return NextResponse.json({
      success: true,
      data: {
        detected: detectedConflicts || [],
        stored: storedConflicts || [],
      },
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
    const { data: membership } = await supabase
      .from('committee_members')
      .select('id, committee_type')
      .eq('id', user.id)
      .maybeSingle();

    if (!membership || membership.committee_type !== 'scheduling') {
      return NextResponse.json(
        { error: 'Only scheduling committee members can mark conflicts as resolved' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { conflict_id, resolution_notes } = body;

    if (!conflict_id) {
      return NextResponse.json(
        { error: 'conflict_id is required' },
        { status: 400 }
      );
    }

    // Mark conflict as resolved
    const { data, error: updateError } = await supabase
      .from('exam_conflicts')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolution_notes,
      })
      .eq('id', conflict_id)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to mark conflict as resolved' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conflict marked as resolved',
      data,
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

