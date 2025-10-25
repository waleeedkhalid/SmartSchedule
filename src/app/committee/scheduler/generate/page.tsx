/**
 * Schedule Generation Page
 * 
 * Main page for triggering and managing schedule generation with:
 * - Level selection
 * - Generation progress tracking
 * - Results display
 * - Conflict resolution
 * - Schedule preview
 */

"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  AlertCircle,
  ArrowLeft,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  GenerationProgress,
  type GenerationStep,
} from "@/components/committee/scheduler/GenerationProgress";
import { GeneratedScheduleResults } from "@/components/committee/scheduler/GeneratedScheduleResults";
import { ConflictResolver } from "@/components/committee/scheduler/ConflictResolver";
import { SchedulePreviewer, type ScheduleSection } from "@/components/committee/scheduler/SchedulePreviewer";
import type { ScheduleConflict, ScheduledSection, SectionTimeSlot } from "@/types/scheduler";

export default function ScheduleGeneratePage() {
  const router = useRouter();
  
  // Term selection
  const [selectedTerm, setSelectedTerm] = useState<string>("2024-1");
  
  // Level selection
  const [selectedLevels, setSelectedLevels] = useState<number[]>([3, 4, 5, 6, 7, 8]);
  const levels = [3, 4, 5, 6, 7, 8];

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Progress tracking
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: "init", label: "Initializing generation", status: "pending" },
    { id: "validate", label: "Validating courses and student data", status: "pending" },
    { id: "analyze", label: "Analyzing student counts", status: "pending" },
    { id: "generate", label: "Generating sections", status: "pending" },
    { id: "conflicts", label: "Checking for conflicts", status: "pending" },
    { id: "finalize", label: "Finalizing schedule", status: "pending" },
  ]);

  // Results state
  const [generationResults, setGenerationResults] = useState<{
    levels: Array<{
      level: number;
      studentCount: number;
      courses: Array<{
        courseCode: string;
        courseName: string;
        sectionsCreated: number;
      }>;
    }>;
    conflicts: ScheduleConflict[];
    execution_time_ms?: number;
  } | null>(null);

  // Conflict resolution state
  const [allSections, setAllSections] = useState<ScheduledSection[]>([]);
  const [occupiedSlots, setOccupiedSlots] = useState<SectionTimeSlot[]>([]);

  // View state
  const [activeView, setActiveView] = useState<"setup" | "progress" | "results" | "conflicts" | "preview">("setup");

  const toggleLevel = (level: number) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const updateStep = (stepId: string, status: GenerationStep["status"], message?: string) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, status, message } : step
      )
    );
  };

  const handleGenerate = async () => {
    if (selectedLevels.length === 0) {
      setError("Please select at least one level to generate.");
      return;
    }

    setIsGenerating(true);
    setGenerationComplete(false);
    setError(null);
    setActiveView("progress");
    setProgress(0);

    try {
      // Step 1: Initialize
      setCurrentStep("Initializing schedule generation...");
      updateStep("init", "in_progress");
      setProgress(5);
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateStep("init", "completed");

      // Step 2: Validate
      setCurrentStep("Validating courses and student data...");
      updateStep("validate", "in_progress");
      setProgress(15);
      await new Promise((resolve) => setTimeout(resolve, 800));
      updateStep("validate", "completed");

      // Step 3: Analyze
      setCurrentStep("Analyzing student counts and requirements...");
      updateStep("analyze", "in_progress");
      setProgress(30);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      updateStep("analyze", "completed");

      // Step 4: Generate sections (main API call)
      setCurrentStep("Generating course sections...");
      updateStep("generate", "in_progress");
      setProgress(50);

      const response = await fetch("/api/committee/scheduler/schedule/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          term_code: selectedTerm,
          target_levels: selectedLevels.sort((a, b) => a - b),
        }),
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Failed to generate schedule");
      }

      const data = await response.json();
      updateStep("generate", "completed", `Created ${data.data?.levels?.length || 0} level schedules`);

      // Step 5: Check conflicts
      setCurrentStep("Checking for scheduling conflicts...");
      updateStep("conflicts", "in_progress");
      setProgress(85);
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      const conflictCount = data.data?.conflicts?.length || 0;
      updateStep("conflicts", conflictCount > 0 ? "completed" : "completed", 
        conflictCount > 0 ? `Found ${conflictCount} conflicts` : "No conflicts detected");

      // Step 6: Finalize
      setCurrentStep("Finalizing schedule generation...");
      updateStep("finalize", "in_progress");
      setProgress(95);
      await new Promise((resolve) => setTimeout(resolve, 500));
      updateStep("finalize", "completed");

      setProgress(100);
      setGenerationResults(data.data);
      setGenerationComplete(true);
      
      // Auto-switch to results view after a brief delay
      setTimeout(() => {
        setActiveView("results");
      }, 1500);

    } catch (error) {
      console.error("Schedule generation failed:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to generate schedule";
      setError(errorMessage);
      updateStep("generate", "error", errorMessage);
      setCurrentStep("");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResolveConflict = async (conflictId: string, type: 'auto' | 'manual') => {
    try {
      const conflict = generationResults?.conflicts.find((c) => c.id === conflictId);
      if (!conflict) return;

      const response = await fetch("/api/committee/scheduler/conflicts/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conflict,
          all_sections: allSections,
          resolution_type: type,
        }),
      });

      if (response.ok) {
        // Refresh conflicts after resolution
        await handleRevalidateConflicts();
      }
    } catch (error) {
      console.error("Error resolving conflict:", error);
    }
  };

  const handleResolveAll = async () => {
    if (!generationResults) return;

    const autoResolvableConflicts = generationResults.conflicts.filter(
      (c) => c.auto_resolvable
    );

    for (const conflict of autoResolvableConflicts) {
      await handleResolveConflict(conflict.id || "", "auto");
    }
  };

  const handleRevalidateConflicts = async () => {
    if (!generationResults || allSections.length === 0) return;

    try {
      const response = await fetch("/api/committee/scheduler/conflicts/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: allSections,
          include_suggestions: true,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setGenerationResults({
          ...generationResults,
          conflicts: data.data.conflicts,
        });
      }
    } catch (error) {
      console.error("Error revalidating conflicts:", error);
    }
  };

  const handleExport = () => {
    console.log("Exporting schedule...");
    // TODO: Implement export functionality
  };

  const handlePublish = () => {
    console.log("Publishing schedule...");
    // TODO: Implement publish functionality
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Scheduler
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Schedule Generation</h1>
            <p className="text-muted-foreground mt-2">
              Generate optimized course schedules for selected levels
            </p>
          </div>
        </div>
      </div>

      {/* View Navigation */}
      {generationComplete && (
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 p-1 bg-muted rounded-lg">
            <Button
              variant={activeView === "results" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("results")}
            >
              Results
            </Button>
            {generationResults && generationResults.conflicts.length > 0 && (
              <Button
                variant={activeView === "conflicts" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("conflicts")}
              >
                Conflicts ({generationResults.conflicts.length})
              </Button>
            )}
            <Button
              variant={activeView === "preview" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("preview")}
            >
              Preview
            </Button>
            <Button
              variant={activeView === "setup" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("setup")}
            >
              New Generation
            </Button>
          </div>
        </div>
      )}

      {/* Setup View */}
      {activeView === "setup" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation Configuration</CardTitle>
              <CardDescription>
                Select the academic term and levels to generate schedules for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Term Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Academic Term</Label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024-1">Fall 2024</SelectItem>
                    <SelectItem value="2024-2">Spring 2024</SelectItem>
                    <SelectItem value="2025-1">Fall 2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Level Selection */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Select Levels</Label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
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
                  Selected: {selectedLevels.length} level{selectedLevels.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Info Alert */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Schedule generation may take several minutes depending on
                  the number of levels selected. The system will analyze student enrollments,
                  create appropriate sections, and check for conflicts.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Generate Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || selectedLevels.length === 0}
              size="lg"
              className="min-w-[200px]"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Generate Schedule
            </Button>
          </div>
        </div>
      )}

      {/* Progress View */}
      {activeView === "progress" && (
        <GenerationProgress
          isGenerating={isGenerating}
          currentStep={currentStep}
          progress={progress}
          steps={steps}
          stats={{
            levelsProcessed: steps.find(s => s.id === "generate")?.status === "completed" 
              ? selectedLevels.length 
              : 0,
            totalLevels: selectedLevels.length,
            sectionsCreated: generationResults?.levels.reduce(
              (sum, level) => 
                sum + level.courses.reduce((s, course) => s + course.sectionsCreated, 0),
              0
            ) || 0,
            conflictsDetected: generationResults?.conflicts.length || 0,
          }}
          error={error}
        />
      )}

      {/* Results View */}
      {activeView === "results" && generationResults && (
        <GeneratedScheduleResults
          data={generationResults}
          termCode={selectedTerm}
          onExport={handleExport}
          onPublish={handlePublish}
          onViewConflicts={
            generationResults.conflicts.length > 0
              ? () => setActiveView("conflicts")
              : undefined
          }
        />
      )}

      {/* Conflicts View */}
      {activeView === "conflicts" && generationResults && (
        <ConflictResolver
          conflicts={generationResults.conflicts}
          allSections={allSections}
          occupiedSlots={occupiedSlots}
          onResolveConflict={handleResolveConflict}
          onResolveAll={handleResolveAll}
          onRevalidate={handleRevalidateConflicts}
          isResolving={false}
        />
      )}

      {/* Preview View */}
      {activeView === "preview" && generationResults && (
        <SchedulePreviewer
          sections={[]} // TODO: Transform generationResults into ScheduleSection[]
          title="Generated Schedule Preview"
          showNavigation={false}
        />
      )}
    </div>
  );
}

