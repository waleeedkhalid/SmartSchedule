"use client";

import { Room } from "@/lib/types/database";
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
import { getAuthHeader } from "@/lib/utils/client-auth";

interface RoomsTableProps {
  rooms: Room[];
}

export function RoomsTable({ rooms }: RoomsTableProps) {
  const router = useRouter();

  async function handleDelete(code: string) {
    if (!confirm(`Are you sure you want to delete room ${code}?`)) {
      return;
    }

    try {
      const authHeader = await getAuthHeader();
      
      const response = await fetch(`/api/v1/rooms/${code}`, {
        method: 'DELETE',
        headers: {
          'Authorization': authHeader,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete room');
      }

      toast.success(`Room ${code} deleted successfully`);
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete room';
      toast.error(errorMessage);
      console.error(error);
    }
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No rooms found. Add your first room to get started.
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Room Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.code}>
              <TableCell className="font-medium">{room.code}</TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    room.type === 'Lab'
                      ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                      : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  }`}
                >
                  {room.type}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                >
                  <Link href={`/dashboard/rooms/${room.code}/edit`}>
                    <Edit className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(room.code)}
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

