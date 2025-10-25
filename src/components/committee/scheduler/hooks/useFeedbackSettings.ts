/**
 * Custom hook for managing feedback settings
 * Implements memoization pattern from performance.md
 */

import { useCallback, useState } from "react";
import type { FeedbackSettings } from "../types";

interface UseFeedbackSettingsReturn {
  feedbackSettings: FeedbackSettings;
  setFeedbackSettings: React.Dispatch<React.SetStateAction<FeedbackSettings>>;
  updateFeedbackSetting: (key: keyof FeedbackSettings, value: boolean) => Promise<boolean>;
  updatingSettings: boolean;
}

export function useFeedbackSettings(
  initialSettings: FeedbackSettings
): UseFeedbackSettingsReturn {
  const [feedbackSettings, setFeedbackSettings] = useState<FeedbackSettings>(initialSettings);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Memoized update function with proper error handling
  const updateFeedbackSetting = useCallback(
    async (key: keyof FeedbackSettings, value: boolean): Promise<boolean> => {
      setUpdatingSettings(true);
      
      try {
        const response = await fetch("/api/committee/scheduler/feedback-settings", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ [key]: value }),
        });

        const data = await response.json();

        if (data.success) {
          setFeedbackSettings((prev) => ({ ...prev, [key]: value }));
          return true;
        }
        
        return false;
      } catch (error) {
        console.error("Error updating feedback settings:", error);
        return false;
      } finally {
        setUpdatingSettings(false);
      }
    },
    [] // No dependencies - function is stable
  );

  return {
    feedbackSettings,
    setFeedbackSettings,
    updateFeedbackSetting,
    updatingSettings,
  };
}

