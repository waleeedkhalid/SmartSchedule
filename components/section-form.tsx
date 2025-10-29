"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Section, Course, Instructor, Room } from "@/lib/types/database";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { SectionConflictDisplay } from "@/components/section-conflict-display";
import { parseMeetingPattern } from "@/lib/types/scheduling";

const formSchema = z.object({
  course_code: z.string().min(1, "Course is required"),
  section_no: z.string().min(1, "Section number is required"),
  instructor_id: z.string().optional(),
  room_code: z.string().optional(),
  capacity: z.coerce.number().min(1).max(500),
  group_level: z.coerce.number().min(4).max(8),
  meeting_days: z.array(z.string()).min(1, "Select at least one day"),
  meeting_start: z.string().min(1, "Start time is required"),
  meeting_duration: z.coerce.number().min(30).max(300),
  activity: z.enum(['lecture', 'tutorial', 'lab']),
  state: z.enum(['draft', 'released']),
});

interface SectionFormProps {
  section?: Section;
  courses: Course[];
  instructors: Instructor[];
  rooms: Room[];
  isEditing?: boolean;
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

interface ConflictData {
  room_conflicts: any[];
  instructor_conflicts: any[];
  student_conflicts: any[];
  has_conflicts: boolean;
}

export function SectionForm({ section, courses, instructors, rooms, isEditing = false }: SectionFormProps) {
  const router = useRouter();
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
      group_level: section.group_level,
      meeting_days: parseMeetingPattern(section.meeting_pattern)?.days || [],
      meeting_start: parseMeetingPattern(section.meeting_pattern)?.start || "",
      meeting_duration: parseMeetingPattern(section.meeting_pattern)?.duration || 60,
      activity: section.activity || 'lecture',
      state: section.state,
    } : {
      course_code: "",
      section_no: "",
      instructor_id: "",
      room_code: "",
      capacity: 30,
      group_level: 1,
      meeting_days: [],
      meeting_start: "08:00",
      meeting_duration: 60,
      activity: 'lecture',
      state: 'draft',
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
        group_level,
        meeting_days,
        meeting_start,
        meeting_duration,
      } = watchedValues;

      // Only check if we have minimum required data
      if (
        !meeting_days ||
        meeting_days.length === 0 ||
        !meeting_start ||
        !meeting_duration ||
        !group_level
      ) {
        setConflicts(null);
        return;
      }

      setIsCheckingConflicts(true);

      try {
        const response = await fetch("/api/sections/check-conflicts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_code: room_code || null,
            instructor_id: instructor_id || null,
            group_level,
            meeting_days,
            meeting_start,
            meeting_duration,
            exclude_section_id: section?.id || null,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setConflicts(data);
        }
      } catch (error) {
        console.error("Error checking conflicts:", error);
      } finally {
        setIsCheckingConflicts(false);
      }
    };

    // Debounce the conflict check
    const timeoutId = setTimeout(checkConflicts, 500);
    return () => clearTimeout(timeoutId);
  }, [
    watchedValues.room_code,
    watchedValues.instructor_id,
    watchedValues.group_level,
    watchedValues.meeting_days,
    watchedValues.meeting_start,
    watchedValues.meeting_duration,
    section?.id,
  ]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const payload = {
        course_code: values.course_code,
        section_no: values.section_no,
        instructor_id: values.instructor_id || null,
        room_code: values.room_code || null,
        capacity: values.capacity,
        group_level: values.group_level,
        meeting_pattern: {
          days: values.meeting_days,
          start: values.meeting_start,
          duration: values.meeting_duration,
        },
        activity: values.activity,
        state: values.state,
      };

      const url = isEditing ? `/api/sections/${section?.id}` : "/api/sections";
      const method = isEditing ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} section`);
      }

      toast.success(`Section ${isEditing ? 'updated' : 'created'} successfully`);
      router.push("/dashboard/sections");
      router.refresh();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} section`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/sections">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sections
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Section Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                name="group_level"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Level</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="5" {...field} />
                    </FormControl>
                    <FormDescription>
                      Level (4-8)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Meeting Pattern</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <FormField
                control={form.control}
                name="activity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Section Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select section type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lecture">Lecture</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                        <SelectItem value="lab">Lab</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Lab sections require 2-hour blocks, tutorials are 1 hour
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Section State</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="draft">Draft</option>
                        <option value="released">Released</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      Only released sections are visible to students
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Conflict Detection Display */}
          <SectionConflictDisplay
            conflicts={conflicts}
            isLoading={isCheckingConflicts}
          />

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : isEditing ? "Update Section" : "Create Section"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

