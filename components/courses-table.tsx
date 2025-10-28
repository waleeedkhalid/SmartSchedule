"use client";

import { Course } from "@/lib/types/database";
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

interface CoursesTableProps {
  courses: Course[];
}

export function CoursesTable({ courses }: CoursesTableProps) {
  const router = useRouter();

  async function handleDelete(code: string) {
    if (!confirm(`Are you sure you want to delete course ${code}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${code}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete course");
      }

      toast.success("Course deleted successfully");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete course");
      console.error(error);
    }
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No courses found. Add your first course to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Weekly Hours</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow key={course.code}>
              <TableCell className="font-medium">{course.code}</TableCell>
              <TableCell>{course.title}</TableCell>
              <TableCell>Level {course.level}</TableCell>
              <TableCell>{course.credits}</TableCell>
              <TableCell>{course.weekly_hours}h</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    course.is_elective
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                  }`}
                >
                  {course.is_elective ? "Elective" : "Core"}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                >
                  <Link href={`/dashboard/courses/${course.code}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(course.code)}
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

