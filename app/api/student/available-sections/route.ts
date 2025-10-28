/**
 * Available Elective Sections API Route
 * 
 * Purpose: List elective sections available for student registration
 * 
 * IMPORTANT: Electives have NO level restrictions! Students can register for any elective
 * regardless of their level, as long as they meet prerequisites and credit requirements.
 * 
 * Section Data Includes:
 * - Course information (title, credits, level - for organization only)
 * - Instructor details
 * - Meeting times and room
 * - Capacity and enrollment counts
 * - Seat availability
 * 
 * Filtering:
 * - Prerequisites (validated at enrollment time)
 * - Credit limits (max 20 total)
 * - Section capacity
 * - Elective group requirements
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { getAvailableElectiveSections } from '@/lib/db/student-enrollments';

/**
 * GET /api/student/available-sections
 * Fetch all elective sections available for registration
 * 
 * Query Parameters:
 * - available_only: If 'true', only show sections with available seats
 * 
 * Returns:
 * - 200: Array of all elective sections with capacity info
 * - 401: Not authenticated
 * - 403: Not a student
 * - 500: Server error
 */
export async function GET(request: NextRequest) {
  try {
    // Authentication check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify user is a student
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (roleError || !userRole || userRole.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can view available sections' },
        { status: 403 }
      );
    }
    
    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const availableOnly = searchParams.get('available_only') === 'true';
    
    // Fetch ALL available elective sections (no level filtering!)
    // Students can register for any elective if they meet prerequisites and credit limits
    let sections = await getAvailableElectiveSections();
    
    // Filter to only sections with available seats if requested
    if (availableOnly) {
      sections = sections.filter(s => !s.is_full);
    }
    
    return NextResponse.json({
      sections,
      total: sections.length,
      available_count: sections.filter(s => !s.is_full).length,
      full_count: sections.filter(s => s.is_full).length,
    });
    
  } catch (error) {
    console.error('Error fetching available sections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available sections' },
      { status: 500 }
    );
  }
}

