/**
 * Individual Student Enrollment API Route
 * 
 * Endpoints:
 * - DELETE: Drop an enrollment (mark as dropped)
 * 
 * Authorization: Students can only drop their own enrollments
 * 
 * Note: We mark enrollments as 'dropped' rather than deleting them
 * to maintain an audit trail of registration activity
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { dropEnrollment } from '@/lib/db/student-enrollments';

/**
 * DELETE /api/student/enrollments/[id]
 * Drop an enrollment (update status to 'dropped')
 * 
 * Path Parameters:
 * - id: UUID of the enrollment to drop
 * 
 * Authorization:
 * - Student must own the enrollment
 * - Enrollment must have status='registered'
 * 
 * Returns:
 * - 200: Enrollment dropped successfully
 * - 401: Not authenticated
 * - 403: Not authorized (not a student or not owner)
 * - 404: Enrollment not found
 * - 500: Server error
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: enrollmentId } = await params;
    
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
        { error: 'Only students can drop enrollments' },
        { status: 403 }
      );
    }
    
    // Drop enrollment
    // The dropEnrollment function verifies:
    // 1. Student owns this enrollment
    // 2. Enrollment is currently 'registered'
    // Then updates status to 'dropped' and sets dropped_at timestamp
    const result = await dropEnrollment(enrollmentId, user.id);
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to drop enrollment' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Enrollment dropped successfully'
    });
    
  } catch (error) {
    console.error('Error dropping enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to drop enrollment' },
      { status: 500 }
    );
  }
}

