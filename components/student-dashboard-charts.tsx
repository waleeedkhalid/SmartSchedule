'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, TrendingUp, Clock, GraduationCap } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { getMockCreditStats, getMockEnrollments, getMockStudentSchedule } from '@/lib/demo-data';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function StudentDashboardCharts() {
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<any>(null);
  const [weeklyScheduleData, setWeeklyScheduleData] = useState<any>(null);
  const [gradeTrendsData, setGradeTrendsData] = useState<any>(null);
  const [electivePreferencesData, setElectivePreferencesData] = useState<any>(null);

  useEffect(() => {
    setIsMounted(true);
    setLastUpdate(new Date());
    
    async function loadData() {
      const [creditStats, enrollments, schedule] = await Promise.all([
        getMockCreditStats(),
        getMockEnrollments(),
        getMockStudentSchedule(),
      ]);

      // Enrollment data (Doughnut)
      const requiredCredits = creditStats.required_credits || 0;
      const electiveCredits = creditStats.elective_credits || 0;
      setEnrollmentData({
        labels: ['Required Courses', 'Elective Courses'],
        datasets: [{
          data: [requiredCredits, electiveCredits],
          backgroundColor: [
            'rgba(59, 130, 246, 0.85)',
            'rgba(139, 92, 246, 0.85)',
          ],
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 8,
        }],
      });

      // Weekly schedule data (Bar)
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
      const dayCredits: Record<string, number> = {};
      days.forEach(day => dayCredits[day] = 0);
      
      // Fix: Schedule API returns courses with sections array, not flat sections
      // Ensure schedule is an array of courses
      const scheduleArray = Array.isArray(schedule) 
        ? schedule 
        : (schedule?.schedule && Array.isArray(schedule.schedule))
          ? schedule.schedule
          : [];
      
      // Iterate through each course and then through its sections
      scheduleArray.forEach((course: any) => {
        if (course.sections && Array.isArray(course.sections)) {
          course.sections.forEach((section: any) => {
            const pattern = section.meeting_pattern;
            if (pattern?.days && Array.isArray(pattern.days)) {
              // Use course credits (each section belongs to a course)
              const credits = course.credits || section.credits || 3;
              pattern.days.forEach((day: string) => {
                if (dayCredits.hasOwnProperty(day)) {
                  dayCredits[day] += credits;
                }
              });
            }
          });
        }
      });

      setWeeklyScheduleData({
        labels: days,
        datasets: [{
          label: 'Credit Hours',
          data: days.map(day => dayCredits[day] || 0),
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
      });

      // Grade trends (Line) - Mock data
      setGradeTrendsData({
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
      });

      // Elective preferences (Horizontal Bar) - Mock data
      setElectivePreferencesData({
        labels: ['ML Basics', 'Cloud Computing', 'Mobile Dev', 'Cybersecurity', 'Blockchain', 'Data Science'],
        datasets: [{
          label: 'Interest Score',
          data: [95, 82, 78, 88, 65, 91],
          backgroundColor: 'rgba(236, 72, 153, 0.8)',
          borderColor: 'rgb(236, 72, 153)',
          borderWidth: 2,
          borderRadius: 8,
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
            return 'Interest: ' + context.parsed.x + '%';
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
          font: { size: 13, weight: '500' as const },
          padding: 8,
          callback: function(value: any) {
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
            return context.label + ': ' + context.parsed + ' credits';
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
            return 'GPA: ' + context.parsed.y.toFixed(2);
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
          font: { size: 13, weight: '500' as const },
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
          font: { size: 13, weight: '600' as const },
          padding: 8,
        },
        border: { display: false },
      },
    },
  };

  if (!isMounted || !enrollmentData) {
    return <div>Loading charts...</div>;
  }

  const requiredCredits = enrollmentData.datasets[0].data[0];
  const electiveCredits = enrollmentData.datasets[0].data[1];

  return (
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
                <p className="text-4xl font-bold text-blue-600 mb-2">{requiredCredits}</p>
                <p className="text-sm text-gray-700">
                  Core curriculum courses completed and in progress
                </p>
                <div className="w-full h-3 bg-blue-200 rounded-full mt-4">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(requiredCredits / (requiredCredits + electiveCredits)) * 100}%` }}></div>
                </div>
              </div>
              <div className="p-6 bg-purple-50 rounded-lg border border-purple-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-purple-900">Elective Courses</h4>
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <p className="text-4xl font-bold text-purple-600 mb-2">{electiveCredits}</p>
                <p className="text-sm text-gray-700">
                  Selected electives based on career interests and goals
                </p>
                <div className="w-full h-3 bg-purple-200 rounded-full mt-4">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(electiveCredits / (requiredCredits + electiveCredits)) * 100}%` }}></div>
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
              {weeklyScheduleData && <Bar data={weeklyScheduleData} options={chartOptions} />}
            </div>
            <div className="grid grid-cols-5 gap-4 mt-6">
              {weeklyScheduleData?.labels.map((day: string, idx: number) => (
                <div key={day} className="text-center p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-semibold text-gray-700">{day}</p>
                  <p className="text-2xl font-bold text-purple-600 mt-2">{weeklyScheduleData.datasets[0].data[idx]}</p>
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
              {gradeTrendsData && <Line data={gradeTrendsData} options={lineOptions} />}
            </div>
            <div className="grid grid-cols-6 gap-4 mt-6">
              {gradeTrendsData?.labels.map((semester: string, idx: number) => (
                <div key={semester} className="text-center p-4 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-semibold text-gray-700">{semester}</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{gradeTrendsData.datasets[0].data[idx]}</p>
                  <Badge variant="outline" className="mt-2">A-</Badge>
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
              {electivePreferencesData && <Bar data={electivePreferencesData} options={horizontalBarOptions} />}
            </div>
            <div className="grid grid-cols-3 gap-4 mt-8">
              {electivePreferencesData?.labels.slice(0, 3).map((course: string, idx: number) => (
                <div key={course} className="p-6 bg-pink-50 rounded-lg border border-pink-100">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="bg-white">#{idx + 1}</Badge>
                    <span className="text-2xl font-bold text-pink-600">{electivePreferencesData.datasets[0].data[idx]}%</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{course}</p>
                  <p className="text-xs text-muted-foreground mt-1">Interest score</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

