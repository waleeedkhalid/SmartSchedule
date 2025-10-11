import { supabase } from "@/lib/supabase-client";
import type { SWEPlan } from "../../../types/swe-plan";
import type { TableInsert, TableRow, TableUpdate } from "@/lib/database.types";

// Centralized helpers for SWE curriculum plan (swe_plan)
// All consumers must use these helpers instead of writing inline queries.

export async function getSWEPlan(level?: number): Promise<SWEPlan[]> {
  let query = supabase.from("swe_plan").select("*").eq("is_active", true);
  if (typeof level === "number") {
    query = query.eq("level", level);
  }
  const { data, error } = await query.order("level", { ascending: true });
  if (error) throw error;
  return (
    (data as TableRow<"swe_plan">[] | null)?.map(
      (r) => r as unknown as SWEPlan
    ) ?? []
  );
}

export async function addCourse(
  data: Omit<SWEPlan, "id" | "created_at" | "updated_at">
): Promise<SWEPlan> {
  const payload = data as unknown as TableInsert<"swe_plan">;
  const { data: rows, error } = await supabase
    .from("swe_plan")
    .insert(payload)
    .select("*")
    .limit(1)
    .single();
  if (error) throw error;
  return rows as unknown as SWEPlan;
}

export async function updateCourse(
  id: string,
  data: Partial<SWEPlan>
): Promise<SWEPlan> {
  const { data: rows, error } = await supabase
    .from("swe_plan")
    .update(data as unknown as TableUpdate<"swe_plan">)
    .eq("id", id)
    .select("*")
    .limit(1)
    .single();
  if (error) throw error;
  return rows as unknown as SWEPlan;
}

export async function archiveCourse(id: string): Promise<void> {
  const { error } = await supabase
    .from("swe_plan")
    .update({ is_active: false })
    .eq("id", id);
  if (error) throw error;
}
