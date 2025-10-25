/**
 * Elective Preferences Summary View
 * Shows student preference data for elective courses
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Info, TrendingUp, Users } from "lucide-react";
import type { StudentEnrollmentData } from "@/types/scheduler";

interface ElectivePreferencesSummaryViewProps {
  data: StudentEnrollmentData[];
  termCode: string;
  termName: string;
}

export function ElectivePreferencesSummaryView({ 
  data, 
  termCode, 
  termName 
}: ElectivePreferencesSummaryViewProps) {
  // Filter only elective courses
  const electiveCourses = data.filter(course => course.course_type === "ELECTIVE");
  
  // Calculate totals
  const totalPreferences = electiveCourses.reduce((sum, course) => {
    const courseTotal = (course.preference_counts || []).reduce(
      (courseSum, pref) => courseSum + pref.student_count, 
      0
    );
    return sum + courseTotal;
  }, 0);

  const coursesWithPreferences = electiveCourses.filter(
    course => course.preference_counts && course.preference_counts.length > 0
  );

  // Sort by total preference count
  const sortedElectives = [...electiveCourses].sort((a, b) => {
    const aTotal = (a.preference_counts || []).reduce(
      (sum, pref) => sum + pref.student_count, 
      0
    );
    const bTotal = (b.preference_counts || []).reduce(
      (sum, pref) => sum + pref.student_count, 
      0
    );
    return bTotal - aTotal;
  });

  if (electiveCourses.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No elective courses found for {termName}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Electives</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{electiveCourses.length}</div>
            <p className="text-xs text-muted-foreground">
              Courses offered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Preferences</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPreferences}</div>
            <p className="text-xs text-muted-foreground">
              Student selections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Popular Courses</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesWithPreferences.length}</div>
            <p className="text-xs text-muted-foreground">
              With student interest
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This shows student preference survey data, not actual enrollments. 
          Students rank their elective preferences (1-6) to help with course planning.
        </AlertDescription>
      </Alert>

      {/* Elective Preferences Table */}
      <Card>
        <CardHeader>
          <CardTitle>Elective Course Preferences</CardTitle>
          <CardDescription>
            Student interest by preference ranking for {termName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead className="text-center">1st Choice</TableHead>
                  <TableHead className="text-center">2nd Choice</TableHead>
                  <TableHead className="text-center">3rd Choice</TableHead>
                  <TableHead className="text-center">4th Choice</TableHead>
                  <TableHead className="text-center">5th Choice</TableHead>
                  <TableHead className="text-center">6th Choice</TableHead>
                  <TableHead className="text-right">Total Interest</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedElectives.map((course) => {
                  const preferences = course.preference_counts || [];
                  const preferenceMap = preferences.reduce(
                    (acc, pref) => {
                      acc[pref.preference_rank] = pref.student_count;
                      return acc;
                    },
                    {} as Record<number, number>
                  );

                  const totalInterest = preferences.reduce(
                    (sum, pref) => sum + pref.student_count,
                    0
                  );

                  const hasPreferences = totalInterest > 0;

                  return (
                    <TableRow key={course.course_code}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{course.course_code}</div>
                          <div className="text-sm text-muted-foreground">
                            {course.course_name}
                          </div>
                        </div>
                      </TableCell>
                      {[1, 2, 3, 4, 5, 6].map((rank) => (
                        <TableCell key={rank} className="text-center">
                          {preferenceMap[rank] ? (
                            <Badge 
                              variant={rank === 1 ? "default" : "secondary"}
                              className="min-w-[2rem]"
                            >
                              {preferenceMap[rank]}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        {hasPreferences ? (
                          <Badge 
                            variant="outline" 
                            className="min-w-[3rem] font-semibold"
                          >
                            {totalInterest} students
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            No preferences
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {sortedElectives.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No elective courses found for this term
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

