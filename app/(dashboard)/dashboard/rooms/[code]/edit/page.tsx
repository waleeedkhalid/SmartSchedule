import { RoomForm } from "@/components/room-form";
import { getRoomByCode } from "@/lib/db/rooms";
import { notFound } from "next/navigation";

export default async function EditRoomPage({ params }: { params: { code: string } }) {
  const { code } = await params;
  
  try {
    const room = await getRoomByCode(code);
    
    return (
      <div className="p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            Edit Room
          </h1>
          <RoomForm room={room} isEditing />
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}

