/**
 * Student Electives API
 * GET: List available elective courses
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
    
    // Get active elective courses
    const { data, error } = await supabase
      .from('course')
      .select(`
        code,
        name_en,
        name_ar,
        credits,
        description_en,
        description_ar,
        prerequisites
      `)
      .eq('type', 'ELECTIVE')
      .eq('is_active', true)
      .order('code');
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch elective courses' },
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
