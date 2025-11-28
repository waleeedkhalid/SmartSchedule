import { getServerUser } from "@/lib/server-auth";
import { Sidebar } from "@/components/nav/sidebar";
import { DashboardTopBar } from "@/components/dashboard-top-bar";
import { ClientOnly } from "@/components/client-only";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get authenticated user (supports both demo and Supabase)
  // If session expired, getServerUser returns null and middleware will handle signout
  const user = await getServerUser();

  // FIXED: Don't redirect in layout - let pages handle their own redirects
  // This prevents RedirectBoundary errors from multiple redirects in the same render tree
  // If no user (session expired), render minimal layout and let child pages handle redirect
  // Middleware will automatically sign out and redirect to login with session=expired
  if (!user) {
    // Return minimal layout without sidebar - middleware will handle signout
    // Child pages will redirect to login if needed
    return (
      <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    );
  }

  const userName = user.name || 'User';
  const userRoleName = user.role || 'student';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar - Wrapped in ClientOnly to prevent hydration errors from localStorage access */}
      <aside className="w-64 flex-shrink-0 h-full overflow-hidden">
        <ClientOnly
          fallback={
            <div className="h-full w-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800" />
          }
        >
          <Sidebar 
            userRole={userRoleName}
            userName={userName}
          />
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
          <div className="p-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
