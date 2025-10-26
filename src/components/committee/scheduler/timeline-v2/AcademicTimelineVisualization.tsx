"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Circle,
  Clock,
  Calendar,
  AlertCircle,
  ChevronRight,
} from "lucide-react";
import {
  MockTimelinePhase,
  MockAcademicEvent,
  AcademicPhase,
} from "@/types/scheduler-mock";
import { format, differenceInDays, isAfter, isBefore, isToday } from "date-fns";

interface AcademicTimelineVisualizationProps {
  phases: MockTimelinePhase[];
  upcomingEvents: MockAcademicEvent[];
  currentPhase: AcademicPhase;
}

export function AcademicTimelineVisualization({
  phases,
  upcomingEvents,
  currentPhase,
}: AcademicTimelineVisualizationProps) {
  const getPhaseIcon = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "ACTIVE":
        return <Circle className="h-5 w-5 text-blue-600 fill-blue-600" />;
      case "UPCOMING":
        return <Circle className="h-5 w-5 text-gray-300" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getPhaseColor = (status: string) => {
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

  const getEventPriorityColor = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-red-100 text-red-800 border-red-200";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "LOW":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getDaysUntil = (date: string) => {
    const targetDate = new Date(date);
    const today = new Date();
    return differenceInDays(targetDate, today);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Academic Timeline</h2>
        <p className="text-muted-foreground">
          Track phases, milestones, and important dates
        </p>
      </div>

      {/* Timeline Phases */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Academic Phases
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {phases.map((phase, index) => {
              const isActive = phase.status === "ACTIVE";
              const isCompleted = phase.status === "COMPLETED";
              const daysRemaining = getDaysUntil(phase.end_date);

              return (
                <div key={phase.phase} className="relative">
                  {/* Connector Line */}
                  {index < phases.length - 1 && (
                    <div className="absolute left-2.5 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  <div className="flex gap-4">
                    {/* Icon */}
                    <div className="relative z-10 flex-shrink-0">
                      {getPhaseIcon(phase.status)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pb-8">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{phase.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(phase.start_date), "MMM dd")} -{" "}
                            {format(new Date(phase.end_date), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <Badge className={getPhaseColor(phase.status)}>
                          {phase.status}
                        </Badge>
                      </div>

                      {/* Progress */}
                      {isActive && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">
                              Progress: {phase.progress}%
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {daysRemaining > 0
                                ? `${daysRemaining} days remaining`
                                : "Ending soon"}
                            </span>
                          </div>
                          <Progress value={phase.progress} className="h-2" />
                        </div>
                      )}

                      {/* Tasks */}
                      {phase.tasks.length > 0 && (
                        <div className="space-y-2 mt-3">
                          {phase.tasks.map((task) => (
                            <div
                              key={task.id}
                              className="flex items-center gap-2 text-sm"
                            >
                              {task.completed ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : (
                                <Circle className="h-4 w-4 text-gray-400" />
                              )}
                              <span
                                className={
                                  task.completed
                                    ? "line-through text-muted-foreground"
                                    : ""
                                }
                              >
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
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Upcoming Events & Deadlines
            </CardTitle>
            <Badge variant="secondary">
              {upcomingEvents.length} events
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingEvents.map((event) => {
                const daysUntil = getDaysUntil(event.start_date);
                const isUrgent = daysUntil <= 7 && daysUntil >= 0;

                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border ${
                      isUrgent
                        ? "border-orange-200 bg-orange-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <Clock
                        className={`h-5 w-5 ${
                          isUrgent ? "text-orange-600" : "text-gray-600"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold">{event.title}</h4>
                        <Badge className={getEventPriorityColor(event.priority)}>
                          {event.priority}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(event.start_date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        {daysUntil >= 0 && (
                          <Badge
                            variant="outline"
                            className={isUrgent ? "border-orange-600 text-orange-600" : ""}
                          >
                            {daysUntil === 0
                              ? "Today"
                              : daysUntil === 1
                              ? "Tomorrow"
                              : `In ${daysUntil} days`}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

