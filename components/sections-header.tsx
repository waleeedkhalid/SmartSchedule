"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSectionDialog } from "@/components/sections-client";

export function SectionsHeader() {
  const { openCreateDialog } = useSectionDialog();
  
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Sections
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage course sections with meeting patterns
        </p>
      </div>
      <Button onClick={openCreateDialog}>
        <Plus className="mr-2 h-4 w-4" />
        Add Section
      </Button>
    </div>
  );
}

