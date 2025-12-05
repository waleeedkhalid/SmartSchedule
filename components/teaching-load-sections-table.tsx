"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import type { Database } from "@/lib/types/database";
import { Button } from "@/components/ui/button";
import { Edit, Save, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getAuthHeader } from "@/lib/utils/client-auth";

// Lazy load heavy table and select components
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
const Select = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.Select),
  { ssr: false }
);
const SelectContent = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectContent),
  { ssr: false }
);
const SelectItem = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectItem),
  { ssr: false }
);
const SelectTrigger = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectTrigger),
  { ssr: false }
);
const SelectValue = dynamic(
  () => import("@/components/ui/select").then((mod) => mod.SelectValue),
  { ssr: false }
);

type Section = Database["public"]["Tables"]["section"]["Row"] & {
  course?: { code: string; title: string; credits: number } | null;
  instructor?: {
    id?: string;
    user_id?: string | null;
    name: string;
    email: string | null;
  } | null;
  room?: { code: string; type: string } | null;
};

interface TeachingLoadSectionsTableProps {
  sections: Section[];
  instructors: Array<{
    id?: string | null;
    user_id?: string | null;
    name: string;
    email?: string | null;
  }>;
}

export function TeachingLoadSectionsTable({
  sections,
  instructors,
}: TeachingLoadSectionsTableProps) {
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [selectedInstructorId, setSelectedInstructorId] = useState<
    string | null
  >(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localSections, setLocalSections] = useState<Section[]>(sections);

  // Update local sections when props change
  useEffect(() => {
    setLocalSections(sections);
  }, [sections]);

  async function handleSave(sectionId: string) {
    // selectedInstructorId can be null (unassigned) or a valid instructor ID
    // No need to validate here as null is a valid value for unassigning

    setIsSaving(true);
    try {
      const authHeader = await getAuthHeader();

      const response = await fetch(`/api/v1/sections/${sectionId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader || "",
        },
        body: JSON.stringify({
          instructor_id: selectedInstructorId || null,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to update section"
        );
      }

      // Update local state
      setLocalSections((prev) =>
        prev.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                instructor_id: selectedInstructorId,
                instructor: result.data?.instructor || null,
              }
            : section
        )
      );

      toast.success("Instructor assignment updated successfully");
      setEditingSectionId(null);
      setSelectedInstructorId(null);

      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update instructor assignment"
      );
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setEditingSectionId(null);
    setSelectedInstructorId(null);
  }

  function handleEdit(section: Section) {
    setEditingSectionId(section.id);
    setSelectedInstructorId(section.instructor_id);
  }

  function formatDays(days: string[] | null) {
    if (!days || !Array.isArray(days) || days.length === 0) return "—";
    return days.map((d) => d.substring(0, 3)).join(", ");
  }

  function formatTime(time: string | null) {
    if (!time) return "—";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours);
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  }

  if (localSections.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>
          No sections found. Sections will appear here once they are created.
        </p>
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
            <TableHead>Activity</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>State</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {localSections.map((section) => {
            const isEditing = editingSectionId === section.id;
            const meetingPattern = section.meeting_pattern as {
              days?: string[];
              start?: string;
              duration?: number;
            } | null;

            return (
              <TableRow key={section.id}>
                <TableCell className="font-medium">
                  {section.course_code}
                  {section.course?.title && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {section.course.title}
                    </div>
                  )}
                </TableCell>
                <TableCell>{section.section_no}</TableCell>
                <TableCell>
                  {section.activity ? (
                    <Badge
                      variant={
                        section.activity === "lab"
                          ? "default"
                          : section.activity === "tutorial"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {section.activity.charAt(0).toUpperCase() +
                        section.activity.slice(1)}
                    </Badge>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {isEditing ? (
                    <Select
                      value={selectedInstructorId || "unassigned"}
                      onValueChange={(value) =>
                        setSelectedInstructorId(
                          value === "unassigned" ? null : value
                        )
                      }
                      disabled={isSaving}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">Unassigned</SelectItem>
                        {instructors.map((instructor) => {
                          const optionId = instructor.id || instructor.user_id;
                          if (!optionId) {
                            return null;
                          }
                          return (
                            <SelectItem key={optionId} value={optionId}>
                              {instructor.name}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div>
                      {section.instructor ? (
                        <div>
                          <div className="font-medium">
                            {section.instructor.name}
                          </div>
                          {section.instructor.email && (
                            <div className="text-xs text-muted-foreground">
                              {section.instructor.email}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">
                          Unassigned
                        </span>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {section.room_code || "—"}
                  {section.room && (
                    <div className="text-xs text-muted-foreground">
                      <div className="font-medium">
                        {section.room.type || "Room"}
                      </div>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {formatDays(meetingPattern?.days || null)}
                </TableCell>
                <TableCell>
                  {formatTime(meetingPattern?.start || null)}
                  {meetingPattern?.duration && (
                    <span className="text-xs text-gray-500 ml-1">
                      ({meetingPattern.duration}m)
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
                <TableCell className="text-right">
                  {isEditing ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSave(section.id)}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(section)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
