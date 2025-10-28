"use client";

import { Instructor } from "@/lib/types/database";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InstructorsTableProps {
  instructors: Instructor[];
}

export function InstructorsTable({ instructors }: InstructorsTableProps) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete instructor ${name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/instructors/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete instructor");
      }

      toast.success("Instructor deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete instructor");
      console.error(error);
    }
  }

  if (instructors.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No instructors found. Add your first instructor to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Max Load/Week</TableHead>
            <TableHead>Preferences</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {instructors.map((instructor) => (
            <TableRow key={instructor.id}>
              <TableCell className="font-medium">{instructor.name}</TableCell>
              <TableCell>{instructor.email || "—"}</TableCell>
              <TableCell>{instructor.max_load_per_week}h</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {instructor.preferred_times.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {instructor.preferred_times.length} preferred
                    </span>
                  )}
                  {instructor.unavailable_times.length > 0 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      {instructor.unavailable_times.length} unavailable
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                >
                  <Link href={`/dashboard/instructors/${instructor.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(instructor.id, instructor.name)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

