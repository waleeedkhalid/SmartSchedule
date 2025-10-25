"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import type { PriorityWeights } from "@/types/scheduler";

interface PriorityWeightsEditorProps {
  weights: PriorityWeights;
  onChange: (weights: PriorityWeights) => void;
  readOnly?: boolean;
}

interface WeightConfig {
  key: keyof PriorityWeights;
  label: string;
  description: string;
  color: string;
}

const WEIGHT_CONFIGS: WeightConfig[] = [
  {
    key: "time_preference",
    label: "Time Preference",
    description: "Priority for scheduling during preferred time slots",
    color: "bg-blue-500",
  },
  {
    key: "faculty_preference",
    label: "Faculty Preference",
    description: "Priority for respecting faculty availability and preferences",
    color: "bg-green-500",
  },
  {
    key: "elective_preference",
    label: "Elective Preference",
    description: "Priority for assigning students to preferred electives",
    color: "bg-purple-500",
  },
  {
    key: "minimize_gaps",
    label: "Minimize Gaps",
    description: "Priority for reducing gaps between classes",
    color: "bg-orange-500",
  },
  {
    key: "room_optimization",
    label: "Room Optimization",
    description: "Priority for efficient room utilization",
    color: "bg-cyan-500",
  },
  {
    key: "load_balancing",
    label: "Load Balancing",
    description: "Priority for balanced faculty teaching loads",
    color: "bg-pink-500",
  },
];

const DEFAULT_WEIGHTS: PriorityWeights = {
  time_preference: 0.2,
  faculty_preference: 0.2,
  elective_preference: 0.15,
  minimize_gaps: 0.15,
  room_optimization: 0.15,
  load_balancing: 0.15,
};

export function PriorityWeightsEditor({
  weights,
  onChange,
  readOnly = false,
}: PriorityWeightsEditorProps) {
  const [localWeights, setLocalWeights] = useState<PriorityWeights>(weights);
  const [totalWeight, setTotalWeight] = useState(1.0);

  useEffect(() => {
    const total = Object.values(localWeights).reduce((sum, w) => sum + w, 0);
    setTotalWeight(total);
  }, [localWeights]);

  const handleWeightChange = (key: keyof PriorityWeights, value: number) => {
    const newWeights = { ...localWeights, [key]: value };
    setLocalWeights(newWeights);
  };

  const handleApply = () => {
    onChange(localWeights);
  };

  const handleReset = () => {
    setLocalWeights(DEFAULT_WEIGHTS);
  };

  const handleNormalize = () => {
    const total = Object.values(localWeights).reduce((sum, w) => sum + w, 0);
    if (total === 0) return;

    const normalizedWeights = Object.keys(localWeights).reduce((acc, key) => {
      acc[key as keyof PriorityWeights] = localWeights[key as keyof PriorityWeights] / total;
      return acc;
    }, {} as PriorityWeights);

    setLocalWeights(normalizedWeights);
  };

  const isValid = Math.abs(totalWeight - 1.0) < 0.01;
  const hasChanges = JSON.stringify(localWeights) !== JSON.stringify(weights);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Priority Weights Configuration</CardTitle>
            <CardDescription>
              Adjust the importance of different scheduling criteria. All weights must sum to 1.0
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isValid ? "default" : "destructive"} className="gap-1">
              {isValid ? (
                <>
                  <CheckCircle2 className="h-3 w-3" />
                  Valid
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3" />
                  Invalid
                </>
              )}
            </Badge>
            <Badge variant="outline">
              Total: {totalWeight.toFixed(3)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Validation Alert */}
        {!isValid && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              The total weight is {totalWeight.toFixed(3)}. It must equal 1.0 (±0.01).{" "}
              <Button
                variant="link"
                className="h-auto p-0 text-destructive underline"
                onClick={handleNormalize}
              >
                Click here to normalize
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Visual Weight Distribution */}
        <div className="space-y-2">
          <Label>Weight Distribution</Label>
          <div className="h-8 rounded-md overflow-hidden flex">
            {WEIGHT_CONFIGS.map((config) => {
              const percentage = (localWeights[config.key] / totalWeight) * 100;
              return (
                <div
                  key={config.key}
                  className={`${config.color} transition-all`}
                  style={{ width: `${percentage}%` }}
                  title={`${config.label}: ${percentage.toFixed(1)}%`}
                />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            {WEIGHT_CONFIGS.map((config) => (
              <div key={config.key} className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-sm ${config.color}`} />
                <span>{((localWeights[config.key] / totalWeight) * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weight Sliders */}
        <div className="space-y-6">
          {WEIGHT_CONFIGS.map((config) => (
            <div key={config.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-medium">{config.label}</Label>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
                <span className="text-sm font-mono tabular-nums">
                  {localWeights[config.key].toFixed(3)}
                </span>
              </div>
              <Slider
                value={[localWeights[config.key] * 100]}
                onValueChange={([value]) => handleWeightChange(config.key, value / 100)}
                min={0}
                max={100}
                step={1}
                disabled={readOnly}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {!readOnly && (
          <div className="flex gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleReset}
              className="gap-2"
              disabled={!hasChanges}
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
            <Button
              variant="outline"
              onClick={handleNormalize}
              disabled={isValid}
            >
              Normalize
            </Button>
            <div className="flex-1" />
            <Button
              onClick={handleApply}
              disabled={!isValid || !hasChanges}
            >
              Apply Changes
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

