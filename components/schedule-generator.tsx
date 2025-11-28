"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Sparkles, AlertCircle, CheckCircle, XCircle, Loader2, Brain, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/lib/utils/client-auth";
import type { ExternalScheduleEntry } from "@/lib/scheduling/csp-solver";

interface SchedulingStats {
  total_sections: number;
  assigned: number;
  unassigned: number;
  conflicts_resolved: number;
  created?: number;
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
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [status, setStatus] = useState<ScheduleStatus>(initialStatus);
  const [useCSPSolver, setUseCSPSolver] = useState(false);
  const [cspProgress] = useState<CSPProgress | null>(null);
  const [cspStats, setCspStats] = useState<CSPStats | null>(null);
  const [isSchedulingExams, setIsSchedulingExams] = useState(false);
  const [examResult, setExamResult] = useState<{
    success: boolean;
    assigned: number;
    unassigned: number;
    message: string;
  } | null>(null);

  async function handleGenerate() {
    console.log('handleGenerate called');
    setIsGenerating(true);
    setGenerationResult(null);

    try {
      console.log('Getting auth header...');
      // Get auth header first with timeout to prevent hanging
      let authHeader: string;
      try {
        const authHeaderPromise = getAuthHeader();
        const authTimeoutPromise = new Promise<string>((_, reject) => 
          setTimeout(() => reject(new Error('Authentication timeout')), 5000)
        );
        
        authHeader = await Promise.race([authHeaderPromise, authTimeoutPromise]);
        console.log('Auth header obtained:', authHeader ? 'Bearer ***' : 'empty');
      } catch (authError) {
        console.error('Auth header error:', authError);
        const errorMessage = authError instanceof Error 
          ? authError.message 
          : 'Authentication failed';
        
        if (errorMessage.includes('timeout')) {
          throw new Error('Authentication timeout: Please refresh the page and try again');
        }
        throw new Error(`Authentication failed: ${errorMessage}`);
      }
      
      if (!authHeader || authHeader.trim() === '' || authHeader === 'Bearer ') {
        throw new Error('Authentication required: No auth token available. Please log in again.');
      }
      
      console.log('Fetching academic terms...');
      // Get current active term
      const termsResponse = await fetch('/api/v1/academic-terms?current=true', {
        headers: {
          'Authorization': authHeader,
        },
      });
      
      console.log('Terms response status:', termsResponse.status);
      
      if (!termsResponse.ok) {
        let errorMessage = 'Failed to fetch academic terms';
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
      const activeTerm = Array.isArray(termsData.data) && termsData.data.length > 0
        ? termsData.data[0]
        : null;

      if (!activeTerm) {
        throw new Error('No active academic term found. Please create an academic term first.');
      }
      
      // Fetch external schedules (released sections from other departments) for CSP constraints
      let externalSchedules: ExternalScheduleEntry[] = [];
      if (useCSPSolver) {
        try {
          const externalResponse = await fetch('/api/v1/sections?state=released&external=true', {
            headers: {
              'Authorization': authHeader,
            },
          });
          
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
            }
            externalSchedules = (externalData.data || []).map((section: ExternalSection) => {
              const pattern = section.meeting_pattern || {};
              const days = pattern.days || [];
              const start = pattern.start || '';
              
              return days.map((day: string) => ({
                course_id: section.course_code,
                day,
                time: start,
                room: section.room_code || '',
                capacity: section.capacity || 0,
              }));
            }).flat().filter((entry: ExternalScheduleEntry) => entry.day && entry.time && entry.room);
          }
        } catch (error) {
          console.warn('Could not fetch external schedules:', error);
          // Continue without external schedules
        }
      }

      console.log('Calling schedule generation API with term_id:', activeTerm.id, 'useCSP:', useCSPSolver);
      // Call schedule generation API
      const response = await fetch('/api/v1/schedules/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          term_id: activeTerm.id,
          use_csp_solver: useCSPSolver,
          csp_config: useCSPSolver ? {
            externalSchedules,
            enableForwardChecking: true,
            enableSoftConstraints: true,
            maxBacktracks: 10000,
          } : undefined,
        }),
      });
      
      console.log('Schedule generation response status:', response.status);

      // Check response status before parsing JSON
      if (!response.ok) {
        // Try to parse error response, but handle non-JSON gracefully
        let errorMessage = 'Failed to generate schedule';
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

      // Map API response to component format
      const generationResult: GenerationResult = {
        success: result.data.stats.unassigned === 0 && result.data.stats.total_sections > 0,
        stats: {
          total_sections: result.data.stats.total_sections,
          assigned: result.data.stats.added,
          unassigned: result.data.stats.unassigned,
          conflicts_resolved: result.data.stats.added,
          created: result.data.stats.created || 0,
        },
        unassigned: result.data.unassigned || [],
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
      if (result.data.stats.total_sections === 0) {
        // No draft sections found
        toast.info(result.data.message || "No draft sections found to schedule");
      } else if (generationResult.success) {
        // All sections successfully assigned
        toast.success("Schedule generated successfully!");
      } else {
        // Partial generation
        toast.warning(`Partial schedule generated. ${result.data.stats.unassigned} sections remaining unassigned.`);
      }

      // Refresh status
      await refreshStatus();
      router.refresh();
    } catch (error) {
      console.error("Error generating schedule:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate schedule";
      
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
          assigned: 0,
          unassigned: 0,
          conflicts_resolved: 0,
          created: 0,
        },
        unassigned: [],
        message: errorMessage,
      });
    } finally {
      setIsGenerating(false);
    }
  }

  async function refreshStatus() {
    try {
      const authHeader = await getAuthHeader();
      
      const response = await fetch('/api/v1/schedules/status', {
        headers: {
          'Authorization': authHeader,
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
      if (process.env.NODE_ENV === 'development') {
        console.error("Error refreshing status:", error);
      }
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
              {useCSPSolver ? (
                <>
                  <strong>CSP Solver Mode:</strong> Uses Constraint Satisfaction Problem (CSP) algorithm with backtracking search,
                  Most Constrained Variable (MCV) and Least Constraining Value (LCV) heuristics, and forward checking.
                  The solver optimizes for student gaps, load balancing, room proximity, and instructor preferences.
                  <br /><br />
                  <strong>Hard Constraints:</strong> No room conflicts, instructor conflicts, student-level conflicts, or external schedule conflicts.
                  <br /><br />
                  <strong>Soft Constraints:</strong> Minimizes student gaps, balances daily load per level, optimizes room proximity, and respects instructor preferences.
                </>
              ) : (
                <>
                  The algorithm will automatically assign rooms and time slots to all draft sections while
                  avoiding conflicts. Sections are prioritized by level, with lectures assigned before labs.
                  The system checks for room, instructor, and student-level conflicts.
                </>
              )}
              <br /><br />
              <strong>Note:</strong> Schedule generation uses the time grid settings configured in Scheduling Settings.
              Make sure your scheduling settings are properly configured before generating schedules.
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="csp-solver" className="text-base font-medium flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-600" />
                Use CSP Solver (Advanced)
              </Label>
              <p className="text-sm text-muted-foreground">
                Enable constraint satisfaction problem solver with backtracking and optimization
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
                <span>Backtracks: {cspProgress.backtracks.toLocaleString()}</span>
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
                console.log('Generate button clicked');
                try {
                  await handleGenerate();
                } catch (error) {
                  console.error('Error in button click handler:', error);
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
                There are no draft sections to schedule. The generation will check for draft sections
                and return a message if none are found. Create sections first or change existing
                sections to draft state.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generation Results */}
      {generationResult && (
        <Card className={
          generationResult.stats.total_sections === 0 
            ? "border-blue-500" 
            : generationResult.success 
              ? "border-green-500" 
              : "border-orange-500"
        }>
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
          <CardContent className="space-y-4">
            {generationResult.stats.total_sections === 0 ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Draft Sections Available</AlertTitle>
                <AlertDescription className="space-y-2">
                  <p>
                    There are no draft sections in the system to schedule. To generate a schedule:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Create new sections in the <strong>Sections</strong> page</li>
                    <li>Ensure sections are set to <strong>&quot;draft&quot;</strong> state</li>
                    <li>Or change existing sections to draft state</li>
                  </ul>
                  <p className="mt-2">
                    Once you have draft sections, click &quot;Generate Schedule&quot; again.
                  </p>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <div className={`grid gap-4 ${generationResult.stats.created && generationResult.stats.created > 0 ? 'grid-cols-2 md:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'}`}>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Sections</p>
                    <p className="text-2xl font-bold">{generationResult.stats.total_sections}</p>
                  </div>
                  {generationResult.stats.created !== undefined && generationResult.stats.created > 0 && (
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Created</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {generationResult.stats.created}
                      </p>
                    </div>
                  )}
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
                          <p className="text-lg font-semibold">{cspStats.backtracks.toLocaleString()}</p>
                        </div>
                      )}
                      {cspStats.softConstraintCost && (
                        <>
                          <div>
                            <p className="text-muted-foreground">Total Cost</p>
                            <p className="text-lg font-semibold">{cspStats.softConstraintCost.total}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Student Gaps</p>
                            <p className="text-base">{cspStats.softConstraintCost.studentGaps}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Load Imbalance</p>
                            <p className="text-base">{cspStats.softConstraintCost.loadImbalance}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Room Proximity</p>
                            <p className="text-base">{cspStats.softConstraintCost.roomProximity}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Instructor Preference</p>
                            <p className="text-base">{cspStats.softConstraintCost.instructorPreference}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

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
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Exam Scheduling Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Final Exam Scheduling
          </CardTitle>
          <CardDescription>
            Schedule final exams for SWE courses (Levels 4-8) with student conflict avoidance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Exam Scheduling CSP</AlertTitle>
            <AlertDescription>
              The exam scheduler uses a specialized Constraint Satisfaction Problem solver that prioritizes
              <strong> student conflict avoidance</strong> above all else. No student can have two exams at the same time.
              <br /><br />
              <strong>Hard Constraints:</strong> Student conflicts (ABSOLUTE PRIORITY), room capacity, unique room assignment, instructor conflicts, room type (Lecture Hall/Auditorium only).
              <br /><br />
              <strong>Soft Constraints:</strong> Spread student load (minimize multiple exams per day), distribute exams across exam window, theory before lab exams.
            </AlertDescription>
          </Alert>

          <div className="flex gap-4">
            <Button
              onClick={async () => {
                setIsSchedulingExams(true);
                setExamResult(null);
                try {
                  const authHeader = await getAuthHeader();
                  
                  // Get active term
                  const termsResponse = await fetch('/api/v1/academic-terms?current=true', {
                    headers: { 'Authorization': authHeader },
                  });
                  
                  if (!termsResponse.ok) {
                    throw new Error('Failed to fetch academic term');
                  }
                  
                  const termsData = await termsResponse.json();
                  const activeTerm = Array.isArray(termsData.data) && termsData.data.length > 0
                    ? termsData.data[0]
                    : null;

                  if (!activeTerm) {
                    throw new Error('No active academic term found');
                  }

                  // Call exam scheduling API
                  const response = await fetch('/api/v1/exams/schedule', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': authHeader,
                    },
                    body: JSON.stringify({
                      term_id: activeTerm.id,
                      use_csp_solver: true,
                    }),
                  });

                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.error || errorData.message || 'Failed to schedule exams');
                  }

                  const result = await response.json();
                  setExamResult({
                    success: result.data.stats.unassigned === 0,
                    assigned: result.data.stats.assigned || 0,
                    unassigned: result.data.stats.unassigned || 0,
                    message: result.data.message || 'Exam scheduling completed',
                  });

                  if (result.data.stats.unassigned === 0) {
                    toast.success('All exams scheduled successfully!');
                  } else {
                    toast.warning(`Partial exam scheduling: ${result.data.stats.unassigned} exams could not be scheduled.`);
                  }
                } catch (error) {
                  console.error('Error scheduling exams:', error);
                  const errorMessage = error instanceof Error ? error.message : 'Failed to schedule exams';
                  toast.error(errorMessage);
                  setExamResult({
                    success: false,
                    assigned: 0,
                    unassigned: 0,
                    message: errorMessage,
                  });
                } finally {
                  setIsSchedulingExams(false);
                }
              }}
              disabled={isSchedulingExams || isGenerating}
              size="lg"
              className="flex-1"
              type="button"
            >
              {isSchedulingExams ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling Exams...
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  Schedule Final Exams
                </>
              )}
            </Button>
          </div>

          {examResult && (
            <Alert className={examResult.success ? "border-green-500" : "border-orange-500"}>
              {examResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-600" />
              )}
              <AlertTitle>{examResult.success ? 'Exam Scheduling Complete' : 'Partial Exam Scheduling'}</AlertTitle>
              <AlertDescription>
                <div className="space-y-2">
                  <p>{examResult.message}</p>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Assigned</p>
                      <p className="text-xl font-bold text-green-600">{examResult.assigned}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Unassigned</p>
                      <p className="text-xl font-bold text-orange-600">{examResult.unassigned}</p>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

