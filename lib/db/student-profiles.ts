/**
 * Database queries for student profiles
 * 
 * REFACTORED: New file for student-specific attributes
 * Replaces student fields that were previously in user_roles table
 */
import { createClient } from '@/supabase/server';

export interface StudentProfile {
  user_id: string;
  student_id: string;
  current_level: number;
  enrollment_year: number;
  expected_graduation_year: number;
  academic_status: 'active' | 'probation' | 'suspended' | 'graduated' | 'withdrawn';
  max_credits_allowed: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface StudentProfileCreate {
  user_id: string;
  student_id: string;
  current_level: number;
  enrollment_year: number;
  expected_graduation_year: number;
  academic_status?: 'active' | 'probation' | 'suspended' | 'graduated' | 'withdrawn';
  max_credits_allowed?: number;
}

export interface StudentProfileUpdate {
  student_id?: string;
  current_level?: number;
  enrollment_year?: number;
  expected_graduation_year?: number;
  academic_status?: 'active' | 'probation' | 'suspended' | 'graduated' | 'withdrawn';
  max_credits_allowed?: number;
}

/**
 * Get a student profile by user ID
 * @param userId - User ID
 * @returns Student profile or null if not found
 */
export async function getStudentProfile(userId: string): Promise<StudentProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_profile')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data as StudentProfile;
}

/**
 * Get all student profiles
 * @returns Array of student profiles
 */
export async function getStudentProfiles(): Promise<StudentProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_profile')
    .select('*')
    .order('student_id');
  
  if (error) throw error;
  return data as StudentProfile[];
}

/**
 * Get student profiles by level
 * @param level - Level (1-8)
 * @returns Array of student profiles
 */
export async function getStudentProfilesByLevel(level: number): Promise<StudentProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_profile')
    .select('*')
    .eq('current_level', level)
    .order('student_id');
  
  if (error) throw error;
  return data as StudentProfile[];
}

/**
 * Get student profiles by academic status
 * @param status - Academic status
 * @returns Array of student profiles
 */
export async function getStudentProfilesByStatus(
  status: 'active' | 'probation' | 'suspended' | 'graduated' | 'withdrawn'
): Promise<StudentProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_profile')
    .select('*')
    .eq('academic_status', status)
    .order('student_id');
  
  if (error) throw error;
  return data as StudentProfile[];
}

/**
 * Create a new student profile
 * @param profileData - Student profile data
 * @returns Created student profile
 */
export async function createStudentProfile(profileData: StudentProfileCreate): Promise<StudentProfile> {
  const supabase = await createClient();
  
  const { data, error } = await supabase
    .from('student_profile')
    .insert({ 
      ...profileData,
      academic_status: profileData.academic_status || 'active',
      max_credits_allowed: profileData.max_credits_allowed || 21
    })
    .select()
    .single();
  
  if (error) throw error;
  return data as StudentProfile;
}

/**
 * Update a student profile
 * @param userId - User ID
 * @param updates - Fields to update
 * @returns Updated student profile
 */
export async function updateStudentProfile(userId: string, updates: StudentProfileUpdate): Promise<StudentProfile> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_profile')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  
  if (error) throw error;
  return data as StudentProfile;
}

/**
 * Delete a student profile
 * @param userId - User ID
 */
export async function deleteStudentProfile(userId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('student_profile')
    .delete()
    .eq('user_id', userId);
  
  if (error) throw error;
}

/**
 * Get student profile with user role information
 * @param userId - User ID
 * @returns Combined student profile and user role data
 */
export async function getStudentWithProfile(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_profile')
    .select(`
      *,
      user:user_roles!inner (
        user_id,
        name,
        email,
        role,
        onboarding_completed
      )
    `)
    .eq('user_id', userId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
  return data;
}

/**
 * Get all students with their profile information
 * @returns Array of students with profile data
 */
export async function getAllStudentsWithProfiles() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_profile')
    .select(`
      *,
      user:user_roles!inner (
        user_id,
        name,
        email,
        role,
        onboarding_completed,
        created_at
      )
    `)
    .order('student_id');
  
  if (error) throw error;
  return data;
}

/**
 * Check if a student profile exists for a user
 * @param userId - User ID
 * @returns True if profile exists
 */
export async function studentProfileExists(userId: string): Promise<boolean> {
  const profile = await getStudentProfile(userId);
  return profile !== null;
}

/**
 * Get students by enrollment year
 * @param year - Enrollment year
 * @returns Array of student profiles
 */
export async function getStudentsByEnrollmentYear(year: number): Promise<StudentProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_profile')
    .select('*')
    .eq('enrollment_year', year)
    .order('student_id');
  
  if (error) throw error;
  return data as StudentProfile[];
}

/**
 * Get students expected to graduate in a specific year
 * @param year - Expected graduation year
 * @returns Array of student profiles
 */
export async function getStudentsByGraduationYear(year: number): Promise<StudentProfile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('student_profile')
    .select('*')
    .eq('expected_graduation_year', year)
    .order('student_id');
  
  if (error) throw error;
  return data as StudentProfile[];
}

