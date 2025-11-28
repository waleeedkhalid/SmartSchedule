'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BookOpen, TrendingUp, Clock, Calendar, GraduationCap } from 'lucide-react';
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
import { Bar, Doughnut, Line } from 'react-chartjs-2';

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

export default function StudentDashboardPage() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setLastUpdate(new Date());
  }, []);

  // Mock data for student enrollment
  const enrollmentData = {
    labels: ['Required Courses', 'Elective Courses'],
    datasets: [{
      data: [18, 6],
      backgroundColor: [
        'rgba(59, 130, 246, 0.85)',
        'rgba(139, 92, 246, 0.85)',
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const weeklyScheduleData = {
    labels: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'],
    datasets: [{
      label: 'Credit Hours',
      data: [6, 3, 6, 3, 3],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(139, 92, 246, 0.8)',
        'rgba(236, 72, 153, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(245, 158, 11, 0.8)',
      ],
      borderColor: [
        'rgb(59, 130, 246)',
        'rgb(139, 92, 246)',
        'rgb(236, 72, 153)',
        'rgb(34, 197, 94)',
        'rgb(245, 158, 11)',
      ],
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const gradeTrendsData = {
    labels: ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Current'],
    datasets: [{
      label: 'GPA',
      data: [3.2, 3.4, 3.5, 3.6, 3.7, 3.8],
      borderColor: 'rgb(34, 197, 94)',
      backgroundColor: 'rgba(34, 197, 94, 0.15)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: 'rgb(34, 197, 94)',
      pointBorderColor: '#fff',
      pointBorderWidth: 3,
      pointRadius: 6,
      pointHoverRadius: 8,
    }],
  };

  const electivePreferencesData = {
    labels: ['ML Basics', 'Cloud Computing', 'Mobile Dev', 'Cybersecurity', 'Blockchain', 'Data Science'],
    datasets: [{
      label: 'Interest Score',
      data: [95, 82, 78, 88, 65, 91],
      backgroundColor: 'rgba(236, 72, 153, 0.8)',
      borderColor: 'rgb(236, 72, 153)',
      borderWidth: 2,
      borderRadius: 8,
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
          font: { size: 13, weight: 'bold' as const },
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
          font: { size: 13, weight: 'normal' as const },
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
          font: { size: 13, weight: 'bold' as const },
          padding: 8,
        },
        border: { display: false },
      },
    },
  };

  const horizontalBarOptions = {
    indexAxis: 'y' as const,
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return 'Interest: ' + (context.parsed?.x || 0) + '%';
          }
        }
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false,
        },
        ticks: {
          font: { size: 13, weight: 'normal' as const },
          padding: 8,
          callback: function (value: string | number) {
            return value + '%';
          }
        },
        border: { display: false },
      },
      y: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: { size: 13, weight: 'bold' as const },
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
          font: { size: 14, weight: 'bold' as const },
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return (context.label || '') + ': ' + (context.parsed || 0) + ' credits';
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return 'GPA: ' + (context.parsed?.y || 0).toFixed(2);
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 4.0,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false,
        },
        ticks: {
          font: { size: 13, weight: 'normal' as const },
          padding: 8,
          stepSize: 0.5,
        },
        border: { display: false },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: { size: 13, weight: 'bold' as const },
          padding: 8,
        },
        border: { display: false },
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Personal academic progress and course enrollment analytics
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
        <Badge variant="secondary" className="text-lg px-4 py-2 bg-purple-100 text-purple-900 border-purple-200">
          <GraduationCap className="h-4 w-4 mr-2" />
          Level 6
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current GPA</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">3.8</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+0.1</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Credits Earned</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">102</p>
                <span className="text-sm text-gray-600 font-medium">of 135 required</span>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Load</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">21</p>
                <span className="text-sm text-purple-600 font-medium">credit hours</span>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">76%</p>
                <span className="text-sm text-orange-600 font-medium">degree progress</span>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="enrollment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="enrollment">Enrollment</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="electives">Electives</TabsTrigger>
        </TabsList>

        {/* Enrollment Tab */}
        <TabsContent value="enrollment">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BookOpen className="h-6 w-6 text-blue-600" />
                Enrollment Overview
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Distribution of required versus elective courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                <Doughnut data={enrollmentData} options={doughnutOptions} />
              </div>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-blue-900">Required Courses</h4>
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-4xl font-bold text-blue-600 mb-2">18</p>
                  <p className="text-sm text-gray-700">
                    Core curriculum courses completed and in progress
                  </p>
                  <div className="w-full h-3 bg-blue-200 rounded-full mt-4">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
                <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-purple-900">Elective Courses</h4>
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <p className="text-4xl font-bold text-purple-600 mb-2">6</p>
                  <p className="text-sm text-gray-700">
                    Selected electives based on career interests and goals
                  </p>
                  <div className="w-full h-3 bg-purple-200 rounded-full mt-4">
                    <div className="h-full bg-purple-600 rounded-full" style={{ width: '25%' }}></div>
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
                <Calendar className="h-6 w-6 text-purple-600" />
                Weekly Course Schedule
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Credit hours distribution across the week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
                <Bar data={weeklyScheduleData} options={chartOptions} />
              </div>
              <div className="grid grid-cols-5 gap-4 mt-6">
                {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'].map((day, idx) => (
                  <div key={day} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{day}</p>
                    <p className="text-2xl font-bold text-purple-600 mt-2">{[6, 3, 6, 3, 3][idx]}</p>
                    <p className="text-xs text-muted-foreground mt-1">credit hours</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp className="h-6 w-6 text-green-600" />
                Academic Progress Trends
              </CardTitle>
              <CardDescription className="text-base mt-2">
                GPA progression throughout your academic journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                <Line data={gradeTrendsData} options={lineOptions} />
              </div>
              <div className="grid grid-cols-6 gap-4 mt-6">
                {[
                  { semester: 'Sem 1', gpa: 3.2, grade: 'B+' },
                  { semester: 'Sem 2', gpa: 3.4, grade: 'B+' },
                  { semester: 'Sem 3', gpa: 3.5, grade: 'A-' },
                  { semester: 'Sem 4', gpa: 3.6, grade: 'A-' },
                  { semester: 'Sem 5', gpa: 3.7, grade: 'A-' },
                  { semester: 'Current', gpa: 3.8, grade: 'A' }
                ].map((item) => (
                  <div key={item.semester} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{item.semester}</p>
                    <p className="text-2xl font-bold text-green-600 mt-2">{item.gpa}</p>
                    <Badge variant="outline" className="mt-2">{item.grade}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Electives Tab */}
        <TabsContent value="electives">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BookOpen className="h-6 w-6 text-pink-600" />
                Elective Course Preferences
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Interest levels for available elective courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-8 border border-pink-100">
                <Bar data={electivePreferencesData} options={horizontalBarOptions} />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { course: 'ML Basics', rank: 1, interest: 95 },
                  { course: 'Data Science', rank: 2, interest: 91 },
                  { course: 'Cybersecurity', rank: 3, interest: 88 }
                ].map((item) => (
                  <div key={item.course} className="p-6 bg-pink-50 rounded-lg border border-pink-100">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-white">#{item.rank}</Badge>
                      <span className="text-2xl font-bold text-pink-600">{item.interest}%</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{item.course}</p>
                    <p className="text-xs text-muted-foreground mt-1">Interest score</p>
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
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Chart.js Implementation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Chart Types</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Doughnut (Enrollment)</li>
                <li>✓ Bar Chart (Weekly Schedule)</li>
                <li>✓ Line Chart (GPA Trends)</li>
                <li>✓ Horizontal Bar (Preferences)</li>
              </ul>
            </div>
            <div className="p-6 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Interactive tooltips</li>
                <li>✓ Progress tracking</li>
                <li>✓ Responsive design</li>
                <li>✓ Trend visualization</li>
              </ul>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Analytics</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Academic progress</li>
                <li>✓ Course distribution</li>
                <li>✓ Schedule optimization</li>
                <li>✓ Preference insights</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

