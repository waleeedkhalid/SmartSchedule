/**
 * Quick Stats Card Component
 * Memoized to prevent unnecessary re-renders
 */

import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDistanceToNow } from "date-fns";
import { LucideIcon } from "lucide-react";

interface QuickStatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  progress?: {
    current: number;
    total: number;
  };
  lastGeneratedAt?: string | null;
}

export const QuickStatsCard = memo(function QuickStatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor,
  iconBgColor,
  progress,
  lastGeneratedAt,
}: QuickStatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-2xl font-bold">{value}</p>
            {lastGeneratedAt && (
              <p className="text-xs text-muted-foreground mt-1">
                Last: {formatDistanceToNow(new Date(lastGeneratedAt), { addSuffix: true })}
              </p>
            )}
            {!lastGeneratedAt && subtitle && (
              <p className="text-xs text-muted-foreground mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${iconBgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
        {progress && progress.total > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Published</span>
              <span className="font-medium">
                {progress.current} / {progress.total}
              </span>
            </div>
            <Progress
              value={(progress.current / progress.total) * 100}
              className="h-2"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
});

