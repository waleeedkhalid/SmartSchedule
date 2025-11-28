"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, BookOpen, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface RegistrarStats {
  totalStudents: number
  totalEnrollments: number
  activeEnrollments: number
  overCapacitySections: number
}

export function RegistrarStats() {
  const [stats, setStats] = useState<RegistrarStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch all data in parallel
        const [studentsRes, enrollmentsRes, sectionsRes] = await Promise.all([
          fetch("/api/registrar/students"),
          fetch("/api/registrar/student-enrollments?status=registered"),
          fetch("/api/v1/sections"),
        ])

        // Extract data from API responses (they're wrapped in { data: ... })
        const studentsData = studentsRes.ok ? await studentsRes.json() : null
        const enrollmentsData = enrollmentsRes.ok ? await enrollmentsRes.json() : null
        const sectionsData = sectionsRes.ok ? await sectionsRes.json() : null

        const students = Array.isArray(studentsData?.data) ? studentsData.data : []
        const enrollments = Array.isArray(enrollmentsData?.data) ? enrollmentsData.data : []
        let sections = Array.isArray(sectionsData?.data) ? sectionsData.data : []

        // Ensure sections is an array (fallback)
        if (!Array.isArray(sections)) {
          console.error("Sections is not an array:", sections)
          sections = []
        }

        // Count sections that are 15-50% over capacity
        interface SectionWithCode {
          course_code?: string;
          section_no?: string;
          capacity?: number;
        }
        interface EnrollmentWithSection {
          section?: {
            course_code?: string;
            section_no?: string;
          };
        }
        const overCapacitySections = sections.filter((section: SectionWithCode) => {
          const sectionEnrollments = enrollments.filter(
            (e: EnrollmentWithSection) => e.section?.course_code === section.course_code &&
              e.section?.section_no === section.section_no
          ).length
          const capacity = section.capacity || 0
          if (sectionEnrollments <= capacity) return false
          const overCapacityPercent = ((sectionEnrollments - capacity) / capacity) * 100
          return overCapacityPercent >= 15 && overCapacityPercent <= 50
        }).length

        setStats({
          totalStudents: students.length,
          totalEnrollments: enrollments.length,
          activeEnrollments: enrollments.length, // Already filtered by status=registered
          overCapacitySections,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-1" />
              <Skeleton className="h-3 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      title: "Total Students",
      value: stats.totalStudents,
      description: "All registered students",
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Active Enrollments",
      value: stats.activeEnrollments,
      description: "Currently registered",
      icon: BookOpen,
      color: "text-purple-600",
    },
    {
      title: "Over-Capacity Sections",
      value: stats.overCapacitySections,
      description: "15-50% over capacity",
      icon: AlertCircle,
      color: "text-amber-600",
    },
    {
      title: "Total Enrollments",
      value: stats.totalEnrollments,
      description: "All enrollments",
      icon: UserCheck,
      color: "text-green-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

