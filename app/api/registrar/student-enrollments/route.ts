import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

/**
 * GET /api/registrar/student-enrollments
 * Get all student enrollments with filters
 * Auth: Registrar only
 * 
 * Query params:
 * - student_id (optional): Filter by student
 * - section_id (optional): Filter by section
 * - status (optional): Filter by status (registered/dropped)
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Authorization check - must be registrar
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (roleError || userRole?.role !== 'registrar') {
      return NextResponse.json(
        { error: 'Forbidden - Registrar access required' },
        { status: 403 }
      )
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams
    const studentId = searchParams.get('student_id')
    const sectionId = searchParams.get('section_id')
    const status = searchParams.get('status')
    
    // Build query
    let query = supabase
      .from('student_enrollment')
      .select(`
        *,
        student:user_roles!student_enrollment_student_id_fkey(
          user_id,
          name,
          email,
          level
        ),
        section:section!student_enrollment_section_id_fkey(
          *,
          course:course!section_course_code_fkey(
            code,
            title,
            level,
            credits,
            is_elective
          ),
          instructor:instructor!section_instructor_id_fkey(
            id,
            name,
            email
          ),
          room:room!section_room_code_fkey(
            code,
            type
          )
        )
      `)
      .order('enrolled_at', { ascending: false })
    
    // Apply filters
    if (studentId) {
      query = query.eq('student_id', studentId)
    }
    
    if (sectionId) {
      query = query.eq('section_id', sectionId)
    }
    
    if (status) {
      query = query.eq('status', status)
    }
    
    const { data, error } = await query
    
    if (error) throw error
    
    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error fetching student enrollments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch student enrollments' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/registrar/student-enrollments
 * Manually register a student in a section
 * Auth: Registrar only
 * 
 * This endpoint bypasses normal validation rules for special cases:
 * - Overriding capacity limits
 * - Overriding credit limits
 * - Special permissions/exceptions
 * 
 * Body:
 * {
 *   "student_id": "uuid",
 *   "section_id": "uuid",
 *   "bypass_validation": true
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Authorization check - must be registrar
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (roleError || userRole?.role !== 'registrar') {
      return NextResponse.json(
        { error: 'Forbidden - Registrar access required' },
        { status: 403 }
      )
    }
    
    // Parse request body
    const body = await request.json()
    
    if (!body.student_id || !body.section_id) {
      return NextResponse.json(
        { error: 'student_id and section_id are required' },
        { status: 400 }
      )
    }
    
    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from('user_roles')
      .select('role, name, email')
      .eq('user_id', body.student_id)
      .single()
    
    if (studentError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }
    
    if (student.role !== 'student') {
      return NextResponse.json(
        { error: 'User must have student role' },
        { status: 400 }
      )
    }
    
    // Verify section exists
    const { data: section, error: sectionError } = await supabase
      .from('section')
      .select(`
        *,
        course:course!section_course_code_fkey(
          code,
          title,
          credits
        )
      `)
      .eq('id', body.section_id)
      .single()
    
    if (sectionError || !section) {
      return NextResponse.json(
        { error: 'Section not found' },
        { status: 404 }
      )
    }
    
    // Check if already enrolled
    const { data: existing, error: existingError } = await supabase
      .from('student_enrollment')
      .select('id, status')
      .eq('student_id', body.student_id)
      .eq('section_id', body.section_id)
      .maybeSingle()
    
    if (existingError) {
      console.error('Error checking existing enrollment:', existingError)
    }
    
    if (existing) {
      if (existing.status === 'registered') {
        return NextResponse.json(
          { error: 'Student is already enrolled in this section' },
          { status: 409 }
        )
      } else {
        // Re-activate dropped enrollment
        const { data: reactivated, error: updateError } = await supabase
          .from('student_enrollment')
          .update({
            status: 'registered',
            enrolled_at: new Date().toISOString(),
            dropped_at: null,
          })
          .eq('id', existing.id)
          .select()
          .single()
        
        if (updateError) throw updateError
        
        return NextResponse.json({
          ...reactivated,
          message: 'Re-activated previous enrollment'
        }, { status: 200 })
      }
    }
    
    // If bypass_validation is not set, perform basic checks
    if (!body.bypass_validation) {
      // Check section capacity
      const { count, error: countError } = await supabase
        .from('student_enrollment')
        .select('*', { count: 'exact', head: true })
        .eq('section_id', body.section_id)
        .eq('status', 'registered')
      
      if (countError) {
        console.error('Error checking capacity:', countError)
      } else if (count !== null && count >= section.capacity) {
        return NextResponse.json(
          {
            error: 'Section is full',
            capacity: section.capacity,
            enrolled: count,
            hint: 'Set bypass_validation: true to override capacity limit'
          },
          { status: 409 }
        )
      }
    }
    
    // Create enrollment
    const { data: enrollment, error: enrollError } = await supabase
      .from('student_enrollment')
      .insert({
        student_id: body.student_id,
        section_id: body.section_id,
        status: 'registered',
      })
      .select(`
        *,
        student:user_roles!student_enrollment_student_id_fkey(
          user_id,
          name,
          email
        ),
        section:section!student_enrollment_section_id_fkey(
          *,
          course:course!section_course_code_fkey(
            code,
            title,
            credits
          )
        )
      `)
      .single()
    
    if (enrollError) throw enrollError
    
    return NextResponse.json(enrollment, { status: 201 })
  } catch (error: any) {
    console.error('Error creating enrollment:', error)
    
    return NextResponse.json(
      { error: 'Failed to create enrollment' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/registrar/student-enrollments
 * Drop a student's enrollment
 * Auth: Registrar only
 * 
 * Query params:
 * - enrollment_id: UUID of the enrollment to drop
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Authentication check
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Authorization check - must be registrar
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (roleError || userRole?.role !== 'registrar') {
      return NextResponse.json(
        { error: 'Forbidden - Registrar access required' },
        { status: 403 }
      )
    }
    
    // Get query parameter
    const searchParams = request.nextUrl.searchParams
    const enrollmentId = searchParams.get('enrollment_id')
    
    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'enrollment_id query parameter is required' },
        { status: 400 }
      )
    }
    
    // Drop enrollment (update status to dropped)
    const { error: dropError } = await supabase
      .from('student_enrollment')
      .update({
        status: 'dropped',
        dropped_at: new Date().toISOString(),
      })
      .eq('id', enrollmentId)
      .eq('status', 'registered') // Only drop active enrollments
    
    if (dropError) throw dropError
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error dropping enrollment:', error)
    return NextResponse.json(
      { error: 'Failed to drop enrollment' },
      { status: 500 }
    )
  }
}

