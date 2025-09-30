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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2 } from "lucide-react";

export type ExamCategory = "midterm" | "midterm2" | "final";

export interface ExamRecord {
  id: string;
  courseCode: string;
  courseName: string;
  category: ExamCategory;
  date: string;
  time: string;
  duration: number;
  room?: string;
  sectionIds: string[];
}

interface ExamTableProps {
  exams: ExamRecord[];
  onCreate?: (exam: Omit<ExamRecord, "id">) => void;
  onUpdate?: (id: string, exam: Omit<ExamRecord, "id">) => void;
  onDelete?: (id: string) => void;
  sectionsLookup?: { sectionId: string; courseCode: string }[];
}

export const ExamTable: React.FC<ExamTableProps> = ({
  exams,
  onCreate,
  onUpdate,
  onDelete,
  sectionsLookup = [],
}) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Omit<ExamRecord, "id">>({
    courseCode: "",
    courseName: "",
    category: "midterm",
    date: "",
    time: "",
    duration: 90,
    room: "",
    sectionIds: [],
  });

  function reset() {
    setDraft({
      courseCode: "",
      courseName: "",
      category: "midterm",
      date: "",
      time: "",
      duration: 90,
      room: "",
      sectionIds: [],
    });
    setEditingId(null);
  }

  function handleEdit(exam: ExamRecord) {
    setDraft({
      courseCode: exam.courseCode,
      courseName: exam.courseName,
      category: exam.category,
      date: exam.date,
      time: exam.time,
      duration: exam.duration,
      room: exam.room || "",
      sectionIds: exam.sectionIds,
    });
    setEditingId(exam.id);
    setOpen(true);
  }

  function handleDelete(id: string, courseCode: string) {
    if (confirm(`Delete exam for ${courseCode}?`)) {
      onDelete?.(id);
      console.log("Deleting exam:", id);
    }
  }

  function submit() {
    if (!draft.courseCode || !draft.date || !draft.time) return;

    if (editingId) {
      onUpdate?.(editingId, draft);
      console.log("Updating exam:", editingId, draft);
    } else {
      onCreate?.(draft);
      console.log("Creating exam:", draft);
    }

    reset();
    setOpen(false);
  }

  const sectionIdsForCourse = sectionsLookup
    .filter((s) => s.courseCode === draft.courseCode)
    .map((s) => s.sectionId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Exam Schedule</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  reset();
                  setOpen(true);
                }}
              >
                Add Exam
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingId ? "Edit Exam" : "Create Exam"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
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
                      Category
                    </label>
                    <Select
                      value={draft.category}
                      onValueChange={(v: ExamCategory) =>
                        setDraft((d) => ({ ...d, category: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="midterm">Midterm</SelectItem>
                        <SelectItem value="midterm2">Midterm 2</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">
                      Date
                    </label>
                    <Input
                      type="date"
                      value={draft.date}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, date: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Time
                    </label>
                    <Input
                      type="time"
                      value={draft.time}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, time: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Duration (min)
                    </label>
                    <Input
                      type="number"
                      value={draft.duration}
                      onChange={(e) =>
                        setDraft((d) => ({
                          ...d,
                          duration: parseInt(e.target.value) || 90,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Room
                    </label>
                    <Input
                      value={draft.room}
                      onChange={(e) =>
                        setDraft((d) => ({ ...d, room: e.target.value }))
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>
                {sectionIdsForCourse.length > 0 && (
                  <div className="text-[10px] text-muted-foreground bg-muted p-2 rounded">
                    Sections: {sectionIdsForCourse.join(", ")}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      reset();
                      setOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={submit}
                    disabled={!draft.courseCode || !draft.date || !draft.time}
                  >
                    {editingId ? "Update" : "Create"}
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
                <TableHead className="w-32">Course</TableHead>
                <TableHead className="w-24">Type</TableHead>
                <TableHead className="w-28">Date</TableHead>
                <TableHead className="w-20">Time</TableHead>
                <TableHead className="w-24">Duration</TableHead>
                <TableHead>Room</TableHead>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">
                        {exam.courseCode}
                      </div>
                      <div className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {exam.courseName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase"
                    >
                      {exam.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{exam.date}</TableCell>
                  <TableCell className="text-sm">{exam.time}</TableCell>
                  <TableCell className="text-sm">{exam.duration}m</TableCell>
                  <TableCell className="text-sm">
                    {exam.room || (
                      <span className="text-muted-foreground text-xs">TBD</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEdit(exam)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => handleDelete(exam.id, exam.courseCode)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {exams.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-sm text-muted-foreground py-8"
                  >
                    No exams scheduled yet.
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

export default ExamTable;
