import { RoomForm } from "@/components/room-form";
import { createClient } from "@/supabase/server";
import { notFound } from "next/navigation";

export default async function EditRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const supabase = await createClient();
  
  const { data: room, error } = await supabase
    .from("room")
    .select("*")
    .eq("code", code)
    .single();
  
  if (error || !room) {
    notFound();
  }
  
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
}

