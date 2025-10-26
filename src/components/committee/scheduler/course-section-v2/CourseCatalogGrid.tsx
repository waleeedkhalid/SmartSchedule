"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BookOpen,
  Plus,
  Edit,
  Copy,
  Trash2,
  Search,
  Filter,
  Users,
} from "lucide-react";
import { MockCourse } from "@/types/scheduler-mock";

interface CourseCatalogGridProps {
  courses: MockCourse[];
  onAddCourse?: () => void;
  onEditCourse?: (courseCode: string) => void;
  onDuplicateCourse?: (courseCode: string) => void;
  onDeleteCourse?: (courseCode: string) => void;
  onManageSections?: (courseCode: string) => void;
}

export function CourseCatalogGrid({
  courses,
  onAddCourse,
  onEditCourse,
  onDuplicateCourse,
  onDeleteCourse,
  onManageSections,
}: CourseCatalogGridProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Get unique departments
  const departments = useMemo(() => {
    const depts = Array.from(new Set(courses.map((c) => c.department)));
    return depts.sort();
  }, [courses]);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        searchQuery === "" ||
        course.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.course_code.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel =
        levelFilter === "all" || course.level === parseInt(levelFilter);

      const matchesType = typeFilter === "all" || course.type === typeFilter;

      const matchesDepartment =
        departmentFilter === "all" || course.department === departmentFilter;

      return matchesSearch && matchesLevel && matchesType && matchesDepartment;
    });
  }, [courses, searchQuery, levelFilter, typeFilter, departmentFilter]);

  const getCourseTypeColor = (type: string) => {
    switch (type) {
      case "CORE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "REQUIRED":
        return "bg-green-100 text-green-800 border-green-200";
      case "ELECTIVE":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Course Catalog</h2>
          <p className="text-muted-foreground">
            Manage courses and their sections
          </p>
        </div>
        <Button onClick={onAddCourse}>
          <Plus className="h-4 w-4 mr-2" />
          Add Course
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Level Filter */}
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="1">Level 1</SelectItem>
                <SelectItem value="2">Level 2</SelectItem>
                <SelectItem value="3">Level 3</SelectItem>
                <SelectItem value="4">Level 4</SelectItem>
              </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="CORE">Core</SelectItem>
                <SelectItem value="REQUIRED">Required</SelectItem>
                <SelectItem value="ELECTIVE">Elective</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results count */}
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </CardContent>
      </Card>

      {/* Course Grid */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses found</h3>
            <p className="text-muted-foreground text-center">
              Try adjusting your filters or add a new course to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card
              key={course.course_code}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">
                      {course.course_code}
                    </CardTitle>
                    <p className="text-sm font-medium">{course.course_name}</p>
                  </div>
                  <Badge className={getCourseTypeColor(course.type)}>
                    {course.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Course Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Level:</span>
                    <span className="ml-2 font-medium">{course.level}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Credits:</span>
                    <span className="ml-2 font-medium">{course.credits}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Department:</span>
                    <span className="ml-2 font-medium">{course.department}</span>
                  </div>
                </div>

                {/* Prerequisites */}
                {course.prerequisites && course.prerequisites.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Prerequisites:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {course.prerequisites.map((prereq) => (
                        <Badge key={prereq} variant="outline" className="text-xs">
                          {prereq}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Max Students */}
                {course.max_students && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Max:</span>
                    <span className="font-medium">{course.max_students}</span>
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant={course.is_active ? "default" : "secondary"}>
                    {course.is_active ? "Active" : "Inactive"}
                  </Badge>
                  {course.is_swe_managed && (
                    <Badge variant="outline">SWE Managed</Badge>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onManageSections?.(course.course_code)}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    Sections
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEditCourse?.(course.course_code)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDuplicateCourse?.(course.course_code)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteCourse?.(course.course_code)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

