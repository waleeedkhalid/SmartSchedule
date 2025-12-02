import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/server-auth";
import { Sidebar } from "@/components/nav/sidebar";
import { DashboardTopBar } from "@/components/dashboard-top-bar";
import { ClientOnly } from "@/components/client-only";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // 1. Security & Onboarding Checks
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user has completed onboarding
  // Using user_metadata as the source of truth for onboarding status
  if (user.user_metadata?.onboarding_completed !== true) {
    redirect("/onboarding");
  }

  // 2. Get formatted user data for UI (Role, Name, etc.)
  // We use getServerUser here to get the role from the database
  // This might result in a second getUser call, but it ensures we have the correct role data
  const serverUser = await getServerUser();

  // If getServerUser returns null (shouldn't happen if we passed the check above),
  // we can fallback or redirect.
  if (!serverUser) {
    redirect("/login");
  }

  const userName = serverUser.name || "User";
  const userRoleName = serverUser.role || "student";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Wrapped in ClientOnly to prevent hydration errors from localStorage access */}
      <aside className="w-64 flex-shrink-0 h-full overflow-hidden">
        <ClientOnly
          fallback={
            <div className="h-full w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800" />
          }
        >
          <Sidebar userRole={userRoleName} userName={userName} />
        </ClientOnly>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar with Timeline and Notifications - Wrapped in ClientOnly to prevent hydration errors */}
        <ClientOnly
          fallback={
            <div className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800" />
          }
        >
          <DashboardTopBar />
        </ClientOnly>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
        </div>
      </main>
    </div>
  );
}
