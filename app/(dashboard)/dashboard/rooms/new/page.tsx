import { RoomForm } from "@/components/room-form";

export default function NewRoomPage() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Add New Room
        </h1>
        <RoomForm />
      </div>
    </div>
  );
}

