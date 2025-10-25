"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { SchedulingRules } from "@/types/scheduler";

interface RuleFormProps {
  open: boolean;
  onClose: () => void;
  ruleKey: keyof SchedulingRules | null;
  currentValue: any;
  onSave: (key: keyof SchedulingRules, value: any) => void;
}

interface RuleFieldConfig {
  type: "number" | "time" | "boolean" | "percentage";
  label: string;
  description: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  validation?: (value: any) => string | null;
}

const RULE_CONFIGS: Record<string, RuleFieldConfig> = {
  max_daily_hours: {
    type: "number",
    label: "Maximum Daily Hours",
    description: "Maximum hours a student can be scheduled per day",
    min: 1,
    max: 12,
    step: 1,
    unit: "hours",
  },
  min_gap_between_classes: {
    type: "number",
    label: "Minimum Gap Between Classes",
    description: "Minimum break time required between consecutive classes",
    min: 0,
    max: 120,
    step: 5,
    unit: "minutes",
  },
  max_gap_between_classes: {
    type: "number",
    label: "Maximum Gap Between Classes",
    description: "Maximum gap allowed between classes in a day",
    min: 60,
    max: 360,
    step: 30,
    unit: "minutes",
  },
  earliest_class_time: {
    type: "time",
    label: "Earliest Class Time",
    description: "Earliest time a class can be scheduled",
  },
  latest_class_time: {
    type: "time",
    label: "Latest Class Time",
    description: "Latest time a class can end",
  },
  max_weekly_hours: {
    type: "number",
    label: "Maximum Weekly Hours",
    description: "Maximum credit hours per week",
    min: 12,
    max: 30,
    step: 1,
    unit: "hours",
  },
  allow_back_to_back: {
    type: "boolean",
    label: "Allow Back-to-Back Classes",
    description: "Allow classes to be scheduled with no gap between them",
  },
  max_students_per_section: {
    type: "number",
    label: "Maximum Students Per Section",
    description: "Maximum capacity for each section",
    min: 15,
    max: 50,
    step: 5,
    unit: "students",
  },
  min_students_per_section: {
    type: "number",
    label: "Minimum Students Per Section",
    description: "Minimum enrollment required to keep section open",
    min: 5,
    max: 30,
    step: 5,
    unit: "students",
  },
  allow_section_overflow: {
    type: "boolean",
    label: "Allow Section Overflow",
    description: "Allow sections to exceed capacity by a small percentage",
  },
  overflow_percentage: {
    type: "percentage",
    label: "Overflow Percentage",
    description: "Maximum percentage over capacity allowed",
    min: 0,
    max: 20,
    step: 5,
  },
  respect_faculty_availability: {
    type: "boolean",
    label: "Respect Faculty Availability",
    description: "Honor faculty availability preferences when scheduling",
  },
  max_faculty_daily_hours: {
    type: "number",
    label: "Maximum Faculty Daily Hours",
    description: "Maximum teaching hours per day for faculty",
    min: 2,
    max: 10,
    step: 1,
    unit: "hours",
  },
  min_gap_between_faculty_classes: {
    type: "number",
    label: "Minimum Gap Between Faculty Classes",
    description: "Minimum break time for faculty between classes",
    min: 10,
    max: 60,
    step: 5,
    unit: "minutes",
  },
  min_days_between_exams: {
    type: "number",
    label: "Minimum Days Between Exams",
    description: "Minimum days between exams for the same student",
    min: 0,
    max: 7,
    step: 1,
    unit: "days",
  },
  avoid_exam_conflicts: {
    type: "boolean",
    label: "Avoid Exam Conflicts",
    description: "Prevent students from having multiple exams at the same time",
  },
  max_exams_per_day: {
    type: "number",
    label: "Maximum Exams Per Day",
    description: "Maximum number of exams a student can have in one day",
    min: 1,
    max: 4,
    step: 1,
    unit: "exams",
  },
  honor_elective_preferences: {
    type: "boolean",
    label: "Honor Elective Preferences",
    description: "Try to assign students to their preferred elective courses",
  },
  min_preference_rank_to_honor: {
    type: "number",
    label: "Minimum Preference Rank to Honor",
    description: "Only consider student's top N elective preferences",
    min: 1,
    max: 5,
    step: 1,
    unit: "preferences",
  },
  require_room_assignment: {
    type: "boolean",
    label: "Require Room Assignment",
    description: "All sections must have an assigned room",
  },
  respect_room_capacity: {
    type: "boolean",
    label: "Respect Room Capacity",
    description: "Ensure room capacity is not exceeded",
  },
};

export function RuleForm({ open, onClose, ruleKey, currentValue, onSave }: RuleFormProps) {
  const [value, setValue] = useState(currentValue);
  const [error, setError] = useState<string | null>(null);

  if (!ruleKey || !RULE_CONFIGS[ruleKey]) {
    return null;
  }

  const config = RULE_CONFIGS[ruleKey];

  const handleSave = () => {
    // Validate
    if (config.validation) {
      const validationError = config.validation(value);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    // Additional validation
    if (config.type === "number" && config.min !== undefined && value < config.min) {
      setError(`Value must be at least ${config.min}`);
      return;
    }

    if (config.type === "number" && config.max !== undefined && value > config.max) {
      setError(`Value must be at most ${config.max}`);
      return;
    }

    onSave(ruleKey, value);
    onClose();
  };

  const renderInput = () => {
    switch (config.type) {
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <Switch
              id="rule-value"
              checked={value}
              onCheckedChange={setValue}
            />
            <Label htmlFor="rule-value">
              {value ? "Enabled" : "Disabled"}
            </Label>
          </div>
        );

      case "time":
        return (
          <Input
            type="time"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );

      case "percentage":
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Value</Label>
              <span className="text-sm font-medium">{value}%</span>
            </div>
            <Slider
              value={[value]}
              onValueChange={([v]) => setValue(v)}
              min={config.min}
              max={config.max}
              step={config.step}
              className="w-full"
            />
          </div>
        );

      case "number":
      default:
        return (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(Number(e.target.value))}
                min={config.min}
                max={config.max}
                step={config.step}
              />
              {config.unit && (
                <span className="flex items-center px-3 text-sm text-muted-foreground border rounded-md bg-muted">
                  {config.unit}
                </span>
              )}
            </div>
            {config.min !== undefined && config.max !== undefined && (
              <div className="space-y-2">
                <Label>Use Slider</Label>
                <Slider
                  value={[value]}
                  onValueChange={([v]) => setValue(v)}
                  min={config.min}
                  max={config.max}
                  step={config.step}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{config.min} {config.unit}</span>
                  <span>{config.max} {config.unit}</span>
                </div>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Rule: {config.label}</DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Changes will be applied to the rules configuration but won't affect existing schedules
              until regenerated.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label>Current Value</Label>
            {renderInput()}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

