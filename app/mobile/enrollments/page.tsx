/**
 * Enrollments Screen
 * 
 * Displays and manages student enrollments.
 * Demonstrates how enrollment operations work through the API
 * and can be used by any client platform.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { enrollmentsRepository } from "@/app/mobile/lib/repositories/enrollments.repository";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Enrollment } from "@/app/mobile/lib/api/types";

export default function EnrollmentsPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
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

    // Only students can view enrollments
    if (user?.role !== "student") {
      router.push("/mobile/schedule");
      return;
    }

    loadEnrollments();
  }, [isAuthenticated, user, router]);

  const loadEnrollments = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await enrollmentsRepository.getEnrollments();
      setEnrollments(data.filter((e) => e.status === "enrolled"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load enrollments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to drop this enrollment?")) {
      return;
    }

    try {
      await enrollmentsRepository.deleteEnrollment(enrollmentId);
      await loadEnrollments(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to drop enrollment");
    }
  };

  if (!isAuthenticated || !user || user.role !== "student") {
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
                <CardTitle>My Enrollments</CardTitle>
                <CardDescription>Manage your course enrollments</CardDescription>
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
              <p className="text-muted-foreground">Loading enrollments...</p>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="py-8">
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={loadEnrollments} className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Enrollments List */}
        {!isLoading && !error && (
          <div className="space-y-2">
            {enrollments.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No enrollments found</p>
                </CardContent>
              </Card>
            ) : (
              enrollments.map((enrollment) => (
                <Card key={enrollment.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>
                          {enrollment.course?.code} - {enrollment.course?.name}
                        </CardTitle>
                        <CardDescription>
                          {enrollment.course?.credits} credits • {enrollment.enrollment_type}
                        </CardDescription>
                        {enrollment.section && (
                          <p className="text-sm text-muted-foreground mt-2">
                            Section {enrollment.section.section_no}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDrop(enrollment.id)}
                      >
                        Drop
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

