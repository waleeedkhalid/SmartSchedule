'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, TrendingUp, Clock, Calendar, BookOpen, Building } from 'lucide-react';
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

export default function RegistrarDashboardPage() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setLastUpdate(new Date());
  }, []);

  // Mock data for enrollment trends
  const enrollmentTrendsData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [
      {
        label: 'Regular Students',
        data: [450, 485, 502, 518, 523, 525],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(59, 130, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Irregular Students',
        data: [28, 32, 35, 38, 41, 43],
        borderColor: 'rgb(236, 72, 153)',
        backgroundColor: 'rgba(236, 72, 153, 0.15)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgb(236, 72, 153)',
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  const capacityUtilizationData = {
    labels: ['0-20%', '20-40%', '40-60%', '60-80%', '80-100%', 'Overbooked'],
    datasets: [{
      label: 'Sections',
      data: [5, 12, 28, 45, 32, 3],
      backgroundColor: [
        'rgba(239, 68, 68, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(234, 179, 8, 0.8)',
        'rgba(34, 197, 94, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(147, 51, 234, 0.8)',
      ],
      borderColor: [
        'rgb(239, 68, 68)',
        'rgb(245, 158, 11)',
        'rgb(234, 179, 8)',
        'rgb(34, 197, 94)',
        'rgb(59, 130, 246)',
        'rgb(147, 51, 234)',
      ],
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const courseDemandData = {
    labels: ['SWE 211', 'CS 101', 'SWE 314', 'IT 202', 'SWE 417', 'CS 215', 'IS 301', 'SWE 499'],
    datasets: [{
      label: 'Enrolled Students',
      data: [145, 138, 125, 118, 112, 105, 98, 85],
      backgroundColor: 'rgba(139, 92, 246, 0.8)',
      borderColor: 'rgb(139, 92, 246)',
      borderWidth: 2,
      borderRadius: 8,
    }],
  };

  const departmentDistributionData = {
    labels: ['SWE', 'CS', 'IT', 'IS', 'CE'],
    datasets: [{
      data: [285, 125, 85, 58, 47],
      backgroundColor: [
        'rgba(59, 130, 246, 0.85)',
        'rgba(139, 92, 246, 0.85)',
        'rgba(34, 197, 94, 0.85)',
        'rgba(245, 158, 11, 0.85)',
        'rgba(236, 72, 153, 0.85)',
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 8,
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
          label: function(context: any) {
            return 'Enrolled: ' + context.parsed.x + ' students';
          }
        }
      },
    },
    scales: {
      x: {
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
      y: {
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
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + context.parsed.y + ' students';
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Registrar Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            System-wide enrollment analytics and capacity management
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
        <Badge variant="secondary" className="text-lg px-4 py-2 bg-red-100 text-red-900 border-red-200">
          <Users className="h-4 w-4 mr-2" />
          568 Students
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">568</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+43 YoY</span>
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
                <p className="text-sm font-medium text-muted-foreground">Sections</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">125</p>
                <span className="text-sm text-gray-600 font-medium">active this semester</span>
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
                <p className="text-sm font-medium text-muted-foreground">Irregular</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">43</p>
                <span className="text-sm text-orange-600 font-medium">7.6% of total</span>
              </div>
              <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Capacity</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">76%</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Optimal</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Building className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="demand">Demand</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        {/* Enrollment Trends Tab */}
        <TabsContent value="trends">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
                Enrollment Trends
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Student registration progress throughout the enrollment period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                <Line data={enrollmentTrendsData} options={lineOptions} />
              </div>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-blue-900">Regular Students</h4>
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <p className="text-4xl font-bold text-blue-600 mb-2">525</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">92.4%</span> of total enrollment
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">+16.7% growth rate</span>
                  </div>
                </div>
                <div className="p-6 bg-pink-50 rounded-lg border border-pink-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-pink-900">Irregular Students</h4>
                    <Calendar className="h-5 w-5 text-pink-600" />
                  </div>
                  <p className="text-4xl font-bold text-pink-600 mb-2">43</p>
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">7.6%</span> of total enrollment
                  </p>
                  <div className="flex items-center gap-2 mt-4">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">+53.6% growth rate</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Capacity Tab */}
        <TabsContent value="capacity">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Building className="h-6 w-6 text-green-600" />
                Section Capacity Utilization
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Distribution of sections by enrollment fill percentage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                <Bar data={capacityUtilizationData} options={chartOptions} />
              </div>
              <div className="grid grid-cols-6 gap-4 mt-6">
                {[
                  { range: '0-20%', count: 5, status: 'Critical', color: 'red' },
                  { range: '20-40%', count: 12, status: 'Low', color: 'orange' },
                  { range: '40-60%', count: 28, status: 'Fair', color: 'yellow' },
                  { range: '60-80%', count: 45, status: 'Good', color: 'green' },
                  { range: '80-100%', count: 32, status: 'Optimal', color: 'blue' },
                  { range: '100%+', count: 3, status: 'Over', color: 'purple' }
                ].map((item) => (
                  <div key={item.range} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-xs font-semibold text-gray-700">{item.range}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{item.count}</p>
                    <Badge variant="outline" className="mt-2 text-xs">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Demand Tab */}
        <TabsContent value="demand">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BookOpen className="h-6 w-6 text-purple-600" />
                Course Demand Analysis
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Top courses ranked by total student enrollment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
                <Bar data={courseDemandData} options={horizontalBarOptions} />
              </div>
              <div className="grid grid-cols-4 gap-4 mt-8">
                {[
                  { rank: 1, code: 'SWE 211', students: 145 },
                  { rank: 2, code: 'CS 101', students: 138 },
                  { rank: 3, code: 'SWE 314', students: 125 },
                  { rank: 4, code: 'IT 202', students: 118 }
                ].map((item) => (
                  <div key={item.code} className="p-6 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="bg-white">#{item.rank}</Badge>
                      <span className="text-2xl font-bold text-purple-600">{item.students}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{item.code}</p>
                    <p className="text-xs text-muted-foreground mt-1">total students</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Building className="h-6 w-6 text-orange-600" />
                Department Distribution
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Student enrollment across different academic departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8 border border-orange-100">
                <Doughnut data={departmentDistributionData} options={doughnutOptions} />
              </div>
              <div className="grid grid-cols-5 gap-4 mt-8">
                {[
                  { dept: 'SWE', count: 285, percent: 50.2, color: 'blue' },
                  { dept: 'CS', count: 125, percent: 22.0, color: 'purple' },
                  { dept: 'IT', count: 85, percent: 15.0, color: 'green' },
                  { dept: 'IS', count: 58, percent: 10.2, color: 'orange' },
                  { dept: 'CE', count: 47, percent: 8.3, color: 'pink' }
                ].map((item) => (
                  <div key={item.dept} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{item.dept}</p>
                    <p className="text-2xl font-bold text-orange-600 mt-2">{item.count}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.percent}%</p>
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
            <Building className="h-5 w-5 text-blue-600" />
            Chart.js Implementation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Chart Types</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Multi-Line (Enrollment Trends)</li>
                <li>✓ Bar Chart (Capacity)</li>
                <li>✓ Horizontal Bar (Course Demand)</li>
                <li>✓ Doughnut (Departments)</li>
              </ul>
            </div>
            <div className="p-6 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Interactive tooltips</li>
                <li>✓ Real-time tracking</li>
                <li>✓ Responsive design</li>
                <li>✓ Capacity monitoring</li>
              </ul>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Analytics</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Enrollment trends</li>
                <li>✓ Capacity analysis</li>
                <li>✓ Demand forecasting</li>
                <li>✓ Distribution insights</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

