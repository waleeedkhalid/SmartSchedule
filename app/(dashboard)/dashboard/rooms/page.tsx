import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getRooms } from "@/lib/db/rooms";
import { Plus } from "lucide-react";
import Link from "next/link";
import { RoomsTable } from "@/components/rooms-table";

export default async function RoomsPage() {
  const rooms = await getRooms();

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Rooms
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage your available rooms
            </p>
          </div>
          <Button asChild>
            <Link href="/dashboard/rooms/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>All Rooms</CardTitle>
            <CardDescription>
              {rooms.length} room{rooms.length !== 1 ? 's' : ''} in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RoomsTable rooms={rooms} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

