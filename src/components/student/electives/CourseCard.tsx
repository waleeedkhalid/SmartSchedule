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
        "group relative transition-all duration-200 hover:shadow-lg overflow-hidden",
        course.isSelected && "border-primary border-2 bg-gradient-to-br from-primary/10 to-primary/5 shadow-md",
        !course.isEligible && "opacity-60",
        canInteract && !course.isSelected && "hover:border-primary/50 hover:shadow-primary/10 cursor-pointer"
      )}
      onClick={() => canInteract && handleAction()}
    >
      {/* Selection indicator badge */}
      {course.isSelected && course.selectionRank && (
        <div className="absolute top-2 right-2 z-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg">
            {course.selectionRank}
          </div>
        </div>
      )}

      <CardHeader className="space-y-2 pb-3">
        <div className="flex items-start justify-between pr-8">
          <div className="flex-1 space-y-1">
            <CardTitle className="text-lg font-bold flex items-center gap-2 group-hover:text-primary transition-colors">
              {course.code}
            </CardTitle>
            <CardDescription className="text-sm font-medium leading-snug">
              {course.name}
            </CardDescription>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <Badge variant="secondary" className="text-xs font-semibold">
            {course.credits}h
          </Badge>
          <Badge variant="outline" className="text-xs truncate max-w-[150px]">
            {course.category}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Description */}
        {course.description && (
          <p className="text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        )}

        {/* Prerequisites */}
        {course.prerequisites && course.prerequisites.length > 0 && (
          <div className="space-y-1.5 p-2 rounded-md bg-muted/30 border border-muted">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Prerequisites
            </p>
            <div className="flex flex-wrap gap-1">
              {course.prerequisites.map((prereq) => (
                <Badge key={prereq} variant="secondary" className="text-xs font-mono">
                  {prereq}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Eligibility Status */}
        <div className={cn(
          "flex items-start gap-2 p-2 rounded-md border",
          course.isEligible 
            ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800" 
            : "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800"
        )}>
          {course.isEligible ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-green-700 dark:text-green-300">
                Eligible to select
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-yellow-700 dark:text-yellow-300">
                {course.ineligibilityReason || "Not eligible"}
              </span>
            </>
          )}
        </div>

        {/* Action Button */}
        <Button
          onClick={(e) => {
            e.stopPropagation();
            handleAction();
          }}
          disabled={!canInteract}
          variant={course.isSelected ? "outline" : "default"}
          className={cn(
            "w-full font-semibold transition-all",
            course.isSelected && "border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          )}
          size="default"
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
