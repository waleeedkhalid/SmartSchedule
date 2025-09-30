"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export interface Conflict {
  id: string;
  type: "OVERLOAD" | "TIME_OVERLAP" | "ROOM_CONFLICT";
  instructorId?: string;
  instructorName?: string;
  message: string;
  severity: "HIGH" | "MEDIUM" | "LOW";
  affectedSections?: string[];
}

interface ConflictListProps {
  conflicts: Conflict[];
}

export const ConflictList: React.FC<ConflictListProps> = ({ conflicts }) => {
  const severityColors = {
    HIGH: "border-red-500 bg-red-50",
    MEDIUM: "border-yellow-500 bg-yellow-50",
    LOW: "border-blue-500 bg-blue-50",
  };

  const typeLabels = {
    OVERLOAD: "Overload",
    TIME_OVERLAP: "Time Conflict",
    ROOM_CONFLICT: "Room Conflict",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Teaching Load Conflicts</span>
          {conflicts.length > 0 && (
            <Badge variant="outline" className="text-xs">
              {conflicts.length} issues
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {conflicts.map((conflict) => (
          <Alert
            key={conflict.id}
            className={severityColors[conflict.severity]}
          >
            <AlertDescription>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px]">
                      {typeLabels[conflict.type]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        conflict.severity === "HIGH"
                          ? "border-red-500"
                          : conflict.severity === "MEDIUM"
                          ? "border-yellow-500"
                          : "border-blue-500"
                      }`}
                    >
                      {conflict.severity}
                    </Badge>
                    {conflict.instructorName && (
                      <span className="text-xs font-medium">
                        {conflict.instructorName}
                      </span>
                    )}
                  </div>
                  <div className="text-sm">{conflict.message}</div>
                  {conflict.affectedSections && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {conflict.affectedSections.map((section) => (
                        <Badge
                          key={section}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {section}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </AlertDescription>
          </Alert>
        ))}
        {conflicts.length === 0 && (
          <div className="text-center text-sm text-muted-foreground py-4">
            No conflicts detected.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConflictList;
