/**
 * Faculty Sections API
 * GET: Get all sections assigned to faculty member
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
      .select('id')
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
    const includeEnrollment = searchParams.get('include_enrollment') === 'true';
    
    // Build base query
    let query = supabase
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
          type,
          level
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
      .order('term_code', { ascending: false })
      .order('course_code');
    
    // Filter by term if provided
    if (termCode) {
      query = query.eq('term_code', termCode);
    }
    
    const { data: sections, error: sectionsError } = await query;
    
    if (sectionsError) {
      console.error('Sections error:', sectionsError);
      return NextResponse.json(
        { error: 'Failed to fetch sections' },
        { status: 500 }
      );
    }
    
    // Get time slots for all sections
    const sectionIds = sections?.map(s => s.section_id) || [];
    
    let enrichedSections = sections || [];
    
    if (sectionIds.length > 0) {
      // Get times
      const { data: times } = await supabase
        .from('section_time')
        .select('*')
        .in('section_id', sectionIds);
      
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
      
      // Get enrollment counts if requested
      let enrollmentBySection: Record<string, number> = {};
      
      if (includeEnrollment) {
        const { data: enrollments } = await supabase
          .from('section_enrollment')
          .select('section_id')
          .in('section_id', sectionIds);
        
        enrollmentBySection = enrollments?.reduce((acc, e) => {
          acc[e.section_id] = (acc[e.section_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};
      }
      
      // Enrich sections with times and enrollment
      enrichedSections = sections.map(section => ({
        ...section,
        times: timesBySection[section.section_id] || [],
        ...(includeEnrollment && {
          enrolled_count: enrollmentBySection[section.section_id] || 0,
          utilization: section.capacity > 0 
            ? ((enrollmentBySection[section.section_id] || 0) / section.capacity * 100).toFixed(2)
            : '0.00',
        }),
      }));
    }
    
    // Group by term
    const sectionsByTerm = enrichedSections.reduce((acc, section) => {
      const term = section.term_code;
      if (!acc[term]) {
        acc[term] = [];
      }
      acc[term].push(section);
      return acc;
    }, {} as Record<string, Array<Record<string, unknown>>>);
    
    // Calculate statistics per term
    const statistics = Object.entries(sectionsByTerm).map(([term, termSections]) => ({
      term_code: term,
      total_sections: termSections.length,
      total_credits: termSections.reduce((sum, s) => sum + (s.course?.credits || 0), 0),
      sections_by_type: termSections.reduce((acc, s) => {
        const type = s.course?.type || 'UNKNOWN';
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      ...(includeEnrollment && {
        total_enrollment: termSections.reduce((sum, s) => sum + (s.enrolled_count || 0), 0),
        average_utilization: (
          termSections.reduce((sum, s) => sum + parseFloat(s.utilization || '0'), 0) / 
          termSections.length
        ).toFixed(2),
      }),
    }));
    
    return NextResponse.json({ 
      success: true,
      data: {
        sections: enrichedSections,
        sections_by_term: sectionsByTerm,
        statistics,
      },
      count: enrichedSections.length
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


