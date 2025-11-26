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
import { Edit, Trash2, AlertTriangle } from "lucide-react";

export type ActionType = "edit" | "delete";

interface CourseActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: ActionType;
  courseCode: string;
  courseName?: string;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
}

/**
 * Reusable confirmation dialog for course actions (edit/delete)
 * Follows DRY principle by handling both edit and delete actions
 */
export function CourseActionDialog({
  open,
  onOpenChange,
  action,
  courseCode,
  courseName,
  onConfirm,
  isLoading = false,
}: CourseActionDialogProps) {
  const isDelete = action === "delete";
  const isEdit = action === "edit";

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isDelete ? (
              <>
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete Course
              </>
            ) : (
              <>
                <Edit className="h-5 w-5 text-blue-500" />
                Edit Course
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isDelete ? (
              <>
                Are you sure you want to delete course <strong>{courseCode}</strong>
                {courseName && ` (${courseName})`}? This action cannot be undone.
              </>
            ) : (
              <>
                You are about to edit course <strong>{courseCode}</strong>
                {courseName && ` (${courseName})`}. Continue to the edit page?
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {isDelete && (
          <div className="flex items-start gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <p className="font-medium mb-1">Warning</p>
              <p>
                Deleting this course will permanently remove it from the system.
                Make sure there are no sections associated with this course before proceeding.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant={isDelete ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              "Processing..."
            ) : isDelete ? (
              "Delete Course"
            ) : (
              "Continue to Edit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

