/**
 * Server Actions for Authentication
 * 
 * Supports both demo accounts and real Supabase authentication.
 * Uses the production API endpoint for authentication.
 */

"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyDemoCredentials } from "@/lib/demo-data";
import { createClient } from "@/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

// Signup with Supabase
export async function signup(formData: {
  name: string;
  email: string;
  password: string;
  role: 'scheduling' | 'teaching_load' | 'faculty' | 'student' | 'registrar';
}) {
  try {
    const supabase = await createClient();

    // Sign up with Supabase Auth
    // Note: The trigger handle_new_user() will automatically create user_roles entry
    // We use 'full_name' to match what the trigger expects
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.name, // Trigger expects 'full_name', not 'name'
          role: formData.role,
        },
      },
    });

    if (authError || !authData.user) {
      return { 
        error: authError?.message || "Failed to create account. Please try again." 
      };
    }

    // The trigger handle_new_user() should have created the user_roles entry automatically
    // However, since the user isn't signed in yet after signUp(), we can't check with regular client
    // Use service role client to verify and create if needed (bypasses RLS)
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!serviceRoleKey) {
      console.warn("SUPABASE_SERVICE_ROLE_KEY not set. Relying on trigger to create user_roles entry.");
      // Trigger should handle it, but we can't verify without service role
      // Return success and let onboarding handle any issues
      return { success: true };
    }

    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // CRITICAL: Verify the user actually exists in auth.users before proceeding
    // signUp() may return a user object before the transaction is committed
    // The trigger runs AFTER INSERT, so we need to wait for the transaction to commit
    let userExistsInAuth = false;
    const maxAttempts = 10; // Increase attempts for slower systems
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (attempt > 0) {
        // Exponential backoff: 100ms, 200ms, 400ms, 800ms, 1600ms, etc.
        await new Promise(resolve => setTimeout(resolve, 100 * Math.pow(2, attempt - 1)));
      }
      
      try {
        const { data: authUser, error: userCheckError } = await serviceClient.auth.admin.getUserById(authData.user.id);
        if (!userCheckError && authUser && authUser.user) {
          userExistsInAuth = true;
          console.log(`User verified in auth.users after ${attempt + 1} attempt(s)`);
          break;
        }
      } catch (error) {
        // Continue retrying
        if (attempt === maxAttempts - 1) {
          console.error("Final attempt failed to verify user:", error);
        }
      }
    }

    if (!userExistsInAuth) {
      console.error("User was not found in auth.users after signUp() - transaction may not have committed");
      // Don't return error - let the trigger handle it and user can complete onboarding later
      // The user was created, just not visible yet
      return { success: true };
    }

    // Wait for trigger to complete and check if user_roles entry exists
    // Retry logic with exponential backoff to handle timing issues
    let existingRole = null;
    
    for (let attempt = 0; attempt < 5; attempt++) {
      // Wait with exponential backoff: 200ms, 400ms, 800ms, 1600ms, 3200ms
      if (attempt > 0) {
        await new Promise(resolve => setTimeout(resolve, 200 * Math.pow(2, attempt - 1)));
      }
      
      // Check if user_roles entry exists (trigger should have created it)
      const { data: roleData, error: roleCheckError } = await serviceClient
        .from("user_roles")
        .select("user_id")
        .eq("user_id", authData.user.id)
        .single();
      
      if (!roleCheckError && roleData) {
        existingRole = roleData;
        break;
      }
    }

    // If role doesn't exist (trigger might have failed), create it manually using service role
    if (!existingRole) {
      console.log("Trigger did not create user_roles entry, creating manually...");
      
      // Double-check user exists before inserting (prevent foreign key violation)
      // Retry the user check one more time to ensure it's committed
      let userVerified = false;
      for (let verifyAttempt = 0; verifyAttempt < 3; verifyAttempt++) {
        if (verifyAttempt > 0) {
          await new Promise(resolve => setTimeout(resolve, 300 * verifyAttempt));
        }
        
        try {
          const { data: verifyUser, error: verifyError } = await serviceClient.auth.admin.getUserById(authData.user.id);
          if (!verifyError && verifyUser && verifyUser.user) {
            userVerified = true;
            break;
          }
        } catch (error) {
          console.log(`Verification attempt ${verifyAttempt + 1} failed, retrying...`);
        }
      }
      
      if (!userVerified) {
        console.error("User does not exist in auth.users after verification - cannot create user_roles entry");
        // Don't return error - the user was created, trigger should handle it
        // If trigger fails, user can complete onboarding which will create the entry
        console.log("Relying on trigger to create user_roles entry. User can complete onboarding if needed.");
        return { success: true };
      }
      
      // User exists, now safe to insert
      // Add one more small delay to ensure trigger has had time to run
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const { error: roleError } = await serviceClient
        .from("user_roles")
        .insert({
          user_id: authData.user.id,
          email: formData.email,
          name: formData.name,
          role: formData.role,
          onboarding_completed: false,
        });

      if (roleError) {
        console.error("Failed to create user_roles entry:", roleError);
        
        // Check if it's a foreign key constraint error (user still doesn't exist)
        if (roleError.code === '23503') {
          console.error("Foreign key violation - user still not in auth.users");
          // Don't return error - let trigger handle it or user completes onboarding
          return { success: true };
        }
        
        // For other errors, try to clean up
        try {
          await serviceClient.auth.admin.deleteUser(authData.user.id);
        } catch (deleteError) {
          console.error("Failed to clean up auth user:", deleteError);
        }
        return { 
          error: `Failed to create user profile: ${roleError.message || 'Unknown error'}. Please contact support.` 
        };
      }
      console.log("Successfully created user_roles entry manually");
    } else {
      console.log("user_roles entry already exists (created by trigger)");
    }

    return { success: true };
  } catch (error) {
    console.error("Signup error:", error);
    return { 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

// Login with both demo and Supabase support
export async function login(formData: { email: string; password: string }) {
  // First check for demo credentials
  const { valid: isDemo, user: demoUser } = verifyDemoCredentials(formData.email, formData.password);
  
  if (isDemo && demoUser) {
    // Handle demo login
    const cookieStore = await cookies();
    cookieStore.set('demo_user_id', demoUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    // Redirect to role-specific dashboard
    switch (demoUser.role) {
      case 'student':
        redirect('/dashboard/student');
      case 'faculty':
        redirect('/dashboard/faculty');
      case 'scheduling':
        redirect('/dashboard/scheduling');
      case 'teaching_load':
        redirect('/dashboard/teaching-load');
      case 'registrar':
        redirect('/dashboard/registrar');
      default:
        redirect('/dashboard');
    }
  }
  
  // Try real Supabase authentication
  try {
    const supabase = await createClient();
    
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });
    
    if (authError || !authData.user) {
      return { error: authError?.message || "Invalid email or password" };
    }
    
    // CRITICAL: Verify the user session is established
    // This ensures Supabase cookies are properly set
    const { data: { user: verifiedUser }, error: verifyError } = await supabase.auth.getUser();
    
    if (verifyError || !verifiedUser) {
      return { error: "Failed to establish session. Please try again." };
    }
    
    // Fetch user role information
    const { data: userRole, error: roleError } = await supabase
      .from("user_roles")
      .select("role, name, email")
      .eq("user_id", verifiedUser.id)
      .single();
    
    if (roleError || !userRole) {
      return { error: "User role not found. Please complete onboarding." };
    }
    
    // Note: Supabase SSR automatically manages cookies via the createClient() function
    // The cookies are set automatically when signInWithPassword() succeeds
    // No need to manually set auth_token cookie anymore
    
    // Redirect to role-specific dashboard
    switch (userRole.role) {
      case 'student':
        redirect('/dashboard/student');
      case 'faculty':
        redirect('/dashboard/faculty');
      case 'scheduling':
        redirect('/dashboard/scheduling');
      case 'teaching_load':
        redirect('/dashboard/teaching-load');
      case 'registrar':
        redirect('/dashboard/registrar');
      default:
        redirect('/dashboard');
    }
  } catch (error) {
    console.error("Login error:", error);
    return { 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

// Logout - Now handled by client-side API call
// Note: For client components, use the /api/v1/auth/logout route instead
export async function logOut() {
  const cookieStore = await cookies();
  
  // Clear the demo_user_id cookie
  cookieStore.delete('demo_user_id');
  
  // Also set it to empty with expired date to ensure it's cleared
  cookieStore.set('demo_user_id', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    path: '/',
  });
  
  // Return success (client components should handle redirect)
  return { success: true };
}
