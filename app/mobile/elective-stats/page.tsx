/**
 * Elective Stats Page
 * 
 * Displays statistics about elective courses.
 */

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { electiveStatsRepository, type ElectiveStat } from "@/app/mobile/lib/repositories/elective-stats.repository";
import { EnrollmentChart } from "@/app/mobile/components/charts/enrollment-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export default function ElectiveStatsPage() {
  const router = useRouter();
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const [stats, setStats] = useState<ElectiveStat[]>([]);
  const [loading, setLoading] = useState(true);

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

    if (user?.role !== "scheduling") {
      router.push("/mobile/schedule");
      return;
    }

    loadStats();
  }, [isAuthenticated, user, router]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await electiveStatsRepository.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated || !user || user.role !== "scheduling") {
    return null;
  }

  const chartData = stats.map(s => ({
    label: s.course_code,
    enrolled: s.demand, // Using demand as enrolled for now, or actual enrollment if available
    capacity: s.capacity
  }));

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/mobile/scheduler")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle>Elective Statistics</CardTitle>
                <CardDescription>
                  Demand vs Capacity for Elective Courses
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Demand Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : stats.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No data available.
              </p>
            ) : (
              <div className="h-[300px] w-full flex justify-center">
                <EnrollmentChart data={chartData} />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Data Table */}
        {!loading && stats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detailed Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.map((stat) => (
                  <div key={stat.course_code} className="flex justify-between items-center p-2 border rounded-md">
                    <div>
                      <p className="font-medium">{stat.course_code}</p>
                      <p className="text-sm text-muted-foreground">{stat.course_name}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p>Demand: <span className="font-medium">{stat.demand}</span></p>
                      <p className="text-muted-foreground">Capacity: {stat.capacity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
