"use server";

import { createClient } from "@/supabase/server";

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
