/**
 * Elective Preferences API Route
 * GET: Fetch student's elective preferences
 * POST: Create/update student's elective preferences
 * DELETE: Remove specific preference
 */

import { NextRequest } from "next/server";
import { z } from "zod";
import { 
  getAuthenticatedUser, 
  successResponse, 
  errorResponse, 
  unauthorizedResponse,
  validationErrorResponse 
} from "@/lib/api";
import type { StudentElectiveWithDetails } from "@/types";

const preferencesSchema = z.object({
  preferences: z.array(
    z.object({
      electiveId: z.string().uuid(),
      preferenceOrder: z.number().int().positive(),
    })
  ).min(1).max(10),
});

export async function GET() {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  const { data: preferences, error } = await supabase
    .from("student_electives")
    .select(`*, elective:electives(*)`)
    .eq("student_id", user.id)
    .order("preference_order", { ascending: true });

  if (error) {
    return errorResponse(error.message);
  }

  return successResponse({ 
    preferences: (preferences || []) as StudentElectiveWithDetails[] 
  });
}

export async function POST(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  const body = await request.json();
  const validated = preferencesSchema.safeParse(body);

  if (!validated.success) {
    return validationErrorResponse(validated.error);
  }

  // Delete existing preferences
  const { error: deleteError } = await supabase
    .from("student_electives")
    .delete()
    .eq("student_id", user.id);

  if (deleteError) {
    return errorResponse(deleteError.message);
  }

  // Insert new preferences
  const preferencesToInsert = validated.data.preferences.map((pref) => ({
    student_id: user.id,
    elective_id: pref.electiveId,
    preference_order: pref.preferenceOrder,
  }));

  const { data, error: insertError } = await supabase
    .from("student_electives")
    .insert(preferencesToInsert)
    .select();

  if (insertError) {
    return errorResponse(insertError.message);
  }

  return successResponse({ preferences: data });
}

export async function DELETE(request: NextRequest) {
  const { user, supabase, error: authError } = await getAuthenticatedUser();

  if (authError || !user) {
    return unauthorizedResponse();
  }

  const { searchParams } = new URL(request.url);
  const electiveId = searchParams.get("electiveId");

  if (!electiveId) {
    return validationErrorResponse("electiveId is required");
  }

  const { error } = await supabase
    .from("student_electives")
    .delete()
    .eq("student_id", user.id)
    .eq("elective_id", electiveId);

  if (error) {
    return errorResponse(error.message);
  }

  return successResponse({ message: "Preference deleted successfully" });
}
