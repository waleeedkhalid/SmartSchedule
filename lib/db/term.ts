import { createClient } from "@/supabase/server";
import { cache } from "react";

export interface AcademicTerm {
    id: string;
    code: string;
    name: string;
    status: "draft" | "released" | "archived";
    start_date: string | null;
    end_date: string | null;
}

/**
 * Get the currently active academic term.
 * Prioritizes 'released' terms, then 'draft' terms.
 * Orders by created_at descending to get the latest one.
 */
export const getActiveTerm = cache(async (): Promise<AcademicTerm | null> => {
    const supabase = await createClient();

    // First try to find a released term (active semester)
    const { data: releasedTerm } = await supabase
        .from("academic_term")
        .select("*")
        .eq("status", "released")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    if (releasedTerm) {
        return releasedTerm;
    }

    // If no released term, look for a draft term (upcoming semester)
    const { data: draftTerm } = await supabase
        .from("academic_term")
        .select("*")
        .eq("status", "draft")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

    return draftTerm || null;
});
