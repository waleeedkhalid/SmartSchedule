"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

const formSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  required_course_codes: z.array(z.string()).min(0, "At least one course is required"),
  notes: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

interface IrregularStudentFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  editData?: {
    id: string
    student_id: string
    student_name: string
    required_course_codes: string[]
    notes: string | null
  } | null
}

interface Student {
  user_id: string
  name: string
  email: string
  level: number | null
}

interface Course {
  code: string
  title: string
  level: number
  is_elective: boolean
}

export function IrregularStudentForm({
  open,
  onOpenChange,
  onSuccess,
  editData,
}: IrregularStudentFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourses, setSelectedCourses] = useState<string[]>([])
  const [courseSearch, setCourseSearch] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      student_id: editData?.student_id || "",
      required_course_codes: editData?.required_course_codes || [],
      notes: editData?.notes || "",
    },
  })

  // Load students (regular students only, not irregular)
  useEffect(() => {
    if (open && !editData) {
      fetchStudents()
    }
  }, [open, editData])

  // Load all courses
  useEffect(() => {
    if (open) {
      fetchCourses()
    }
  }, [open])

  // Set initial selected courses when editing
  useEffect(() => {
    if (editData) {
      setSelectedCourses(editData.required_course_codes)
      form.setValue("required_course_codes", editData.required_course_codes)
    }
  }, [editData, form])

  async function fetchStudents() {
    try {
      // This endpoint would need to be created to return only regular students
      const response = await fetch("/api/registrar/regular-students")
      if (response.ok) {
        const data = await response.json()
        setStudents(data)
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  async function fetchCourses() {
    try {
      const response = await fetch("/api/courses")
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error("Error fetching courses:", error)
    }
  }

  function addCourse(courseCode: string) {
    if (!selectedCourses.includes(courseCode)) {
      const updated = [...selectedCourses, courseCode]
      setSelectedCourses(updated)
      form.setValue("required_course_codes", updated)
    }
    setCourseSearch("")
  }

  function removeCourse(courseCode: string) {
    const updated = selectedCourses.filter((c) => c !== courseCode)
    setSelectedCourses(updated)
    form.setValue("required_course_codes", updated)
  }

  async function onSubmit(values: FormData) {
    setIsLoading(true)

    try {
      const url = editData
        ? `/api/registrar/irregular-students/${editData.id}`
        : "/api/registrar/irregular-students"

      const method = editData ? "PATCH" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save irregular student")
      }

      toast.success(
        editData
          ? "Irregular student updated successfully"
          : "Irregular student created successfully"
      )

      form.reset()
      setSelectedCourses([])
      onOpenChange(false)
      onSuccess?.()
    } catch (error: any) {
      console.error("Error saving irregular student:", error)
      toast.error(error.message || "Failed to save irregular student")
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCourses = courses.filter(
    (course) =>
      !selectedCourses.includes(course.code) &&
      (courseSearch === "" ||
        course.code.toLowerCase().includes(courseSearch.toLowerCase()) ||
        course.title.toLowerCase().includes(courseSearch.toLowerCase()))
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Irregular Student" : "Add Irregular Student"}
          </DialogTitle>
          <DialogDescription>
            Define custom required courses for students who don't follow the standard
            level-based curriculum.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Student Selection */}
            {!editData && (
              <FormField
                control={form.control}
                name="student_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Student</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a student" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {students.map((student) => (
                          <SelectItem key={student.user_id} value={student.user_id}>
                            {student.name} ({student.email}) - Level {student.level || "N/A"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select a student to assign custom required courses
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {editData && (
              <div className="p-4 border rounded-lg bg-muted">
                <div className="font-medium">{editData.student_name}</div>
                <div className="text-sm text-muted-foreground">
                  Editing custom curriculum
                </div>
              </div>
            )}

            {/* Course Selection */}
            <FormField
              control={form.control}
              name="required_course_codes"
              render={() => (
                <FormItem>
                  <FormLabel>Required Courses</FormLabel>
                  <FormDescription>
                    Search and select courses that this student must complete
                  </FormDescription>

                  {/* Selected Courses */}
                  {selectedCourses.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-muted">
                      {selectedCourses.map((code) => {
                        const course = courses.find((c) => c.code === code)
                        return (
                          <Badge key={code} variant="secondary" className="gap-1">
                            {code} - {course?.title || "Unknown"}
                            <button
                              type="button"
                              onClick={() => removeCourse(code)}
                              className="ml-1 hover:bg-destructive/20 rounded-sm"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        )
                      })}
                    </div>
                  )}

                  {/* Course Search */}
                  <div className="space-y-2">
                    <Input
                      placeholder="Search courses..."
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      disabled={isLoading}
                    />

                    {courseSearch && filteredCourses.length > 0 && (
                      <div className="max-h-48 overflow-y-auto border rounded-lg">
                        {filteredCourses.slice(0, 10).map((course) => (
                          <button
                            key={course.code}
                            type="button"
                            onClick={() => addCourse(course.code)}
                            className="w-full text-left px-3 py-2 hover:bg-muted transition-colors border-b last:border-0"
                          >
                            <div className="font-medium">
                              {course.code} - {course.title}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Level {course.level} •{" "}
                              {course.is_elective ? "Elective" : "Required"}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="E.g., Transfer student from XYZ University, special program requirements..."
                      {...field}
                      disabled={isLoading}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about why this student has a custom curriculum
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : editData ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

