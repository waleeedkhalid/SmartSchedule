/**
 * Level Summary View Component
 * Display enrollment statistics grouped by student level
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
import { Users, BookOpen, Star } from "lucide-react";
import type { LevelEnrollmentSummary } from "@/types/scheduler";

interface LevelSummaryViewProps {
  data: LevelEnrollmentSummary[];
  termCode: string;
  termName: string;
}

export function LevelSummaryView({
  data,
  termCode,
  termName,
}: LevelSummaryViewProps) {
  const totalStudents = data.reduce((sum, item) => sum + item.student_count, 0);
  const totalRequired = data.reduce((sum, item) => sum + item.required_courses, 0);
  const totalElectives = data.reduce((sum, item) => sum + item.elective_selections, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment by Level</CardTitle>
        <CardDescription>
          Student distribution across academic levels for {termName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-primary" />
                <div>
                  <div className="text-2xl font-bold">{totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{totalRequired}</div>
                  <p className="text-xs text-muted-foreground">Required Courses</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-yellow-600" />
                <div>
                  <div className="text-2xl font-bold">{totalElectives}</div>
                  <p className="text-xs text-muted-foreground">Elective Selections</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Level Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Level</TableHead>
                <TableHead className="text-center">Students</TableHead>
                <TableHead className="text-center">Required Courses</TableHead>
                <TableHead className="text-center">Elective Selections</TableHead>
                <TableHead className="text-right">Distribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <p className="text-muted-foreground">No level data available</p>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item) => {
                  const percentage = totalStudents > 0 
                    ? (item.student_count / totalStudents) * 100 
                    : 0;

                  return (
                    <TableRow key={item.level} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">Level {item.level}</Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-medium">{item.student_count}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{item.required_courses}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{item.elective_selections}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-sm font-medium">
                            {percentage.toFixed(1)}%
                          </span>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all"
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

        {/* Visual Distribution */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold">Student Distribution</h3>
          <div className="space-y-2">
            {data.map((item) => {
              const percentage = totalStudents > 0 
                ? (item.student_count / totalStudents) * 100 
                : 0;

              return (
                <div key={item.level} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Level {item.level}</span>
                    <span className="text-muted-foreground">
                      {item.student_count} students ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

