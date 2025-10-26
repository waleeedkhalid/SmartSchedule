/**
 * Student Management Client Component
 * Tab-based interface for managing student enrollments
 */

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { StatisticsOverview } from "./StatisticsOverview";
import { StudentListView } from "./StudentListView";
import { IrregularStudentsView } from "./IrregularStudentsView";
import { CapacityThresholdsView } from "./CapacityThresholdsView";

interface StudentManagementClientProps {
  termCode: string;
  termName: string;
}

export function StudentManagementClient({
  termCode,
  termName,
}: StudentManagementClientProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "students" | "irregular" | "capacity"
  >("overview");

  if (!termCode) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No active term found. Please set an active term to manage student
          enrollments.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={(value) =>
          setActiveTab(
            value as "overview" | "students" | "irregular" | "capacity"
          )
        }
      >
        <TabsList className="grid w-full max-w-4xl grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="irregular">Irregular Students</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <StatisticsOverview termCode={termCode} termName={termName} />
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <StudentListView termCode={termCode} termName={termName} />
        </TabsContent>

        <TabsContent value="irregular" className="mt-6">
          <IrregularStudentsView termCode={termCode} termName={termName} />
        </TabsContent>

        <TabsContent value="capacity" className="mt-6">
          <CapacityThresholdsView termCode={termCode} termName={termName} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
