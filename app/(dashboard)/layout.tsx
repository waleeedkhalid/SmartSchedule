import { getServerUser } from "@/lib/server-auth";
import { Sidebar } from "@/components/nav/sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get authenticated user (supports both demo and Supabase)
  const user = await getServerUser();

  // FIXED: Don't redirect in layout - let pages handle their own redirects
  // This prevents RedirectBoundary errors from multiple redirects in the same render tree
  // If no user, render minimal layout and let child pages handle redirect
  if (!user) {
    // Return minimal layout without sidebar - child pages will redirect to login
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
  const userEmail = user.email || '';
  const userRoleName = user.role || 'student';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 h-full overflow-hidden">
        <Sidebar 
          userRole={userRoleName}
          userName={userName}
          userEmail={userEmail}
        />
      </aside>
      
      {/* Main Content */}
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
