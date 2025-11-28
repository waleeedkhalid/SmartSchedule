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
import { getAuthHeader } from "@/lib/utils/client-auth";

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

export function ScheduleGenerator({ initialStatus }: ScheduleGeneratorProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);
  const [status, setStatus] = useState<ScheduleStatus>(initialStatus);

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
      
      console.log('Calling schedule generation API with term_id:', activeTerm.id);
      // Call schedule generation API
      const response = await fetch('/api/v1/schedules/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          term_id: activeTerm.id,
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
              The algorithm will automatically assign rooms and time slots to all draft sections while
              avoiding conflicts. Sections are prioritized by level, with lectures assigned before labs.
              The system checks for room, instructor, and student-level conflicts.
              <br /><br />
              <strong>Note:</strong> Schedule generation uses the time grid settings configured in Scheduling Settings.
              Make sure your scheduling settings are properly configured before generating schedules.
            </AlertDescription>
          </Alert>

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
    </div>
  );
}

