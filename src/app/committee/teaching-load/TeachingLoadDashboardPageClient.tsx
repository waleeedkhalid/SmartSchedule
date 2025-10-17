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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users,
  BookOpen,
  TrendingUp,
  Settings,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { supabase } from "@/utils/supabase/client";

interface TeachingLoadData {
  name: string;
  email: string;
  role: string;
  totalFaculty: number;
  averageLoad: number;
  conflictsDetected: number;
}

export default function TeachingLoadDashboardPage() {
  const [teachingLoadData, setTeachingLoadData] =
    useState<TeachingLoadData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeachingLoadData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Get teaching load committee data from the database
        const { data: userData, error } = await supabase
          .from("user")
          .select("full_name,email,role")
          .eq("id", user.id)
          .maybeSingle();

        if (error || !userData) {
          console.error("Error fetching teaching load data:", error);
          setLoading(false);
          return;
        }

        const profile = userData as {
          full_name?: string | null;
          email?: string | null;
          role?: string | null;
        };

        // Get faculty count
        const { count: facultyCount } = await supabase
          .from("user")
          .select("*", { count: "exact", head: true })
          .eq("role", "faculty");

        setTeachingLoadData({
          name:
            profile.full_name ??
            user.user_metadata?.full_name ??
            "Committee Member",
          email: profile.email ?? user.email ?? "",
          role: profile.role ?? "teaching_load_committee",
          totalFaculty: facultyCount || 0,
          averageLoad: 0, // TODO: Calculate from actual data
          conflictsDetected: 0, // TODO: Calculate from actual conflicts
        });
      } catch (error) {
        console.error("Error fetching teaching load data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachingLoadData();
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

  if (!teachingLoadData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Teaching Load Committee Dashboard
          </h1>
          <p className="text-muted-foreground">
            Unable to load teaching load data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Teaching Load Committee Dashboard
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {teachingLoadData.name}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Faculty
                </p>
                <p className="text-2xl font-bold">
                  {teachingLoadData.totalFaculty}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Average Load
                </p>
                <p className="text-2xl font-bold">
                  {teachingLoadData.averageLoad} hours
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Conflicts Detected
                </p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {teachingLoadData.conflictsDetected > 0 ? (
                    <>
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      {teachingLoadData.conflictsDetected}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      None
                    </>
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Load Analysis */}
        <Card className="hover:shadow-lg transition-all border-2 hover:border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Load Analysis
            </CardTitle>
            <CardDescription>
              Analyze faculty teaching loads and identify imbalances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Analysis tools:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>View faculty load distribution</li>
                  <li>Identify overloaded faculty</li>
                  <li>Detect underutilized resources</li>
                  <li>Generate load reports</li>
                </ul>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/committee/teaching-load/analysis">
                  Analyze Loads
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conflict Resolution */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Conflict Resolution
            </CardTitle>
            <CardDescription>
              Identify and resolve teaching load conflicts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Conflict management:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>View detected conflicts</li>
                  <li>Resolve scheduling issues</li>
                  <li>Balance faculty workloads</li>
                  <li>Track resolution progress</li>
                </ul>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/committee/teaching-load/conflicts">
                  Resolve Conflicts
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Load Suggestions */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Load Suggestions
            </CardTitle>
            <CardDescription>
              Get AI-powered suggestions for optimal load distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Smart suggestions:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>AI-powered load balancing</li>
                  <li>Optimal assignment recommendations</li>
                  <li>Workload optimization tips</li>
                  <li>Faculty preference matching</li>
                </ul>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/committee/teaching-load/suggestions">
                  View Suggestions
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Settings */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </CardTitle>
            <CardDescription>
              Configure load management rules and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Configuration options:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Set load limits and rules</li>
                  <li>Configure faculty preferences</li>
                  <li>Manage assignment priorities</li>
                  <li>System preferences</li>
                </ul>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/committee/teaching-load/settings">
                  Configure Settings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Notice */}
      {teachingLoadData.conflictsDetected > 0 && (
        <Card className="mt-8 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Teaching Load Conflicts Detected
                </h3>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {teachingLoadData.conflictsDetected} teaching load conflicts
                  have been detected. Please review and resolve these conflicts
                  to ensure optimal faculty workload distribution.
                </p>
                <Button asChild className="mt-3" size="sm">
                  <Link href="/committee/teaching-load/conflicts">
                    Resolve Conflicts Now
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
