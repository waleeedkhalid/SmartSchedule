"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
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
import { Exam } from "@/lib/types";
import { Course } from "@/lib/data/courses";
import { Room } from "@/lib/data/rooms";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

// Lazy load heavy UI components
const Card = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.Card),
  { ssr: false }
);
const CardContent = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardContent),
  { ssr: false }
);
const CardHeader = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardHeader),
  { ssr: false }
);
const CardTitle = dynamic(
  () => import("@/components/ui/card").then((mod) => mod.CardTitle),
  { ssr: false }
);
const Badge = dynamic(
  () => import("@/components/ui/badge").then((mod) => mod.Badge),
  { ssr: false }
);

const formSchema = z.object({
  course_code: z.string().min(1, "Course is required"),
  date: z.string().min(1, "Date is required"),
  start_time: z.string().min(1, "Start time is required"),
  duration_minutes: z.coerce.number().min(30).max(300),
  room_codes: z.array(z.string()).min(1, "At least one room is required"),
});

interface ExamFormProps {
  exam?: Exam;
  courses: Course[];
  rooms: Room[];
  isEditing?: boolean;
}

interface ConflictInfo {
  room_conflicts: Array<{
    exam_id: string;
    course_code: string;
    conflicting_rooms: string[];
    type: string;
  }>;
  student_conflicts: Array<{
    exam_id: string;
    course_code: string;
    level: number;
    type: string;
  }>;
  has_conflicts: boolean;
}

export function ExamForm({
  exam,
  courses,
  rooms,
  isEditing = false,
}: ExamFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictInfo | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: exam
      ? {
        course_code: exam.course_code,
        date: exam.date,
        start_time: exam.start_time.substring(0, 5), // HH:MM format
        duration_minutes: exam.duration_minutes,
        room_codes: exam.room_codes || [],
      }
      : {
        course_code: "",
        date: "",
        start_time: "09:00",
        duration_minutes: 120,
        room_codes: [],
      },
  });

  const checkConflicts = useCallback(async () => {
    if (!exam?.id) return;

    try {
      const response = await fetch(`/api/v1/exams/${exam.id}/conflicts`);

      if (!response.ok) {
        throw new Error("Failed to check conflicts");
      }

      const result = await response.json();

      if (result.success && result.data) {
        setConflicts(result.data);
      }
    } catch (error) {
      console.error("Error checking conflicts:", error);
      // Set empty conflicts on error
      setConflicts({
        room_conflicts: [],
        student_conflicts: [],
        has_conflicts: false,
      });
    }
  }, [exam?.id]);

  // Check conflicts when exam is loaded (edit mode)
  useEffect(() => {
    if (exam?.id) {
      checkConflicts();
    }
  }, [exam?.id, checkConflicts]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const url = isEditing ? `/api/v1/exams/${exam?.id}` : "/api/v1/exams";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_code: values.course_code,
          date: values.date,
          start_time: values.start_time,
          duration_minutes: values.duration_minutes,
          room_codes: values.room_codes,
          exam_type: "final", // Default to final exam type
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Failed to ${isEditing ? "update" : "create"} exam`
        );
      }

      toast.success(`Exam ${isEditing ? "updated" : "created"} successfully`);
      router.push("/dashboard/exams");
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : `Failed to ${isEditing ? "update" : "create"} exam`;
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const toggleRoom = (roomCode: string) => {
    const currentRooms = form.getValues("room_codes");
    if (currentRooms.includes(roomCode)) {
      form.setValue(
        "room_codes",
        currentRooms.filter((code) => code !== roomCode)
      );
    } else {
      form.setValue("room_codes", [...currentRooms, roomCode]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/exams">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Exams
          </Link>
        </Button>
      </div>

      {conflicts?.has_conflicts && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertTriangle className="h-5 w-5" />
              Conflicts Detected
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {conflicts.room_conflicts?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  Room Conflicts:
                </h4>
                {conflicts.room_conflicts.map((conflict, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-yellow-700 dark:text-yellow-300 ml-4"
                  >
                    • {conflict.course_code} - Rooms:{" "}
                    {conflict.conflicting_rooms.join(", ")}
                  </div>
                ))}
              </div>
            )}
            {conflicts.student_conflicts?.length > 0 && (
              <div>
                <h4 className="font-semibold text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  Student Level Conflicts:
                </h4>
                {conflicts.student_conflicts.map((conflict, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-yellow-700 dark:text-yellow-300 ml-4"
                  >
                    • {conflict.course_code} (Level {conflict.level})
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Exam Details</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Note: All exams are course-level and apply to all sections of
                the selected course.
              </p>
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
                              {course.code} - {course.title} (L{course.level})
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
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_time"
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
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="30"
                          max="300"
                          step="15"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Typical exam duration: 120 minutes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exam Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="room_codes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Select Rooms</FormLabel>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      {rooms.map((room) => {
                        const isSelected = field.value.includes(room.code);
                        return (
                          <button
                            key={room.code}
                            type="button"
                            onClick={() => toggleRoom(room.code)}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background hover:bg-gray-50 dark:hover:bg-gray-800"
                              }`}
                          >
                            <div className="font-medium">{room.code}</div>
                            <div className="text-xs opacity-70">
                              {room.type}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <FormDescription>
                      Select multiple rooms to accommodate all students
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {form.watch("room_codes").length > 0 && (
                <div className="mt-4">
                  <div className="text-sm font-medium mb-2">
                    Selected Rooms:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.watch("room_codes").map((code) => (
                      <Badge key={code} variant="secondary">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : isEditing
                  ? "Update Exam"
                  : "Create Exam"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
