/**
 * Course Type Summary View Component
 * Display enrollment statistics grouped by course type (Required vs Elective)
 */

"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Star, TrendingUp } from "lucide-react";
import type { CourseTypeEnrollmentSummary } from "@/types/scheduler";

interface CourseTypeSummaryViewProps {
  data: CourseTypeEnrollmentSummary[];
  termCode: string;
  termName: string;
}

export function CourseTypeSummaryView({
  data,
  termCode,
  termName,
}: CourseTypeSummaryViewProps) {
  const totalCourses = data.reduce((sum, item) => sum + item.course_count, 0);
  const totalEnrollments = data.reduce(
    (sum, item) => sum + item.total_enrollments,
    0
  );

  const requiredData = data.find((item) => item.type === "REQUIRED");
  const electiveData = data.find((item) => item.type === "ELECTIVE");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment by Course Type</CardTitle>
        <CardDescription>
          Distribution of enrollments between required and elective courses for {termName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required Courses Card */}
          {requiredData && (
            <Card className="border-2 border-primary/20">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Required Courses</h3>
                      <p className="text-sm text-muted-foreground">
                        Core curriculum courses
                      </p>
                    </div>
                  </div>
                  <Badge variant="default" className="text-lg px-3 py-1">
                    {requiredData.course_count}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Enrollments</p>
                    <p className="text-2xl font-bold">{requiredData.total_enrollments}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg per Course</p>
                    <p className="text-2xl font-bold">{requiredData.avg_students_per_course}</p>
                  </div>
                </div>

                {totalEnrollments > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Share of Total</span>
                      <span className="font-medium">
                        {((requiredData.total_enrollments / totalEnrollments) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(requiredData.total_enrollments / totalEnrollments) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Elective Courses Card */}
          {electiveData && (
            <Card className="border-2 border-yellow-500/20">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-500/10 rounded-lg">
                      <Star className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Elective Courses</h3>
                      <p className="text-sm text-muted-foreground">
                        Optional specialization courses
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {electiveData.course_count}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Enrollments</p>
                    <p className="text-2xl font-bold">{electiveData.total_enrollments}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg per Course</p>
                    <p className="text-2xl font-bold">{electiveData.avg_students_per_course}</p>
                  </div>
                </div>

                {totalEnrollments > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Share of Total</span>
                      <span className="font-medium">
                        {((electiveData.total_enrollments / totalEnrollments) * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 transition-all"
                        style={{
                          width: `${(electiveData.total_enrollments / totalEnrollments) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detailed Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Type</TableHead>
                <TableHead className="text-center">Courses</TableHead>
                <TableHead className="text-center">Total Enrollments</TableHead>
                <TableHead className="text-center">Avg per Course</TableHead>
                <TableHead className="text-right">Share</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground">No data available</p>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => {
                  const percentage = totalEnrollments > 0 
                    ? (item.total_enrollments / totalEnrollments) * 100 
                    : 0;

                  return (
                    <TableRow key={item.type} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {item.type === "REQUIRED" ? (
                            <BookOpen className="h-4 w-4 text-primary" />
                          ) : (
                            <Star className="h-4 w-4 text-yellow-600" />
                          )}
                          <Badge
                            variant={item.type === "REQUIRED" ? "default" : "secondary"}
                          >
                            {item.type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{item.course_count}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="font-medium">{item.total_enrollments}</span>
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{item.avg_students_per_course}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm font-medium">
                            {percentage.toFixed(1)}%
                          </span>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                item.type === "REQUIRED" 
                                  ? "bg-primary" 
                                  : "bg-yellow-500"
                              }`}
                              style={{
                                width: `${percentage}%`,
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Insights */}
        {requiredData && electiveData && (
          <Card className="bg-muted/50">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-3">Insights</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                  <p>
                    <strong>Required courses</strong> have an average of{" "}
                    <strong>{requiredData.avg_students_per_course} students</strong> per
                    course, accounting for{" "}
                    <strong>
                      {((requiredData.total_enrollments / totalEnrollments) * 100).toFixed(1)}%
                    </strong>{" "}
                    of total enrollments.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5" />
                  <p>
                    <strong>Elective courses</strong> average{" "}
                    <strong>{electiveData.avg_students_per_course} students</strong> per
                    course, representing{" "}
                    <strong>
                      {((electiveData.total_enrollments / totalEnrollments) * 100).toFixed(1)}%
                    </strong>{" "}
                    of enrollments.
                  </p>
                </div>
                {requiredData.avg_students_per_course > electiveData.avg_students_per_course && (
                  <div className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-muted-foreground">
                      Required courses have higher average enrollment, indicating core
                      curriculum demand.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}

