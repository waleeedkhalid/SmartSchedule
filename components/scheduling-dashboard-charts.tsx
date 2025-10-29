'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  TrendingUp,
  Users,
  Calendar,
  Clock,
  DoorOpen,
  BookOpen,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'
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
  ChartOptions,
  Filler
} from 'chart.js'
import { Bar, Doughnut, Line, Radar } from 'react-chartjs-2'

// Register Chart.js components
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
)

interface DashboardStats {
  faculty?: any
  rooms?: any
  progress?: any
  workload?: any
  enrollments?: any
  timeslots?: any
  electives?: any
}

export function SchedulingDashboardCharts() {
  const [stats, setStats] = useState<DashboardStats>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch('/api/scheduling/dashboard-stats?type=all')
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard statistics')
        }

        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  // Chart configurations
  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 }
      }
    }
  }

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      }
    }
  }

  const lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%'
          }
        }
      }
    }
  }

  // Elective Preferences Chart Data
  const electivePreferencesData = stats.electives ? {
    labels: stats.electives.slice(0, 10).map((e: any) => e.course_code),
    datasets: [
      {
        label: '1st Choice',
        data: stats.electives.slice(0, 10).map((e: any) => e.first_choice),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: '2nd Choice',
        data: stats.electives.slice(0, 10).map((e: any) => e.second_choice),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1
      },
      {
        label: '3rd Choice',
        data: stats.electives.slice(0, 10).map((e: any) => e.third_choice),
        backgroundColor: 'rgba(236, 72, 153, 0.6)',
        borderColor: 'rgba(236, 72, 153, 1)',
        borderWidth: 1
      }
    ]
  } : null

  // Faculty Availability Chart Data
  const facultyAvailabilityData = stats.faculty ? {
    labels: ['With Preferences', 'Without Preferences', 'With Unavailability'],
    datasets: [{
      label: 'Instructors',
      data: [
        stats.faculty.withPreferences,
        stats.faculty.withoutPreferences,
        stats.faculty.withUnavailability
      ],
      backgroundColor: [
        'rgba(16, 185, 129, 0.6)',
        'rgba(245, 158, 11, 0.6)',
        'rgba(239, 68, 68, 0.6)'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  } : null

  // Scheduling Progress Chart Data
  const progressData = stats.progress ? {
    labels: ['Instructor', 'Room', 'Time', 'Complete'],
    datasets: [{
      label: 'Assignment Progress (%)',
      data: [
        stats.progress.instructorAssignmentRate,
        stats.progress.roomAssignmentRate,
        stats.progress.timeAssignmentRate,
        stats.progress.completionRate
      ],
      borderColor: 'rgba(16, 185, 129, 1)',
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      tension: 0.4,
      fill: true
    }]
  } : null

  // Room Utilization Chart Data
  const roomUtilizationData = stats.rooms ? {
    labels: ['Lecture Rooms', 'Lab Rooms'],
    datasets: [{
      label: 'Room Types',
      data: [stats.rooms.lectureRooms, stats.rooms.labRooms],
      backgroundColor: [
        'rgba(59, 130, 246, 0.6)',
        'rgba(139, 92, 246, 0.6)'
      ],
      borderWidth: 2,
      borderColor: '#ffffff'
    }]
  } : null

  // Instructor Workload Distribution
  const workloadDistributionData = stats.workload ? {
    labels: ['Overloaded', 'Near Capacity', 'Balanced', 'Underutilized'],
    datasets: [{
      label: 'Instructors',
      data: [
        stats.workload.overloaded,
        stats.workload.nearCapacity,
        stats.workload.balanced,
        stats.workload.underutilized
      ],
      backgroundColor: [
        'rgba(239, 68, 68, 0.6)',
        'rgba(245, 158, 11, 0.6)',
        'rgba(16, 185, 129, 0.6)',
        'rgba(59, 130, 246, 0.6)'
      ],
      borderWidth: 1
    }]
  } : null

  // Time Slot Distribution
  const timeSlotData = stats.timeslots?.timeDistribution ? {
    labels: stats.timeslots.timeDistribution.map((t: any) => t.time),
    datasets: [{
      label: 'Sections',
      data: stats.timeslots.timeDistribution.map((t: any) => t.sections),
      backgroundColor: 'rgba(59, 130, 246, 0.6)',
      borderColor: 'rgba(59, 130, 246, 1)',
      borderWidth: 1
    }]
  } : null

  // Day Distribution
  const dayDistributionData = stats.timeslots?.dayDistribution ? {
    labels: stats.timeslots.dayDistribution.map((d: any) => d.day),
    datasets: [{
      label: 'Sections',
      data: stats.timeslots.dayDistribution.map((d: any) => d.sections),
      backgroundColor: 'rgba(139, 92, 246, 0.6)',
      borderColor: 'rgba(139, 92, 246, 1)',
      borderWidth: 1
    }]
  } : null

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.progress?.completionRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.progress?.assigned || 0} of {stats.progress?.total || 0} sections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Room Utilization</CardTitle>
            <DoorOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.rooms?.utilizationRate?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.rooms?.usedRooms || 0} of {stats.rooms?.totalRooms || 0} rooms
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Instructor Workload</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.workload?.avgUtilization?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Student Enrollments</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.enrollments?.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.enrollments?.retentionRate?.toFixed(1) || 0}% retention rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="electives" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="electives">Electives</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Elective Preferences Tab */}
        <TabsContent value="electives" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Top Elective Preferences</CardTitle>
                <CardDescription>
                  Student choice distribution for top 10 electives
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {electivePreferencesData && (
                  <Bar data={electivePreferencesData} options={chartOptions} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Elective Demand Summary</CardTitle>
                <CardDescription>
                  Most requested elective courses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {stats.electives?.slice(0, 10).map((elective: any, index: number) => (
                    <div key={elective.course_code} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-semibold">{elective.course_code}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {elective.course_title}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold">{elective.total_requests}</div>
                        <p className="text-xs text-muted-foreground">requests</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Scheduling Progress</CardTitle>
                <CardDescription>
                  Assignment completion rates by component
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {progressData && (
                  <Line data={progressData} options={lineChartOptions} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Section Status</CardTitle>
                <CardDescription>
                  Draft vs Released sections
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {stats.progress && (
                  <Doughnut
                    data={{
                      labels: ['Draft', 'Released'],
                      datasets: [{
                        data: [stats.progress.draft, stats.progress.released],
                        backgroundColor: [
                          'rgba(245, 158, 11, 0.6)',
                          'rgba(16, 185, 129, 0.6)'
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                      }]
                    }}
                    options={doughnutOptions}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Progress Details */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Instructors Assigned</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.progress?.withInstructor || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.progress?.instructorAssignmentRate?.toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rooms Assigned</span>
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.progress?.withRoom || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.progress?.roomAssignmentRate?.toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Times Set</span>
                    <CheckCircle className="h-4 w-4 text-purple-500" />
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.progress?.withTime || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.progress?.timeAssignmentRate?.toFixed(1)}%
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Fully Assigned</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold">
                    {stats.progress?.assigned || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {stats.progress?.completionRate?.toFixed(1)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Faculty Availability Tab */}
        <TabsContent value="faculty" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Faculty Availability Status</CardTitle>
                <CardDescription>
                  Instructor preference submission status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {facultyAvailabilityData && (
                  <Doughnut data={facultyAvailabilityData} options={doughnutOptions} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Availability Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Total Instructors</p>
                      <p className="text-sm text-muted-foreground">In the system</p>
                    </div>
                    <div className="text-3xl font-bold">{stats.faculty?.totalInstructors || 0}</div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">With Preferences</p>
                      <p className="text-sm text-muted-foreground">Submitted preferred times</p>
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {stats.faculty?.withPreferences || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">With Unavailability</p>
                      <p className="text-sm text-muted-foreground">Specified unavailable times</p>
                    </div>
                    <div className="text-3xl font-bold text-red-600">
                      {stats.faculty?.withUnavailability || 0}
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">Pending</p>
                      <p className="text-sm text-muted-foreground">No preferences submitted</p>
                    </div>
                    <div className="text-3xl font-bold text-yellow-600">
                      {stats.faculty?.withoutPreferences || 0}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rooms Tab */}
        <TabsContent value="rooms" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Room Type Distribution</CardTitle>
                <CardDescription>
                  Lecture vs Lab rooms
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {roomUtilizationData && (
                  <Doughnut data={roomUtilizationData} options={doughnutOptions} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Room Utilization</CardTitle>
                <CardDescription>
                  Most frequently used rooms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {stats.rooms?.roomUsageDetails?.map((room: any, index: number) => (
                    <div key={room.room} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <span className="font-semibold">{room.room}</span>
                      </div>
                      <Badge>{room.sections} sections</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Used Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {stats.rooms?.usedRooms || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unused Rooms</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.rooms?.unusedRooms || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.rooms?.utilizationRate?.toFixed(1) || 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Workload Tab */}
        <TabsContent value="workload" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Workload Distribution</CardTitle>
                <CardDescription>
                  Instructor capacity status
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {workloadDistributionData && (
                  <Bar data={workloadDistributionData} options={chartOptions} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Instructors by Workload</CardTitle>
                <CardDescription>
                  Highest credit hour assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {stats.workload?.instructors?.slice(0, 10).map((instructor: any, index: number) => (
                    <div key={instructor.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">#{index + 1}</Badge>
                          <span className="font-semibold">{instructor.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {instructor.sections} sections • {instructor.credits} credits
                        </p>
                      </div>
                      <Badge
                        variant={
                          instructor.status === 'overloaded' ? 'destructive' :
                          instructor.status === 'near-capacity' ? 'default' :
                          instructor.status === 'balanced' ? 'secondary' : 'outline'
                        }
                      >
                        {instructor.utilizationRate.toFixed(0)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Timeline Tab */}
        <TabsContent value="timeline" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Time Slot Distribution</CardTitle>
                <CardDescription>
                  Sections by start time
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {timeSlotData && (
                  <Bar data={timeSlotData} options={chartOptions} />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Day Distribution</CardTitle>
                <CardDescription>
                  Sections scheduled per day
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {dayDistributionData && (
                  <Bar data={dayDistributionData} options={chartOptions} />
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Schedule Coverage</CardTitle>
              <CardDescription>
                Total sections scheduled with times
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-6xl font-bold text-blue-600">
                  {stats.timeslots?.totalScheduledSections || 0}
                </div>
                <p className="text-muted-foreground mt-2">
                  Sections with assigned time slots
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

