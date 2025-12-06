"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  Users,
  Calendar,
  Home,
  BookOpen,
  GraduationCap,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/lib/utils/client-auth";

interface AutoGenerationStats {
  students_by_level: { level: number; count: number }[];
  sections_created: { course_code: string; section_count: number }[];
  total_sections: number;
  rooms_assigned: number;
  time_slots_assigned: number;
  exams_scheduled: {
    mid1: number;
    mid2: number;
    final: number;
  };
  conflicts_avoided: number;
}

interface AutoGenerationResult {
  success: boolean;
  message: string;
  stats: AutoGenerationStats;
  warnings: string[];
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
  const [generationResult, setGenerationResult] =
    useState<AutoGenerationResult | null>(null);
  const [status, setStatus] = useState<ScheduleStatus>(initialStatus);
  const [generationStep, setGenerationStep] = useState<string>("");

  async function handleAutoGenerate() {
    setIsGenerating(true);
    setGenerationResult(null);
    setGenerationStep("Initializing...");

    try {
      // Add small delay to ensure Supabase client is fully initialized
      // This fixes timing issues where auth token may not be ready immediately
      await new Promise((resolve) => setTimeout(resolve, 500));

      const authHeader = await getAuthHeader();

      if (!authHeader || authHeader.trim() === "" || authHeader === "Bearer ") {
        console.error("[ScheduleGenerator] Authentication failed:", {
          authHeader,
          authHeaderType: typeof authHeader,
          authHeaderTrimmed: authHeader?.trim(),
        });
        toast.error(
          "Authentication failed. Please log in again to generate schedules."
        );

        // Clear any cached tokens to force re-authentication
        try {
          localStorage.removeItem("auth_token");
        } catch (e) {
          console.warn("Failed to clear auth_token from localStorage");
        }

        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
        return;
      }

      // Get current active term
      setGenerationStep("Fetching academic term...");
      const termsResponse = await fetch("/api/v1/academic-terms?current=true", {
        headers: { Authorization: authHeader },
      });

      if (!termsResponse.ok) {
        throw new Error("Failed to fetch academic terms");
      }

      const termsData = await termsResponse.json();
      const activeTerm =
        Array.isArray(termsData.data) && termsData.data.length > 0
          ? termsData.data[0]
          : null;

      if (!activeTerm) {
        throw new Error(
          "No active academic term found. Please create one first."
        );
      }

      // Call the auto-generate endpoint
      setGenerationStep("Generating complete schedule...");
      const response = await fetch("/api/v1/schedules/auto-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          term_id: activeTerm.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to generate schedule");
      }

      const result = await response.json();
      setGenerationResult(result.data);

      if (result.data.success) {
        toast.success("Schedule generated successfully!");
      } else {
        toast.warning("Schedule generated with some issues");
      }

      // Refresh status
      await refreshStatus();
      router.refresh();
    } catch (error) {
      console.error("Error generating schedule:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate schedule";
      toast.error(errorMessage);
      setGenerationResult({
        success: false,
        message: errorMessage,
        stats: {
          students_by_level: [],
          sections_created: [],
          total_sections: 0,
          rooms_assigned: 0,
          time_slots_assigned: 0,
          exams_scheduled: { mid1: 0, mid2: 0, final: 0 },
          conflicts_avoided: 0,
        },
        warnings: [errorMessage],
      });
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  }

  async function refreshStatus() {
    try {
      const authHeader = await getAuthHeader();
      const response = await fetch("/api/v1/schedules/status", {
        headers: { Authorization: authHeader },
      });
      if (response.ok) {
        const result = await response.json();
        setStatus(result.data);
      }
    } catch (error) {
      console.error("Error refreshing status:", error);
    }
  }

  const assignmentProgress =
    status.draft.total > 0
      ? (status.draft.assigned / status.draft.total) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Current Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Schedule Status
          </CardTitle>
          <CardDescription>
            Current state of section assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total Sections</p>
              <p className="text-2xl font-bold">{status.draft.total}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Assigned</p>
              <p className="text-2xl font-bold text-green-600">
                {status.draft.assigned}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Unassigned</p>
              <p className="text-2xl font-bold text-orange-600">
                {status.draft.unassigned}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Released</p>
              <p className="text-2xl font-bold text-blue-600">
                {status.released.total}
              </p>
            </div>
          </div>

          {status.draft.total > 0 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Assignment Progress</span>
                <span>{Math.round(assignmentProgress)}%</span>
              </div>
              <Progress value={assignmentProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generation Card - Simplified */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Auto-Generate Schedule
          </CardTitle>
          <CardDescription>
            One-click complete schedule generation for SWE department
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* What it does */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span>Get SWE courses</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <GraduationCap className="h-4 w-4 text-green-500" />
              <span>Count students by level</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4 text-purple-500" />
              <span>Calculate sections needed</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Home className="h-4 w-4 text-orange-500" />
              <span>Assign rooms (1-64)</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4 text-indigo-500" />
              <span>Assign time slots</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-red-500" />
              <span>Schedule exams</span>
            </div>
          </div>

          <Alert className="bg-muted/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Sections: 15-50 students (ideal: 25). Exams: Mid1, Mid2, Final
              with no conflicts.
            </AlertDescription>
          </Alert>

          {/* Generate Button */}
          <Button
            onClick={handleAutoGenerate}
            disabled={isGenerating}
            size="lg"
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {generationStep || "Generating..."}
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Complete Schedule
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generation Results */}
      {generationResult && (
        <Card
          className={
            generationResult.success
              ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
              : "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20"
          }
        >
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
                  Generation Issues
                </>
              )}
            </CardTitle>
            <CardDescription>{generationResult.message}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Students by Level */}
            {generationResult.stats.students_by_level.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-green-600" />
                  Students by Level
                </h4>
                <div className="flex flex-wrap gap-2">
                  {generationResult.stats.students_by_level.map((item) => (
                    <Badge key={item.level} variant="secondary">
                      Level {item.level}: {item.count} students
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Sections Created */}
            {generationResult.stats.sections_created.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                  Sections Created ({generationResult.stats.total_sections}{" "}
                  total)
                </h4>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {generationResult.stats.sections_created
                    .slice(0, 10)
                    .map((item) => (
                      <Badge key={item.course_code} variant="outline">
                        {item.course_code}: {item.section_count} section(s)
                      </Badge>
                    ))}
                  {generationResult.stats.sections_created.length > 10 && (
                    <Badge variant="outline" className="bg-muted">
                      +{generationResult.stats.sections_created.length - 10}{" "}
                      more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1 text-center p-3 rounded-lg bg-background/60">
                <Home className="h-5 w-5 mx-auto text-orange-500" />
                <p className="text-2xl font-bold">
                  {generationResult.stats.rooms_assigned}
                </p>
                <p className="text-xs text-muted-foreground">Rooms Assigned</p>
              </div>
              <div className="space-y-1 text-center p-3 rounded-lg bg-background/60">
                <Clock className="h-5 w-5 mx-auto text-indigo-500" />
                <p className="text-2xl font-bold">
                  {generationResult.stats.time_slots_assigned}
                </p>
                <p className="text-xs text-muted-foreground">Time Slots</p>
              </div>
              <div className="space-y-1 text-center p-3 rounded-lg bg-background/60">
                <Calendar className="h-5 w-5 mx-auto text-red-500" />
                <p className="text-2xl font-bold">
                  {generationResult.stats.exams_scheduled.mid1 +
                    generationResult.stats.exams_scheduled.mid2 +
                    generationResult.stats.exams_scheduled.final}
                </p>
                <p className="text-xs text-muted-foreground">Exams Scheduled</p>
              </div>
              <div className="space-y-1 text-center p-3 rounded-lg bg-background/60">
                <CheckCircle className="h-5 w-5 mx-auto text-green-500" />
                <p className="text-2xl font-bold">
                  {generationResult.stats.conflicts_avoided}
                </p>
                <p className="text-xs text-muted-foreground">
                  Conflicts Avoided
                </p>
              </div>
            </div>

            {/* Exam Details */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-red-600" />
                Exam Schedule
              </h4>
              <div className="flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  >
                    Mid 1: {generationResult.stats.exams_scheduled.mid1}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                  >
                    Mid 2: {generationResult.stats.exams_scheduled.mid2}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300"
                  >
                    Final: {generationResult.stats.exams_scheduled.final}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Warnings */}
            {generationResult.warnings.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warnings</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    {generationResult.warnings.map((warning, idx) => (
                      <li key={idx} className="text-sm">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
