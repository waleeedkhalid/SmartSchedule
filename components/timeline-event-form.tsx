"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Loader2 } from "lucide-react";

import type { Database } from "@/lib/types/database";

// Lazy load heavy select and badge components
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
const Badge = dynamic(
  () => import("@/components/ui/badge").then((mod) => mod.Badge),
  { ssr: false }
);

type TimelineEvent = Database["public"]["Tables"]["semester_timeline"]["Row"];
type TimelineEventInsert =
  Database["public"]["Tables"]["semester_timeline"]["Insert"];

interface TimelineEventFormProps {
  event?: TimelineEvent;
  semester?: string;
  onSubmit: (data: TimelineEventInsert) => Promise<void>;
  onCancel?: () => void;
}

const USER_ROLES = [
  "scheduling",
  "registrar",
  "teaching_load",
  "faculty",
  "student",
];

const EVENT_TYPES = [
  { value: "faculty_availability", label: "Faculty Availability Submission" },
  { value: "elective_survey", label: "Elective Survey" },
  { value: "registration", label: "Registration Period" },
  { value: "midterm_exams", label: "Midterm Exams" },
  { value: "final_exams", label: "Final Exams" },
  { value: "schedule_released", label: "Schedule Release" },
];

export function TimelineEventForm({
  event,
  semester,
  onSubmit,
  onCancel,
}: TimelineEventFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    term_code: event?.term_code || semester || "",
    event_type: event?.event_type || "",
    title: event?.title || "", // Will be auto-filled based on event type
    end_date: event?.end_date
      ? new Date(event.end_date).toISOString().slice(0, 16)
      : "",
    target_roles: event?.target_roles || [],
    // Default values for hidden fields
    // Initialize empty to prevent SSR/client date mismatch, set in useEffect after mount
    start_date: event?.start_date
      ? new Date(event.start_date).toISOString().slice(0, 16)
      : "",
    description: event?.description || "",
    category: event?.category || "administrative",
    priority: event?.priority || "medium",
    status: event?.status || "upcoming",
    requires_action: event?.requires_action ?? true,
    is_deadline: event?.is_deadline ?? true,
    notification_days_before: event?.notification_days_before || [7, 3, 1],
  });

  // Set default start_date after mount to prevent SSR/client date mismatch
  useEffect(() => {
    if (!event?.start_date && !formData.start_date) {
      setFormData((prev) => ({
        ...prev,
        start_date: new Date().toISOString().slice(0, 16),
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(field: string, value: unknown) {
    setFormData((prev) => {
      const updates: Partial<TimelineEventInsert> = {
        [field]: value as string | number | null,
      };

      // Auto-fill title based on event type if title is empty or matches a type label
      if (field === "event_type") {
        const typeOption = EVENT_TYPES.find((t) => t.value === value);
        if (typeOption) {
          updates.title = typeOption.label;

          // Set appropriate category
          const val = value as string;
          if (val.includes("exam") || val.includes("grade")) {
            updates.category = "exam";
          } else if (val === "registration" || val === "add_drop") {
            updates.category = "registration";
          } else {
            updates.category = "administrative";
          }
        }
      }

      // If setting deadline, sync start date to same day if not set
      if (field === "end_date" && !prev.start_date) {
        updates.start_date = value as string;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return { ...prev, ...updates } as any;
    });
  }

  function toggleRole(role: string) {
    const roles = formData.target_roles.includes(role)
      ? formData.target_roles.filter((r: string) => r !== role)
      : [...formData.target_roles, role];
    handleChange("target_roles", roles);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Use end_date as start_date for deadlines (single point in time)
      // unless start_date was explicitly set earlier
      const startDate = formData.start_date || formData.end_date;

      const submitData = {
        ...formData,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };

      await onSubmit(submitData);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        {/* Event Type */}
        <div className="space-y-2">
          <Label htmlFor="event_type">Event Type</Label>
          <Select
            value={formData.event_type}
            onValueChange={(value) => handleChange("event_type", value)}
            required
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
        </div>

        {/* Deadline Date */}
        <div className="space-y-2">
          <Label htmlFor="end_date">Deadline</Label>
          <Input
            id="end_date"
            type="datetime-local"
            value={formData.end_date}
            onChange={(e) => handleChange("end_date", e.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            When is this due or when does it happen?
          </p>
        </div>

        {/* Target Roles */}
        <div className="space-y-2">
          <Label>Who is this for? (Target Roles)</Label>
          <div className="flex flex-wrap gap-2 border rounded-md p-3">
            {USER_ROLES.map((role) => (
              <Badge
                key={role}
                variant={
                  formData.target_roles.includes(role) ? "default" : "outline"
                }
                className="cursor-pointer hover:bg-primary/90"
                onClick={() => toggleRole(role)}
              >
                {role}
                {formData.target_roles.includes(role) ? (
                  <X className="ml-1 h-3 w-3" />
                ) : (
                  <span className="ml-1 opacity-50">+</span>
                )}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Click to select roles that need to see this event
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : event ? "Update Event" : "Create Event"}
        </Button>
      </div>
    </form>
  );
}
