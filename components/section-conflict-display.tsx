"use client";

import { AlertCircle, AlertTriangle, MapPin, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Conflict {
  conflict_section_id: string;
  conflict_section_no: string;
  conflict_course_code: string;
}

interface ConflictData {
  room_conflicts: Conflict[];
  instructor_conflicts: Conflict[];
  has_conflicts: boolean;
}

interface SectionConflictDisplayProps {
  conflicts: ConflictData | null;
  isLoading?: boolean;
}

export function SectionConflictDisplay({
  conflicts,
  isLoading,
}: SectionConflictDisplayProps) {
  if (isLoading) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Checking for conflicts...</AlertTitle>
        <AlertDescription>Please wait while we validate your schedule.</AlertDescription>
      </Alert>
    );
  }

  if (!conflicts) {
    return null;
  }

  if (!conflicts.has_conflicts) {
    return (
      <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
        <AlertCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-800 dark:text-green-300">
          No Conflicts Detected
        </AlertTitle>
        <AlertDescription className="text-green-700 dark:text-green-400">
          This section can be scheduled without conflicts.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card className="border-orange-500 bg-orange-50 dark:bg-orange-950/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-orange-800 dark:text-orange-300">
          <AlertTriangle className="h-5 w-5" />
          Scheduling Conflicts Detected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {conflicts.room_conflicts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-900 dark:text-orange-200">
              <MapPin className="h-4 w-4" />
              Room Conflicts ({conflicts.room_conflicts.length})
            </div>
            <div className="space-y-1">
              {conflicts.room_conflicts.map((conflict, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-md bg-white dark:bg-gray-900 p-2 text-sm"
                >
                  <Badge variant="destructive" className="text-xs">
                    {conflict.conflict_course_code}
                  </Badge>
                  <span className="text-muted-foreground">
                    Section {conflict.conflict_section_no}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Same room, overlapping time
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {conflicts.instructor_conflicts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-orange-900 dark:text-orange-200">
              <User className="h-4 w-4" />
              Instructor Conflicts ({conflicts.instructor_conflicts.length})
            </div>
            <div className="space-y-1">
              {conflicts.instructor_conflicts.map((conflict, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-md bg-white dark:bg-gray-900 p-2 text-sm"
                >
                  <Badge variant="destructive" className="text-xs">
                    {conflict.conflict_course_code}
                  </Badge>
                  <span className="text-muted-foreground">
                    Section {conflict.conflict_section_no}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    Instructor double-booked
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Action Required</AlertTitle>
          <AlertDescription>
            This section has scheduling conflicts. You can still save it as a draft,
            but it should be resolved before releasing to students.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}

