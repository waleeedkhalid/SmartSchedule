/**
 * Apply Approved Change Request
 * POST: Apply an approved change request to the schedule
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { applyChangeRequest } from '@/lib/validations/change-request-validator';

export async function POST(
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
    
    // Verify user is scheduling committee member (only they can apply changes)
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
        { error: 'Only scheduling committee members can apply change requests' },
        { status: 403 }
      );
    }
    
    // Apply the change request
    const result = await applyChangeRequest(supabase, params.id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to apply change request' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Change request applied successfully',
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

