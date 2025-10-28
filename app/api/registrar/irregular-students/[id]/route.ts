import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import {
  getIrregularStudentById,
  updateIrregularStudent,
  deleteIrregularStudent,
  type IrregularStudentInput,
} from '@/lib/db/irregular-students'

/**
 * GET /api/registrar/irregular-students/[id]
 * Get a specific irregular student
 * Auth: Registrar only
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    const irregularStudent = await getIrregularStudentById(params.id)
    
    if (!irregularStudent) {
      return NextResponse.json(
        { error: 'Irregular student not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(irregularStudent)
  } catch (error) {
    console.error('Error fetching irregular student:', error)
    return NextResponse.json(
      { error: 'Failed to fetch irregular student' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/registrar/irregular-students/[id]
 * Update an irregular student record
 * Auth: Registrar only
 * 
 * Body:
 * {
 *   "required_course_codes": ["CS101", "CS102", "CS201"],
 *   "notes": "Updated notes"
 * }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Parse and validate request body
    const body = await request.json()
    
    if (body.required_course_codes && !Array.isArray(body.required_course_codes)) {
      return NextResponse.json(
        { error: 'required_course_codes must be an array' },
        { status: 400 }
      )
    }
    
    const updates: Partial<IrregularStudentInput> = {}
    
    if (body.required_course_codes !== undefined) {
      updates.required_course_codes = body.required_course_codes
    }
    
    if (body.notes !== undefined) {
      updates.notes = body.notes
    }
    
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }
    
    const updated = await updateIrregularStudent(params.id, updates)
    
    return NextResponse.json(updated)
  } catch (error: any) {
    console.error('Error updating irregular student:', error)
    
    if (error.message?.includes('Invalid course codes')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update irregular student' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/registrar/irregular-students/[id]
 * Delete an irregular student record
 * Auth: Registrar only
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    await deleteIrregularStudent(params.id)
    
    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Error deleting irregular student:', error)
    return NextResponse.json(
      { error: 'Failed to delete irregular student' },
      { status: 500 }
    )
  }
}

