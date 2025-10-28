import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user role from user_roles table
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  // Redirect to role-specific dashboard
  if (userRole?.role) {
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
        // If role is unknown, stay on generic dashboard
        break;
    }
  }

  // Fallback: show error if no role found
  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
            No Role Assigned
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300">
            Your account does not have a role assigned yet. Please contact the system administrator
            to assign you a role (scheduling, teaching_load, faculty, student, or registrar).
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-3">
            User ID: {user.id}
          </p>
        </div>
      </div>
    </div>
  );
}
