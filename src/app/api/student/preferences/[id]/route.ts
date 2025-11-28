/**
 * Student Preference Detail API
 * PUT: Update preference order
 * DELETE: Delete a preference
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for update
const updatePreferenceSchema = z.object({
  preference_order: z.number().int().min(1).max(10),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const { id } = params;
    
    // Verify preference exists and belongs to user
    const { data: existing, error: fetchError } = await supabase
      .from('elective_preferences')
      .select('*')
      .eq('id', id)
      .eq('student_id', user.id)
      .single();
    
    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Preference not found' },
        { status: 404 }
      );
    }
    
    // Check if already submitted - cannot modify
    if (existing.is_submitted) {
      return NextResponse.json(
        { error: 'Cannot modify submitted preferences. Please contact your advisor.' },
        { status: 403 }
      );
    }
    
    // Parse and validate body
    const body = await request.json();
    const validated = updatePreferenceSchema.parse(body);
    
    // Update preference
    const { data, error } = await supabase
      .from('elective_preferences')
      .update({ 
        preference_order: validated.preference_order,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('student_id', user.id) // Double-check ownership
      .select()
      .single();
    
    if (error) {
      console.error('Update error:', error);
      return NextResponse.json(
        { error: 'Failed to update preference' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Preference updated successfully',
      data
    });
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const { id } = params;
    
    // Verify preference exists and belongs to user
    const { data: existing, error: fetchError } = await supabase
      .from('elective_preferences')
      .select('*')
      .eq('id', id)
      .eq('student_id', user.id)
      .single();
    
    if (fetchError || !existing) {
      return NextResponse.json(
        { error: 'Preference not found' },
        { status: 404 }
      );
    }
    
    // Check if already submitted - cannot delete
    if (existing.is_submitted) {
      return NextResponse.json(
        { error: 'Cannot delete submitted preferences. Please contact your advisor.' },
        { status: 403 }
      );
    }
    
    // Delete preference
    const { error } = await supabase
      .from('elective_preferences')
      .delete()
      .eq('id', id)
      .eq('student_id', user.id); // Double-check ownership
    
    if (error) {
      console.error('Delete error:', error);
      return NextResponse.json(
        { error: 'Failed to delete preference' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Preference deleted successfully'
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

