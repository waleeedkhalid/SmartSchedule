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
import { toast } from "sonner";
import { Course } from "@/lib/data/courses";
import { getAuthHeader } from "@/lib/utils/client-auth";

const formSchema = z.object({
  code: z.string().min(2).max(20),
  title: z.string().min(3).max(200),
  level: z.coerce.number().min(4).max(8),
  credits: z.coerce.number().min(1).max(10),
  weekly_hours: z.coerce.number().min(1).max(20),
  is_elective: z.boolean(),
});

interface CourseFormProps {
  course?: Course;
  isEditing?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CourseForm({ course, isEditing = false, onSuccess, onCancel }: CourseFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: course ? {
      code: course.code,
      title: course.title,
      level: course.level,
      credits: course.credits,
      weekly_hours: course.weekly_hours || (course.credits === 2 ? 2 : course.credits + 1),
      is_elective: course.is_elective,
    } : {
      code: "",
      title: "",
      level: 4,
      credits: 3,
      weekly_hours: 4, // credits (3) + 1
      is_elective: false,
    },
  });

  // Watch credits to show calculated value in description
  const credits = form.watch("credits");

  // Reset form when course changes (for edit mode)
  useEffect(() => {
    if (course) {
      form.reset({
        code: course.code,
        title: course.title,
        level: course.level,
        credits: course.credits,
        weekly_hours: course.weekly_hours || (course.credits === 2 ? 2 : course.credits + 1),
        is_elective: course.is_elective,
      });
    } else {
      form.reset({
        code: "",
        title: "",
        level: 4,
        credits: 3,
        weekly_hours: 4, // credits (3) + 1
        is_elective: false,
      });
    }
  }, [course, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const url = isEditing 
        ? `/api/v1/courses/${course?.code}`
        : '/api/v1/courses';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const authHeader = await getAuthHeader();
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify({
          code: values.code,
          name: values.title,
          credits: values.credits,
          level: values.level,
          weekly_hours: values.weekly_hours,
          course_type: values.is_elective ? 'elective' : 'required',
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Failed to ${isEditing ? 'update' : 'create'} course`);
      }

      toast.success(`Course ${isEditing ? 'updated' : 'created'} successfully`);
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} course`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Code</FormLabel>
                    <FormControl>
                      <Input placeholder="CS101" {...field} disabled={isEditing} />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for the course (e.g., CS101, MATH202)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Introduction to Programming" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <FormControl>
                        <Input type="number" min="4" max="8" {...field} />
                      </FormControl>
                      <FormDescription>
                        Level (4-8)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="credits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="10" 
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            // Auto-calculate weekly_hours when credits change
                            const creditsValue = parseInt(e.target.value) || 0;
                            if (creditsValue > 0) {
                              const calculatedWeeklyHours = creditsValue === 2 ? 2 : creditsValue + 1;
                              form.setValue("weekly_hours", calculatedWeeklyHours);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="weekly_hours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weekly Hours</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="20" {...field} />
                      </FormControl>
                      <FormDescription>
                        Auto-calculated: {credits === 2 ? '2' : `${credits || 0} + 1`}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_elective"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Elective Course
                      </FormLabel>
                      <FormDescription>
                        Check if this is an elective course (students can choose)
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : isEditing ? "Update Course" : "Create Course"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

