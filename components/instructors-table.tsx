"use client";

import dynamic from "next/dynamic";
import { Instructor } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getAuthHeader } from "@/lib/utils/client-auth";

// Lazy load heavy table components
const Table = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.Table),
  { ssr: false }
);
const TableBody = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableBody),
  { ssr: false }
);
const TableCell = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableCell),
  { ssr: false }
);
const TableHead = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableHead),
  { ssr: false }
);
const TableHeader = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableHeader),
  { ssr: false }
);
const TableRow = dynamic(
  () => import("@/components/ui/table").then((mod) => mod.TableRow),
  { ssr: false }
);

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
      const authHeader = await getAuthHeader();

      const response = await fetch(`/api/v1/instructors/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: authHeader,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete instructor");
      }

      toast.success(`Instructor ${name} deleted successfully`);
      router.refresh();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete instructor";
      toast.error(errorMessage);
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
          {instructors.map((instructor) => {
            // Map user_id to id for backward compatibility
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const instructorId = ((instructor as any).id ||
              instructor.user_id) as string;
            const instructorName = instructor.name || "";
            return (
              <TableRow key={instructorId}>
                <TableCell className="font-medium">{instructorName}</TableCell>
                <TableCell>{instructor.email || "—"}</TableCell>
                <TableCell>{instructor.max_load_per_week ?? 12}h</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {instructor.preferred_times &&
                      Array.isArray(instructor.preferred_times) &&
                      instructor.preferred_times.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          {instructor.preferred_times.length} preferred
                        </span>
                      )}
                    {instructor.unavailable_times &&
                      Array.isArray(instructor.unavailable_times) &&
                      instructor.unavailable_times.length > 0 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          {instructor.unavailable_times.length} unavailable
                        </span>
                      )}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/dashboard/instructors/${instructorId}/edit`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(instructorId, instructorName)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
