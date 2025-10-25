import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/academic/events/[id]
 * Get a single term event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch event
    const { data: event, error } = await supabase
      .from('term_events')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching term event:', error);
      return NextResponse.json(
        { error: 'Failed to fetch term event', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/academic/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/academic/events/[id]
 * Update a term event
 * Requires committee role
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    
    // Check if user is authenticated and has committee role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Failed to verify user role' },
        { status: 403 }
      );
    }

    const committeeRoles = ['scheduling_committee', 'teaching_load_committee', 'registrar'];
    if (!committeeRoles.includes(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Committee role required.' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const {
      term_code,
      title,
      description,
      event_type,
      category,
      start_date,
      end_date,
      is_recurring,
      metadata
    } = body;

    // Validate date range if both dates are provided
    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      return NextResponse.json(
        { error: 'end_date must be after or equal to start_date' },
        { status: 400 }
      );
    }

    // Build update object (only include provided fields)
    const updateData: any = {};
    if (term_code !== undefined) updateData.term_code = term_code;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (event_type !== undefined) updateData.event_type = event_type;
    if (category !== undefined) updateData.category = category;
    if (start_date !== undefined) updateData.start_date = start_date;
    if (end_date !== undefined) updateData.end_date = end_date;
    if (is_recurring !== undefined) updateData.is_recurring = is_recurring;
    if (metadata !== undefined) updateData.metadata = metadata;

    // Update event
    const { data: event, error: updateError } = await supabase
      .from('term_events')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Event not found' },
          { status: 404 }
        );
      }
      console.error('Error updating term event:', updateError);
      return NextResponse.json(
        { error: 'Failed to update term event', details: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event
    });

  } catch (error) {
    console.error('Unexpected error in PATCH /api/academic/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/academic/events/[id]
 * Delete a term event
 * Requires committee role
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    
    // Check if user is authenticated and has committee role
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check user role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'Failed to verify user role' },
        { status: 403 }
      );
    }

    const committeeRoles = ['scheduling_committee', 'teaching_load_committee', 'registrar'];
    if (!committeeRoles.includes(userData.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions. Committee role required.' },
        { status: 403 }
      );
    }

    // Delete event
    const { error: deleteError } = await supabase
      .from('term_events')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting term event:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete term event', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully'
    });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/academic/events/[id]:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

