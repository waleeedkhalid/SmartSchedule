import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import {
  getAllIrregularStudents,
  createIrregularStudent,
  type IrregularStudentInput,
} from '@/lib/db/irregular-students'

/**
 * GET /api/registrar/irregular-students
 * Get all irregular students
 * Auth: Registrar only
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
      .maybeSingle()
    
    if (roleError || userRole?.role !== 'registrar') {
      return NextResponse.json(
        { error: 'Forbidden - Registrar access required' },
        { status: 403 }
      )
    }
    
    const irregularStudents = await getAllIrregularStudents()
    
    return NextResponse.json(irregularStudents)
  } catch (error) {
    console.error('Error fetching irregular students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch irregular students' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/registrar/irregular-students
 * Create a new irregular student record
 * Auth: Registrar only
 * 
 * Body:
 * {
 *   "student_id": "uuid",
 *   "required_course_codes": ["CS101", "CS102"],
 *   "notes": "Transfer student from XYZ University"
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
      .maybeSingle()
    
    if (roleError || userRole?.role !== 'registrar') {
      return NextResponse.json(
        { error: 'Forbidden - Registrar access required' },
        { status: 403 }
      )
    }
    
    // Parse and validate request body
    const body = await request.json()
    
    if (!body.student_id) {
      return NextResponse.json(
        { error: 'student_id is required' },
        { status: 400 }
      )
    }
    
    if (!Array.isArray(body.required_course_codes)) {
      return NextResponse.json(
        { error: 'required_course_codes must be an array' },
        { status: 400 }
      )
    }
    
    const input: IrregularStudentInput = {
      student_id: body.student_id,
      required_course_codes: body.required_course_codes,
      notes: body.notes || undefined,
    }
    
    const irregularStudent = await createIrregularStudent(input, user.id)
    
    return NextResponse.json(irregularStudent, { status: 201 })
  } catch (error: any) {
    console.error('Error creating irregular student:', error)
    
    // Handle specific error messages
    if (error.message?.includes('already has custom curriculum')) {
      return NextResponse.json(
        { error: 'Student already has custom curriculum' },
        { status: 409 }
      )
    }
    
    if (error.message?.includes('Invalid course codes')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    if (error.message?.includes('not found') || error.message?.includes('must have student role')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create irregular student' },
      { status: 500 }
    )
  }
}

