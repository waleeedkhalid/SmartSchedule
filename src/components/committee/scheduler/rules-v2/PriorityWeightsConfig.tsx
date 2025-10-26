"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Save, RotateCcw, AlertCircle } from "lucide-react";
import { MockRulePriority } from "@/types/scheduler-mock";

interface PriorityWeightsConfigProps {
  priorities: MockRulePriority[];
  onSave?: (priorities: MockRulePriority[]) => void;
  onReset?: () => void;
}

export function PriorityWeightsConfig({
  priorities: initialPriorities,
  onSave,
  onReset,
}: PriorityWeightsConfigProps) {
  const [priorities, setPriorities] = useState(initialPriorities);
  const [hasChanges, setHasChanges] = useState(false);

  const totalWeight = priorities.reduce((sum, p) => sum + p.weight, 0);
  const isBalanced = totalWeight === 100;

  const handleWeightChange = (id: string, newWeight: number[]) => {
    setPriorities((prev) =>
      prev.map((p) => (p.id === id ? { ...p, weight: newWeight[0] } : p))
    );
    setHasChanges(true);
  };

  const handleSave = () => {
    if (isBalanced) {
      onSave?.(priorities);
      setHasChanges(false);
    }
  };

  const handleReset = () => {
    setPriorities(initialPriorities);
    setHasChanges(false);
    onReset?.();
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "STUDENT_PREFERENCES":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "FACULTY_AVAILABILITY":
        return "bg-green-100 text-green-800 border-green-200";
      case "ROOM_OPTIMIZATION":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "TIME_DISTRIBUTION":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              Priority Weights Configuration
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Adjust the importance of different scheduling factors
            </p>
          </div>
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button variant="outline" size="sm" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!isBalanced || !hasChanges}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Weight Indicator */}
        <div
          className={`p-4 rounded-lg border ${
            isBalanced
              ? "border-green-200 bg-green-50"
              : "border-orange-200 bg-orange-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isBalanced ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-green-600" />
                  <span className="font-medium">Weights are balanced</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <span className="font-medium">
                    Weights must total 100%
                  </span>
                </>
              )}
            </div>
            <Badge
              variant={isBalanced ? "default" : "destructive"}
              className="text-lg px-3 py-1"
            >
              {totalWeight}%
            </Badge>
          </div>
        </div>

        {/* Weight Sliders */}
        <div className="space-y-6">
          {priorities.map((priority) => (
            <div key={priority.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Badge className={getCategoryColor(priority.category)}>
                    {priority.category.replace(/_/g, " ")}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {priority.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{priority.weight}%</div>
                </div>
              </div>
              <Slider
                value={[priority.weight]}
                onValueChange={(value) => handleWeightChange(priority.id, value)}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className="text-sm text-muted-foreground bg-gray-50 p-4 rounded-lg">
          <p className="font-medium mb-2">How priority weights work:</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>
              Higher weights give more importance to that scheduling factor
            </li>
            <li>Total weights must equal 100% for the system to function</li>
            <li>Adjust weights based on your institution's priorities</li>
            <li>Changes take effect on the next schedule generation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

