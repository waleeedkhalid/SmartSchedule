/**
 * Registration Summary Component
 * Shows student's enrolled courses and total credit hours
 */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  getStudentEnrollments,
  getStudentCreditHours,
  dropSection,
} from "@/app/student/register-electives/actions";
import { BookOpen, Clock, User, MapPin, Trash2, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface EnrolledSection {
  id: string;
  section_id: string;
  status: string;
  enrolled_at: string;
  section: {
    id: string;
    course_code: string;
    course: {
      code: string;
      name: string;
      credits: number;
    };
    section_time?: Array<{
      day: string;
      start_time: string;
      end_time: string;
    }>;
    instructor?: {
      full_name: string;
    };
  };
}

export function RegistrationSummary() {
  const [enrollments, setEnrollments] = useState<EnrolledSection[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dropping, setDropping] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [enrollmentsResult, creditsResult] = await Promise.all([
        getStudentEnrollments(),
        getStudentCreditHours(),
      ]);

      if (enrollmentsResult.success) {
        setEnrollments(enrollmentsResult.data as EnrolledSection[]);
      }

      if (creditsResult.success) {
        setTotalCredits(creditsResult.credits);
      }
    } catch (error) {
      console.error("Error loading enrollment data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (sectionId: string, courseName: string) => {
    try {
      setDropping(sectionId);

      const result = await dropSection(sectionId);

      if (result.success) {
        toast({
          title: "Course Dropped",
          description: `Successfully dropped ${courseName}`,
        });
        loadData(); // Reload data
      } else {
        toast({
          title: "Drop Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Drop error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDropping(null);
    }
  };

  const formatTimeSlots = (times?: Array<{ day: string; start_time: string; end_time: string }>) => {
    if (!times || times.length === 0) return "TBA";
    return times
      .map((time) => {
        const day = time.day.substring(0, 3);
        return `${day} ${time.start_time}-${time.end_time}`;
      })
      .join(", ");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-20 w-full" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const creditHourStatus =
    totalCredits > 20
      ? "error"
      : totalCredits >= 18
        ? "warning"
        : "normal";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>My Enrolled Courses</CardTitle>
          <Badge
            variant={
              creditHourStatus === "error"
                ? "destructive"
                : creditHourStatus === "warning"
                  ? "secondary"
                  : "default"
            }
            className="text-base px-3 py-1"
          >
            {totalCredits} / 20 Credits
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Credit Hour Warning */}
        {creditHourStatus === "error" && (
          <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-destructive">
                Credit Hour Limit Exceeded
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                You are enrolled in {totalCredits} credit hours. The maximum
                allowed is 20 CH. Please drop some courses.
              </p>
            </div>
          </div>
        )}

        {/* Enrolled Courses List */}
        {enrollments.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-lg font-medium">No enrolled courses yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Browse and register for elective courses below
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {enrollments.map((enrollment) => (
              <Card key={enrollment.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Course Name */}
                    <div>
                      <h3 className="font-semibold">
                        {enrollment.section.course.code}:{" "}
                        {enrollment.section.course.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Section {enrollment.section_id}
                      </p>
                    </div>

                    {/* Course Details */}
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span>{enrollment.section.course.credits} Credits</span>
                      </div>

                      {enrollment.section.instructor && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="truncate">
                            {enrollment.section.instructor.full_name}
                          </span>
                        </div>
                      )}

                      <div className="flex items-start gap-2 col-span-2">
                        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>
                          {formatTimeSlots(enrollment.section.section_time)}
                        </span>
                      </div>
                    </div>

                    {/* Enrolled Date */}
                    <p className="text-xs text-muted-foreground">
                      Enrolled on{" "}
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </p>
                  </div>

                  {/* Drop Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={dropping === enrollment.section_id}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Drop Course?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to drop{" "}
                          <strong>
                            {enrollment.section.course.code}:{" "}
                            {enrollment.section.course.name}
                          </strong>
                          ? This action will remove{" "}
                          {enrollment.section.course.credits} credit hours from
                          your schedule.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() =>
                            handleDrop(
                              enrollment.section_id,
                              enrollment.section.course.name
                            )
                          }
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {dropping === enrollment.section_id
                            ? "Dropping..."
                            : "Drop Course"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

