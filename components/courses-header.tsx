"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCourseDialog } from "@/components/courses-client";

export function CoursesHeader() {
  const { openCreateDialog } = useCourseDialog();
  
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Courses
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your course catalog
        </p>
      </div>
      <Button onClick={openCreateDialog}>
        <Plus className="mr-2 h-4 w-4" />
        Add Course
      </Button>
    </div>
  );
}

