import { redirect } from "next/navigation";
import { getServerUser, getDashboardPath } from "@/lib/server-auth";

// Force dynamic rendering - never cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();

  // If not authenticated, redirect to login
  // Note: Layout already handles this, but we keep it here for safety
  // If layout allows unauthenticated users through, this will catch it
  if (!user) {
    redirect('/login');
  }

  // Redirect to role-specific dashboard
  // This is the main purpose of this page - route users to their role dashboard
  // Middleware handles redirect loop detection and cookie clearing
  const dashboardPath = getDashboardPath(user.role);
  redirect(dashboardPath);
}
