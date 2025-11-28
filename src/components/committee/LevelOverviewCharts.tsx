/**
 * Level Overview Charts Component
 * Displays Chart.js visualizations for level statistics
 */

"use client";

import { Bar, Pie, Line } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { barChartOptions, pieChartOptions, lineChartOptions, getChartColorPalette } from "@/lib/chart-config";

interface LevelStat {
  level: number;
  studentCount: number;
  sectionCount: number;
  instructorCount: number;
  totalCapacity: number;
  enrolledCount: number;
}

interface LevelOverviewChartsProps {
  stats: LevelStat[];
}

export function LevelOverviewCharts({ stats }: LevelOverviewChartsProps) {
  // Prepare data for charts
  const labels = stats.map((s) => `Level ${s.level}`);
  const colors = getChartColorPalette(stats.length);

  // Students per level (Bar Chart)
  const studentsData = {
    labels,
    datasets: [
      {
        label: "Students",
        data: stats.map((s) => s.studentCount),
        backgroundColor: colors[0],
        borderColor: colors[0],
        borderWidth: 2,
      },
    ],
  };

  // Sections distribution (Pie Chart)
  const sectionsData = {
    labels,
    datasets: [
      {
        label: "Sections",
        data: stats.map((s) => s.sectionCount),
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  // Capacity vs Enrolled (Line Chart)
  const capacityData = {
    labels,
    datasets: [
      {
        label: "Total Capacity",
        data: stats.map((s) => s.totalCapacity),
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: colors[0],
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
      {
        label: "Enrolled",
        data: stats.map((s) => s.enrolledCount),
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        borderColor: colors[2],
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Instructor assignments (Bar Chart)
  const instructorData = {
    labels,
    datasets: [
      {
        label: "Instructors",
        data: stats.map((s) => s.instructorCount),
        backgroundColor: colors[4],
        borderColor: colors[4],
        borderWidth: 2,
      },
    ],
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Students per Level */}
      <Card>
        <CardHeader>
          <CardTitle>Students per Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={studentsData} options={barChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Section Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Section Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Pie data={sectionsData} options={pieChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Capacity vs Enrolled */}
      <Card>
        <CardHeader>
          <CardTitle>Capacity vs Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Line data={capacityData} options={lineChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Instructor Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>Instructor Assignments by Level</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={instructorData} options={barChartOptions} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

