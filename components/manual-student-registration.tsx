"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserPlus, Trash2, AlertCircle } from "lucide-react"
import { getAuthHeader } from "@/lib/utils/client-auth"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface Student {
  user_id: string
  name: string
  email: string
  level: number | null
  student_number: string | null
}

interface Section {
  id: string
  course_code: string
  section_no: string
  capacity: number
  instructor_id: string | null
  room_code: string | null
  state: string
  course?: {
    code: string
    title: string
    level: number
    credits: number
    is_elective: boolean
  }
  instructor?: {
    id: string
    name: string
  }
}

interface Enrollment {
  id: string
  student_id: string
  section_id: string
  status: string
  enrolled_at: string
  student?: {
    name: string
    email: string
  }
  section?: {
    course_code: string
    section_no: string
    course?: {
      title: string
      credits: number
    }
  }
}

export function ManualStudentRegistration() {
  const [students, setStudents] = useState<Student[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  
  const [selectedStudent, setSelectedStudent] = useState("")
  const [selectedSection, setSelectedSection] = useState("")
  const [sectionSearch, setSectionSearch] = useState("")
  const [studentSearch, setStudentSearch] = useState("")
  
  const [isLoading, setIsLoading] = useState(false)
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false)

  useEffect(() => {
    fetchStudents()
    fetchSections()
  }, [])

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentEnrollments(selectedStudent)
    } else {
      setEnrollments([])
    }
  }, [selectedStudent])

  async function fetchStudents() {
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
      // API returns { data: [...] } format
      const studentsData = result.data || result || []
      setStudents(studentsData)
      
      if (studentsData.length === 0) {
        console.warn("No students found in database")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to load students")
    }
  }

  async function fetchSections() {
    try {
      const authHeader = await getAuthHeader()
      // Fetch sections and enrollments to calculate over-capacity status
      const [sectionsRes, enrollmentsRes] = await Promise.all([
        fetch("/api/v1/sections", {
          headers: authHeader ? { Authorization: authHeader } : {},
        }),
        fetch("/api/registrar/student-enrollments?status=registered", {
          headers: authHeader ? { Authorization: authHeader } : {},
        }),
      ])
      
      if (sectionsRes.ok && enrollmentsRes.ok) {
        const sectionsData = await sectionsRes.json()
        const enrollmentsData = await enrollmentsRes.json()
        
        // Calculate enrollment counts per section
        const enrollmentCounts = new Map<string, number>()
        enrollmentsData.forEach((e: any) => {
          if (e.section_id) {
            enrollmentCounts.set(e.section_id, (enrollmentCounts.get(e.section_id) || 0) + 1)
          }
        })
        
        // Filter sections to only show those that are 15-50% over capacity
        const eligibleSections = sectionsData.filter((section: any) => {
          const currentEnrollments = enrollmentCounts.get(section.id) || 0
          const capacity = section.capacity || 0
          
          if (capacity === 0) return false
          if (currentEnrollments <= capacity) return false
          
          const overCapacityPercent = ((currentEnrollments - capacity) / capacity) * 100
          return overCapacityPercent >= 15 && overCapacityPercent <= 50
        })
        
        setSections(eligibleSections)
      }
    } catch (error) {
      console.error("Error fetching sections:", error)
    }
  }

  async function fetchStudentEnrollments(studentId: string) {
    setEnrollmentsLoading(true)
    try {
      const authHeader = await getAuthHeader()
      const response = await fetch(
        `/api/registrar/student-enrollments?student_id=${studentId}&status=registered`,
        {
          headers: authHeader ? { Authorization: authHeader } : {},
        }
      )
      if (response.ok) {
        const data = await response.json()
        setEnrollments(data)
      }
    } catch (error) {
      console.error("Error fetching enrollments:", error)
    } finally {
      setEnrollmentsLoading(false)
    }
  }

  async function handleRegister() {
    if (!selectedStudent || !selectedSection) {
      toast.error("Please select both a student and a section")
      return
    }

    setIsLoading(true)

    try {
      const authHeader = await getAuthHeader()
      const response = await fetch("/api/registrar/student-enrollments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authHeader ? { Authorization: authHeader } : {}),
        },
        body: JSON.stringify({
          student_id: selectedStudent,
          section_id: selectedSection,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register student")
      }

      toast.success(
        data.message || "Student registered successfully"
      )

      // Refresh enrollments and sections (sections may change eligibility)
      fetchStudentEnrollments(selectedStudent)
      fetchSections()
      
      // Reset section selection
      setSelectedSection("")
    } catch (error: any) {
      console.error("Error registering student:", error)
      toast.error(error.message || "Failed to register student")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDropEnrollment(enrollmentId: string) {
    try {
      const authHeader = await getAuthHeader()
      const response = await fetch(
        `/api/registrar/student-enrollments?enrollment_id=${enrollmentId}`,
        {
          method: "DELETE",
          headers: authHeader ? { Authorization: authHeader } : {},
        }
      )

      if (!response.ok) {
        throw new Error("Failed to drop enrollment")
      }

      toast.success("Enrollment dropped successfully")
      
      // Refresh enrollments
      if (selectedStudent) {
        fetchStudentEnrollments(selectedStudent)
      }
    } catch (error) {
      console.error("Error dropping enrollment:", error)
      toast.error("Failed to drop enrollment")
    }
  }

  const selectedStudentData = students.find((s) => s.user_id === selectedStudent)
  const selectedSectionData = sections.find((s) => s.id === selectedSection)

  // Filter students by search term (name, email, student number)
  const filteredStudents = students.filter(
    (student) =>
      studentSearch === "" ||
      student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.email.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (student.student_number && student.student_number.includes(studentSearch)) ||
      student.user_id.toLowerCase().includes(studentSearch.toLowerCase())
  )

  // Handle student number search - if exact match found, auto-select
  useEffect(() => {
    if (studentSearch.length === 10 && /^\d{10}$/.test(studentSearch)) {
      const matchedStudent = students.find(
        (s) => s.student_number === studentSearch
      )
      if (matchedStudent) {
        setSelectedStudent(matchedStudent.user_id)
        setStudentSearch("") // Clear search after selection
      }
    }
  }, [studentSearch, students])

  const filteredSections = sections.filter(
    (section) =>
      sectionSearch === "" ||
      section.course_code.toLowerCase().includes(sectionSearch.toLowerCase()) ||
      section.course?.title.toLowerCase().includes(sectionSearch.toLowerCase()) ||
      section.section_no.toLowerCase().includes(sectionSearch.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Registration Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Manual Student Registration
          </CardTitle>
          <CardDescription>
            Register students in sections with optional validation bypass
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Student Selection with Search */}
          <div className="space-y-2">
            <Label>Student (Search by name, email, or student number)</Label>
            <Input
              placeholder="Type student number (10 digits) or search by name/email..."
              value={studentSearch}
              onChange={(e) => {
                setStudentSearch(e.target.value)
                // If typing student number, don't change selected student yet
                if (e.target.value.length !== 10 || !/^\d{10}$/.test(e.target.value)) {
                  setSelectedStudent("")
                }
              }}
              className="mb-2"
            />
            <Select 
              value={selectedStudent} 
              onValueChange={(value) => {
                setSelectedStudent(value)
                setStudentSearch("") // Clear search when selecting from dropdown
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a student from list" />
              </SelectTrigger>
              <SelectContent>
                {filteredStudents.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    {studentSearch ? "No students found" : "No students available"}
                  </div>
                ) : (
                  filteredStudents.slice(0, 50).map((student) => (
                    <SelectItem key={student.user_id} value={student.user_id}>
                      {student.student_number ? `[${student.student_number}] ` : ""}
                      {student.name} ({student.email}) - Level {student.level || "N/A"}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {selectedStudentData && (
              <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
                Selected: {selectedStudentData.student_number ? `Student #${selectedStudentData.student_number} - ` : ""}
                {selectedStudentData.name} ({selectedStudentData.email})
              </div>
            )}
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <Label>Section (15-50% over capacity only)</Label>
            <Input
              placeholder="Search sections..."
              value={sectionSearch}
              onChange={(e) => setSectionSearch(e.target.value)}
              className="mb-2"
            />
            {sections.length === 0 ? (
              <div className="p-4 border rounded-lg bg-muted text-center text-sm text-muted-foreground">
                No sections available for registration. Only sections that are 15-50% over capacity can be registered.
              </div>
            ) : (
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
                disabled={!selectedStudent}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a section" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSections.slice(0, 50).map((section) => {
                    // Fetch enrollment count for this section
                    // Note: We'll need to fetch this separately or include in section data
                    return (
                      <SelectItem key={section.id} value={section.id}>
                        {section.course_code} - {section.section_no} |{" "}
                        {section.course?.title} | {section.instructor?.name || "No instructor"} |
                        Capacity: {section.capacity}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected Section Info */}
          {selectedSectionData && (
            <div className="p-4 border rounded-lg bg-muted space-y-2">
              <div className="font-medium">
                {selectedSectionData.course_code} - Section {selectedSectionData.section_no}
              </div>
              <div className="text-sm">
                {selectedSectionData.course?.title} • {selectedSectionData.course?.credits}{" "}
                credits
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {selectedSectionData.course?.is_elective ? "Elective" : "Required"}
                </Badge>
                <Badge variant="outline">Level {selectedSectionData.course?.level}</Badge>
                <Badge variant={selectedSectionData.state === "released" ? "default" : "secondary"}>
                  {selectedSectionData.state}
                </Badge>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  Over-Capacity Registration
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                  You can only register students in sections that are 15-50% over capacity. 
                  Sections at or below capacity cannot be manually registered.
                </p>
              </div>
            </div>
          </div>

          {/* Register Button */}
          <Button
            onClick={handleRegister}
            disabled={!selectedStudent || !selectedSection || isLoading}
            className="w-full"
          >
            {isLoading ? "Registering..." : "Register Student"}
          </Button>
        </CardContent>
      </Card>

      {/* Current Enrollments */}
      {selectedStudent && (
        <Card>
          <CardHeader>
            <CardTitle>Current Enrollments</CardTitle>
            <CardDescription>
              {selectedStudentData?.name}'s active enrollments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {enrollmentsLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading...</div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No enrollments yet
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Credits</TableHead>
                      <TableHead>Enrolled At</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {enrollments.map((enrollment) => (
                      <TableRow key={enrollment.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {enrollment.section?.course_code}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {enrollment.section?.course?.title}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{enrollment.section?.section_no}</TableCell>
                        <TableCell>{enrollment.section?.course?.credits}</TableCell>
                        <TableCell>
                          {new Date(enrollment.enrolled_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDropEnrollment(enrollment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

