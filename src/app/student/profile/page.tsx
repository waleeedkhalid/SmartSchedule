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
  major?: string;
  gpa?: string;
  completed_credits?: number;
  total_credits?: number;
  academic_status?: string;
  enrollment_date?: string | null;
  expected_graduation_date?: string | null;
  advisor_id?: string | null;
}

const FALLBACK_LEVEL = 6;
const FALLBACK_TOTAL_CREDITS = 132;

function normaliseGpa(value: unknown): string | undefined {
  if (typeof value === "number") {
    return value.toFixed(2);
  }

  if (typeof value === "string" && value.trim().length > 0) {
    return value;
  }

  return undefined;
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
    major: (student.major as string | undefined) ?? undefined,
    gpa: normaliseGpa(student.gpa),
    completed_credits:
      typeof student.completed_credits === "number"
        ? student.completed_credits
        : undefined,
    total_credits:
      typeof student.total_credits === "number"
        ? student.total_credits
        : undefined,
    academic_status:
      (student.academic_status as string | undefined) ?? undefined,
    enrollment_date:
      (student.enrollment_date as string | null | undefined) ?? null,
    expected_graduation_date:
      (student.expected_graduation_date as string | null | undefined) ?? null,
    advisor_id: (student.advisor_id as string | null | undefined) ?? null,
  };
}

function fallbackProfile(user: AuthContextValue["user"]): StudentProfile {
  const displayName =
    (user?.user_metadata?.full_name as string | undefined) ??
    user?.email?.split("@")[0] ??
    "Student";

  return {
    user_id: user?.id ?? "",
    name: displayName,
    email: user?.email ?? "",
    student_number: user?.email?.split("@")[0] ?? undefined,
    level: FALLBACK_LEVEL,
    major: "Software Engineering",
    gpa: "0.00",
    completed_credits: 0,
    total_credits: FALLBACK_TOTAL_CREDITS,
    academic_status: "active",
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

        const resolvedProfile = profile ?? fallbackProfile(user);

        if (isActive) {
          setStudentData(resolvedProfile);
        }
      } catch (error) {
        console.warn("Student profile fetch failed", error);
        if (isActive) {
          setStudentData(fallbackProfile(user));
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
                  <p className="font-semibold">
                    {studentData.major || "Not assigned"}
                  </p>
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

              <div>
                <p className="text-sm text-muted-foreground mb-1">GPA</p>
                <p className="text-2xl font-bold">
                  {studentData.gpa
                    ? parseFloat(studentData.gpa).toFixed(2)
                    : "0.00"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Completed Credits
                </p>
                <p className="text-2xl font-bold">
                  {studentData.completed_credits || 0}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Required
                </p>
                <p className="text-2xl font-bold">
                  {studentData.total_credits || 132}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Progress</p>
                <Badge variant="secondary">
                  {Math.round(
                    ((studentData.completed_credits || 0) /
                      (studentData.total_credits || 132)) *
                      100
                  )}
                  %
                </Badge>
              </div>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${
                      ((studentData.completed_credits || 0) /
                        (studentData.total_credits || 132)) *
                      100
                    }%`,
                  }}
                />
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
