/**
 * Courses Screen
 * 
 * Displays list of available courses.
 * Demonstrates how course data from the API can be displayed
 * in any client platform.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { coursesRepository } from "@/app/mobile/lib/repositories/courses.repository";
import { sectionsRepository } from "@/app/mobile/lib/repositories/sections.repository";
import { enrollmentsRepository } from "@/app/mobile/lib/repositories/enrollments.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import type { Course, Section } from "@/app/mobile/lib/api/types";

export default function CoursesPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Registration state
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [registeringSection, setRegisteringSection] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      checkAuth();
    }
  }, [isAuthenticated, checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/mobile/login");
      return;
    }

    loadCourses();
  }, [isAuthenticated, router]);

  const loadCourses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await coursesRepository.getCourses();
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load courses");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpandCourse = async (courseCode: string) => {
    if (expandedCourse === courseCode) {
      setExpandedCourse(null);
      setSections([]);
      return;
    }

    setExpandedCourse(courseCode);
    setLoadingSections(true);
    try {
      const data = await sectionsRepository.getSections({ courseCode, state: "released" });
      setSections(data);
    } catch (err) {
      toast.error("Failed to load sections");
      console.error(err);
    } finally {
      setLoadingSections(false);
    }
  };

  const handleRegister = async (sectionId: string) => {
    setRegisteringSection(sectionId);
    try {
      await enrollmentsRepository.createEnrollment({ section_id: sectionId });
      toast.success("Successfully registered!");
      // Optionally refresh schedule or show success state
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to register");
    } finally {
      setRegisteringSection(null);
    }
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
                <CardTitle>Courses</CardTitle>
                <CardDescription>Available courses</CardDescription>
              </div>
              <Button variant="outline" onClick={() => router.push("/mobile/schedule")}>
                Back to Schedule
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">Loading courses...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-8">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={loadCourses} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Courses List */}
        {!isLoading && !error && (
          <div className="space-y-2">
            {courses.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No courses available</p>
                </CardContent>
              </Card>
            ) : (
              Array.isArray(courses) && courses.length > 0 ? courses.map((course) => (
                <Card key={course.code} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{course.code}</CardTitle>
                        <CardDescription className="font-medium text-foreground">
                          {course.name}
                        </CardDescription>
                      </div>
                      <Badge variant={course.course_type === "required" ? "default" : "secondary"}>
                        {course.course_type}
                      </Badge>
                    </div>
                    <div className="flex gap-2 text-sm text-muted-foreground mt-1">
                      <span>{course.credits} credits</span>
                      <span>•</span>
                      <span>Level {course.level}</span>
                    </div>
                  </CardHeader>

                  <CardFooter className="bg-muted/30 p-3">
                    <Button
                      variant="ghost"
                      className="w-full justify-between"
                      onClick={() => handleExpandCourse(course.code)}
                    >
                      {expandedCourse === course.code ? "Hide Sections" : "View Sections"}
                      {expandedCourse === course.code ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CardFooter>

                  {expandedCourse === course.code && (
                    <div className="border-t bg-muted/10 p-3 space-y-3 animate-in slide-in-from-top-2">
                      {loadingSections ? (
                        <div className="flex justify-center py-4">
                          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                      ) : sections.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-2">
                          No sections available for this course.
                        </p>
                      ) : (
                        sections.map((section) => (
                          <div
                            key={section.id}
                            className="bg-card border rounded-lg p-3 space-y-2"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-sm">
                                  Section {section.section_no}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {section.instructor?.name || "TBA"}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {section.current_enrollment} / {section.capacity}
                              </Badge>
                            </div>

                            <div className="text-xs text-muted-foreground">
                              <p>
                                {section.meeting_pattern?.days?.join(", ") || "TBA"} • {" "}
                                {section.meeting_pattern?.start_time || section.meeting_pattern?.start || "TBA"}
                              </p>
                              <p>{section.room?.code || "Room TBA"}</p>
                            </div>

                            <Button
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => handleRegister(section.id)}
                              disabled={
                                registeringSection === section.id ||
                                section.current_enrollment >= section.capacity
                              }
                            >
                              {registeringSection === section.id ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Registering...
                                </>
                              ) : section.current_enrollment >= section.capacity ? (
                                "Full"
                              ) : (
                                "Register"
                              )}
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </Card>
              )) : (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">No courses available</p>
                  </CardContent>
                </Card>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}

