// Selection Panel Component - Shows selected courses with ranking
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  GripVertical,
  X,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectedCourse {
  code: string;
  name: string;
  credits: number;
  category: string;
  packageId: string;
  priority: number; // 1 = highest
}

export interface PackageRequirement {
  packageId: string;
  packageLabel: string;
  minCredits: number;
  maxCredits: number;
  currentCredits: number;
  isComplete: boolean;
}

interface SelectionPanelProps {
  selectedCourses: SelectedCourse[];
  packageRequirements: PackageRequirement[];
  maxSelections: number;
  onRemove: (courseCode: string) => void;
  onMoveUp: (courseCode: string) => void;
  onMoveDown: (courseCode: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
  className?: string;
}

export function SelectionPanel({
  selectedCourses,
  packageRequirements,
  maxSelections,
  onRemove,
  onMoveUp,
  onMoveDown,
  onSubmit,
  canSubmit,
  className,
}: SelectionPanelProps) {
  const totalCredits = selectedCourses.reduce(
    (sum, course) => sum + course.credits,
    0
  );
  const selectionProgress = (selectedCourses.length / maxSelections) * 100;

  return (
    <Card className={cn("h-fit sticky top-4", className)}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Your Selections</span>
          <Badge
            variant={selectedCourses.length === 0 ? "secondary" : "default"}
          >
            {selectedCourses.length}/{maxSelections}
          </Badge>
        </CardTitle>
        <CardDescription>Select 1-6 courses total (across all packages)</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Selection Progress</span>
            <span>{Math.round(selectionProgress)}%</span>
          </div>
          <Progress value={selectionProgress} className="h-2" />
        </div>

        {/* Package Requirements Summary */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Package Requirements
          </p>
          <div className="space-y-1.5">
            {packageRequirements.map((pkg) => (
              <div
                key={pkg.packageId}
                className="flex items-center justify-between text-xs p-2 rounded-md bg-muted/50"
              >
                <div className="flex items-center gap-2">
                  {pkg.isComplete ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
                  )}
                  <span className="font-medium truncate max-w-[180px]">
                    {pkg.packageLabel}
                  </span>
                </div>
                <Badge
                  variant={pkg.isComplete ? "default" : "secondary"}
                  className="text-xs"
                >
                  {pkg.currentCredits}/{pkg.minCredits}h
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Selected Courses */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <p className="text-xs font-medium text-muted-foreground">
              Ranked Courses
            </p>
            <p className="text-xs text-muted-foreground">
              {totalCredits} credits total
            </p>
          </div>

          {selectedCourses.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              <p>No courses selected yet</p>
              <p className="text-xs mt-1">
                Start by selecting courses from the list
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[400px] pr-3">
              <div className="space-y-2">
                {selectedCourses
                  .sort((a, b) => a.priority - b.priority)
                  .map((course, index) => (
                    <SelectedCourseItem
                      key={course.code}
                      course={course}
                      isFirst={index === 0}
                      isLast={index === selectedCourses.length - 1}
                      onRemove={onRemove}
                      onMoveUp={onMoveUp}
                      onMoveDown={onMoveDown}
                    />
                  ))}
              </div>
            </ScrollArea>
          )}
        </div>

        {/* Submit Button */}
        <div className="space-y-2 pt-2 border-t">
          <Button
            onClick={onSubmit}
            disabled={!canSubmit || selectedCourses.length === 0}
            className="w-full"
            size="lg"
          >
            Review & Submit
          </Button>
          {selectedCourses.length > 0 && !packageRequirements.every((pkg) => pkg.isComplete) && (
            <p className="text-xs text-center text-yellow-600 dark:text-yellow-400">
              ⚠️ Some package requirements not met. You can still submit with eligible courses.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface SelectedCourseItemProps {
  course: SelectedCourse;
  isFirst: boolean;
  isLast: boolean;
  onRemove: (courseCode: string) => void;
  onMoveUp: (courseCode: string) => void;
  onMoveDown: (courseCode: string) => void;
}

function SelectedCourseItem({
  course,
  isFirst,
  isLast,
  onRemove,
  onMoveUp,
  onMoveDown,
}: SelectedCourseItemProps) {
  return (
    <div className="group flex items-start gap-2 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      {/* Drag Handle / Priority Number */}
      <div className="flex flex-col items-center gap-1 pt-1">
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
        <Badge
          variant="outline"
          className="text-xs h-5 w-5 flex items-center justify-center p-0"
        >
          {course.priority}
        </Badge>
      </div>

      {/* Course Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{course.code}</p>
            <p className="text-xs text-muted-foreground truncate">
              {course.name}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="secondary" className="text-xs">
                {course.credits}h
              </Badge>
              <Badge
                variant="outline"
                className="text-xs truncate max-w-[100px]"
              >
                {course.category}
              </Badge>
            </div>
          </div>

          {/* Remove Button */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onRemove(course.code)}
            className="h-6 w-6 p-0 flex-shrink-0"
            aria-label={`Remove ${course.code}`}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Reorder Buttons */}
      <div className="flex flex-col gap-0.5 flex-shrink-0">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onMoveUp(course.code)}
          disabled={isFirst}
          className="h-5 w-5 p-0"
          aria-label="Move up"
        >
          <ChevronUp className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onMoveDown(course.code)}
          disabled={isLast}
          className="h-5 w-5 p-0"
          aria-label="Move down"
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
