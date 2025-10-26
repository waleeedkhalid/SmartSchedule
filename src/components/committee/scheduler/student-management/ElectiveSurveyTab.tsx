/**
 * Elective Survey Tab
 * View survey responses and control survey status
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2, XCircle, Lock, Unlock, BarChart3 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SurveyResponse {
  course_code: string;
  course_name: string;
  response_count: number;
  student_levels: number[];
}

interface SurveyStats {
  total_responses: number;
  unique_students: number;
  courses_requested: number;
  responses: SurveyResponse[];
}

interface ElectiveSurveyTabProps {
  termCode: string;
  termName: string;
  surveyOpen: boolean;
}

export function ElectiveSurveyTab({ termCode, termName, surveyOpen: initialSurveyOpen }: ElectiveSurveyTabProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SurveyStats | null>(null);
  const [surveyOpen, setSurveyOpen] = useState(initialSurveyOpen);

  useEffect(() => {
    loadSurveyData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termCode]);

  async function loadSurveyData() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/committee/scheduler/elective-survey?term_code=${termCode}`);
      
      if (!response.ok) {
        throw new Error("Failed to load survey data");
      }

      const result = await response.json();
      setData(result.data);
    } catch (err) {
      console.error("Error loading survey data:", err);
      setError(err instanceof Error ? err.message : "Failed to load survey data");
    } finally {
      setLoading(false);
    }
  }

  async function toggleSurvey() {
    try {
      setUpdating(true);

      const response = await fetch(`/api/committee/scheduler/elective-survey/toggle`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ term_code: termCode, open: !surveyOpen }),
      });

      if (!response.ok) {
        throw new Error("Failed to update survey status");
      }

      setSurveyOpen(!surveyOpen);
      toast({
        title: "Survey Updated",
        description: `Elective survey ${!surveyOpen ? "opened" : "closed"} successfully.`,
      });
    } catch (err) {
      console.error("Error toggling survey:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update survey status",
      });
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
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
      {/* Survey Status Control */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {surveyOpen ? (
                  <>
                    <Unlock className="h-5 w-5 text-green-600" />
                    Survey Open
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 text-muted-foreground" />
                    Survey Closed
                  </>
                )}
              </CardTitle>
              <CardDescription className="mt-2">
                {surveyOpen 
                  ? "Students can currently submit elective preferences"
                  : "Students cannot submit preferences while the survey is closed"}
              </CardDescription>
            </div>
            <Button
              onClick={toggleSurvey}
              disabled={updating}
              variant={surveyOpen ? "destructive" : "default"}
            >
              {updating ? "Updating..." : surveyOpen ? "Close Survey" : "Open Survey"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Survey Statistics */}
      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Survey Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-primary">{data.unique_students}</div>
                  <div className="text-sm text-muted-foreground mt-1">Students Responded</div>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-primary">{data.total_responses}</div>
                  <div className="text-sm text-muted-foreground mt-1">Total Preferences</div>
                </div>
                <div className="p-4 border rounded-lg bg-muted/50">
                  <div className="text-3xl font-bold text-primary">{data.courses_requested}</div>
                  <div className="text-sm text-muted-foreground mt-1">Courses Requested</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Course Demand */}
          {data.responses.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Course Demand</CardTitle>
                <CardDescription>
                  Courses sorted by number of student preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.responses
                    .sort((a, b) => b.response_count - a.response_count)
                    .map((course) => (
                      <div 
                        key={course.course_code}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{course.course_code}</div>
                          <div className="text-sm text-muted-foreground">
                            {course.course_name}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-lg px-3 py-1">
                            {course.response_count} requests
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            Levels: {course.student_levels.sort().join(", ")}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No survey responses yet. Students can submit preferences when the survey is open.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}

