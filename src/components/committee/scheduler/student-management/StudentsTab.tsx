/**
 * Students Tab
 * Display SWE students grouped by level
 * 
 * REFACTORED:
 * - Uses custom hook for data fetching
 * - Improved performance with memoization
 * - Better code organization
 * - Removed duplicate logic
 */

"use client";

import { useMemo, memo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Users, GraduationCap } from "lucide-react";
import { useStudentManagement } from "@/hooks/scheduler/useStudentManagement";
import type { Student, StudentsByLevel } from "@/types/scheduler";

interface StudentsTabProps {
  termCode: string;
  termName: string;
}

/**
 * Memoized summary stats component
 */
const StudentSummary = memo(function StudentSummary({
  data,
  totalCount,
}: {
  data: StudentsByLevel[];
  totalCount: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          SWE Student Overview
        </CardTitle>
        <CardDescription>
          Total of {totalCount} Software Engineering students registered for SWE courses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.map((level) => (
            <div
              key={level.level}
              className="flex flex-col items-center p-4 border rounded-lg bg-muted/50"
            >
              <div className="text-3xl font-bold text-primary">{level.count}</div>
              <div className="text-sm text-muted-foreground mt-1">
                Level {level.level}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

/**
 * Memoized student card component
 */
const StudentCard = memo(function StudentCard({ student }: { student: Student }) {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="font-medium">{student.full_name}</div>
        <div className="text-sm text-muted-foreground">{student.email}</div>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <div className="text-muted-foreground">{student.student_number}</div>
        <Badge variant="outline">{student.department}</Badge>
      </div>
    </div>
  );
});

/**
 * Memoized level group component
 */
const LevelGroup = memo(function LevelGroup({ levelData }: { levelData: StudentsByLevel }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Level {levelData.level} Students
          </div>
          <Badge variant="secondary">{levelData.count} students</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {levelData.students.map((student) => (
            <StudentCard key={student.id} student={student} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

export function StudentsTab({ termCode, termName }: StudentsTabProps) {
  // Use custom hook for data management
  const { data, totalCount, loading, error } = useStudentManagement({
    termCode,
    autoLoad: true,
  });

  // Loading state with skeleton
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>SWE Students</CardTitle>
          <CardDescription>
            No SWE students found for {termName}
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Main content with memoized components
  return (
    <div className="space-y-6">
      <StudentSummary data={data} totalCount={totalCount} />
      
      {data.map((levelData) => (
        <LevelGroup key={levelData.level} levelData={levelData} />
      ))}
    </div>
  );
}

