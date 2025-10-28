"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertCircle, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SchedulingStats {
  total_sections: number;
  assigned: number;
  unassigned: number;
  conflicts_resolved: number;
}

interface UnassignedSection {
  section_id: string;
  course_code: string;
  section_no: string;
  reason: string;
}

interface GenerationResult {
  success: boolean;
  stats: SchedulingStats;
  unassigned: UnassignedSection[];
  message: string;
}

interface ScheduleStatus {
  draft: {
    total: number;
    assigned: number;
    unassigned: number;
  };
  released: {
    total: number;
  };
}

interface ScheduleGeneratorProps {
  initialStatus: ScheduleStatus;
}

export function ScheduleGenerator({ initialStatus }: ScheduleGeneratorProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [status, setStatus] = useState<ScheduleStatus>(initialStatus);

  async function handleGenerate() {
    setIsGenerating(true);
    setGenerationResult(null);

    try {
      const response = await fetch("/api/scheduling/generate", {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate schedule");
      }

      const result: GenerationResult = await response.json();
      setGenerationResult(result);

      if (result.success) {
        toast.success("Schedule generated successfully!");
      } else {
        toast.warning("Partial schedule generated. Some sections could not be assigned.");
      }

      // Refresh status
      await refreshStatus();
      router.refresh();
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate schedule");
    } finally {
      setIsGenerating(false);
    }
  }

  async function refreshStatus() {
    try {
      const response = await fetch("/api/scheduling/generate");
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error("Error refreshing status:", error);
    }
  }

  const assignmentProgress =
    status.draft.total > 0 ? (status.draft.assigned / status.draft.total) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Status</CardTitle>
          <CardDescription>Current state of section assignments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Draft Sections</p>
              <p className="text-2xl font-bold">{status.draft.total}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Assigned</p>
              <p className="text-2xl font-bold text-green-600">{status.draft.assigned}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Unassigned</p>
              <p className="text-2xl font-bold text-orange-600">{status.draft.unassigned}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Released Sections</p>
              <p className="text-2xl font-bold text-blue-600">{status.released.total}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Assignment Progress</span>
              <span>{Math.round(assignmentProgress)}%</span>
            </div>
            <Progress value={assignmentProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Generation Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Intelligent Schedule Generation
          </CardTitle>
          <CardDescription>
            Generate conflict-free schedule assignments for all draft sections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>How it works</AlertTitle>
            <AlertDescription>
              The algorithm will automatically assign rooms and time slots to all draft sections while
              avoiding conflicts. Sections are prioritized by level, with lectures assigned before labs.
              The system checks for room, instructor, and student-level conflicts.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || status.draft.total === 0}
              size="lg"
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Schedule...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Schedule
                </>
              )}
            </Button>
            <Button
              onClick={refreshStatus}
              variant="outline"
              size="lg"
              disabled={isGenerating}
            >
              Refresh Status
            </Button>
          </div>

          {status.draft.total === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No draft sections</AlertTitle>
              <AlertDescription>
                There are no draft sections to schedule. Create sections first or change existing
                sections to draft state.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generation Results */}
      {generationResult && (
        <Card className={generationResult.success ? "border-green-500" : "border-orange-500"}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {generationResult.success ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Generation Complete
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-600" />
                  Partial Generation
                </>
              )}
            </CardTitle>
            <CardDescription>{generationResult.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Total Sections</p>
                <p className="text-2xl font-bold">{generationResult.stats.total_sections}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Assigned</p>
                <p className="text-2xl font-bold text-green-600">
                  {generationResult.stats.assigned}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Unassigned</p>
                <p className="text-2xl font-bold text-orange-600">
                  {generationResult.stats.unassigned}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Conflicts Resolved</p>
                <p className="text-2xl font-bold text-blue-600">
                  {generationResult.stats.conflicts_resolved}
                </p>
              </div>
            </div>

            {generationResult.unassigned.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-orange-600" />
                  Unassigned Sections ({generationResult.unassigned.length})
                </h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {generationResult.unassigned.map((section, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-md bg-orange-50 dark:bg-orange-950/20 p-2 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {section.course_code} - Section {section.section_no}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{section.reason}</span>
                    </div>
                  ))}
                </div>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Manual Assignment Required</AlertTitle>
                  <AlertDescription>
                    These sections could not be automatically assigned. Please manually assign rooms
                    and times in the Sections page, or adjust existing assignments to free up slots.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

