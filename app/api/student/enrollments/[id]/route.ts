/**
 * Individual Section Drop API Route
 * 
 * REFACTORED: Now drops section using drop_section() database function
 * 
 * Endpoints:
 * - DELETE: Drop a section (removes section_assignment, updates enrollment status)
 * 
 * Authorization: Students can only drop their own sections
 * 
 * Note: [id] parameter is now section_id (not enrollment_id)
 * The database function handles both section_assignment and course_enrollment updates
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { dropSection } from '@/lib/db/enrollments';

/**
 * DELETE /api/student/enrollments/[id]
 * Drop a section (uses drop_section() database function)
 * 
 * Path Parameters:
 * - id: UUID of the section to drop (section_id)
 * 
 * Authorization:
 * - Student must be enrolled in the section
 * - Uses drop_section() database function for validation
 * 
 * Database function handles:
 * - Removes section_assignment record
 * - Updates course_enrollment status to 'dropped' if no other sections
 * - Updates section enrollment count cache
 * 
 * Returns:
 * - 200: Section dropped successfully
 * - 401: Not authenticated
 * - 403: Not authorized (not a student)
 * - 400: Validation failed (not enrolled, etc.)
 * - 500: Server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sectionId } = await params;
    
    // Authentication check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Verify user is a student - USING AUTH UTILITY
    const { requireRole } = await import('@/lib/utils/auth');
    try {
      await requireRole('student');
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: 'Only students can drop sections' },
        { status: 403 }
      );
    }
    
    // Drop section using database function
    // This handles validation and updates both section_assignment and course_enrollment
    const result = await dropSection(user.id, sectionId);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to drop section' },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Section dropped successfully'
    });
    
  } catch (error) {
    console.error('Error dropping section:', error);
    return NextResponse.json(
      { error: 'Failed to drop section' },
      { status: 500 }
    );
  }
}

