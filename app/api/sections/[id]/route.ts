import { NextResponse } from "next/server";
import { getSectionById, updateSection, deleteSection } from "@/lib/db/sections";
import { notifySectionUpdate, notifySectionDelete } from "@/lib/db/notification-triggers";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const section = await getSectionById(id);
    return NextResponse.json(section);
  } catch (error) {
    console.error("Error fetching section:", error);
    return NextResponse.json(
      { error: "Section not found" },
      { status: 404 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Get section details before update for notification
    const oldSection = await getSectionById(id);
    
    // Update section
    const section = await updateSection(id, body);
    
    // Send notification about the update
    await notifySectionUpdate(
      id,
      section.course_code,
      section.section_number,
      'Section schedule has been updated'
    );
    
    return NextResponse.json(section);
  } catch (error) {
    console.error("Error updating section:", error);
    return NextResponse.json(
      { error: "Failed to update section" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    
    // Get section details before deletion for notification
    const section = await getSectionById(id);
    
    // Delete section
    await deleteSection(id);
    
    // Send notification about the deletion
    await notifySectionDelete(
      section.course_code,
      section.section_number,
      section.courses?.level || 1
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting section:", error);
    return NextResponse.json(
      { error: "Failed to delete section" },
      { status: 500 }
    );
  }
}

