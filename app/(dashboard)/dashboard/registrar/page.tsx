import { redirect } from "next/navigation";
import { IrregularStudentsTable } from "@/components/irregular-students-table";
import { ManualStudentRegistration } from "@/components/manual-student-registration";
import { getServerUser } from "@/lib/server-auth";

export default async function RegistrarDashboardPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();

  // If not authenticated, redirect to login (prevents infinite redirect loop)
  if (!user) {
    redirect("/login");
  }

  // If authenticated but wrong role, redirect to dashboard (which will redirect to correct role)
  if (user.role !== 'registrar') {
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

