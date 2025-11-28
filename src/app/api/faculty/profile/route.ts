/**
 * Faculty Profile API
 * GET: Retrieve faculty profile information
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
    
    // Get faculty profile with user info
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select(`
        id,
        name_en,
        name_ar,
        email,
        phone,
        office_location,
        office_hours,
        department,
        title,
        specialization,
        status,
        hire_date,
        created_at,
        updated_at
      `)
      .eq('id', user.id)
      .single();
    
    if (facultyError) {
      console.error('Faculty error:', facultyError);
      return NextResponse.json(
        { error: 'Faculty profile not found' },
        { status: 404 }
      );
    }
    
    // Get current term teaching load
    const { data: activeTerm } = await supabase
      .from('academic_term')
      .select('code')
      .eq('is_active', true)
      .single();
    
    let currentLoad = null;
    
    if (activeTerm) {
      const { data: sections } = await supabase
        .from('section')
        .select(`
          section_id,
          course:course_code (
            credits
          )
        `)
        .eq('instructor_id', user.id)
        .eq('term_code', activeTerm.code);
      
      if (sections) {
        const totalCredits = sections.reduce((sum, s) => {
          return sum + (s.course?.credits || 0);
        }, 0);
        
        currentLoad = {
          term_code: activeTerm.code,
          sections_count: sections.length,
          total_credits: totalCredits,
        };
      }
    }
    
    // Get availability status for current term
    let availabilityStatus = null;
    
    if (activeTerm) {
      const { data: availability } = await supabase
        .from('faculty_availability')
        .select('id, created_at, preferred_load')
        .eq('faculty_id', user.id)
        .eq('term_code', activeTerm.code)
        .maybeSingle();
      
      availabilityStatus = {
        submitted: !!availability,
        submitted_at: availability?.created_at || null,
        preferred_load: availability?.preferred_load || null,
      };
    }
    
    return NextResponse.json({ 
      success: true,
      data: {
        ...faculty,
        current_load: currentLoad,
        availability_status: availabilityStatus,
      }
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


