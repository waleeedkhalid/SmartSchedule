/**
 * SectionManager Component
 * Manage sections for a specific course
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Trash2,
  Save,
  AlertCircle,
  Clock,
  Users,
  MapPin,
  User,
  X,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import type { SchedulerSection, SectionTimeSlot, DayOfWeek } from "@/types";

interface SectionManagerProps {
  courseCode: string;
  termCode: string;
  onClose: () => void;
}

interface SectionFormData {
  id: string;
  instructor_id: string;
  room_number: string;
  capacity: number;
  time_slots: Array<{
    day: DayOfWeek;
    start_time: string;
    end_time: string;
  }>;
}

const DAYS_OF_WEEK: DayOfWeek[] = [
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
];

export function SectionManager({
  courseCode,
  termCode,
  onClose,
}: SectionManagerProps): React.ReactElement {
  const [sections, setSections] = useState<SchedulerSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<SectionFormData | null>(
    null
  );
  const [showNewSectionForm, setShowNewSectionForm] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSections();
  }, [courseCode, termCode]);

  const fetchSections = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/committee/scheduler/courses?term_code=${termCode}&course_type=&level=&include_sections=true`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sections");
      }

      const data = await response.json();
      const courseData = data.data?.find(
        (c: { course: { code: string } }) => c.course.code === courseCode
      );

      if (courseData) {
        setSections(courseData.sections || []);
      }
    } catch (err) {
      console.error("Error fetching sections:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch sections");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSection = (): void => {
    setEditingSection({
      id: "",
      instructor_id: "",
      room_number: "",
      capacity: 50,
      time_slots: [],
    });
    setShowNewSectionForm(true);
  };

  const handleEditSection = (section: SchedulerSection): void => {
    setEditingSection({
      id: section.id,
      instructor_id: section.instructor_id || "",
      room_number: section.room_number || "",
      capacity: section.capacity,
      time_slots: section.time_slots.map((ts) => ({
        day: ts.day,
        start_time: ts.start_time,
        end_time: ts.end_time,
      })),
    });
    setShowNewSectionForm(false);
  };

  const handleSaveSection = async (): Promise<void> => {
    if (!editingSection) return;

    // Validation
    if (!editingSection.id.trim()) {
      toast({
        title: "Validation Error",
        description: "Section ID is required",
        variant: "destructive",
      });
      return;
    }

    if (editingSection.capacity <= 0) {
      toast({
        title: "Validation Error",
        description: "Capacity must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (editingSection.time_slots.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one time slot is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);

      const url = showNewSectionForm
        ? "/api/committee/scheduler/courses"
        : "/api/committee/scheduler/courses";

      const method = showNewSectionForm ? "POST" : "PATCH";

      const body = showNewSectionForm
        ? {
            course_code: courseCode,
            term_code: termCode,
            section_id: editingSection.id,
            instructor_id: editingSection.instructor_id || null,
            room_number: editingSection.room_number || null,
            capacity: editingSection.capacity,
            time_slots: editingSection.time_slots,
          }
        : {
            section_id: editingSection.id,
            instructor_id: editingSection.instructor_id || null,
            room_number: editingSection.room_number || null,
            capacity: editingSection.capacity,
            time_slots: editingSection.time_slots,
          };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save section");
      }

      toast({
        title: "Success",
        description: showNewSectionForm
          ? "Section created successfully"
          : "Section updated successfully",
      });

      // Check for conflicts
      if (data.data?.conflicts && data.data.conflicts.length > 0) {
        toast({
          title: "Warning",
          description: `${data.data.conflicts.length} conflict(s) detected`,
          variant: "destructive",
        });
      }

      setEditingSection(null);
      setShowNewSectionForm(false);
      fetchSections();
    } catch (err) {
      console.error("Error saving section:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to save section",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId: string): Promise<void> => {
    if (!confirm("Are you sure you want to delete this section?")) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        `/api/committee/scheduler/courses?section_id=${sectionId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete section");
      }

      toast({
        title: "Success",
        description: "Section deleted successfully",
      });

      fetchSections();
    } catch (err) {
      console.error("Error deleting section:", err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to delete section",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddTimeSlot = (): void => {
    if (!editingSection) return;

    setEditingSection({
      ...editingSection,
      time_slots: [
        ...editingSection.time_slots,
        { day: "MONDAY", start_time: "08:00", end_time: "09:00" },
      ],
    });
  };

  const handleRemoveTimeSlot = (index: number): void => {
    if (!editingSection) return;

    setEditingSection({
      ...editingSection,
      time_slots: editingSection.time_slots.filter((_, i) => i !== index),
    });
  };

  const handleUpdateTimeSlot = (
    index: number,
    field: "day" | "start_time" | "end_time",
    value: string
  ): void => {
    if (!editingSection) return;

    const newTimeSlots = [...editingSection.time_slots];
    newTimeSlots[index] = {
      ...newTimeSlots[index],
      [field]: value,
    };

    setEditingSection({
      ...editingSection,
      time_slots: newTimeSlots,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Sections - {courseCode}</DialogTitle>
          <DialogDescription>
            Create and manage sections for {termCode}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-6">
            {/* Existing Sections */}
            {!editingSection && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    Sections ({sections.length})
                  </h3>
                  <Button onClick={handleCreateSection}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Section
                  </Button>
                </div>

                {sections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No sections created yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        className="border rounded-lg p-4 space-y-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-lg">
                                {section.id}
                              </h4>
                              <Badge variant="outline">
                                <Users className="h-3 w-3 mr-1" />
                                {section.enrolled_count || 0} / {section.capacity}
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                              {section.instructor_name && (
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  <span>{section.instructor_name}</span>
                                </div>
                              )}
                              {section.room_number && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  <span>{section.room_number}</span>
                                </div>
                              )}
                            </div>

                            {section.time_slots && section.time_slots.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {section.time_slots.map((slot, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {slot.day.slice(0, 3)} {slot.start_time}-
                                    {slot.end_time}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditSection(section)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSection(section.id)}
                              disabled={saving}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Section Form */}
            {editingSection && (
              <div className="space-y-6 border rounded-lg p-6 bg-muted/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">
                    {showNewSectionForm ? "Create New Section" : "Edit Section"}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingSection(null);
                      setShowNewSectionForm(false);
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="section-id">Section ID *</Label>
                    <Input
                      id="section-id"
                      value={editingSection.id}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          id: e.target.value,
                        })
                      }
                      placeholder="e.g., SWE411-01"
                      disabled={!showNewSectionForm}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={editingSection.capacity}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          capacity: parseInt(e.target.value) || 0,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructor">Instructor ID</Label>
                    <Input
                      id="instructor"
                      value={editingSection.instructor_id}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          instructor_id: e.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="room">Room Number</Label>
                    <Input
                      id="room"
                      value={editingSection.room_number}
                      onChange={(e) =>
                        setEditingSection({
                          ...editingSection,
                          room_number: e.target.value,
                        })
                      }
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Time Slots */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Time Slots *</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAddTimeSlot}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slot
                    </Button>
                  </div>

                  {editingSection.time_slots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No time slots added yet
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {editingSection.time_slots.map((slot, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 border rounded-lg bg-background"
                        >
                          <Select
                            value={slot.day}
                            onValueChange={(value) =>
                              handleUpdateTimeSlot(index, "day", value)
                            }
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DAYS_OF_WEEK.map((day) => (
                                <SelectItem key={day} value={day}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Input
                            type="time"
                            value={slot.start_time}
                            onChange={(e) =>
                              handleUpdateTimeSlot(
                                index,
                                "start_time",
                                e.target.value
                              )
                            }
                            className="w-[120px]"
                          />

                          <span className="text-muted-foreground">to</span>

                          <Input
                            type="time"
                            value={slot.end_time}
                            onChange={(e) =>
                              handleUpdateTimeSlot(
                                index,
                                "end_time",
                                e.target.value
                              )
                            }
                            className="w-[120px]"
                          />

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveTimeSlot(index)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditingSection(null);
                      setShowNewSectionForm(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSection} disabled={saving}>
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Section"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

