import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/academic/events
 * Get all term events with optional filters
 * Query params:
 * - term_code: string - Filter by term code
 * - event_type: string - Filter by event type
 * - category: string - Filter by category
 * - active: boolean - Filter for currently active events
 * - upcoming: boolean - Filter for upcoming events
 * - days_ahead: number - Number of days to look ahead for upcoming events (default: 30)
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);
    const searchParams = request.nextUrl.searchParams;
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Build query
    let query = supabase
      .from('term_events')
      .select('*')
      .order('start_date', { ascending: true });

    // Apply filters
    const termCode = searchParams.get('term_code');
    if (termCode) {
      query = query.eq('term_code', termCode);
    }

    const eventType = searchParams.get('event_type');
    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    const category = searchParams.get('category');
    if (category) {
      query = query.eq('category', category);
    }

    // Filter for active events (happening now)
    const activeFilter = searchParams.get('active');
    if (activeFilter === 'true') {
      const now = new Date().toISOString();
      query = query.lte('start_date', now).gte('end_date', now);
    }

    // Filter for upcoming events
    const upcomingFilter = searchParams.get('upcoming');
    if (upcomingFilter === 'true') {
      const now = new Date().toISOString();
      const daysAhead = parseInt(searchParams.get('days_ahead') || '30', 10);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      
      query = query
        .gte('start_date', now)
        .lte('start_date', futureDate.toISOString());
    }

    // Execute query
    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching term events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch term events', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: events,
      count: events?.length || 0
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/academic/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/academic/events
 * Create a new term event
 * Requires committee role
 */
export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!term_code || !title || !event_type || !start_date || !end_date) {
      return NextResponse.json(
        { error: 'Missing required fields: term_code, title, event_type, start_date, end_date' },
        { status: 400 }
      );
    }

    // Validate date range
    if (new Date(end_date) < new Date(start_date)) {
      return NextResponse.json(
        { error: 'end_date must be after or equal to start_date' },
        { status: 400 }
      );
    }

    // Insert event
    const { data: event, error: insertError } = await supabase
      .from('term_events')
      .insert({
        term_code,
        title,
        description,
        event_type,
        category: category || 'academic',
        start_date,
        end_date,
        is_recurring: is_recurring || false,
        metadata: metadata || {}
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating term event:', insertError);
      return NextResponse.json(
        { error: 'Failed to create term event', details: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: event
    }, { status: 201 });

  } catch (error) {
    console.error('Unexpected error in POST /api/academic/events:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

