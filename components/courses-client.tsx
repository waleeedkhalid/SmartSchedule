"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CourseForm } from "@/components/course-form";
import { Course } from "@/lib/data/courses";

interface CourseDialogContextType {
  openCreateDialog: () => void;
  openEditDialog: (course: Course) => void;
}

const CourseDialogContext = createContext<CourseDialogContextType | undefined>(undefined);

export function useCourseDialog() {
  const context = useContext(CourseDialogContext);
  if (!context) {
    throw new Error("useCourseDialog must be used within CourseDialogProvider");
  }
  return context;
}

interface CourseDialogProviderProps {
  children: ReactNode;
}

export function CourseDialogProvider({ children }: CourseDialogProviderProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  const openCreateDialog = useCallback(() => {
    setSelectedCourse(null);
    setDialogOpen(true);
  }, []);

  const openEditDialog = useCallback((course: Course) => {
    setSelectedCourse(course);
    setDialogOpen(true);
  }, []);

  const handleSuccess = useCallback(() => {
    setDialogOpen(false);
    setSelectedCourse(null);
    router.refresh();
  }, [router]);

  const handleCancel = useCallback(() => {
    setDialogOpen(false);
    setSelectedCourse(null);
  }, []);

  const isEditing = selectedCourse !== null;

  return (
    <CourseDialogContext.Provider value={{ openCreateDialog, openEditDialog }}>
      {children}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Course' : 'Add New Course'}
            </DialogTitle>
          </DialogHeader>
          <CourseForm
            course={selectedCourse || undefined}
            isEditing={isEditing}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </CourseDialogContext.Provider>
  );
}

