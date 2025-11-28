"use client";

import React, { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart, ChartConfiguration, registerables } from "chart.js";

Chart.register(...registerables);

interface FacultyWorkload {
  faculty_id: string;
  faculty_name: string;
  total_sections: number;
  total_contact_hours: number;
  total_prep_hours: number;
  courses: string[];
  overload: boolean;
}

interface WorkloadAnalyticsChartProps {
  workloadData: FacultyWorkload[];
  standardLoad?: number; // Standard contact hours per week
}

export function WorkloadAnalyticsChart({
  workloadData,
  standardLoad = 12,
}: WorkloadAnalyticsChartProps) {
  const contactHoursChartRef = useRef<HTMLCanvasElement>(null);
  const sectionsChartRef = useRef<HTMLCanvasElement>(null);
  const contactHoursChartInstance = useRef<Chart | null>(null);
  const sectionsChartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!workloadData || workloadData.length === 0) {
      return;
    }

    // Destroy existing charts
    if (contactHoursChartInstance.current) {
      contactHoursChartInstance.current.destroy();
    }
    if (sectionsChartInstance.current) {
      sectionsChartInstance.current.destroy();
    }

    // Contact Hours Chart
    if (contactHoursChartRef.current) {
      const ctx = contactHoursChartRef.current.getContext('2d');
      if (ctx) {
        const facultyNames = workloadData.map(f => f.faculty_name);
        const contactHours = workloadData.map(f => f.total_contact_hours);
        const overloadFlags = workloadData.map(f => f.overload);

        const backgroundColors = overloadFlags.map(isOverload => 
          isOverload ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)'
        );

        contactHoursChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: facultyNames,
            datasets: [
              {
                label: 'Contact Hours',
                data: contactHours,
                backgroundColor: backgroundColors,
                borderColor: overloadFlags.map(isOverload => 
                  isOverload ? 'rgb(239, 68, 68)' : 'rgb(59, 130, 246)'
                ),
                borderWidth: 1,
              },
              {
                label: 'Standard Load',
                data: new Array(facultyNames.length).fill(standardLoad),
                type: 'line',
                borderColor: 'rgb(34, 197, 94)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Hours per Week',
                },
              },
              x: {
                title: {
                  display: true,
                  text: 'Faculty',
                },
              },
            },
            plugins: {
              legend: {
                display: true,
                position: 'top',
              },
              tooltip: {
                callbacks: {
                  afterLabel: (context) => {
                    if (context.datasetIndex === 0) {
                      const index = context.dataIndex;
                      const faculty = workloadData[index];
                      const diff = faculty.total_contact_hours - standardLoad;
                      const status = diff > 0 
                        ? `${diff.toFixed(1)} hours overload` 
                        : `${Math.abs(diff).toFixed(1)} hours under`;
                      return [
                        `Sections: ${faculty.total_sections}`,
                        `Prep Hours: ${faculty.total_prep_hours}`,
                        `Status: ${status}`,
                        `Courses: ${faculty.courses.join(', ')}`,
                      ];
                    }
                    return '';
                  },
                },
              },
            },
          },
        });
      }
    }

    // Sections Distribution Chart
    if (sectionsChartRef.current) {
      const ctx = sectionsChartRef.current.getContext('2d');
      if (ctx) {
        const facultyNames = workloadData.map(f => f.faculty_name);
        const sections = workloadData.map(f => f.total_sections);

        sectionsChartInstance.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: facultyNames,
            datasets: [
              {
                label: 'Number of Sections',
                data: sections,
                backgroundColor: 'rgba(168, 85, 247, 0.8)',
                borderColor: 'rgb(168, 85, 247)',
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
                title: {
                  display: true,
                  text: 'Number of Sections',
                },
              },
              x: {
                title: {
                  display: true,
                  text: 'Faculty',
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  afterLabel: (context) => {
                    const index = context.dataIndex;
                    const faculty = workloadData[index];
                    return [
                      `Contact Hours: ${faculty.total_contact_hours}`,
                      `Courses: ${faculty.courses.join(', ')}`,
                    ];
                  },
                },
              },
            },
          },
        });
      }
    }

    // Cleanup
    return () => {
      if (contactHoursChartInstance.current) {
        contactHoursChartInstance.current.destroy();
      }
      if (sectionsChartInstance.current) {
        sectionsChartInstance.current.destroy();
      }
    };
  }, [workloadData, standardLoad]);

  if (!workloadData || workloadData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Faculty Workload Analytics</CardTitle>
          <CardDescription>No workload data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Schedule data has not been generated yet. Analytics will appear here once schedules are created.
          </p>
        </CardContent>
      </Card>
    );
  }

  const overloadCount = workloadData.filter(f => f.overload).length;
  const avgContactHours = workloadData.reduce((sum, f) => sum + f.total_contact_hours, 0) / workloadData.length;
  const avgSections = workloadData.reduce((sum, f) => sum + f.total_sections, 0) / workloadData.length;

  return (
    <div className="space-y-6">
      {/* Summary Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Faculty</CardDescription>
            <CardTitle className="text-2xl">{workloadData.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Contact Hours</CardDescription>
            <CardTitle className="text-2xl">{avgContactHours.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Sections</CardDescription>
            <CardTitle className="text-2xl">{avgSections.toFixed(1)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overloaded Faculty</CardDescription>
            <CardTitle className="text-2xl text-red-600">{overloadCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Contact Hours Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Faculty Contact Hours Distribution</CardTitle>
          <CardDescription>
            Comparing actual contact hours vs. standard load ({standardLoad} hours/week)
            <span className="ml-2 text-xs">
              <span className="text-blue-600">■ Normal Load</span>
              <span className="ml-4 text-red-600">■ Overload</span>
              <span className="ml-4 text-green-600">— Standard</span>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <canvas ref={contactHoursChartRef}></canvas>
          </div>
        </CardContent>
      </Card>

      {/* Sections Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Section Distribution</CardTitle>
          <CardDescription>Number of sections assigned to each faculty member</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <canvas ref={sectionsChartRef}></canvas>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

