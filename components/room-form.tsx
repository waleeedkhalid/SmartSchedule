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
import { Room } from "@/lib/types/database";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getAuthHeader } from "@/lib/utils/client-auth";

const formSchema = z.object({
  code: z.string().min(1).max(20),
  type: z.enum(['Lecture', 'Lab']),
});

interface RoomFormProps {
  room?: Room;
  isEditing?: boolean;
}

export function RoomForm({ room, isEditing = false }: RoomFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: room ? {
      code: room.code,
      type: room.type,
    } : {
      code: "",
      type: 'Lecture',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const authHeader = await getAuthHeader();
      
      const url = isEditing 
        ? `/api/v1/rooms/${room?.code}`
        : '/api/v1/rooms';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader,
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditing ? 'update' : 'create'} room`);
      }

      toast.success(`Room ${isEditing ? 'updated' : 'created'} successfully`);
      router.push("/dashboard/rooms");
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${isEditing ? 'update' : 'create'} room`;
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Button asChild variant="ghost" size="sm">
          <Link href="/dashboard/rooms">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Rooms
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? 'Edit Room' : 'Add New Room'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Code</FormLabel>
                    <FormControl>
                      <Input placeholder="A101" {...field} disabled={isEditing} />
                    </FormControl>
                    <FormDescription>
                      Unique identifier for the room (e.g., A101, LAB-B204)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Room Type</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Lecture">Lecture</option>
                        <option value="Lab">Lab</option>
                      </select>
                    </FormControl>
                    <FormDescription>
                      Select whether this is a lecture room or lab
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : isEditing ? "Update Room" : "Create Room"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}

