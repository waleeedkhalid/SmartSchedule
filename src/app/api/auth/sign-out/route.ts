import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true });
}
