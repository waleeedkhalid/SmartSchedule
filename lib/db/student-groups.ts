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

