/**
 * Capacity Thresholds View Component
 * Manages section capacity thresholds with slider controls
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Loader2,
  AlertCircle,
  Save,
  Info,
  TrendingUp,
} from "lucide-react";
import { updateCapacityThreshold, toggleSWECourse } from "@/lib/actions/student-management";
import type { CapacityThreshold } from "@/types/scheduler";

interface CapacityThresholdsViewProps {
  termCode: string;
  termName: string;
}

export function CapacityThresholdsView({
  termCode,
}: CapacityThresholdsViewProps) {
  const [thresholds, setThresholds] = useState<CapacityThreshold[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingThresholds, setEditingThresholds] = useState<
    Record<string, number>
  >({});
  const [editingSWE, setEditingSWE] = useState<Record<string, boolean>>({});
  const [savingCourses, setSavingCourses] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  // Fetch thresholds
  const fetchThresholds = useCallback(async () => {
    if (!termCode) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        term_code: termCode,
      });

      const response = await fetch(
        `/api/committee/scheduler/capacity-thresholds?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch capacity thresholds");
      }

      const result = await response.json();
      const fetchedThresholds = result.data?.thresholds || [];
      setThresholds(fetchedThresholds);

      // Initialize editing state
      const initialThresholds: Record<string, number> = {};
      const initialSWE: Record<string, boolean> = {};
      fetchedThresholds.forEach((t: CapacityThreshold) => {
        initialThresholds[t.course_code] = t.threshold_percentage;
        initialSWE[t.course_code] = t.is_swe_course;
      });
      setEditingThresholds(initialThresholds);
      setEditingSWE(initialSWE);
    } catch (err) {
      console.error("Error fetching thresholds:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load capacity thresholds"
      );
    } finally {
      setLoading(false);
    }
  }, [termCode]);

  useEffect(() => {
    fetchThresholds();
  }, [fetchThresholds]);

  // Handle SWE toggle
  const handleSWEToggle = async (courseCode: string, isSWE: boolean) => {
    const newSWE = { ...editingSWE, [courseCode]: isSWE };
    setEditingSWE(newSWE);

    // Auto-adjust threshold when toggling SWE
    if (!isSWE) {
      // Set to fixed 15% for external
      setEditingThresholds({
        ...editingThresholds,
        [courseCode]: 15,
      });
    } else {
      // Set default 20% for SWE if previously external
      if (editingThresholds[courseCode] === 15) {
        setEditingThresholds({
          ...editingThresholds,
          [courseCode]: 20,
        });
      }
    }
  };

  // Handle threshold change
  const handleThresholdChange = (courseCode: string, value: number[]) => {
    setEditingThresholds({
      ...editingThresholds,
      [courseCode]: value[0],
    });
  };

  // Handle save
  const handleSave = async (courseCode: string) => {
    setSavingCourses((prev) => new Set(prev).add(courseCode));

    try {
      const isSWE = editingSWE[courseCode] || false;
      const threshold = editingThresholds[courseCode];

      // First toggle SWE status
      const sweResult = await toggleSWECourse({
        courseCode,
        termCode,
        isSWECourse: isSWE,
      });

      if (!sweResult.success) {
        throw new Error(sweResult.error || "Failed to update SWE status");
      }

      // Then update threshold
      const thresholdResult = await updateCapacityThreshold({
        courseCode,
        termCode,
        thresholdPercentage: threshold,
        isSWECourse: isSWE,
      });

      if (thresholdResult.success) {
        toast({
          title: "Success",
          description: "Capacity threshold updated successfully",
        });

        // Refresh thresholds
        await fetchThresholds();
      } else {
        throw new Error(
          thresholdResult.error || "Failed to update threshold"
        );
      }
    } catch (error) {
      console.error("Error saving threshold:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save threshold",
        variant: "destructive",
      });
    } finally {
      setSavingCourses((prev) => {
        const newSet = new Set(prev);
        newSet.delete(courseCode);
        return newSet;
      });
    }
  };

  // Check if course has unsaved changes
  const hasChanges = (courseCode: string) => {
    const threshold = thresholds.find((t) => t.course_code === courseCode);
    if (!threshold) return false;

    return (
      editingThresholds[courseCode] !== threshold.threshold_percentage ||
      editingSWE[courseCode] !== threshold.is_swe_course
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading capacity thresholds...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const sweCoursesCount = thresholds.filter((t) => t.is_swe_course).length;
  const externalCoursesCount = thresholds.length - sweCoursesCount;

  return (
    <div className="space-y-4">
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Capacity Threshold Rules:</strong>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li>
              <strong>SWE Courses:</strong> Adjustable threshold between 5% and
              50% above base capacity
            </li>
            <li>
              <strong>External Courses:</strong> Fixed at 15% above base
              capacity
            </li>
            <li>
              Students can register in sections until they reach max capacity
              (base + threshold)
            </li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              SWE-Managed Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sweCoursesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Flexible capacity thresholds
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              External Courses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{externalCoursesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Fixed 15% threshold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Thresholds Table */}
      <Card>
        <CardHeader>
          <CardTitle>Course Capacity Configuration</CardTitle>
          <CardDescription>
            Configure capacity thresholds for each course. Changes must be saved
            individually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {thresholds.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No courses found for this term.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {thresholds.map((threshold) => {
                const isSWE = editingSWE[threshold.course_code] ?? threshold.is_swe_course;
                const currentThreshold =
                  editingThresholds[threshold.course_code] ??
                  threshold.threshold_percentage;
                const maxCapacity = Math.ceil(
                  threshold.base_capacity +
                    (threshold.base_capacity * currentThreshold) / 100
                );
                const isSaving = savingCourses.has(threshold.course_code);
                const hasUnsavedChanges = hasChanges(threshold.course_code);

                return (
                  <Card key={threshold.course_code} className="relative">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {/* Course Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">
                              {threshold.course_code}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {threshold.course_name}
                            </p>
                          </div>
                          <Badge variant={isSWE ? "default" : "secondary"}>
                            {isSWE ? "SWE-Managed" : "External"}
                          </Badge>
                        </div>

                        {/* SWE Toggle */}
                        <div className="flex items-center justify-between py-2 border-t border-b">
                          <Label
                            htmlFor={`swe-${threshold.course_code}`}
                            className="text-sm font-medium"
                          >
                            Mark as SWE-Managed Course
                          </Label>
                          <Switch
                            id={`swe-${threshold.course_code}`}
                            checked={isSWE}
                            onCheckedChange={(checked) =>
                              handleSWEToggle(threshold.course_code, checked)
                            }
                          />
                        </div>

                        {/* Threshold Slider */}
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium">
                              Capacity Threshold
                            </Label>
                            <span className="text-sm font-bold">
                              {currentThreshold}%
                            </span>
                          </div>

                          <Slider
                            value={[currentThreshold]}
                            onValueChange={(value) =>
                              handleThresholdChange(threshold.course_code, value)
                            }
                            min={isSWE ? 5 : 15}
                            max={isSWE ? 50 : 15}
                            step={1}
                            disabled={!isSWE}
                            className="w-full"
                          />

                          {!isSWE && (
                            <p className="text-xs text-muted-foreground">
                              External courses have a fixed 15% threshold
                            </p>
                          )}
                        </div>

                        {/* Capacity Preview */}
                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Base Capacity
                            </p>
                            <p className="text-lg font-semibold">
                              {threshold.base_capacity}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Threshold
                            </p>
                            <p className="text-lg font-semibold">
                              +{Math.ceil((threshold.base_capacity * currentThreshold) / 100)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Max Capacity
                            </p>
                            <p className="text-lg font-semibold text-primary">
                              {maxCapacity}
                            </p>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex justify-end">
                          <Button
                            onClick={() => handleSave(threshold.course_code)}
                            disabled={!hasUnsavedChanges || isSaving}
                            size="sm"
                          >
                            {isSaving ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <Save className="mr-2 h-4 w-4" />
                                {hasUnsavedChanges ? "Save Changes" : "Saved"}
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

