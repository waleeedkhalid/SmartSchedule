"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  Clock,
  MessageSquare,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { NotificationsDropdown } from "@/components/NotificationsDropdown";
import ThemeToggleButton from "@/components/ui/theme-toggle-button";
import { useState } from "react";

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/faculty/dashboard",
    icon: LayoutDashboard,
    description: "Overview and quick actions",
  },
  {
    label: "My Courses",
    href: "/faculty/courses",
    icon: BookOpen,
    description: "View assigned courses",
  },
  {
    label: "Schedule",
    href: "/faculty/schedule",
    icon: Calendar,
    description: "Teaching schedule",
  },
  {
    label: "Availability",
    href: "/faculty/availability",
    icon: Clock,
    description: "Set weekly availability",
  },
  {
    label: "Feedback",
    href: "/faculty/feedback",
    icon: MessageSquare,
    description: "Student feedback",
  },
];

interface FacultySidebarProps {
  fullName: string;
  title: string;
}

export function FacultySidebar({ fullName, title }: FacultySidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 xl:w-72 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800">
        <SidebarContent fullName={fullName} title={title} />
      </aside>

      {/* Mobile Sidebar */}
      <MobileSidebar fullName={fullName} title={title} />
    </>
  );
}

function SidebarContent({
  fullName,
  title,
}: {
  fullName: string;
  title: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 p-6 border-b border-gray-200 dark:border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="h-4 w-4" />
          <span>Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">
              {fullName}
            </h2>
            <p className="text-xs text-muted-foreground truncate">{title}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-gray-100 dark:hover:bg-gray-800",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 dark:hover:bg-primary/90"
                    : "text-gray-700 dark:text-gray-300"
                )}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{item.label}</div>
                  {!isActive && item.description && (
                    <div className="text-xs text-muted-foreground truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.description}
                    </div>
                  )}
                </div>
                {isActive && <ChevronRight className="h-4 w-4 flex-shrink-0" />}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="flex items-center justify-between gap-2 p-4 border-t border-gray-200 dark:border-gray-800">
        <ThemeToggleButton />
        <NotificationsDropdown />
      </div>
    </div>
  );
}

function MobileSidebar({
  fullName,
  title,
}: {
  fullName: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const currentPage = navigationItems.find((item) => item.href === pathname);

  return (
    <div className="lg:hidden">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b bg-white dark:bg-gray-950 px-4 py-3">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SidebarContent fullName={fullName} title={title} />
          </SheetContent>
        </Sheet>

        <div className="flex-1 min-w-0">
          <h1 className="text-base font-semibold truncate">
            {currentPage?.label ?? "Faculty Portal"}
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          <NotificationsDropdown />
        </div>
      </header>
    </div>
  );
}

