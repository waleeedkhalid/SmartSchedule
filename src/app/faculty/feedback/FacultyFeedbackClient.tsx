"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  MessageSquare,
  ArrowLeft,
  Star,
  TrendingUp,
  Users,
  BarChart3,
  Lock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TextFeedback {
  text: string;
  rating: number;
  submittedAt: string;
}

interface CourseFeedback {
  courseCode: string;
  courseName: string;
  credits: number;
  sectionId: string;
  enrolledCount: number;
  responseCount: number;
  responseRate: number;
  averageRating: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  textFeedback: TextFeedback[];
}

interface FeedbackData {
  courseFeedback: CourseFeedback[];
  overallStats: {
    totalCourses: number;
    totalEnrolled: number;
    totalResponses: number;
    averageRating: number;
    responseRate: number;
  };
}

export default function FacultyFeedbackClient() {
  const [feedbackData, setFeedbackData] = useState<FeedbackData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackLocked, setFeedbackLocked] = useState(false);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch("/api/faculty/feedback");
        const data = await response.json();

        if (data.success) {
          setFeedbackData(data.data);
        } else {
          if (response.status === 403) {
            setFeedbackLocked(true);
          }
          setError(data.error || "Failed to fetch feedback");
        }
      } catch (err) {
        console.error("Error fetching feedback:", err);
        setError("Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (feedbackLocked) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Student Feedback</h1>
          <p className="text-muted-foreground">Student feedback for your courses</p>
        </div>

        <Alert className="border-2 border-amber-300 bg-amber-50 dark:border-amber-700 dark:bg-amber-950">
          <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-900 dark:text-amber-100 font-semibold">
            Feedback Period Active
          </AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200 mt-2">
            {error || "Student feedback is currently being collected. Results will be available once the feedback period closes to ensure anonymity and encourage honest responses."}
          </AlertDescription>
        </Alert>

        <Card className="border-2">
          <CardContent className="py-12">
            <div className="text-center">
              <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Feedback Not Yet Available</h3>
              <p className="text-sm text-muted-foreground">
                Check back after the feedback period closes
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !feedbackLocked) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="icon">
            <Link href="/faculty/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Course Feedback</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!feedbackData || feedbackData.courseFeedback.length === 0) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Student Feedback</h1>
          <p className="text-muted-foreground">Student feedback for your courses</p>
        </div>

        <Card className="border-2">
          <CardContent className="py-12">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Feedback Available</h3>
              <p className="text-sm text-muted-foreground">
                There is no student feedback available for your courses yet.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Student Feedback</h1>
        <p className="text-muted-foreground">
          Aggregated, anonymized student feedback
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Courses</p>
                <p className="text-2xl font-bold">
                  {feedbackData.overallStats.totalCourses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                <Star className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {feedbackData.overallStats.averageRating.toFixed(1)}
                  <span className="text-sm text-muted-foreground">/5.0</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <MessageSquare className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Responses</p>
                <p className="text-2xl font-bold">
                  {feedbackData.overallStats.totalResponses}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">
                  {feedbackData.overallStats.responseRate}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Course Feedback Details */}
      <div className="space-y-6">
        {feedbackData.courseFeedback.map((course) => (
          <Card key={course.sectionId} className="border-2 shadow-sm">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{course.courseName}</CardTitle>
                  <CardDescription className="text-base mt-1">
                    {course.courseCode} • Section {course.sectionId}
                  </CardDescription>
                </div>
                <Badge
                  variant={course.averageRating >= 4 ? "default" : "secondary"}
                  className="text-lg px-3 py-1"
                >
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  {course.averageRating.toFixed(1)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-6">
              {/* Response Stats */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Enrollment</h4>
                  </div>
                  <p className="text-2xl font-bold">{course.enrolledCount}</p>
                  <p className="text-xs text-muted-foreground">students</p>
                </div>

                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Responses</h4>
                  </div>
                  <p className="text-2xl font-bold">{course.responseCount}</p>
                  <p className="text-xs text-muted-foreground">submissions</p>
                </div>

                <div className="rounded-lg border bg-muted/20 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-semibold">Response Rate</h4>
                  </div>
                  <p className="text-2xl font-bold">{course.responseRate}%</p>
                  <Progress value={course.responseRate} className="mt-2" />
                </div>
              </div>

              {/* Rating Distribution */}
              <div>
                <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                  Rating Distribution
                </h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = course.ratingDistribution[rating as keyof typeof course.ratingDistribution];
                    const percentage =
                      course.responseCount > 0
                        ? (count / course.responseCount) * 100
                        : 0;

                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm font-medium">{rating}</span>
                          <Star className="h-3 w-3 fill-current text-amber-500" />
                        </div>
                        <div className="flex-1">
                          <Progress value={percentage} className="h-2" />
                        </div>
                        <span className="text-sm text-muted-foreground w-12 text-right">
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Text Feedback */}
              {course.textFeedback.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wide">
                    Student Comments ({course.textFeedback.length})
                  </h4>
                  <div className="space-y-3">
                    {course.textFeedback.slice(0, 10).map((feedback, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border bg-muted/20 p-4"
                      >
                        <div className="flex items-start gap-3">
                          <MessageSquare className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm">{feedback.text}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-3 w-3 mr-1 fill-current" />
                                {feedback.rating}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(feedback.submittedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {course.textFeedback.length > 10 && (
                      <p className="text-sm text-muted-foreground text-center">
                        Showing 10 of {course.textFeedback.length} comments
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

