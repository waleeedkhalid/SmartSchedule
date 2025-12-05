"use client";

/**
 * Registrar Dashboard Client Component
 *
 * Client Component that handles the registrar dashboard UI with interactivity.
 * Receives server-fetched data as props to minimize client bundle size.
 *
 * Following Next.js 15 best practices:
 * - Server Component (page.tsx) fetches data
 * - Client Component (this file) handles interactivity
 * - Data passed as serializable props
 * - Heavy components dynamically imported for code splitting
 */

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { ClientOnly } from "@/components/client-only";

// Lazy load all heavy components to reduce initial bundle size
const UpcomingDeadlinesWidget = dynamic(
  () =>
    import("@/components/upcoming-deadlines-widget").then((mod) => ({
      default: mod.UpcomingDeadlinesWidget,
    })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

const RoleNotificationsWidget = dynamic(
  () =>
    import("@/components/role-notifications-widget").then((mod) => ({
      default: mod.RoleNotificationsWidget,
    })),
  {
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    ),
    ssr: false,
  }
);

// Dynamically import heavy components with loading states
const RegistrarStats = dynamic(
  () =>
    import("@/components/registrar-stats").then((mod) => ({
      default: mod.RegistrarStats,
    })),
  {
    loading: () => (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-32 bg-white dark:bg-gray-900 border rounded-lg flex items-center justify-center"
          >
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ))}
      </div>
    ),
    ssr: false,
  }
);

const StudentLookup = dynamic(
  () =>
    import("@/components/student-lookup").then((mod) => ({
      default: mod.StudentLookup,
    })),
  {
    loading: () => (
      <div className="h-96 bg-white dark:bg-gray-900 border rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
);

const ManualStudentRegistration = dynamic(
  () =>
    import("@/components/manual-student-registration").then((mod) => ({
      default: mod.ManualStudentRegistration,
    })),
  {
    loading: () => (
      <div className="h-64 bg-white dark:bg-gray-900 border rounded-lg flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
    ssr: false,
  }
);

interface UpcomingDeadline {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string;
  days_until_start?: number | null;
  days_until_end?: number | null;
  priority: string;
  status: string;
  requires_action: boolean;
}

interface Notification {
  id: string;
  user_id: string;
  type: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

interface RegistrarDashboardClientProps {
  initialDeadlines?: UpcomingDeadline[];
  initialNotifications?: Notification[];
}

export function RegistrarDashboardClient({
  initialDeadlines,
  initialNotifications,
}: RegistrarDashboardClientProps) {
  return (
    <>
      {/* Statistics Section */}
      <RegistrarStats />

      {/* Timeline and Notifications Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <ClientOnly
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          }
        >
          <UpcomingDeadlinesWidget
            userRole="registrar"
            initialData={initialDeadlines}
          />
        </ClientOnly>
        <ClientOnly
          fallback={
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          }
        >
          <RoleNotificationsWidget
            role="registrar"
            initialData={initialNotifications}
          />
        </ClientOnly>
      </div>

      {/* Student Lookup with Academic Progress */}
      <StudentLookup />

      {/* Manual Student Registration */}
      <ManualStudentRegistration />
    </>
  );
}
