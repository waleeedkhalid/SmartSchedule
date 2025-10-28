// Database queries for courses
import { createClient } from '@/supabase/server';
import { Course, CourseInput } from '@/lib/types/database';

export async function getCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .order('code');
  
  if (error) throw error;
  return data as Course[];
}

export async function getCourseByCode(code: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .eq('code', code)
    .single();
  
  if (error) throw error;
  return data as Course;
}

export async function getCoursesByLevel(level: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .eq('level', level)
    .order('code');
  
  if (error) throw error;
  return data as Course[];
}

export async function getElectiveCourses() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course')
    .select('*')
    .eq('is_elective', true)
    .order('code');
  
  if (error) throw error;
  return data as Course[];
}

export async function createCourse(course: CourseInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('course')
    .insert({ ...course, created_by: user?.id })
    .select()
    .single();
  
  if (error) throw error;
  return data as Course;
}

export async function updateCourse(code: string, updates: Partial<CourseInput>) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('course')
    .update(updates)
    .eq('code', code)
    .select()
    .single();
  
  if (error) throw error;
  return data as Course;
}

export async function deleteCourse(code: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('course')
    .delete()
    .eq('code', code);
  
  if (error) throw error;
}

