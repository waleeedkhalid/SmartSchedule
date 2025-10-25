/**
 * Important Notices Component
 * Memoized to prevent unnecessary re-renders
 */

import React, { memo } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle } from "lucide-react";
import type { DashboardStats } from "../types";

interface ImportantNoticesProps {
  stats: DashboardStats | null;
}

export const ImportantNotices = memo(function ImportantNotices({
  stats,
}: ImportantNoticesProps) {
  const scheduleNotGenerated = stats?.scheduleStatus === "not_generated";
  const hasConflicts = stats && stats.unresolvedConflicts > 0;

  if (!scheduleNotGenerated && !hasConflicts) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Schedule Not Generated Notice */}
      {scheduleNotGenerated && (
        <Card className="border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Schedule Generation Required
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  No schedule has been generated yet. Use the schedule
                  generation tools to create an optimal schedule based on
                  current course offerings and student preferences.
                </p>
                <Button asChild className="mt-3" size="sm">
                  <Link href="/committee/scheduler/generate">
                    Generate Schedule Now
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unresolved Conflicts Notice */}
      {hasConflicts && (
        <Card className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Scheduling Conflicts Detected
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200">
                  There {stats.unresolvedConflicts === 1 ? 'is' : 'are'}{' '}
                  {stats.unresolvedConflicts} unresolved{' '}
                  {stats.unresolvedConflicts === 1 ? 'conflict' : 'conflicts'}{' '}
                  in the current schedule. Please review and resolve them before publishing.
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <Button asChild size="sm">
                    <Link href="/committee/scheduler/generate">
                      View Conflicts
                    </Link>
                  </Button>
                  {stats.conflictsBySeverity.critical > 0 && (
                    <Badge variant="destructive">
                      {stats.conflictsBySeverity.critical} Critical
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
});

