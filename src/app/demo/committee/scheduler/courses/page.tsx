"use client";
import React, { useState } from "react";
import * as committee from "@/components/committee";
import {
  PersonaNavigation,
  PageContainer,
  committeeNavItems,
} from "@/components/shared";
import { getAllCourses } from "@/lib/local-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookOpen, Calendar, Users } from "lucide-react";

export default function Page(): React.ReactElement {
  const [courses] = useState(getAllCourses());
  const sweCourses = courses.filter((c) => c.department === "SWE");
  const externalCourses = courses.filter((c) => c.department !== "SWE");

  const handleConstraintSubmit = async (data: {
    department: string;
    constraint: string;
    courseCode?: string;
  }) => {
    console.log("Constraint submitted:", data);
    // This will handle external department constraints
  };

  return (
    <>
      <PersonaNavigation
        personaName="Scheduling Committee"
        navItems={committeeNavItems}
      />

      <PageContainer
        title="Courses Editor"
        description="Manage SWE department courses and view external department course offerings"
      >
        <div className="space-y-6">
          {/* SWE Courses Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                SWE Department Courses
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {sweCourses.length} courses managed by the SWE department
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sections</TableHead>
                    <TableHead>Exams</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sweCourses.map((course) => {
                    const examCount = Object.keys(course.exams).filter(
                      (key) => course.exams[key as keyof typeof course.exams]
                    ).length;

                    return (
                      <TableRow key={course.code}>
                        <TableCell className="font-mono font-semibold">
                          {course.code}
                        </TableCell>
                        <TableCell>{course.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Level {course.level}</Badge>
                        </TableCell>
                        <TableCell>{course.credits} CR</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              course.type === "REQUIRED"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {course.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{course.sections.length}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{examCount}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {sweCourses.length === 0 && (
                <div className="py-8 text-center text-muted-foreground">
                  No SWE courses found
                </div>
              )}
            </CardContent>
          </Card>

          {/* External Courses Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                External Department Courses
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                {externalCourses.length} courses from other departments (view
                only)
              </p>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> External department courses (MATH, PHY,
                  CSC, etc.) are shown for reference. To add constraints or
                  notes about external courses, use the form below.
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Sections</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {externalCourses.slice(0, 10).map((course) => (
                    <TableRow key={course.code}>
                      <TableCell className="font-mono font-semibold">
                        {course.code}
                      </TableCell>
                      <TableCell>{course.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{course.department}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">Level {course.level}</Badge>
                      </TableCell>
                      <TableCell>{course.credits} CR</TableCell>
                      <TableCell>{course.sections.length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {externalCourses.length > 10 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Showing 10 of {externalCourses.length} courses
                </div>
              )}
            </CardContent>
          </Card>

          {/* External Constraints Form */}
          <committee.scheduler.coursesEditor.CoursesEditor
            onSubmit={handleConstraintSubmit}
            title="External Department Constraints"
            subtitle="Record constraints from external departments that affect SWE scheduling"
          />
        </div>
      </PageContainer>
    </>
  );
}
