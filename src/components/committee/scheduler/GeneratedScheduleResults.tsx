/**
 * GeneratedScheduleResults Component
 * 
 * Displays comprehensive results from schedule generation with:
 * - Generation summary and statistics
 * - Level-by-level breakdown
 * - Section details
 * - Export and publish actions
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  Download,
  FileText,
  Clock,
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
} from "lucide-react";

export interface LevelScheduleData {
  level: number;
  studentCount: number;
  courses: {
    courseCode: string;
    courseName: string;
    sectionsCreated: number;
    totalEnrolled?: number;
    capacity?: number;
  }[];
}

export interface GeneratedScheduleResultsProps {
  data: {
    levels: LevelScheduleData[];
    conflicts: {
      type: string;
      description: string;
      severity?: string;
    }[];
    execution_time_ms?: number;
  };
  termCode: string;
  onExport?: () => void;
  onPublish?: () => void;
  onViewConflicts?: () => void;
}

export function GeneratedScheduleResults({
  data,
  termCode,
  onExport,
  onPublish,
  onViewConflicts,
}: GeneratedScheduleResultsProps) {
  const [selectedLevel, setSelectedLevel] = useState<number>(
    data.levels[0]?.level || 3
  );

  // Calculate overall statistics
  const totalStudents = data.levels.reduce(
    (sum, level) => sum + level.studentCount,
    0
  );
  const totalSections = data.levels.reduce(
    (sum, level) =>
      sum +
      level.courses.reduce((s, course) => s + course.sectionsCreated, 0),
    0
  );
  const totalCourses = data.levels.reduce(
    (sum, level) => sum + level.courses.length,
    0
  );

  const selectedLevelData = data.levels.find(
    (level) => level.level === selectedLevel
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Schedule Generation Complete
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {termCode} • Generated for {data.levels.length} levels
            {data.execution_time_ms && (
              <span className="ml-2">
                • Completed in {(data.execution_time_ms / 1000).toFixed(2)}s
              </span>
            )}
          </p>
        </div>

        <div className="flex gap-2">
          {onExport && (
            <Button variant="outline" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          )}
          {onPublish && (
            <Button onClick={onPublish}>
              <FileText className="w-4 h-4 mr-2" />
              Publish Schedule
            </Button>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Users className="w-4 h-4" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStudents}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Across {data.levels.length} levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Courses Scheduled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalCourses}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Unique courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Sections Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalSections}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Total sections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Generation Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {data.execution_time_ms
                ? (data.execution_time_ms / 1000).toFixed(1)
                : "N/A"}
              <span className="text-lg">s</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Execution time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conflicts Summary */}
      {data.conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-destructive">
                {data.conflicts.length} Conflict
                {data.conflicts.length !== 1 ? "s" : ""} Detected
              </CardTitle>
              {onViewConflicts && (
                <Button variant="outline" onClick={onViewConflicts} size="sm">
                  View & Resolve
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.conflicts.slice(0, 5).map((conflict, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-3 bg-destructive/5 border border-destructive/10 rounded-md"
                >
                  <Badge
                    variant="secondary"
                    className="bg-destructive/10 text-destructive mt-0.5"
                  >
                    {conflict.type}
                  </Badge>
                  <p className="text-sm flex-1">{conflict.description}</p>
                </div>
              ))}
              {data.conflicts.length > 5 && (
                <p className="text-sm text-muted-foreground text-center pt-2">
                  ... and {data.conflicts.length - 5} more conflicts
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Level-by-Level Details */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Details by Level</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={selectedLevel.toString()}
            onValueChange={(value) => setSelectedLevel(parseInt(value))}
          >
            <TabsList className="grid grid-cols-6 w-full">
              {data.levels.map((level) => (
                <TabsTrigger
                  key={level.level}
                  value={level.level.toString()}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>Level {level.level}</span>
                    <Badge variant="secondary" className="text-xs">
                      {level.studentCount}
                    </Badge>
                  </div>
                </TabsTrigger>
              ))}
            </TabsList>

            {data.levels.map((levelData) => (
              <TabsContent
                key={levelData.level}
                value={levelData.level.toString()}
                className="space-y-4 mt-4"
              >
                {/* Level Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Students</p>
                    </div>
                    <p className="text-2xl font-bold">{levelData.studentCount}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <BookOpen className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Courses</p>
                    </div>
                    <p className="text-2xl font-bold">{levelData.courses.length}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Sections</p>
                    </div>
                    <p className="text-2xl font-bold">
                      {levelData.courses.reduce(
                        (sum, course) => sum + course.sectionsCreated,
                        0
                      )}
                    </p>
                  </div>
                </div>

                {/* Courses Table */}
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Name</TableHead>
                        <TableHead className="text-center">Sections Created</TableHead>
                        <TableHead className="text-center">Enrolled</TableHead>
                        <TableHead className="text-center">Capacity</TableHead>
                        <TableHead className="text-right">Utilization</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {levelData.courses.map((course) => {
                        const utilization = course.capacity
                          ? ((course.totalEnrolled || 0) / course.capacity) * 100
                          : 0;

                        return (
                          <TableRow key={course.courseCode}>
                            <TableCell className="font-mono font-medium">
                              {course.courseCode}
                            </TableCell>
                            <TableCell>{course.courseName}</TableCell>
                            <TableCell className="text-center">
                              <Badge variant="secondary">
                                {course.sectionsCreated}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              {course.totalEnrolled || "-"}
                            </TableCell>
                            <TableCell className="text-center">
                              {course.capacity || "-"}
                            </TableCell>
                            <TableCell className="text-right">
                              {course.capacity ? (
                                <span
                                  className={
                                    utilization > 90
                                      ? "text-orange-600 font-medium"
                                      : utilization > 100
                                      ? "text-destructive font-medium"
                                      : "text-muted-foreground"
                                  }
                                >
                                  {utilization.toFixed(0)}%
                                </span>
                              ) : (
                                "-"
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Execution Details */}
      {data.execution_time_ms && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Execution Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Total Time:</span>
                <span className="ml-2 font-medium">
                  {(data.execution_time_ms / 1000).toFixed(2)}s
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg. per Level:</span>
                <span className="ml-2 font-medium">
                  {(data.execution_time_ms / 1000 / data.levels.length).toFixed(2)}s
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
