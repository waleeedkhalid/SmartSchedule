// Database queries for student groups
import { createClient } from '@/supabase/server';
import { StudentGroup, StudentGroupInput } from '@/lib/types/database';

export async function getStudentGroups() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_group')
    .select('*')
    .order('level')
    .order('name');
  
  if (error) throw error;
  return data as StudentGroup[];
}

export async function getStudentGroupById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_group')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as StudentGroup;
}

export async function getStudentGroupsByLevel(level: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_group')
    .select('*')
    .eq('level', level)
    .order('name');
  
  if (error) throw error;
  return data as StudentGroup[];
}

export async function createStudentGroup(group: StudentGroupInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('student_group')
    .insert({ ...group, created_by: user?.id })
    .select()
    .single();
  
  if (error) throw error;
  return data as StudentGroup;
}

export async function updateStudentGroup(id: string, updates: Partial<StudentGroupInput>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_group')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as StudentGroup;
}

export async function deleteStudentGroup(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('student_group')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
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
  const supabase = await createClient();
  const { data, error } = await supabase.rpc('auto_assign_student_to_group', {
    p_student_id: studentId,
    p_level: level
  });
  
  if (error) throw error;
  return data as string; // Returns group_id
}

/**
 * Get students assigned to a specific group
 * @param groupId - UUID of the student group
 * @returns Array of students in the group
 */
export async function getStudentsInGroup(groupId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_roles')
    .select('user_id, name, email, level')
    .eq('student_group_id', groupId)
    .eq('role', 'student')
    .order('name');
  
  if (error) throw error;
  return data;
}

