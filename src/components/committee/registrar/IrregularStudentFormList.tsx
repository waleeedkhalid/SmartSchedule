"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";
import type { IrregularStudent } from "@/lib/types";

interface IrregularStudentFormListProps {
  irregularStudents: IrregularStudent[];
  onCreate?: (student: IrregularStudent) => void;
  onUpdate?: (id: string, student: IrregularStudent) => void;
  onDelete?: (id: string) => void;
}

export const IrregularStudentFormList: React.FC<
  IrregularStudentFormListProps
> = ({ irregularStudents: initialStudents, onCreate, onUpdate, onDelete }) => {
  const [students, setStudents] = useState<IrregularStudent[]>(initialStudents);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<IrregularStudent>({
    id: "",
    name: "",
    requiredCourses: [],
  });

  function reset() {
    setDraft({
      id: "",
      name: "",
      requiredCourses: [],
    });
    setEditingId(null);
  }

  function handleEdit(student: IrregularStudent) {
    setDraft({
      id: student.id,
      name: student.name,
      requiredCourses: student.requiredCourses,
    });
    setEditingId(student.id);
    setOpen(true);
  }

  function handleDelete(id: string, name: string) {
    if (confirm(`Delete irregular student ${name}?`)) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      onDelete?.(id);
      console.log("Deleting irregular student:", id);
    }
  }

  function submit() {
    if (!draft.id || !draft.name || draft.requiredCourses.length === 0) return;

    if (editingId) {
      // Update existing student
      setStudents((prev) =>
        prev.map((s) =>
          s.id === editingId
            ? {
                id: draft.id,
                name: draft.name,
                requiredCourses: draft.requiredCourses,
              }
            : s
        )
      );
      onUpdate?.(editingId, draft);
      console.log("Updating irregular student:", editingId, draft);
    } else {
      // Add new student
      const newStudent: IrregularStudent = {
        id: draft.id,
        name: draft.name,
        requiredCourses: draft.requiredCourses,
      };
      setStudents((prev) => [...prev, newStudent]);
      onCreate?.(draft);
      console.log("Adding irregular student:", newStudent);
    }

    reset();
    setOpen(false);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Irregular Students</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  reset();
                  setOpen(true);
                }}
              >
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>
                  {editingId
                    ? "Edit Irregular Student"
                    : "Add Irregular Student"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Student ID
                    </label>
                    <Input
                      value={draft.id}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, id: e.target.value }))
                      }
                      placeholder="e.g. 2021001234"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Student Name
                    </label>
                    <Input
                      value={draft.name}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, name: e.target.value }))
                      }
                      placeholder="Full name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Course Code
                    </label>
                    <Input
                      value={draft.requiredCourses.join(", ")}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          requiredCourses: e.target.value
                            .split(",")
                            .map((course) => course.trim()),
                        }))
                      }
                      placeholder="e.g. SWE212, SWE213"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      reset();
                      setOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={submit}
                    disabled={
                      !draft.id ||
                      !draft.name ||
                      draft.requiredCourses.length === 0
                    }
                  >
                    {editingId ? "Update Student" : "Add Student"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Required Courses</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.id}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {student.requiredCourses.join(", ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEdit(student)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(student.id, student.name)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {students.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={3}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    No irregular students recorded.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default IrregularStudentFormList;
