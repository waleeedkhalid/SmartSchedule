// Student Elective Selection - Production Page
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ElectiveBrowser,
  ReviewSubmitDialog,
  SubmissionSuccess,
  SelectedCourse,
} from "@/components/student/electives";
import { mockElectivePackages } from "@/data/demo-data";
import { useAuth } from "@/components/auth/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";

type FlowStep = "selection" | "success";

interface StudentProfile {
  studentId: string;
  name: string;
  email: string;
  level: number;
  major: string;
  gpa: number;
  completedCredits: number;
  totalCredits: number;
  completedCourses: string[];
}

export default function ElectiveSelectionPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [flowStep, setFlowStep] = useState<FlowStep>("selection");
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [pendingSelections, setPendingSelections] = useState<SelectedCourse[]>(
    []
  );
  const [submissionData, setSubmissionData] = useState<{
    id: string;
    timestamp: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Student profile data fetched from API
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(
    null
  );

  // Fetch student profile data from API
  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!user?.email) return;

      try {
        const response = await fetch(
          `/api/student/profile?userId=${encodeURIComponent(user.email)}`
        );
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to fetch student profile");
        }

        setStudentProfile(data.student);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student profile:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load student profile. Please try again."
        );
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/");
      } else {
        fetchStudentProfile();
      }
    }
  }, [user, authLoading, router]);

  // Handle submission flow
  const handleReviewSubmit = (selections: SelectedCourse[]) => {
    setPendingSelections(selections);
    setShowReviewDialog(true);
  };

  const handleConfirmSubmit = async () => {
    if (!studentProfile) return;

    const payload = {
      studentId: studentProfile.studentId,
      selections: pendingSelections.map((s) => ({
        packageId: s.packageId,
        courseCode: s.code,
        priority: s.priority,
      })),
    };

    try {
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
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Submission Failed", {
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit preferences. Please try again.",
      });
    }
  };

  // Reset flow
  const handleReturnHome = () => {
    router.push("/student");
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-[1800px]">
        <div className="mb-8">
          <Skeleton className="h-10 w-32 mb-4" />
          <Skeleton className="h-9 w-80 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>

        {/* Package Navigation Skeleton */}
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-10 w-32" />
          ))}
        </div>

        {/* Course Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full mb-3" />
                <Skeleton className="h-9 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="container max-w-md">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button onClick={() => router.push("/student")}>
              Return to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!studentProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {flowStep === "selection" && (
        <div className="container mx-auto px-4 py-8 max-w-[1800px]">
          {/* Header */}
          <div className="mb-8">
            <Link href="/student">
              <Button variant="ghost" size="sm" className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <h1 className="text-3xl font-bold mb-2">
              Elective Course Selection
            </h1>
            <p className="text-muted-foreground">
              Welcome, {studentProfile.name} • Level {studentProfile.level}
            </p>
          </div>

          {/* Main Content */}
          <ElectiveBrowser
            electivePackages={mockElectivePackages}
            completedCourses={studentProfile.completedCourses}
            maxSelections={10}
            onSubmit={handleReviewSubmit}
          />

          {/* Review Dialog */}
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
        </div>
      )}

      {flowStep === "success" && submissionData && (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
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
