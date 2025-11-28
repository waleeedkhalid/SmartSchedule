/**
 * Course Overview Charts Component
 * Displays Chart.js visualizations for course statistics
 */

"use client";

import { Bar, Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { barChartOptions, pieChartOptions, getChartColorPalette } from "@/lib/chart-config";

interface CourseStat {
  courseCode: string;
  courseName: string;
  sectionCount: number;
  totalCapacity: number;
  enrolledCount: number;
  rooms: string[];
  instructors: string[];
  utilization: number;
}

interface RoomStat {
  roomNumber: string;
  sectionCount: number;
  totalCapacity: number;
  courses: string[];
}

interface CourseOverviewChartsProps {
  courses: CourseStat[];
  rooms: RoomStat[];
}

export function CourseOverviewCharts({ courses, rooms }: CourseOverviewChartsProps) {
  // Prepare data for charts
  const colors = getChartColorPalette(Math.max(courses.length, rooms.length));

  // Capacity utilization (Bar Chart) - Top 10 courses
  const topCourses = [...courses]
    .sort((a, b) => b.utilization - a.utilization)
    .slice(0, 10);

  const utilizationData = {
    labels: topCourses.map((c) => c.courseCode),
    datasets: [
      {
        label: "Utilization %",
        data: topCourses.map((c) => c.utilization),
        backgroundColor: topCourses.map((c) =>
          c.utilization >= 90 ? colors[2] : c.utilization < 70 ? colors[3] : colors[0]
        ),
        borderWidth: 2,
      },
    ],
  };

  // Room usage (Doughnut Chart)
  const roomData = {
    labels: rooms.map((r) => `Room ${r.roomNumber}`),
    datasets: [
      {
        label: "Sections",
        data: rooms.map((r) => r.sectionCount),
        backgroundColor: colors,
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  // Section load per course (Bar Chart) - Top 10
  const topSectionCourses = [...courses]
    .sort((a, b) => b.sectionCount - a.sectionCount)
    .slice(0, 10);

  const sectionLoadData = {
    labels: topSectionCourses.map((c) => c.courseCode),
    datasets: [
      {
        label: "Sections",
        data: topSectionCourses.map((c) => c.sectionCount),
        backgroundColor: colors[4],
        borderWidth: 2,
      },
    ],
  };

  // Capacity vs Enrolled (Stacked Bar) - Top 10 by capacity
  const topCapacityCourses = [...courses]
    .sort((a, b) => b.totalCapacity - a.totalCapacity)
    .slice(0, 10);

  const capacityEnrolledData = {
    labels: topCapacityCourses.map((c) => c.courseCode),
    datasets: [
      {
        label: "Enrolled",
        data: topCapacityCourses.map((c) => c.enrolledCount),
        backgroundColor: colors[2],
      },
      {
        label: "Available",
        data: topCapacityCourses.map((c) => c.totalCapacity - c.enrolledCount),
        backgroundColor: colors[1],
      },
    ],
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Capacity Utilization */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10: Capacity Utilization</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={utilizationData} options={barChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Room Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Room Usage Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Doughnut data={roomData} options={pieChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Section Load */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10: Sections per Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar data={sectionLoadData} options={barChartOptions} />
          </div>
        </CardContent>
      </Card>

      {/* Capacity vs Enrolled */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10: Capacity vs Enrollment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <Bar
              data={capacityEnrolledData}
              options={{
                ...barChartOptions,
                plugins: {
                  ...barChartOptions.plugins,
                  legend: {
                    ...barChartOptions.plugins.legend,
                    position: "top" as const,
                  },
                },
                scales: {
                  ...barChartOptions.scales,
                  x: {
                    ...barChartOptions.scales.x,
                    stacked: true,
                  },
                  y: {
                    ...barChartOptions.scales.y,
                    stacked: true,
                  },
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

