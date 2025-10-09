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
import { Loader2, ArrowLeft, User, Mail, IdCard, BookOpen } from "lucide-react";
import Link from "next/link";

interface StudentProfile {
  studentId: string;
  name: string;
  email: string;
  level: number;
  major: string;
  gpa: number;
  completedCredits: number;
  totalCredits: number;
}

export default function StudentProfilePage() {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState<StudentProfile | null>(null);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/student/profile?userId=${encodeURIComponent(user.email)}`
        );
        const data = await response.json();

        if (data.success) {
          setStudentData({
            studentId: data.student.studentId,
            name: data.student.name,
            email: data.student.email,
            level: data.student.level,
            major: data.student.major,
            gpa: data.student.gpa,
            completedCredits: data.student.completedCredits,
            totalCredits: data.student.totalCredits,
          });
        } else {
          // Fallback to user metadata
          setStudentData({
            studentId: user.email?.split("@")[0] || "Unknown",
            name: user.user_metadata?.full_name || "Student",
            email: user.email || "",
            level: 6,
            major: "Software Engineering",
            gpa: 0,
            completedCredits: 0,
            totalCredits: 132,
          });
        }
      } catch (error) {
        console.error("Error fetching student profile:", error);
        // Fallback to user metadata
        setStudentData({
          studentId: user.email?.split("@")[0] || "Unknown",
          name: user.user_metadata?.full_name || "Student",
          email: user.email || "",
          level: 6,
          major: "Software Engineering",
          gpa: 0,
          completedCredits: 0,
          totalCredits: 132,
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading profile...</p>
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
                  <p className="font-semibold">{studentData.studentId}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Major</p>
                  <p className="font-semibold">{studentData.major}</p>
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
                <p className="text-2xl font-bold">Level {studentData.level}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">GPA</p>
                <p className="text-2xl font-bold">
                  {studentData.gpa.toFixed(2)}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Completed Credits
                </p>
                <p className="text-2xl font-bold">
                  {studentData.completedCredits}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  Total Required
                </p>
                <p className="text-2xl font-bold">{studentData.totalCredits}</p>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Progress</p>
                <Badge variant="secondary">
                  {Math.round(
                    (studentData.completedCredits / studentData.totalCredits) *
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
                      (studentData.completedCredits /
                        studentData.totalCredits) *
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
