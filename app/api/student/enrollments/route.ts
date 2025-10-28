/**
 * Student Enrollments API Route
 * 
 * Endpoints:
 * - GET: Fetch student's current enrollments
 * - POST: Enroll in an elective section
 * 
 * Authorization: Students can only access their own enrollments
 * 
 * Validation Flow (POST):
 * 1. Verify authenticated and is a student
 * 2. Check credit limit (≤20 total credits)
 * 3. Verify section has available seats
 * 4. Confirm prerequisites met (V1: auto-pass)
 * 5. Create enrollment record
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { 
  getStudentEnrollments, 
  enrollInSection,
  getEnrollmentStats
} from '@/lib/db/student-enrollments';

/**
 * GET /api/student/enrollments
 * Fetch all active enrollments for the authenticated student
 * 
 * Query Parameters:
 * - stats: If 'true', returns enrollment statistics instead of full list
 * 
 * Returns:
 * - 200: Array of enrollments with course/section details
 * - 401: Not authenticated or not a student
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
        { error: 'Only students can access enrollments' },
        { status: 403 }
      );
    }
    
    // Check if stats requested
    const { searchParams } = new URL(request.url);
    const wantsStats = searchParams.get('stats') === 'true';
    
    if (wantsStats) {
      // Return enrollment statistics
      const stats = await getEnrollmentStats(user.id);
      return NextResponse.json(stats);
    }
    
    // Fetch full enrollment list
    const enrollments = await getStudentEnrollments(user.id);
    
    return NextResponse.json(enrollments);
    
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch enrollments' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/student/enrollments
 * Enroll student in an elective section
 * 
 * Request Body:
 * {
 *   section_id: string  // UUID of the section to enroll in
 * }
 * 
 * Validation:
 * 1. Student authentication
 * 2. Credit limit check (total ≤ 20)
 * 3. Section capacity check (seats available)
 * 4. Prerequisites check (V1: always pass)
 * 5. No duplicate enrollment
 * 
 * Returns:
 * - 201: Enrollment created successfully
 * - 400: Validation failed (credit limit, capacity, etc.)
 * - 401: Not authenticated
 * - 403: Not a student
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
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
      .select('role, level')
      .eq('user_id', user.id)
      .single();
    
    if (roleError || !userRole || userRole.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can enroll in sections' },
        { status: 403 }
      );
    }
    
    // Verify student has a level set
    if (!userRole.level) {
      return NextResponse.json(
        { error: 'Student level not set. Contact administrator.' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { section_id } = body;
    
    if (!section_id) {
      return NextResponse.json(
        { error: 'section_id is required' },
        { status: 400 }
      );
    }
    
    // Validate and create enrollment
    // This function handles all validation logic:
    // - Credit limit (≤20)
    // - Section capacity
    // - Prerequisites
    // - Duplicate check
    const result = await enrollInSection(user.id, section_id);
    
    if (!result.success) {
      // Validation failed - return user-friendly error
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    // Success! Return enrollment details
    return NextResponse.json(
      { 
        success: true,
        enrollment_id: result.enrollmentId,
        message: 'Successfully enrolled in section'
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating enrollment:', error);
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    );
  }
}

