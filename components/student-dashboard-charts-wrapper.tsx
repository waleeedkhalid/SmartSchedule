"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dynamically import heavy chart component to reduce initial bundle size
// This wrapper is a client component, so ssr: false is allowed
const StudentDashboardCharts = dynamic(
  () => import("@/components/student-dashboard-charts").then(mod => ({ default: mod.StudentDashboardCharts })),
  { 
    ssr: false, // Charts don't need SSR
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Dashboard Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Loading charts...</p>
          </div>
        </CardContent>
      </Card>
    )
  }
);

export function StudentDashboardChartsWrapper() {
  return <StudentDashboardCharts />;
}

