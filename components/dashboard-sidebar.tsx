"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types/database";
import { useEffect, useState } from "react";
import {
  Calendar,
  Settings,
  Users,
  BookOpen,
  DoorOpen,
  GraduationCap,
  ClipboardList,
  BarChart3,
  FileText,
  Bell,
  Download,
  Wrench,
  Heart,
  CheckSquare,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[]; // Which roles can see this item
}

const navigation: NavigationItem[] = [
  { 
    name: "Dashboard", 
    href: "/dashboard", 
    icon: BarChart3, 
    roles: ['scheduling', 'teaching_load', 'faculty', 'student', 'registrar'] 
  },
  { 
    name: "Setup Check", 
    href: "/dashboard/setup-check", 
    icon: Wrench, 
    roles: ['scheduling', 'teaching_load'] 
  },
  { 
    name: "Courses", 
    href: "/dashboard/courses", 
    icon: BookOpen, 
    roles: ['scheduling', 'teaching_load'] 
  },
  { 
    name: "Sections", 
    href: "/dashboard/sections", 
    icon: Calendar, 
    roles: ['scheduling', 'teaching_load'] 
  },
  { 
    name: "Rooms", 
    href: "/dashboard/rooms", 
    icon: DoorOpen, 
    roles: ['scheduling'] 
  },
  { 
    name: "Instructors", 
    href: "/dashboard/instructors", 
    icon: Users, 
    roles: ['scheduling', 'teaching_load'] 
  },
  { 
    name: "Exams", 
    href: "/dashboard/exams", 
    icon: CalendarCheck, 
    roles: ['scheduling'] 
  },
  { 
    name: "Elective Stats", 
    href: "/dashboard/elective-stats", 
    icon: BarChart3, 
    roles: ['scheduling'] 
  },
  { 
    name: "Level Overview", 
    href: "/dashboard/level-overview", 
    icon: TrendingUp, 
    roles: ['scheduling', 'teaching_load'] 
  },
  { 
    name: "Course Overview", 
    href: "/dashboard/course-overview", 
    icon: BookOpen, 
    roles: ['scheduling', 'teaching_load'] 
  },
  { 
    name: "My Schedule", 
    href: "/dashboard/faculty", 
    icon: Calendar, 
    roles: ['faculty'] 
  },
  { 
    name: "My Preferences", 
    href: "/dashboard/preferences", 
    icon: Heart, 
    roles: ['student'] 
  },
  { 
    name: "Import/Export", 
    href: "/dashboard/import-export", 
    icon: Download, 
    roles: ['scheduling'] 
  },
  { 
    name: "Settings", 
    href: "/dashboard/settings", 
    icon: Settings, 
    roles: ['scheduling'] 
  },
];

const roleLabels: Record<UserRole, string> = {
  scheduling: "Scheduling Committee",
  teaching_load: "Teaching Load",
  faculty: "Faculty",
  student: "Student",
  registrar: "Registrar",
};

const roleBadgeColors: Record<UserRole, string> = {
  scheduling: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  teaching_load: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  faculty: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  student: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  registrar: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function DashboardSidebar() {
  const pathname = usePathname();
  const { userRole, loading, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(item => {
    if (!userRole) return false;
    return item.roles.includes(userRole.role);
  });

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return;

    async function fetchUnreadCount() {
      try {
        const res = await fetch('/api/notifications?count=true');
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count || 0);
        }
      } catch (error) {
        console.error('Failed to fetch notification count:', error);
      }
    }

    fetchUnreadCount();
    
    // Poll for updates every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          SmartSchedule
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          V1 SWE Department
        </p>
        {userRole && (
          <Badge className={cn("mt-3", roleBadgeColors[userRole.role])}>
            {roleLabels[userRole.role]}
          </Badge>
        )}
      </div>
      <nav className="px-3 space-y-1">
        {loading ? (
          <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
        ) : filteredNavigation.length > 0 ? (
          filteredNavigation.map((item) => {
            const isActive = pathname === item.href;
            const isNotifications = item.name === "Notifications";
            const showBadge = isNotifications && unreadCount > 0;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
                  isActive
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
                {showBadge && (
                  <Badge 
                    variant="destructive" 
                    className="ml-auto h-5 min-w-5 px-1 text-xs"
                  >
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </Link>
            );
          })
        ) : (
          <div className="px-3 py-2 text-sm text-gray-500">
            No navigation items available
          </div>
        )}
      </nav>
    </aside>
  );
}

