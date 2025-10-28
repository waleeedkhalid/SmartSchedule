// Database queries for instructors
import { createClient } from '@/supabase/server';
import { Instructor, InstructorInput, InstructorLoad } from '@/lib/types/database';

export async function getInstructors() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instructor')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data as Instructor[];
}

export async function getInstructorById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instructor')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Instructor;
}

export async function createInstructor(instructor: InstructorInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('instructor')
    .insert({ ...instructor, created_by: user?.id })
    .select()
    .single();
  
  if (error) throw error;
  return data as Instructor;
}

export async function updateInstructor(id: string, updates: Partial<InstructorInput>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('instructor')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Instructor;
}

export async function deleteInstructor(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('instructor')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function getInstructorLoad(instructorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_instructor_load', { p_instructor_id: instructorId });
  
  if (error) throw error;
  return data as InstructorLoad;
}

