"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";

type StudentCount = {
  code: string;
  name: string;
  level: number;
  total_students: number;
};

interface StudentCountsTableProps {
  studentCounts: StudentCount[];
  onCreate?: (data: StudentCount) => void;
  onUpdate?: (code: string, data: Partial<StudentCount>) => void;
  onDelete?: (code: string) => void;
}

const DEFAULT_DRAFT: StudentCount = {
  code: "",
  name: "",
  level: 4,
  total_students: 0,
};

export function StudentCountsTable({
  studentCounts,
  onCreate,
  onUpdate,
  onDelete,
}: StudentCountsTableProps) {
  const [open, setOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<string | null>(null);
  const [draft, setDraft] = useState<StudentCount>(DEFAULT_DRAFT);

  // Debug log
  console.log("Current student count draft:", draft);

  const reset = () => {
    setEditingCode(null);
    setDraft(DEFAULT_DRAFT);
  };

  const handleEdit = (sc: StudentCount) => {
    setEditingCode(sc.code);
    setDraft({ ...sc });
    setOpen(true);
  };

  const handleDelete = (code: string) => {
    if (!onDelete) return;
    if (confirm(`Delete student count for ${code}?`)) {
      onDelete(code);
      console.log("❌ Deleting student count:", code);
    }
  };

  const handleSubmit = () => {
    if (
      !draft.code ||
      !draft.name ||
      draft.level < 1 ||
      draft.total_students < 0
    ) {
      alert("Please fill in all required fields with valid values");
      return;
    }

    if (editingCode) {
      // Update existing
      if (onUpdate) {
        onUpdate(editingCode, draft);
        console.log("✅ Updated student count:", draft);
      }
    } else {
      // Create new
      if (onCreate) {
        onCreate(draft);
        console.log("✅ Created student count:", draft);
      }
    }

    reset();
    setOpen(false);
  };

  // Intelligent section planner
  // - Ideal size: 25
  // - Allow up to 27 (overflow tolerance)
  // - Avoid small sections: minimum 18
  const IDEAL_SIZE = 25;
  const MAX_SIZE = 27;
  const MIN_SIZE = 18;

  const computeSectionPlan = (total: number) => {
    if (total <= 0) {
      return { count: 0, sizes: [] as number[] };
    }

    const minSections = Math.ceil(total / MAX_SIZE);
    const maxSections = Math.max(1, Math.floor(total / MIN_SIZE));

    let bestSections = Math.max(1, Math.round(total / IDEAL_SIZE));
    let bestDistance = Math.abs(total / bestSections - IDEAL_SIZE);

    for (let s = minSections; s <= Math.max(minSections, maxSections); s++) {
      const avg = total / s;
      if (avg >= MIN_SIZE && avg <= MAX_SIZE) {
        const distance = Math.abs(avg - IDEAL_SIZE);
        if (distance <= bestDistance) {
          bestDistance = distance;
          bestSections = s;
        }
      }
    }

    // Compute size distribution (balanced: some base, some base+1)
    const base = Math.floor(total / bestSections);
    let extra = total % bestSections; // number of sections that get +1
    const sizes: number[] = Array.from({ length: bestSections }, () => base);
    for (let i = 0; i < sizes.length && extra > 0; i++, extra--) {
      sizes[i] = sizes[i] + 1;
    }

    // If any size is below MIN_SIZE, reduce sections and recompute once
    if (sizes.length > 1 && sizes[sizes.length - 1] < MIN_SIZE) {
      const s = Math.max(1, bestSections - 1);
      const newBase = Math.floor(total / s);
      let newExtra = total % s;
      const newSizes: number[] = Array.from({ length: s }, () => newBase);
      for (let i = 0; i < newSizes.length && newExtra > 0; i++, newExtra--) {
        newSizes[i] = newSizes[i] + 1;
      }
      return { count: s, sizes: newSizes };
    }

    return { count: bestSections, sizes };
  };

  const summary = useMemo(() => {
    const rows = (studentCounts || []).map((course) => {
      const plan = computeSectionPlan(course.total_students);
      return {
        code: course.code,
        name: course.name,
        level: course.level,
        total: course.total_students,
        sections: plan.count,
        sizes: plan.sizes,
      };
    });

    const totals = rows.reduce(
      (acc, r) => {
        acc.students += r.total;
        acc.sections += r.sections;
        return acc;
      },
      { students: 0, sections: 0 }
    );

    return { rows, totals };
  }, [studentCounts]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Student Counts by Course</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                onClick={() => {
                  reset();
                  setOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Student Count
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingCode ? "Edit Student Count" : "Add Student Count"}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Course Code <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={draft.code}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        code: e.target.value.toUpperCase(),
                      }))
                    }
                    placeholder="e.g., SWE211"
                    disabled={!!editingCode}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">
                    Course Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={draft.name}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g., Introduction to Software Engineering"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Level <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={draft.level}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          level: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium mb-1">
                      Total Students <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={draft.total_students}
                      onChange={(e) =>
                        setDraft((prev) => ({
                          ...prev,
                          total_students: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
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
                    disabled={
                      !draft.code ||
                      !draft.name ||
                      draft.level < 1 ||
                      draft.total_students < 0
                    }
                  >
                    {editingCode ? "Update" : "Create"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Level</TableHead>
                <TableHead className="text-right">Students</TableHead>
                <TableHead className="text-right">
                  Recommended Sections
                </TableHead>
                <TableHead className="text-right">Section Size Plan</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.rows.map((course) => {
                const sizeGroups = course.sizes
                  .sort((a, b) => b - a)
                  .reduce<Record<number, number>>((acc, size) => {
                    acc[size] = (acc[size] || 0) + 1;
                    return acc;
                  }, {});
                const planLabel = Object.entries(sizeGroups)
                  .sort((a, b) => Number(b[0]) - Number(a[0]))
                  .map(([size, count]) => `${count}×${size}`)
                  .join(", ");

                // Find original student count data for this course
                const originalData = studentCounts.find(
                  (sc) => sc.code === course.code
                );

                return (
                  <TableRow key={course.code}>
                    <TableCell className="font-medium">{course.code}</TableCell>
                    <TableCell>{course.name}</TableCell>
                    <TableCell>Level {course.level}</TableCell>
                    <TableCell className="text-right">{course.total}</TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{course.sections}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="font-medium">{planLabel || "-"}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            originalData && handleEdit(originalData)
                          }
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(course.code)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              <TableRow className="bg-muted/50">
                <TableCell colSpan={3} className="font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-medium">
                  {summary.totals.students}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {summary.totals.sections}
                </TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
