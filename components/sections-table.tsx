"use client";

import { useState, useEffect } from "react";
import { Section } from "@/lib/types/database";
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
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SectionsTableProps {
  sections: Section[];
}

interface ConflictMap {
  [sectionId: string]: {
    has_conflicts: boolean;
    room_conflicts: any[];
    instructor_conflicts: any[];
    student_conflicts: any[];
  };
}

export function SectionsTable({ sections }: SectionsTableProps) {
  const router = useRouter();
  const [conflictMap, setConflictMap] = useState<ConflictMap>({});
  const [isLoadingConflicts, setIsLoadingConflicts] = useState(false);

  // Check conflicts for all sections on mount
  useEffect(() => {
    async function checkAllConflicts() {
      if (sections.length === 0) return;

      setIsLoadingConflicts(true);
      const conflicts: ConflictMap = {};

      try {
        // Check conflicts for each section
        await Promise.all(
          sections.map(async (section) => {
            try {
              const response = await fetch("/api/sections/check-conflicts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  room_code: section.room_code || null,
                  instructor_id: section.instructor_id || null,
                  group_level: section.group_level,
                  meeting_days: section.meeting_pattern.days,
                  meeting_start: section.meeting_pattern.start,
                  meeting_duration: section.meeting_pattern.duration,
                  exclude_section_id: section.id,
                }),
              });

              if (response.ok) {
                const data = await response.json();
                conflicts[section.id] = data;
              }
            } catch (error) {
              console.error(`Error checking conflicts for section ${section.id}:`, error);
            }
          })
        );

        setConflictMap(conflicts);
      } finally {
        setIsLoadingConflicts(false);
      }
    }

    checkAllConflicts();
  }, [sections]);

  async function handleDelete(id: string, courseCode: string, sectionNo: string) {
    if (!confirm(`Are you sure you want to delete section ${courseCode}-${sectionNo}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/v1/sections/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete section');
      }

      toast.success(`Section ${courseCode}-${sectionNo} deleted successfully`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete section");
      console.error(error);
    }
  }

  function formatDays(days: string[]) {
    if (!Array.isArray(days) || days.length === 0) return "—";
    return days.map(d => d.substring(0, 3)).join(", ");
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
              <TableCell className="font-medium">{section.course_code}</TableCell>
              <TableCell>{section.section_no}</TableCell>
              <TableCell>
                {(section as any).is_scheduled_by_algorithm ? (
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
                      section.activity === 'lab' ? 'default' : 
                      section.activity === 'tutorial' ? 'secondary' : 
                      'outline'
                    }
                    className="ml-2"
                  >
                    {section.activity.charAt(0).toUpperCase() + section.activity.slice(1)}
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
                    section.state === 'released'
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                  }`}
                >
                  {section.state}
                </span>
              </TableCell>
              <TableCell>
                {isLoadingConflicts ? (
                  <span className="text-xs text-muted-foreground">Checking...</span>
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
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">Scheduling Conflicts</h4>
                        {conflictMap[section.id].room_conflicts.length > 0 && (
                          <div className="text-xs">
                            <span className="font-medium text-red-600">Room:</span>{" "}
                            {conflictMap[section.id].room_conflicts.length} conflict(s)
                          </div>
                        )}
                        {conflictMap[section.id].instructor_conflicts.length > 0 && (
                          <div className="text-xs">
                            <span className="font-medium text-red-600">Instructor:</span>{" "}
                            {conflictMap[section.id].instructor_conflicts.length} conflict(s)
                          </div>
                        )}
                        {conflictMap[section.id].student_conflicts.length > 0 && (
                          <div className="text-xs">
                            <span className="font-medium text-red-600">Student Level:</span>{" "}
                            {conflictMap[section.id].student_conflicts.length} conflict(s)
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                          Click edit to see details
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ) : conflictMap[section.id] ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800">
                    ✓ Clear
                  </Badge>
                ) : null}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                >
                  <Link href={`/dashboard/sections/${section.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(section.id, section.course_code, section.section_no)}
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

