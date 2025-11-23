/**
 * DEMO MODE: Server Actions
 * 
 * Demo authentication with predefined accounts for each role.
 */

"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { verifyDemoCredentials } from "@/lib/demo-data";

// DEMO MODE: Signup always succeeds and redirects to dashboard
export async function signup(formData: {
  name: string;
  email: string;
  password: string;
  role: 'scheduling' | 'teaching_load' | 'faculty' | 'student' | 'registrar';
}) {
  // In demo mode, always redirect to dashboard
  redirect("/dashboard");
}

// DEMO MODE: Login with demo accounts
export async function login(formData: { email: string; password: string }) {
  const { valid, user } = verifyDemoCredentials(formData.email, formData.password);
  
  if (!valid || !user) {
    return { error: "Invalid email or password" };
  }
  
  // Store demo user in cookie
  const cookieStore = await cookies();
  cookieStore.set('demo_user_id', user.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  
  // Redirect to role-specific dashboard
  switch (user.role) {
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

// DEMO MODE: Logout clears cookie
// Note: For client components, use the /api/auth/logout route instead
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
