/**
 * Server-Side Authentication Utilities
 * 
 * Helper functions for getting authenticated user information in server components.
 * Supports both demo accounts and Supabase production accounts.
 */

import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";
import { mockUsers } from "@/lib/demo-data";

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  role: string;
  level?: number;
}

/**
 * Gets the authenticated user from cookies (for server components)
 * Returns null if not authenticated
 */
export async function getServerUser(): Promise<ServerUser | null> {
  const cookieStore = await cookies();
  const demoUserId = cookieStore.get('demo_user_id')?.value;
  const authToken = cookieStore.get('auth_token')?.value;

  // Check for demo user first
  if (demoUserId) {
    const user = mockUsers.find(u => u.id === demoUserId);
    if (user) {
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        level: user.level ?? undefined,
      };
    }
  }

  // Check for real Supabase user
  if (authToken) {
    try {
      const supabase = await createClient();
      
      // Verify token and get user
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser(authToken);

      if (authError || !user) {
        return null;
      }

      // Fetch user role from user_roles table
      const { data: userRole, error: roleError } = await supabase
        .from("user_roles")
        .select("role, name, email")
        .eq("user_id", user.id)
        .single();

      if (roleError || !userRole) {
        return null;
      }

      // Fetch student level from student_profile if user is a student
      let studentLevel: number | undefined = undefined;
      if (userRole.role === 'student') {
        const { data: studentProfile } = await supabase
          .from("student_profile")
          .select("level")
          .eq("user_id", user.id)
          .single();
        
        if (studentProfile) {
          studentLevel = studentProfile.level;
        }
      }

      return {
        id: user.id,
        email: userRole.email,
        role: userRole.role,
        name: userRole.name,
        level: studentLevel,
      };
    } catch (error) {
      console.error("Error getting server user:", error);
      return null;
    }
  }

  return null;
}

/**
 * Gets the dashboard path for a given role
 */
export function getDashboardPath(role: string): string {
  switch (role) {
    case 'student':
      return '/dashboard/student';
    case 'faculty':
      return '/dashboard/faculty';
    case 'scheduling':
      return '/dashboard/scheduling';
    case 'teaching_load':
      return '/dashboard/teaching-load';
    case 'registrar':
      return '/dashboard/registrar';
    default:
      return '/dashboard/student'; // Default fallback
  }
}

