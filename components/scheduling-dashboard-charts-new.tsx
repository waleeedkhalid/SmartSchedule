'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BarChart3, PieChart, LineChart, Activity, TrendingUp } from 'lucide-react';
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

export function SchedulingDashboardChartsNew() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [courseTypeData, setCourseTypeData] = useState<any>(null);
  const [instructorLoadData, setInstructorLoadData] = useState<any>(null);
  const [capacityData, setCapacityData] = useState<any>(null);
  const [radarData, setRadarData] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    setLastUpdate(new Date());
    
    async function loadData() {
      // TODO: Replace with real API calls
      // For now, using empty data structure
      const dashboardStats = {
        enrollments: { byLevel: [], total: 0 },
        rooms: { total: 0, used: 0, utilization: [] },
        workload: { instructors: [], average: 0 },
        timeslots: { distribution: [] },
        electives: { courses: [], totalEnrollments: 0 },
        progress: { totalSections: 0, assigned: 0, unassigned: 0 },
      };
      const sections: any[] = [];
      const courses: any[] = [];
      const instructors: any[] = [];

      // Enrollment by Level (Bar Chart)
      const enrollmentByLevel = dashboardStats.enrollments?.byLevel || [];
      setEnrollmentData({
        labels: enrollmentByLevel.map((e: any) => `Level ${e.level}`),
        datasets: [{
          label: 'Students Enrolled',
          data: enrollmentByLevel.map((e: any) => e.count),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(99, 102, 241, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(192, 132, 252, 0.8)',
          ].slice(0, enrollmentByLevel.length),
          borderColor: [
            'rgb(59, 130, 246)',
            'rgb(99, 102, 241)',
            'rgb(139, 92, 246)',
            'rgb(168, 85, 247)',
            'rgb(192, 132, 252)',
          ].slice(0, enrollmentByLevel.length),
          borderWidth: 2,
          borderRadius: 8,
        }],
      });

      // Course Type Distribution (Pie Chart)
      const requiredCount = courses.filter(c => !c.is_elective).length;
      const electiveCount = courses.filter(c => c.is_elective).length;
      const total = requiredCount + electiveCount;
      setCourseTypeData({
        labels: ['Required Courses', 'Elective Courses'],
        datasets: [{
          data: [
            total > 0 ? Math.round((requiredCount / total) * 100) : 0,
            total > 0 ? Math.round((electiveCount / total) * 100) : 0,
          ],
          backgroundColor: [
            'rgba(34, 197, 94, 0.85)',
            'rgba(249, 115, 22, 0.85)',
          ],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 8,
        }],
      });

      // Instructor Load (Line Chart)
      const topInstructors = instructors.slice(0, 5);
      setInstructorLoadData({
        labels: topInstructors.map(i => i.name),
        datasets: [{
          label: 'Teaching Hours/Week',
          data: topInstructors.map(i => {
            const instructorSections = sections.filter(s => s.instructor_id === i.id);
            return instructorSections.length * 3; // Assume 3 hours per section
          }),
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
        }],
      });

      // Capacity Utilization (Doughnut Chart)
      const totalCapacity = sections.reduce((sum, s) => sum + (s.capacity || 0), 0);
      const totalEnrolled = sections.reduce((sum, s) => sum + (s.current_enrollment || 0), 0);
      const filledPercent = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
      setCapacityData({
        labels: ['Filled Capacity', 'Available Capacity'],
        datasets: [{
          data: [filledPercent, 100 - filledPercent],
          backgroundColor: [
            'rgba(249, 115, 22, 0.85)',
            'rgba(254, 215, 170, 0.5)',
          ],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 8,
        }],
      });

      // Multi-Metric Performance (Radar Chart)
      setRadarData({
        labels: ['Enrollment', 'Capacity Util.', 'Teaching Load', 'Efficiency', 'Satisfaction'],
        datasets: [{
          label: 'Current Semester',
          data: [
            Math.min(100, Math.round((dashboardStats.enrollments?.total || 0) / 5)),
            filledPercent,
            92,
            88,
            85,
          ],
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
        }],
      });
    }

    loadData();
  }, []);

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
          label: function(context: any) {
            return context.parsed.y + ' students enrolled';
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
          font: { size: 13, weight: '600' as const },
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
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return context.label + ': ' + context.parsed + '%';
          }
        }
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        padding: 16,
        titleFont: { size: 15, weight: 'bold' as const },
        bodyFont: { size: 14 },
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            return context.parsed.y + ' hours per week';
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
          font: { size: 13, weight: '500' as const },
          padding: 8,
          callback: function(value: any) {
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
          font: { size: 13, weight: '600' as const },
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
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        callbacks: {
          label: function(context: any) {
            return context.label + ': ' + context.parsed + '%';
          }
        },
      },
    },
    cutout: '70%',
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
          label: function(context: any) {
            return context.parsed.r + '% performance';
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
        grid: {
          color: 'rgba(0, 0, 0, 0.08)',
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.08)',
        },
      },
    },
  };

  if (!isMounted || !enrollmentData) {
    return <div>Loading charts...</div>;
  }

  const requiredPercent = courseTypeData?.datasets[0].data[0] || 0;
  const electivePercent = courseTypeData?.datasets[0].data[1] || 0;
  const filledPercent = capacityData?.datasets[0].data[0] || 0;
  const availablePercent = capacityData?.datasets[0].data[1] || 0;

  return (
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
                  Student distribution across academic levels
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
            {enrollmentData.labels.length > 0 && (
              <div className="grid grid-cols-5 gap-4 mt-6">
                {enrollmentData.labels.map((label: string, idx: number) => (
                  <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className="text-2xl font-bold text-blue-600 mt-2">{enrollmentData.datasets[0].data[idx]}</p>
                    <p className="text-xs text-muted-foreground mt-1">students</p>
                  </div>
                ))}
              </div>
            )}
            {enrollmentData.labels.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No enrollment data available
              </div>
            )}
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
              {courseTypeData && <Pie data={courseTypeData} options={pieOptions} />}
            </div>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="flex items-center gap-4 p-6 bg-green-50 rounded-lg border border-green-100">
                <div className="h-16 w-16 rounded-full bg-green-600 flex items-center justify-center text-white text-2xl font-bold">
                  {requiredPercent}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Required Courses</p>
                  <p className="text-2xl font-bold text-green-600">{requiredPercent}%</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-6 bg-orange-50 rounded-lg border border-orange-100">
                <div className="h-16 w-16 rounded-full bg-orange-600 flex items-center justify-center text-white text-2xl font-bold">
                  {electivePercent}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Elective Courses</p>
                  <p className="text-2xl font-bold text-orange-600">{electivePercent}%</p>
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
              {instructorLoadData && <Line data={instructorLoadData} options={lineOptions} />}
            </div>
            {instructorLoadData?.labels && instructorLoadData.labels.length > 0 ? (
              <div className="grid grid-cols-5 gap-4 mt-6">
                {instructorLoadData.labels.map((name: string, idx: number) => (
                  <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{name.replace('Dr. ', '')}</p>
                    <p className="text-2xl font-bold text-purple-600 mt-2">{instructorLoadData.datasets[0].data[idx]}h</p>
                    <p className="text-xs text-muted-foreground mt-1">per week</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No instructor data available
              </div>
            )}
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
                {filledPercent}% Utilized
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-8 border border-orange-100">
              {capacityData && <Doughnut data={capacityData} options={doughnutOptions} />}
            </div>
            <div className="grid grid-cols-2 gap-6 mt-8">
              <div className="p-6 bg-orange-50 rounded-lg border border-orange-100">
                <p className="text-sm font-semibold text-gray-700 mb-2">Filled Capacity</p>
                <p className="text-4xl font-bold text-orange-600">{filledPercent}%</p>
                <div className="w-full h-3 bg-orange-200 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-orange-600 rounded-full" style={{ width: `${filledPercent}%` }}></div>
                </div>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Available Capacity</p>
                <p className="text-4xl font-bold text-gray-600">{availablePercent}%</p>
                <div className="w-full h-3 bg-gray-200 rounded-full mt-4 overflow-hidden">
                  <div className="h-full bg-gray-400 rounded-full" style={{ width: `${availablePercent}%` }}></div>
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
              {radarData && <Radar data={radarData} options={radarOptions} />}
            </div>
            {radarData?.labels && radarData.labels.length > 0 ? (
              <div className="grid grid-cols-5 gap-4 mt-8">
                {radarData.labels.map((label: string, idx: number) => (
                  <div key={idx} className="text-center p-4 bg-gray-50 rounded-lg border">
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className="text-2xl font-bold text-pink-600 mt-2">{radarData.datasets[0].data[idx]}%</p>
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
  );
}

