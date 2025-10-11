// Complete Student Elective Selection Demo Page
"use client";

import React, { useState } from "react";
import {
  StudentLoginForm,
  StudentSession,
  ElectiveBrowser,
  ReviewSubmitDialog,
  SubmissionSuccess,
  SelectedCourse,
} from "@/components/student/electives";
import { mockElectivePackages } from "@/data/demo-data";
import { PageContainer } from "@/components/shared";

type FlowStep = "login" | "selection" | "success";

export default function ElectiveSelectionPage() {
  const [flowStep, setFlowStep] = useState<FlowStep>("login");
  const [studentSession, setStudentSession] = useState<StudentSession | null>(
    null
  );
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [pendingSelections, setPendingSelections] = useState<SelectedCourse[]>(
    []
  );
  const [submissionData, setSubmissionData] = useState<{
    id: string;
    timestamp: string;
  } | null>(null);

  // Handle login
  const handleLogin = async (credentials: {
    studentId: string;
    password: string;
  }) => {
    const response = await fetch("/api/auth/student", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Authentication failed");
    }

    return data.session;
  };

  const handleLoginSuccess = (session: StudentSession) => {
    setStudentSession(session);
    setFlowStep("selection");
  };

  // Handle submission flow
  const handleReviewSubmit = (selections: SelectedCourse[]) => {
    setPendingSelections(selections);
    setShowReviewDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!studentSession) return;

    const payload = {
      studentId: studentSession.studentId,
      selections: pendingSelections.map((s) => ({
        packageId: s.packageId,
        courseCode: s.code,
        priority: s.priority,
      })),
    };

    const response = await fetch("/api/electives/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Submission failed");
    }

    setSubmissionData({
      id: data.submissionId,
      timestamp: data.timestamp,
    });

    setShowReviewDialog(false);
    setFlowStep("success");
  };

  // Reset flow
  const handleReturnHome = () => {
    setFlowStep("login");
    setStudentSession(null);
    setPendingSelections([]);
    setSubmissionData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {flowStep === "login" && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <StudentLoginForm
            onLogin={handleLogin}
            onSuccess={handleLoginSuccess}
          />
        </div>
      )}

      {flowStep === "selection" && studentSession && (
        <>
          <PageContainer
            title={`Welcome, ${studentSession.name}`}
            description={`Level ${studentSession.level} - Elective Course Selection`}
          >
            <ElectiveBrowser
              electivePackages={mockElectivePackages}
              completedCourses={studentSession.completedCourses}
              maxSelections={10}
              onSubmit={handleReviewSubmit}
            />
          </PageContainer>

          <ReviewSubmitDialog
            open={showReviewDialog}
            onOpenChange={setShowReviewDialog}
            selectedCourses={pendingSelections}
            packageRequirements={mockElectivePackages.map((pkg) => {
              const coursesInPackage = pendingSelections.filter(
                (c) => c.packageId === pkg.id
              );
              const currentCredits = coursesInPackage.reduce(
                (sum, c) => sum + c.credits,
                0
              );

              return {
                packageId: pkg.id,
                packageLabel: pkg.label,
                minCredits: pkg.minHours,
                maxCredits: pkg.maxHours,
                currentCredits,
                isComplete:
                  currentCredits >= pkg.minHours &&
                  currentCredits <= pkg.maxHours,
              };
            })}
            onConfirmSubmit={handleConfirmSubmit}
          />
        </>
      )}

      {flowStep === "success" && submissionData && (
        <div className="flex items-center justify-center min-h-screen p-4">
          <SubmissionSuccess
            submissionId={submissionData.id}
            timestamp={submissionData.timestamp}
            selectedCourses={pendingSelections}
            onReturnHome={handleReturnHome}
          />
        </div>
      )}
    </div>
  );
}
