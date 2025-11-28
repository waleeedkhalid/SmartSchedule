/**
 * Faculty Availability API
 * GET: Retrieve faculty availability
 * POST: Submit/update faculty availability
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for availability
const availabilitySchema = z.object({
  availability_data: z.record(z.any()), // JSONB - flexible structure
  notes: z.string().max(500).optional(),
  preferred_load: z.number().int().min(0).max(18).optional(),
  term_code: z.string().optional(),
});

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
    
    // Build query
    let query = supabase
      .from('faculty_availability')
      .select(`
        id,
        faculty_id,
        term_code,
        availability_data,
        notes,
        preferred_load,
        created_at,
        updated_at
      `)
      .eq('faculty_id', user.id)
      .order('created_at', { ascending: false });
    
    // Filter by term if provided
    if (termCode) {
      query = query.eq('term_code', termCode);
      
      const { data: availability, error } = await query.maybeSingle();
      
      if (error) {
        console.error('Database error:', error);
        return NextResponse.json(
          { error: 'Failed to fetch availability' },
          { status: 500 }
        );
      }
      
      if (!availability) {
        return NextResponse.json(
          { 
            success: true,
            message: 'No availability submitted for this term',
            data: null
          },
          { status: 200 }
        );
      }
      
      return NextResponse.json({ 
        success: true,
        data: availability
      });
    }
    
    // Get all availability records if no term specified
    const { data: availabilities, error } = await query;
    
    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch availability records' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      data: availabilities || [],
      count: availabilities?.length || 0
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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
    
    // Verify faculty exists
    const { data: faculty, error: facultyError } = await supabase
      .from('faculty')
      .select('id, status')
      .eq('id', user.id)
      .single();
    
    if (facultyError || !faculty) {
      return NextResponse.json(
        { error: 'Faculty profile not found' },
        { status: 404 }
      );
    }
    
    // Check faculty status
    if (faculty.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: `Cannot submit availability. Faculty status: ${faculty.status}` },
        { status: 403 }
      );
    }
    
    // Parse and validate body
    const body = await request.json();
    const validated = availabilitySchema.parse(body);
    
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
    
    // Check if availability already exists for this term
    const { data: existing, error: existingError } = await supabase
      .from('faculty_availability')
      .select('id')
      .eq('faculty_id', user.id)
      .eq('term_code', termCode)
      .maybeSingle();
    
    if (existingError) {
      console.error('Existing check error:', existingError);
    }
    
    // Upsert availability
    const availabilityData = {
      faculty_id: user.id,
      term_code: termCode,
      availability_data: validated.availability_data,
      notes: validated.notes || null,
      preferred_load: validated.preferred_load || null,
      updated_at: new Date().toISOString(),
    };
    
    let result;
    
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('faculty_availability')
        .update(availabilityData)
        .eq('id', existing.id)
        .select()
        .single();
      
      if (error) {
        console.error('Update error:', error);
        return NextResponse.json(
          { error: 'Failed to update availability' },
          { status: 500 }
        );
      }
      
      result = data;
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('faculty_availability')
        .insert({
          ...availabilityData,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();
      
      if (error) {
        console.error('Insert error:', error);
        return NextResponse.json(
          { error: 'Failed to submit availability' },
          { status: 500 }
        );
      }
      
      result = data;
    }
    
    return NextResponse.json({ 
      success: true,
      message: existing ? 'Availability updated successfully' : 'Availability submitted successfully',
      data: result
    }, { status: existing ? 200 : 201 });
    
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
