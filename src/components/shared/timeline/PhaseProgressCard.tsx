"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Circle, Clock } from "lucide-react";
import { MockTimelinePhase } from "@/types/scheduler-mock";
import { format, differenceInDays } from "date-fns";

interface PhaseProgressCardProps {
  phase: MockTimelinePhase;
  compact?: boolean;
}

export function PhaseProgressCard({ phase, compact = false }: PhaseProgressCardProps) {
  const daysRemaining = differenceInDays(new Date(phase.end_date), new Date());
  
  const getPhaseIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "ACTIVE":
        return <Circle className="h-4 w-4 text-blue-600 fill-blue-600" />;
      case "UPCOMING":
        return <Circle className="h-4 w-4 text-gray-300" />;
      default:
        return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "ACTIVE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "UPCOMING":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {getPhaseIcon(phase.status)}
              <span className="font-medium text-sm">{phase.name}</span>
            </div>
            <Badge className={getStatusColor(phase.status)} variant="outline">
              {phase.status}
            </Badge>
          </div>
          {phase.status === "ACTIVE" && (
            <>
              <Progress value={phase.progress} className="h-2 mb-2" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{phase.progress}% complete</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {daysRemaining > 0 ? `${daysRemaining}d left` : "Ending soon"}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getPhaseIcon(phase.status)}
              <h3 className="font-semibold">{phase.name}</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              {format(new Date(phase.start_date), "MMM dd")} -{" "}
              {format(new Date(phase.end_date), "MMM dd, yyyy")}
            </p>
          </div>
          <Badge className={getStatusColor(phase.status)}>{phase.status}</Badge>
        </div>

        {phase.status === "ACTIVE" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Progress: {phase.progress}%</span>
              <span className="text-muted-foreground">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : "Ending soon"}
              </span>
            </div>
            <Progress value={phase.progress} className="h-2" />
          </div>
        )}

        {phase.tasks.length > 0 && (
          <div className="mt-4 space-y-2">
            {phase.tasks.map((task) => (
              <div key={task.id} className="flex items-center gap-2 text-sm">
                {task.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Circle className="h-4 w-4 text-gray-400" />
                )}
                <span className={task.completed ? "line-through text-muted-foreground" : ""}>
                  {task.title}
                </span>
                {task.required && (
                  <Badge variant="outline" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

