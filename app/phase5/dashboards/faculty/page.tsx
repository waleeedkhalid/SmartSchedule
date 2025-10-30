'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, Users, TrendingUp, Clock, Calendar } from 'lucide-react';
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
} from 'chart.js';
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2';

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

export default function FacultyDashboardPage() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setLastUpdate(new Date());
  }, []);

  // Mock data for faculty member's teaching load
  const teachingLoadData = {
    labels: ['SWE 211', 'SWE 314', 'SWE 417', 'SWE 499'],
    datasets: [
      {
        label: 'Sections',
        data: [2, 1, 1, 1],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(34, 197, 94, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
          'rgb(34, 197, 94)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const enrollmentData = {
    labels: ['Enrolled', 'Available'],
    datasets: [{
      data: [142, 38],
      backgroundColor: [
        'rgba(34, 197, 94, 0.85)',
        'rgba(226, 232, 240, 0.85)',
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const weeklyScheduleData = {
    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    datasets: [{
      label: 'Teaching Hours',
      data: [4.5, 3, 4.5, 3, 4.5],
      borderColor: 'rgb(147, 51, 234)',
      backgroundColor: 'rgba(147, 51, 234, 0.15)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgb(147, 51, 234)',
      pointBorderColor: '#fff',
      pointBorderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 8,
    }],
  };

  const studentPerformanceData = {
    labels: ['SWE 211', 'SWE 314', 'SWE 417', 'SWE 499', 'Overall'],
    datasets: [{
      label: 'Average Performance',
      data: [82, 78, 85, 88, 83],
      backgroundColor: 'rgba(59, 130, 246, 0.25)',
      borderColor: 'rgb(59, 130, 246)',
      borderWidth: 3,
      pointBackgroundColor: 'rgb(59, 130, 246)',
      pointBorderColor: '#fff',
      pointBorderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 8,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          font: { size: 13, weight: '600' as const },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        titleFont: { size: 15, weight: 'bold' as const },
        bodyFont: { size: 14 },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false,
        },
        ticks: {
          font: { size: 13, weight: '500' as const },
          padding: 8,
        },
        border: { display: false },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: { size: 13, weight: '600' as const },
          padding: 8,
        },
        border: { display: false },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          font: { size: 14, weight: '600' as const },
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        titleFont: { size: 15, weight: 'bold' as const },
        bodyFont: { size: 14 },
        callbacks: {
          label: function(context: any) {
            return context.label + ': ' + context.parsed + ' students';
          }
        }
      },
    },
    cutout: '65%',
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        titleFont: { size: 15, weight: 'bold' as const },
        bodyFont: { size: 14 },
        callbacks: {
          label: function(context: any) {
            return context.parsed.y + ' hours';
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 6,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false,
        },
        ticks: {
          font: { size: 13, weight: '500' as const },
          padding: 8,
          callback: function(value: any) {
            return value + 'h';
          }
        },
        border: { display: false },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: { size: 13, weight: '600' as const },
          padding: 8,
        },
        border: { display: false },
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        titleFont: { size: 15, weight: 'bold' as const },
        bodyFont: { size: 14 },
        callbacks: {
          label: function(context: any) {
            return 'Avg: ' + context.parsed.r + '%';
          }
        }
      },
    },
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          font: { size: 12 },
          backdropColor: 'transparent',
        },
        pointLabels: {
          font: { size: 13, weight: '600' as const },
        },
        grid: { color: 'rgba(0, 0, 0, 0.08)' },
        angleLines: { color: 'rgba(0, 0, 0, 0.08)' },
      },
    },
  };

  return (
    <div className="container mx-auto px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/phase5">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Phase 5
            </Button>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
            Faculty Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Personal teaching analytics and student performance insights
          </p>
          {isMounted && lastUpdate && (
            <div className="flex items-center gap-2 mt-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2 bg-green-100 text-green-900 border-green-200">
          <BookOpen className="h-4 w-4 mr-2" />
          5 Sections
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">142</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+8 this semester</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">4</p>
                <span className="text-sm text-gray-600 font-medium">unique courses</span>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Weekly Hours</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">19.5h</p>
                <span className="text-sm text-green-600 font-medium">Balanced load</span>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Performance</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">83%</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+2.5%</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="load" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="load">Teaching Load</TabsTrigger>
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Teaching Load Tab */}
        <TabsContent value="load">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Teaching Load Distribution
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Number of sections per course this semester
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                <Bar data={teachingLoadData} options={chartOptions} />
              </div>
              <div className="grid grid-cols-4 gap-4 mt-6">
                {[
                  { code: 'SWE 211', sections: 2, students: 70, level: 'Intro' },
                  { code: 'SWE 314', sections: 1, students: 35, level: 'Advanced' },
                  { code: 'SWE 417', sections: 1, students: 25, level: 'Advanced' },
                  { code: 'SWE 499', sections: 1, students: 12, level: 'Capstone' }
                ].map((course) => (
                  <div key={course.code} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{course.code}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{course.students}</p>
                    <p className="text-xs text-muted-foreground mt-1">students</p>
                    <Badge variant="outline" className="mt-2 text-xs">{course.level}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Enrollment Tab */}
        <TabsContent value="enrollment">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Users className="h-6 w-6 text-green-600" />
                Section Enrollment Status
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Current enrollment vs total capacity across all sections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                <Doughnut data={enrollmentData} options={doughnutOptions} />
              </div>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="p-6 bg-green-50 rounded-lg border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-green-900">Current Enrollment</h4>
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-4xl font-bold text-green-600 mb-2">142</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">79%</span> capacity utilization
                  </p>
                  <div className="w-full h-3 bg-green-200 rounded-full mt-4">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: '79%' }}></div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Available Seats</h4>
                    <Calendar className="h-5 w-5 text-gray-600" />
                  </div>
                  <p className="text-4xl font-bold text-gray-600 mb-2">38</p>
                  <p className="text-sm text-gray-700">
                    Room for additional students across sections
                  </p>
                  <div className="w-full h-3 bg-gray-200 rounded-full mt-4">
                    <div className="h-full bg-gray-400 rounded-full" style={{ width: '21%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Tab */}
        <TabsContent value="schedule">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Clock className="h-6 w-6 text-purple-600" />
                Weekly Teaching Schedule
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Distribution of teaching hours across the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
                <Line data={weeklyScheduleData} options={lineOptions} />
              </div>
              <div className="grid grid-cols-5 gap-4 mt-6">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((day, idx) => (
                  <div key={day} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{day}</p>
                    <p className="text-2xl font-bold text-purple-600 mt-2">{[4.5, 3, 4.5, 3, 4.5][idx]}h</p>
                    <p className="text-xs text-muted-foreground mt-1">{[2, 1, 2, 1, 2][idx]} sections</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp className="h-6 w-6 text-orange-600" />
                Student Performance Overview
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Average student performance across all taught courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8 border border-orange-100">
                <Radar data={studentPerformanceData} options={radarOptions} />
              </div>
              <div className="grid grid-cols-5 gap-4 mt-8">
                {[
                  { course: 'SWE 211', score: 82, grade: 'B+' },
                  { course: 'SWE 314', score: 78, grade: 'B' },
                  { course: 'SWE 417', score: 85, grade: 'A' },
                  { course: 'SWE 499', score: 88, grade: 'A' },
                  { course: 'Overall', score: 83, grade: 'B+' }
                ].map((item) => (
                  <div key={item.course} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{item.course}</p>
                    <p className="text-2xl font-bold text-orange-600 mt-2">{item.score}%</p>
                    <Badge variant="outline" className="mt-2">{item.grade}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Implementation Info */}
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Chart.js Implementation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Chart Types</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Bar Chart (Teaching Load)</li>
                <li>✓ Doughnut (Enrollment)</li>
                <li>✓ Line Chart (Weekly Schedule)</li>
                <li>✓ Radar (Performance)</li>
              </ul>
            </div>
            <div className="p-6 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Interactive tooltips</li>
                <li>✓ Responsive design</li>
                <li>✓ Color-coded insights</li>
                <li>✓ Performance tracking</li>
              </ul>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Analytics</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Load distribution</li>
                <li>✓ Enrollment tracking</li>
                <li>✓ Schedule optimization</li>
                <li>✓ Student outcomes</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

