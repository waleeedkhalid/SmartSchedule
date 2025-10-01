"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GenerateScheduleDialog } from "@/components/committee/scheduler/GenerateScheduleDialog";
import { GeneratedScheduleResults } from "@/components/committee/scheduler/GeneratedScheduleResults";
import { GeneratedSchedule } from "@/lib/types";

export default function Phase5DemoPage() {
  const [generatedSchedule, setGeneratedSchedule] =
    useState<GeneratedSchedule | null>(null);

  const handleScheduleGenerated = (schedule: GeneratedSchedule) => {
    console.log("Schedule generated:", schedule);
    setGeneratedSchedule(schedule);
  };

  const handleExport = () => {
    if (!generatedSchedule) return;
    const dataStr = JSON.stringify(generatedSchedule, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(
      dataStr
    )}`;
    const exportFileDefaultName = `schedule-${generatedSchedule.semester.replace(
      /\s/g,
      "-"
    )}-${generatedSchedule.id}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  const handlePublish = () => {
    if (!generatedSchedule) return;
    alert(
      "Publishing functionality will be implemented in final integration. Schedule would be saved to database and made available to students."
    );
    console.log("Would publish schedule:", generatedSchedule.id);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Phase 5: API & UI Integration</h1>
          <p className="text-muted-foreground mt-2">
            Complete schedule generation workflow with API endpoints and UI
            components
          </p>
        </div>

        {!generatedSchedule ? (
          <Card>
            <CardHeader>
              <CardTitle>Schedule Generation</CardTitle>
              <p className="text-sm text-muted-foreground">
                Generate a new course schedule using automated algorithm
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-medium">Phase 5 Components:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    ✅ POST /api/schedule/generate - Generate new schedule
                  </li>
                  <li>
                    ✅ POST /api/schedule/validate - Validate schedule conflicts
                  </li>
                  <li>
                    ✅ GenerateScheduleDialog - UI for triggering generation
                  </li>
                  <li>
                    ✅ GeneratedScheduleResults - Display results with conflicts
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">How it Works:</h3>
                <ol className="list-decimal list-inside text-sm text-muted-foreground space-y-1">
                  <li>
                    Click &ldquo;Generate Schedule&rdquo; to open configuration
                    dialog
                  </li>
                  <li>Select levels to generate (4-8)</li>
                  <li>Choose optimization goals</li>
                  <li>Toggle irregular students consideration</li>
                  <li>Click &ldquo;Generate Schedule&rdquo; in dialog</li>
                  <li>API endpoint calls ScheduleGenerator</li>
                  <li>Results displayed with metadata and conflicts</li>
                  <li>Export to JSON or publish to database</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Expected Outcome:</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Complete schedule for selected levels</li>
                  <li>~30-35 sections total (all 5 levels)</li>
                  <li>Faculty assigned based on preferences</li>
                  <li>Rooms allocated from pool of 16</li>
                  <li>Exams scheduled automatically</li>
                  <li>Top 5 electives per level offered</li>
                  <li>All conflicts detected and reported</li>
                  <li>Resource utilization statistics calculated</li>
                </ul>
              </div>

              <div className="pt-4">
                <GenerateScheduleDialog
                  semester="Fall 2025"
                  onScheduleGenerated={handleScheduleGenerated}
                />
              </div>

              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm">
                  <strong>Note:</strong> Check the browser console for detailed
                  generation logs and API request/response information.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">
                Generated Schedule Results
              </h2>
              <GenerateScheduleDialog
                semester="Fall 2025"
                onScheduleGenerated={handleScheduleGenerated}
                triggerButton={
                  <button className="text-sm text-primary hover:underline">
                    Generate New Schedule
                  </button>
                }
              />
            </div>

            <GeneratedScheduleResults
              schedule={generatedSchedule}
              onExport={handleExport}
              onPublish={handlePublish}
            />
          </div>
        )}
      </div>
    </div>
  );
}
