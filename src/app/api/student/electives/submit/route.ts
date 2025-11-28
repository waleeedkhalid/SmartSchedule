/**
 * Student Elective Preferences Submit API
 * POST: Submit final preferences (3-10 courses required)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { validateAllPreferences } from '@/lib/validations/preference-validator';
import { z } from 'zod';

// Validation schema for submitted preferences
const submitPreferenceSchema = z.object({
  preferences: z.array(
    z.object({
      course_code: z.string().min(1).max(10),
      preference_order: z.number().int().min(1).max(10),
    })
  ).min(3, 'Minimum 3 preferences required').max(10, 'Maximum 10 preferences allowed'),
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
      .select('id, level, status')
      .eq('id', user.id)
      .single();
    
    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student profile not found' },
        { status: 404 }
      );
    }
    
    // Check student status
    if (student.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Cannot submit preferences. Student status: ${student.status}` },
        { status: 403 }
      );
    }
    
    // Parse and validate body
    const body = await request.json();
    const validated = submitPreferenceSchema.parse(body);
    
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
    
    // Validate with preference validator
    const validationResult = validateAllPreferences(
      validated.preferences.map(p => ({
        student_id: user.id,
        course_code: p.course_code,
        preference_order: p.preference_order,
        term_code: termCode,
      }))
    );
    
    if (!validationResult.valid) {
      return NextResponse.json(
        { 
          error: 'Preference validation failed',
          details: validationResult.errors
        },
        { status: 400 }
      );
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
    
    // Check for duplicates
    const uniqueCourses = new Set(courseCodes);
    if (uniqueCourses.size !== courseCodes.length) {
      return NextResponse.json(
        { error: 'Duplicate course codes found. Each course can only be selected once.' },
        { status: 400 }
      );
    }
    
    // Check if preferences already submitted for this term
    const { data: existingPrefs, error: existingError } = await supabase
      .from('elective_preferences')
      .select('id')
      .eq('student_id', user.id)
      .eq('term_code', termCode)
      .eq('is_submitted', true)
      .limit(1);
    
    if (existingError) {
      console.error('Existing prefs check error:', existingError);
      return NextResponse.json(
        { error: 'Failed to check existing preferences' },
        { status: 500 }
      );
    }
    
    if (existingPrefs && existingPrefs.length > 0) {
      return NextResponse.json(
        { error: 'Preferences already submitted for this term. Please contact your advisor to make changes.' },
        { status: 409 }
      );
    }
    
    // Delete any draft preferences
    await supabase
      .from('elective_preferences')
      .delete()
      .eq('student_id', user.id)
      .eq('term_code', termCode)
      .eq('is_submitted', false);
    
    // Insert submitted preferences
    const preferencesToInsert = validated.preferences.map(p => ({
      student_id: user.id,
      term_code: termCode,
      course_code: p.course_code,
      preference_order: p.preference_order,
      is_submitted: true,
      submitted_at: new Date().toISOString(),
    }));
    
    const { data: insertedData, error: insertError } = await supabase
      .from('elective_preferences')
      .insert(preferencesToInsert)
      .select();
    
    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit preferences' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Preferences submitted successfully',
      data: insertedData,
      count: insertedData.length
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
