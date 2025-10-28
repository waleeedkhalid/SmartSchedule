// Database queries for sections
import { createClient } from '@/supabase/server';
import { Section, SectionInput, SectionConflicts } from '@/lib/types/database';

export async function getSections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .order('course_code');
  
  if (error) throw error;
  return data as Section[];
}

export async function getSectionById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) throw error;
  return data as Section;
}

export async function getSectionsByCourse(courseCode: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .eq('course_code', courseCode)
    .order('section_no');
  
  if (error) throw error;
  return data as Section[];
}

export async function getSectionsByInstructor(instructorId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .eq('instructor_id', instructorId)
    .order('course_code');
  
  if (error) throw error;
  return data as Section[];
}

export async function getSectionsByLevel(level: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section')
    .select('*')
    .eq('group_level', level)
    .order('course_code');
  
  if (error) throw error;
  return data as Section[];
}

export async function createSection(section: SectionInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('section')
    .insert({ ...section, created_by: user?.id })
    .select()
    .single();
  
  if (error) throw error;
  return data as Section;
}

export async function updateSection(id: string, updates: Partial<SectionInput>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('section')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Section;
}

export async function deleteSection(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('section')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function getSectionConflicts(sectionId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_section_conflicts', { p_section_id: sectionId });
  
  if (error) throw error;
  return data as SectionConflicts;
}

export async function getAllScheduleConflicts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc('get_all_schedule_conflicts');
  
  if (error) throw error;
  return data as SectionConflicts[];
}

