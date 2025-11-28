"use client";

import { memo, useCallback, useState } from "react";
import { Course } from "@/lib/data/courses";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { isSWESchedulableCourse } from "@/lib/utils/course-utils";
import { getAuthHeader } from "@/lib/utils/client-auth";
import { CourseActionDialog, ActionType } from "@/components/course-action-dialog";
import { useCourseDialog } from "@/components/courses-client";

interface CoursesTableProps {
  courses: Course[];
}

function CoursesTableComponent({ courses }: CoursesTableProps) {
  const router = useRouter();
  const { openEditDialog } = useCourseDialog();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogAction, setDialogAction] = useState<ActionType>("delete");
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Handle delete action
  const handleDelete = useCallback(async (course: Course) => {
    setDialogAction("delete");
    setSelectedCourse(course);
    setDialogOpen(true);
  }, []);

  // Handle edit action
  const handleEdit = useCallback((course: Course) => {
    setDialogAction("edit");
    setSelectedCourse(course);
    setDialogOpen(true);
  }, []);

  // Confirm delete action
  const confirmDelete = useCallback(async () => {
    if (!selectedCourse) return;

    setIsLoading(true);
    try {
      const authHeader = await getAuthHeader();
      
      if (!authHeader || authHeader.trim() === '' || authHeader === 'Bearer ') {
        throw new Error('Authentication required. Please log in again.');
      }
      
      // URL encode the course code to handle special characters
      const encodedCourseCode = encodeURIComponent(selectedCourse.code);
      const response = await fetch(`/api/v1/courses/${encodedCourseCode}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
        },
      });

      // Parse response - handle both JSON and non-JSON responses
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        // If response is not JSON, use status text
        throw new Error(`Failed to delete course: ${response.statusText || `HTTP ${response.status}`}`);
      }

      if (!response.ok) {
        // Extract error message from API response
        const errorMessage = result.error || result.message || `Failed to delete course (${response.status})`;
        
        // Handle 404 (course not found) - might have been deleted already
        if (response.status === 404) {
          // Close dialog and refresh page to sync with server state
          setDialogOpen(false);
          setSelectedCourse(null);
          toast.warning(`Course ${selectedCourse.code} was not found. The page will refresh to sync with the server.`);
          setTimeout(() => {
            router.refresh();
          }, 1000);
          return;
        }
        
        throw new Error(errorMessage);
      }

      // Success - close dialog first, then show toast and refresh
      setDialogOpen(false);
      const deletedCode = selectedCourse.code;
      const sectionsDeleted = result.data?.sectionsDeleted || 0;
      setSelectedCourse(null);
      
      // Show success message with section count if applicable
      if (sectionsDeleted > 0) {
        toast.success(`Course ${deletedCode} and ${sectionsDeleted} section${sectionsDeleted !== 1 ? 's' : ''} deleted successfully`);
      } else {
        toast.success(`Course ${deletedCode} deleted successfully`);
      }
      
      // Small delay to ensure dialog closes before refresh
      setTimeout(() => {
        // Refresh the page to show updated course list
        router.refresh();
      }, 100);
    } catch (error) {
      // Error - show message but keep dialog open so user can try again
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Failed to delete course. Please try again.";
      toast.error(errorMessage);
      console.error('Delete course error:', error);
      // Don't close dialog on error - let user see the error and try again
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourse, router]);

  // Confirm edit action - opens the course form dialog
  const confirmEdit = useCallback(() => {
    if (!selectedCourse) return;
    setDialogOpen(false);
    openEditDialog(selectedCourse);
  }, [selectedCourse, openEditDialog]);

  if (courses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No courses found. Add your first course to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-background">
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Weekly Hours</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Scheduling</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.code}>
              <TableCell className="font-medium">{course.code}</TableCell>
              <TableCell>{course.title}</TableCell>
              <TableCell>
                {course.recommended_level !== null 
                  ? `Level ${course.recommended_level}` 
                  : 'Elective'}
              </TableCell>
              <TableCell>{course.credits}</TableCell>
              <TableCell>{course.weekly_hours}h</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    course.is_elective
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {course.is_elective ? "Elective" : "Core"}
                </span>
              </TableCell>
              <TableCell>
                {isSWESchedulableCourse(course.code, course.level) ? (
                  <Badge className="bg-blue-600">SWE Algorithm</Badge>
                ) : (
                  <Badge variant="outline">External/Manual</Badge>
                )}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(course)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(course)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Action Confirmation Dialog */}
      {selectedCourse && (
        <CourseActionDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          action={dialogAction}
          courseCode={selectedCourse.code}
          courseName={selectedCourse.title}
          onConfirm={dialogAction === "delete" ? confirmDelete : confirmEdit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders when courses array reference changes but content is the same
export const CoursesTable = memo(CoursesTableComponent)

