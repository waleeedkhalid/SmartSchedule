'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, BarChart3, LineChart, PieChart, Activity, TrendingUp, Users, BookOpen, Clock } from 'lucide-react';
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
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2';

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

export default function SchedulingDashboardPage() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setLastUpdate(new Date());

    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Enhanced Bar Chart Data - Enrollment by Level
  const enrollmentData = {
    labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'],
    datasets: [
      {
        label: 'Students Enrolled',
        data: [120, 115, 108, 95, 87],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(192, 132, 252, 0.8)',
        ],
        borderColor: [
          'rgb(59, 130, 246)',
          'rgb(99, 102, 241)',
          'rgb(139, 92, 246)',
          'rgb(168, 85, 247)',
          'rgb(192, 132, 252)',
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        titleFont: { size: 15, weight: 'bold' as const },
        bodyFont: { size: 14 },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return (context.parsed?.y || 0) + ' students enrolled';
          }
        }
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
          font: { size: 13, weight: 'bold' as const },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
  };

  // Pie Chart Data - Course Type Distribution
  const courseTypeData = {
    labels: ['Required Courses', 'Elective Courses'],
    datasets: [
      {
        data: [65, 35],
        backgroundColor: [
          'rgba(34, 197, 94, 0.85)',
          'rgba(249, 115, 22, 0.85)',
        ],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const pieOptions = {
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
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return (context.label || '') + ': ' + (context.parsed || 0) + '%';
          }
        }
      },
    },
  };

  // Line Chart Data - Instructor Load
  const instructorLoadData = {
    labels: ['Dr. Ahmed', 'Dr. Fatima', 'Dr. Mohammed', 'Dr. Sarah', 'Dr. Omar'],
    datasets: [
      {
        label: 'Teaching Hours/Week',
        data: [12, 15, 9, 12, 10],
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
        pointHoverBackgroundColor: 'rgb(147, 51, 234)',
        pointHoverBorderWidth: 4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        titleFont: { size: 15, weight: 'bold' as const },
        bodyFont: { size: 14 },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return (context.parsed?.y || 0) + ' hours per week';
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 20,
        grid: {
          color: 'rgba(0, 0, 0, 0.06)',
          drawBorder: false,
        },
        ticks: {
          font: { size: 13, weight: 'normal' as const },
          padding: 8,
          callback: function (value: string | number) {
            return value + 'h';
          }
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
          font: { size: 13, weight: 'bold' as const },
          padding: 8,
        },
        border: {
          display: false,
        },
      },
    },
  };

  // Doughnut Chart Data - Capacity
  const capacityData = {
    labels: ['Filled Capacity', 'Available Capacity'],
    datasets: [
      {
        data: [78, 22],
        backgroundColor: [
          'rgba(249, 115, 22, 0.85)',
          'rgba(254, 215, 170, 0.5)',
        ],
        borderColor: '#ffffff',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
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
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return (context.label || '') + ': ' + (context.parsed || 0) + '%';
          }
        },
      },
    },
    cutout: '70%',
  };

  // Radar Chart Data - Multi-Metric Performance
  const radarData = {
    labels: ['Enrollment', 'Capacity Util.', 'Teaching Load', 'Efficiency', 'Satisfaction'],
    datasets: [
      {
        label: 'Current Semester',
        data: [85, 78, 92, 88, 85],
        backgroundColor: 'rgba(236, 72, 153, 0.25)',
        borderColor: 'rgb(236, 72, 153)',
        borderWidth: 3,
        pointBackgroundColor: 'rgb(236, 72, 153)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointHoverBackgroundColor: 'rgb(236, 72, 153)',
        pointHoverBorderWidth: 4,
      },
    ],
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        titleFont: { size: 15, weight: 'bold' as const },
        bodyFont: { size: 14 },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return (context.parsed?.r || 0) + '% performance';
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
          font: { size: 13, weight: 'bold' as const },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.08)',
        },
      },
    },
  };

  return (
    <div className="container mx-auto px-8 py-12 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/phase5">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Phase 5
            </Button>
          </Link>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Scheduling Committee Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Comprehensive system overview and scheduling analytics
          </p>
          {isMounted && (
            <div className="flex items-center gap-2 mt-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Last updated: {lastUpdate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
        <Badge variant="secondary" className="text-lg px-4 py-2 bg-blue-100 text-blue-900 border-blue-200">
          <BarChart3 className="h-4 w-4 mr-2" />
          5 Chart Types
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">525</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+2.4%</span>
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
                <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">100</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-gray-600 font-medium">65% Required</span>
                </div>
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
                <p className="text-sm font-medium text-muted-foreground">Avg Teaching Load</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">11.6h</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-sm text-gray-600 font-medium">Per week</span>
                </div>
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
                <p className="text-sm font-medium text-muted-foreground">Capacity Used</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">78%</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+3.2%</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="enrollment" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 h-12">
          <TabsTrigger value="enrollment" className="text-base">Enrollment</TabsTrigger>
          <TabsTrigger value="courses" className="text-base">Courses</TabsTrigger>
          <TabsTrigger value="instructors" className="text-base">Instructors</TabsTrigger>
          <TabsTrigger value="capacity" className="text-base">Capacity</TabsTrigger>
          <TabsTrigger value="comparison" className="text-base">Overview</TabsTrigger>
        </TabsList>

        {/* Bar Chart Tab */}
        <TabsContent value="enrollment">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                    Enrollment by Academic Level
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Student distribution across five academic levels
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending Up
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                <Bar data={enrollmentData} options={barOptions} />
              </div>
              <div className="grid grid-cols-5 gap-4 mt-6">
                {enrollmentData.labels.map((label, idx) => (
                  <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{enrollmentData.datasets[0].data[idx]}</p>
                    <p className="text-xs text-muted-foreground mt-1">students</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pie Chart Tab */}
        <TabsContent value="courses">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <PieChart className="h-6 w-6 text-green-600" />
                Course Type Distribution
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Breakdown of required versus elective courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                <Pie data={courseTypeData} options={pieOptions} />
              </div>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="flex items-center gap-4 p-6 bg-green-50 rounded-lg border border-green-100">
                  <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold">
                    65
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Required Courses</p>
                    <p className="text-2xl font-bold text-green-600">65%</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-6 bg-orange-50 rounded-lg border border-orange-100">
                  <div className="h-16 w-16 rounded-full bg-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                    35
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">Elective Courses</p>
                    <p className="text-2xl font-bold text-orange-600">35%</p>
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
                    Instructor Teaching Load
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Weekly teaching hours per faculty member
                  </CardDescription>
                </div>
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Avg: 11.6h/week
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
                <Line data={instructorLoadData} options={lineOptions} />
              </div>
              <div className="grid grid-cols-5 gap-4 mt-6">
                {instructorLoadData.labels.map((name, idx) => (
                  <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{name.replace('Dr. ', '')}</p>
                    <p className="text-2xl font-bold text-purple-600 mt-2">{instructorLoadData.datasets[0].data[idx]}h</p>
                    <p className="text-xs text-muted-foreground mt-1">per week</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Doughnut Chart Tab */}
        <TabsContent value="capacity">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Activity className="h-6 w-6 text-orange-600" />
                    Section Capacity Utilization
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    Current capacity usage across all sections
                  </CardDescription>
                </div>
                <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-base px-3 py-1">
                  78% Utilized
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8 border border-orange-100">
                <Doughnut data={capacityData} options={doughnutOptions} />
              </div>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="p-6 bg-orange-50 rounded-lg border border-orange-100">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Filled Capacity</p>
                  <p className="text-4xl font-bold text-orange-600">78%</p>
                  <div className="w-full h-3 bg-orange-200 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-orange-600 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                </div>
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-sm font-semibold text-gray-700 mb-2">Available Capacity</p>
                  <p className="text-4xl font-bold text-gray-600">22%</p>
                  <div className="w-full h-3 bg-gray-200 rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full" style={{ width: '22%' }}></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Radar Chart Tab */}
        <TabsContent value="comparison">
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
                <Radar data={radarData} options={radarOptions} />
              </div>
              <div className="grid grid-cols-5 gap-4 mt-8">
                {radarData.labels.map((label, idx) => (
                  <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className="text-2xl font-bold text-pink-600 mt-2">{radarData.datasets[0].data[idx]}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Chart.js Implementation Details
          </CardTitle>
          <CardDescription className="text-base mt-2">
            Professional data visualization using Chart.js v4
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
              <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center mb-4">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Chart Types</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Bar Charts - Categorical comparison</li>
                <li>✓ Line Charts - Trend analysis</li>
                <li>✓ Pie Charts - Proportional data</li>
                <li>✓ Doughnut Charts - Percentage breakdown</li>
                <li>✓ Radar Charts - Multi-dimensional comparison</li>
              </ul>
            </div>
            <div className="p-6 bg-green-50 rounded-lg border border-green-100">
              <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center mb-4">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Interactive hover tooltips</li>
                <li>✓ Responsive & mobile-friendly</li>
                <li>✓ Custom color schemes</li>
                <li>✓ Smooth animations</li>
                <li>✓ Accessibility support</li>
              </ul>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
              <div className="h-10 w-10 rounded-lg bg-purple-600 flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Data Integration</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Real-time updates</li>
                <li>✓ API data binding</li>
                <li>✓ Dynamic refresh</li>
                <li>✓ TypeScript support</li>
                <li>✓ Performance optimized</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

