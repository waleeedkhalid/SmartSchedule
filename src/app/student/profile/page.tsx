// Student Profile - Production Page
"use client";

import React, { useEffect, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, User, Mail, IdCard, BookOpen } from "lucide-react";
import Link from "next/link";

interface StudentProfile {
  user_id: string;
  name: string;
  email: string;
        try {
          const loadProfile = () =>
            fetch(
              `/api/student/profile?userId=${encodeURIComponent(user.email ?? "")}`
            );

          let response = await loadProfile();

          if (response.status === 404) {
            try {
              const bootstrapResponse = await fetch("/api/auth/bootstrap", {
                method: "POST",
              });

              if (bootstrapResponse.ok) {
                response = await loadProfile();
              }
            } catch (bootstrapError) {
              console.warn("Bootstrap onboarding error", bootstrapError);
            }
          }

          if (response.ok) {
            const data = await response.json();

            if (data.success) {
              setStudentData({
                user_id: data.student.user_id,
                name: data.student.name,
                email: data.student.email,
                student_number: data.student.student_number,
                level: data.student.level,
                major: data.student.major,
                gpa: data.student.gpa,
                completed_credits: data.student.completed_credits,
                total_credits: data.student.total_credits,
                academic_status: data.student.academic_status,
                enrollment_date: data.student.enrollment_date,
                expected_graduation_date: data.student.expected_graduation_date,
                advisor_id: data.student.advisor_id,
              });
              return;
            }
          }

          setStudentData({
            user_id: user.id || "",
            name: user.user_metadata?.full_name || "Student",
            email: user.email || "",
            student_number: user.email?.split("@")[0] || "Unknown",
            level: 6,
            major: "Software Engineering",
            gpa: "0.00",
            completed_credits: 0,
            total_credits: 132,
            academic_status: "active",
          });
        } catch (error) {
                  user_id: data.student.user_id,
                  name: data.student.name,
                  email: data.student.email,
                  student_number: data.student.student_number,
                  level: data.student.level,
                  major: data.student.major,
                  gpa: data.student.gpa,
                  completed_credits: data.student.completed_credits,
                  total_credits: data.student.total_credits,
                  academic_status: data.student.academic_status,
                  enrollment_date: data.student.enrollment_date,
                  expected_graduation_date: data.student.expected_graduation_date,
                  advisor_id: data.student.advisor_id,
                });
                return;
              }
            }

            const fallbackData: StudentProfile = {
              user_id: user.id || "",
              name: user.user_metadata?.full_name || "Student",
              email: user.email || "",
              student_number: user.email?.split("@")[0] || "Unknown",
              level: 6,
              major: "Software Engineering",
              gpa: "0.00",
              completed_credits: 0,
              total_credits: 132,
              academic_status: "active",
            };

            setStudentData(fallbackData);
          student_number: user.email?.split("@")[0] || "Unknown",
          level: 6,
          major: "Software Engineering",
          gpa: "0.00",
          completed_credits: 0,
          total_credits: 132,
          academic_status: "active",
        });
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      if (!user) {
        router.push("/");
      } else {
        fetchStudentProfile();
      }
    }
  }, [user, authLoading, router]);

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
                  <p className="font-semibold">{studentData.student_number || "Not assigned"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Major</p>
                  <p className="font-semibold">{studentData.major || "Not assigned"}</p>
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
                <p className="text-2xl font-bold">Level {studentData.level || "Not assigned"}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">GPA</p>
                <p className="text-2xl font-bold">
                  {studentData.gpa ? parseFloat(studentData.gpa).toFixed(2) : "0.00"}
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
                <p className="text-2xl font-bold">{studentData.total_credits || 132}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Progress</p>
                <Badge variant="secondary">
                  {Math.round(
                    ((studentData.completed_credits || 0) / (studentData.total_credits || 132)) *
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
