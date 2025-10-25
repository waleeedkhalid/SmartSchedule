/**
 * GenerateScheduleDialog
 *
 * UI component for triggering schedule generation.
 * Allows users to:
 * - Select levels to generate (3-8)
 * - Trigger generation via API
 * - Track progress
 * - Handle errors gracefully
 */

"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";

interface GenerateScheduleDialogProps {
  termCode: string;
  onScheduleGenerated?: (data: unknown) => void;
  triggerButton?: React.ReactNode;
}

export function GenerateScheduleDialog({
  termCode,
  onScheduleGenerated,
  triggerButton,
}: GenerateScheduleDialogProps) {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedLevels, setSelectedLevels] = useState<number[]>([3, 4, 5, 6, 7, 8]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    levels: Array<{
      level: number;
      studentCount: number;
      courses: Array<{
        courseCode: string;
        courseName: string;
        sectionsCreated: number;
      }>;
    }>;
    conflicts: Array<{
      type: string;
      description: string;
    }>;
  } | null>(null);

  const levels = [3, 4, 5, 6, 7, 8];

  const toggleLevel = (level: number) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const handleGenerate = async () => {
    if (selectedLevels.length === 0) {
      setError("Please select at least one level to generate.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setSuccessData(null);
    setProgress(10); // Initial progress

    try {
      console.log("Sending schedule generation request:", {
        term_code: termCode,
        target_levels: selectedLevels.sort((a, b) => a - b),
      });

      setProgress(30); // Request sent

      const response = await fetch("/api/committee/scheduler/schedule/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term_code: termCode,
          target_levels: selectedLevels.sort((a, b) => a - b),
        }),
      });

      setProgress(60); // Response received

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to generate schedule");
      }

      const data = await response.json();
      console.log("Schedule generation response:", data);

      setProgress(90); // Processing complete

      setSuccessData(data.data || data);
      
      if (onScheduleGenerated) {
        onScheduleGenerated(data);
      }

      setProgress(100); // Done

      // Keep dialog open to show results
      setTimeout(() => {
        setProgress(0);
      }, 2000);
    } catch (error) {
      console.error("Schedule generation failed:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate schedule. Check console for details."
      );
      setProgress(0);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      setOpen(false);
      setError(null);
      setSuccessData(null);
      setProgress(0);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button>
            <Sparkles className="w-4 h-4 mr-2" />
            Generate Schedule
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Course Schedule</DialogTitle>
          <DialogDescription>
            Analyze and generate course sections for {termCode}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Level Selection */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Select Levels</Label>
            <div className="grid grid-cols-6 gap-4">
              {levels.map((level) => (
                <div key={level} className="flex items-center space-x-2">
                  <Checkbox
                    id={`level-${level}`}
                    checked={selectedLevels.includes(level)}
                    onCheckedChange={() => toggleLevel(level)}
                    disabled={isGenerating}
                  />
                  <Label
                    htmlFor={`level-${level}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    Level {level}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Selected: {selectedLevels.length} level
              {selectedLevels.length !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Progress Bar */}
          {isGenerating && (
            <div className="space-y-2">
              <Label className="text-sm">Generating...</Label>
              <Progress value={progress} className="w-full" />
              <p className="text-xs text-muted-foreground">
                {progress < 30 && "Initializing..."}
                {progress >= 30 && progress < 60 && "Analyzing student data..."}
                {progress >= 60 && progress < 90 && "Processing courses..."}
                {progress >= 90 && "Finalizing..."}
              </p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Display */}
          {successData && !isGenerating && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Schedule analysis complete!</p>
                  <div className="text-sm space-y-1">
                    <p>Processed {successData.levels.length} levels</p>
                    {successData.levels.map((levelData) => (
                      <div key={levelData.level} className="ml-4">
                        <p className="font-medium">
                          Level {levelData.level} ({levelData.studentCount} students):
                        </p>
                        <ul className="ml-4 text-xs">
                          {levelData.courses.map((course) => (
                            <li key={course.courseCode}>
                              {course.courseCode}: {course.sectionsCreated} sections
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {successData.conflicts.length > 0 && (
                      <div className="mt-2">
                        <p className="font-medium text-orange-600">
                          {successData.conflicts.length} potential conflicts detected
                        </p>
                        <ul className="ml-4 text-xs">
                          {successData.conflicts.slice(0, 3).map((conflict, idx) => (
                            <li key={idx}>{conflict.description}</li>
                          ))}
                          {successData.conflicts.length > 3 && (
                            <li>... and {successData.conflicts.length - 3} more</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={isGenerating}
          >
            {successData ? "Close" : "Cancel"}
          </Button>
          <Button 
            onClick={handleGenerate} 
            disabled={isGenerating || selectedLevels.length === 0}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Schedule
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
