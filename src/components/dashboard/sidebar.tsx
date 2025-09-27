"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { getPath, roleMap } from "@/data/dashboard";
import { cn } from "@/lib/utils";

import { useRole } from "./role-context";

export function DashboardSidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r bg-background/80 backdrop-blur lg:block">
      <div className="flex h-full flex-col">
        <SidebarContent />
      </div>
    </aside>
  );
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { role } = useRole();
  const pathname = usePathname();
  const config = roleMap[role];

  return (
    <div className="flex h-full flex-col">
      <div className="space-y-1 px-6 pb-5 pt-6">
        <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          SmartSchedule
        </span>
        <p className="text-lg font-semibold">{config.label} workspace</p>
        <p className="text-sm text-muted-foreground">{config.description}</p>
      </div>
      <nav aria-label={`${config.label} navigation`} className="flex-1 space-y-1 px-2 pb-8">
        {config.pages.map((page) => {
          const href = getPath(role, page.slug);
          const active = pathname === href;
          const Icon = page.icon;

          return (
            <Link
              key={page.slug}
              href={href}
              data-test={page.testId}
              aria-current={active ? "page" : undefined}
              onClick={() => onNavigate?.()}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              )}
            >
              <span className="flex size-9 items-center justify-center rounded-md border bg-background">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="flex-1 truncate font-medium">{page.title}</span>
              {page.badge ? (
                <span className="text-xs font-semibold text-muted-foreground">{page.badge}</span>
              ) : null}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
