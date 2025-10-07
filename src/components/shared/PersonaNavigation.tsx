// Shared navigation component for demo pages
// Provides consistent navigation across all personas

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home } from "lucide-react";
import { NotificationsDropdown } from "../NotificationsDropdown";

// UI-only: navigation metadata (not a domain type)
export interface NavItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

interface PersonaNavigationProps {
  personaName: string;
  navItems: NavItem[];
  className?: string;
}

export function PersonaNavigation({
  personaName,
  navItems,
  className,
}: PersonaNavigationProps) {
  const pathname = usePathname();

  return (
    <div className={cn("border-b bg-background", className)}>
      <div className="container mx-auto px-4">
        {/* Persona Header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <div className="h-4 w-px bg-border" />
            <h1 className="text-lg font-semibold">{personaName}</h1>
          </div>

          {/* Notifications dropdown (replaces placeholder button) */}
          <NotificationsDropdown />
        </div>

        {/* Navigation Tabs */}
        <nav
          className="relative flex gap-1 overflow-x-auto pb-2 scrollbar-hide"
          role="navigation"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap border-b-2",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent hover:border-muted"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// Breadcrumb component for nested pages
interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[];
}

export function PageBreadcrumb({ items }: PageBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <span>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </div>
  );
}

// Page container with consistent styling
interface PageContainerProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageContainer({
  children,
  title,
  description,
  actions,
  className,
}: PageContainerProps) {
  return (
    <div className={cn("container mx-auto px-4 py-6", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
      {children}
    </div>
  );
}
