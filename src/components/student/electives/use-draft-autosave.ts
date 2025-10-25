import { useEffect, useRef, useState, useCallback } from "react";
import { SelectedCourse } from "./SelectionPanel";

export interface AutoSaveStatus {
  status: "idle" | "saving" | "saved" | "error";
  lastSaved: Date | null;
  error: string | null;
}

export function useDraftAutoSave(
  selections: SelectedCourse[],
  termCode: string | null,
  enabled: boolean = true,
  debounceMs: number = 2000
) {
  const [saveStatus, setSaveStatus] = useState<AutoSaveStatus>({
    status: "idle",
    lastSaved: null,
    error: null,
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousSelectionsRef = useRef<string>("");

  const saveDraft = useCallback(async () => {
    if (!termCode || !enabled) return;

    try {
      setSaveStatus((prev) => ({ ...prev, status: "saving", error: null }));

      const preferences = selections.map((s) => ({
        course_code: s.code,
        preference_order: s.priority,
      }));

      const response = await fetch("/api/student/electives/draft", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preferences,
          term_code: termCode,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save draft");
      }

      setSaveStatus({
        status: "saved",
        lastSaved: new Date(),
        error: null,
      });

      // Reset to idle after 3 seconds
      setTimeout(() => {
        setSaveStatus((prev) => ({
          ...prev,
          status: prev.status === "saved" ? "idle" : prev.status,
        }));
      }, 3000);
    } catch (error) {
      console.error("Draft save error:", error);
      setSaveStatus({
        status: "error",
        lastSaved: null,
        error: error instanceof Error ? error.message : "Failed to save draft",
      });
    }
  }, [selections, termCode, enabled]);

  useEffect(() => {
    if (!enabled || !termCode) return;

    // Serialize selections for comparison
    const currentSelections = JSON.stringify(
      selections.map((s) => ({ code: s.code, priority: s.priority }))
    );

    // Skip if selections haven't changed
    if (currentSelections === previousSelectionsRef.current) {
      return;
    }

    previousSelectionsRef.current = currentSelections;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Skip auto-save if no selections
    if (selections.length === 0) {
      return;
    }

    // Set new timeout for debounced save
    timeoutRef.current = setTimeout(() => {
      saveDraft();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [selections, termCode, enabled, debounceMs, saveDraft]);

  return { saveStatus, saveDraft };
}

