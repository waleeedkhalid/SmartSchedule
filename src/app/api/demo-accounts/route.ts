// GET demo accounts from supabase
import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase/client";

export async function GET() {
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, email, role");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ demoAccounts: data }, { status: 200 });
}
