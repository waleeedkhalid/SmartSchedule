"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SectionConflictDisplay, type ConflictData } from "@/components/section-conflict-display";
import { parseMeetingPattern } from "@/lib/types/scheduling";
import type { Database } from "@/lib/types/database";

import { getAuthHeader } from "@/lib/utils/client-auth";
import { toast } from "sonner";

type Section = Database["public"]["Tables"]["section"]["Row"] & {
  meeting_pattern: {
    days: string[];
    start: string;
    duration: number;
  };
};

const formSchema = z.object({
  course_code: z.string().min(1, "Course is required"),
  section_no: z.string().min(1, "Section number is required"),
  instructor_id: z.string().optional(),
  room_code: z.string().optional(),
  capacity: z.coerce.number().min(1).max(500),
  meeting_days: z.array(z.string()).min(1, "Select at least one day"),
  meeting_start: z.string().min(1, "Start time is required"),
  meeting_duration: z.coerce.number().min(30).max(300),
});

interface SectionFormProps {
  section?: Section;
  courses: Array<{ code: string; title: string }>;
  instructors: Array<{ id: string; name: string }>;
  rooms: Array<{ code: string; type: string }>;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];



export function SectionForm({
  section,
  courses,
  instructors,
  rooms,
  isEditing = false,
  onSuccess,
  onCancel
}: SectionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictData | null>(null);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: section ? {
      course_code: section.course_code,
      section_no: section.section_no,
      instructor_id: section.instructor_id || "",
      room_code: section.room_code || "",
      capacity: section.capacity,
      meeting_days: parseMeetingPattern(section.meeting_pattern)?.days || [],
      meeting_start: parseMeetingPattern(section.meeting_pattern)?.start || "",
      meeting_duration: parseMeetingPattern(section.meeting_pattern)?.duration || 60,
    } : {
      course_code: "",
      section_no: "",
      instructor_id: "",
      room_code: "",
      capacity: 30,
      meeting_days: [],
      meeting_start: "08:00",
      meeting_duration: 60,
    },
  });

  // Watch form values for conflict checking
  const watchedValues = form.watch();

  // Debounced conflict checking
  useEffect(() => {
    const checkConflicts = async () => {
      const {
        room_code,
        instructor_id,
        meeting_days,
        meeting_start,
        meeting_duration,
      } = watchedValues;

      // Only check if we have minimum required data
      if (
        !meeting_days ||
        meeting_days.length === 0 ||
        !meeting_start ||
        !meeting_duration
      ) {
        setConflicts(null);
        return;
      }

      setIsCheckingConflicts(true);

      try {
        // Get auth header for API request
        const authHeader = await getAuthHeader();

        if (!authHeader) {
          // If no auth, skip conflict checking
          setConflicts(null);
          return;
        }

        // Get current term_id (optional - API will use active term if not provided)
        let termId: string | null = null;
        try {
          const termsResponse = await fetch('/api/v1/academic-terms', {
            headers: {
              'Authorization': authHeader,
            },
          });
          if (termsResponse.ok) {
            const termsData = await termsResponse.json();
            interface Term {
              status?: string;
            }
            const activeTerm = termsData.data?.find((t: Term) =>
              t.status === 'draft' || t.status === 'released'
            );
            if (activeTerm) {
              termId = activeTerm.id;
            }
          }
        } catch (e) {
          // If term fetch fails, continue without term_id (API will use active term)
          console.warn('Could not fetch active term for conflict check:', e);
        }

        // Convert meeting_start to 24-hour format if needed (e.g., "08:00 AM" -> "08:00")
        let meetingStart = watchedValues.meeting_start;
        if (meetingStart.includes("AM") || meetingStart.includes("PM")) {
          // Parse 12-hour format
          const [time, period] = meetingStart.split(" ");
          const [hours, minutes] = time.split(":");
          let hour24 = parseInt(hours);
          if (period === "PM" && hour24 !== 12) hour24 += 12;
          if (period === "AM" && hour24 === 12) hour24 = 0;
          meetingStart = `${String(hour24).padStart(2, "0")}:${minutes}`;
        }

        // Call the conflict check API
        const response = await fetch("/api/v1/sections/check-conflicts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader,
          },
          body: JSON.stringify({
            room_code: room_code || null,
            instructor_id: instructor_id || null,
            meeting_days: meeting_days,
            meeting_start: meetingStart,
            meeting_duration: meeting_duration,
            term_id: termId, // Optional - API will use active term if not provided
            exclude_section_id: section?.id, // Exclude current section when editing
          }),
        });

        if (response.ok) {
          const responseData = await response.json();
          // Extract the actual conflict data from the API response wrapper
          // API returns { data: { has_conflicts: ..., ... } }
          const conflictData = responseData.data || responseData;
          setConflicts(conflictData);
        } else {
          // If API call fails, clear conflicts
          setConflicts(null);
        }
      } catch (error) {
        console.error("Error checking conflicts:", error);
        setConflicts(null);
      } finally {
        setIsCheckingConflicts(false);
      }
    };

    // Debounce the conflict check
    const timeoutId = setTimeout(checkConflicts, 500);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watchedValues.room_code,
    watchedValues.instructor_id,
    watchedValues.meeting_days,
    watchedValues.meeting_start,
    watchedValues.meeting_duration,
    section?.id,
  ]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const url = isEditing
        ? `/api/v1/sections/${section?.id}`
        : '/api/v1/sections';

      const method = isEditing ? 'PUT' : 'POST';

      // Get current term_id (for now, we'll get the active term)
      // TODO: Add term selection to form
      let termId = null;
      try {
        const termsResponse = await fetch('/api/v1/academic-terms');
        if (termsResponse.ok) {
          const termsData = await termsResponse.json();
          interface Term {
            id: string;
            status?: string;
          }
          const activeTerm = termsData.data?.find((t: Term) =>
            t.status === 'draft' || t.status === 'released'
          );
          if (activeTerm) {
            termId = activeTerm.id;
          }
        }
      } catch (e) {
        console.warn('Could not fetch active term:', e);
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_code: values.course_code,
          section_no: values.section_no,
          instructor_id: values.instructor_id || null,
          room_code: values.room_code || null,
          capacity: values.capacity,
          group_level: 4, // Default to level 4
          meeting_days: values.meeting_days,
          meeting_start: values.meeting_start,
          meeting_duration: values.meeting_duration,
          activity: 'lecture', // Default to lecture
          state: 'draft', // Default to draft
          term_id: termId, // Add to schedule if term_id is available
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} section`);
      }

      toast.success(`Section ${isEditing ? 'updated' : 'created'} successfully`);

      // Call onSuccess callback if provided (for dialog mode)
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} section`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="course_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Course</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={isEditing}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.code} value={course.code}>
                        {course.code} - {course.title}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="section_no"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Section Number</FormLabel>
                <FormControl>
                  <Input placeholder="01" {...field} disabled={isEditing} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="instructor_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructor (Optional)</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Unassigned</option>
                    {instructors.map((instructor) => (
                      <option key={instructor.id} value={instructor.id}>
                        {instructor.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="room_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room (Optional)</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Unassigned</option>
                    {rooms.map((room) => (
                      <option key={room.code} value={room.code}>
                        {room.code} ({room.type})
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacity</FormLabel>
                <FormControl>
                  <Input type="number" min="1" max="500" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="meeting_days"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meeting Days</FormLabel>
              <div className="flex flex-wrap gap-2">
                {DAYS.map((day) => (
                  <label
                    key={day}
                    className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-md border hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={field.value.includes(day)}
                      onChange={(e) => {
                        const updatedDays = e.target.checked
                          ? [...field.value, day]
                          : field.value.filter((d) => d !== day);
                        field.onChange(updatedDays);
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{day.substring(0, 3)}</span>
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="meeting_start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="meeting_duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duration (minutes)</FormLabel>
                <FormControl>
                  <Input type="number" min="30" max="300" step="15" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>


        {/* Conflict Detection Display */}
        <SectionConflictDisplay
          conflicts={conflicts}
          isLoading={isCheckingConflicts}
        />

        <div className="flex justify-end gap-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Section" : "Create Section"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

