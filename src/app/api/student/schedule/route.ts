/**
 * Student Schedule API
 * GET: View published schedule (read-only)
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
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const termCode = searchParams.get('term_code');
    
    // Build query
    let query = supabase
      .from('schedules')
      .select(`
        id,
        student_id,
        term_code,
        version,
        data,
        is_published,
        created_at,
        updated_at
      `)
      .eq('student_id', user.id)
      .eq('is_published', true)
      .order('created_at', { ascending: false });
    
    // Filter by term if provided
    if (termCode) {
      query = query.eq('term_code', termCode);
      
      // Get single schedule for specific term
      const { data: schedule, error } = await query.maybeSingle();
      
      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch schedule' },
          { status: 500 }
        );
      }
      
      if (!schedule) {
        return NextResponse.json(
          { 
            success: true,
            message: 'No published schedule found for this term',
            data: null
          },
          { status: 200 }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        data: schedule
      });
    }
    
    // Get all published schedules if no term specified
    const { data: schedules, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch schedules' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      data: schedules || [],
      count: schedules?.length || 0
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
