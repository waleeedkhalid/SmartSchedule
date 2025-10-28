"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Trash2, Plus, Users } from "lucide-react"
import { IrregularStudentForm } from "./irregular-student-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface IrregularStudentView {
  id: string
  student_id: string
  student_name: string
  student_email: string
  student_level: number | null
  required_course_codes: string[]
  notes: string | null
  created_at: string
  updated_at: string
}

export function IrregularStudentsTable() {
  const [irregularStudents, setIrregularStudents] = useState<IrregularStudentView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editData, setEditData] = useState<IrregularStudentView | null>(null)
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; id: string | null }>({
    open: false,
    id: null,
  })

  useEffect(() => {
    fetchIrregularStudents()
  }, [])

  async function fetchIrregularStudents() {
    setIsLoading(true)
    try {
      const response = await fetch("/api/registrar/irregular-students")
      if (response.ok) {
        const data = await response.json()
        setIrregularStudents(data)
      } else {
        toast.error("Failed to load irregular students")
      }
    } catch (error) {
      console.error("Error fetching irregular students:", error)
      toast.error("Failed to load irregular students")
    } finally {
      setIsLoading(false)
    }
  }

  function handleEdit(student: IrregularStudentView) {
    setEditData(student)
    setFormOpen(true)
  }

  function handleCloseForm() {
    setFormOpen(false)
    setEditData(null)
  }

  function handleFormSuccess() {
    fetchIrregularStudents()
  }

  function openDeleteDialog(id: string) {
    setDeleteDialog({ open: true, id })
  }

  function closeDeleteDialog() {
    setDeleteDialog({ open: false, id: null })
  }

  async function handleDelete() {
    if (!deleteDialog.id) return

    try {
      const response = await fetch(`/api/registrar/irregular-students/${deleteDialog.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete")
      }

      toast.success("Irregular student removed successfully")
      fetchIrregularStudents()
    } catch (error) {
      console.error("Error deleting irregular student:", error)
      toast.error("Failed to delete irregular student")
    } finally {
      closeDeleteDialog()
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Irregular Students</CardTitle>
          <CardDescription>Loading...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Irregular Students
              </CardTitle>
              <CardDescription>
                Students with custom required course lists
              </CardDescription>
            </div>
            <Button onClick={() => setFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Irregular Student
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {irregularStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No irregular students yet</p>
              <p className="text-sm mt-2">
                Add students who need custom required course lists
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Required Courses</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {irregularStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{student.student_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {student.student_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {student.student_level ? (
                          <Badge variant="outline">Level {student.student_level}</Badge>
                        ) : (
                          <span className="text-muted-foreground">N/A</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-md">
                          {student.required_course_codes.length > 0 ? (
                            student.required_course_codes.map((code) => (
                              <Badge key={code} variant="secondary" className="text-xs">
                                {code}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              No courses assigned
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        {student.notes ? (
                          <p className="text-sm text-muted-foreground truncate">
                            {student.notes}
                          </p>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(student)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openDeleteDialog(student.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <IrregularStudentForm
        open={formOpen}
        onOpenChange={handleCloseForm}
        onSuccess={handleFormSuccess}
        editData={editData}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialog.open} onOpenChange={closeDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Irregular Student?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the custom course list for this student. They will revert to
              the standard level-based curriculum. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

