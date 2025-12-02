"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Bar, Line, Pie, Doughnut, Radar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ChartData {
  labels?: string[];
  datasets?: Array<{
    label?: string;
    data?: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  }>;
}

// API Response Types
interface DashboardStats {
  progress?: {
    total: number;
    assigned: number;
    draft: number;
    released: number;
    withInstructor: number;
    withRoom: number;
    withTime: number;
    completionRate: number;
    instructorAssignmentRate: number;
    roomAssignmentRate: number;
    timeAssignmentRate: number;
  };
  rooms?: {
    totalRooms: number;
    usedRooms: number;
    unusedRooms: number;
    lectureRooms: number;
    labRooms: number;
    utilizationRate: number;
    roomUsageDetails: Array<{
      room: string;
      type: string;
      sections: number;
      utilization: number;
    }>;
  };
  workload?: {
    avgUtilization: number;
    overloaded: number;
    nearCapacity: number;
    balanced: number;
    underutilized: number;
    instructors: Array<{
      id: string;
      name: string;
      sections: number;
      credits: number;
      utilizationRate: number;
      status: string;
    }>;
  };
  faculty?: {
    totalInstructors: number;
    withPreferences: number;
    withoutPreferences: number;
    withUnavailability: number;
  };
  enrollments?: {
    active: number;
    retentionRate: number;
    byLevel: Array<{ level: number; count: number }>;
  };
  timeslots?: {
    timeDistribution: Array<{ time: string; sections: number }>;
    dayDistribution: Array<{ day: string; sections: number }>;
    totalScheduledSections: number;
  };
  electives?: Array<{
    course_code: string;
    course_title: string;
    total_requests: number;
    first_choice: number;
    second_choice: number;
    third_choice: number;
  }>;
}

interface Props {
  termId?: string;
}

export function SchedulingDashboardChartsNew({ termId }: Props = {}) {
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );

  const [enrollmentData, setEnrollmentData] = useState<ChartData | null>(null);
  const [courseTypeData, setCourseTypeData] = useState<ChartData | null>(null);
  const [instructorLoadData, setInstructorLoadData] =
    useState<ChartData | null>(null);
  const [capacityData, setCapacityData] = useState<ChartData | null>(null);
  const [radarData, setRadarData] = useState<ChartData | null>(null);

  const fetchData = async (bypassCache = false) => {
    try {
      setError(null);

      // Build API URL with optional term_id parameter
      const params = new URLSearchParams();
      if (termId) {
        params.append("term_id", termId);
      }

      const url = `/api/v1/scheduling/dashboard-stats${
        params.toString() ? `?${params.toString()}` : ""
      }`;

      const response = await fetch(url, {
        cache: bypassCache ? "no-store" : "force-cache",
        next: bypassCache ? undefined : { revalidate: 300 }, // Cache for 5 minutes
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message ||
            `Failed to fetch dashboard stats: ${response.status}`
        );
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(
          result.error?.message || "Failed to fetch dashboard stats"
        );
      }

      setDashboardStats(result.data);
      return result.data;
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while fetching dashboard statistics"
      );
      return null;
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    const data = await fetchData(true); // Bypass cache on manual refresh
    if (data) {
      processChartData(data);
    }
    setRefreshing(false);
  };

  const processChartData = (stats: DashboardStats) => {
    // Enrollment by Level (Bar Chart)
    const enrollmentByLevel = stats.enrollments?.byLevel || [];
    setEnrollmentData({
      labels: enrollmentByLevel.map((e) => `Level ${e.level}`),
      datasets: [
        {
          label: "Sections by Level",
          data: enrollmentByLevel.map((e) => e.count),
          backgroundColor: [
            "rgba(59, 130, 246, 0.8)",
            "rgba(99, 102, 241, 0.8)",
            "rgba(139, 92, 246, 0.8)",
            "rgba(168, 85, 247, 0.8)",
            "rgba(192, 132, 252, 0.8)",
          ].slice(0, enrollmentByLevel.length),
          borderColor: [
            "rgb(59, 130, 246)",
            "rgb(99, 102, 241)",
            "rgb(139, 92, 246)",
            "rgb(168, 85, 247)",
            "rgb(192, 132, 252)",
          ].slice(0, enrollmentByLevel.length),
          borderWidth: 2,
          borderRadius: 8,
        },
      ],
    });

    // Room Type Distribution (Pie Chart)
    const lectureRooms = stats.rooms?.lectureRooms || 0;
    const labRooms = stats.rooms?.labRooms || 0;
    const totalRooms = lectureRooms + labRooms;
    setCourseTypeData({
      labels: ["Lecture Rooms", "Lab Rooms"],
      datasets: [
        {
          data: [
            totalRooms > 0 ? Math.round((lectureRooms / totalRooms) * 100) : 0,
            totalRooms > 0 ? Math.round((labRooms / totalRooms) * 100) : 0,
          ],
          backgroundColor: [
            "rgba(34, 197, 94, 0.85)",
            "rgba(249, 115, 22, 0.85)",
          ],
          borderColor: "#ffffff",
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    });

    // Instructor Load (Line Chart)
    const topInstructors = stats.workload?.instructors?.slice(0, 7) || [];
    setInstructorLoadData({
      labels: topInstructors.map((i) => i.name?.split(" ")[0] || "Unknown"),
      datasets: [
        {
          label: "Utilization %",
          data: topInstructors.map((i) => Math.round(i.utilizationRate)),
          borderColor: "rgb(147, 51, 234)",
          backgroundColor: "rgba(147, 51, 234, 0.15)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "rgb(147, 51, 234)",
          pointBorderColor: "#fff",
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: "rgb(147, 51, 234)",
          pointHoverBorderWidth: 4,
        },
      ],
    });

    // Scheduling Completion (Doughnut Chart)
    const completionRate = Math.round(stats.progress?.completionRate || 0);
    setCapacityData({
      labels: ["Completed", "Pending"],
      datasets: [
        {
          data: [completionRate, 100 - completionRate],
          backgroundColor: [
            "rgba(34, 197, 94, 0.85)",
            "rgba(254, 215, 170, 0.5)",
          ],
          borderColor: "#ffffff",
          borderWidth: 3,
          hoverOffset: 8,
        },
      ],
    });

    // Multi-Metric Performance (Radar Chart)
    setRadarData({
      labels: [
        "Completion",
        "Room Util.",
        "Workload",
        "Instructor Assign.",
        "Time Assign.",
      ],
      datasets: [
        {
          label: "Current Status",
          data: [
            Math.round(stats.progress?.completionRate || 0),
            Math.round(stats.rooms?.utilizationRate || 0),
            Math.min(100, Math.round(stats.workload?.avgUtilization || 0)),
            Math.round(stats.progress?.instructorAssignmentRate || 0),
            Math.round(stats.progress?.timeAssignmentRate || 0),
          ],
          backgroundColor: "rgba(236, 72, 153, 0.25)",
          borderColor: "rgb(236, 72, 153)",
          borderWidth: 3,
          pointBackgroundColor: "rgb(236, 72, 153)",
          pointBorderColor: "#fff",
          pointBorderWidth: 3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: "rgb(236, 72, 153)",
          pointHoverBorderWidth: 4,
        },
      ],
    });
  };

  useEffect(() => {
    setIsMounted(true);

    async function loadData() {
      setLoading(true);
      const data = await fetchData();
      if (data) {
        processChartData(data);
      }
      setLoading(false);
    }

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termId]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Analytics & Insights</CardTitle>
          <CardDescription>Loading scheduling statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[300px] w-full" />
            <Skeleton className="h-[300px] w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        padding: 16,
        titleFont: { size: 15, weight: "bold" as const },
        bodyFont: { size: 14 },
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function (context: { parsed?: { y?: number } }) {
            return (context.parsed?.y || 0) + " students enrolled";
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
          drawBorder: false,
        },
        ticks: {
          font: { size: 13, weight: "500" as const },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: { size: 13, weight: "600" as const },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          font: { size: 14, weight: "600" as const },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        padding: 16,
        titleFont: { size: 15, weight: "bold" as const },
        bodyFont: { size: 14 },
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        callbacks: {
          label: function (context: { label?: string; parsed?: number }) {
            return (context.label || "") + ": " + (context.parsed || 0) + "%";
          },
        },
      },
    },
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        padding: 16,
        titleFont: { size: 15, weight: "bold" as const },
        bodyFont: { size: 14 },
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function (context: { parsed?: { y?: number } }) {
            return (context.parsed?.y || 0) + " hours per week";
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.06)",
          drawBorder: false,
        },
        ticks: {
          font: { size: 13, weight: "500" as const },
          padding: 8,
          callback: function (value: string | number) {
            return value + "h";
          },
        },
        border: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: { size: 13, weight: "600" as const },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          font: { size: 14, weight: "600" as const },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        padding: 16,
        titleFont: { size: 15, weight: "bold" as const },
        bodyFont: { size: 14 },
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        callbacks: {
          label: function (context: { label?: string; parsed?: number }) {
            return (context.label || "") + ": " + (context.parsed || 0) + "%";
          },
        },
      },
    },
    cutout: "70%",
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        padding: 16,
        titleFont: { size: 15, weight: "bold" as const },
        bodyFont: { size: 14 },
        borderColor: "rgba(255, 255, 255, 0.1)",
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function (context: { parsed?: { r?: number } }) {
            return (context.parsed?.r || 0) + "% performance";
          },
        },
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          font: { size: 12 },
          backdropColor: "transparent",
        },
        pointLabels: {
          font: { size: 13, weight: "600" as const },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.08)",
        },
        angleLines: {
          color: "rgba(0, 0, 0, 0.08)",
        },
      },
    },
  };

  if (!isMounted || !enrollmentData) {
    return <div>Loading charts...</div>;
  }

  const lecturePercent = courseTypeData?.datasets?.[0]?.data?.[0] || 0;
  const labPercent = courseTypeData?.datasets?.[0]?.data?.[1] || 0;
  const completedPercent = capacityData?.datasets?.[0]?.data?.[0] || 0;

  return (
    <div className="space-y-6">
      {/* Header with Refresh Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Scheduling Analytics</h2>
          <p className="text-sm text-muted-foreground">
            Real-time scheduling metrics and visualizations
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Refreshing..." : "Refresh"}
        </Button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Sections
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.progress?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.progress?.assigned || 0} fully assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.progress?.completionRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Sections fully assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Room Utilization
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.rooms?.utilizationRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.rooms?.usedRooms || 0} of{" "}
              {dashboardStats?.rooms?.totalRooms || 0} rooms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Workload</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats?.workload?.avgUtilization?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardStats?.faculty?.totalInstructors || 0} instructors
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrollment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="enrollment" className="text-base">
            Enrollment
          </TabsTrigger>
          <TabsTrigger value="rooms" className="text-base">
            Rooms
          </TabsTrigger>
          <TabsTrigger value="instructors" className="text-base">
            Instructors
          </TabsTrigger>
          <TabsTrigger value="progress" className="text-base">
            Progress
          </TabsTrigger>
          <TabsTrigger value="overview" className="text-base">
            Overview
          </TabsTrigger>
        </TabsList>

        {/* Bar Chart Tab */}
        <TabsContent value="enrollment">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    Sections by Academic Level
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Section distribution across academic levels
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {dashboardStats?.progress?.total || 0} Total
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                <Bar data={enrollmentData as any} options={barOptions as any} />
              </div>
              {enrollmentData.labels && enrollmentData.labels.length > 0 && (
                <div className="grid grid-cols-4 gap-4 mt-6">
                  {enrollmentData.labels?.map((label: string, idx: number) => (
                    <div
                      key={idx}
                      className="text-center p-4 bg-gray-50 rounded-lg border"
                    >
                      <p className="text-sm font-semibold text-gray-700">
                        {label}
                      </p>
                      <p className="text-2xl font-bold text-blue-600 mt-2">
                        {enrollmentData.datasets?.[0]?.data?.[idx]}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        sections
                      </p>
                    </div>
                  ))}
                </div>
              )}
              {(!enrollmentData.labels ||
                enrollmentData.labels.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No enrollment data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <PieChart className="h-6 w-6 text-green-600" />
                Room Type Distribution
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Breakdown of lecture rooms versus lab rooms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                {courseTypeData && (
                  <Pie
                    data={
                      courseTypeData as unknown as Parameters<
                        typeof Pie
                      >[0]["data"]
                    }
                    options={
                      pieOptions as unknown as Parameters<
                        typeof Pie
                      >[0]["options"]
                    }
                  />
                )}
              </div>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="flex items-center gap-4 p-6 bg-green-50 rounded-lg border border-green-100">
                  <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold">
                    {lecturePercent}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Lecture Rooms
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboardStats?.rooms?.lectureRooms || 0}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="h-16 w-16 rounded-full bg-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                    {labPercent}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      Lab Rooms
                    </p>
                    <p className="text-2xl font-bold text-orange-600">
                      {dashboardStats?.rooms?.labRooms || 0}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Line Chart Tab */}
        <TabsContent value="instructors">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <LineChart className="h-6 w-6 text-purple-600" />
                    Instructor Workload Distribution
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Utilization percentage per instructor
                  </CardDescription>
                </div>
                <Badge
                  variant="outline"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  Avg:{" "}
                  {dashboardStats?.workload?.avgUtilization?.toFixed(1) || 0}%
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
                {instructorLoadData && (
                  <Line
                    data={
                      instructorLoadData as unknown as Parameters<
                        typeof Line
                      >[0]["data"]
                    }
                    options={
                      lineOptions as unknown as Parameters<
                        typeof Line
                      >[0]["options"]
                    }
                  />
                )}
              </div>
              {instructorLoadData?.labels &&
              instructorLoadData.labels.length > 0 ? (
                <div className="grid grid-cols-4 gap-4 mt-6">
                  <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                    <p className="text-sm font-semibold text-red-700">
                      Overloaded
                    </p>
                    <p className="text-2xl font-bold text-red-600 mt-2">
                      {dashboardStats?.workload?.overloaded || 0}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <p className="text-sm font-semibold text-yellow-700">
                      Near Capacity
                    </p>
                    <p className="text-2xl font-bold text-yellow-600 mt-2">
                      {dashboardStats?.workload?.nearCapacity || 0}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm font-semibold text-green-700">
                      Balanced
                    </p>
                    <p className="text-2xl font-bold text-green-600 mt-2">
                      {dashboardStats?.workload?.balanced || 0}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-sm font-semibold text-blue-700">
                      Underutilized
                    </p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">
                      {dashboardStats?.workload?.underutilized || 0}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No instructor data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doughnut Chart Tab - Progress */}
        <TabsContent value="progress">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Activity className="h-6 w-6 text-green-600" />
                    Scheduling Completion Progress
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Overall section assignment status
                  </CardDescription>
                </div>
                <Badge className="bg-green-100 text-green-700 border-green-200 text-base px-3 py-1">
                  {completedPercent}% Complete
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                {capacityData && (
                  <Doughnut
                    data={
                      capacityData as unknown as Parameters<
                        typeof Doughnut
                      >[0]["data"]
                    }
                    options={
                      doughnutOptions as unknown as Parameters<
                        typeof Doughnut
                      >[0]["options"]
                    }
                  />
                )}
              </div>
              <div className="grid grid-cols-4 gap-4 mt-8">
                <div className="p-4 bg-green-50 rounded-lg border border-green-100 text-center">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    With Instructor
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {dashboardStats?.progress?.withInstructor || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats?.progress?.instructorAssignmentRate?.toFixed(
                      1
                    ) || 0}
                    %
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100 text-center">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    With Room
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {dashboardStats?.progress?.withRoom || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats?.progress?.roomAssignmentRate?.toFixed(1) ||
                      0}
                    %
                  </p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100 text-center">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    With Time
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {dashboardStats?.progress?.withTime || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats?.progress?.timeAssignmentRate?.toFixed(1) ||
                      0}
                    %
                  </p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-100 text-center">
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    Fully Assigned
                  </p>
                  <p className="text-2xl font-bold text-emerald-600">
                    {dashboardStats?.progress?.assigned || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats?.progress?.completionRate?.toFixed(1) || 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Radar Chart Tab */}
        <TabsContent value="overview">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Activity className="h-6 w-6 text-pink-600" />
                Multi-Metric Performance Overview
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Comprehensive analysis across key performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-8 border border-pink-100">
                {radarData && (
                  <Radar
                    data={
                      radarData as unknown as Parameters<
                        typeof Radar
                      >[0]["data"]
                    }
                    options={
                      radarOptions as unknown as Parameters<
                        typeof Radar
                      >[0]["options"]
                    }
                  />
                )}
              </div>
              {radarData?.labels && radarData.labels.length > 0 ? (
                <div className="grid grid-cols-5 gap-4 mt-8">
                  {radarData.labels?.map((label: string, idx: number) => (
                    <div
                      key={idx}
                      className="text-center p-4 bg-gray-50 rounded-lg border"
                    >
                      <p className="text-sm font-semibold text-gray-700">
                        {label}
                      </p>
                      <p className="text-2xl font-bold text-pink-600 mt-2">
                        {radarData.datasets?.[0]?.data?.[idx]}%
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No performance data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
