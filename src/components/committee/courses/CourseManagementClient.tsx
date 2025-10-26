/**
 * CourseManagementClient
 * Client component for interactivity only
 * Receives initial data from Server Component for optimal performance
 * Follows patterns from data-fetching.mdc and caching-performance.mdc
 * 
 * ✅ EXTRACTED from scheduler - Now in courses feature
 */

"use client";

import React, { useState, useCallback, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, BookOpen, FileJson } from "lucide-react";
import { CourseList } from "./CourseList";
import type { CourseWithSections } from "@/types/scheduler";

interface CourseManagementClientProps {
  termCode: string;
  termName: string;
  initialSweCourses: CourseWithSections[];
  initialExternalCourses: CourseWithSections[];
}

export function CourseManagementClient({
  termCode,
  termName,
  initialSweCourses,
  initialExternalCourses,
}: CourseManagementClientProps): React.ReactElement {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("swe-courses");

  // ✅ OPTIMIZED: Use initial server data, no client-side fetching on mount
  const [sweCourses] = useState<CourseWithSections[]>(initialSweCourses);
  const [externalCourses] = useState<CourseWithSections[]>(initialExternalCourses);

  // ✅ OPTIMIZED: Memoize current courses based on tab
  const currentCourses = useMemo(() => {
    return activeTab === "swe-courses" ? sweCourses : externalCourses;
  }, [activeTab, sweCourses, externalCourses]);

  // ✅ OPTIMIZED: Use router.refresh() instead of fetching
  // This re-runs Server Component and gets fresh data via React Server Components
  const handleCourseUpdated = useCallback((): void => {
    startTransition(() => {
      router.refresh();
    });
  }, [router]);

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
            courses={currentCourses}
            termCode={termCode}
            termName={termName}
            onCourseUpdated={handleCourseUpdated}
            isPending={isPending}
          />
        </TabsContent>

        <TabsContent value="external-courses" className="mt-6">
          <div className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                These courses are managed by other departments (CSC, CEN, IS, MATH, IC, etc.).
                You can view and create sections for these courses.
              </AlertDescription>
            </Alert>
            <CourseList
              courses={currentCourses}
              termCode={termCode}
              termName={termName}
              onCourseUpdated={handleCourseUpdated}
              isPending={isPending}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

