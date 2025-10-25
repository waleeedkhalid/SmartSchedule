"use client";

import { FacultyAvailability } from "@/components/faculty/availability/FacultyAvailabilityForm";
import { canSubmitSuggestions } from "@/lib/faculty-permissions";
import type { AcademicTerm } from "@/types/database";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Calendar, CheckCircle } from "lucide-react";

interface FacultyAvailabilityClientProps {
  activeTerm: AcademicTerm | null;
}

export default function FacultyAvailabilityClient({
  activeTerm,
}: FacultyAvailabilityClientProps) {
  const permission = canSubmitSuggestions(activeTerm);
  const isOpen = activeTerm?.is_faculty_availability_open ?? false;

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Teaching Availability</h1>
          {activeTerm && (
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{activeTerm.name} ({activeTerm.code})</span>
            </div>
          )}
        </div>
        
        {/* Status Badge */}
        {isOpen ? (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-900">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Open for Submission</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-900/20 text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Submission Closed</span>
          </div>
        )}
      </div>

      {/* Status Message (Only if closed) */}
      {!permission.allowed && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {permission.reason || "You cannot modify availability at this time."}
          </AlertDescription>
        </Alert>
      )}

      {/* Availability Form */}
      <FacultyAvailability
        canSubmit={permission.allowed}
        lockReason={permission.reason}
      />
    </div>
  );
}

