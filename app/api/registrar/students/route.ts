import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/supabase/server'
import { requireRole } from '@/lib/utils/auth'
import { db } from '@/lib/db'

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
    
    // Authorization check - must be registrar - USING AUTH UTILITY
    try {
      await requireRole('registrar');
    } catch (error: any) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json(
        { error: 'Forbidden - Registrar access required' },
        { status: 403 }
      );
    }
    
    // Get all students - USING PRISMA
    const students = await db.userRole.findMany({
      where: { role: 'student' },
      select: {
        userId: true,
        name: true,
        email: true
      },
      orderBy: { name: 'asc' }
    });
    
    // Map to match expected format (snake_case for API compatibility)
    const formattedStudents = students.map(s => ({
      user_id: s.userId,
      name: s.name,
      email: s.email
    }));
    
    return NextResponse.json(formattedStudents);
  } catch (error) {
    console.error('Error fetching students:', error)
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}

