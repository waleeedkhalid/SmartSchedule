/**
 * Server Action Usage Example
 * 
 * This file demonstrates how to use the Supabase server client
 * in Server Actions for CRUD operations.
 * 
 * IMPORTANT: Always call `supabase.auth.getUser()` first to verify
 * authentication. This ensures the session is valid and cookies are
 * properly set for subsequent database operations.
 */

"use server";

import { createClient } from "@/supabase/server";

/**
 * Example: Create a new course
 */
export async function createCourse(formData: {
  code: string;
  title: string;
  credits: number;
}) {
  try {
    // 1. Create Supabase client (automatically reads cookies from request)
    const supabase = await createClient();

    // 2. CRITICAL: Verify authentication first
    // This ensures the session is valid and cookies are properly set
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Authentication required. Please provide a valid token.");
    }

    // 3. Perform database operation
    const { data, error } = await supabase
      .from("course")
      .insert({
        code: formData.code,
        title: formData.title,
        credits: formData.credits,
        created_by: user.id, // Use authenticated user ID
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error creating course:", error);
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Example: Update an existing course
 */
export async function updateCourse(
  courseId: number,
  updates: {
    title?: string;
    credits?: number;
  }
) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Authentication required. Please provide a valid token.");
    }

    // Perform update
    const { data, error } = await supabase
      .from("course")
      .update(updates)
      .eq("id", courseId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error updating course:", error);
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Example: Delete a course
 */
export async function deleteCourse(courseId: number) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Authentication required. Please provide a valid token.");
    }

    // Perform delete
    const { error } = await supabase
      .from("course")
      .delete()
      .eq("id", courseId);

    if (error) {
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting course:", error);
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

/**
 * Example: Role-based access control
 */
export async function createSection(formData: {
  course_code: string;
  section_no: string;
  // ... other fields
}) {
  try {
    const supabase = await createClient();

    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new Error("Authentication required. Please provide a valid token.");
    }

    // Check user role with error handling
    let userRole;
    let roleError;
    
    try {
      const result = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();
      
      userRole = result.data;
      roleError = result.error;
    } catch (error) {
      // Catch any unexpected errors (network issues, etc.)
      console.warn('Unexpected error fetching user role in example:', error);
      throw new Error("User role not found.");
    }

    // Handle errors gracefully
    if (roleError) {
      // Handle 400 errors specifically - these are query/RLS issues
      if (roleError.status === 400 || roleError.code?.startsWith('PGRST')) {
        console.warn('user_roles query error (400) in example:', {
          code: roleError.code,
          message: roleError.message,
        });
      } else {
        console.warn('Error fetching user role in example:', {
          code: roleError.code,
          message: roleError.message,
        });
      }
      throw new Error("User role not found.");
    }

    if (!userRole) {
      throw new Error("User role not found.");
    }

    // Only scheduling and registrar can create sections
    if (!["scheduling", "registrar"].includes(userRole.role)) {
      throw new Error("Access denied. Only scheduling and registrar can create sections.");
    }

    // Perform insert
    const { data, error } = await supabase
      .from("section")
      .insert({
        course_code: formData.course_code,
        section_no: formData.section_no,
        created_by: user.id,
        // ... other fields
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error creating section:", error);
    return {
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}

