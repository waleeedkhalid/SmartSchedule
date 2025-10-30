'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Users, BarChart3, TrendingUp, Clock, AlertTriangle } from 'lucide-react';
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
import { Bar, Doughnut, Radar } from 'react-chartjs-2';

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

export default function TeachingLoadDashboardPage() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setLastUpdate(new Date());
  }, []);

  // Mock data for instructor workload
  const instructorLoadData = {
    labels: ['Dr. Ahmed', 'Dr. Fatima', 'Dr. Mohammed', 'Dr. Sarah', 'Dr. Omar', 'Dr. Ali', 'Dr. Nora', 'Dr. Khalid'],
    datasets: [
      {
        label: 'Current Load (sections)',
        data: [15, 12, 14, 9, 11, 16, 10, 13],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Max Capacity',
        data: [12, 12, 12, 12, 12, 12, 12, 12],
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        borderRadius: 8,
        type: 'line' as const,
      },
    ],
  };

  const capacityStatusData = {
    labels: ['Overloaded', 'Near Capacity', 'Balanced', 'Underutilized'],
    datasets: [{
      data: [2, 3, 2, 1],
      backgroundColor: [
        'rgba(239, 68, 68, 0.85)',
        'rgba(245, 158, 11, 0.85)',
        'rgba(34, 197, 94, 0.85)',
        'rgba(59, 130, 246, 0.85)',
      ],
      borderColor: '#ffffff',
      borderWidth: 3,
      hoverOffset: 8,
    }],
  };

  const departmentLoadData = {
    labels: ['SWE', 'CS', 'IT', 'IS', 'CE'],
    datasets: [
      {
        label: 'Total Sections',
        data: [45, 38, 32, 28, 35],
        backgroundColor: 'rgba(147, 51, 234, 0.8)',
        borderColor: 'rgb(147, 51, 234)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Available Instructors',
        data: [8, 7, 6, 5, 6],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  const creditsDistributionData = {
    labels: ['Lectures', 'Labs', 'Tutorials', 'Projects', 'Seminars'],
    datasets: [{
      label: 'Credit Hours Distribution',
      data: [85, 72, 58, 45, 30],
      backgroundColor: 'rgba(236, 72, 153, 0.25)',
      borderColor: 'rgb(236, 72, 153)',
      borderWidth: 3,
      pointBackgroundColor: 'rgb(236, 72, 153)',
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
            return context.label + ': ' + context.parsed + ' instructors';
          }
        }
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
            return context.parsed.r + '% of total credits';
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Teaching Load Committee Dashboard
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Comprehensive workload analytics and instructor capacity management
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
        <Badge variant="secondary" className="text-lg px-4 py-2 bg-blue-100 text-blue-900 border-blue-200">
          <Users className="h-4 w-4 mr-2" />
          8 Instructors
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sections</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">102</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">+5.2%</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Load</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">12.8</p>
                <span className="text-sm text-gray-600 font-medium">sections/instructor</span>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overloaded</p>
                <p className="text-3xl font-bold text-red-600 mt-1">2</p>
                <span className="text-sm text-red-600 font-medium">needs attention</span>
              </div>
              <div className="h-12 w-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilization</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">87%</p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Efficient</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="workload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workload">Workload</TabsTrigger>
          <TabsTrigger value="capacity">Capacity</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
        </TabsList>

        {/* Workload Tab */}
        <TabsContent value="workload">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                Instructor Workload Analysis
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Current teaching load vs maximum capacity per instructor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-100">
                <Bar data={instructorLoadData} options={chartOptions} />
              </div>
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-semibold text-gray-700">Overloaded</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">2</p>
                  <p className="text-xs text-muted-foreground mt-1">&gt;100% capacity</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm font-semibold text-gray-700">Near Capacity</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-2">3</p>
                  <p className="text-xs text-muted-foreground mt-1">80-100% capacity</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-gray-700">Balanced</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">2</p>
                  <p className="text-xs text-muted-foreground mt-1">60-80% capacity</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-gray-700">Underutilized</p>
                  <p className="text-3xl font-bold text-blue-600 mt-2">1</p>
                  <p className="text-xs text-muted-foreground mt-1">&lt;60% capacity</p>
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
                <Users className="h-6 w-6 text-purple-600" />
                Capacity Status Distribution
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Overview of instructor capacity utilization across the department
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
                <Doughnut data={capacityStatusData} options={doughnutOptions} />
              </div>
              <div className="grid grid-cols-2 gap-6 mt-8">
                <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 rounded-lg border border-red-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-red-900">Critical Actions Required</h4>
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <p className="text-sm text-gray-700">
                    2 instructors are overloaded (&gt;12 sections). Consider redistributing sections or hiring additional faculty.
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-green-900">Optimization Opportunities</h4>
                    <TrendingUp className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-700">
                    1 instructor has capacity for additional sections. Can help balance the workload distribution.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BarChart3 className="h-6 w-6 text-green-600" />
                Department Load Comparison
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Teaching load distribution across different departments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 border border-green-100">
                <Bar data={departmentLoadData} options={chartOptions} />
              </div>
              <div className="grid grid-cols-5 gap-4 mt-6">
                {['SWE', 'CS', 'IT', 'IS', 'CE'].map((dept, idx) => (
                  <div key={dept} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{dept}</p>
                    <p className="text-2xl font-bold text-purple-600 mt-2">{[5.6, 5.4, 5.3, 5.6, 5.8][idx]}</p>
                    <p className="text-xs text-muted-foreground mt-1">avg sections</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Distribution Tab */}
        <TabsContent value="distribution">
          <Card className="border shadow-sm">
            <CardHeader className="pb-8">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <BarChart3 className="h-6 w-6 text-pink-600" />
                Credit Hours Distribution by Type
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Breakdown of teaching credits across different course formats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-8 border border-pink-100">
                <Radar data={creditsDistributionData} options={radarOptions} />
              </div>
              <div className="grid grid-cols-5 gap-4 mt-8">
                {[
                  { label: 'Lectures', value: 85, color: 'blue' },
                  { label: 'Labs', value: 72, color: 'green' },
                  { label: 'Tutorials', value: 58, color: 'purple' },
                  { label: 'Projects', value: 45, color: 'orange' },
                  { label: 'Seminars', value: 30, color: 'pink' }
                ].map((item) => (
                  <div key={item.label} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{item.label}</p>
                    <p className="text-2xl font-bold text-pink-600 mt-2">{item.value}%</p>
                    <p className="text-xs text-muted-foreground mt-1">of total</p>
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
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Chart.js Implementation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Chart Types</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Mixed Bar & Line (Workload)</li>
                <li>✓ Doughnut (Capacity Status)</li>
                <li>✓ Grouped Bar (Departments)</li>
                <li>✓ Radar (Credit Distribution)</li>
              </ul>
            </div>
            <div className="p-6 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Interactive tooltips</li>
                <li>✓ Responsive design</li>
                <li>✓ Real-time updates</li>
                <li>✓ Color-coded alerts</li>
              </ul>
            </div>
            <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
              <h4 className="font-semibold text-gray-900 text-lg mb-3">Analytics</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>✓ Load balancing insights</li>
                <li>✓ Capacity optimization</li>
                <li>✓ Department comparisons</li>
                <li>✓ Workload trends</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

