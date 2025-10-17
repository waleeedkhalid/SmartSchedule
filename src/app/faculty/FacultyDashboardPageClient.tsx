"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  Calendar,
  Clock,
  BookOpen,
  MessageSquare,
  Settings,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";

type FacultyAvailability = {
  id: string;
};

interface FacultyData {
  name: string;
  email: string;
  role: string;
  availabilitySubmitted: boolean;
  currentLoad: number;
  maxLoad: number;
}

export default function FacultyDashboardPageClient() {
  const [facultyData, setFacultyData] = useState<FacultyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data: userData, error } = await supabase
          .from("user")
          .select("full_name,email,role")
          .eq("id", user.id)
          .maybeSingle();

        if (error || !userData) {
          console.error("Error fetching faculty data:", error);
          setLoading(false);
          return;
        }

        const profile = userData as {
          full_name?: string | null;
          email?: string | null;
          role?: string | null;
        };

        const { data: availabilityData } = await supabase
          .from("faculty_availability")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle<FacultyAvailability>();

        setFacultyData({
          name: profile.full_name ?? user.user_metadata?.full_name ?? "Faculty",
          email: profile.email ?? user.email ?? "",
          role: profile.role ?? "faculty",
          availabilitySubmitted: Boolean(availabilityData),
          currentLoad: 0,
          maxLoad: 20,
        });
      } catch (error) {
        console.error("Error fetching faculty data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                  <Skeleton className="h-12 w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!facultyData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Faculty Dashboard</h1>
          <p className="text-muted-foreground">Unable to load faculty data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Faculty Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {facultyData.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Teaching Load
                </p>
                <p className="text-2xl font-bold">
                  {facultyData.currentLoad}/{facultyData.maxLoad} hours
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Availability
                </p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {facultyData.availabilitySubmitted ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Submitted
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      Pending
                    </>
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Role
                </p>
                <p className="text-2xl font-bold capitalize">
                  {facultyData.role.replace("_", " ")}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-all border-2 hover:border-primary">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Time Availability
                </CardTitle>
                <CardDescription className="mt-2">
                  Submit your available time slots and teaching preferences
                </CardDescription>
              </div>
              {!facultyData.availabilitySubmitted && (
                <Badge variant="default">Action Required</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">What you can do:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Set your available time slots</li>
                  <li>Specify course preferences</li>
                  <li>Indicate teaching load capacity</li>
                  <li>Update availability as needed</li>
                </ul>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/faculty/availability">
                  {facultyData.availabilitySubmitted
                    ? "Update Availability"
                    : "Submit Availability"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Teaching Load
            </CardTitle>
            <CardDescription>
              View your current teaching assignments and load distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">
                  Current load: {facultyData.currentLoad}/{facultyData.maxLoad}{" "}
                  hours
                </p>
                <p className="text-xs">
                  Your teaching load is managed by the Teaching Load Committee
                </p>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/faculty/load">
                  View Teaching Load
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comments & Feedback
            </CardTitle>
            <CardDescription>
              Submit comments about scheduling or course assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Share your input:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Schedule preferences</li>
                  <li>Course assignment feedback</li>
                  <li>Time conflict concerns</li>
                </ul>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/faculty/comments">
                  Submit Comments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Profile & Settings
            </CardTitle>
            <CardDescription>
              Manage your account and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Account information:</p>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {facultyData.name}
                  </p>
                  <p>
                    <span className="font-medium">Email:</span>{" "}
                    {facultyData.email}
                  </p>
                  <p>
                    <span className="font-medium">Role:</span>{" "}
                    {facultyData.role.replace("_", " ")}
                  </p>
                </div>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/faculty/profile">
                  View Profile
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {!facultyData.availabilitySubmitted && (
        <Card className="mt-8 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Action Required: Submit Availability
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Please submit your time availability and teaching preferences
                  to help the scheduling committee create an optimal schedule
                  for all faculty members.
                </p>
                <Button asChild className="mt-3" size="sm">
                  <Link href="/faculty/availability">
                    Submit Availability Now
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
