import { NextResponse } from "next/server";
import { getRoomByCode, updateRoom, deleteRoom } from "@/lib/db/rooms";

export async function GET(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = await params;
    const room = await getRoomByCode(code);
    return NextResponse.json(room);
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json(
      { error: "Room not found" },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = await params;
    const body = await request.json();
    const room = await updateRoom(code, body);
    return NextResponse.json(room);
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json(
      { error: "Failed to update room" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = await params;
    await deleteRoom(code);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}

