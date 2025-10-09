// Course Card Component for Elective Selection
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Plus, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CourseCardData {
  code: string;
  name: string;
  credits: number;
  category: string;
  prerequisites?: string[];
  description?: string;
  isEligible: boolean;
  ineligibilityReason?: string;
  isSelected: boolean;
  selectionRank?: number;
}

interface CourseCardProps {
  course: CourseCardData;
  onSelect: (courseCode: string) => void;
  onDeselect: (courseCode: string) => void;
  disabled?: boolean;
}

export function CourseCard({
  course,
  onSelect,
  onDeselect,
  disabled = false,
}: CourseCardProps) {
  const handleAction = () => {
    if (course.isSelected) {
      onDeselect(course.code);
    } else {
      onSelect(course.code);
    }
  };

  const canInteract = course.isEligible && !disabled;

  return (
    <Card
      className={cn(
        "transition-all duration-200 hover:shadow-md",
        course.isSelected && "border-primary border-2 bg-primary/5",
        !course.isEligible && "opacity-60",
        canInteract && !course.isSelected && "hover:border-primary/50"
      )}
    >
      <CardHeader className="space-y-1 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {course.code}
              {course.isSelected && course.selectionRank && (
                <Badge variant="default" className="text-xs">
                  #{course.selectionRank}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              {course.name}
            </CardDescription>
          </div>
          {course.isSelected && (
            <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <Badge variant="secondary" className="text-xs">
            {course.credits} {course.credits === 1 ? "credit" : "credits"}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {course.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">
              Prerequisites:
            </p>
            <div className="flex flex-wrap gap-1">
              {course.prerequisites.map((prereq) => (
                <Badge key={prereq} variant="outline" className="text-xs">
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {course.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Eligibility Status */}
        <div className="flex items-start gap-2 pt-2">
          {course.isEligible ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-green-600 dark:text-green-400">
                Eligible to select
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-yellow-600 dark:text-yellow-400">
                {course.ineligibilityReason || "Not eligible"}
              </span>
            </>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={handleAction}
          disabled={!canInteract}
          variant={course.isSelected ? "outline" : "default"}
          className="w-full"
          size="sm"
        >
          {course.isSelected ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Selected
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Select Course
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
