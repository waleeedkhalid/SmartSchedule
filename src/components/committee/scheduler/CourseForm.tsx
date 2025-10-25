/**
 * CourseForm Component
 * Form for adding/editing course details
 * Note: This is a view-only form for Phase 3 since courses are typically
 * managed through the database directly. Future phases may add full CRUD.
 */

"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

interface CourseFormProps {
  termCode: string;
  onClose: () => void;
}

export function CourseForm({
  termCode,
  onClose,
}: CourseFormProps): React.ReactElement {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add New Course</DialogTitle>
          <DialogDescription>
            Add a new course to the catalog for {termCode}
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Course Management Note</p>
              <p className="text-sm">
                In Phase 3, course records are managed through the database
                directly. Use the section management interface to create and
                manage sections for existing courses.
              </p>
              <p className="text-sm">
                To add a new course to the catalog, please contact the database
                administrator or use the database migration tools.
              </p>
            </div>
          </AlertDescription>
        </Alert>

        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-sm">Quick Guide:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>
              Courses are defined in the <code>course</code> table with attributes
              like code, name, credits, level, type, etc.
            </li>
            <li>
              Use the <strong>Manage Sections</strong> button to create sections
              for existing courses
            </li>
            <li>
              Sections can be assigned instructors, rooms, and time slots
            </li>
            <li>
              The system will automatically detect conflicts and validate
              scheduling constraints
            </li>
          </ul>
        </div>

        <div className="flex justify-end gap-2">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

