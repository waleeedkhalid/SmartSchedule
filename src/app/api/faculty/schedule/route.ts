/**
 * Faculty Teaching Schedule API
 * GET: View faculty's teaching schedule
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
    
    // Verify faculty exists
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('id, name_en, name_ar, department')
      .eq('id', user.id)
      .single();
    
    if (facultyError || !faculty) {
      return NextResponse.json(
        { error: 'Faculty profile not found' },
        { status: 404 }
      );
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const termCode = searchParams.get('term_code');
    
    // Get active term if not specified
    let activeTermCode = termCode;
    if (!activeTermCode) {
      const { data: activeTerm } = await supabase
        .from('academic_term')
        .select('code')
        .eq('is_active', true)
        .single();
      
      activeTermCode = activeTerm?.code;
    }
    
    if (!activeTermCode) {
      return NextResponse.json(
        { error: 'No active term found. Please specify term_code.' },
        { status: 400 }
      );
    }
    
    // Get sections assigned to this faculty
    const { data: sections, error: sectionsError } = await supabase
      .from('section')
      .select(`
        section_id,
        section_number,
        course_code,
        term_code,
        capacity,
        instructor_id,
        room_number,
        course:course_code (
          code,
          name_en,
          name_ar,
          credits,
          type
        ),
        room:room_number (
          number,
          name_en,
          name_ar,
          capacity,
          type
        )
      `)
      .eq('instructor_id', user.id)
      .eq('term_code', activeTermCode);
    
    if (sectionsError) {
      console.error('Sections error:', sectionsError);
      return NextResponse.json(
        { error: 'Failed to fetch teaching schedule' },
        { status: 500 }
      );
    }
    
    // Get time slots for these sections
    const sectionIds = sections?.map(s => s.section_id) || [];
    
    let sectionsWithTimes = sections || [];
    
    if (sectionIds.length > 0) {
      const { data: times, error: timesError } = await supabase
        .from('section_time')
        .select('*')
        .in('section_id', sectionIds);
      
      if (timesError) {
        console.error('Times error:', timesError);
      } else {
        // Group times by section_id
        const timesBySection = times?.reduce((acc, time) => {
          if (!acc[time.section_id]) {
            acc[time.section_id] = [];
          }
          acc[time.section_id].push({
            day: time.day,
            start_time: time.start_time,
            end_time: time.end_time,
          });
          return acc;
        }, {} as Record<string, Array<{ day_of_week: string; start_time: string; end_time: string }>>) || {};
        
        // Add times to sections
        sectionsWithTimes = sections.map(section => ({
          ...section,
          times: timesBySection[section.section_id] || [],
        }));
      }
    }
    
    // Calculate statistics
    const totalSections = sectionsWithTimes.length;
    const totalCredits = sectionsWithTimes.reduce((sum, s) => {
      return sum + (s.course?.credits || 0);
    }, 0);
    
    const sectionsByType = sectionsWithTimes.reduce((acc, s) => {
      const type = s.course?.type || 'UNKNOWN';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return NextResponse.json({ 
      success: true,
      data: {
        faculty: {
          id: faculty.id,
          name_en: faculty.name_en,
          name_ar: faculty.name_ar,
          department: faculty.department,
        },
        term_code: activeTermCode,
        sections: sectionsWithTimes,
        statistics: {
          total_sections: totalSections,
          total_credits: totalCredits,
          sections_by_type: sectionsByType,
        }
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
