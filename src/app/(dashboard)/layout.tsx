import type { ReactNode } from "react";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { RoleProvider } from "@/components/dashboard/role-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <DashboardShell>{children}</DashboardShell>
    </RoleProvider>
  );
}
