"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle2, AlertCircle } from "lucide-react";

export function ScheduleTestCard() {
  const handleGenerateSchedule = () => {
    console.log("🚀 Generating schedule...");
    console.log("This will trigger the Schedule Generation workflow");
    // TODO: Navigate to schedule generation or trigger API
    window.location.href = "/demo/committee/scheduler";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle>Schedule Generation</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Test automated course scheduling for SWE Department
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Smart Scheduling</p>
              <p className="text-xs text-muted-foreground">
                Automatically generates schedules for all SWE levels with
                conflict detection
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Faculty Load Balance</p>
              <p className="text-xs text-muted-foreground">
                Distributes teaching hours fairly across 15 SWE faculty members
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Student Preferences</p>
              <p className="text-xs text-muted-foreground">
                Considers elective preferences and irregular student needs
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium">Phase 5 Complete</p>
              <p className="text-xs text-muted-foreground">
                Full schedule generation system with UI and API integration
              </p>
            </div>
          </div>
        </div>

        <Button onClick={handleGenerateSchedule} className="w-full" size="lg">
          Try Schedule Generation
        </Button>
      </CardContent>
    </Card>
  );
}
