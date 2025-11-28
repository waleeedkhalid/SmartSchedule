/**
 * Registrar Dashboard Data Access Layer
 * 
 * Provides data access functions for registrar role:
 * - Irregular students management
 * - Student enrollment management
 * - Student listing
 * 
 * Wrapped with React.cache() for request memoization - ensures the same
 * data is only fetched once per request, even if called multiple times
 * in the same render tree.
 * 
 * Note: These functions use createClient() which accesses cookies(), so they cannot
 * be wrapped with unstable_cache() for persistent caching. React.cache() provides
 * request-level memoization which is sufficient for preventing duplicate queries.
 */

import { cache } from 'react';
import { createClient } from "@/supabase/server";
import type { Database } from "@/lib/types/database";


export interface StudentView {
  user_id: string;
  name: string;
  email: string;
  level: number | null;
  department: string | null;
  student_number: string | null;
}

export interface StudentAcademicProgress {
  user_id: string;
  name: string;
  email: string;
  level: number | null;
  department: string | null;
  total_credits: number;
  required_credits: number;
  elective_credits: number;
  total_enrollments: number;
  active_enrollments: number;
  dropped_enrollments: number;
  enrolled_courses: Array<{
    course_code: string;
    course_title: string;
    credits: number;
    is_elective: boolean;
    section_no: string;
    enrolled_at: string;
  }>;
}

export interface EnrollmentView {
  id: string;
  student_id: string;
  section_id: string;
  status: "registered" | "dropped";
  enrolled_at: string | null;
  dropped_at: string | null;
  student?: {
    name: string;
    email: string;
  };
  section?: {
    course_code: string;
    section_no: string;
    course?: {
      title: string;
      credits: number;
    };
  };
}


/**
 * Get all students with profile information
 * Stable backend function for registrar
 * Uses separate queries to avoid RLS issues with joins
 * 
 * Wrapped with React.cache() for request memoization
 */
export const getAllStudents = cache(async (): Promise<StudentView[]> => {
  const supabase = await createClient();
  
  // Get all students
  const { data: students, error: studentsError } = await supabase
    .from("user_roles")
    .select("user_id, name, email")
    .eq("role", "student")
    .order("name", { ascending: true });
  
  if (studentsError) {
    console.error("Error fetching students:", studentsError);
    throw studentsError;
  }
  
  if (!students || students.length === 0) {
    return [];
  }
  
  // Get student profiles separately (more reliable with RLS)
  const studentIds = students.map(s => s.user_id);
  const { data: profiles, error: profilesError } = await supabase
    .from("student_profile")
    .select("user_id, level, department, student_number")
    .in("user_id", studentIds);
  
  if (profilesError) {
    // Log but don't fail - students without profiles are valid
    console.warn("Error fetching student profiles:", profilesError);
  }
  
  // Create a map for quick lookup
  const profileMap = new Map(
    (profiles || []).map(p => [p.user_id, { 
      level: p.level, 
      department: p.department,
      student_number: p.student_number 
    }])
  );
  
  return students.map(s => {
    const profile = profileMap.get(s.user_id);
    return {
      user_id: s.user_id,
      name: s.name,
      email: s.email,
      level: profile?.level || null,
      department: profile?.department || null,
      student_number: profile?.student_number || null,
    };
  });
});

/**
 * Get detailed academic progress for a specific student
 * Includes enrollments, credits, and course details
 * 
 * Wrapped with React.cache() for request memoization
 */
export const getStudentAcademicProgress = cache(async (studentId: string): Promise<StudentAcademicProgress | null> => {
  const supabase = await createClient();
  
  // Get student basic info
  const { data: student, error: studentError } = await supabase
    .from("user_roles")
    .select("user_id, name, email")
    .eq("user_id", studentId)
    .eq("role", "student")
    .single();
  
  if (studentError || !student) {
    return null;
  }
  
  // Get student profile separately
  const { data: profile } = await supabase
    .from("student_profile")
    .select("level, department")
    .eq("user_id", studentId)
    .single();
  
  // Get all enrollments with course details
  const { data: enrollments, error: enrollmentsError } = await supabase
    .from("student_enrollment")
    .select(`
      id,
      status,
      enrolled_at,
      dropped_at,
      section:section!student_enrollment_section_id_fkey(
        course_code,
        section_no,
        course:course!section_course_code_fkey(
          title,
          credits,
          is_elective
        )
      )
    `)
    .eq("student_id", studentId)
    .order("enrolled_at", { ascending: false });
  
  if (enrollmentsError) {
    console.error("Error fetching enrollments:", enrollmentsError);
  }
  
  // Calculate statistics
  const activeEnrollments = (enrollments || []).filter(
    (e: any) => e.status === "registered"
  );
  const droppedEnrollments = (enrollments || []).filter(
    (e: any) => e.status === "dropped"
  );
  
  let totalCredits = 0;
  let requiredCredits = 0;
  let electiveCredits = 0;
  
  const enrolledCourses = activeEnrollments.map((enrollment: any) => {
    const section = enrollment.section as any;
    const course = section?.course as any;
    
    if (course) {
      const credits = course.credits || 0;
      totalCredits += credits;
      
      if (course.is_elective) {
        electiveCredits += credits;
      } else {
        requiredCredits += credits;
      }
    }
    
    return {
      course_code: section?.course_code || "",
      course_title: course?.title || "",
      credits: course?.credits || 0,
      is_elective: course?.is_elective || false,
      section_no: section?.section_no || "",
      enrolled_at: enrollment.enrolled_at || "",
    };
  });
  
  return {
    user_id: student.user_id,
    name: student.name,
    email: student.email,
    level: profile?.level || null,
    department: profile?.department || null,
    total_credits: totalCredits,
    required_credits: requiredCredits,
    elective_credits: electiveCredits,
    total_enrollments: enrollments?.length || 0,
    active_enrollments: activeEnrollments.length,
    dropped_enrollments: droppedEnrollments.length,
    enrolled_courses: enrolledCourses,
  };
});

/**
 * Get student enrollments with filters
 * 
 * Wrapped with React.cache() for request memoization
 * 
 * Note: student_enrollment.student_id references auth.users.id, not user_roles.user_id.
 * We fetch student info from user_roles separately using the user_id.
 */
export const getStudentEnrollments = cache(async (filters: {
  student_id?: string;
  status?: "registered" | "dropped";
} = {}): Promise<EnrollmentView[]> => {
  const supabase = await createClient();
  
  // Fetch enrollments with section and course info
  let query = supabase
    .from("student_enrollment")
    .select(`
      id,
      student_id,
      section_id,
      status,
      enrolled_at,
      dropped_at,
      section:section!student_enrollment_section_id_fkey(
        course_code,
        section_no,
        course:course!section_course_code_fkey(
          title,
          credits
        )
      )
    `);
  
  if (filters.student_id) {
    query = query.eq("student_id", filters.student_id);
  }
  
  if (filters.status) {
    query = query.eq("status", filters.status);
  }
  
  const { data: enrollments, error } = await query.order("enrolled_at", { ascending: false });
  
  if (error) {
    console.error("Error fetching enrollments:", error);
    throw error;
  }
  
  if (!enrollments || enrollments.length === 0) {
    return [];
  }
  
  // Fetch student info from user_roles separately
  // student_enrollment.student_id = auth.users.id = user_roles.user_id
  const studentIds = [...new Set(enrollments.map(e => e.student_id))];
  const { data: students, error: studentsError } = await supabase
    .from("user_roles")
    .select("user_id, name, email")
    .in("user_id", studentIds);
  
  if (studentsError) {
    console.warn("Error fetching student info:", studentsError);
  }
  
  // Create a map for quick lookup
  const studentMap = new Map(
    (students || []).map(s => [s.user_id, { name: s.name, email: s.email }])
  );
  
  return enrollments.map(item => ({
    id: item.id,
    student_id: item.student_id,
    section_id: item.section_id,
    status: item.status as "registered" | "dropped",
    enrolled_at: item.enrolled_at,
    dropped_at: item.dropped_at,
    student: studentMap.get(item.student_id) ? {
      name: studentMap.get(item.student_id)!.name,
      email: studentMap.get(item.student_id)!.email,
    } : undefined,
    section: item.section ? {
      course_code: (item.section as any).course_code,
      section_no: (item.section as any).section_no,
      course: (item.section as any).course ? {
        title: (item.section as any).course.title,
        credits: (item.section as any).course.credits,
      } : undefined,
    } : undefined,
  }));
});

/**
 * Create a student enrollment (manual registration)
 * Only allows registration when section is 15-50% over capacity
 */
export async function createStudentEnrollment(
  studentId: string,
  sectionId: string
): Promise<{ id: string; message: string }> {
  const supabase = await createClient();
  
  // Get section details
  const { data: section, error: sectionError } = await supabase
    .from("section")
    .select("capacity, course_code")
    .eq("id", sectionId)
    .single();
  
  if (sectionError || !section) {
    throw new Error("Section not found");
  }
  
  // Count current enrollments
  const { count } = await supabase
    .from("student_enrollment")
    .select("*", { count: "exact", head: true })
    .eq("section_id", sectionId)
    .eq("status", "registered");
  
  const currentEnrollments = count || 0;
  const capacity = section.capacity;
  
  // Calculate over-capacity percentage
  const overCapacityPercent = ((currentEnrollments - capacity) / capacity) * 100;
  
  // Check if section is within 15-50% over capacity range
  if (currentEnrollments < capacity) {
    throw new Error(
      `Section is not over capacity. Current: ${currentEnrollments}/${capacity}. ` +
      `Registrar can only register students when section is 15-50% over capacity.`
    );
  }
  
  if (overCapacityPercent < 15) {
    throw new Error(
      `Section is only ${overCapacityPercent.toFixed(1)}% over capacity. ` +
      `Must be at least 15% over capacity (currently ${currentEnrollments}/${capacity}).`
    );
  }
  
  if (overCapacityPercent > 50) {
    throw new Error(
      `Section is ${overCapacityPercent.toFixed(1)}% over capacity. ` +
      `Registrar can only register students when section is 15-50% over capacity ` +
      `(currently ${currentEnrollments}/${capacity}, max allowed: ${Math.floor(capacity * 1.5)}).`
    );
  }
  
  // Check if already enrolled
  const { data: existing } = await supabase
    .from("student_enrollment")
    .select("id")
    .eq("student_id", studentId)
    .eq("section_id", sectionId)
    .eq("status", "registered")
    .maybeSingle();
  
  if (existing) {
    throw new Error("Student is already enrolled in this section");
  }
  
  // Create enrollment
  const { data, error } = await supabase
    .from("student_enrollment")
    .insert({
      student_id: studentId,
      section_id: sectionId,
      status: "registered",
    })
    .select()
    .single();
  
  if (error) {
    console.error("Error creating enrollment:", error);
    throw error;
  }
  
  return {
    id: data.id,
    message: `Student registered successfully. Section is now ${((currentEnrollments + 1 - capacity) / capacity * 100).toFixed(1)}% over capacity.`,
  };
}

/**
 * Delete a student enrollment (drop)
 */
export async function deleteStudentEnrollment(enrollmentId: string): Promise<void> {
  const supabase = await createClient();
  
  const { error } = await supabase
    .from("student_enrollment")
    .update({
      status: "dropped",
      dropped_at: new Date().toISOString(),
    })
    .eq("id", enrollmentId);
  
  if (error) {
    console.error("Error dropping enrollment:", error);
    throw error;
  }
}

