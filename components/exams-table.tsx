"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Exam } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useIsClient } from "@/hooks/use-mounted";

// Lazy load heavy table components
const Table = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.Table),
  { ssr: false }
);
const TableBody = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableBody),
  { ssr: false }
);
const TableCell = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableCell),
  { ssr: false }
);
const TableHead = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableHead),
  { ssr: false }
);
const TableHeader = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableHeader),
  { ssr: false }
);
const TableRow = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableRow),
  { ssr: false }
);
const Badge = dynamic(
  () => import("@/components/ui/badge").then((mod) => mod.Badge),
  { ssr: false }
);
const Input = dynamic(
  () => import("@/components/ui/input").then((mod) => mod.Input),
  { ssr: false }
);

interface ExamsTableProps {
  exams: Exam[];
  conflicts?: Record<string, { has_conflicts: boolean }>;
}

export function ExamsTable({ exams, conflicts = {} }: ExamsTableProps) {
  const router = useRouter();
  const isClient = useIsClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Helper to safely format dates only on client
  const formatDate = (dateStr: string | null | undefined): string => {
    if (!isClient || !dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  async function handleDelete(id: string, courseCode: string) {
    if (
      !confirm(`Are you sure you want to delete the exam for ${courseCode}?`)
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/v1/exams/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete exam");
      }

      toast.success(`Exam for ${courseCode} deleted successfully`);
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete exam";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  }

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.course_code?.toLowerCase().includes(searchTerm.toLowerCase()) ??
      false;
    const matchesDate = !dateFilter || exam.date === dateFilter;
    return matchesSearch && matchesDate;
  });

  const sortedExams = [...filteredExams].sort((a, b) => {
    // Sort by date first, then by start time
    // Handle undefined date values
    if (!a.date && !b.date) {
      // Both dates are undefined, sort by start_time
      if (!a.start_time && !b.start_time) return 0;
      if (!a.start_time) return 1;
      if (!b.start_time) return -1;
      return a.start_time.localeCompare(b.start_time);
    }
    if (!a.date) return 1;
    if (!b.date) return -1;
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    // Handle undefined start_time values
    if (!a.start_time && !b.start_time) return 0;
    if (!a.start_time) return 1;
    if (!b.start_time) return -1;
    return a.start_time.localeCompare(b.start_time);
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input
          placeholder="Search by course code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="max-w-xs"
          placeholder="Filter by date"
        />
        {dateFilter && (
          <Button variant="outline" onClick={() => setDateFilter("")} size="sm">
            Clear Date
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Code</TableHead>
              <TableHead>Exam Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Rooms</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedExams.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center text-muted-foreground"
                >
                  {searchTerm || dateFilter
                    ? "No exams match the filters"
                    : "No exams found"}
                </TableCell>
              </TableRow>
            ) : (
              sortedExams.map((exam) => {
                const hasConflict = conflicts[exam.id]?.has_conflicts;
                return (
                  <TableRow key={exam.id}>
                    <TableCell className="font-medium">
                      {exam.course_code}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          exam.exam_type === "final"
                            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                            : exam.exam_type === "mid2"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                              : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        }
                      >
                        {exam.exam_type?.toUpperCase() || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(exam.date) || "N/A"}</TableCell>
                    <TableCell>
                      {exam.start_time
                        ? exam.start_time.substring(0, 5)
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {exam.duration_minutes ?? "N/A"}{" "}
                      {exam.duration_minutes ? "min" : ""}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {exam.room_codes && exam.room_codes.length > 0 ? (
                          exam.room_codes.map((code) => (
                            <Badge
                              key={code}
                              variant="outline"
                              className="text-xs"
                            >
                              {code}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            No rooms
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {hasConflict ? (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Conflicts
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        >
                          No Conflicts
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button asChild variant="ghost" size="sm">
                          <Link href={`/dashboard/exams/${exam.id}/edit`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleDelete(exam.id, exam.course_code)
                          }
                          disabled={deletingId === exam.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <div className="text-sm text-muted-foreground">
        Showing {sortedExams.length} of {exams.length} exams
      </div>
    </div>
  );
}
