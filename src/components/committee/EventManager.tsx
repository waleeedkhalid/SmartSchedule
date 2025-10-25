/**
 * Event Manager Component
 * Create, edit, and manage academic events
 */

"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Plus,
  Calendar,
  Edit,
  Trash2,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import type {
  EnrichedEvent,
  EventFormData,
  EventType,
  EventCategory,
} from "@/types/timeline";

interface EventManagerProps {
  termCode: string;
  onEventCreated?: (event: EnrichedEvent) => void;
  onEventUpdated?: (event: EnrichedEvent) => void;
  onEventDeleted?: (eventId: string) => void;
}

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "registration", label: "Registration" },
  { value: "add_drop", label: "Add/Drop Period" },
  { value: "elective_survey", label: "Elective Survey" },
  { value: "midterm_exam", label: "Midterm Exam" },
  { value: "final_exam", label: "Final Exam" },
  { value: "break", label: "Break" },
  { value: "grade_submission", label: "Grade Submission" },
  { value: "feedback_period", label: "Feedback Period" },
  { value: "schedule_publish", label: "Schedule Publication" },
  { value: "academic_milestone", label: "Academic Milestone" },
  { value: "other", label: "Other" },
];

const EVENT_CATEGORIES: { value: EventCategory; label: string }[] = [
  { value: "academic", label: "Academic" },
  { value: "registration", label: "Registration" },
  { value: "exam", label: "Exam" },
  { value: "administrative", label: "Administrative" },
];

const PRIORITY_OPTIONS = [
  { value: "high", label: "High Priority" },
  { value: "medium", label: "Medium Priority" },
  { value: "low", label: "Low Priority" },
];

export default function EventManager({
  termCode,
  onEventCreated,
  onEventUpdated,
  onEventDeleted,
}: EventManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EnrichedEvent | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: {
      term_code: termCode,
      category: "academic",
      is_recurring: false,
      metadata: { priority: "medium", requires_action: false },
    },
  });

  const eventType = watch("event_type");
  const category = watch("category");
  const requiresAction = watch("metadata.requires_action");

  // Handle form submission
  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);

    try {
      const url = editingEvent
        ? `/api/academic/events/${editingEvent.id}`
        : "/api/academic/events";

      const method = editingEvent ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to save event");
      }

      toast.success(
        editingEvent ? "Event updated successfully" : "Event created successfully"
      );

      if (editingEvent) {
        onEventUpdated?.(result.data);
      } else {
        onEventCreated?.(result.data);
      }

      setIsOpen(false);
      reset();
      setEditingEvent(null);
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save event");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/academic/events/${eventId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      toast.success("Event deleted successfully");
      onEventDeleted?.(eventId);
      setIsOpen(false);
      setEditingEvent(null);
      reset();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open dialog for editing
  const handleEdit = (event: EnrichedEvent) => {
    setEditingEvent(event);
    setValue("title", event.title);
    setValue("description", event.description || "");
    setValue("event_type", event.event_type);
    setValue("category", event.category);
    setValue("start_date", event.start_date);
    setValue("end_date", event.end_date);
    setValue("is_recurring", event.is_recurring || false);
    setValue("metadata", event.metadata);
    setIsOpen(true);
  };

  // Reset and open for new event
  const handleCreate = () => {
    setEditingEvent(null);
    reset({
      term_code: termCode,
      category: "academic",
      is_recurring: false,
      metadata: { priority: "medium", requires_action: false },
    });
    setIsOpen(true);
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event" : "Create New Event"}
            </DialogTitle>
            <DialogDescription>
              {editingEvent
                ? "Update event details below"
                : "Add a new event to the academic timeline"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Title */}
            <div>
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                {...register("title", { required: "Title is required" })}
                placeholder="Event title"
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Event description (optional)"
                rows={3}
              />
            </div>

            {/* Event Type */}
            <div>
              <Label htmlFor="event_type">
                Event Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={eventType}
                onValueChange={(value) =>
                  setValue("event_type", value as EventType)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.event_type && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.event_type.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={category}
                onValueChange={(value) =>
                  setValue("category", value as EventCategory)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">
                  Start Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start_date"
                  type="datetime-local"
                  {...register("start_date", {
                    required: "Start date is required",
                  })}
                />
                {errors.start_date && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.start_date.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="end_date">
                  End Date <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="end_date"
                  type="datetime-local"
                  {...register("end_date", { required: "End date is required" })}
                />
                {errors.end_date && (
                  <p className="text-sm text-red-500 mt-1">
                    {errors.end_date.message}
                  </p>
                )}
              </div>
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={watch("metadata.priority") || "medium"}
                onValueChange={(value) =>
                  setValue("metadata.priority", value as "high" | "medium" | "low")
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Options */}
            <div className="space-y-3 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="recurring">Recurring Event</Label>
                  <p className="text-sm text-muted-foreground">
                    Event repeats on a schedule
                  </p>
                </div>
                <Switch
                  id="recurring"
                  checked={watch("is_recurring") || false}
                  onCheckedChange={(checked) => setValue("is_recurring", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="requires_action">Requires Action</Label>
                  <p className="text-sm text-muted-foreground">
                    Students/faculty need to take action
                  </p>
                </div>
                <Switch
                  id="requires_action"
                  checked={requiresAction || false}
                  onCheckedChange={(checked) =>
                    setValue("metadata.requires_action", checked)
                  }
                />
              </div>
            </div>

            {/* Warning for date validation */}
            {watch("start_date") && watch("end_date") && (
              <>
                {new Date(watch("start_date")) > new Date(watch("end_date")) && (
                  <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4" />
                        <p className="text-sm">
                          End date must be after start date
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            <DialogFooter className="gap-2">
              {editingEvent && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => handleDelete(editingEvent.id)}
                  disabled={isSubmitting}
                  className="mr-auto"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsOpen(false);
                  setEditingEvent(null);
                  reset();
                }}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? "Saving..." : editingEvent ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Export event list component for displaying and managing events
export function EventList({
  events,
  onEdit,
  onDelete,
}: {
  events: EnrichedEvent[];
  onEdit: (event: EnrichedEvent) => void;
  onDelete: (eventId: string) => void;
}) {
  return (
    <div className="space-y-2">
      {events.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No events found</p>
          </CardContent>
        </Card>
      ) : (
        events.map((event) => (
          <Card key={event.id} className="hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">{event.title}</CardTitle>
                  {event.description && (
                    <CardDescription className="mt-1">
                      {event.description}
                    </CardDescription>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {event.status}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="capitalize">
                  {event.category}
                </Badge>
                <span>•</span>
                <span>
                  {new Date(event.start_date).toLocaleDateString()} -{" "}
                  {new Date(event.end_date).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}

