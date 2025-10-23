// Student Profile - Production Page
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { AuthContextValue } from "@/components/auth/auth-types";
import { useAuth } from "@/components/auth/use-auth";
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
import { ArrowLeft, User, Mail, IdCard, BookOpen } from "lucide-react";

interface StudentProfile {
  user_id: string;
  name: string;
  email: string;
  student_number?: string;
  level?: number;
  status?: string;
}

function mapStudentResponse(student: Record<string, unknown>): StudentProfile {
  return {
    user_id: (student.user_id as string) ?? "",
    name: (student.name as string) ?? "Student",
    email: (student.email as string) ?? "",
    student_number:
      (student.student_number as string | undefined) ??
      (student.student_id as string | undefined),
    level: typeof student.level === "number" ? student.level : undefined,
    status: (student.status as string) ?? undefined,
  };
}

export default function StudentProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      router.push("/");
      return;
    }

    let isActive = true;

    const loadProfile = async (): Promise<StudentProfile | null> => {
      const identifier = user.id ?? user.email ?? "";
      if (!identifier) {
        return null;
      }

      const response = await fetch(
        `/api/student/profile?userId=${encodeURIComponent(identifier)}`
      );

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Profile request failed (${response.status})`);
      }

      const payload = (await response.json()) as Record<string, unknown>;
      if (!payload.success || !payload.student) {
        return null;
      }

      return mapStudentResponse(payload.student as Record<string, unknown>);
    };

    const fetchStudentProfile = async () => {
      setLoading(true);

      try {
        let profile = await loadProfile();

        if (!profile) {
          // Attempt bootstrap provisioning if the profile does not exist yet
          const bootstrapResponse = await fetch("/api/auth/bootstrap", {
            method: "POST",
          });

          if (bootstrapResponse.ok) {
            profile = await loadProfile();
          }
        }

        const resolvedProfile = profile;

        if (isActive) {
          setStudentData(resolvedProfile);
        }
      } catch (error) {
        console.warn("Student profile fetch failed", error);
        if (isActive) {
          setStudentData(null);
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void fetchStudentProfile();

    return () => {
      isActive = false;
    };
  }, [authLoading, router, user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-40 mb-4" />
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-80" />
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 mb-1" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!studentData) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <Link href="/student">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold mb-2">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {/* Profile Information */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-semibold">{studentData.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-semibold">{studentData.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center">
                  <IdCard className="h-6 w-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-semibold">
                    {studentData.student_number || "Not assigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Major</p>
                  <p className="font-semibold">Software Engineering</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Academic Progress</CardTitle>
            <CardDescription>Your current academic standing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Current Level
                </p>
                <p className="text-2xl font-bold">
                  Level {studentData.level || "Not assigned"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>Manage your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={handleSignOut}
              variant="destructive"
              className="w-full"
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
