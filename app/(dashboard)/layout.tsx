import { redirect } from "next/navigation";
import { getMockUserRole } from "@/lib/demo-data";
import { Sidebar } from "@/components/nav/sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // DEMO MODE: Use mock user data
  const userRole = await getMockUserRole();

  if (!userRole) {
    redirect("/login");
  }

  const userName = userRole.name || 'Demo User';
  const userEmail = userRole.email || 'demo@university.edu';
  const userRoleName = userRole.role || 'student';

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0">
        <Sidebar 
          userRole={userRoleName}
          userName={userName}
          userEmail={userEmail}
        />
      </aside>
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
