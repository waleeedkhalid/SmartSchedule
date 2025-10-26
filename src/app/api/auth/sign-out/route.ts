/**
 * Sign Out API Route
 * POST: End user session
 */

import { createServerClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/api";

export async function POST() {
    const supabase = await createServerClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return errorResponse(error.message, 400);
  }

  return successResponse({ message: "Signed out successfully" });
}
