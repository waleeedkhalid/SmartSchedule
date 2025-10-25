// Main Elective Selection Interface
"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { GraduationCap, BookOpen, CheckCircle, Info } from "lucide-react";
import { CourseCard, CourseCardData } from "./CourseCard";
import {
  SelectionPanel,
  SelectedCourse,
  PackageRequirement,
} from "./SelectionPanel";
import { useDraftAutoSave } from "./use-draft-autosave";
import { DraftStatusIndicator } from "./DraftStatusIndicator";
import { SubmitConfirmationDialog } from "./SubmitConfirmationDialog";

export interface ElectiveCourse {
  code: string;
  name: string;
  credits: number;
  prerequisites?: string[];
  description?: string;
}

export interface ElectivePackage {
  id: string;
  label: string;
  minHours: number;
  maxHours: number;
  courses: ElectiveCourse[];
}

export interface ElectiveBrowserProps {
  electivePackages: ElectivePackage[];
  completedCourses: string[];
  maxSelections?: number;
  onSubmit: (selections: SelectedCourse[]) => Promise<void>;
  termCode: string;
  initialSelections?: { code: string; priority: number }[];
  preferenceStatus?: "DRAFT" | "SUBMITTED" | null;
  submittedAt?: string | null;
  enableAutoSave?: boolean;
}

export function ElectiveBrowser({
  electivePackages,
  completedCourses,
  maxSelections = 6,
  onSubmit,
  termCode,
  initialSelections = [],
  preferenceStatus,
  submittedAt,
  enableAutoSave = true,
}: ElectiveBrowserProps) {
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [activePackage, setActivePackage] = useState<string>(
    electivePackages[0]?.id || "all"
  );
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState(false);

  // Auto-save hook
  const { saveStatus } = useDraftAutoSave(
    selectedCourses,
    termCode,
    enableAutoSave && preferenceStatus !== "SUBMITTED"
  );

  // Load initial selections
  useEffect(() => {
    if (!hasLoadedInitial && initialSelections.length > 0 && electivePackages.length > 0) {
      const loadedCourses: SelectedCourse[] = [];
      
      initialSelections.forEach((pref) => {
        // Find the course in all packages
        for (const pkg of electivePackages) {
          const course = pkg.courses.find((c) => c.code === pref.code);
          if (course) {
            loadedCourses.push({
              code: course.code,
              name: course.name,
              credits: course.credits,
              category: pkg.label,
              packageId: pkg.id,
              priority: pref.priority,
            });
            break;
          }
        }
      });

      // Sort by priority
      loadedCourses.sort((a, b) => a.priority - b.priority);
      setSelectedCourses(loadedCourses);
      setHasLoadedInitial(true);
    }
  }, [initialSelections, electivePackages, hasLoadedInitial]);

  // Flatten all courses with package info
  const allCourses: (ElectiveCourse & {
    packageId: string;
    packageLabel: string;
  })[] = useMemo(
    () =>
      electivePackages.flatMap((pkg) =>
        pkg.courses.map((course) => ({
          ...course,
          packageId: pkg.id,
          packageLabel: pkg.label,
        }))
      ),
    [electivePackages]
  );

  // Transform to CourseCardData
  const courseCards: CourseCardData[] = useMemo(
    () =>
      allCourses.map((course) => {
        // Check eligibility
        let isEligible = true;
        let reason: string | undefined;

        if (course.prerequisites && course.prerequisites.length > 0) {
          const missingPrereqs = course.prerequisites.filter(
            (prereq) => !completedCourses.includes(prereq)
          );

          if (missingPrereqs.length > 0) {
            isEligible = false;
            reason = `Missing prerequisite${
              missingPrereqs.length > 1 ? "s" : ""
            }: ${missingPrereqs.join(", ")}`;
          }
        }

        const selected = selectedCourses.find((s) => s.code === course.code);

        return {
          code: course.code,
          name: course.name,
          credits: course.credits,
          category: course.packageLabel,
          prerequisites: course.prerequisites,
          description: course.description,
          isEligible,
          ineligibilityReason: reason,
          isSelected: !!selected,
          selectionRank: selected?.priority,
        };
      }),
    [allCourses, selectedCourses, completedCourses]
  );

  // Filter courses by active package
  const filteredCourses = useMemo(() => {
    if (activePackage === "all") {
      return courseCards;
    }

    return courseCards.filter((course) => {
      const pkg = electivePackages.find((p) => p.label === course.category);
      return pkg?.id === activePackage;
    });
  }, [courseCards, activePackage, electivePackages]);

  // Calculate package requirements
  const packageRequirements: PackageRequirement[] = useMemo(
    () =>
      electivePackages.map((pkg) => {
        const coursesInPackage = selectedCourses.filter(
          (c) => c.packageId === pkg.id
        );
        const currentCredits = coursesInPackage.reduce(
          (sum, c) => sum + c.credits,
          0
        );

        return {
          packageId: pkg.id,
          packageLabel: pkg.label,
          minCredits: pkg.minHours,
          maxCredits: pkg.maxHours,
          currentCredits,
          isComplete:
            currentCredits >= pkg.minHours && currentCredits <= pkg.maxHours,
        };
      }),
    [electivePackages, selectedCourses]
  );

  // Allow submission if at least 1 course is selected, even if package requirements aren't fully met
  // (Users may not be able to fulfill requirements due to prerequisites)
  const canSubmit = selectedCourses.length > 0 && selectedCourses.length <= maxSelections;

  // Handlers
  const handleSelect = (courseCode: string) => {
    if (selectedCourses.length >= maxSelections) {
      return;
    }

    const course = allCourses.find((c) => c.code === courseCode);
    if (!course) return;

    const newCourse: SelectedCourse = {
      code: course.code,
      name: course.name,
      credits: course.credits,
      category: course.packageLabel,
      packageId: course.packageId,
      priority: selectedCourses.length + 1,
    };

    setSelectedCourses([...selectedCourses, newCourse]);
  };

  const handleDeselect = (courseCode: string) => {
    const updatedCourses = selectedCourses
      .filter((c) => c.code !== courseCode)
      .map((c, index) => ({ ...c, priority: index + 1 }));
    setSelectedCourses(updatedCourses);
  };

  const handleMoveUp = (courseCode: string) => {
    const index = selectedCourses.findIndex((c) => c.code === courseCode);
    if (index <= 0) return;

    const newCourses = [...selectedCourses];
    [newCourses[index - 1], newCourses[index]] = [
      newCourses[index],
      newCourses[index - 1],
    ];

    const reordered = newCourses.map((c, i) => ({ ...c, priority: i + 1 }));
    setSelectedCourses(reordered);
  };

  const handleMoveDown = (courseCode: string) => {
    const index = selectedCourses.findIndex((c) => c.code === courseCode);
    if (index < 0 || index >= selectedCourses.length - 1) return;

    const newCourses = [...selectedCourses];
    [newCourses[index], newCourses[index + 1]] = [
      newCourses[index + 1],
      newCourses[index],
    ];

    const reordered = newCourses.map((c, i) => ({ ...c, priority: i + 1 }));
    setSelectedCourses(reordered);
  };

  const handleSubmit = () => {
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    await onSubmit(selectedCourses);
    setShowConfirmDialog(false);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Status Alerts */}
          {preferenceStatus === "SUBMITTED" && submittedAt && (
            <Alert className="bg-success-bg border-success-border">
              <CheckCircle className="h-4 w-4 text-success" />
              <AlertDescription className="text-foreground">
                <strong>Submitted Successfully!</strong> Your preferences were submitted on{" "}
                {new Date(submittedAt).toLocaleString()}. You can still update them before the survey closes.
              </AlertDescription>
            </Alert>
          )}

          {preferenceStatus === "DRAFT" && enableAutoSave && (
            <Alert className="bg-info-bg border-info-border">
              <Info className="h-4 w-4 text-info" />
              <AlertDescription className="text-foreground flex items-center justify-between">
                <span>
                  <strong>Draft Mode:</strong> Your changes are being auto-saved.
                </span>
                <DraftStatusIndicator saveStatus={saveStatus} />
              </AlertDescription>
            </Alert>
          )}

          {/* Header with Tabs */}
          <Card>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-2xl">
                      Select Your Elective Courses
                    </CardTitle>
                    {enableAutoSave && preferenceStatus !== "SUBMITTED" && (
                      <DraftStatusIndicator saveStatus={saveStatus} className="hidden sm:flex" />
                    )}
                  </div>
                  <CardDescription className="mt-1.5">
                    Choose up to {maxSelections} elective courses from any package. Your selections will be ranked by preference order. Click on cards or buttons to select.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>

        {/* Tabs for Package Categories */}
        <Tabs
          value={activePackage}
          onValueChange={setActivePackage}
          className="w-full"
        >
          <TabsList className="w-full justify-start flex-wrap h-auto p-1">
            <TabsTrigger value="all" className="gap-2">
              <BookOpen className="h-4 w-4" />
              All Courses
              <Badge variant="secondary" className="ml-1">
                {courseCards.length}
              </Badge>
            </TabsTrigger>
            {electivePackages.map((pkg) => {
              const pkgCourses = courseCards.filter((c) => {
                const pkgMatch = electivePackages.find(
                  (p) => p.label === c.category
                );
                return pkgMatch?.id === pkg.id;
              });

              return (
                <TabsTrigger key={pkg.id} value={pkg.id} className="gap-2">
                  {pkg.label}
                  <Badge variant="secondary" className="ml-1">
                    {pkgCourses.length}
                  </Badge>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activePackage} className="mt-6">
            {/* Package Description */}
            {activePackage !== "all" && (
              <Card className="mb-6 border-primary/20 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-lg">
                        {
                          electivePackages.find((p) => p.id === activePackage)
                            ?.label
                        }
                      </h3>
                      <Badge variant="outline">
                        {
                          packageRequirements.find(
                            (p) => p.packageId === activePackage
                          )?.minCredits
                        }
                        -
                        {
                          packageRequirements.find(
                            (p) => p.packageId === activePackage
                          )?.maxCredits
                        }{" "}
                        credits required
                      </Badge>
                    </div>
                    {/* Description */}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Course Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredCourses.length} course
                  {filteredCourses.length !== 1 ? "s" : ""} available
                </p>
              </div>

              {filteredCourses.length === 0 ? (
                <Card>
                  <CardContent className="py-16 text-center">
                    <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-lg font-medium text-muted-foreground mb-2">
                      No courses available
                    </p>
                    <p className="text-sm text-muted-foreground">
                      There are no courses in this package yet.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.code}
                      course={course}
                      onSelect={handleSelect}
                      onDeselect={handleDeselect}
                      disabled={
                        selectedCourses.length >= maxSelections &&
                        !course.isSelected
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

        {/* Selection Panel */}
        <aside className="lg:w-[380px] w-full">
          <SelectionPanel
            selectedCourses={selectedCourses}
            packageRequirements={packageRequirements}
            maxSelections={maxSelections}
            onRemove={handleDeselect}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            onSubmit={handleSubmit}
            canSubmit={canSubmit}
          />
        </aside>
      </div>

      {/* Confirmation Dialog */}
      <SubmitConfirmationDialog
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        selectedCourses={selectedCourses}
        packageRequirements={packageRequirements}
        onConfirm={handleConfirmSubmit}
      />
    </>
  );
}

export default ElectiveBrowser;
