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
  FileText,
  Settings,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  UserCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase-client";

interface RegistrarData {
  name: string;
  email: string;
  role: string;
  totalStudents: number;
  pendingOverrides: number;
  closedSections: number;
}

export default function RegistrarDashboardPage() {
  const [registrarData, setRegistrarData] = useState<RegistrarData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrarData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        // Get registrar data from the database
        const { data: userData, error } = await supabase
          .from("user")
          .select("full_name,email,role")
          .eq("id", user.id)
          .maybeSingle();

        if (error || !userData) {
          console.error("Error fetching registrar data:", error);
          setLoading(false);
          return;
        }

        const profile = userData as {
          full_name?: string | null;
          email?: string | null;
          role?: string | null;
        };

        // Get student count
        const { count: studentCount } = await supabase
          .from("students")
          .select("*", { count: "exact", head: true });

        setRegistrarData({
          name:
            profile.full_name ?? user.user_metadata?.full_name ?? "Registrar",
          email: profile.email ?? user.email ?? "",
          role: profile.role ?? "registrar",
          totalStudents: studentCount || 0,
          pendingOverrides: 0, // TODO: Calculate from actual override requests
          closedSections: 0, // TODO: Calculate from actual closed sections
        });
      } catch (error) {
        console.error("Error fetching registrar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrarData();
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

  if (!registrarData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Registrar Dashboard</h1>
          <p className="text-muted-foreground">
            Unable to load registrar data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Registrar Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {registrarData.name}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Students
                </p>
                <p className="text-2xl font-bold">
                  {registrarData.totalStudents}
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
                  Pending Overrides
                </p>
                <p className="text-2xl font-bold flex items-center gap-2">
                  {registrarData.pendingOverrides > 0 ? (
                    <>
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      {registrarData.pendingOverrides}
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      None
                    </>
                  )}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Closed Sections
                </p>
                <p className="text-2xl font-bold">
                  {registrarData.closedSections}
                </p>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Override Management */}
        <Card className="hover:shadow-lg transition-all border-2 hover:border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Override Management
            </CardTitle>
            <CardDescription>
              Handle special cases and override requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Override management tools:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Review override requests</li>
                  <li>Approve or deny overrides</li>
                  <li>Handle special cases</li>
                  <li>Track override history</li>
                </ul>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/committee/registrar/overrides">
                  Manage Overrides
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Section Management */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Section Management
            </CardTitle>
            <CardDescription>
              Manage closed sections and enrollment limits
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Section management tools:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>View section enrollment</li>
                  <li>Close or open sections</li>
                  <li>Adjust capacity limits</li>
                  <li>Monitor waitlists</li>
                </ul>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/committee/registrar/sections">
                  Manage Sections
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Student Records */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Student Records
            </CardTitle>
            <CardDescription>
              Manage student information and academic records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Student record tools:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>View student profiles</li>
                  <li>Update academic records</li>
                  <li>Handle special cases</li>
                  <li>Generate reports</li>
                </ul>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/committee/registrar/students">
                  Manage Students
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
              Configure registrar system settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">Configuration options:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Set enrollment policies</li>
                  <li>Configure override rules</li>
                  <li>Manage system preferences</li>
                  <li>User access controls</li>
                </ul>
              </div>
              <Button asChild className="w-full" variant="outline" size="lg">
                <Link href="/committee/registrar/settings">
                  Configure Settings
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Notice */}
      {registrarData.pendingOverrides > 0 && (
        <Card className="mt-8 border-yellow-200 dark:border-yellow-900 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Pending Override Requests
                </h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {registrarData.pendingOverrides} override requests are pending
                  review. Please review and process these requests to help
                  students with their course registration.
                </p>
                <Button asChild className="mt-3" size="sm">
                  <Link href="/committee/registrar/overrides">
                    Review Overrides Now
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
