/**
 * Statistics Overview Component
 * Displays enrollment statistics with export functionality
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  AlertCircle,
  Users,
  BookOpen,
  TrendingUp,
  Download,
  FileSpreadsheet,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { exportStudentData } from "@/lib/actions/student-management";
import type {
  StudentEnrollmentData,
  LevelEnrollmentSummary,
  CourseTypeEnrollmentSummary,
} from "@/types/scheduler";

interface StatisticsOverviewProps {
  termCode: string;
  termName: string;
}

export function StatisticsOverview({
  termCode,
  termName,
}: StatisticsOverviewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Data state
  const [courseData, setCourseData] = useState<StudentEnrollmentData[]>([]);
  const [levelData, setLevelData] = useState<LevelEnrollmentSummary[]>([]);
  const [typeData, setTypeData] = useState<CourseTypeEnrollmentSummary[]>([]);

  const { toast } = useToast();

  // Fetch statistics data
  const fetchData = useCallback(async () => {
    if (!termCode) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch course-level data
      const courseResponse = await fetch(
        `/api/committee/scheduler/student-counts?term_code=${termCode}&group_by=course`
      );
      if (!courseResponse.ok) {
        throw new Error("Failed to fetch course enrollment data");
      }
      const courseResult = await courseResponse.json();
      setCourseData(courseResult.data?.courses || []);

      // Fetch level summary
      const levelResponse = await fetch(
        `/api/committee/scheduler/student-counts?term_code=${termCode}&group_by=level`
      );
      if (levelResponse.ok) {
        const levelResult = await levelResponse.json();
        setLevelData(levelResult.data?.by_level || []);
      }

      // Fetch type summary
      const typeResponse = await fetch(
        `/api/committee/scheduler/student-counts?term_code=${termCode}&group_by=course_type`
      );
      if (typeResponse.ok) {
        const typeResult = await typeResponse.json();
        setTypeData(typeResult.data?.by_course_type || []);
      }
    } catch (err) {
      console.error("Error loading statistics:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load statistics"
      );
    } finally {
      setLoading(false);
    }
  }, [termCode]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle export
  const handleExport = async (format: "csv" | "json", viewType: "all" | "irregular" | "statistics") => {
    setExporting(true);

    try {
      const result = await exportStudentData({
        termCode,
        viewType,
        format,
      });

      if (result.success && result.data) {
        // Convert to downloadable format
        let content: string;
        let mimeType: string;
        let filename: string;

        if (format === "json") {
          content = JSON.stringify(result.data, null, 2);
          mimeType = "application/json";
          filename = `student-enrollment-${termCode}-${viewType}.json`;
        } else {
          // CSV format (later)
          throw new Error("CSV format not supported yet");
        }
      } else {
        throw new Error(result.error || "Failed to export data");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export failed",
        description:
          error instanceof Error ? error.message : "Failed to export data",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Convert data to CSV format (later)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading statistics...</span>
          </div>
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

  // Calculate summary stats
  const totalStudents = levelData.reduce((sum, l) => sum + l.total_students, 0);
  const totalEnrolled = levelData.reduce(
    (sum, l) => sum + l.enrolled_students,
    0
  );
  const avgEnrollmentRate =
    totalStudents > 0
      ? Math.round((totalEnrolled / totalStudents) * 100)
      : 0;
  const totalCourses = courseData.length;

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Export Data</span>
            <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => handleExport("csv", "all")}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export All Students (CSV)
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExport("csv", "irregular")}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export Irregular (CSV)
            </Button>

            <Button
              variant="outline"
              onClick={() => handleExport("json", "statistics")}
              disabled={exporting}
            >
              {exporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export Statistics (JSON)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Across all levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Total Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Available courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Enrolled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEnrolled}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Enrollment Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgEnrollmentRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Average rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Enrollment by Level */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment by Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {levelData.map((level) => {
              const enrollmentRate =
                level.total_students > 0
                  ? Math.round(
                      (level.enrolled_students / level.total_students) * 100
                    )
                  : 0;

              return (
                <div key={level.level} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Level {level.level}</span>
                    <span className="text-sm text-muted-foreground">
                      {level.enrolled_students} / {level.total_students}{" "}
                      students ({enrollmentRate}%)
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${enrollmentRate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Enrollment by Course Type */}
      <Card>
        <CardHeader>
          <CardTitle>Enrollment by Course Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {typeData.map((type) => (
              <div key={type.course_type} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{type.course_type}</span>
                  <span className="text-sm text-muted-foreground">
                    {type.enrolled_students} enrolled •{" "}
                    {type.utilization_percentage}% utilization
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${Math.min(type.utilization_percentage, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {type.total_courses} courses • {type.total_capacity} total
                  capacity
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Courses by Enrollment */}
      <Card>
        <CardHeader>
          <CardTitle>Top Courses by Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {courseData
              .sort((a, b) => b.enrolled_students - a.enrolled_students)
              .slice(0, 10)
              .map((course) => (
                <div
                  key={course.course_code}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{course.course_code}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.course_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{course.enrolled_students}</p>
                    <p className="text-xs text-muted-foreground">enrolled</p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

