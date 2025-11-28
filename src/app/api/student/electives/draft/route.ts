/**
 * Student Elective Preferences Draft API
 * POST: Save draft preferences (not submitted)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for draft preferences
const draftPreferenceSchema = z.object({
  preferences: z.array(
    z.object({
      course_code: z.string().min(1).max(10),
      preference_order: z.number().int().min(1).max(10),
    })
  ),
  term_code: z.string().optional(),
});

export async function POST(request: NextRequest) {
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
    
    // Get student profile
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
    
    // Parse and validate body
    const body = await request.json();
    const validated = draftPreferenceSchema.parse(body);
    
    // Get active term if not provided
    let termCode = validated.term_code;
    if (!termCode) {
      const { data: activeTerm } = await supabase
        .from('academic_term')
        .select('code')
        .eq('is_active', true)
        .single();
      
      if (!activeTerm) {
        return NextResponse.json(
          { error: 'No active term found' },
          { status: 400 }
        );
      }
      
      termCode = activeTerm.code;
    }
    
    // Validate course codes exist and are electives
    const courseCodes = validated.preferences.map(p => p.course_code);
    const { data: courses, error: coursesError } = await supabase
      .from('course')
      .select('code, type, is_active')
      .in('code', courseCodes);
    
    if (coursesError) {
      return NextResponse.json(
        { error: 'Failed to validate courses' },
        { status: 500 }
      );
    }
    
    // Check all courses are valid electives
    const invalidCourses = courseCodes.filter(
      code => !courses?.some(c => c.code === code && c.type === 'ELECTIVE' && c.is_active)
    );
    
    if (invalidCourses.length > 0) {
      return NextResponse.json(
        { 
          error: 'Invalid course codes',
          details: `The following courses are not valid electives: ${invalidCourses.join(', ')}`
        },
        { status: 400 }
      );
    }
    
    // Delete existing draft preferences for this student and term
    await supabase
      .from('elective_preferences')
      .delete()
      .eq('student_id', user.id)
      .eq('term_code', termCode)
      .eq('is_submitted', false);
    
    // Insert draft preferences
    const preferencesToInsert = validated.preferences.map(p => ({
      student_id: user.id,
      term_code: termCode,
      course_code: p.course_code,
      preference_order: p.preference_order,
      is_submitted: false,
    }));
    
    const { error: insertError } = await supabase
      .from('elective_preferences')
      .insert(preferencesToInsert);
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save draft preferences' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Draft preferences saved successfully',
      count: preferencesToInsert.length
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.issues 
        },
        { status: 400 }
      );
    }
    
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
