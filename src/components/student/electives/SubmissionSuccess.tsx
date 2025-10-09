// Submission Success Component
"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Download, Home, Calendar } from "lucide-react";
import { SelectedCourse } from "./SelectionPanel";

interface SubmissionSuccessProps {
  submissionId: string;
  timestamp: string;
  selectedCourses: SelectedCourse[];
  onReturnHome?: () => void;
  onViewSchedule?: () => void;
  onDownloadReceipt?: () => void;
}

export function SubmissionSuccess({
  submissionId,
  timestamp,
  selectedCourses,
  onReturnHome,
  onViewSchedule,
  onDownloadReceipt,
}: SubmissionSuccessProps) {
  const formattedDate = new Date(timestamp).toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  });

  const totalCredits = selectedCourses.reduce((sum, c) => sum + c.credits, 0);

  // Group by package
  const coursesByPackage = selectedCourses.reduce((acc, course) => {
    if (!acc[course.packageId]) {
      acc[course.packageId] = {
        label: course.category,
        courses: [],
      };
    }
    acc[course.packageId].courses.push(course);
    return acc;
  }, {} as Record<string, { label: string; courses: SelectedCourse[] }>);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                Preferences Submitted Successfully!
              </h2>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your elective course preferences have been recorded and sent to
                the scheduling committee.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Details */}
      <Card>
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
          <CardDescription>
            Keep this information for your records
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Submission ID
              </p>
              <p className="text-sm font-mono bg-muted px-2 py-1 rounded">
                {submissionId}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Submitted At
              </p>
              <p className="text-sm">{formattedDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Total Courses
              </p>
              <p className="text-sm font-semibold">
                {selectedCourses.length} courses
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                Total Credits
              </p>
              <p className="text-sm font-semibold">
                {totalCredits} credit hours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ranked Selections Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Your Ranked Selections</CardTitle>
          <CardDescription>
            Courses are listed in order of your preference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(coursesByPackage).map(([packageId, data]) => (
            <div key={packageId} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{data.label}</h4>
                <Badge variant="secondary">
                  {data.courses.reduce((sum, c) => sum + c.credits, 0)} credits
                </Badge>
              </div>
              <div className="space-y-1.5">
                {data.courses
                  .sort((a, b) => a.priority - b.priority)
                  .map((course) => (
                    <div
                      key={course.code}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className="text-xs font-medium"
                        >
                          #{course.priority}
                        </Badge>
                        <div>
                          <span className="font-medium">{course.code}</span>
                          <span className="text-muted-foreground mx-2">•</span>
                          <span>{course.name}</span>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {course.credits} credits
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* What's Next */}
      <Card>
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary flex-shrink-0">
              1
            </div>
            <div>
              <p className="text-sm font-medium">Review Period</p>
              <p className="text-xs text-muted-foreground">
                The scheduling committee will review all student preferences.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary flex-shrink-0">
              2
            </div>
            <div>
              <p className="text-sm font-medium">Schedule Generation</p>
              <p className="text-xs text-muted-foreground">
                An optimized schedule will be generated considering all
                preferences and constraints.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary flex-shrink-0">
              3
            </div>
            <div>
              <p className="text-sm font-medium">Notification</p>
              <p className="text-xs text-muted-foreground">
                You&apos;ll be notified when your final schedule is available
                (typically within 1-2 weeks).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onDownloadReceipt && (
          <Button
            variant="outline"
            onClick={onDownloadReceipt}
            className="flex-1"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
        )}
        {onViewSchedule && (
          <Button variant="outline" onClick={onViewSchedule} className="flex-1">
            <Calendar className="mr-2 h-4 w-4" />
            View Current Schedule
          </Button>
        )}
        {onReturnHome && (
          <Button onClick={onReturnHome} className="flex-1">
            <Home className="mr-2 h-4 w-4" />
            Return to Dashboard
          </Button>
        )}
      </div>

      {/* Help Section */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-center text-muted-foreground">
            Questions about your submission?{" "}
            <button className="text-primary hover:underline font-medium">
              Contact the registrar&apos;s office
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
