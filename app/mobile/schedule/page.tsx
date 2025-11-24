/**
 * Schedule Screen
 * 
 * Displays the user's schedule.
 * This screen demonstrates how schedule data from the API
 * can be rendered in any client platform.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { schedulesRepository } from "@/app/mobile/lib/repositories/schedules.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentSchedule, FacultySchedule } from "@/app/mobile/lib/api/types";

export default function SchedulePage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [schedule, setSchedule] = useState<StudentSchedule | FacultySchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check auth on mount
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/mobile/login");
      return;
    }

    loadSchedule();
  }, [isAuthenticated, router]);

  const loadSchedule = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await schedulesRepository.getMySchedule();
      setSchedule(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load schedule");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/mobile/login");
  };

  if (!isAuthenticated || !user) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>My Schedule</CardTitle>
                <CardDescription>
                  Welcome, {user.name} ({user.role})
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Loading schedule...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-8">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={loadSchedule} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Schedule Content */}
        {!isLoading && !error && schedule && (
          <>
            {schedule.is_empty ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    {user.role === "scheduling" || user.role === "teaching_load" || user.role === "registrar"
                      ? "Schedule view is not available for this role. Please use the web dashboard."
                      : "No schedule available"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {schedule.schedule && schedule.schedule.length > 0 ? (
                  schedule.schedule.map((item, index) => {
                    // Handle both student and faculty schedule formats
                    const courseCode = "course_code" in item ? item.course_code : item.course_code;
                    const courseName = "course_name" in item ? item.course_name : item.course_name;
                    const credits = "credits" in item ? item.credits : item.credits;
                    const sections = "sections" in item ? item.sections : null;
                    const isStudentSchedule = sections !== null;

                    return (
                      <Card key={index}>
                        <CardHeader>
                          <CardTitle>
                            {courseCode} - {courseName}
                          </CardTitle>
                          <CardDescription>
                            {credits} credits
                            {!isStudentSchedule && "section_no" in item && (
                              <> • Section {item.section_no}</>
                            )}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          {isStudentSchedule && sections && sections.length > 0 ? (
                            <div className="space-y-2">
                              {sections.map((section, secIndex) => (
                                <div
                                  key={secIndex}
                                  className="border-l-4 border-purple-500 pl-4 py-2"
                                >
                                  <p className="font-medium">
                                    Section {section.section_no} ({section.type})
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Instructor: {section.instructor}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Room: {section.room}
                                  </p>
                                  {section.meeting_pattern && (
                                    <p className="text-sm text-muted-foreground">
                                      {section.meeting_pattern.days?.join(", ")} at{" "}
                                      {section.meeting_pattern.start_time}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : !isStudentSchedule ? (
                            <div className="space-y-2">
                              <div className="border-l-4 border-purple-500 pl-4 py-2">
                                <p className="font-medium">
                                  Section {item.section_no} ({item.meeting_pattern?.type || "lecture"})
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Room: {item.room || "TBA"}
                                </p>
                                {item.meeting_pattern && (
                                  <p className="text-sm text-muted-foreground">
                                    {item.meeting_pattern.days?.join(", ")} at{" "}
                                    {item.meeting_pattern.start_time}
                                  </p>
                                )}
                                {"capacity" in item && (
                                  <p className="text-sm text-muted-foreground">
                                    Capacity: {item.current_enrollment || 0} / {item.capacity}
                                  </p>
                                )}
                              </div>
                            </div>
                          ) : null}
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card>
                    <CardContent className="py-8 text-center">
                      <p className="text-muted-foreground">No schedule items found</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/mobile/courses")}
              className="flex-1"
            >
              View Courses
            </Button>
            {user.role === "student" && (
              <Button
                variant="outline"
                onClick={() => router.push("/mobile/enrollments")}
                className="flex-1"
              >
                My Enrollments
              </Button>
            )}
        </div>
      </div>
    </div>
  );
}

