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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// Per DEC-7: add advisorId (faculty id)
export interface IrregularStudentRecord {
  id: string;
  studentId: string; // student ID number
  studentName: string;
  courseCode: string; // course they need
  semester: string;
  year: number;
  reason: string; // "Repeat", "Make-up", etc.
  advisorId?: string; // faculty ID for future advising view
  advisorName?: string; // display name
  notes?: string;
}

interface IrregularStudentFormListProps {
  irregularStudents: IrregularStudentRecord[];
  onCreate?: (student: Omit<IrregularStudentRecord, "id">) => void;
  // onUpdate will be added when inline editing is implemented
}

export const IrregularStudentFormList: React.FC<
  IrregularStudentFormListProps
> = ({ irregularStudents, onCreate }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Omit<IrregularStudentRecord, "id">>({
    studentId: "",
    studentName: "",
    courseCode: "",
    semester: "Fall",
    year: 2025,
    reason: "",
    advisorId: "",
    advisorName: "",
    notes: "",
  });

  function reset() {
    setDraft({
      studentId: "",
      studentName: "",
      courseCode: "",
      semester: "Fall",
      year: 2025,
      reason: "",
      advisorId: "",
      advisorName: "",
      notes: "",
    });
  }

  function submit() {
    if (!draft.studentId || !draft.studentName || !draft.courseCode) return;
    onCreate?.(draft);
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
              <Button size="sm">Add Student</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Irregular Student</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Student ID
                    </label>
                    <Input
                      value={draft.studentId}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, studentId: e.target.value }))
                      }
                      placeholder="e.g. 2021001234"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Student Name
                    </label>
                    <Input
                      value={draft.studentName}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, studentName: e.target.value }))
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
                      value={draft.courseCode}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, courseCode: e.target.value }))
                      }
                      placeholder="e.g. CSC212"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Semester
                    </label>
                    <Input
                      value={draft.semester}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, semester: e.target.value }))
                      }
                      placeholder="Fall/Spring"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Year
                    </label>
                    <Input
                      type="number"
                      value={draft.year}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          year: parseInt(e.target.value) || 2025,
                        }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Reason
                  </label>
                  <Input
                    value={draft.reason}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, reason: e.target.value }))
                    }
                    placeholder="e.g. Repeat, Make-up, Transfer Credit"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Advisor ID
                    </label>
                    <Input
                      value={draft.advisorId}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, advisorId: e.target.value }))
                      }
                      placeholder="Faculty ID"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Advisor Name
                    </label>
                    <Input
                      value={draft.advisorName}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, advisorName: e.target.value }))
                      }
                      placeholder="Faculty name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Notes
                  </label>
                  <Textarea
                    value={draft.notes}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, notes: e.target.value }))
                    }
                    placeholder="Additional notes"
                    className="h-20"
                  />
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
                      !draft.studentId ||
                      !draft.studentName ||
                      !draft.courseCode
                    }
                  >
                    Add Student
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
                <TableHead>Course</TableHead>
                <TableHead>Term</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Advisor</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {irregularStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{student.studentName}</div>
                      <div className="text-xs text-muted-foreground">
                        {student.studentId}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {student.courseCode}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs">
                    {student.semester} {student.year}
                  </TableCell>
                  <TableCell className="text-xs">{student.reason}</TableCell>
                  <TableCell>
                    {student.advisorName ? (
                      <div className="text-xs">
                        <div>{student.advisorName}</div>
                        <div className="text-muted-foreground">
                          {student.advisorId}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-32 truncate">
                    {student.notes || "—"}
                  </TableCell>
                </TableRow>
              ))}
              {irregularStudents.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-muted-foreground"
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
