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
import { StudentGroup } from "@/lib/types/database";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  name: z.string().min(2).max(100),
  level: z.coerce.number().min(4).max(8),
  size: z.coerce.number().min(1).max(500),
});

interface StudentGroupFormProps {
  group?: StudentGroup;
  isEditing?: boolean;
}

export function StudentGroupForm({ group, isEditing = false }: StudentGroupFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: group ? {
      name: group.name,
      level: group.level,
      size: group.size,
    } : {
      name: "",
      level: 4,
      size: 30,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      // DEMO MODE: Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency
      
      toast.success(`Student group ${isEditing ? 'updated' : 'created'} successfully (Demo Mode: Not saved)`);
      router.push("/dashboard/student-groups");
      router.refresh();
    } catch (error) {
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} student group (Demo Mode)`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/student-groups">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Student Groups
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Student Group' : 'Add New Student Group'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Group Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Level 1 - Group A" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this student group
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
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

                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Group Size</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" max="500" {...field} />
                      </FormControl>
                      <FormDescription>
                        Number of students
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : isEditing ? "Update Group" : "Create Group"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

