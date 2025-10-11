// Student Profile Management
// New student profile system that extends user table with academic data

import { getSupabaseAdminOrThrow } from "@/lib/supabase-admin";
import type {
  DBStudentWithProfile,
  CreateStudentProfileInput,
  UpdateStudentProfileInput,
} from "@/lib/types";

/**
 * Get student profile by user ID
 */
export async function getStudentProfile(
  userId: string
): Promise<DBStudentWithProfile | null> {
  const supabase = getSupabaseAdminOrThrow();

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      return null; // No profile found
    }
    throw error;
  }

  // Transform the data to match the expected interface
  return {
    user_id: data.user_id,
    name: data.name,
    email: data.email,
    role: "student", // Default role for students
    user_created_at: data.created_at || "",
    profile_id: data.id,
    student_number: data.student_id,
    level: data.level,
    major: data.major,
    gpa: data.gpa || undefined,
    completed_credits: data.completed_credits || undefined,
    total_credits: data.total_credits || undefined,
    academic_status: "active", // Default status
    enrollment_date: undefined,
    expected_graduation_date: undefined,
    advisor_id: undefined,
    profile_created_at: data.created_at || undefined,
    profile_updated_at: data.updated_at || undefined,
  };
}

/**
 * Get all students with profiles
 */
export async function getAllStudentsWithProfiles(): Promise<
  DBStudentWithProfile[]
> {
  const supabase = getSupabaseAdminOrThrow();

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("level", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;

  // Transform the data to match the expected interface
  return (data || []).map((student) => ({
    user_id: student.user_id,
    name: student.name,
    email: student.email,
    role: "student" as const,
    user_created_at: student.created_at || "",
    profile_id: student.id,
    student_number: student.student_id,
    level: student.level,
    major: student.major,
    gpa: student.gpa || undefined,
    completed_credits: student.completed_credits || undefined,
    total_credits: student.total_credits || undefined,
    academic_status: "active" as const,
    enrollment_date: undefined,
    expected_graduation_date: undefined,
    advisor_id: undefined,
    profile_created_at: student.created_at || undefined,
    profile_updated_at: student.updated_at || undefined,
  }));
}

/**
 * Create a new student profile
 */
export async function createStudentProfile(
  input: CreateStudentProfileInput
): Promise<string> {
  const supabase = getSupabaseAdminOrThrow();

  const { data: userRecord, error: userError } = await supabase
    .from("user")
    .select("name, email")
    .eq("id", input.user_id)
    .single();

  if (userError) {
    throw userError;
  }

  const insertPayload = {
    user_id: input.user_id,
    student_id: input.student_number,
    name: userRecord?.name ?? "Student",
    email: userRecord?.email ?? "",
    level: input.level ?? 6,
    major: input.major ?? "Software Engineering",
    completed_credits: input.completed_credits ?? 0,
    total_credits: input.total_credits ?? 132,
    gpa: input.gpa !== undefined ? input.gpa.toFixed(2) : undefined,
  } satisfies Record<string, unknown>;

  const { data, error } = await supabase
    .from("students")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

/**
 * Update student profile
 */
export async function updateStudentProfile(
  userId: string,
  updates: UpdateStudentProfileInput
): Promise<void> {
  const supabase = getSupabaseAdminOrThrow();

  const { error } = await supabase
    .from("students")
    .update({
      student_id: updates.student_number,
      level: updates.level,
      major: updates.major,
      gpa: updates.gpa !== undefined ? updates.gpa.toFixed(2) : undefined,
      completed_credits: updates.completed_credits,
      total_credits: updates.total_credits,
    })
    .eq("user_id", userId);

  if (error) throw error;
}

/**
 * Delete student profile
 */
export async function deleteStudentProfile(userId: string): Promise<void> {
  const supabase = getSupabaseAdminOrThrow();

  const { error } = await supabase
    .from("students")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}

/**
 * Get students by level
 */
export async function getStudentsByLevel(
  level: number
): Promise<DBStudentWithProfile[]> {
  const supabase = getSupabaseAdminOrThrow();

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("level", level)
    .order("name", { ascending: true });

  if (error) throw error;

  // Transform the data to match the expected interface
  return (data || []).map((student) => ({
    user_id: student.user_id,
    name: student.name,
    email: student.email,
    role: "student" as const,
    user_created_at: student.created_at || "",
    profile_id: student.id,
    student_number: student.student_id,
    level: student.level,
    major: student.major,
    gpa: student.gpa || undefined,
    completed_credits: student.completed_credits || undefined,
    total_credits: student.total_credits || undefined,
    academic_status: "active" as const,
    enrollment_date: undefined,
    expected_graduation_date: undefined,
    advisor_id: undefined,
    profile_created_at: student.created_at || undefined,
    profile_updated_at: student.updated_at || undefined,
  }));
}

/**
 * Get students by academic status
 */
export async function getStudentsByStatus(
  _status: string
): Promise<DBStudentWithProfile[]> {
  void _status;
  const supabase = getSupabaseAdminOrThrow();

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;

  // Transform the data to match the expected interface
  return (data || []).map((student) => ({
    user_id: student.user_id,
    name: student.name,
    email: student.email,
    role: "student" as const,
    user_created_at: student.created_at || "",
    profile_id: student.id,
    student_number: student.student_id,
    level: student.level,
    major: student.major,
    gpa: student.gpa || undefined,
    completed_credits: student.completed_credits || undefined,
    total_credits: student.total_credits || undefined,
    academic_status: "active" as const,
    enrollment_date: undefined,
    expected_graduation_date: undefined,
    advisor_id: undefined,
    profile_created_at: student.created_at || undefined,
    profile_updated_at: student.updated_at || undefined,
  }));
}

/**
 * Search students by name or student number
 */
export async function searchStudents(
  query: string
): Promise<DBStudentWithProfile[]> {
  const supabase = getSupabaseAdminOrThrow();

  const { data, error } = await supabase
    .from("students")
    .select("*")
    .or(`name.ilike.%${query}%,student_id.ilike.%${query}%`)
    .order("name", { ascending: true });

  if (error) throw error;

  // Transform the data to match the expected interface
  return (data || []).map((student) => ({
    user_id: student.user_id,
    name: student.name,
    email: student.email,
    role: "student" as const,
    user_created_at: student.created_at || "",
    profile_id: student.id,
    student_number: student.student_id,
    level: student.level,
    major: student.major,
    gpa: student.gpa || undefined,
    completed_credits: student.completed_credits || undefined,
    total_credits: student.total_credits || undefined,
    academic_status: "active" as const,
    enrollment_date: undefined,
    expected_graduation_date: undefined,
    advisor_id: undefined,
    profile_created_at: student.created_at || undefined,
    profile_updated_at: student.updated_at || undefined,
  }));
}

/**
 * Get student statistics
 */
export async function getStudentStatistics(): Promise<{
  total: number;
  byLevel: Record<number, number>;
  byStatus: Record<string, number>;
  averageGPA: number;
}> {
  const supabase = getSupabaseAdminOrThrow();

  // Get all students
  const { data, error } = await supabase.from("students").select("level, gpa");

  if (error) throw error;

  const students = data || [];
  const total = students.length;

  // Calculate statistics
  const byLevel: Record<number, number> = {};
  const byStatus: Record<string, number> = {};
  let totalGPA = 0;
  let validGPAs = 0;

  students.forEach((student) => {
    // By level
    byLevel[student.level] = (byLevel[student.level] || 0) + 1;

    // GPA calculation
    if (student.gpa && !isNaN(parseFloat(student.gpa))) {
      totalGPA += parseFloat(student.gpa);
      validGPAs++;
    }
  });

  return {
    total,
    byLevel,
    byStatus,
    averageGPA: validGPAs > 0 ? totalGPA / validGPAs : 0,
  };
}
