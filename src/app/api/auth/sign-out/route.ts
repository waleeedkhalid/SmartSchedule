/**
 * Sign Out API Route
 * POST: End user session
 */

import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";
import { successResponse, errorResponse } from "@/lib/api";

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { error } = await supabase.auth.signOut();

  if (error) {
    return errorResponse(error.message, 400);
  }

  return successResponse({ message: "Signed out successfully" });
}
