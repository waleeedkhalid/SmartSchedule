/**
 * CourseList Component
 * Display courses in table/card view with filters and section management
 */

"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { 
  Search, 
  Plus, 
  ChevronDown, 
  ChevronUp,
  LayoutGrid,
  LayoutList,
  Settings,
  Users,
} from "lucide-react";
import { SectionManager } from "./SectionManager";
import { CourseForm } from "./CourseForm";
import type { CourseWithSections } from "@/types/scheduler";

interface CourseListProps {
  courses: CourseWithSections[];
  termCode: string;
  termName: string;
  onCourseUpdated: () => void;
}

export function CourseList({
  courses,
  termCode,
  termName,
  onCourseUpdated,
}: CourseListProps): React.ReactElement {
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [expandedCourses, setExpandedCourses] = useState<Set<string>>(
    new Set()
  );
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [showCourseForm, setShowCourseForm] = useState(false);

  // Get unique levels from courses
  const uniqueLevels = useMemo(() => {
    const levels = new Set(
      courses
        .map((c) => c.course.level)
        .filter((l): l is number => l !== null)
    );
    return Array.from(levels).sort();
  }, [courses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((courseWithSections) => {
      const course = courseWithSections.course;
      const matchesSearch =
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel =
        levelFilter === "all" ||
        course.level?.toString() === levelFilter;

      const matchesType =
        typeFilter === "all" || course.type === typeFilter;

      return matchesSearch && matchesLevel && matchesType;
    });
  }, [courses, searchTerm, levelFilter, typeFilter]);

  const toggleCourseExpansion = (courseCode: string): void => {
    const newExpanded = new Set(expandedCourses);
    if (newExpanded.has(courseCode)) {
      newExpanded.delete(courseCode);
    } else {
      newExpanded.add(courseCode);
    }
    setExpandedCourses(newExpanded);
  };

  const handleManageSections = (courseCode: string): void => {
    setSelectedCourse(courseCode);
  };

  const handleCloseSectionManager = (): void => {
    setSelectedCourse(null);
    onCourseUpdated();
  };

  const getCourseStats = (courseWithSections: CourseWithSections) => {
    const totalCapacity = courseWithSections.sections.reduce(
      (sum, section) => sum + section.capacity,
      0
    );
    const totalEnrolled = courseWithSections.total_enrolled;
    const utilizationRate =
      totalCapacity > 0 ? (totalEnrolled / totalCapacity) * 100 : 0;

    return {
      totalCapacity,
      totalEnrolled,
      utilizationRate,
      sectionsCount: courseWithSections.sections.length,
    };
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Course Catalog</CardTitle>
              <CardDescription>
                Manage courses and sections for {termName}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setViewMode(viewMode === "table" ? "cards" : "table")
                }
              >
                {viewMode === "table" ? (
                  <LayoutGrid className="h-4 w-4" />
                ) : (
                  <LayoutList className="h-4 w-4" />
                )}
              </Button>
              <Button onClick={() => setShowCourseForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Course
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                {uniqueLevels.map((level) => (
                  <SelectItem key={level} value={level.toString()}>
                    Level {level}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="REQUIRED">Required</SelectItem>
                <SelectItem value="ELECTIVE">Elective</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {filteredCourses.length} of {courses.length} courses
            </p>
          </div>

          {/* Table View */}
          {viewMode === "table" && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Name</TableHead>
                    <TableHead className="text-center">Level</TableHead>
                    <TableHead className="text-center">Credits</TableHead>
                    <TableHead className="text-center">Type</TableHead>
                    <TableHead className="text-center">Sections</TableHead>
                    <TableHead className="text-center">Enrollment</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <p className="text-muted-foreground">No courses found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCourses.map((courseWithSections) => {
                      const course = courseWithSections.course;
                      const stats = getCourseStats(courseWithSections);
                      const isExpanded = expandedCourses.has(course.code);

                      return (
                        <React.Fragment key={course.code}>
                          <TableRow className="hover:bg-muted/50">
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
                            <TableCell className="text-center">
                              {stats.sectionsCount}
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-sm">
                                  {stats.totalEnrolled} / {stats.totalCapacity}
                                </span>
                                {stats.totalCapacity > 0 && (
                                  <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-primary transition-all"
                                      style={{
                                        width: `${Math.min(stats.utilizationRate, 100)}%`,
                                      }}
                                    />
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleManageSections(course.code)}
                                >
                                  <Settings className="h-4 w-4 mr-1" />
                                  Manage
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    toggleCourseExpansion(course.code)
                                  }
                                >
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>

                          {/* Expanded Section Details */}
                          {isExpanded && (
                            <TableRow>
                              <TableCell colSpan={8} className="bg-muted/30 p-4">
                                <div className="space-y-2">
                                  <h4 className="font-medium text-sm">
                                    Sections ({courseWithSections.sections.length})
                                  </h4>
                                  {courseWithSections.sections.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                      No sections created yet
                                    </p>
                                  ) : (
                                    <div className="grid gap-2">
                                      {courseWithSections.sections.map(
                                        (section) => (
                                          <div
                                            key={section.id}
                                            className="flex items-center justify-between bg-background p-3 rounded-lg border text-sm"
                                          >
                                            <div className="flex items-center gap-4">
                                              <span className="font-medium">
                                                {section.id}
                                              </span>
                                              <span className="text-muted-foreground">
                                                {section.instructor_name || "No instructor"}
                                              </span>
                                              <span className="text-muted-foreground">
                                                Room: {section.room_number || "TBA"}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                              <div className="flex items-center gap-1 text-muted-foreground">
                                                <Users className="h-4 w-4" />
                                                <span>
                                                  {section.enrolled_count || 0} /{" "}
                                                  {section.capacity}
                                                </span>
                                              </div>
                                              <Badge variant="outline">
                                                {section.time_slots?.length || 0}{" "}
                                                time slots
                                              </Badge>
                                            </div>
                                          </div>
                                        )
                                      )}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Card View */}
          {viewMode === "cards" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-muted-foreground">No courses found</p>
                </div>
              ) : (
                filteredCourses.map((courseWithSections) => {
                  const course = courseWithSections.course;
                  const stats = getCourseStats(courseWithSections);

                  return (
                    <Card
                      key={course.code}
                      className="hover:shadow-lg transition-all"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">
                              {course.code}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {course.name}
                            </CardDescription>
                          </div>
                          <Badge
                            variant={
                              course.type === "REQUIRED"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {course.type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">Level</p>
                            <p className="font-medium">
                              {course.level || "-"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Credits</p>
                            <p className="font-medium">{course.credits}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Sections</p>
                            <p className="font-medium">
                              {stats.sectionsCount}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Enrollment
                            </p>
                            <p className="font-medium">
                              {stats.totalEnrolled} / {stats.totalCapacity}
                            </p>
                          </div>
                        </div>

                        {stats.totalCapacity > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>Utilization</span>
                              <span>{stats.utilizationRate.toFixed(0)}%</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{
                                  width: `${Math.min(stats.utilizationRate, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        )}

                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => handleManageSections(course.code)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          Manage Sections
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Section Manager Dialog */}
      {selectedCourse && (
        <SectionManager
          courseCode={selectedCourse}
          termCode={termCode}
          onClose={handleCloseSectionManager}
        />
      )}

      {/* Course Form Dialog */}
      {showCourseForm && (
        <CourseForm
          termCode={termCode}
          onClose={() => {
            setShowCourseForm(false);
            onCourseUpdated();
          }}
        />
      )}
    </>
  );
}

