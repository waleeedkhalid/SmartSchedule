// Database queries for student groups
// MIGRATED: Now uses Prisma ORM instead of Supabase Client
import { db } from '@/lib/db';
import { createClient } from '@/supabase/server';
import { StudentGroup, StudentGroupInput } from '@/lib/types/database';

export async function getStudentGroups() {
  const groups = await db.studentGroup.findMany({
    orderBy: [
      { level: 'asc' },
      { name: 'asc' }
    ]
  });
  
  return groups as StudentGroup[];
}

export async function getStudentGroupById(id: string) {
  const group = await db.studentGroup.findUnique({
    where: { id }
  });
  
  if (!group) {
    throw new Error(`Student group with id ${id} not found`);
  }
  
  return group as StudentGroup;
}

export async function getStudentGroupsByLevel(level: number) {
  const groups = await db.studentGroup.findMany({
    where: { level },
    orderBy: { name: 'asc' }
  });
  
  return groups as StudentGroup[];
}

export async function createStudentGroup(group: StudentGroupInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const created = await db.studentGroup.create({
    data: {
      ...group,
      created_by: user?.id || null
    }
  });
  
  return created as StudentGroup;
}

export async function updateStudentGroup(id: string, updates: Partial<StudentGroupInput>) {
  const updated = await db.studentGroup.update({
    where: { id },
    data: updates
  });
  
  return updated as StudentGroup;
}

export async function deleteStudentGroup(id: string) {
  await db.studentGroup.delete({
    where: { id }
  });
}

/**
 * Auto-assign a student to a group for their level
 * Balances group sizes by assigning to the group with minimum size
 * Creates a new group if none exists for the level
 * 
 * @param studentId - UUID of the student
 * @param level - Student's level (1-8)
 * @returns UUID of the assigned group
 */
export async function autoAssignStudentToGroup(studentId: string, level: number): Promise<string> {
  // Convert RPC to Prisma: Auto-assign student to group with minimum size
  // Find or create a group for this level
  let group = await db.studentGroup.findFirst({
    where: { level },
    orderBy: { size: 'asc' }
  });
  
  if (!group) {
    // Create a new group if none exists
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    group = await db.studentGroup.create({
      data: {
        level,
        size: 0,
        name: `Level ${level} - Group 1`,
        created_by: user?.id || null
      }
    });
  }
  
  // Update student's group assignment in user_roles
  await db.userRole.update({
    where: { user_id: studentId },
    data: { student_group_id: group.id }
  });
  
  // Increment group size
  await db.studentGroup.update({
    where: { id: group.id },
    data: { size: { increment: 1 } }
  });
  
  return group.id;
}

/**
 * Get students assigned to a specific group
 * @param groupId - UUID of the student group
 * @returns Array of students in the group
 */
export async function getStudentsInGroup(groupId: string) {
  const students = await db.userRole.findMany({
    where: {
      student_group_id: groupId,
      role: 'student'
    },
    select: {
      user_id: true,
      name: true,
      email: true,
      level: true
    },
    orderBy: { name: 'asc' }
  });
  
  return students;
}

