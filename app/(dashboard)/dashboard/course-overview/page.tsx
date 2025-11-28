'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { BookOpen, BarChart, AlertTriangle, Search, TrendingUp } from 'lucide-react'
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
  ChartOptions
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

interface CourseStats {
  code: string
  name: string
  level: number
  credits: number
  type: string
  sectionCount: number
  assignedSections: number
  labSections: number
  lectureSections: number
  instructorCount: number
  avgCapacity: number
  completionRate: number
}

interface CourseDistribution {
  type: string
  count: number
}

interface SectionUtilization {
  total: number
  assigned: number
  unassigned: number
  draft: number
  released: number
  assignmentRate: number
}

interface TopCourse {
  code: string
  name: string
  level: number
  sectionCount: number
}

export default function CourseOverviewPage() {
  const [stats, setStats] = useState<CourseStats[]>([])
  const [distribution, setDistribution] = useState<CourseDistribution[]>([])
  const [utilization, setUtilization] = useState<SectionUtilization | null>(null)
  const [topCourses, setTopCourses] = useState<TopCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch all data in parallel
        const [statsRes, distRes, utilRes, topRes] = await Promise.all([
          fetch('/api/course-overview?type=statistics'),
          fetch('/api/course-overview?type=distribution'),
          fetch('/api/course-overview?type=utilization'),
          fetch('/api/course-overview?type=top&limit=10')
        ])

        if (!statsRes.ok || !distRes.ok || !utilRes.ok || !topRes.ok) {
          throw new Error('Failed to fetch data')
        }

        const [statsData, distData, utilData, topData] = await Promise.all([
          statsRes.json(),
          distRes.json(),
          utilRes.json(),
          topRes.json()
        ])

        setStats(statsData)
        setDistribution(distData)
        setUtilization(utilData)
        setTopCourses(topData)
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Overview</h1>
          <p className="text-muted-foreground">
            Detailed analytics and statistics for all courses
          </p>
        </div>
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

  // Filter courses by search term
  const filteredStats = stats.filter(
    course =>
      course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate totals
  const totalCourses = stats.length
  const totalSections = stats.reduce((sum, c) => sum + c.sectionCount, 0)
  const totalAssigned = stats.reduce((sum, c) => sum + c.assignedSections, 0)
  const avgCompletion = totalSections > 0 ? (totalAssigned / totalSections) * 100 : 0

  // Prepare chart data
  const completionData = {
    labels: topCourses.map(c => c.code),
    datasets: [
      {
        label: 'Sections',
        data: topCourses.map(c => c.sectionCount),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      }
    ]
  }

  const distributionData = {
    labels: distribution.map(d => d.type),
    datasets: [
      {
        label: 'Courses',
        data: distribution.map(d => d.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.6)',
          'rgba(139, 92, 246, 0.6)',
          'rgba(236, 72, 153, 0.6)',
          'rgba(245, 158, 11, 0.6)',
          'rgba(16, 185, 129, 0.6)'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  }

  const utilizationData = utilization ? {
    labels: ['Assigned', 'Unassigned'],
    datasets: [
      {
        label: 'Sections',
        data: [utilization.assigned, utilization.unassigned],
        backgroundColor: [
          'rgba(16, 185, 129, 0.6)',
          'rgba(239, 68, 68, 0.6)'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  } : null

  // Completion rate by level
  const levelCompletionMap = new Map<number, { total: number; assigned: number }>()
  stats.forEach(course => {
    if (!levelCompletionMap.has(course.level)) {
      levelCompletionMap.set(course.level, { total: 0, assigned: 0 })
    }
    const data = levelCompletionMap.get(course.level)!
    data.total += course.sectionCount
    data.assigned += course.assignedSections
  })

  const levelCompletionData = {
    labels: Array.from(levelCompletionMap.keys()).sort().map(l => `Level ${l}`),
    datasets: [
      {
        label: 'Completion Rate (%)',
        data: Array.from(levelCompletionMap.entries())
          .sort(([a], [b]) => a - b)
          .map(([, data]) => data.total > 0 ? (data.assigned / data.total) * 100 : 0),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

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
        ticks: {
          precision: 0
        }
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

  const doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Course Overview</h1>
        <p className="text-muted-foreground">
          Detailed analytics and statistics for all courses
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {distribution.length} types
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSections}</div>
            <p className="text-xs text-muted-foreground">
              {totalCourses > 0 ? (totalSections / totalCourses).toFixed(1) : 0} avg per course
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCompletion.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalAssigned} of {totalSections} assigned
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {utilization && (
                <>
                  {utilization.draft} / {utilization.released}
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Draft / Released</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="top">Top Courses</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="details">Course Details</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Course Distribution by Type</CardTitle>
                <CardDescription>
                  Breakdown of courses by category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Doughnut data={distributionData} options={doughnutOptions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completion Rate by Level</CardTitle>
                <CardDescription>
                  Percentage of sections fully assigned at each level
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Line data={levelCompletionData} options={lineChartOptions} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="top" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Courses by Section Count</CardTitle>
              <CardDescription>
                Courses with the most sections
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Bar data={completionData} options={chartOptions} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {utilizationData && (
              <Card>
                <CardHeader>
                  <CardTitle>Section Assignment Status</CardTitle>
                  <CardDescription>
                    Overall section assignment distribution
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <Doughnut data={utilizationData} options={doughnutOptions} />
                </CardContent>
              </Card>
            )}

            {utilization && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Utilization</CardTitle>
                  <CardDescription>
                    Breakdown of section states
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Sections</span>
                        <span className="font-medium">{utilization.total}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Assigned</span>
                        <span className="font-medium">{utilization.assigned}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">Unassigned</span>
                        <span className="font-medium">{utilization.unassigned}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-yellow-600">Draft</span>
                        <span className="font-medium">{utilization.draft}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600">Released</span>
                        <span className="font-medium">{utilization.released}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between font-medium">
                        <span>Assignment Rate</span>
                        <span>{utilization.assignmentRate.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Courses</CardTitle>
              <CardDescription>
                Detailed information for each course
              </CardDescription>
              <div className="relative mt-4">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {filteredStats.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No courses found
                  </p>
                ) : (
                  filteredStats.map((course) => (
                    <div
                      key={course.code}
                      className="flex items-center justify-between rounded-lg border p-4 hover:bg-accent transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{course.code}</h4>
                          <Badge variant="outline">Level {course.level}</Badge>
                          <Badge variant="secondary">{course.type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {course.name}
                        </p>
                        <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                          <span>{course.credits} credits</span>
                          <span>•</span>
                          <span>{course.sectionCount} sections</span>
                          <span>•</span>
                          <span>{course.instructorCount} instructors</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge
                          variant={course.completionRate >= 100 ? 'default' : 'destructive'}
                        >
                          {course.completionRate.toFixed(0)}% complete
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {course.assignedSections}/{course.sectionCount} assigned
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

