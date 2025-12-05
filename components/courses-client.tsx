"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Course } from "@/lib/data/courses";

// Lazy load heavy dialog components - only loaded when dialog opens
const Dialog = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.Dialog),
  { ssr: false }
);
const DialogContent = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.DialogContent),
  { ssr: false }
);
const DialogHeader = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.DialogHeader),
  { ssr: false }
);
const DialogTitle = dynamic(
  () => import("@/components/ui/dialog").then((mod) => mod.DialogTitle),
  { ssr: false }
);

// Lazy load form component - heavy with form fields
const CourseForm = dynamic(
  () => import("@/components/course-form").then((mod) => mod.CourseForm),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

interface CourseDialogContextType {
  openCreateDialog: () => void;
  openEditDialog: (course: Course) => void;
}

const CourseDialogContext = createContext<CourseDialogContextType | undefined>(
  undefined
);

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
              {isEditing ? "Edit Course" : "Add New Course"}
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
