"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAuthHeader } from "@/lib/utils/client-auth";

interface ExamResult {
  success: boolean;
  assigned: number;
  unassigned: number;
  message: string;
}

export function GenerateFinalExamsButton() {
  const [isScheduling, setIsScheduling] = useState(false);

  const handleGenerateExams = useCallback(async () => {
    setIsScheduling(true);

    try {
      const authHeader = await getAuthHeader();

      // Get active term - use AbortController for cleanup
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

      const termsResponse = await fetch("/api/v1/academic-terms?current=true", {
        headers: { Authorization: authHeader },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!termsResponse.ok) {
        throw new Error("Failed to fetch academic term");
      }

      const termsData = await termsResponse.json();
      const activeTerm =
        Array.isArray(termsData.data) && termsData.data.length > 0
          ? termsData.data[0]
          : null;

      if (!activeTerm) {
        throw new Error(
          "No active academic term found. Please set an active term first."
        );
      }

      // Call exam scheduling API with timeout
      const examController = new AbortController();
      const examTimeoutId = setTimeout(() => examController.abort(), 120000); // 2min timeout for exam scheduling

      const response = await fetch("/api/v1/exams/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          term_id: activeTerm.id,
          use_csp_solver: true,
        }),
        signal: examController.signal,
      });

      clearTimeout(examTimeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || errorData.message || "Failed to schedule exams"
        );
      }

      const result = await response.json();
      const examResult: ExamResult = {
        success: result.data?.stats?.unassigned === 0,
        assigned: result.data?.stats?.assigned || 0,
        unassigned: result.data?.stats?.unassigned || 0,
        message: result.data?.message || "Exam scheduling completed",
      };

      if (examResult.success) {
        toast.success(
          `All ${examResult.assigned} exams scheduled successfully!`
        );
      } else if (examResult.assigned > 0) {
        toast.warning(
          `Scheduled ${examResult.assigned} exams. ${examResult.unassigned} could not be scheduled.`
        );
      } else {
        toast.error(
          "No exams could be scheduled. Check your course and room setup."
        );
      }
    } catch (error) {
      console.error("Error scheduling exams:", error);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          toast.error("Request timed out. Please try again.");
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error("Failed to schedule exams. Please try again.");
      }
    } finally {
      setIsScheduling(false);
    }
  }, []);

  return (
    <Button
      onClick={handleGenerateExams}
      disabled={isScheduling}
      className="w-full justify-start"
      variant="outline"
    >
      {isScheduling ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Scheduling Exams...
        </>
      ) : (
        <>
          <GraduationCap className="mr-2 h-4 w-4" />
          Generate Final Exams
        </>
      )}
    </Button>
  );
}
