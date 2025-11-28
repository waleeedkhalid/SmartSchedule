"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Course } from "@/lib/types";
import {
  BookOpen,
  Clock,
  GraduationCap,
  Award,
  Plus,
  Info
} from "lucide-react";

interface CourseDetailDialogProps {
  course: Course | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (course: Course) => void;
  isAdded?: boolean;
}

export function CourseDetailDialog({
  course,
  open,
  onOpenChange,
  onAdd,
  isAdded = false,
}: CourseDetailDialogProps) {
  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <DialogTitle className="text-xl">{course.code}</DialogTitle>
              <DialogDescription className="mt-1">
                {course.title}
              </DialogDescription>
            </div>
            <Badge
              variant={course.is_elective ? "default" : "secondary"}
              className="flex-shrink-0"
            >
              {course.is_elective ? "Elective" : "Core"}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Course Info Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
              <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-xs text-muted-foreground">Level</p>
                <p className="font-semibold">{course.recommended_level}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
              <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <div>
                <p className="text-xs text-muted-foreground">Credits</p>
                <p className="font-semibold">{course.credits}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 rounded-lg col-span-2">
              <Clock className="h-5 w-5 text-green-600 dark:text-green-400" />
              <div>
                <p className="text-xs text-muted-foreground">Weekly Hours</p>
                <p className="font-semibold">{course.weekly_hours} hours/week</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Description Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Info className="h-4 w-4" />
              Course Information
            </div>
            <p className="text-sm text-muted-foreground">
              This is a Level {course.recommended_level} {course.is_elective ? 'elective' : 'core'} course
              worth {course.credits} credit{course.credits !== 1 ? 's' : ''},
              requiring {course.weekly_hours} hours per week of class time.
            </p>
          </div>

          {course.is_elective && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                💡 <strong>Tip:</strong> Add this course to your preferences list to increase
                your chances of being enrolled. Higher ranked preferences get priority!
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {onAdd && (
          <div className="flex gap-2">
            {isAdded ? (
              <Button className="flex-1" disabled>
                <BookOpen className="mr-2 h-4 w-4" />
                Already Added
              </Button>
            ) : (
              <Button
                className="flex-1"
                onClick={() => {
                  onAdd(course);
                  onOpenChange(false);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Preferences
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

