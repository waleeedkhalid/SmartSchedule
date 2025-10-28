import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import { getRegularStudents } from '@/lib/db/irregular-students'

/**
 * GET /api/registrar/regular-students
 * Get all students who are NOT irregular (for dropdown selection)
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
      .single()
    
    if (roleError || userRole?.role !== 'registrar') {
      return NextResponse.json(
        { error: 'Forbidden - Registrar access required' },
        { status: 403 }
      )
    }
    
    const students = await getRegularStudents()
    
    return NextResponse.json(students)
  } catch (error) {
    console.error('Error fetching regular students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch regular students' },
      { status: 500 }
    )
  }
}

