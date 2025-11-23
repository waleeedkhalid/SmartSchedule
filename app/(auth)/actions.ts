"use server";

import { createClient } from "@/supabase/server";
import { db } from "@/lib/db";
import { createStudentProfile } from "@/lib/db/student-profiles";

//sign up with email and password
export async function signup(formData: {
  name: string;
  email: string;
  password: string;
  role: 'scheduling' | 'teaching_load' | 'faculty' | 'student' | 'registrar';
}) {
  const supabase = await createClient();

  // Create auth user
  // Pass role and name in metadata so database trigger can auto-create user_roles
  const { data, error } = await supabase.auth.signUp({
    email: formData.email as string,
    password: formData.password as string,
    options: {
      data: {
        full_name: formData.name as string,
        role: formData.role, // Trigger will use this to create user_roles
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // user_roles entry is automatically created by database trigger
  // No manual INSERT needed - trigger handles it on auth.users INSERT
  
  if (data.user) {
    // Verify user_roles was created (optional check)
    const { data: userRole, error: roleError } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('user_id', data.user.id)
      .maybeSingle();

    if (roleError || !userRole) {
      console.error('User role not auto-created:', roleError);
      // Don't fail signup - user can still login and complete onboarding
    }

    // Auto-create instructor profile for faculty users
    if (formData.role === 'faculty') {
      const { error: instructorError } = await supabase
        .rpc('create_instructor_for_user', {
          p_user_id: data.user.id,
          p_name: formData.name,
          p_email: formData.email,
          p_max_load_per_week: 12,
        });

      if (instructorError) {
        // Log error but don't fail signup
        // The faculty user can still login, and admin can manually create instructor if needed
        console.error('Failed to create instructor profile:', instructorError);
      }
    }
  }

  return { user: data.user, session: data.session };
}

//login with email and password
export async function login(formData: { email: string; password: string }) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      return { error: error.message };
    }

    return { user: data.user, session: data.session };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An unexpected error occurred during login. Please try again.' };
  }
}

//logout and remove user
export async function logOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return { error: error.message };
  }

  return;
}

// Complete onboarding - create role-specific profile
export async function completeOnboarding(data: {
  userId: string;
  role: 'student' | 'faculty' | 'scheduling' | 'teaching_load' | 'registrar';
  level?: number; // Required for students
}) {
  try {
    // 1. Authenticate & Fetch Data: Get current user from Supabase auth
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return { error: 'Unauthorized: Please log in to complete onboarding' };
    }

    // 2. Safety Check: Ensure the authenticated user.id matches the passed userId
    if (user.id !== data.userId) {
      return { error: 'Unauthorized: User ID mismatch' };
    }

    // 3. Upsert Parent Record: Ensure UserRole exists before creating profile
    await db.userRole.upsert({
      where: { userId: user.id },
      update: {}, // Do nothing if it already exists
      create: {
        userId: user.id,
        email: user.email || '',
        name: (user.user_metadata?.full_name as string) || user.email || 'User',
        role: data.role as 'scheduling' | 'teaching_load' | 'faculty' | 'student' | 'registrar',
      },
    });

    // 4. Create Child Record: Now that UserRole exists, create the profile
    if (data.role === 'student') {
      if (!data.level) {
        return { error: 'Academic level is required for students' };
      }

      // Create student profile
      await createStudentProfile({
        userId: data.userId,
        level: data.level,
        department: 'Software Engineering',
      });
    } else if (data.role === 'faculty') {
      // Create faculty profile with default values
      await db.facultyProfile.create({
        data: {
          userId: data.userId,
          preferredTimes: [],
          unavailableTimes: [],
          maxLoadPerWeek: 12,
        },
      });
    }
    // Other roles (scheduling, teaching_load, registrar) don't need separate profiles

    return { success: true };
  } catch (error) {
    console.error('Error completing onboarding:', error);
    return { error: error instanceof Error ? error.message : 'Failed to complete onboarding' };
  }
}
