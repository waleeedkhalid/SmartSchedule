// Review & Submit Dialog Component
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import { SelectedCourse, PackageRequirement } from "./SelectionPanel";

interface ReviewSubmitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCourses: SelectedCourse[];
  packageRequirements: PackageRequirement[];
  onConfirmSubmit: () => Promise<void>;
}

export function ReviewSubmitDialog({
  open,
  onOpenChange,
  selectedCourses,
  packageRequirements,
  onConfirmSubmit,
}: ReviewSubmitDialogProps) {
  const [confirmChecks, setConfirmChecks] = useState({
    understood: false,
    ranked: false,
    reviewed: false,
  });
  const [submitting, setSubmitting] = useState(false);

  const allChecked =
    confirmChecks.understood && confirmChecks.ranked && confirmChecks.reviewed;
  const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);

  // Group courses by package
  const coursesByPackage = selectedCourses.reduce((acc, course) => {
    if (!acc[course.packageId]) {
      acc[course.packageId] = [];
    }
    acc[course.packageId].push(course);
    return acc;
  }, {} as Record<string, SelectedCourse[]>);

  const handleSubmit = async () => {
    if (!allChecked) return;

    setSubmitting(true);
    try {
      await onConfirmSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!submitting) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset checks when dialog closes
        setConfirmChecks({ understood: false, ranked: false, reviewed: false });
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Review & Submit Your Preferences</DialogTitle>
          <DialogDescription>
            Please review your course selections carefully before submitting.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[50vh] pr-4">
          <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold">{selectedCourses.length}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Total Credits</p>
                <p className="text-2xl font-bold">{totalCredits}</p>
              </div>
            </div>

            {/* Package Requirements Status */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Package Requirements</h4>
              {packageRequirements.map((pkg) => (
                <div
                  key={pkg.packageId}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    {pkg.isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                    )}
                    <span className="text-sm font-medium">
                      {pkg.packageLabel}
                    </span>
                  </div>
                  <Badge variant={pkg.isComplete ? "default" : "secondary"}>
                    {pkg.currentCredits}/{pkg.minCredits} credits
                  </Badge>
                </div>
              ))}
            </div>

            {/* Ranked Course List by Package */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Your Ranked Selections</h4>

              {packageRequirements.map((pkg) => {
                const courses = coursesByPackage[pkg.packageId] || [];
                if (courses.length === 0) return null;

                return (
                  <div key={pkg.packageId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-medium text-muted-foreground">
                        {pkg.packageLabel}
                      </h5>
                      <Badge variant="outline" className="text-xs">
                        {courses.reduce((sum, c) => sum + c.credits, 0)} credits
                      </Badge>
                    </div>
                    <div className="space-y-1.5 pl-4">
                      {courses
                        .sort((a, b) => a.priority - b.priority)
                        .map((course) => (
                          <div
                            key={course.code}
                            className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                #{course.priority}
                              </Badge>
                              <span className="font-medium">{course.code}</span>
                              <span className="text-muted-foreground">-</span>
                              <span>{course.name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {course.credits}h
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Confirmation Checklist */}
            <div className="space-y-3 p-4 rounded-lg border bg-muted/30">
              <h4 className="font-medium text-sm">Confirmation Checklist</h4>

              <div className="space-y-2">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="understood"
                    checked={confirmChecks.understood}
                    onChange={(e) =>
                      setConfirmChecks({
                        ...confirmChecks,
                        understood: e.target.checked,
                      })
                    }
                    disabled={submitting}
                  />
                  <Label
                    htmlFor="understood"
                    className="text-sm font-normal cursor-pointer leading-tight"
                  >
                    I understand these are preferences, not guaranteed course
                    assignments
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="ranked"
                    checked={confirmChecks.ranked}
                    onChange={(e) =>
                      setConfirmChecks({
                        ...confirmChecks,
                        ranked: e.target.checked,
                      })
                    }
                    disabled={submitting}
                  />
                  <Label
                    htmlFor="ranked"
                    className="text-sm font-normal cursor-pointer leading-tight"
                  >
                    I have ranked courses in order of my preference (1 = highest
                    priority)
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="reviewed"
                    checked={confirmChecks.reviewed}
                    onChange={(e) =>
                      setConfirmChecks({
                        ...confirmChecks,
                        reviewed: e.target.checked,
                      })
                    }
                    disabled={submitting}
                  />
                  <Label
                    htmlFor="reviewed"
                    className="text-sm font-normal cursor-pointer leading-tight"
                  >
                    I have reviewed all prerequisite requirements and package
                    completions
                  </Label>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Go Back
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!allChecked || submitting}
            className="min-w-[120px]"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Preferences"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
