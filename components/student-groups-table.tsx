"use client";

import { StudentGroup } from "@/lib/types/database";
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

interface StudentGroupsTableProps {
  groups: StudentGroup[];
}

export function StudentGroupsTable({ groups }: StudentGroupsTableProps) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete student group ${name}?`)) {
      return;
    }

    try {
      // DEMO MODE: Simulate delete action
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate network latency
      
      toast.success(`Student group "${name}" deleted successfully (Demo Mode: Not saved)`);
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete student group (Demo Mode)");
      console.error(error);
    }
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No student groups found. Add your first student group to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Size</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((group) => (
            <TableRow key={group.id}>
              <TableCell className="font-medium">{group.name}</TableCell>
              <TableCell>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Level {group.level}
                </span>
              </TableCell>
              <TableCell>{group.size} students</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                >
                  <Link href={`/dashboard/student-groups/${group.id}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(group.id, group.name)}
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

