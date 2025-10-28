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
  const { data, error } = await supabase.auth.signUp({
    email: formData.email as string,
    password: formData.password as string,
    options: {
      data: {
        full_name: formData.name as string,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Create user_roles entry automatically
  if (data.user) {
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: data.user.id,
        role: formData.role,
        name: formData.name,
        email: formData.email,
      });

    if (roleError) {
      // Log error but don't fail signup
      console.error('Failed to create user role:', roleError);
    }

    // Auto-create instructor profile for faculty users
    if (formData.role === 'faculty') {
      const { error: instructorError } = await supabase
        .rpc('create_instructor_for_user', {
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
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    return { error: error.message };
  }

  return { user: data.user, session: data.session };
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
