"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Dynamically import heavy chart component to reduce initial bundle size
// This wrapper is a client component, so ssr: false is allowed
const FacultyDashboardCharts = dynamic(
  () => import("@/components/faculty-dashboard-charts").then(mod => ({ default: mod.FacultyDashboardCharts })),
  { 
    ssr: false, // Charts don't need SSR
    loading: () => (
      <Card>
        <CardHeader>
          <CardTitle>Faculty Analytics</CardTitle>
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

export function FacultyDashboardChartsWrapper() {
  return <FacultyDashboardCharts />;
}

