import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@/lib/supabase';

/**
 * GET /api/academic/terms
 * Get all academic terms or filter by status
 * Query params:
 * - active: boolean - Filter for active terms only
 * - registration_open: boolean - Filter for terms with open registration
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
      .from('academic_term')
      .select('*')
      .order('start_date', { ascending: false });

    // Apply filters
    const activeFilter = searchParams.get('active');
    if (activeFilter === 'true') {
      query = query.eq('is_active', true);
    }

    const registrationOpenFilter = searchParams.get('registration_open');
    if (registrationOpenFilter === 'true') {
      query = query.eq('registration_open', true);
    }

    const electivesOpenFilter = searchParams.get('electives_survey_open');
    if (electivesOpenFilter === 'true') {
      query = query.eq('electives_survey_open', true);
    }

    // Execute query
    const { data: terms, error } = await query;

    if (error) {
      console.error('Error fetching academic terms:', error);
      return NextResponse.json(
        { error: 'Failed to fetch academic terms', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: terms,
      count: terms?.length || 0
    });

  } catch (error) {
    console.error('Unexpected error in GET /api/academic/terms:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

