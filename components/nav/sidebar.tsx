"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Heart,
  Bell,
  BookOpen,
  Calendar,
  Settings,
  LogOut,
  GraduationCap,
  BarChart3,
  Users,
  MapPin,
  Clock,
  FileText,
  Upload,
  CheckSquare,
  MessageSquare,
} from "lucide-react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description?: string;
}

interface SidebarProps {
  userRole: string;
  userName: string;
  userEmail: string;
}

const roleNavItems: Record<string, NavItem[]> = {
  student: [
    {
      title: "Dashboard",
      href: "/dashboard/student",
      icon: LayoutDashboard,
      description: "Overview",
    },
    {
      title: "My Preferences",
      href: "/dashboard/preferences",
      icon: Heart,
      description: "Elective choices",
    },
    {
      title: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
      description: "Updates",
    },
  ],
  scheduling: [
    {
      title: "Dashboard",
      href: "/dashboard/scheduling",
      icon: LayoutDashboard,
    },
    {
      title: "Courses",
      href: "/dashboard/courses",
      icon: BookOpen,
    },
    {
      title: "Sections",
      href: "/dashboard/sections",
      icon: FileText,
    },
    {
      title: "Instructors",
      href: "/dashboard/instructors",
      icon: Users,
    },
    {
      title: "Rooms",
      href: "/dashboard/rooms",
      icon: MapPin,
    },
    {
      title: "Exams",
      href: "/dashboard/exams",
      icon: Calendar,
    },
    {
      title: "Student Groups",
      href: "/dashboard/student-groups",
      icon: GraduationCap,
    },
    {
      title: "Elective Stats",
      href: "/dashboard/elective-stats",
      icon: BarChart3,
    },
    {
      title: "Import/Export",
      href: "/dashboard/import-export",
      icon: Upload,
    },
    {
      title: "Setup Check",
      href: "/dashboard/setup-check",
      icon: CheckSquare,
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ],
  teaching_load: [
    {
      title: "Dashboard",
      href: "/dashboard/teaching-load",
      icon: LayoutDashboard,
    },
    {
      title: "Teaching Load",
      href: "/dashboard/teaching-load",
      icon: Clock,
    },
    {
      title: "Instructors",
      href: "/dashboard/instructors",
      icon: Users,
    },
  ],
  faculty: [
    {
      title: "Dashboard",
      href: "/dashboard/faculty",
      icon: LayoutDashboard,
    },
    {
      title: "Availability",
      href: "/dashboard/faculty/availability",
      icon: Clock,
    },
    {
      title: "Feedback",
      href: "/dashboard/faculty/feedback",
      icon: MessageSquare,
    },
    {
      title: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
    },
  ],
  registrar: [
    {
      title: "Dashboard",
      href: "/dashboard/registrar",
      icon: LayoutDashboard,
    },
    {
      title: "Sections",
      href: "/dashboard/sections",
      icon: FileText,
    },
    {
      title: "Import/Export",
      href: "/dashboard/import-export",
      icon: Upload,
    },
  ],
};

export function Sidebar({ userRole, userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const navItems = roleNavItems[userRole] || [];

  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center group">
          <Logo size="md" />
        </Link>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">V1 SWE Department</p>
      </div>

      <Separator className="bg-slate-200 dark:bg-slate-800" />

      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-brand-blue-50 dark:bg-brand-blue-950/20 border border-brand-blue-100 dark:border-brand-blue-900">
          <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-800">
            <AvatarFallback className="gradient-blue text-white font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">{userName}</p>
            <div className="flex items-center gap-1">
              <Badge variant="secondary" className="text-xs capitalize bg-brand-blue-100 dark:bg-brand-blue-900 text-brand-blue-700 dark:text-brand-blue-300">
                {userRole.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-slate-100 dark:hover:bg-slate-800",
                  isActive
                    ? "bg-brand-blue-50 dark:bg-brand-blue-950/30 text-brand-blue-700 dark:text-brand-blue-400 shadow-sm"
                    : "text-slate-700 dark:text-slate-300"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0",
                    isActive ? "text-brand-blue-600 dark:text-brand-blue-500" : ""
                  )}
                />
                <span className="flex-1">{item.title}</span>
                {item.badge && (
                  <Badge variant="destructive" className="text-xs">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <Separator className="bg-slate-200 dark:bg-slate-800" />

      {/* Footer Actions */}
      <div className="p-3 space-y-1">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
        >
          <Settings className="h-5 w-5" />
          <span>Settings</span>
        </Link>
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-error dark:text-error hover:bg-error-light dark:hover:bg-error/10 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </form>
      </div>
    </div>
  );
}

