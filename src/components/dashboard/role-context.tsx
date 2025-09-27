"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";

import { defaultRole, getDefaultPath, roleMap } from "@/data/dashboard";
import { isRoleKey, type RoleKey } from "@/types/dashboard";

export type RoleContextValue = {
  role: RoleKey;
  activePage: string;
  setRole: (role: RoleKey) => void;
};

const RoleContext = React.createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const segments = React.useMemo(() => pathname.split("/").filter(Boolean), [pathname]);

  const roleSegment = segments[0];
  const pageSegment = segments[1];

  const role = React.useMemo(() => {
    if (isRoleKey(roleSegment)) {
      return roleSegment;
    }
    return defaultRole;
  }, [roleSegment]);

  const activePage = React.useMemo(() => {
    if (pageSegment) return pageSegment;
    return roleMap[role]?.defaultPage ?? roleMap[defaultRole].defaultPage;
  }, [pageSegment, role]);

  const setRole = React.useCallback(
    (nextRole: RoleKey) => {
      if (!roleMap[nextRole]) return;
      if (role === nextRole) return;
      const target = getDefaultPath(nextRole);
      router.push(target);
    },
    [role, router],
  );

  const value = React.useMemo<RoleContextValue>(
    () => ({
      role,
      activePage,
      setRole,
    }),
    [role, activePage, setRole],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const context = React.useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
