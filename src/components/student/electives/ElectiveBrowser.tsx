// Main Elective Selection Interface
"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Filter, Search, X } from "lucide-react";
import { CourseCard, CourseCardData } from "./CourseCard";
import {
  SelectionPanel,
  SelectedCourse,
  PackageRequirement,
} from "./SelectionPanel";
import { ElectivePackage, ElectiveCourse } from "@/lib/types";

export interface ElectiveBrowserProps {
  electivePackages: ElectivePackage[];
  completedCourses: string[];
  maxSelections?: number;
  onSubmit: (selections: SelectedCourse[]) => void;
}

export function ElectiveBrowser({
  electivePackages,
  completedCourses,
  maxSelections = 10,
  onSubmit,
}: ElectiveBrowserProps) {
  const [selectedCourses, setSelectedCourses] = useState<SelectedCourse[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");

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
          isEligible,
          ineligibilityReason: reason,
          isSelected: !!selected,
          selectionRank: selected?.priority,
        };
      }),
    [allCourses, selectedCourses, completedCourses]
  );

  // Filter courses
  const filteredCourses = useMemo(() => {
    let filtered = courseCards;

    // Apply category filter
    if (activeFilter !== "all") {
      filtered = filtered.filter((course) => {
        const pkg = electivePackages.find((p) => p.label === course.category);
        return pkg?.id === activeFilter;
      });
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (course) =>
          course.code.toLowerCase().includes(query) ||
          course.name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [courseCards, activeFilter, searchQuery, electivePackages]);

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

  const canSubmit = packageRequirements.every((pkg) => pkg.isComplete);

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
    onSubmit(selectedCourses);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Main Content */}
      <div className="flex-1 space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle>Select Your Elective Courses</CardTitle>
            <CardDescription>
              Choose courses from each package to fulfill your degree
              requirements. Courses are ranked by your preference.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses by code or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Category Filters */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">
                  Filter by package
                </span>
                {activeFilter !== "all" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setActiveFilter("all")}
                  >
                    Clear filter
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={activeFilter === "all" ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setActiveFilter("all")}
                >
                  All Courses
                </Badge>
                {electivePackages.map((pkg) => (
                  <Badge
                    key={pkg.id}
                    variant={activeFilter === pkg.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setActiveFilter(pkg.id)}
                  >
                    {pkg.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {filteredCourses.length} course
              {filteredCourses.length !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.code}
                course={course}
                onSelect={handleSelect}
                onDeselect={handleDeselect}
                disabled={
                  selectedCourses.length >= maxSelections && !course.isSelected
                }
              />
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No courses found matching your criteria
                </p>
                <Button
                  variant="link"
                  onClick={() => {
                    setSearchQuery("");
                    setActiveFilter("all");
                  }}
                  className="mt-2"
                >
                  Clear all filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
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
  );
}
