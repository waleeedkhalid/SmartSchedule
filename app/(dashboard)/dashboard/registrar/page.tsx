import { redirect } from "next/navigation";
import { ManualStudentRegistration } from "@/components/manual-student-registration";
import { getServerUser, getDashboardPath, validateOnboardingAndProfile } from "@/lib/server-auth";
import { UpcomingDeadlinesWidget } from "@/components/upcoming-deadlines-widget";
import { RoleNotificationsWidget } from "@/components/role-notifications-widget";
import { RegistrarStats } from "@/components/registrar-stats";
import { StudentLookup } from "@/components/student-lookup";
import { ClientOnly } from "@/components/client-only";
import { getUpcomingDeadlines, getUserNotifications } from "@/lib/db/student-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  // Validate onboarding and profile status
  const { needsOnboarding, profileExists } = await validateOnboardingAndProfile(user.id, user.role)
  
  if (needsOnboarding || !profileExists) {
    redirect('/onboarding')
  }

  // Fetch dashboard data from database (deadlines and notifications)
  // This prevents hydration errors by providing initial data on the server
  const [deadlines, notifications] = await Promise.all([
    getUpcomingDeadlines('registrar', 30),
    getUserNotifications(user.id, 10),
  ]);

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Registrar Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Register students in sections that are 15-50% over capacity
          </p>
        </div>

        {/* Statistics Section */}
        <ClientOnly
          fallback={
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-white dark:bg-gray-900 border rounded-lg" />
              ))}
            </div>
          }
        >
          <RegistrarStats />
        </ClientOnly>

        {/* Timeline and Notifications Section - Wrapped in ClientOnly to prevent hydration errors from date-fns */}
        <div className="grid gap-4 md:grid-cols-2">
          <ClientOnly
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Deadlines</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <UpcomingDeadlinesWidget userRole="registrar" initialData={deadlines} />
          </ClientOnly>
          <ClientOnly
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-32 flex items-center justify-center">
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                </CardContent>
              </Card>
            }
          >
            <RoleNotificationsWidget role="registrar" initialData={notifications} />
          </ClientOnly>
        </div>

        {/* Student Lookup with Academic Progress */}
        <ClientOnly
          fallback={
            <div className="h-96 bg-white dark:bg-gray-900 border rounded-lg flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Loading student lookup...</p>
            </div>
          }
        >
          <StudentLookup />
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

