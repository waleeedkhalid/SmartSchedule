"use client";

import { Menu, UserCircle2 } from "lucide-react";

import { heroSummary, roleMap, smartScheduleTitle } from "@/data/dashboard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";

import { RoleSwitcher } from "./role-switcher";
import { useRole } from "./role-context";

export function DashboardHeader({
  onOpenMobileNav,
}: {
  onOpenMobileNav: () => void;
}) {
  const { role } = useRole();
  const currentRole = roleMap[role];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div
        className="flex h-16 items-center justify-between px-4 sm:px-6"
        data-test="dashboard-header"
      >
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onOpenMobileNav}
            aria-label="Open navigation"
            data-test="sidebar-open"
          >
            <Menu className="size-5" aria-hidden="true" />
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-tight">
              {smartScheduleTitle}
            </span>
            <span className="text-xs text-muted-foreground">
              {currentRole.label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <RoleSwitcher className="hidden md:flex" />
          <ThemeToggle />
          <div
            aria-label="Mock user profile"
            className="hidden items-center gap-2 rounded-full border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm sm:flex"
          >
            <UserCircle2
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
            <span>User</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-3 px-4 pb-4 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p
          className="text-xs text-muted-foreground md:text-sm"
          data-test="header-summary"
        >
          {heroSummary}
        </p>
        <div className="md:hidden">
          <RoleSwitcher className="w-full" />
        </div>
      </div>
    </header>
  );
}
