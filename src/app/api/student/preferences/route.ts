/**
 * Student Preferences API
 * GET: Retrieve student's submitted preferences
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
    const includeDrafts = searchParams.get('include_drafts') === 'true';
    
    // Build query
    let query = supabase
      .from('elective_preferences')
      .select(`
        id,
        student_id,
        term_code,
        course_code,
        preference_order,
        is_submitted,
        submitted_at,
        created_at,
        course:course_code (
          code,
          name_en,
          name_ar,
          credits
        )
      `)
      .eq('student_id', user.id)
      .order('preference_order', { ascending: true });
    
    // Filter by term if provided
    if (termCode) {
      query = query.eq('term_code', termCode);
    }
    
    // Filter by submission status
    if (!includeDrafts) {
      query = query.eq('is_submitted', true);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch preferences' },
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
