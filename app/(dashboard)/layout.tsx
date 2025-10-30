import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
// Temporarily commented during maintenance mode:
// import { SidebarProvider } from "@/components/ui/sidebar";
// import { AppSidebar } from "@/components/app-sidebar";
// import { AppHeader } from "@/components/app-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Database, Wrench, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// 🚨 GLOBAL MAINTENANCE MODE 🚨
const MAINTENANCE_MODE = true;

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get user details for personalized message
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('name, role')
    .eq('user_id', user.id)
    .maybeSingle();

  const userName = userRole?.name || user.email?.split('@')[0] || 'User';
  const userRoleName = userRole?.role || 'user';
  
  // Format role name nicely
  const roleDisplayName = userRoleName
    .split('_')
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // 🚨 GLOBAL MAINTENANCE MODE - Block all dashboard access
  if (MAINTENANCE_MODE) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full">
          <Card className="border-2 border-red-200 dark:border-red-800 shadow-2xl">
            <CardHeader className="text-center space-y-4 pb-6">
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 blur-2xl opacity-40 animate-pulse"></div>
                  <div className="relative bg-gradient-to-br from-red-500 to-orange-600 rounded-full p-8">
                    <Database className="h-20 w-20 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <CardTitle className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                  Welcome, {userName}!
                </CardTitle>
                <p className="text-lg text-muted-foreground mt-2">
                  {roleDisplayName} Dashboard is in Maintenance
                </p>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Personalized Welcome Message */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border-2 border-blue-300 dark:border-blue-800 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-xl text-blue-900 dark:text-blue-100 mb-2">
                      Thank You for Your Understanding
                    </h3>
                    <p className="text-blue-800 dark:text-blue-200">
                      We appreciate your patience as we perform critical system upgrades. 
                      Your {roleDisplayName} dashboard will be available shortly.
                    </p>
                  </div>
                </div>
              </div>
              {/* Critical Notice */}
              <div className="bg-red-50 dark:bg-red-950/30 border-2 border-red-300 dark:border-red-800 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                  <div className="space-y-2">
                    <h3 className="font-bold text-xl text-red-900 dark:text-red-100">
                      All Dashboard Features Temporarily Unavailable
                    </h3>
                    <p className="text-red-800 dark:text-red-200">
                      We&apos;re performing critical database schema restructuring to improve data integrity 
                      and system performance. All features requiring database access are currently offline.
                    </p>
                  </div>
                </div>
              </div>

              {/* What's Being Fixed */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-lg">Database Schema Issues Being Resolved</h3>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold">1</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">User Roles Table Redesign</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Separating student-specific fields (level, major) from general user roles table
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold">2</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Student Profile Table Creation</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Creating dedicated student_profile table for student-specific data normalization
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold">3</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">Comment System Schema Migration</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Updating schedule_comment table from student_id to author_id for multi-user support
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 flex items-center justify-center text-sm font-bold">4</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">API Route Updates</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Updating all API endpoints to work with new schema structure
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="bg-gray-900 dark:bg-black rounded-lg p-5 space-y-3">
                <p className="text-gray-400 text-sm font-mono">SCHEMA MIGRATION DETAILS:</p>
                <div className="space-y-2 text-sm font-mono">
                  <p className="text-green-400">
                    <span className="text-gray-500">→</span> CREATE TABLE student_profile
                  </p>
                  <p className="text-green-400">
                    <span className="text-gray-500">→</span> ALTER TABLE user_roles DROP COLUMN level
                  </p>
                  <p className="text-green-400">
                    <span className="text-gray-500">→</span> ALTER TABLE schedule_comment RENAME student_id TO author_id
                  </p>
                  <p className="text-yellow-400">
                    <span className="text-gray-500">→</span> UPDATE all API routes and database functions
                  </p>
                  <p className="text-blue-400">
                    <span className="text-gray-500">→</span> REGENERATE TypeScript types
                  </p>
                </div>
              </div>

              {/* Current Errors Fixed */}
              <div className="border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-950/30 p-4 rounded">
                <p className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                  Issues Being Resolved:
                </p>
                <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
                  <li>• 500 Error: /api/student/enrollments</li>
                  <li>• 500 Error: /api/student/available-sections</li>
                  <li>• Database schema normalization issues</li>
                  <li>• Student-specific data in shared user_roles table</li>
                  <li>• Foreign key constraint updates</li>
                </ul>
              </div>

              {/* ETA */}
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Database className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">Estimated Time</p>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                      Database restructuring is expected to take 4-8 hours. This includes schema migrations, 
                      data migration, API updates, and comprehensive testing.
                    </p>
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Account:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{user.email}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Role:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{roleDisplayName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">Dashboard Offline</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button asChild variant="outline" className="flex-1" size="lg">
                  <Link href="/maintenance">
                    <Database className="mr-2 h-4 w-4" />
                    View Technical Details
                  </Link>
                </Button>
                <form action="/api/auth/signout" method="POST" className="flex-1">
                  <Button 
                    type="submit" 
                    variant="outline" 
                    className="w-full"
                    size="lg"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </form>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 dark:text-gray-400 pt-4 border-t">
                <p>Last updated: {new Date().toLocaleString()}</p>
                <p className="mt-1">Thanks for your understanding, {userName}. Your data is safe.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Normal dashboard layout (when maintenance is disabled)
  // Uncomment these imports at the top when disabling maintenance:
  // import { SidebarProvider } from "@/components/ui/sidebar";
  // import { AppSidebar } from "@/components/app-sidebar";
  // import { AppHeader } from "@/components/app-header";
  
  return (
    <div className="p-8">
      <p>Dashboard layout - maintenance mode is off but components not imported.</p>
      <p>Please uncomment the sidebar imports at the top of this file.</p>
      {children}
    </div>
  );
  
  // Restore this when maintenance is disabled:
  // return (
  //   <SidebarProvider>
  //     <div className="flex h-screen w-full overflow-hidden">
  //       <AppSidebar user={user} />
  //       <div className="flex flex-1 flex-col overflow-hidden">
  //         <AppHeader />
  //         <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
  //           {children}
  //         </main>
  //       </div>
  //     </div>
  //   </SidebarProvider>
  // );
}
