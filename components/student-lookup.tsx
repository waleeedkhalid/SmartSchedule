"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, User, GraduationCap, BookOpen, CreditCard, AlertCircle } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { getAuthHeader } from "@/lib/utils/client-auth"

interface StudentView {
  user_id: string
  name: string
  email: string
  level: number | null
  department: string | null
  student_number: string | null
}

interface StudentAcademicProgress {
  user_id: string
  name: string
  email: string
  level: number | null
  department: string | null
  total_credits: number
  required_credits: number
  elective_credits: number
  total_enrollments: number
  active_enrollments: number
  dropped_enrollments: number
  enrolled_courses: Array<{
    course_code: string
    course_title: string
    credits: number
    is_elective: boolean
    section_no: string
    enrolled_at: string
  }>
}

export function StudentLookup() {
  const [students, setStudents] = useState<StudentView[]>([])
  const [filteredStudents, setFilteredStudents] = useState<StudentView[]>([])
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null)
  const [studentProgress, setStudentProgress] = useState<StudentAcademicProgress | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingProgress, setIsLoadingProgress] = useState(false)

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredStudents(students)
    } else {
      const term = searchTerm.toLowerCase()
      const filtered = students.filter(
        (student) =>
          student.name.toLowerCase().includes(term) ||
          student.email.toLowerCase().includes(term) ||
          student.user_id.toLowerCase().includes(term) ||
          (student.student_number && student.student_number.includes(term)) ||
          (student.level !== null && student.level.toString().includes(term))
      )
      setFilteredStudents(filtered)
    }
  }, [searchTerm, students])

  async function fetchStudents() {
    setIsLoading(true)
    try {
      const authHeader = await getAuthHeader()
      const response = await fetch("/api/registrar/students", {
        headers: authHeader ? { Authorization: authHeader } : {},
      })
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: "Unknown error" }))
        console.error("Error fetching students:", error)
        toast.error(error.error || "Failed to load students")
        return
      }
      
      const result = await response.json()
      const studentsData = result.data || []
      setStudents(studentsData)
      setFilteredStudents(studentsData)
      
      if (studentsData.length === 0) {
        console.warn("No students found - check RLS policies and database")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to load students")
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchStudentProgress(studentId: string) {
    setIsLoadingProgress(true)
    try {
      const authHeader = await getAuthHeader()
      const response = await fetch(`/api/registrar/students/${studentId}`, {
        headers: authHeader ? { Authorization: authHeader } : {},
      })
      if (response.ok) {
        const result = await response.json()
        setStudentProgress(result.data)
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to load student progress")
        setStudentProgress(null)
      }
    } catch (error) {
      console.error("Error fetching student progress:", error)
      toast.error("Failed to load student progress")
      setStudentProgress(null)
    } finally {
      setIsLoadingProgress(false)
    }
  }

  function handleStudentSelect(studentId: string) {
    setSelectedStudent(studentId)
    fetchStudentProgress(studentId)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Student Lookup</CardTitle>
          <CardDescription>Loading students...</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full mb-4" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Student List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Student Lookup
          </CardTitle>
          <CardDescription>
            Search and select a student to view academic progress
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, email, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Student List */}
          <div className="border rounded-lg max-h-[600px] overflow-y-auto">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No students found</p>
                {searchTerm && (
                  <p className="text-sm mt-2">Try a different search term</p>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow
                      key={student.user_id}
                      className={selectedStudent === student.user_id ? "bg-muted" : ""}
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {student.student_number && (
                              <span className="text-muted-foreground mr-2">
                                [{student.student_number}]
                              </span>
                            )}
                            {student.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {student.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.level ? (
                          <Badge variant="outline">Level {student.level}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">N/A</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant={selectedStudent === student.user_id ? "default" : "outline"}
                          onClick={() => handleStudentSelect(student.user_id)}
                        >
                          View Progress
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </CardContent>
      </Card>

      {/* Academic Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Academic Progress
          </CardTitle>
          <CardDescription>
            {selectedStudent
              ? "Detailed academic information for selected student"
              : "Select a student to view their academic progress"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedStudent ? (
            <div className="p-8 text-center text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Select a student to view their academic progress</p>
            </div>
          ) : isLoadingProgress ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : studentProgress ? (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="p-4 border rounded-lg bg-muted">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{studentProgress.name}</h3>
                    <p className="text-sm text-muted-foreground">{studentProgress.email}</p>
                  </div>
                  {studentProgress.level && (
                    <Badge variant="secondary">Level {studentProgress.level}</Badge>
                  )}
                </div>
                {studentProgress.department && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Department: {studentProgress.department}
                  </p>
                )}
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Total Credits</span>
                  </div>
                  <div className="text-2xl font-bold">{studentProgress.total_credits}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Active Enrollments</span>
                  </div>
                  <div className="text-2xl font-bold">{studentProgress.active_enrollments}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium">Required Credits</span>
                  </div>
                  <div className="text-2xl font-bold">{studentProgress.required_credits}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-amber-600" />
                    <span className="text-sm font-medium">Elective Credits</span>
                  </div>
                  <div className="text-2xl font-bold">{studentProgress.elective_credits}</div>
                </div>
              </div>

              {/* Enrolled Courses */}
              {studentProgress.enrolled_courses.length > 0 ? (
                <div>
                  <h4 className="font-semibold mb-3">Enrolled Courses</h4>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Course</TableHead>
                          <TableHead>Section</TableHead>
                          <TableHead>Credits</TableHead>
                          <TableHead>Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {studentProgress.enrolled_courses.map((course, index) => (
                          <TableRow key={`${course.course_code}-${course.section_no}-${index}`}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{course.course_code}</div>
                                <div className="text-sm text-muted-foreground">
                                  {course.course_title}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{course.section_no}</TableCell>
                            <TableCell>{course.credits}</TableCell>
                            <TableCell>
                              <Badge
                                variant={course.is_elective ? "secondary" : "default"}
                              >
                                {course.is_elective ? "Elective" : "Required"}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-lg text-center text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No enrolled courses</p>
                </div>
              )}

              {/* Additional Stats */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Enrollments:</span>
                    <span className="ml-2 font-medium">{studentProgress.total_enrollments}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Dropped:</span>
                    <span className="ml-2 font-medium">{studentProgress.dropped_enrollments}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active:</span>
                    <span className="ml-2 font-medium">{studentProgress.active_enrollments}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Failed to load student progress</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

