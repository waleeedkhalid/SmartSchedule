"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export interface CourseEditorProps {
  courses: Array<{
    code: string;
    name: string;
    level: number;
    credits: number;
    sectionsCount: number;
  }>;
  onGenerateSchedules: (selectedCourses: string[], level: number) => void;
  isGenerating?: boolean;
}

export function CourseEditor({
  courses,
  onGenerateSchedules,
  isGenerating = false,
}: CourseEditorProps): React.ReactElement {
  const [selectedLevel, setSelectedLevel] = useState<number>(4);
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(
    new Set()
  );

  // Get unique levels
  const levels = Array.from(new Set(courses.map((c) => c.level))).sort();

  // Filter courses by selected level
  const filteredCourses = courses.filter((c) => c.level === selectedLevel);

  const handleCourseToggle = (courseCode: string) => {
    const newSelected = new Set(selectedCourses);
    if (newSelected.has(courseCode)) {
      newSelected.delete(courseCode);
    } else {
      newSelected.add(courseCode);
    }
    setSelectedCourses(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedCourses.size === filteredCourses.length) {
      setSelectedCourses(new Set());
    } else {
      setSelectedCourses(new Set(filteredCourses.map((c) => c.code)));
    }
  };

  const handleGenerate = () => {
    onGenerateSchedules(Array.from(selectedCourses), selectedLevel);
  };

  const totalCredits = filteredCourses
    .filter((c) => selectedCourses.has(c.code))
    .reduce((sum, c) => sum + c.credits, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Course Selection for Schedule Generation</CardTitle>
        <p className="text-sm text-muted-foreground">
          Select courses to generate all possible conflict-free schedules
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Level Selection */}
        <div className="flex items-center gap-4">
          <Label htmlFor="level-select" className="whitespace-nowrap">
            Student Level:
          </Label>
          <Select
            value={selectedLevel.toString()}
            onValueChange={(val) => {
              setSelectedLevel(parseInt(val));
              setSelectedCourses(new Set()); // Clear selection when changing level
            }}
          >
            <SelectTrigger id="level-select" className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {levels.map((level) => (
                <SelectItem key={level} value={level.toString()}>
                  Level {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary">
              {selectedCourses.size} courses selected
            </Badge>
            <Badge variant="outline">{totalCredits} credits</Badge>
          </div>
        </div>

        {/* Course List */}
        <div className="border rounded-lg">
          <div className="p-3 border-b bg-muted/50 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredCourses.length === 0}
            >
              {selectedCourses.size === filteredCourses.length
                ? "Deselect All"
                : "Select All"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {filteredCourses.length} courses available at Level{" "}
              {selectedLevel}
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {filteredCourses.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                No courses available for Level {selectedLevel}
              </div>
            ) : (
              <div className="divide-y">
                {filteredCourses.map((course) => (
                  <div
                    key={course.code}
                    className="p-3 hover:bg-muted/50 flex items-center gap-3"
                  >
                    <Checkbox
                      id={`course-${course.code}`}
                      checked={selectedCourses.has(course.code)}
                      onChange={() => handleCourseToggle(course.code)}
                    />
                    <Label
                      htmlFor={`course-${course.code}`}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{course.code}</div>
                      <div className="text-sm text-muted-foreground">
                        {course.name}
                      </div>
                    </Label>
                    <div className="flex gap-2">
                      <Badge variant="outline">{course.credits} CR</Badge>
                      <Badge variant="secondary">
                        {course.sectionsCount} sections
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleGenerate}
            disabled={selectedCourses.size === 0 || isGenerating}
            size="lg"
          >
            {isGenerating ? "Generating..." : "Generate Schedules"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
