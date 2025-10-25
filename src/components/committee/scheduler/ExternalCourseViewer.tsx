/**
 * ExternalCourseViewer Component
 * Display external (non-SWE) courses as read-only
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Search, Info, Building2, BookOpen, ChevronDown, ChevronRight } from "lucide-react";
import type { SchedulerCourse } from "@/types/scheduler";

interface ExternalCourseViewerProps {
  termCode: string;
}

export function ExternalCourseViewer({
  termCode,
}: ExternalCourseViewerProps): React.ReactElement {
  const [courses, setCourses] = useState<SchedulerCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchExternalCourses();
  }, [termCode]);

  const toggleRowExpansion = (courseCode: string): void => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseCode)) {
        newSet.delete(courseCode);
      } else {
        newSet.add(courseCode);
      }
      return newSet;
    });
  };

  const fetchExternalCourses = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/committee/scheduler/courses?term_code=${termCode}&include_sections=false`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch courses");
      }

      const data = await response.json();
      
      // Filter for external (non-SWE) courses
      const externalCourses = (data.data || [])
        .filter((c: { is_swe_managed: boolean }) => !c.is_swe_managed);
      
      setCourses(externalCourses);
    } catch (err) {
      console.error("Error fetching external courses:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch external courses"
      );
    } finally {
      setLoading(false);
    }
  };

  // Get unique departments
  const departments = React.useMemo(() => {
    const depts = new Set(courses.map((c) => c.department));
    return Array.from(depts).sort();
  }, [courses]);

  // Filter courses
  const filteredCourses = React.useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment =
        departmentFilter === "all" || course.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [courses, searchTerm, departmentFilter]);

  // Group courses by department
  const coursesByDepartment = React.useMemo(() => {
    const groups: Record<string, SchedulerCourse[]> = {};
    
    filteredCourses.forEach((course) => {
      if (!groups[course.department]) {
        groups[course.department] = [];
      }
      groups[course.department].push(course);
    });

    return groups;
  }, [filteredCourses]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                External Courses
              </CardTitle>
              <CardDescription>
                View courses from partner departments (read-only)
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              These courses are managed by other departments and are displayed for
              reference only. Click on rows with descriptions to view more details.
              Prerequisites are shown for each course.
            </AlertDescription>
          </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search external courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Showing {filteredCourses.length} of {courses.length} external courses
          </p>
          <p>{departments.length} departments</p>
        </div>

        {/* Courses grouped by department */}
        {Object.keys(coursesByDepartment).length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No external courses found</p>
            {searchTerm && (
              <p className="text-sm mt-2">Try adjusting your search filters</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(coursesByDepartment)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([department, deptCourses]) => (
                <div key={department} className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">{department}</h3>
                    <Badge variant="secondary">{deptCourses.length} courses</Badge>
                  </div>

                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-12"></TableHead>
                          <TableHead>Course Code</TableHead>
                          <TableHead>Course Name</TableHead>
                          <TableHead className="text-center">Level</TableHead>
                          <TableHead className="text-center">Credits</TableHead>
                          <TableHead>Prerequisites</TableHead>
                          <TableHead className="text-center">Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {deptCourses.map((course) => {
                          const isExpanded = expandedRows.has(course.code);
                          const hasDescription = course.description && course.description.trim().length > 0;
                          
                          return (
                            <React.Fragment key={course.code}>
                              <TableRow
                                className={hasDescription ? "cursor-pointer hover:bg-muted/50" : ""}
                                onClick={() => hasDescription && toggleRowExpansion(course.code)}
                              >
                                <TableCell>
                                  {hasDescription && (
                                    <button
                                      type="button"
                                      className="p-1 hover:bg-accent rounded"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleRowExpansion(course.code);
                                      }}
                                    >
                                      {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </button>
                                  )}
                                </TableCell>
                                <TableCell className="font-medium">
                                  {course.code}
                                </TableCell>
                                <TableCell>{course.name}</TableCell>
                                <TableCell className="text-center">
                                  {course.level || "-"}
                                </TableCell>
                                <TableCell className="text-center">
                                  {course.credits}
                                </TableCell>
                                <TableCell>
                                  {course.prerequisites && course.prerequisites.length > 0 ? (
                                    <div className="flex flex-wrap gap-1">
                                      {course.prerequisites.map((prereq, idx) => (
                                        <Badge
                                          key={idx}
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {prereq}
                                        </Badge>
                                      ))}
                                    </div>
                                  ) : (
                                    <span className="text-muted-foreground text-sm">None</span>
                                  )}
                                </TableCell>
                                <TableCell className="text-center">
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
                              </TableRow>
                              {isExpanded && hasDescription && (
                                <TableRow>
                                  <TableCell colSpan={7} className="bg-muted/30">
                                    <div className="py-3 px-2">
                                      <p className="text-sm text-muted-foreground font-medium mb-1">
                                        Course Description:
                                      </p>
                                      <p className="text-sm">{course.description}</p>
                                    </div>
                                  </TableCell>
                                </TableRow>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Summary Stats */}
        {courses.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-2xl font-bold">{courses.length}</p>
              <p className="text-xs text-muted-foreground">Total Courses</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{departments.length}</p>
              <p className="text-xs text-muted-foreground">Departments</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {courses.filter((c) => c.type === "REQUIRED").length}
              </p>
              <p className="text-xs text-muted-foreground">Required</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {courses.filter((c) => c.type === "ELECTIVE").length}
              </p>
              <p className="text-xs text-muted-foreground">Electives</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </TooltipProvider>
  );
}

