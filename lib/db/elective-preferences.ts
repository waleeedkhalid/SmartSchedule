// Database queries for elective preferences
import { createClient } from '@/supabase/server';
import { ElectivePreference } from '@/lib/types/database';

export async function getElectivePreferences() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('elective_preference')
    .select('*')
    .order('rank', { ascending: true });
  
  if (error) throw error;
  return data as ElectivePreference[];
}

export async function getElectivePreferencesByStudent(studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('elective_preference')
    .select(`
      *,
      course:course(code, title, level, credits)
    `)
    .eq('student_id', studentId)
    .order('rank', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function getElectivePreferenceByCourse(studentId: string, courseCode: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('elective_preference')
    .select('*')
    .eq('student_id', studentId)
    .eq('course_code', courseCode)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return data as ElectivePreference | null;
}

export async function createElectivePreference(
  studentId: string,
  courseCode: string,
  rank: number
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('elective_preference')
    .insert({
      student_id: studentId,
      course_code: courseCode,
      rank,
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as ElectivePreference;
}

export async function updateElectivePreferenceRank(
  id: string,
  rank: number
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('elective_preference')
    .update({ rank })
    .eq('id', id)
    .select()
    .single();
  
  if (error) throw error;
  return data as ElectivePreference;
}

export async function deleteElectivePreference(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('elective_preference')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
}

export async function bulkUpdateElectivePreferences(
  studentId: string,
  preferences: { course_code: string; rank: number }[]
) {
  const supabase = await createClient();
  
  // Delete all existing preferences for this student
  await supabase
    .from('elective_preference')
    .delete()
    .eq('student_id', studentId);
  
  // Insert new preferences
  if (preferences.length > 0) {
    const { data, error } = await supabase
      .from('elective_preference')
      .insert(
        preferences.map(p => ({
          student_id: studentId,
          course_code: p.course_code,
          rank: p.rank,
        }))
      )
      .select();
    
    if (error) throw error;
    return data as ElectivePreference[];
  }
  
  return [];
}

// Get aggregated preference statistics for scheduling committee
export async function getElectivePreferenceStats() {
  const supabase = await createClient();
  
  // Get all preferences with course info
  const { data, error } = await supabase
    .from('elective_preference')
    .select(`
      course_code,
      rank,
      course:course(code, title, level, credits)
    `);
  
  if (error) throw error;
  
  // Aggregate by course
  const stats: Record<string, {
    course_code: string;
    course_title: string;
    level: number;
    total_requests: number;
    first_choice: number;
    second_choice: number;
    third_choice: number;
    other_choice: number;
  }> = {};
  
  data.forEach((pref: any) => {
    const code = pref.course_code;
    if (!stats[code]) {
      stats[code] = {
        course_code: code,
        course_title: pref.course?.title || '',
        level: pref.course?.level || 0,
        total_requests: 0,
        first_choice: 0,
        second_choice: 0,
        third_choice: 0,
        other_choice: 0,
      };
    }
    
    stats[code].total_requests++;
    if (pref.rank === 1) stats[code].first_choice++;
    else if (pref.rank === 2) stats[code].second_choice++;
    else if (pref.rank === 3) stats[code].third_choice++;
    else stats[code].other_choice++;
  });
  
  return Object.values(stats).sort((a, b) => b.total_requests - a.total_requests);
}

