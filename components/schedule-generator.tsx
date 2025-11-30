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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles,
  AlertCircle,
  CheckCircle,
  Loader2,
  Brain,
  Users,
  Calendar,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/lib/utils/client-auth";
import type { ExternalScheduleEntry } from "@/lib/scheduling/csp-solver";

interface SchedulingStats {
  total_sections: number;
  sections_assigned: number;
  sections_unassigned: number;
  already_scheduled: number;
  sections_created: number;
  instructors_assigned: number;
  instructors_failed: number;
  exams_scheduled: number;
  exams_unassigned: number;
}

interface UnassignedSection {
  section_id: string;
  course_code: string;
  section_no: string;
  reason: string;
}

interface InstructorAssignment {
  section_id: string;
  instructor_id: string;
  instructor_name: string;
}

interface ExamAssignment {
  course_code: string;
  date: string;
  time: string;
  room: string;
}

interface GenerationResult {
  success: boolean;
  stats: SchedulingStats;
  unassigned: UnassignedSection[];
  instructor_assignments: InstructorAssignment[];
  instructor_failures: Array<{ section_id: string; reason: string }>;
  exam_assignments: ExamAssignment[];
  exam_unassigned: Array<{ course_code: string; reason: string }>;
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

interface CSPProgress {
  assigned: number;
  total: number;
  backtracks: number;
  currentVariable?: string;
}

interface CSPStats {
  backtracks?: number;
  softConstraintCost?: {
    studentGaps: number;
    loadImbalance: number;
    roomProximity: number;
    instructorPreference: number;
    total: number;
  };
}

export function ScheduleGenerator({ initialStatus }: ScheduleGeneratorProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] =
    useState<GenerationResult | null>(null);
  const [status, setStatus] = useState<ScheduleStatus>(initialStatus);
  const [useCSPSolver, setUseCSPSolver] = useState(true); // Default to CSP solver for unified scheduling
  const [cspProgress] = useState<CSPProgress | null>(null);
  const [cspStats, setCspStats] = useState<CSPStats | null>(null);

  async function handleGenerate() {
    console.log("handleGenerate called");
    setIsGenerating(true);
    setGenerationResult(null);

    try {
      console.log("Getting auth header...");
      // Get auth header (now has built-in timeout protection)
      const authHeader = await getAuthHeader();
      console.log("Auth header obtained:", authHeader ? "Bearer ***" : "empty");

      if (!authHeader || authHeader.trim() === "" || authHeader === "Bearer ") {
        console.error("No auth token available. User may need to log in.");
        toast.error("Please log in to generate schedules", {
          description: "Redirecting to login page...",
          duration: 3000,
        });

        // Give user time to read the message, then redirect
        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);

        return; // Exit function instead of throwing error
      }

      console.log("Fetching academic terms...");
      // Get current active term
      const termsResponse = await fetch("/api/v1/academic-terms?current=true", {
        headers: {
          Authorization: authHeader,
        },
      });

      console.log("Terms response status:", termsResponse.status);

      if (!termsResponse.ok) {
        let errorMessage = "Failed to fetch academic terms";
        try {
          const errorData = await termsResponse.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          errorMessage = termsResponse.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const termsData = await termsResponse.json();
      // When current=true, API returns array with single term or empty array
      const activeTerm =
        Array.isArray(termsData.data) && termsData.data.length > 0
          ? termsData.data[0]
          : null;

      if (!activeTerm) {
        throw new Error(
          "No active academic term found. Please create an academic term first."
        );
      }

      // Fetch external schedules (released sections from other departments) for CSP constraints
      let externalSchedules: ExternalScheduleEntry[] = [];
      if (useCSPSolver) {
        try {
          const externalResponse = await fetch(
            "/api/v1/sections?state=released&external=true",
            {
              headers: {
                Authorization: authHeader,
              },
            }
          );

          if (externalResponse.ok) {
            const externalData = await externalResponse.json();
            // Convert sections to external schedule entries
            interface ExternalSection {
              meeting_pattern?: {
                days?: string[];
                start?: string;
                duration?: number;
              };
              course_code?: string;
              section_no?: string;
              room_code?: string;
              capacity?: number;
            }
            externalSchedules = (externalData.data || [])
              .map((section: ExternalSection) => {
                const pattern = section.meeting_pattern || {};
                const days = pattern.days || [];
                const start = pattern.start || "";

                return days.map((day: string) => ({
                  course_id: section.course_code,
                  day,
                  time: start,
                  room: section.room_code || "",
                  capacity: section.capacity || 0,
                }));
              })
              .flat()
              .filter(
                (entry: ExternalScheduleEntry) =>
                  entry.day && entry.time && entry.room
              );
          }
        } catch (error) {
          console.warn("Could not fetch external schedules:", error);
          // Continue without external schedules
        }
      }

      console.log(
        "Calling schedule generation API with term_id:",
        activeTerm.id,
        "useCSP:",
        useCSPSolver
      );
      // Call schedule generation API
      const response = await fetch("/api/v1/schedules/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          term_id: activeTerm.id,
          use_csp_solver: useCSPSolver,
          csp_config: useCSPSolver
            ? {
                externalSchedules,
                enableForwardChecking: true,
                enableSoftConstraints: true,
                maxBacktracks: 10000,
              }
            : undefined,
        }),
      });

      console.log("Schedule generation response status:", response.status);

      // Check response status before parsing JSON
      if (!response.ok) {
        // Try to parse error response, but handle non-JSON gracefully
        let errorMessage = "Failed to generate schedule";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Only parse JSON if response is ok
      const result = await response.json();

      // Map API response to component format (unified scheduling response)
      const stats = result.data.stats;
      const generationResult: GenerationResult = {
        success: stats.sections_unassigned === 0 && stats.total_sections > 0,
        stats: {
          total_sections: stats.total_sections,
          sections_assigned: stats.sections_assigned || 0,
          sections_unassigned: stats.sections_unassigned || 0,
          already_scheduled: stats.already_scheduled || 0,
          sections_created: stats.sections_created || 0,
          instructors_assigned: stats.instructors_assigned || 0,
          instructors_failed: stats.instructors_failed || 0,
          exams_scheduled: stats.exams_scheduled || 0,
          exams_unassigned: stats.exams_unassigned || 0,
        },
        unassigned: result.data.unassigned || [],
        instructor_assignments: result.data.instructor_assignments || [],
        instructor_failures: result.data.instructor_failures || [],
        exam_assignments: result.data.exam_assignments || [],
        exam_unassigned: result.data.exam_unassigned || [],
        message: result.data.message,
      };

      // Extract CSP stats if available
      if (result.data.csp_stats) {
        setCspStats({
          backtracks: result.data.csp_stats.backtracks,
          softConstraintCost: result.data.csp_stats.softConstraintCost,
        });
      } else {
        setCspStats(null);
      }

      setGenerationResult(generationResult);

      // Handle different response scenarios
      if (stats.total_sections === 0) {
        // No draft sections found
        toast.info(
          result.data.message || "No draft sections found to schedule"
        );
      } else if (generationResult.success) {
        // All sections successfully assigned
        toast.success(
          `Schedule generated! ${stats.sections_assigned} sections, ${stats.instructors_assigned} instructors, ${stats.exams_scheduled} exams scheduled.`
        );
      } else {
        // Partial generation
        toast.warning(
          `Partial schedule generated. ${stats.sections_unassigned} sections unassigned.`
        );
      }

      // Refresh status
      await refreshStatus();
      router.refresh();
    } catch (error) {
      console.error("Error generating schedule:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Failed to generate schedule";

      // Log detailed error for debugging
      if (error instanceof Error) {
        console.error("Error details:", {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
      }

      toast.error(errorMessage);

      // Set error state for UI feedback
      setGenerationResult({
        success: false,
        stats: {
          total_sections: 0,
          sections_assigned: 0,
          sections_unassigned: 0,
          already_scheduled: 0,
          sections_created: 0,
          instructors_assigned: 0,
          instructors_failed: 0,
          exams_scheduled: 0,
          exams_unassigned: 0,
        },
        unassigned: [],
        instructor_assignments: [],
        instructor_failures: [],
        exam_assignments: [],
        exam_unassigned: [],
        message: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function refreshStatus() {
    try {
      const authHeader = await getAuthHeader();

      const response = await fetch("/api/v1/schedules/status", {
        headers: {
          Authorization: authHeader,
        },
      });

      if (response.ok) {
        try {
          const result = await response.json();
          setStatus(result.data);
        } catch (parseError) {
          // Handle case where response is ok but not valid JSON
          console.error("Error parsing status response:", parseError);
        }
      }
      // Silently ignore non-ok responses to prevent error loops
    } catch (error) {
      // Silently handle errors to prevent continuous error reporting
      // Only log in development to avoid console spam
      if (process.env.NODE_ENV === "development") {
        console.error("Error refreshing status:", error);
      }
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
          <CardTitle>Schedule Status</CardTitle>
          <CardDescription>
            Current state of section assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Total Draft Sections
              </p>
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
              <p className="text-sm text-muted-foreground">Released Sections</p>
              <p className="text-2xl font-bold text-blue-600">
                {status.released.total}
              </p>
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
            Unified Schedule Generation
          </CardTitle>
          <CardDescription>
            Generate complete schedule: sections with rooms, instructor
            assignments, and final exams
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unified Scheduling - What it does</AlertTitle>
            <AlertDescription>
              This unified scheduler performs three operations in sequence:
              <br />
              <br />
              <strong>1. Section Scheduling:</strong> Assigns time slots and
              rooms to all draft sections using CSP algorithm with backtracking,
              MCV/LCV heuristics, and forward checking. Ensures no room,
              instructor, or student-level conflicts.
              <br />
              <br />
              <strong>2. Instructor Assignment:</strong> Auto-assigns
              instructors to sections based on availability and load balancing.
              Instructors with lower current load are preferred for better
              distribution.
              <br />
              <br />
              <strong>3. Final Exam Scheduling:</strong> Schedules final exams
              using exam CSP solver with student conflict avoidance as absolute
              priority. Assigns rooms where capacity permits, or marks as TBD
              for manual assignment.
              <br />
              <br />
              <strong>Note:</strong> All operations target the current active
              semester. Configure time grid settings in Scheduling Settings
              first.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label
                htmlFor="csp-solver"
                className="text-base font-medium flex items-center gap-2"
              >
                <Brain className="h-4 w-4 text-purple-600" />
                Use CSP Solver (Recommended)
              </Label>
              <p className="text-sm text-muted-foreground">
                Constraint satisfaction problem solver with backtracking and
                optimization
              </p>
            </div>
            <Switch
              id="csp-solver"
              checked={useCSPSolver}
              onCheckedChange={setUseCSPSolver}
              disabled={isGenerating}
            />
          </div>

          {cspProgress && (
            <div className="space-y-2 rounded-lg border p-4 bg-muted/50">
              <div className="flex justify-between text-sm">
                <span className="font-medium">CSP Solver Progress</span>
                <span className="text-muted-foreground">
                  {cspProgress.assigned} / {cspProgress.total} assigned
                </span>
              </div>
              <Progress
                value={(cspProgress.assigned / cspProgress.total) * 100}
                className="h-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  Backtracks: {cspProgress.backtracks.toLocaleString()}
                </span>
                {cspProgress.currentVariable && (
                  <span>Processing: {cspProgress.currentVariable}</span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Generate button clicked");
                try {
                  await handleGenerate();
                } catch (error) {
                  console.error("Error in button click handler:", error);
                }
              }}
              disabled={isGenerating}
              size="lg"
              className="flex-1"
              type="button"
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
                There are no draft sections to schedule. The generation will
                check for draft sections and return a message if none are found.
                Create sections first or change existing sections to draft
                state.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generation Results */}
      {generationResult && (
        <Card
          className={
            generationResult.stats.total_sections === 0
              ? "border-blue-500"
              : generationResult.success
              ? "border-green-500"
              : "border-orange-500"
          }
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {generationResult.stats.total_sections === 0 ? (
                <>
                  <AlertCircle className="h-5 w-5 text-blue-600" />
                  No Draft Sections
                </>
              ) : generationResult.success ? (
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
          <CardContent className="space-y-6">
            {generationResult.stats.total_sections === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Draft Sections Available</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    There are no draft sections in the system to schedule. To
                    generate a schedule:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      Create new sections in the <strong>Sections</strong> page
                    </li>
                    <li>
                      Ensure sections are set to{" "}
                      <strong>&quot;draft&quot;</strong> state
                    </li>
                    <li>Or change existing sections to draft state</li>
                  </ul>
                  <p className="mt-2">
                    Once you have draft sections, click &quot;Generate
                    Schedule&quot; again.
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Sections Stats */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Home className="h-4 w-4 text-blue-600" />
                    Section Scheduling
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Total Sections
                      </p>
                      <p className="text-2xl font-bold">
                        {generationResult.stats.total_sections}
                      </p>
                    </div>
                    {generationResult.stats.sections_created > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {generationResult.stats.sections_created}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Rooms Assigned
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {generationResult.stats.sections_assigned}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Unassigned
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {generationResult.stats.sections_unassigned}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructor Stats */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    Instructor Assignment
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Instructors Assigned
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {generationResult.stats.instructors_assigned}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Failed to Assign
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {generationResult.stats.instructors_failed}
                      </p>
                    </div>
                  </div>
                  {generationResult.instructor_assignments.length > 0 && (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {generationResult.instructor_assignments
                        .slice(0, 5)
                        .map((assignment, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-md bg-green-50 dark:bg-green-950/20 p-2 text-xs"
                          >
                            <Badge variant="outline" className="text-xs">
                              Section {assignment.section_id.slice(0, 8)}...
                            </Badge>
                            <span className="text-muted-foreground">
                              {assignment.instructor_name}
                            </span>
                          </div>
                        ))}
                      {generationResult.instructor_assignments.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          ... and{" "}
                          {generationResult.instructor_assignments.length - 5}{" "}
                          more
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Exam Stats */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    Final Exam Scheduling
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Exams Scheduled
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {generationResult.stats.exams_scheduled}
                      </p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Exams Unassigned
                      </p>
                      <p className="text-2xl font-bold text-orange-600">
                        {generationResult.stats.exams_unassigned}
                      </p>
                    </div>
                  </div>
                  {generationResult.exam_assignments.length > 0 && (
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {(() => {
                        const tbdExams =
                          generationResult.exam_assignments.filter(
                            (a) => a.room === "TBD"
                          );
                        const realRoomExams =
                          generationResult.exam_assignments.filter(
                            (a) => a.room !== "TBD"
                          );

                        return (
                          <>
                            {realRoomExams.length > 0 && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-green-700 dark:text-green-400">
                                  ✓ {realRoomExams.length} exam
                                  {realRoomExams.length !== 1 ? "s" : ""} with
                                  rooms
                                </p>
                                {realRoomExams
                                  .slice(0, 3)
                                  .map((assignment, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center justify-between rounded-md bg-green-50 dark:bg-green-950/20 p-2 text-xs"
                                    >
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        {assignment.course_code}
                                      </Badge>
                                      <span className="text-muted-foreground">
                                        {assignment.date} at {assignment.time}{" "}
                                        in {assignment.room}
                                      </span>
                                    </div>
                                  ))}
                                {realRoomExams.length > 3 && (
                                  <p className="text-xs text-muted-foreground ml-2">
                                    ... and {realRoomExams.length - 3} more
                                  </p>
                                )}
                              </div>
                            )}
                            {tbdExams.length > 0 && (
                              <div className="space-y-1 mt-2">
                                <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                                  ⚠ {tbdExams.length} exam
                                  {tbdExams.length !== 1 ? "s" : ""} need room
                                  assignment
                                </p>
                                {tbdExams.slice(0, 3).map((assignment, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center justify-between rounded-md bg-blue-50 dark:bg-blue-950/20 p-2 text-xs"
                                  >
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {assignment.course_code}
                                    </Badge>
                                    <span className="text-muted-foreground">
                                      {assignment.date} at {assignment.time} -
                                      Room: TBD
                                    </span>
                                  </div>
                                ))}
                                {tbdExams.length > 3 && (
                                  <p className="text-xs text-muted-foreground ml-2">
                                    ... and {tbdExams.length - 3} more
                                  </p>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* CSP Stats */}
                {cspStats && (
                  <div className="space-y-3 rounded-lg border p-4 bg-muted/30">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Brain className="h-4 w-4 text-purple-600" />
                      CSP Solver Statistics
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {cspStats.backtracks !== undefined && (
                        <div>
                          <p className="text-muted-foreground">Backtracks</p>
                          <p className="text-lg font-semibold">
                            {cspStats.backtracks.toLocaleString()}
                          </p>
                        </div>
                      )}
                      {cspStats.softConstraintCost && (
                        <>
                          <div>
                            <p className="text-muted-foreground">Total Cost</p>
                            <p className="text-lg font-semibold">
                              {cspStats.softConstraintCost.total}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Student Gaps
                            </p>
                            <p className="text-base">
                              {cspStats.softConstraintCost.studentGaps}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Load Imbalance
                            </p>
                            <p className="text-base">
                              {cspStats.softConstraintCost.loadImbalance}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Unassigned Sections */}
                {generationResult.unassigned.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      Unassigned Sections ({generationResult.unassigned.length})
                    </h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {generationResult.unassigned.map((section, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-md bg-orange-50 dark:bg-orange-950/20 p-2 text-sm"
                        >
                          <Badge variant="outline">
                            {section.course_code} - Section {section.section_no}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {section.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Manual Assignment Required</AlertTitle>
                      <AlertDescription>
                        These sections could not be automatically assigned.
                        Please manually assign rooms and times in the Sections
                        page.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Instructor Assignment Failures */}
                {generationResult.instructor_failures.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-orange-600">
                      <Users className="h-4 w-4" />
                      Instructor Assignment Failures (
                      {generationResult.instructor_failures.length})
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {generationResult.instructor_failures
                        .slice(0, 5)
                        .map((failure, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between rounded-md bg-orange-50 dark:bg-orange-950/20 p-2 text-xs"
                          >
                            <Badge variant="outline" className="text-xs">
                              Section {failure.section_id.slice(0, 8)}...
                            </Badge>
                            <span className="text-muted-foreground">
                              {failure.reason}
                            </span>
                          </div>
                        ))}
                      {generationResult.instructor_failures.length > 5 && (
                        <p className="text-xs text-muted-foreground">
                          ... and{" "}
                          {generationResult.instructor_failures.length - 5} more
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Exam Unassigned */}
                {generationResult.exam_unassigned.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium flex items-center gap-2 text-orange-600">
                      <Calendar className="h-4 w-4" />
                      Unassigned Exams (
                      {generationResult.exam_unassigned.length})
                    </h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {generationResult.exam_unassigned.map((exam, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-md bg-orange-50 dark:bg-orange-950/20 p-2 text-xs"
                        >
                          <Badge variant="outline" className="text-xs">
                            {exam.course_code}
                          </Badge>
                          <span className="text-muted-foreground">
                            {exam.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
