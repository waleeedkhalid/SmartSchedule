"use client";

import * as React from "react";
import {
  ArrowUp,
  ArrowDown,
  Sparkles,
  GripVertical,
  Check,
  Info,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Mock data for demonstration
const initialElectiveRanking = [
  {
    id: "CS301",
    title: "Advanced Algorithms",
    code: "CS301",
    credits: 3,
    description: "Advanced data structures and algorithmic techniques",
  },
  {
    id: "CS302",
    title: "Machine Learning",
    code: "CS302",
    credits: 3,
    description: "Introduction to ML algorithms and applications",
  },
  {
    id: "CS303",
    title: "Database Systems",
    code: "CS303",
    credits: 3,
    description: "Database design and management systems",
  },
  {
    id: "CS304",
    title: "Web Development",
    code: "CS304",
    credits: 3,
    description: "Full-stack web development with modern frameworks",
  },
  {
    id: "CS305",
    title: "Computer Graphics",
    code: "CS305",
    credits: 3,
    description: "3D graphics programming and visualization",
  },
  {
    id: "CS306",
    title: "Network Security",
    code: "CS306",
    credits: 3,
    description: "Cybersecurity principles and network protection",
  },
  {
    id: "CS307",
    title: "Mobile App Development",
    code: "CS307",
    credits: 3,
    description: "iOS and Android application development",
  },
  {
    id: "CS308",
    title: "Artificial Intelligence",
    code: "CS308",
    credits: 3,
    description: "AI fundamentals and practical applications",
  },
];

interface Course {
  id: string;
  title: string;
  code: string;
  credits: number;
  description: string;
}

interface SelectedOption {
  value: string;
  label: string;
  order: number;
  credits: number;
  description: string;
}

export default function StudentElectivePreferences() {
  const [courses] = React.useState<Course[]>(initialElectiveRanking);
  const [selectedOptions, setSelectedOptions] = React.useState<
    SelectedOption[]
  >([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [draggedIndex, setDraggedIndex] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const maxSelections = 6; // Maximum number of electives
  const minSelections = 3; // Minimum recommended selections

  const availableOptions = React.useMemo(() => {
    return courses.filter(
      (course) =>
        !selectedOptions.find((selected) => selected.value === course.id)
    );
  }, [courses, selectedOptions]);

  const totalCredits = React.useMemo(() => {
    return selectedOptions.reduce((sum, option) => sum + option.credits, 0);
  }, [selectedOptions]);

  const handleOptionSelect = (value: string) => {
    if (selectedOptions.length >= maxSelections) return;

    const course = courses.find((opt) => opt.id === value);
    if (
      course &&
      !selectedOptions.find((selected) => selected.value === value)
    ) {
      const newOption: SelectedOption = {
        value: course.id,
        label: course.title,
        order: selectedOptions.length + 1,
        credits: course.credits,
        description: course.description,
      };
      setSelectedOptions((prev) => [...prev, newOption]);
    }
  };

  const removeOption = (valueToRemove: string) => {
    const updatedOptions = selectedOptions
      .filter((option) => option.value !== valueToRemove)
      .map((option, index) => ({ ...option, order: index + 1 }));
    setSelectedOptions(updatedOptions);
  };

  const moveCourse = (currentIndex: number, direction: "up" | "down") => {
    const newOptions = [...selectedOptions];
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= newOptions.length) return;

    [newOptions[currentIndex], newOptions[newIndex]] = [
      newOptions[newIndex],
      newOptions[currentIndex],
    ];

    const reordered = newOptions.map((option, index) => ({
      ...option,
      order: index + 1,
    }));

    setSelectedOptions(reordered);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", "");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const newOptions = [...selectedOptions];
    const [moved] = newOptions.splice(draggedIndex, 1);
    newOptions.splice(dropIndex, 0, moved);

    setSelectedOptions(
      newOptions.map((opt, idx) => ({
        ...opt,
        order: idx + 1,
      }))
    );

    setDraggedIndex(null);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsSubmitting(false);
    setShowSuccess(true);
    setDialogOpen(true);

    // Hide success message after 3 seconds
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const clearAll = () => {
    setSelectedOptions([]);
  };

  const canSubmit = selectedOptions.length >= minSelections;
  const isMaxReached = selectedOptions.length >= maxSelections;

  return (
    <div className="space-y-4">
      {showSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <Check className="h-4 w-4" />
          <AlertDescription>
            Your elective preferences have been successfully updated!
          </AlertDescription>
        </Alert>
      )}

      <Card data-test="student-elective-card" className="w-full max-w-4xl">
        <CardHeader className="gap-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Sparkles className="size-5 text-primary" aria-hidden="true" />
              Prioritize Electives for Allocation
            </CardTitle>
            <CardDescription>
              Select and rank your preferred courses in order of preference. You
              can select up to {maxSelections} courses.
            </CardDescription>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2">
                <Label htmlFor="select-option">
                  Add courses to your preferences
                </Label>
                <Select
                  onValueChange={handleOptionSelect}
                  disabled={isMaxReached}
                >
                  <SelectTrigger id="select-option" className="w-full">
                    <SelectValue
                      placeholder={
                        isMaxReached
                          ? "Maximum selections reached"
                          : availableOptions.length > 0
                          ? "Select a course..."
                          : "All courses selected"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="z-[100]">
                    {availableOptions.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {course.title} ({course.code})
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {course.description} • {course.credits} credits
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedOptions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAll}
                  className="shrink-0"
                >
                  Clear All
                </Button>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {selectedOptions.length} of {maxSelections} courses selected
              </span>
              <span>Total credits: {totalCredits}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {!canSubmit && selectedOptions.length > 0 && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Select at least {minSelections} courses to submit your
                  preferences.
                </AlertDescription>
              </Alert>
            )}

            {selectedOptions.length > 0 ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Your course preferences (drag to reorder):</Label>
                  <span className="text-xs text-muted-foreground">
                    Higher ranked courses have better allocation priority
                  </span>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {selectedOptions.map((option, index) => (
                    <div
                      key={option.value}
                      className={`group flex items-center gap-3 p-4 bg-accent rounded-lg border transition-all duration-200 hover:shadow-sm ${
                        draggedIndex === index ? "opacity-50 scale-95" : ""
                      }`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      role="listitem"
                      tabIndex={0}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                          onClick={() => moveCourse(index, "up")}
                          disabled={index === 0}
                          aria-label={`Move ${option.label} up`}
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>

                        <div className="flex items-center gap-1">
                          <GripVertical className="h-4 w-4 opacity-40 group-hover:opacity-70" />
                          <Badge
                            variant="secondary"
                            className="shrink-0 min-w-[2rem] justify-center"
                          >
                            #{option.order}
                          </Badge>
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                          onClick={() => moveCourse(index, "down")}
                          disabled={index === selectedOptions.length - 1}
                          aria-label={`Move ${option.label} down`}
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm truncate">
                            {option.label}
                          </span>
                          <Badge variant="outline" className="text-xs shrink-0">
                            {option.credits} credits
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {option.description}
                        </p>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOption(option.value)}
                        className="h-8 w-8 p-0 opacity-60 hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground shrink-0"
                        aria-label={`Remove ${option.label}`}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-md border border-dashed bg-muted/40 p-8 text-center">
                <Sparkles className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  No courses selected yet
                </p>
                <p className="text-xs text-muted-foreground">
                  Start by selecting courses from the dropdown above to build
                  your preference list
                </p>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedOptions.length === 0 && "Select courses to get started"}
            {selectedOptions.length > 0 &&
              selectedOptions.length < minSelections &&
              `${minSelections - selectedOptions.length} more course${
                minSelections - selectedOptions.length === 1 ? "" : "s"
              } recommended`}
            {selectedOptions.length >= minSelections && "Ready to submit"}
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            data-test="elective-submit"
            disabled={!canSubmit || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Submitting...
              </>
            ) : (
              `Submit Preferences ${
                selectedOptions.length > 0 ? `(${selectedOptions.length})` : ""
              }`
            )}
          </Button>
        </CardFooter>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-600" />
                Preferences Submitted Successfully
              </DialogTitle>
              <DialogDescription>
                Your course selections have been submitted and saved. You can
                update your preferences anytime before the deadline.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Your top preferences:
              </Label>
              {selectedOptions.slice(0, 3).map((option) => (
                <div
                  key={`confirm-${option.value}`}
                  className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      #{option.order}
                    </Badge>
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {option.credits} credits
                  </Badge>
                </div>
              ))}

              {selectedOptions.length > 3 && (
                <div className="text-center text-sm text-muted-foreground bg-muted/20 rounded-lg py-2">
                  + {selectedOptions.length - 3} more course
                  {selectedOptions.length - 3 === 1 ? "" : "s"} selected
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2 border-t">
                Total: {selectedOptions.length} courses • {totalCredits} credits
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="w-full sm:w-auto"
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  );
}
