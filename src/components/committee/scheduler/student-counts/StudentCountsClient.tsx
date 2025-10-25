/**
 * Student Counts Client Component
 * Main client component for managing student enrollment data
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Loader2 } from "lucide-react";
import { StudentCountsTable } from "./StudentCountsTable";
import { LevelSummaryView } from "./LevelSummaryView";
import { CourseTypeSummaryView } from "./CourseTypeSummaryView";
import { ElectivePreferencesSummaryView } from "./ElectivePreferencesSummaryView";
import type { StudentEnrollmentData, LevelEnrollmentSummary, CourseTypeEnrollmentSummary } from "@/types/scheduler";

interface StudentCountsClientProps {
  termCode: string;
  termName: string;
}

export function StudentCountsClient({ termCode, termName }: StudentCountsClientProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"course" | "level" | "type" | "electives">("course");
  
  // Data state
  const [courseData, setCourseData] = useState<StudentEnrollmentData[]>([]);
  const [levelData, setLevelData] = useState<LevelEnrollmentSummary[]>([]);
  const [typeData, setTypeData] = useState<CourseTypeEnrollmentSummary[]>([]);

  useEffect(() => {
    if (termCode) {
      loadData();
    }
  }, [termCode]);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load course-level data (default view)
      const courseResponse = await fetch(
        `/api/committee/scheduler/student-counts?term_code=${termCode}&group_by=course`
      );
      if (!courseResponse.ok) {
        throw new Error("Failed to fetch course enrollment data");
      }
      const courseResult = await courseResponse.json();
      setCourseData(courseResult.data?.courses || []);

      // Load level summary
      const levelResponse = await fetch(
        `/api/committee/scheduler/student-counts?term_code=${termCode}&group_by=level`
      );
      if (levelResponse.ok) {
        const levelResult = await levelResponse.json();
        setLevelData(levelResult.data?.by_level || []);
      }

      // Load type summary
      const typeResponse = await fetch(
        `/api/committee/scheduler/student-counts?term_code=${termCode}&group_by=course_type`
      );
      if (typeResponse.ok) {
        const typeResult = await typeResponse.json();
        setTypeData(typeResult.data?.by_course_type || []);
      }
    } catch (err) {
      console.error("Error loading student counts:", err);
      setError(err instanceof Error ? err.message : "Failed to load enrollment data");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading enrollment data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!termCode) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No active term found. Please set an active term to view enrollment data.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList className="grid w-full max-w-3xl grid-cols-4">
          <TabsTrigger value="course">By Course</TabsTrigger>
          <TabsTrigger value="level">By Level</TabsTrigger>
          <TabsTrigger value="type">By Type</TabsTrigger>
          <TabsTrigger value="electives">Elective Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="course" className="mt-6">
          <StudentCountsTable 
            data={courseData} 
            termCode={termCode}
            termName={termName}
            onDataUpdated={loadData}
          />
        </TabsContent>

        <TabsContent value="level" className="mt-6">
          <LevelSummaryView 
            data={levelData} 
            termCode={termCode}
            termName={termName}
          />
        </TabsContent>

        <TabsContent value="type" className="mt-6">
          <CourseTypeSummaryView 
            data={typeData} 
            termCode={termCode}
            termName={termName}
          />
        </TabsContent>

        <TabsContent value="electives" className="mt-6">
          <ElectivePreferencesSummaryView 
            data={courseData} 
            termCode={termCode}
            termName={termName}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

