"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Send, CheckCircle, Lock, AlertCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
} from "@/components/ui/empty";

const feedbackSchema = z.object({
  feedbackText: z.string().min(10, "Feedback must be at least 10 characters"),
  rating: z.number().min(1).max(5),
});

type FeedbackFormData = z.infer<typeof feedbackSchema>;

interface StudentStatus {
  hasSchedule: boolean;
  scheduleId: string | null;
  feedbackOpen: boolean;
  canSubmitFeedback: boolean;
  hasSubmittedFeedback: boolean;
  feedbackEvent?: {
    title: string;
    startDate: string;
    endDate: string;
  } | null;
  activeTerm?: string | null;
}

export default function StudentFeedbackPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [studentStatus, setStudentStatus] = useState<StudentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackSchema),
    defaultValues: {
      feedbackText: "",
      rating: 3,
    },
  });

  const rating = watch("rating");

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/");
      } else {
        fetchStatus();
      }
    }
  }, [user, authLoading, router]);

  const fetchStatus = async () => {
    try {
      const response = await fetch("/api/student/status");
      const data = await response.json();

      if (data.success) {
        setStudentStatus(data.data);
      } else {
        setError(data.error || "Failed to fetch status");
      }
    } catch (err) {
      console.error("Error fetching student status:", err);
      setError("Failed to load status");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (formData: FeedbackFormData) => {
    if (!studentStatus?.canSubmitFeedback) {
      setError("Feedback submission is not currently available");
      return;
    }

    try {
      const response = await fetch("/api/student/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedbackText: formData.feedbackText,
          rating: formData.rating,
          scheduleId: studentStatus.scheduleId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        setTimeout(() => {
          router.push("/student/dashboard");
        }, 2000);
      } else {
        setError(data.error || "Failed to submit feedback");
      }
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-80" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Show locked state if no schedule
  if (!studentStatus?.hasSchedule) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/student/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Schedule Feedback</h1>
          <p className="text-muted-foreground">
            Share your thoughts about your schedule
          </p>
        </div>

        <Empty className="min-h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Calendar className="h-8 w-8" />
            </EmptyMedia>
            <EmptyTitle>No Schedule Available</EmptyTitle>
            <EmptyDescription>
              Feedback will be available once your schedule is released. Please check
              back later or contact the scheduling committee if you have questions.
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild size="lg">
            <Link href="/student/dashboard">Return to Dashboard</Link>
          </Button>
        </Empty>
      </div>
    );
  }

  // Show closed state if feedback period is closed (timeline-based gating)
  if (!studentStatus?.feedbackOpen) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/student/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Schedule Feedback</h1>
          <p className="text-muted-foreground">
            Share your thoughts about your schedule
          </p>
        </div>

        <Empty className="min-h-[400px]">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Lock className="h-8 w-8" />
            </EmptyMedia>
            <EmptyTitle>Feedback Period Closed</EmptyTitle>
            <EmptyDescription>
              The feedback submission period is currently closed. The scheduling
              committee will open feedback collection during the designated feedback period
              as shown in the academic timeline.
              {studentStatus?.activeTerm && (
                <span className="block mt-2 text-sm">
                  Current term: <strong>{studentStatus.activeTerm}</strong>
                </span>
              )}
            </EmptyDescription>
          </EmptyHeader>
          <Button asChild variant="outline" size="lg">
            <Link href="/student/dashboard">Return to Dashboard</Link>
          </Button>
        </Empty>
      </div>
    );
  }

  // Show already submitted state
  if (studentStatus?.hasSubmittedFeedback) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <Link href="/student/dashboard">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Schedule Feedback</h1>
          <p className="text-muted-foreground">
            Share your thoughts about your schedule
          </p>
        </div>

        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-green-900 dark:text-green-100">
                Feedback Already Submitted
              </h2>
              <p className="text-green-800 dark:text-green-200">
                Thank you for sharing your feedback! We've received your response and
                the scheduling committee will review it.
              </p>
            </div>
            <Button asChild variant="outline" size="lg" className="mt-4">
              <Link href="/student/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show feedback form if all conditions are met
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <Link href="/student/dashboard">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Schedule Feedback</h1>
        <p className="text-muted-foreground">
          Help us improve by sharing your feedback
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {submitted && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            Thank you! Your feedback has been submitted successfully. Redirecting...
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Submit Your Feedback</CardTitle>
          <CardDescription>
            Rate your schedule experience and share any thoughts, concerns, or
            suggestions
            {studentStatus?.feedbackEvent && (
              <span className="block mt-2 text-xs text-muted-foreground">
                📅 {studentStatus.feedbackEvent.title} • 
                Open until {new Date(studentStatus.feedbackEvent.endDate).toLocaleDateString("en-US", { 
                  month: "short", 
                  day: "numeric", 
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Rating Slider */}
            <div className="space-y-4">
              <Label htmlFor="rating">
                Overall Schedule Rating: <strong>{rating}/5</strong>
              </Label>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">1 (Poor)</span>
                <Slider
                  id="rating"
                  min={1}
                  max={5}
                  step={1}
                  value={[rating]}
                  onValueChange={([value]) => setValue("rating", value)}
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground">5 (Excellent)</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Rate your overall satisfaction with the schedule from 1 (Poor) to 5
                (Excellent)
              </p>
            </div>

            {/* Feedback Text */}
            <div className="space-y-2">
              <Label htmlFor="feedbackText">Your Feedback</Label>
              <Textarea
                id="feedbackText"
                placeholder="Please share your thoughts, concerns, or suggestions about your schedule. For example:&#10;&#10;• Are there any time conflicts?&#10;• Do the class timings work well for you?&#10;• Were you assigned your preferred electives?&#10;• Any other comments or suggestions?"
                rows={10}
                className="resize-none"
                {...register("feedbackText")}
                aria-invalid={!!errors.feedbackText}
                disabled={isSubmitting || submitted}
              />
              {errors.feedbackText && (
                <p className="text-xs text-destructive">
                  {errors.feedbackText.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Minimum 10 characters. Your feedback will be reviewed by the
                scheduling committee.
              </p>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || submitted}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>Submitting...</>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
