"use client";

import { useState } from "react";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TimeGridConfig } from "@/lib/types/database";
import { toast } from "sonner";
import { getAuthHeader } from "@/lib/utils/client-auth";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  teaching_days: z.string(),
  daily_start_time: z.string(),
  daily_end_time: z.string(),
  slot_duration_minutes: z.coerce.number().min(15).max(180),
  break_start_time: z.string(),
  break_end_time: z.string(),
  exam_days: z.string(),
  exam_start_time: z.string(),
  exam_end_time: z.string(),
  min_days_between_exams: z.coerce.number().min(0).default(1),
  max_exams_per_day: z.coerce.number().min(1).default(2),
  typical_lab_duration_minutes: z.coerce.number().min(60).max(300),
});

interface TimeGridConfigFormProps {
  initialConfig: TimeGridConfig;
}

export function TimeGridConfigForm({ initialConfig }: TimeGridConfigFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teaching_days: initialConfig.teaching_days.join(", "),
      daily_start_time: initialConfig.daily_start_time.substring(0, 5), // HH:MM
      daily_end_time: initialConfig.daily_end_time.substring(0, 5),
      slot_duration_minutes: initialConfig.slot_duration_minutes,
      break_start_time: initialConfig.break_start_time.substring(0, 5),
      break_end_time: initialConfig.break_end_time.substring(0, 5),
      exam_days: initialConfig.exam_days.join(", "),
      exam_start_time: initialConfig.exam_start_time.substring(0, 5),
      exam_end_time: initialConfig.exam_end_time.substring(0, 5),
      min_days_between_exams: initialConfig.min_days_between_exams ?? 1,
      max_exams_per_day: initialConfig.max_exams_per_day ?? 2,
      typical_lab_duration_minutes: initialConfig.typical_lab_duration_minutes,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const authHeader = await getAuthHeader();

      // Prepare the config data
      const configData = {
        id: initialConfig.id || null,
        teaching_days: values.teaching_days.split(",").map((d) => d.trim()),
        daily_start_time: values.daily_start_time + ":00",
        daily_end_time: values.daily_end_time + ":00",
        slot_duration_minutes: values.slot_duration_minutes,
        break_start_time: values.break_start_time + ":00",
        break_end_time: values.break_end_time + ":00",
        exam_days: values.exam_days.split(",").map((d) => d.trim()),
        exam_start_time: values.exam_start_time + ":00",
        exam_end_time: values.exam_end_time + ":00",
        min_days_between_exams: values.min_days_between_exams,
        max_exams_per_day: values.max_exams_per_day,
        typical_lab_duration_minutes: values.typical_lab_duration_minutes,
      };

      const response = await fetch("/api/v1/time-grid-config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(configData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update configuration");
      }

      toast.success("Configuration updated successfully");
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to update configuration";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Teaching Schedule</CardTitle>
            <CardDescription>
              Configure the regular teaching days and hours
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="teaching_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teaching Days</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Sunday, Monday, Tuesday, Wednesday, Thursday"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of teaching days
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="daily_start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="daily_end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="slot_duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slot Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min="15" max="180" {...field} />
                  </FormControl>
                  <FormDescription>
                    Standard time slot duration (e.g., 60 for 1-hour slots)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="break_start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Break Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="break_end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Break End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam Schedule</CardTitle>
            <CardDescription>Configure exam days and hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="exam_days"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Exam Days</FormLabel>
                  <FormControl>
                    <Input placeholder="Saturday" {...field} />
                  </FormControl>
                  <FormDescription>
                    Comma-separated list of exam days
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="exam_start_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="exam_end_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exam End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lab Settings</CardTitle>
            <CardDescription>Configure lab duration settings</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="typical_lab_duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typical Lab Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" min="60" max="300" {...field} />
                  </FormControl>
                  <FormDescription>
                    Standard lab duration (e.g., 120 for 2-hour labs)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exam Spacing Settings</CardTitle>
            <CardDescription>
              Configure settings for exam spacing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="min_days_between_exams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Min Days Between Exams</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" {...field} />
                    </FormControl>
                    <FormDescription>
                      Minimum gap between exams for a student
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_exams_per_day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Exams Per Day</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum exams a student can have in one day
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
