import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { deleteElectivePreference } from "@/lib/db/elective-preferences";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Verify the preference belongs to the current user
    const { data: preference } = await supabase
      .from('elective_preference')
      .select('student_id')
      .eq('id', params.id)
      .single();
    
    if (!preference || preference.student_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    
    await deleteElectivePreference(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting elective preference:", error);
    return NextResponse.json(
      { error: "Failed to delete elective preference" },
      { status: 500 }
    );
  }
}

