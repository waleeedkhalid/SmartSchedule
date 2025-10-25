/**
 * GenerationProgress Component
 * 
 * Displays real-time progress during schedule generation with:
 * - Current step indication
 * - Progress bar
 * - Animated status updates
 * - Estimated time remaining
 */

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Users,
  BookOpen,
  CalendarCheck,
  AlertTriangle
} from "lucide-react";

export interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed' | 'error';
  message?: string;
}

export interface GenerationProgressProps {
  isGenerating: boolean;
  currentStep?: string;
  progress: number; // 0-100
  steps: GenerationStep[];
  stats?: {
    levelsProcessed?: number;
    totalLevels?: number;
    sectionsCreated?: number;
    conflictsDetected?: number;
    estimatedTimeRemaining?: number; // in seconds
  };
  error?: string | null;
}

export function GenerationProgress({
  isGenerating,
  currentStep,
  progress,
  steps,
  stats,
  error,
}: GenerationProgressProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStepIcon = (status: GenerationStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-destructive" />;
      default:
        return <div className="w-5 h-5 rounded-full border-2 border-muted" />;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                Generating Schedule
              </>
            ) : error ? (
              <>
                <XCircle className="w-5 h-5 text-destructive" />
                Generation Failed
              </>
            ) : progress === 100 ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Generation Complete
              </>
            ) : (
              "Schedule Generation"
            )}
          </CardTitle>
          
          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{formatTime(elapsedTime)}</span>
              {stats?.estimatedTimeRemaining !== undefined && (
                <span className="ml-2">
                  (~{formatTime(stats.estimatedTimeRemaining)} remaining)
                </span>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Current Step */}
        {currentStep && (
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg">
            <p className="text-sm font-medium text-primary">{currentStep}</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive mb-1">
                  Generation Error
                </p>
                <p className="text-sm text-destructive/80">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Generation Steps */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Generation Steps</h4>
          <div className="space-y-2">
            {steps.map((step) => (
              <div
                key={step.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  step.status === 'in_progress'
                    ? 'bg-primary/5 border border-primary/10'
                    : step.status === 'completed'
                    ? 'bg-green-50 border border-green-100'
                    : step.status === 'error'
                    ? 'bg-destructive/5 border border-destructive/10'
                    : 'bg-muted/30'
                }`}
              >
                <div className="mt-0.5">{getStepIcon(step.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{step.label}</p>
                  {step.message && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            {stats.levelsProcessed !== undefined && stats.totalLevels !== undefined && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Levels</p>
                  <p className="text-sm font-semibold">
                    {stats.levelsProcessed}/{stats.totalLevels}
                  </p>
                </div>
              </div>
            )}

            {stats.sectionsCreated !== undefined && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Sections</p>
                  <p className="text-sm font-semibold">{stats.sectionsCreated}</p>
                </div>
              </div>
            )}

            {stats.conflictsDetected !== undefined && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conflicts</p>
                  <p className="text-sm font-semibold">{stats.conflictsDetected}</p>
                </div>
              </div>
            )}

            {progress === 100 && !error && (
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CalendarCheck className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Complete
                  </Badge>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

