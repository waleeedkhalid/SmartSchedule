// GET demo accounts from supabase
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/utils/supabase/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);
  
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, role");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ demoAccounts: data }, { status: 200 });
}
