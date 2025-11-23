'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, TrendingUp, Clock, Calendar } from 'lucide-react';
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
import { getMockFacultySections, getMockUserRole } from '@/lib/demo-data';

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

export function FacultyDashboardCharts() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [teachingLoadData, setTeachingLoadData] = useState<any>(null);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [weeklyScheduleData, setWeeklyScheduleData] = useState<any>(null);
  const [studentPerformanceData, setStudentPerformanceData] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    setLastUpdate(new Date());
    
    async function loadData() {
      const userRole = await getMockUserRole();
      if (!userRole || userRole.role !== 'faculty') return;

      const sections = await getMockFacultySections(userRole.id);
      
      // Teaching load by course (Bar)
      const courseCounts: Record<string, number> = {};
      sections.forEach(section => {
        courseCounts[section.course_code] = (courseCounts[section.course_code] || 0) + 1;
      });

      const courseCodes = Object.keys(courseCounts);
      setTeachingLoadData({
        labels: courseCodes,
        datasets: [{
          label: 'Sections',
          data: courseCodes.map(code => courseCounts[code]),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(34, 197, 94, 0.8)',
          ].slice(0, courseCodes.length),
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(139, 92, 246)',
            'rgb(236, 72, 153)',
            'rgb(34, 197, 94)',
          ].slice(0, courseCodes.length),
          borderWidth: 2,
          borderRadius: 8,
        }],
      });

      // Enrollment status (Doughnut) - Mock data
      const totalEnrolled = sections.reduce((sum, s) => sum + (s.current_enrollment || 0), 0);
      const totalCapacity = sections.reduce((sum, s) => sum + (s.capacity || 0), 0);
      const available = totalCapacity - totalEnrolled;
      
      setEnrollmentData({
        labels: ['Enrolled', 'Available'],
        datasets: [{
          data: [totalEnrolled, available],
          backgroundColor: [
            'rgba(34, 197, 94, 0.85)',
            'rgba(226, 232, 240, 0.85)',
          ],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 8,
        }],
      });

      // Weekly schedule (Line) - Mock data
      setWeeklyScheduleData({
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
      });

      // Student performance (Radar) - Mock data
      setStudentPerformanceData({
        labels: courseCodes.length > 0 ? [...courseCodes, 'Overall'] : ['SWE 211', 'SWE 314', 'SWE 417', 'SWE 499', 'Overall'],
        datasets: [{
          label: 'Average Performance',
          data: courseCodes.length > 0 
            ? [...courseCodes.map(() => 82 + Math.floor(Math.random() * 10)), 83]
            : [82, 78, 85, 88, 83],
          backgroundColor: 'rgba(59, 130, 246, 0.25)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 3,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#fff',
          pointBorderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
        }],
      });
    }

    loadData();
  }, []);

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
          stepSize: 1,
          callback: function(value: any) {
            if (Number.isInteger(value)) {
              return value;
            }
            return null;
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

  if (!isMounted || !teachingLoadData) {
    return <div>Loading charts...</div>;
  }

  const totalSections = teachingLoadData.datasets[0].data.reduce((sum: number, val: number) => sum + val, 0);
  const enrolled = enrollmentData?.datasets[0].data[0] || 0;
  const available = enrollmentData?.datasets[0].data[1] || 0;

  return (
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
              {teachingLoadData.labels.map((code: string, idx: number) => (
                <div key={code} className="text-center p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-semibold text-gray-700">{code}</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">{teachingLoadData.datasets[0].data[idx]}</p>
                  <p className="text-xs text-muted-foreground mt-1">sections</p>
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
              {enrollmentData && <Doughnut data={enrollmentData} options={doughnutOptions} />}
            </div>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-green-900">Current Enrollment</h4>
                  <Users className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-4xl font-bold text-green-600 mb-2">{enrolled}</p>
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">{Math.round((enrolled / (enrolled + available)) * 100)}%</span> capacity utilization
                </p>
                <div className="w-full h-3 bg-green-200 rounded-full mt-4">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: `${(enrolled / (enrolled + available)) * 100}%` }}></div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-900">Available Seats</h4>
                  <Calendar className="h-5 w-5 text-gray-600" />
                </div>
                <p className="text-4xl font-bold text-gray-600 mb-2">{available}</p>
                <p className="text-sm text-gray-700">
                  Room for additional students across sections
                </p>
                <div className="w-full h-3 bg-gray-200 rounded-full mt-4">
                  <div className="h-full bg-gray-400 rounded-full" style={{ width: `${(available / (enrolled + available)) * 100}%` }}></div>
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
              {weeklyScheduleData && <Line data={weeklyScheduleData} options={lineOptions} />}
            </div>
            <div className="grid grid-cols-5 gap-4 mt-6">
              {weeklyScheduleData?.labels.map((day: string, idx: number) => (
                <div key={day} className="text-center p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-semibold text-gray-700">{day}</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{weeklyScheduleData.datasets[0].data[idx]}h</p>
                  <p className="text-xs text-muted-foreground mt-1">teaching hours</p>
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
              {studentPerformanceData && <Radar data={studentPerformanceData} options={radarOptions} />}
            </div>
            <div className="grid grid-cols-5 gap-4 mt-8">
              {studentPerformanceData?.labels.map((course: string, idx: number) => (
                <div key={course} className="text-center p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-semibold text-gray-700">{course}</p>
                  <p className="text-2xl font-bold text-orange-600 mt-2">{studentPerformanceData.datasets[0].data[idx]}%</p>
                  <Badge variant="outline" className="mt-2">B+</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

