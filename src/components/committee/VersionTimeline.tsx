/**
 * Version Timeline Component
 * Displays schedule version history
 */

"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, FileEdit, Plus, Trash2 } from "lucide-react";

interface VersionRecord {
  id: string;
  user_email: string | null;
  user_role: string | null;
  table_name: string;
  operation: "INSERT" | "UPDATE" | "DELETE";
  changed_fields: string[] | null;
  description: string | null;
  created_at: string;
}

interface VersionTimelineProps {
  versions: VersionRecord[];
}

export function VersionTimeline({ versions }: VersionTimelineProps) {
  const getOperationIcon = (operation: string) => {
    switch (operation) {
      case "INSERT":
        return <Plus className="h-4 w-4" />;
      case "UPDATE":
        return <FileEdit className="h-4 w-4" />;
      case "DELETE":
        return <Trash2 className="h-4 w-4" />;
      default:
        return <FileEdit className="h-4 w-4" />;
    }
  };

  const getOperationColor = (operation: string) => {
    switch (operation) {
      case "INSERT":
        return "default";
      case "UPDATE":
        return "secondary";
      case "DELETE":
        return "destructive";
      default:
        return "default";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (versions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No version history available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Version History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {versions.map((version, index) => (
            <div
              key={version.id}
              className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0"
            >
              {/* Timeline Line */}
              <div className="relative flex flex-col items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
                  {getOperationIcon(version.operation)}
                </div>
                {index < versions.length - 1 && (
                  <div className="w-px h-full bg-border mt-2" />
                )}
              </div>

              {/* Version Details */}
              <div className="flex-1 pt-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={getOperationColor(version.operation) as any}>
                      {version.operation}
                    </Badge>
                    <span className="text-sm font-medium">
                      {version.table_name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(version.created_at)}</span>
                  </div>
                </div>

                {/* User Info */}
                {version.user_email && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <User className="h-3 w-3" />
                    <span>
                      {version.user_email}
                      {version.user_role && ` (${version.user_role})`}
                    </span>
                  </div>
                )}

                {/* Description */}
                {version.description && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {version.description}
                  </p>
                )}

                {/* Changed Fields */}
                {version.changed_fields && version.changed_fields.length > 0 && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      Changed:
                    </span>
                    {version.changed_fields.map((field) => (
                      <Badge key={field} variant="outline" className="text-xs">
                        {field}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

