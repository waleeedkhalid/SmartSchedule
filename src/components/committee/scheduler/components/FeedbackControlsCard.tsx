/**
 * Feedback Controls Card Component
 * Memoized to prevent unnecessary re-renders
 */

import React, { memo, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { MessageSquare, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { FeedbackSettings } from "../types";

interface FeedbackControlsCardProps {
  feedbackSettings: FeedbackSettings;
  updateFeedbackSetting: (key: keyof FeedbackSettings, value: boolean) => Promise<boolean>;
  updatingSettings: boolean;
}

export const FeedbackControlsCard = memo(function FeedbackControlsCard({
  feedbackSettings,
  updateFeedbackSetting,
  updatingSettings,
}: FeedbackControlsCardProps) {
  const { toast } = useToast();

  const handleSettingChange = useCallback(
    async (key: keyof FeedbackSettings, checked: boolean) => {
      const success = await updateFeedbackSetting(key, checked);
      
      if (success) {
        toast({
          title: "Settings updated",
          description: `Feedback ${key === "feedback_open" ? "period" : "publication"} has been ${checked ? "enabled" : "disabled"}.`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update settings. Please try again.",
        });
      }
    },
    [updateFeedbackSetting, toast]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Student Feedback Controls
        </CardTitle>
        <CardDescription>
          Manage when students can submit feedback about their schedules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Use these controls to open or close the feedback period for students.
            Students can only submit feedback when both their schedule is assigned and
            the feedback period is open.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Schedule Published Toggle */}
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="schedule-published" className="text-base font-medium">
                Schedules Published
              </Label>
              <p className="text-sm text-muted-foreground">
                Mark schedules as published and visible to students
              </p>
            </div>
            <Switch
              id="schedule-published"
              checked={feedbackSettings.schedule_published}
              onCheckedChange={(checked) =>
                handleSettingChange("schedule_published", checked)
              }
              disabled={updatingSettings}
            />
          </div>

          {/* Feedback Open Toggle */}
          <div className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="feedback-open" className="text-base font-medium">
                Feedback Period Open
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow students to submit feedback about their schedules
              </p>
            </div>
            <Switch
              id="feedback-open"
              checked={feedbackSettings.feedback_open}
              onCheckedChange={(checked) =>
                handleSettingChange("feedback_open", checked)
              }
              disabled={updatingSettings}
            />
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-4">
          <h4 className="mb-2 text-sm font-medium">Current Status</h4>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Schedules Published:</span>
              <span className="font-medium">
                {feedbackSettings.schedule_published ? (
                  <span className="text-green-600 dark:text-green-400">Yes</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">No</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Feedback Open:</span>
              <span className="font-medium">
                {feedbackSettings.feedback_open ? (
                  <span className="text-green-600 dark:text-green-400">Yes</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">No</span>
                )}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <span className="text-muted-foreground">Students Can Submit Feedback:</span>
              <span className="font-medium">
                {feedbackSettings.schedule_published && feedbackSettings.feedback_open ? (
                  <span className="text-green-600 dark:text-green-400">Yes</span>
                ) : (
                  <span className="text-red-600 dark:text-red-400">No</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

