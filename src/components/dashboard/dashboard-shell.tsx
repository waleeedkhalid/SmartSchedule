"use client";

import * as React from "react";

import { DashboardBreadcrumbs } from "@/components/shared/dashboard-breadcrumbs";
import { Sheet, SheetContent } from "@/components/ui/sheet";

import { DashboardHeader } from "./header";
import { DashboardSidebar, SidebarContent } from "./sidebar";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
      <div className="flex min-h-screen flex-col bg-muted/20">
        <SheetContent side="left" className="w-72 border-r p-0">
          <SidebarContent onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
        <div className="flex flex-1">
          <DashboardSidebar />
          <div className="flex min-h-screen flex-1 flex-col">
            <DashboardHeader onOpenMobileNav={() => setMobileOpen(true)} />
            <main className="flex-1 px-4 pb-10 pt-4 sm:px-6 lg:px-10" data-test="dashboard-main">
              <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
                <DashboardBreadcrumbs />
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </Sheet>
  );
}
