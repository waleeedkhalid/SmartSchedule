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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Course } from "@/app/mobile/lib/api/types";

export default function CoursesPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                <Card key={course.code}>
                  <CardHeader>
                    <CardTitle>{course.code} - {course.name}</CardTitle>
                    <CardDescription>
                      {course.credits} credits • Level {course.level} • {course.course_type}
                    </CardDescription>
                  </CardHeader>
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

