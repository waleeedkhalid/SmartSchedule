"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import TimePickerLite from "@/components/ui/time-picker-lite";
import { Calendar, Clock, Pencil, Trash2 } from "lucide-react";

export type ExamType = "midterm" | "midterm2" | "final";

export interface ExamRecord {
  id: string;
  courseCode: string;
  courseName: string;
  type: ExamType;
  date: string;
  time: string;
  duration: number;
  room?: string;
  sectionIds: string[];
}

interface ExamTableProps {
  exams: ExamRecord[];
  sectionsLookup: Array<{ sectionId: string; courseCode: string }>;
  onCreate?: (exam: Omit<ExamRecord, "id">) => void;
  onUpdate?: (id: string, exam: Omit<ExamRecord, "id">) => void;
  onDelete?: (id: string) => void;
}

type ExamDraft = Omit<ExamRecord, "id">;

const DEFAULT_DRAFT: ExamDraft = {
  courseCode: "",
  courseName: "",
  type: "midterm",
  date: "",
  time: "",
  duration: 90,
  room: "",
  sectionIds: [],
};

export const ExamTable: React.FC<ExamTableProps> = ({
  exams,
  sectionsLookup,
  onCreate,
  onUpdate,
  onDelete,
}) => {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ExamDraft>(DEFAULT_DRAFT);

  // Debug log to see draft state
  console.log("Current draft state:", draft);

  // Get unique courses from sectionsLookup for dropdown
  const availableCourses = useMemo(() => {
    const uniqueCourses = new Map<string, string>();

    // Add courses from sections lookup
    sectionsLookup.forEach((section) => {
      if (!uniqueCourses.has(section.courseCode)) {
        // Try to get course name from existing exams
        const existingExam = exams.find(
          (e) => e.courseCode === section.courseCode
        );
        uniqueCourses.set(
          section.courseCode,
          existingExam?.courseName || section.courseCode
        );
      }
    });

    // Add courses from existing exams (in case some don't have sections yet)
    exams.forEach((exam) => {
      if (!uniqueCourses.has(exam.courseCode)) {
        uniqueCourses.set(exam.courseCode, exam.courseName);
      }
    });

    return Array.from(uniqueCourses.entries())
      .map(([code, name]) => ({ code, name }))
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [exams, sectionsLookup]);

  const sectionIdsForCourse = useMemo(() => {
    if (!draft.courseCode) return [] as string[];
    return sectionsLookup
      .filter((section) => section.courseCode === draft.courseCode)
      .map((section) => section.sectionId);
  }, [draft.courseCode, sectionsLookup]);

  const courseNameFromExisting = useMemo(() => {
    if (!draft.courseCode) return "";
    const existingExam = exams.find(
      (exam) => exam.courseCode.toLowerCase() === draft.courseCode.toLowerCase()
    );
    return existingExam?.courseName ?? "";
  }, [draft.courseCode, exams]);

  const formatDate = (date: string) => {
    if (!date) return "—";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "—";
    const [hours, minutes] = time.split(":");
    const hour = Number.parseInt(hours ?? "", 10);
    if (Number.isNaN(hour) || !minutes) return time;
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const reset = () => {
    setEditingId(null);
    setDraft(DEFAULT_DRAFT);
  };

  // Optional manual time entry fallback (some users had trouble with picker)
  const [manualTimeEntry, setManualTimeEntry] = useState(false);

  // Derived validation state
  const validation = useMemo(() => {
    const timeValid = !!draft.time && /^(\d{2}):(\d{2})$/.test(draft.time);
    return {
      courseCode: !!draft.courseCode,
      date: !!draft.date,
      time: timeValid,
    };
  }, [draft.courseCode, draft.date, draft.time]);

  const missingFields = useMemo(
    () =>
      Object.entries(validation)
        .filter(([, ok]) => !ok)
        .map(([k]) =>
          k === "courseCode"
            ? "Course"
            : k === "date"
            ? "Date"
            : k === "time"
            ? "Time"
            : k
        ),
    [validation]
  );

  const isDisabled = missingFields.length > 0;

  const handleEdit = (exam: ExamRecord) => {
    setEditingId(exam.id);
    setDraft({
      courseCode: exam.courseCode,
      courseName: exam.courseName,
      type: exam.type,
      date: exam.date,
      time: exam.time,
      duration: exam.duration,
      room: exam.room ?? "",
      sectionIds: exam.sectionIds,
    });
    setOpen(true);
  };

  const handleDelete = (id: string, courseCode: string) => {
    if (!onDelete) return;
    if (confirm(`Delete exam for ${courseCode}?`)) {
      onDelete(id);
      console.log("Deleting exam:", id);
    }
  };

  const handleSubmit = () => {
    if (!draft.courseCode || !draft.date || !draft.time) return;

    const payload: ExamDraft = {
      ...draft,
      courseName:
        draft.courseName || courseNameFromExisting || draft.courseCode,
      sectionIds:
        sectionIdsForCourse.length > 0 ? sectionIdsForCourse : draft.sectionIds,
    };

    if (editingId) {
      onUpdate?.(editingId, payload);
      console.log("Updating exam:", editingId, payload);
    } else {
      onCreate?.(payload);
      console.log("Creating exam:", payload);
    }

    reset();
    setOpen(false);
  };

  const examTypeLabel: Record<ExamType, string> = {
    midterm: "Midterm",
    midterm2: "Midterm 2",
    final: "Final",
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg">Exam Schedule</CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage midterm and final exam assignments
            </p>
          </div>
          <Dialog
            open={open}
            onOpenChange={(value) => (value ? setOpen(true) : setOpen(false))}
          >
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
                      Course Code <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={draft.courseCode}
                      onValueChange={(value) => {
                        const course = availableCourses.find(
                          (c) => c.code === value
                        );
                        setDraft((prev) => ({
                          ...prev,
                          courseCode: value,
                          courseName: course?.name || "",
                          sectionIds: sectionsLookup
                            .filter((section) => section.courseCode === value)
                            .map((section) => section.sectionId),
                        }));
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select course" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCourses.length === 0 ? (
                          <div className="p-2 text-sm text-muted-foreground">
                            No courses available
                          </div>
                        ) : (
                          availableCourses.map((course) => (
                            <SelectItem key={course.code} value={course.code}>
                              {course.code}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={draft.type}
                      onValueChange={(value: ExamType) =>
                        setDraft((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="midterm">Midterm</SelectItem>
                        <SelectItem value="midterm2">Midterm 2</SelectItem>
                        <SelectItem value="final">Final</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Course Name (optional)
                  </label>
                  <Input
                    value={draft.courseName}
                    onChange={(event) =>
                      setDraft((prev) => ({
                        ...prev,
                        courseName: event.target.value,
                      }))
                    }
                    placeholder={courseNameFromExisting || "Enter course title"}
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={draft.date}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          date: event.target.value,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Time (24h) <span className="text-red-500">*</span>
                    </label>
                    {!manualTimeEntry ? (
                      <div className="flex items-center gap-2">
                        <TimePickerLite
                          value={draft.time}
                          onChange={(time) =>
                            setDraft((prev) => ({
                              ...prev,
                              time,
                            }))
                          }
                          minuteStep={15}
                          use12Hours={false}
                          placeholder="Select time"
                          width={130}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => setManualTimeEntry(true)}
                        >
                          Manual
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={draft.time}
                          onChange={(e) =>
                            setDraft((prev) => ({
                              ...prev,
                              time: e.target.value,
                            }))
                          }
                          className="h-9"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[11px]"
                          onClick={() => setManualTimeEntry(false)}
                        >
                          Picker
                        </Button>
                      </div>
                    )}
                    {!validation.time && (
                      <p className="mt-1 text-[10px] text-red-500">
                        Select or enter a valid time (HH:MM)
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Duration (min)
                    </label>
                    <Input
                      type="number"
                      min={30}
                      step={5}
                      value={draft.duration}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          duration:
                            Number.parseInt(event.target.value, 10) ||
                            DEFAULT_DRAFT.duration,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Room
                    </label>
                    <Input
                      value={draft.room ?? ""}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          room: event.target.value,
                        }))
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
                    onClick={handleSubmit}
                    disabled={isDisabled}
                    aria-disabled={isDisabled}
                  >
                    {editingId ? "Update" : "Create"}
                  </Button>
                </div>
                {isDisabled && (
                  <div className="pt-1">
                    <p className="text-[11px] text-red-600 flex flex-wrap gap-1">
                      Missing:
                      {missingFields.map((f, i) => (
                        <span key={f} className="font-medium">
                          {f}
                          {i < missingFields.length - 1 && ","}
                        </span>
                      ))}
                    </p>
                  </div>
                )}
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
                <TableHead className="w-40">Date</TableHead>
                <TableHead className="w-32">Time</TableHead>
                <TableHead className="w-24">Duration</TableHead>
                <TableHead className="w-32">Room</TableHead>
                <TableHead className="w-24">Actions</TableHead>
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
                      <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {exam.courseName}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className="text-[10px] uppercase"
                    >
                      {examTypeLabel[exam.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(exam.date)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatTime(exam.time)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{exam.duration} min</TableCell>
                  <TableCell className="text-sm">
                    {exam.room ? (
                      exam.room
                    ) : (
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
