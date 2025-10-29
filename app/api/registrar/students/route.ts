import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'

/**
 * GET /api/registrar/students
 * Get all students (for manual registration)
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
    
    // Get all students
    const { data: students, error: studentsError } = await supabase
      .from('user_roles')
      .select('user_id, name, email, level')
      .eq('role', 'student')
      .order('name', { ascending: true })
    
    if (studentsError) throw studentsError
    
    return NextResponse.json(students || [])
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

