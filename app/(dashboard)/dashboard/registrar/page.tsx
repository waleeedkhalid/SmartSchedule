import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { IrregularStudentsTable } from "@/components/irregular-students-table";
import { ManualStudentRegistration } from "@/components/manual-student-registration";

export default async function RegistrarDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verify user has registrar role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (userRole?.role !== 'registrar') {
    redirect("/dashboard");
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Registrar Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage irregular students and manual course registrations
          </p>
        </div>

        {/* Irregular Students Management */}
        <IrregularStudentsTable />

        {/* Manual Student Registration */}
        <ManualStudentRegistration />
      </div>
    </div>
  );
}

