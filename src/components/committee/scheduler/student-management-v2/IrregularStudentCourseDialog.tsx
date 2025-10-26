"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, AlertTriangle } from "lucide-react";
import { MockCourse } from "@/types/scheduler-mock";

interface IrregularStudentCourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentName: string;
  studentNumber: string;
  onSave: (selectedCourses: string[], externalCourses: string[]) => void;
  sweCourses: MockCourse[];
  initialSelectedCourses?: string[];
}

export function IrregularStudentCourseDialog({
  open,
  onOpenChange,
  studentName,
  studentNumber,
  onSave,
  sweCourses,
  initialSelectedCourses = [],
}: IrregularStudentCourseDialogProps) {
  const [selectedSweCourses, setSelectedSweCourses] = useState<string[]>(
    initialSelectedCourses.filter((code) =>
      sweCourses.some((c) => c.course_code === code)
    )
  );
  const [externalCourses, setExternalCourses] = useState<string[]>(
    initialSelectedCourses.filter(
      (code) => !sweCourses.some((c) => c.course_code === code)
    )
  );
  const [newExternalCourse, setNewExternalCourse] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSweCourses = sweCourses.filter(
    (course) =>
      course.course_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.course_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleSweCourse = (courseCode: string) => {
    setSelectedSweCourses((prev) =>
      prev.includes(courseCode)
        ? prev.filter((c) => c !== courseCode)
        : [...prev, courseCode]
    );
  };

  const handleAddExternalCourse = () => {
    const trimmed = newExternalCourse.trim().toUpperCase();
    if (trimmed && !externalCourses.includes(trimmed)) {
      setExternalCourses((prev) => [...prev, trimmed]);
      setNewExternalCourse("");
    }
  };

  const handleRemoveExternalCourse = (courseCode: string) => {
    setExternalCourses((prev) => prev.filter((c) => c !== courseCode));
  };

  const handleSave = () => {
    onSave(selectedSweCourses, externalCourses);
    onOpenChange(false);
  };

  const totalSelected = selectedSweCourses.length + externalCourses.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Required Courses - Irregular Student</DialogTitle>
          <DialogDescription>
            Select courses required for {studentName} ({studentNumber})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alert */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-900 mb-1">
                  Course Conflict Prevention
                </p>
                <p className="text-sm text-orange-700">
                  Selected courses will be checked for conflicts during schedule
                  generation. Include both SWE-managed and external department
                  courses.
                </p>
              </div>
            </div>
          </div>

          {/* Selected Count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Total selected courses
            </p>
            <Badge variant={totalSelected > 0 ? "default" : "secondary"}>
              {totalSelected} courses
            </Badge>
          </div>

          {/* Tabs for SWE and External */}
          <Tabs defaultValue="swe" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="swe">
                SWE Courses{" "}
                {selectedSweCourses.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {selectedSweCourses.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="external">
                External Courses{" "}
                {externalCourses.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {externalCourses.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="swe" className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search SWE courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Course List */}
              <ScrollArea className="h-[300px] border rounded-lg">
                <div className="p-4 space-y-2">
                  {filteredSweCourses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No courses found
                    </p>
                  ) : (
                    filteredSweCourses.map((course) => (
                      <div
                        key={course.course_code}
                        className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleToggleSweCourse(course.course_code)}
                      >
                        <Checkbox
                          checked={selectedSweCourses.includes(
                            course.course_code
                          )}
                          onCheckedChange={() =>
                            handleToggleSweCourse(course.course_code)
                          }
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{course.course_code}</p>
                            <Badge variant="outline" className="text-xs">
                              Level {course.level}
                            </Badge>
                            <Badge
                              variant="secondary"
                              className="text-xs"
                            >
                              {course.credits} CR
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {course.course_name}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="external" className="space-y-4">
              {/* Add External Course */}
              <div className="flex gap-2">
                <Input
                  placeholder="Enter external course code (e.g., MATH201)"
                  value={newExternalCourse}
                  onChange={(e) => setNewExternalCourse(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleAddExternalCourse();
                    }
                  }}
                />
                <Button onClick={handleAddExternalCourse} type="button">
                  Add
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                Add courses from other departments (e.g., MATH, PHYS, CHEM)
              </p>

              {/* External Courses List */}
              <ScrollArea className="h-[250px] border rounded-lg">
                <div className="p-4">
                  {externalCourses.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No external courses added
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {externalCourses.map((courseCode) => (
                        <div
                          key={courseCode}
                          className="flex items-center justify-between p-3 rounded-lg border bg-gray-50"
                        >
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{courseCode}</Badge>
                            <span className="text-sm text-muted-foreground">
                              External Department
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveExternalCourse(courseCode)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={totalSelected === 0}>
            Save Courses ({totalSelected})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

