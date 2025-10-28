import React from "react";
import { createClient } from "@/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/nav/sidebar";
import { MobileNav } from "@/components/nav/mobile-nav";

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

  // Get user role and info
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role, name, email')
    .eq('user_id', user.id)
    .single();

  if (!userRole) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 fixed inset-y-0 left-0">
        <Sidebar 
          userRole={userRole.role}
          userName={userRole.name}
          userEmail={userRole.email}
        />
      </aside>

      {/* Mobile Navigation */}
      <MobileNav 
        userRole={userRole.role}
        userName={userRole.name}
        userEmail={userRole.email}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0 bg-slate-50 dark:bg-slate-950 min-h-screen">
        <div className="p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
