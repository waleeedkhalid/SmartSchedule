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
import { Checkbox } from "@/components/ui/checkbox"
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
  const [bypassValidation, setBypassValidation] = useState(false)
  const [sectionSearch, setSectionSearch] = useState("")
  
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
      const response = await fetch("/api/registrar/students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  async function fetchSections() {
    try {
      const response = await fetch("/api/sections")
      if (response.ok) {
        const data = await response.json()
        setSections(data)
      }
    } catch (error) {
      console.error("Error fetching sections:", error)
    }
  }

  async function fetchStudentEnrollments(studentId: string) {
    setEnrollmentsLoading(true)
    try {
      const response = await fetch(
        `/api/registrar/student-enrollments?student_id=${studentId}&status=registered`
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
      const response = await fetch("/api/registrar/student-enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudent,
          section_id: selectedSection,
          bypass_validation: bypassValidation,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register student")
      }

      toast.success(
        data.message || "Student registered successfully"
      )

      // Refresh enrollments
      fetchStudentEnrollments(selectedStudent)
      
      // Reset section selection
      setSelectedSection("")
      setBypassValidation(false)
    } catch (error: any) {
      console.error("Error registering student:", error)
      toast.error(error.message || "Failed to register student")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDropEnrollment(enrollmentId: string) {
    try {
      const response = await fetch(
        `/api/registrar/student-enrollments?enrollment_id=${enrollmentId}`,
        {
          method: "DELETE",
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
          {/* Student Selection */}
          <div className="space-y-2">
            <Label>Student</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger>
                <SelectValue placeholder="Select a student" />
              </SelectTrigger>
              <SelectContent>
                {students.map((student) => (
                  <SelectItem key={student.user_id} value={student.user_id}>
                    {student.name} ({student.email}) - Level {student.level || "N/A"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <Label>Section</Label>
            <Input
              placeholder="Search sections..."
              value={sectionSearch}
              onChange={(e) => setSectionSearch(e.target.value)}
              className="mb-2"
            />
            <Select
              value={selectedSection}
              onValueChange={setSelectedSection}
              disabled={!selectedStudent}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                {filteredSections.slice(0, 50).map((section) => (
                  <SelectItem key={section.id} value={section.id}>
                    {section.course_code} - {section.section_no} |{" "}
                    {section.course?.title} | {section.instructor?.name || "No instructor"} |
                    Capacity: {section.capacity}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          {/* Bypass Validation */}
          <div className="flex items-center space-x-2 p-4 border rounded-lg bg-amber-50 dark:bg-amber-950/20">
            <Checkbox
              id="bypass"
              checked={bypassValidation}
              onCheckedChange={(checked) => setBypassValidation(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <label
                htmlFor="bypass"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <AlertCircle className="h-4 w-4 text-amber-600" />
                Bypass validation (capacity, credit limits)
              </label>
              <p className="text-xs text-muted-foreground">
                Use for special cases like overrides and exceptions
              </p>
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

