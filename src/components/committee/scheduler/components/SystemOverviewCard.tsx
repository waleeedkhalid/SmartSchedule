/**
 * System Overview Card Component
 * Memoized to prevent unnecessary re-renders
 */

import React, { memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Layers, ClipboardList, CheckCircle2 } from "lucide-react";
import type { DashboardStats } from "../types";

interface SystemOverviewCardProps {
  stats: DashboardStats | null;
}

export const SystemOverviewCard = memo(function SystemOverviewCard({
  stats,
}: SystemOverviewCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          System Overview
        </CardTitle>
        <CardDescription>
          Enrollment and preference statistics
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Enrollments */}
          <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium">Total Enrollments</span>
              </div>
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {stats?.totalEnrollments || 0}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Students enrolled in sections this term
            </p>
          </div>

          {/* Elective Preferences */}
          <div className="p-4 rounded-lg border bg-purple-50 dark:bg-purple-950/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-medium">Elective Preferences</span>
              </div>
              <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {stats?.totalPreferences || 0}
              </span>
            </div>
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Submission Rate</span>
                <span className="font-medium">
                  {stats?.preferenceSubmissionRate || 0}%
                </span>
              </div>
              <Progress
                value={stats?.preferenceSubmissionRate || 0}
                className="h-2"
              />
            </div>
          </div>

          {/* Schedule Status Summary */}
          <div className="p-4 rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">Schedule Status</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge
                  variant={
                    stats?.scheduleStatus === "published"
                      ? "default"
                      : stats?.scheduleStatus === "draft"
                      ? "secondary"
                      : "outline"
                  }
                >
                  {stats?.scheduleStatus === "published" && "Published"}
                  {stats?.scheduleStatus === "draft" && "Draft"}
                  {stats?.scheduleStatus === "not_generated" && "Not Generated"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sections:</span>
                <span className="font-medium">
                  {stats?.totalSections || 0}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Conflicts:</span>
                <span className={`font-medium ${
                  stats && stats.unresolvedConflicts > 0
                    ? "text-red-600 dark:text-red-400"
                    : "text-green-600 dark:text-green-400"
                }`}>
                  {stats?.unresolvedConflicts || 0}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

