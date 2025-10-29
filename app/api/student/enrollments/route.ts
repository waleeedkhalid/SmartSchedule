/**
 * Student Enrollments API Route
 * 
 * REFACTORED: Using dual enrollment model (course_enrollment + section_assignment)
 * 
 * Endpoints:
 * - GET: Fetch student's current enrollments with sections
 * - POST: Enroll in a section (creates both course enrollment and section assignment)
 * 
 * Authorization: Students can only access their own enrollments
 * 
 * Validation Flow (POST):
 * 1. Verify authenticated and is a student
 * 2. Use validate_enrollment() database function
 * 3. Use assign_student_to_section() database function
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/supabase/server';
import { 
  getStudentEnrollmentsWithSections,
  assignStudentToSection,
  validateEnrollment,
  getStudentTotalCredits
} from '@/lib/db/enrollments';
import { getCurrentSemester } from '@/lib/db/semesters';
import { getStudentProfile } from '@/lib/db/student-profiles';

/**
 * GET /api/student/enrollments
 * Fetch all active enrollments for the authenticated student
 * 
 * Query Parameters:
 * - semester_id: Optional semester ID (defaults to current semester)
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
      .maybeSingle();
    
    if (roleError || !userRole || userRole.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can access enrollments' },
        { status: 403 }
      );
    }
    
    // Get semester ID (from query param or current)
    const { searchParams } = new URL(request.url);
    const semesterId = searchParams.get('semester_id');
    const wantsStats = searchParams.get('stats') === 'true';
    
    if (wantsStats) {
      // Return enrollment statistics
      const currentSemester = await getCurrentSemester();
      const totalCredits = await getStudentTotalCredits(user.id, semesterId || currentSemester?.id);
      const profile = await getStudentProfile(user.id);
      
      return NextResponse.json({
        total_credits: totalCredits,
        max_credits: profile?.max_credits_allowed || 21,
        remaining_credits: (profile?.max_credits_allowed || 21) - totalCredits
      });
    }
    
    // Fetch enrollments with section details
    const enrollments = await getStudentEnrollmentsWithSections(user.id, semesterId || undefined);
    
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
 * Enroll student in a section (creates both course enrollment and section assignment)
 * 
 * Request Body:
 * {
 *   section_id: string  // UUID of the section to enroll in
 *   enrollment_type?: 'required' | 'elective' | 'retake'  // Optional, defaults to 'elective'
 * }
 * 
 * Validation:
 * Uses validate_enrollment() and assign_student_to_section() database functions
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
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (roleError || !userRole || userRole.role !== 'student') {
      return NextResponse.json(
        { error: 'Only students can enroll in sections' },
        { status: 403 }
      );
    }
    
    // Verify student has a profile
    const profile = await getStudentProfile(user.id);
    if (!profile) {
      return NextResponse.json(
        { error: 'Student profile not found. Contact administrator.' },
        { status: 400 }
      );
    }
    
    // Parse request body
    const body = await request.json();
    const { section_id, enrollment_type } = body;
    
    if (!section_id) {
      return NextResponse.json(
        { error: 'section_id is required' },
        { status: 400 }
      );
    }
    
    // Validate enrollment first
    const validation = await validateEnrollment(user.id, section_id);
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, validation },
        { status: 400 }
      );
    }
    
    // Create enrollment using database function
    const result = await assignStudentToSection(
      user.id,
      section_id,
      enrollment_type || 'elective'
    );
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }
    
    // Success! Return enrollment details
    return NextResponse.json(
      { 
        success: true,
        enrollment_id: result.enrollment_id,
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

