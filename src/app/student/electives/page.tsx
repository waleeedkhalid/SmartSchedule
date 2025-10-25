"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/use-auth";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { ElectiveBrowser, ElectivePackage, SelectedCourse } from "@/components/student/electives";

interface StudentProfile {
  studentId: string;
  name: string;
  email: string;
  level: number;
  major: string;
  completedCourses: string[];
}

interface ElectivesData {
  electivePackages: ElectivePackage[];
  completedCourses: string[];
  currentPreferences: {
    code: string;
    priority: number;
  }[];
  preferenceStatus: "DRAFT" | "SUBMITTED" | null;
  submittedAt: string | null;
  surveyTerm: {
    code: string;
    name: string;
    electives_survey_open: boolean;
  } | null;
}

export default function ElectiveSelectionPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [electivesData, setElectivesData] = useState<ElectivesData | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Memoize loadData to prevent recreation on every render
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch electives data from API
      const response = await fetch("/api/student/electives", {
        // Add caching headers for better performance
        headers: {
          'Cache-Control': 'max-age=300', // Cache for 5 minutes client-side
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch electives data");
      }

      const data: ElectivesData = await response.json();
      setElectivesData(data);

      // Set student profile
      setStudentProfile({
        studentId: user?.id || "",
        name: user?.user_metadata?.name || user?.user_metadata?.full_name || "Student",
        email: user?.email || "",
        level: user?.user_metadata?.level || 0,
        major: "Software Engineering",
        completedCourses: data.completedCourses,
      });
      
      setLoading(false);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("Failed to load electives data. Please try again.");
      setLoading(false);
    }
  }, [user?.id, user?.user_metadata, user?.email]);

  // Memoize handleSubmit to prevent unnecessary re-renders of child components
  const handleSubmit = useCallback(async (selections: SelectedCourse[]) => {
    try {
      if (!electivesData?.surveyTerm || !electivesData.surveyTerm.electives_survey_open) {
        throw new Error("Elective survey is not currently open. Please check the academic timeline.");
      }

      // Transform selections for API - this is a preference survey, not enrollment
      const payload = {
        selections: selections.map((s) => ({
          course_code: s.code,
          term_code: electivesData.surveyTerm!.code,
        })),
      };

      // Submit to API
      const response = await fetch("/api/student/electives/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit preferences");
      }

      const result = await response.json();
      console.log("Submission result:", result);
      
      toast.success(result.message || "Your preferences have been recorded successfully!");
      setSubmitted(true);

      // Redirect after a delay
      setTimeout(() => {
        router.push("/student/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error(
        error instanceof Error 
          ? error.message 
          : "Failed to submit preferences. Please try again."
      );
    }
  }, [electivesData?.surveyTerm, router]);

  // Memoize navigation callback
  const handleReturnToDashboard = useCallback(() => {
    router.push("/student/dashboard");
  }, [router]);

  // Memoize loading skeleton to prevent re-renders
  const loadingSkeleton = useMemo(() => (
    <div className="container mx-auto px-4 py-8 max-w-[1800px]">
      <div className="mb-8">
        <Skeleton className="h-10 w-32 mb-4" />
        <Skeleton className="h-9 w-80 mb-2" />
        <Skeleton className="h-5 w-64" />
      </div>

      {/* Package Navigation Skeleton - Fixed height to prevent layout shift */}
      <div className="flex gap-2 mb-6 min-h-[2.5rem]">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-10 w-32" />
        ))}
      </div>

      {/* Course Grid Skeleton - Fixed height to prevent layout shift */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="min-h-[200px]">
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
  ), []);

  // Memoize error state to prevent re-renders
  const errorView = useMemo(() => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="container max-w-md">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4 text-center">
          <Button onClick={handleReturnToDashboard}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    </div>
  ), [error, handleReturnToDashboard]);

  // Memoize success state to prevent re-renders
  const successView = useMemo(() => (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
              <svg
                className="w-8 h-8 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold">Survey Submitted!</h2>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">
            Your elective preferences have been recorded. We&apos;ll use this information to plan which courses to offer.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Redirecting to dashboard...</span>
          </div>
        </CardContent>
      </Card>
    </div>
  ), []);

  // Memoize student info display to prevent re-renders
  const studentInfoText = useMemo(() => {
    if (!studentProfile) return "";
    return `Welcome, ${studentProfile.name} • Level ${studentProfile.level}`;
  }, [studentProfile]);

  // Memoize survey term display
  const surveyTermText = useMemo(() => {
    if (!electivesData?.surveyTerm) return null;
    return (
      <span className="ml-2 text-primary font-medium">
        • Survey for: {electivesData.surveyTerm.name}
      </span>
    );
  }, [electivesData?.surveyTerm]);

  // Memoize alert content
  const surveyAlert = useMemo(() => {
    if (!electivesData?.surveyTerm) return null;
    if (!electivesData.surveyTerm.electives_survey_open) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            ⚠️ The elective preference survey is currently closed. Please check the academic timeline for the survey period.
          </AlertDescription>
        </Alert>
      );
    }
    return (
      <Alert className="mt-4">
        <AlertDescription>
          📋 This is a <strong>preference survey</strong> to help us plan which electives to offer. 
          This is NOT course registration. You&apos;ll register for courses during the official registration period.
        </AlertDescription>
      </Alert>
    );
  }, [electivesData?.surveyTerm]);

  // Effect to handle data loading
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router, loadData]);

  // Render loading state
  if (authLoading || loading) {
    return loadingSkeleton;
  }

  // Render error state
  if (error) {
    return errorView;
  }

  // Render empty state
  if (!studentProfile || !electivesData) {
    return null;
  }

  // Render success state
  if (submitted) {
    return successView;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-[1800px]">
        {/* Header */}
        <div className="mb-8">
          <Link href="/student/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">
            Elective Course Preference Survey
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              {studentInfoText}
              {surveyTermText}
            </p>
            {electivesData?.preferenceStatus === "SUBMITTED" && (
              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-100 border-green-300 dark:border-green-700">
                ✓ Submitted
              </Badge>
            )}
            {electivesData?.preferenceStatus === "DRAFT" && (
              <Badge variant="secondary">
                Draft Saved
              </Badge>
            )}
          </div>
          {surveyAlert}
        </div>

        {/* Main Content */}
        <ElectiveBrowser
          electivePackages={electivesData.electivePackages}
          completedCourses={electivesData.completedCourses}
          maxSelections={6}
          onSubmit={handleSubmit}
          termCode={electivesData.surveyTerm?.code || ""}
          initialSelections={electivesData.currentPreferences}
          preferenceStatus={electivesData.preferenceStatus}
          submittedAt={electivesData.submittedAt}
          enableAutoSave={true}
        />
      </div>
    </div>
  );
}
