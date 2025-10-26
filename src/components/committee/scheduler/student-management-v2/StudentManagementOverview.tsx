"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  GraduationCap,
  AlertCircle,
} from "lucide-react";
import { MockStudentEnrollmentSummary } from "@/types/scheduler-mock";

interface StudentManagementOverviewProps {
  summary: MockStudentEnrollmentSummary;
  termName: string;
}

export function StudentManagementOverview({
  summary,
  termName,
}: StudentManagementOverviewProps) {
  const enrolledStudents = summary.fully_enrolled + summary.partially_enrolled;
  const enrollmentRate = (enrolledStudents / summary.total_students) * 100;
  const irregularRate = (summary.irregular_students / summary.total_students) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Student Management</h2>
          <p className="text-muted-foreground">
            Overview and statistics for {termName}
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {summary.total_students} Total Students
        </Badge>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total_students}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.regular_students} regular, {summary.irregular_students} irregular
            </p>
          </CardContent>
        </Card>

        {/* Enrollment Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Students</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledStudents}</div>
            <Progress value={enrollmentRate} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {enrollmentRate.toFixed(1)}% enrollment rate
            </p>
          </CardContent>
        </Card>

        {/* Irregular Students */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Irregular Students</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {summary.irregular_students}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {irregularRate.toFixed(1)}% of total students
            </p>
          </CardContent>
        </Card>

        {/* Fully Enrolled */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fully Enrolled</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.fully_enrolled}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((summary.fully_enrolled / summary.total_students) * 100).toFixed(1)}% of students
            </p>
          </CardContent>
        </Card>

        {/* Partially Enrolled */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Partially Enrolled</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.partially_enrolled}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Need additional courses
            </p>
          </CardContent>
        </Card>

        {/* Not Enrolled */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Enrolled</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {summary.not_enrolled}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Average Credits Card */}
      <Card>
        <CardHeader>
          <CardTitle>Average Course Load</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {summary.avg_credits_per_student.toFixed(1)}
            </span>
            <span className="text-muted-foreground">credits per student</span>
          </div>
          <Progress 
            value={(summary.avg_credits_per_student / 21) * 100} 
            className="mt-4" 
          />
          <p className="text-xs text-muted-foreground mt-2">
            Target: 18-21 credits per semester
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

