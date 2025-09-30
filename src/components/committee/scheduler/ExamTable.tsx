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
  DialogFooter,
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

export type ExamCategory = "midterm" | "midterm2" | "final"; // per DEC-5

export interface ExamRecord {
  id: string;
  courseCode: string;
  sectionIds: string[]; // which sections share this exam
  category: ExamCategory;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number; // minutes
  room?: string;
  notes?: string;
}

interface ExamTableProps {
  exams: ExamRecord[];
  onCreate?: (e: Omit<ExamRecord, "id">) => void;
  sectionsLookup?: { sectionId: string; courseCode: string }[];
}

export const ExamTable: React.FC<ExamTableProps> = ({
  exams,
  onCreate,
  sectionsLookup = [],
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Omit<ExamRecord, "id">>({
    courseCode: "",
    sectionIds: [],
    category: "midterm",
    date: "",
    time: "",
    duration: 90,
    room: "",
  });

  function reset() {
    setDraft({
      courseCode: "",
      sectionIds: [],
      category: "midterm",
      date: "",
      time: "",
      duration: 90,
      room: "",
    });
  }

  function submit() {
    if (!draft.courseCode || !draft.date || !draft.time) return;
    onCreate?.(draft);
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
          <CardTitle>Exams</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">New Exam</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Exam</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
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
                <div className="grid grid-cols-2 gap-3">
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
                          duration: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
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
                <div>
                  <label className="block text-xs font-medium mb-1">Room</label>
                  <Input
                    value={draft.room}
                    onChange={(e) =>
                      setDraft((d) => ({ ...d, room: e.target.value }))
                    }
                    placeholder="Room"
                  />
                </div>
                {sectionIdsForCourse.length > 0 && (
                  <div className="text-[10px] text-muted-foreground">
                    Sections detected: {sectionIdsForCourse.join(", ")}
                  </div>
                )}
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      reset();
                      setOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={submit}
                    disabled={!draft.courseCode || !draft.date || !draft.time}
                  >
                    Create
                  </Button>
                </div>
              </div>
              <DialogFooter />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Room</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.courseCode}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase"
                    >
                      {e.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{e.date}</TableCell>
                  <TableCell>{e.time}</TableCell>
                  <TableCell>{e.duration}m</TableCell>
                  <TableCell>
                    {e.room || (
                      <span className="text-muted-foreground text-xs">TBD</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {exams.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-sm text-muted-foreground"
                  >
                    No exams defined.
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
