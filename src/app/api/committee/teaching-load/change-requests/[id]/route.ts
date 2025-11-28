/**
 * Individual Teaching Load Change Request API
 * GET: Retrieve a specific change request
 * PATCH: Update request status (approve/reject)
 * DELETE: Delete a request
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

const updateRequestSchema = z.object({
  validation_status: z.enum(['APPROVED', 'REJECTED']).optional(),
  reviewer_notes: z.string().max(500).optional(),
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
          capacity,
          instructor_id,
          room_number
        )
      `)
      .eq('id', params.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Change request not found' },
          { status: 404 }
        );
      }
      throw error;
    }
    
    return NextResponse.json({
      success: true,
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
    
    // Verify user is committee member (scheduling or teaching load)
    const { data: membership } = await supabase
      .from('committee_members')
      .select('id, committee_type')
      .eq('id', user.id)
      .maybeSingle();
    
    if (!membership) {
      return NextResponse.json(
        { error: 'Committee membership required' },
        { status: 403 }
      );
    }
    
    // Parse and validate body
    const body = await request.json();
    const validated = updateRequestSchema.parse(body);
    
    // Get current request
    const { data: currentRequest, error: fetchError } = await supabase
      .from('teaching_load_change_requests')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (fetchError || !currentRequest) {
      return NextResponse.json(
        { error: 'Change request not found' },
        { status: 404 }
      );
    }
    
    // Only scheduling committee can approve/reject
    if (validated.validation_status && membership.committee_type !== 'scheduling') {
      return NextResponse.json(
        { error: 'Only scheduling committee can approve or reject requests' },
        { status: 403 }
      );
    }
    
    // Prepare update data
    const updateData: Record<string, unknown> = {};
    
    if (validated.validation_status) {
      updateData.validation_status = validated.validation_status;
      updateData.reviewed_by = user.id;
      updateData.reviewed_at = new Date().toISOString();
    }
    
    if (validated.reviewer_notes) {
      updateData.reviewer_notes = validated.reviewer_notes;
    }
    
    // Update request
    const { data: updatedRequest, error: updateError } = await supabase
      .from('teaching_load_change_requests')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update change request' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Change request ${validated.validation_status?.toLowerCase() || 'updated'}`,
      data: updatedRequest,
    });
    
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
    
    // Get request to check ownership
    const { data: changeRequest, error: fetchError } = await supabase
      .from('teaching_load_change_requests')
      .select('requested_by, applied')
      .eq('id', params.id)
      .single();
    
    if (fetchError || !changeRequest) {
      return NextResponse.json(
        { error: 'Change request not found' },
        { status: 404 }
      );
    }
    
    // Only requester can delete, and only if not applied
    if (changeRequest.requested_by !== user.id) {
      return NextResponse.json(
        { error: 'Can only delete your own requests' },
        { status: 403 }
      );
    }
    
    if (changeRequest.applied) {
      return NextResponse.json(
        { error: 'Cannot delete an applied change request' },
        { status: 400 }
      );
    }
    
    // Delete request
    const { error: deleteError } = await supabase
      .from('teaching_load_change_requests')
      .delete()
      .eq('id', params.id);
    
    if (deleteError) {
      console.error('Delete error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete change request' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Change request deleted successfully',
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

