'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BarChart, Users, BookOpen, AlertTriangle } from 'lucide-react'
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
import { Bar, Line, Doughnut } from 'react-chartjs-2'

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

interface LevelStats {
  level: number
  courseCount: number
  sectionCount: number
  instructorCount: number
  conflictCount: number
  averageSectionsPerCourse: number
}

interface InstructorWorkload {
  level: number
  instructors: Array<{
    id: string
    name: string
    credits: number
  }>
}

export default function LevelOverviewPage() {
  const [stats, setStats] = useState<LevelStats[]>([])
  const [workload, setWorkload] = useState<InstructorWorkload[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch statistics
        const statsRes = await fetch('/api/level-overview?type=statistics')
        if (!statsRes.ok) throw new Error('Failed to fetch statistics')
        const statsData = await statsRes.json()
        setStats(statsData)

        // Fetch workload data
        const workloadRes = await fetch('/api/level-overview?type=workload')
        if (!workloadRes.ok) throw new Error('Failed to fetch workload')
        const workloadData = await workloadRes.json()
        setWorkload(workloadData)

        if (statsData.length > 0) {
          setSelectedLevel(statsData[0].level)
        }
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
          <h1 className="text-3xl font-bold tracking-tight">Level Overview</h1>
          <p className="text-muted-foreground">
            Comprehensive statistics and analytics by course level
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

  // Calculate totals
  const totals = stats.reduce(
    (acc, level) => ({
      courses: acc.courses + level.courseCount,
      sections: acc.sections + level.sectionCount,
      instructors: acc.instructors + level.instructorCount,
      conflicts: acc.conflicts + level.conflictCount
    }),
    { courses: 0, sections: 0, instructors: 0, conflicts: 0 }
  )

  // Prepare chart data
  const courseSectionData = {
    labels: stats.map(s => `Level ${s.level}`),
    datasets: [
      {
        label: 'Courses',
        data: stats.map(s => s.courseCount),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1
      },
      {
        label: 'Sections',
        data: stats.map(s => s.sectionCount),
        backgroundColor: 'rgba(139, 92, 246, 0.6)',
        borderColor: 'rgba(139, 92, 246, 1)',
        borderWidth: 1
      }
    ]
  }

  const averageSectionsData = {
    labels: stats.map(s => `Level ${s.level}`),
    datasets: [
      {
        label: 'Average Sections per Course',
        data: stats.map(s => s.averageSectionsPerCourse),
        borderColor: 'rgba(16, 185, 129, 1)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const instructorDistribution = {
    labels: stats.map(s => `Level ${s.level}`),
    datasets: [
      {
        label: 'Instructors Assigned',
        data: stats.map(s => s.instructorCount),
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

  const conflictData = {
    labels: stats.map(s => `Level ${s.level}`),
    datasets: [
      {
        label: 'Conflicts Detected',
        data: stats.map(s => s.conflictCount),
        backgroundColor: stats.map(s => 
          s.conflictCount > 0 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(16, 185, 129, 0.6)'
        ),
        borderColor: stats.map(s => 
          s.conflictCount > 0 ? 'rgba(239, 68, 68, 1)' : 'rgba(16, 185, 129, 1)'
        ),
        borderWidth: 1
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
        ticks: {
          precision: 1
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

  const selectedLevelWorkload = workload.find(w => w.level === selectedLevel)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Level Overview</h1>
        <p className="text-muted-foreground">
          Comprehensive statistics and analytics by course level
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
            <div className="text-2xl font-bold">{totals.courses}</div>
            <p className="text-xs text-muted-foreground">
              Across {stats.length} levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sections</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.sections}</div>
            <p className="text-xs text-muted-foreground">
              {totals.courses > 0 ? (totals.sections / totals.courses).toFixed(1) : 0} avg per course
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Instructors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.instructors}</div>
            <p className="text-xs text-muted-foreground">
              Teaching across levels
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.conflicts}</div>
            <p className="text-xs text-muted-foreground">
              {totals.conflicts === 0 ? 'All clear!' : 'Need attention'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="efficiency">Efficiency</TabsTrigger>
          <TabsTrigger value="workload">Workload</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Courses & Sections by Level</CardTitle>
                <CardDescription>
                  Total number of courses and sections at each level
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Bar data={courseSectionData} options={chartOptions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Instructor Distribution</CardTitle>
                <CardDescription>
                  Number of instructors assigned to each level
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <Doughnut data={instructorDistribution} options={doughnutOptions} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="efficiency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Average Sections per Course</CardTitle>
              <CardDescription>
                Indicates course offering variety and scheduling complexity
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Line data={averageSectionsData} options={lineChartOptions} />
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {stats.map((level) => (
              <Card key={level.level}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Level {level.level}
                    <Badge variant="secondary">
                      {level.averageSectionsPerCourse.toFixed(1)} sections/course
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Courses:</span>
                      <span className="font-medium">{level.courseCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sections:</span>
                      <span className="font-medium">{level.sectionCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Instructors:</span>
                      <span className="font-medium">{level.instructorCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Instructor Workload by Level</CardTitle>
              <CardDescription>
                Select a level to view instructor credit hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                {stats.map((level) => (
                  <button
                    key={level.level}
                    onClick={() => setSelectedLevel(level.level)}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      selectedLevel === level.level
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    }`}
                  >
                    Level {level.level}
                  </button>
                ))}
              </div>

              {selectedLevelWorkload && (
                <div className="space-y-2">
                  {selectedLevelWorkload.instructors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No instructors assigned to Level {selectedLevel} courses yet.
                    </p>
                  ) : (
                    selectedLevelWorkload.instructors.map((instructor) => (
                      <div
                        key={instructor.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <span className="font-medium">{instructor.name}</span>
                        <Badge variant="outline">
                          {instructor.credits} credit hours
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conflicts by Level</CardTitle>
              <CardDescription>
                Scheduling conflicts detected at each level
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <Bar data={conflictData} options={chartOptions} />
            </CardContent>
          </Card>

          {totals.conflicts > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {totals.conflicts} conflict{totals.conflicts > 1 ? 's' : ''} detected.
                Review the sections table to identify and resolve scheduling issues.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

