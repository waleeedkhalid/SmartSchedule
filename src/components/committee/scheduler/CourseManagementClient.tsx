/**
 * CourseManagementClient
 * Client component for managing courses and sections
 */

"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BookOpen, List, FileJson } from "lucide-react";
import { CourseList } from "./CourseList";
import { ExternalCourseViewer } from "./ExternalCourseViewer";
import type { CourseWithSections } from "@/types/scheduler";

interface CourseManagementClientProps {
  termCode: string;
  termName: string;
}

export function CourseManagementClient({
  termCode,
  termName,
}: CourseManagementClientProps): React.ReactElement {
  const [courses, setCourses] = useState<CourseWithSections[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("swe-courses");

  // Fetch courses
  useEffect(() => {
    if (!termCode) {
      setError("No active term found");
      setLoading(false);
      return;
    }

    fetchCourses();
  }, [termCode]);

  const fetchCourses = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/committee/scheduler/courses?term_code=${termCode}&include_sections=true`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch courses");
      }

      const data = await response.json();
      setCourses(data.data || []);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
    } finally {
      setLoading(false);
    }
  };

  const handleCourseUpdated = (): void => {
    fetchCourses();
  };

  if (!termCode) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No active term found. Please contact an administrator to set up an
          active academic term.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
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

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="swe-courses" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            SWE Courses
          </TabsTrigger>
          <TabsTrigger
            value="external-courses"
            className="flex items-center gap-2"
          >
            <FileJson className="h-4 w-4" />
            External Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="swe-courses" className="mt-6">
          <CourseList
            courses={courses}
            termCode={termCode}
            termName={termName}
            onCourseUpdated={handleCourseUpdated}
          />
        </TabsContent>

        <TabsContent value="external-courses" className="mt-6">
          <ExternalCourseViewer termCode={termCode} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

