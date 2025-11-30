"use client";

import { useState, useEffect } from "react";
import type { Database } from "@/lib/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Edit, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSectionDialog } from "@/components/sections-client";
import { getAuthHeader } from "@/lib/utils/client-auth";

type Section = Database["public"]["Tables"]["section"]["Row"] & {
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  };
};

interface SectionsTableProps {
  sections: Section[];
}

interface ConflictSection {
  section_id: string;
  course_code: string;
  section_no: string;
  room_code: string | null;
  instructor_id: string | null;
  group_level: number;
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  };
}

interface ConflictMap {
  [sectionId: string]: {
    has_conflicts: boolean;
    room_conflicts: ConflictSection[];
    instructor_conflicts: ConflictSection[];
  };
}

export function SectionsTable({ sections }: SectionsTableProps) {
  const router = useRouter();
  const { openEditDialog } = useSectionDialog();
  const [conflictMap, setConflictMap] = useState<ConflictMap>({});
  const [isLoadingConflicts, setIsLoadingConflicts] = useState(false);

  // Check conflicts for all sections on mount using batch endpoint
  useEffect(() => {
    async function checkAllConflicts() {
      if (sections.length === 0) return;

      // Only check conflicts for sections with meeting patterns
      const sectionsToCheck = sections.filter(
        (s) => s.meeting_pattern?.days && s.meeting_pattern.days.length > 0
      );

      if (sectionsToCheck.length === 0) return;

      setIsLoadingConflicts(true);

      try {
        // Get auth header once
        const authHeader = await getAuthHeader();

        // If no auth header, skip conflict checking
        if (!authHeader) {
          console.warn("No auth token available, skipping conflict checks");
          return;
        }

        // Use batch endpoint for all sections at once (single API call)
        const response = await fetch("/api/v1/sections/check-conflicts/batch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: authHeader,
          },
          body: JSON.stringify({
            sections: sectionsToCheck.map((section) => ({
              section_id: section.id,
              room_code: section.room_code || null,
              instructor_id: section.instructor_id || null,
              meeting_days: section.meeting_pattern.days,
              meeting_start: section.meeting_pattern.start,
              meeting_duration: section.meeting_pattern.duration,
            })),
          }),
        });

        // Handle auth errors
        if (response.status === 401) {
          // Silently handle auth errors
          return;
        }

        if (response.ok) {
          const responseData = await response.json();
          // API returns { data: { [sectionId]: { has_conflicts, ... } } }
          const conflicts = responseData.data || responseData;
          setConflictMap(conflicts);
        }
      } catch (error) {
        // Silently handle errors to prevent spam
        if (process.env.NODE_ENV === "development") {
          console.error("Error in checkAllConflicts:", error);
        }
      } finally {
        setIsLoadingConflicts(false);
      }
    }

    checkAllConflicts();
  }, [sections]);

  async function handleDelete(
    id: string,
    courseCode: string,
    sectionNo: string
  ) {
    if (
      !confirm(
        `Are you sure you want to delete section ${courseCode}-${sectionNo}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const authHeader = await getAuthHeader();

      const response = await fetch(`/api/v1/sections/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to delete section"
        );
      }

      toast.success(`Section ${courseCode}-${sectionNo} deleted successfully`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete section"
      );
      console.error(error);
    }
  }

  function formatDays(days: string[]) {
    if (!Array.isArray(days) || days.length === 0) return "—";
    return days.map((d) => d.substring(0, 3)).join(", ");
  }

  function formatTime(time: string) {
    if (!time) return "—";
    // Convert 24h to 12h format
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  if (sections.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No sections found. Add your first section to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Scheduling</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>State</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sections.map((section) => (
            <TableRow key={section.id}>
              <TableCell className="font-medium">
                {section.course_code}
              </TableCell>
              <TableCell>{section.section_no}</TableCell>
              <TableCell>
                {(section as { is_scheduled_by_algorithm?: boolean })
                  .is_scheduled_by_algorithm ? (
                  <Badge className="bg-blue-600">Algorithm</Badge>
                ) : (
                  <Badge variant="outline">Manual</Badge>
                )}
              </TableCell>
              <TableCell>{section.instructor_id ? "Assigned" : "—"}</TableCell>
              <TableCell>
                {section.room_code || "—"}
                {section.activity && (
                  <Badge
                    variant={
                      section.activity === "lab"
                        ? "default"
                        : section.activity === "tutorial"
                        ? "secondary"
                        : "outline"
                    }
                    className="ml-2"
                  >
                    {section.activity.charAt(0).toUpperCase() +
                      section.activity.slice(1)}
                  </Badge>
                )}
              </TableCell>
              <TableCell>{formatDays(section.meeting_pattern.days)}</TableCell>
              <TableCell>
                {formatTime(section.meeting_pattern.start)}
                {section.meeting_pattern.duration && (
                  <span className="text-xs text-gray-500 ml-1">
                    ({section.meeting_pattern.duration}m)
                  </span>
                )}
              </TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  L{section.group_level}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    section.state === "released"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {section.state}
                </span>
              </TableCell>
              <TableCell>
                {isLoadingConflicts ? (
                  <span className="text-xs text-muted-foreground">
                    Checking...
                  </span>
                ) : conflictMap[section.id]?.has_conflicts ? (
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-0">
                        <Badge variant="destructive" className="cursor-pointer">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Conflicts
                        </Badge>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80" align="end">
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold">
                          Scheduling Conflicts
                        </h4>
                        {conflictMap[section.id].room_conflicts.length > 0 && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-red-600">
                              Room Conflicts (
                              {conflictMap[section.id].room_conflicts.length}):
                            </div>
                            <ul className="text-xs space-y-1 ml-2">
                              {conflictMap[section.id].room_conflicts.map(
                                (conflict, idx) => (
                                  <li
                                    key={conflict.section_id || idx}
                                    className="flex flex-col gap-0.5"
                                  >
                                    <span className="font-mono font-medium">
                                      {conflict.course_code}-
                                      {conflict.section_no}
                                    </span>
                                    <span className="text-muted-foreground font-mono text-[10px]">
                                      ID: {conflict.section_id}
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                        {conflictMap[section.id].instructor_conflicts.length >
                          0 && (
                          <div className="space-y-1">
                            <div className="text-xs font-medium text-red-600">
                              Instructor Conflicts (
                              {
                                conflictMap[section.id].instructor_conflicts
                                  .length
                              }
                              ):
                            </div>
                            <ul className="text-xs space-y-1 ml-2">
                              {conflictMap[section.id].instructor_conflicts.map(
                                (conflict, idx) => (
                                  <li
                                    key={conflict.section_id || idx}
                                    className="flex flex-col gap-0.5"
                                  >
                                    <span className="font-mono font-medium">
                                      {conflict.course_code}-
                                      {conflict.section_no}
                                    </span>
                                    <span className="text-muted-foreground font-mono text-[10px]">
                                      ID: {conflict.section_id}
                                    </span>
                                  </li>
                                )
                              )}
                            </ul>
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                          Click edit to resolve conflicts
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ) : conflictMap[section.id] ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
                  >
                    ✓ Clear
                  </Badge>
                ) : null}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(section)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleDelete(
                      section.id,
                      section.course_code,
                      section.section_no
                    )
                  }
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
