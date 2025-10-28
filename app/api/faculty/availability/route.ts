import { NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { 
  getFacultyProfile, 
  getFacultyAvailability, 
  updateFacultyAvailability,
  type WeeklyAvailability
} from '@/lib/db/faculty';

/**
 * GET /api/faculty/availability
 * Fetch current faculty member's availability preferences
 */
export async function GET() {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify faculty role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (!userRole || userRole.role !== 'faculty') {
      return NextResponse.json(
        { error: 'Access denied. Faculty role required.' },
        { status: 403 }
      );
    }
    
    // Get faculty profile
    const instructor = await getFacultyProfile(user.id);
    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor profile not found. Please contact administration.' },
        { status: 404 }
      );
    }
    
    // Get availability preferences
    const availability = await getFacultyAvailability(instructor.id);
    
    return NextResponse.json({
      instructor_id: instructor.id,
      max_load_per_week: instructor.max_load_per_week,
      preferred_times: availability?.preferred_times || [],
      unavailable_times: availability?.unavailable_times || [],
    });
  } catch (error) {
    console.error('Error fetching faculty availability:', error);
    return NextResponse.json(
      { error: 'Failed to fetch availability preferences' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/faculty/availability
 * Update faculty member's availability preferences
 * 
 * Body: {
 *   preferred_times?: WeeklyAvailability,
 *   unavailable_times?: WeeklyAvailability
 * }
 */
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    
    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Verify faculty role
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (!userRole || userRole.role !== 'faculty') {
      return NextResponse.json(
        { error: 'Access denied. Faculty role required.' },
        { status: 403 }
      );
    }
    
    // Get faculty profile
    const instructor = await getFacultyProfile(user.id);
    if (!instructor) {
      return NextResponse.json(
        { error: 'Instructor profile not found. Please contact administration.' },
        { status: 404 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { preferred_times, unavailable_times } = body;
    
    // Validate data (basic validation)
    if (preferred_times !== undefined && !Array.isArray(preferred_times)) {
      return NextResponse.json(
        { error: 'preferred_times must be an array' },
        { status: 400 }
      );
    }
    
    if (unavailable_times !== undefined && !Array.isArray(unavailable_times)) {
      return NextResponse.json(
        { error: 'unavailable_times must be an array' },
        { status: 400 }
      );
    }
    
    // Update availability
    const result = await updateFacultyAvailability(instructor.id, {
      preferred_times: preferred_times as WeeklyAvailability | undefined,
      unavailable_times: unavailable_times as WeeklyAvailability | undefined,
    });
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update availability' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Availability preferences updated successfully',
      instructor: result.instructor,
    });
  } catch (error) {
    console.error('Error updating faculty availability:', error);
    return NextResponse.json(
      { error: 'Failed to update availability preferences' },
      { status: 500 }
    );
  }
}

