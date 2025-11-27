import { redirect } from "next/navigation";
import { IrregularStudentsTable } from "@/components/irregular-students-table";
import { ManualStudentRegistration } from "@/components/manual-student-registration";
import { getServerUser, getDashboardPath } from "@/lib/server-auth";
import { UpcomingDeadlinesWidget } from "@/components/upcoming-deadlines-widget";
import { RoleNotificationsWidget } from "@/components/role-notifications-widget";
import { ClientOnly } from "@/components/client-only";

export default async function RegistrarDashboardPage() {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();

  // If not authenticated, redirect to login (prevents infinite redirect loop)
  if (!user) {
    redirect("/login");
  }

  // FIX: Use getDashboardPath instead of hardcoding /dashboard
  // This ensures we redirect to the correct role-specific dashboard
  // Also handle undefined/null role by redirecting to onboarding
  if (!user.role || user.role !== 'registrar') {
    // If role is missing, user needs onboarding
    if (!user.role) {
      redirect("/onboarding");
    }
    // Otherwise redirect to their correct dashboard
    const correctDashboard = getDashboardPath(user.role);
    redirect(correctDashboard);
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

        {/* Timeline and Notifications Section - Wrapped in ClientOnly to prevent hydration errors from date-fns */}
        <div className="grid gap-4 md:grid-cols-2">
          <ClientOnly
            fallback={
              <div className="h-32 bg-white dark:bg-gray-900 border rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            }
          >
            <UpcomingDeadlinesWidget userRole="registrar" />
          </ClientOnly>
          <ClientOnly
            fallback={
              <div className="h-32 bg-white dark:bg-gray-900 border rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            }
          >
            <RoleNotificationsWidget role="registrar" />
          </ClientOnly>
        </div>

        {/* Irregular Students Management - Already a client component, but wrapped to ensure no hydration issues */}
        <ClientOnly
          fallback={
            <div className="h-64 bg-white dark:bg-gray-900 border rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading table...</p>
            </div>
          }
        >
          <IrregularStudentsTable />
        </ClientOnly>

        {/* Manual Student Registration - Already a client component, but wrapped to ensure no hydration issues */}
        <ClientOnly
          fallback={
            <div className="h-64 bg-white dark:bg-gray-900 border rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading registration form...</p>
            </div>
          }
        >
          <ManualStudentRegistration />
        </ClientOnly>
      </div>
    </div>
  );
}

