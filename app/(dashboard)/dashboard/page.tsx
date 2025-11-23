import { redirect } from "next/navigation";
import { getMockUserRole } from "@/lib/demo-data";

// Force dynamic rendering - never cache this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
  // DEMO MODE: Use mock user data
  const userRole = await getMockUserRole();

  if (!userRole) {
    // Fallback: redirect to student dashboard
    redirect('/dashboard/student');
  }

  // Redirect to role-specific dashboard
  switch (userRole.role) {
    case 'scheduling':
      redirect('/dashboard/scheduling');
    case 'teaching_load':
      redirect('/dashboard/teaching-load');
    case 'faculty':
      redirect('/dashboard/faculty');
    case 'student':
      redirect('/dashboard/student');
    case 'registrar':
      redirect('/dashboard/registrar');
    default:
      // Fallback: redirect to student dashboard
      redirect('/dashboard/student');
  }
}
