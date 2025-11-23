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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Instructor } from "@/lib/types/database";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().optional().or(z.literal("")),
  max_load_per_week: z.coerce.number().min(1).max(40),
});

interface InstructorFormProps {
  instructor?: Instructor;
  isEditing?: boolean;
}

export function InstructorForm({ instructor, isEditing = false }: InstructorFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: instructor ? {
      name: instructor.name,
      email: instructor.email || "",
      max_load_per_week: instructor.max_load_per_week,
    } : {
      name: "",
      email: "",
      max_load_per_week: 12,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // DEMO MODE: Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
      
      toast.success(`Instructor ${isEditing ? 'updated' : 'created'} successfully (Demo Mode: Not saved)`);
      router.push("/dashboard/instructors");
      router.refresh();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} instructor (Demo Mode)`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/instructors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Instructors
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Instructor' : 'Add New Instructor'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Dr. John Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Optional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john.smith@university.edu" {...field} />
                    </FormControl>
                    <FormDescription>
                      Contact email for notifications
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_load_per_week"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Load per Week (hours)</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" max="40" {...field} />
                    </FormControl>
                    <FormDescription>
                      Maximum teaching hours per week (default: 12)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEditing && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Note:</strong> Time preferences and unavailable times can be managed
                    in the instructor's detailed view after creation.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : isEditing ? "Update Instructor" : "Create Instructor"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

