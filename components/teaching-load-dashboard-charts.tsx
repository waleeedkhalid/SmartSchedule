'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import {
  BarChart3,
  Users,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
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
  Filler
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
  Legend,
  Filler
)

interface InstructorLoadData {
  user_id: string
  name: string
  max_load_per_week: number
  current_sections: number
  current_hours: number
  utilization_percent: number
  status: 'overloaded' | 'near-capacity' | 'balanced' | 'underutilized'
}

interface TeachingLoadStats {
  instructors: InstructorLoadData[]
  totalInstructors: number
  overloaded: number
  nearCapacity: number
  balanced: number
  underutilized: number
  avgUtilization: number
}

export function TeachingLoadDashboardCharts() {
  const [stats, setStats] = useState<TeachingLoadStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/v1/teaching-load/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch teaching load statistics')
        }

        const result = await response.json()
        setStats(result.data)
      } catch (err) {
        console.error('Error fetching teaching load stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load statistics')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-96 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{error || 'No data available'}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare chart data
  const instructorLoadData = {
    labels: stats.instructors.map(i => i.name),
    datasets: [
      {
        label: 'Current Load (sections)',
        data: stats.instructors.map(i => i.current_sections),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 2,
        borderRadius: 8,
      },
      {
        label: 'Max Capacity',
        data: stats.instructors.map(i => i.max_load_per_week),
        backgroundColor: 'rgba(239, 68, 68, 0.3)',
        borderColor: 'rgb(239, 68, 68)',
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const capacityStatusData = {
    labels: ['Overloaded', 'Near Capacity', 'Balanced', 'Underutilized'],
    datasets: [{
      data: [
        stats.overloaded,
        stats.nearCapacity,
        stats.balanced,
        stats.underutilized
      ],
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
  }

  const utilizationLineData = {
    labels: stats.instructors.map(i => i.name),
    datasets: [{
      label: 'Utilization %',
      data: stats.instructors.map(i => i.utilization_percent),
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
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  }

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 120,
        ticks: {
          callback: function(value: string | number) {
            return value + '%'
          },
        },
      },
    },
  }

  return (
    <Tabs defaultValue="load" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="load">
          <BarChart3 className="mr-2 h-4 w-4" />
          Instructor Load
        </TabsTrigger>
        <TabsTrigger value="capacity">
          <Users className="mr-2 h-4 w-4" />
          Capacity Status
        </TabsTrigger>
        <TabsTrigger value="utilization">
          <TrendingUp className="mr-2 h-4 w-4" />
          Utilization
        </TabsTrigger>
      </TabsList>

      {/* Instructor Load Tab */}
      <TabsContent value="load">
        <Card className="border shadow-sm">
          <CardHeader className="pb-8">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Instructor Teaching Load Distribution
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
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.overloaded}</p>
                <p className="text-xs text-muted-foreground mt-1">&gt;100% capacity</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-sm font-semibold text-gray-700">Near Capacity</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.nearCapacity}</p>
                <p className="text-xs text-muted-foreground mt-1">80-100% capacity</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-gray-700">Balanced</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.balanced}</p>
                <p className="text-xs text-muted-foreground mt-1">60-80% capacity</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-semibold text-gray-700">Underutilized</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">{stats.underutilized}</p>
                <p className="text-xs text-muted-foreground mt-1">&lt;60% capacity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Capacity Status Tab */}
      <TabsContent value="capacity">
        <Card className="border shadow-sm">
          <CardHeader className="pb-8">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Users className="h-6 w-6 text-purple-600" />
              Capacity Distribution
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Distribution of instructors across capacity levels
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
              <Doughnut data={capacityStatusData} options={doughnutOptions} />
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-semibold text-gray-700">Total Instructors</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalInstructors}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border">
                <p className="text-sm font-semibold text-gray-700">Average Utilization</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.avgUtilization.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Utilization Tab */}
      <TabsContent value="utilization">
        <Card className="border shadow-sm">
          <CardHeader className="pb-8">
            <CardTitle className="flex items-center gap-2 text-2xl">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              Utilization Trends
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Teaching load utilization percentage per instructor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-8 border border-purple-100">
              <Line data={utilizationLineData} options={lineOptions} />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

