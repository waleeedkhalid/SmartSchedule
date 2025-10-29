import { NextResponse } from "next/server";
import { createClient } from "@/supabase/server";
import { 
  getElectivePreferencesByStudent,
  bulkUpdateElectivePreferences,
  getElectivePreferenceStats
} from "@/lib/db/elective-preferences";

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if requesting stats (for scheduling committee)
    const { searchParams } = new URL(request.url);
    const statsParam = searchParams.get('stats');
    
    if (statsParam === 'true') {
      // Verify user has scheduling role
      const { data: userRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!userRole || userRole.role !== 'scheduling') {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      
      const stats = await getElectivePreferenceStats();
      return NextResponse.json(stats);
    }
    
    // Get preferences for current user
    const preferences = await getElectivePreferencesByStudent(user.id);
    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching elective preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch elective preferences" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { preferences } = body;
    
    if (!Array.isArray(preferences)) {
      return NextResponse.json(
        { error: "Invalid preferences format" },
        { status: 400 }
      );
    }
    
    const updated = await bulkUpdateElectivePreferences(user.id, preferences);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating elective preferences:", error);
    return NextResponse.json(
      { error: "Failed to update elective preferences" },
      { status: 500 }
    );
  }
}

