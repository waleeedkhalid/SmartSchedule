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
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { SelectedCourse, PackageRequirement } from "./SelectionPanel";

interface SubmitConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCourses: SelectedCourse[];
  packageRequirements: PackageRequirement[];
  onConfirm: () => Promise<void>;
}

export function SubmitConfirmationDialog({
  open,
  onOpenChange,
  selectedCourses,
  packageRequirements,
  onConfirm,
}: SubmitConfirmationDialogProps) {
  const [submitting, setSubmitting] = useState(false);

  const allPackagesFulfilled = packageRequirements.every((pkg) => pkg.isComplete);
  const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onConfirm();
      // Dialog will be closed by parent component after successful submission
    } catch (error) {
      console.error("Submission error:", error);
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Confirm Your Submission</DialogTitle>
          <DialogDescription>
            Please review your elective preferences before submitting. You can edit them until the survey closes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Total Selections</p>
              <p className="text-2xl font-bold">{selectedCourses.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm text-muted-foreground mb-1">Total Credits</p>
              <p className="text-2xl font-bold">{totalCredits}h</p>
            </div>
          </div>

          {/* Package Requirements Status */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Package Requirements</h4>
            <div className="space-y-1.5">
              {packageRequirements.map((pkg) => (
                <div
                  key={pkg.packageId}
                  className="flex items-center justify-between p-3 rounded-md bg-muted/50 border"
                >
                  <div className="flex items-center gap-2">
                    {pkg.isComplete ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-warning" />
                    )}
                    <span className="font-medium text-sm">{pkg.packageLabel}</span>
                  </div>
                  <Badge variant={pkg.isComplete ? "default" : "secondary"}>
                    {pkg.currentCredits}/{pkg.minCredits}h
                  </Badge>
                </div>
              ))}
            </div>
            {!allPackagesFulfilled && (
              <p className="text-xs text-warning flex items-center gap-1 mt-2">
                <AlertTriangle className="h-3 w-3" />
                Some package requirements are not fully met. You can still submit with eligible courses.
              </p>
            )}
          </div>

          {/* Selected Courses List */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Your Ranked Preferences</h4>
            <ScrollArea className="h-[200px] rounded-md border p-3">
              <div className="space-y-2">
                {selectedCourses
                  .sort((a, b) => a.priority - b.priority)
                  .map((course) => (
                    <div
                      key={course.code}
                      className="flex items-start gap-3 p-2 rounded-md bg-accent/50"
                    >
                      <Badge variant="outline" className="shrink-0 mt-0.5">
                        #{course.priority}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{course.code}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {course.name}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {course.credits}h
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {course.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>

          {/* Important Notice */}
          <div className="p-3 rounded-lg bg-info-bg border border-info-border">
            <p className="text-xs text-foreground">
              <strong>Note:</strong> This is a preference survey. Your actual course enrollment will happen during the official registration period. You can update your preferences anytime before the survey closes.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
            className="flex-1 sm:flex-none"
          >
            Review Again
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={submitting}
            className="flex-1 sm:flex-none"
          >
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Confirm & Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

