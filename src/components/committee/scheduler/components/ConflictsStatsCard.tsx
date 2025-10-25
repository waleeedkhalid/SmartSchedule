/**
 * Conflicts Stats Card Component
 * Memoized to prevent unnecessary re-renders
 */

import React, { memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import type { DashboardStats } from "../types";

interface ConflictsStatsCardProps {
  stats: DashboardStats | null;
}

export const ConflictsStatsCard = memo(function ConflictsStatsCard({
  stats,
}: ConflictsStatsCardProps) {
  const hasConflicts = useMemo(
    () => stats && stats.unresolvedConflicts > 0,
    [stats]
  );

  const iconBgColor = useMemo(
    () => hasConflicts ? "bg-red-500/10" : "bg-green-500/10",
    [hasConflicts]
  );

  const iconColor = useMemo(
    () => hasConflicts ? "text-red-500" : "text-green-500",
    [hasConflicts]
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Active Conflicts
            </p>
            <p className="text-2xl font-bold flex items-center gap-2">
              {stats?.unresolvedConflicts || 0}
              {hasConflicts && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              {!hasConflicts && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
            </p>
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${iconBgColor}`}>
            <AlertTriangle className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
        {hasConflicts && stats && (
          <div className="mt-3 flex gap-1 flex-wrap">
            {stats.conflictsBySeverity.critical > 0 && (
              <Badge variant="destructive" className="text-xs">
                {stats.conflictsBySeverity.critical} Critical
              </Badge>
            )}
            {stats.conflictsBySeverity.error > 0 && (
              <Badge variant="destructive" className="text-xs bg-orange-500">
                {stats.conflictsBySeverity.error} Error
              </Badge>
            )}
            {stats.conflictsBySeverity.warning > 0 && (
              <Badge variant="secondary" className="text-xs">
                {stats.conflictsBySeverity.warning} Warning
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
});

