/**
 * Teaching Load Change Requests API
 * POST: Submit a new change request
 * GET: Retrieve change requests (with optional filters)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { validateChangeRequest } from '@/lib/validations/change-request-validator';

// Validation schema for change request
const changeRequestSchema = z.object({
  schedule_version_id: z.string().uuid(),
  section_id: z.string().min(1),
  request_type: z.enum(['REASSIGN_INSTRUCTOR', 'CHANGE_TIME_SLOT', 'ADJUST_CAPACITY', 'CHANGE_ROOM']),
  changes: z.object({
    from: z.record(z.string(), z.any()),
    to: z.record(z.string(), z.any()),
  }),
  reason: z.string().min(10).max(500),
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
    
    // Verify user is teaching load committee member
    const { data: membership, error: membershipError } = await supabase
      .from('committee_members')
      .select('id, committee_type')
      .eq('id', user.id)
      .maybeSingle();
    
    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'Teaching load committee membership not found' },
        { status: 404 }
      );
    }
    
    if (membership.committee_type !== 'teaching_load') {
      return NextResponse.json(
        { error: 'Only teaching load committee members can submit change requests' },
        { status: 403 }
      );
    }
    
    // Parse and validate body
    const body = await request.json();
    const validated = changeRequestSchema.parse(body);
    
    // Verify schedule version exists
    const { data: scheduleVersion, error: versionError } = await supabase
      .from('schedule_versions')
      .select('id, version, status')
      .eq('id', validated.schedule_version_id)
      .single();
    
    if (versionError || !scheduleVersion) {
      return NextResponse.json(
        { error: 'Schedule version not found' },
        { status: 404 }
      );
    }
    
    // Don't allow changes to published schedules
    if (scheduleVersion.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'Cannot modify a published schedule version' },
        { status: 400 }
      );
    }
    
    // Verify section exists
    const { data: section, error: sectionError } = await supabase
      .from('section')
      .select('section_id, course_code, capacity')
      .eq('section_id', validated.section_id)
      .single();
    
    if (sectionError || !section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      );
    }
    
    // Validate change request against irregular students
    const validationResult = await validateChangeRequest(
      supabase,
      validated.section_id,
      validated.request_type,
      validated.changes
    );
    
    // Insert change request
    const changeRequestData = {
      schedule_version_id: validated.schedule_version_id,
      section_id: validated.section_id,
      requested_by: user.id,
      request_type: validated.request_type,
      changes: validated.changes,
      reason: validated.reason,
      validation_status: validationResult.isValid ? 'VALID' : 'INVALID',
      validation_error: validationResult.error || null,
      affects_irregular_students: validationResult.affectsIrregular,
      irregular_students_affected: validationResult.affectedStudents || [],
      applied: false,
    };
    
    const { data: insertedRequest, error: insertError } = await supabase
      .from('teaching_load_change_requests')
      .insert(changeRequestData)
      .select()
      .single();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to create change request' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: validationResult.isValid 
        ? 'Change request submitted successfully and is valid' 
        : 'Change request submitted but has validation issues',
      data: insertedRequest,
      validation: validationResult,
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
    const scheduleVersionId = searchParams.get('schedule_version_id');
    const status = searchParams.get('status');
    const requestType = searchParams.get('request_type');
    const affectsIrregular = searchParams.get('affects_irregular');
    
    // Build query
    let query = supabase
      .from('teaching_load_change_requests')
      .select(`
        *,
        requested_by_user:requested_by (
          id,
          full_name,
          email
        ),
        reviewed_by_user:reviewed_by (
          id,
          full_name,
          email
        ),
        section:section_id (
          section_id,
          course_code,
          capacity
        )
      `)
      .order('created_at', { ascending: false });
    
    // Apply filters
    if (scheduleVersionId) {
      query = query.eq('schedule_version_id', scheduleVersionId);
    }
    
    if (status) {
      query = query.eq('validation_status', status);
    }
    
    if (requestType) {
      query = query.eq('request_type', requestType);
    }
    
    if (affectsIrregular === 'true') {
      query = query.eq('affects_irregular_students', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch change requests' },
        { status: 500 }
      );
    }
    
    // Calculate statistics
    const stats = {
      total: data?.length || 0,
      by_status: {
        pending: data?.filter(r => r.validation_status === 'PENDING').length || 0,
        valid: data?.filter(r => r.validation_status === 'VALID').length || 0,
        invalid: data?.filter(r => r.validation_status === 'INVALID').length || 0,
        approved: data?.filter(r => r.validation_status === 'APPROVED').length || 0,
        rejected: data?.filter(r => r.validation_status === 'REJECTED').length || 0,
      },
      applied: data?.filter(r => r.applied).length || 0,
      affecting_irregular: data?.filter(r => r.affects_irregular_students).length || 0,
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

