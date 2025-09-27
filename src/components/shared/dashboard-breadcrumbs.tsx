"use client";

import Link from "next/link";

import { constructBreadcrumbSegments } from "@/data/dashboard";

import { useRole } from "../dashboard/role-context";

export function DashboardBreadcrumbs() {
  const { role, activePage } = useRole();
  const segments = constructBreadcrumbSegments(role, activePage);

  const crumbs = [
    { label: "SmartSchedule", href: segments[0]?.href ?? "/" },
    ...segments,
  ];

  return (
    <nav aria-label="Breadcrumb" className="text-sm" data-test="breadcrumb">
      <ol className="flex items-center gap-1 text-muted-foreground">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <li key={crumb.href} className="flex items-center gap-1">
              {isLast ? (
                <span className="font-medium text-foreground">
                  {crumb.label}
                </span>
              ) : (
                <Link href={crumb.href} className="hover:text-foreground">
                  {crumb.label}
                </Link>
              )}
              {!isLast ? <span className="text-xs">/&nbsp;</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
