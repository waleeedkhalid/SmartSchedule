import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SchedulingRulesConfig } from "@/types/scheduler";

/**
 * GET /api/committee/scheduler/rules
 * Get rules configuration for a specific term
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const termCode = searchParams.get("term_code");

    if (!termCode) {
      return NextResponse.json(
        { error: "term_code is required" },
        { status: 400 }
      );
    }

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get rules configuration
    const { data: rulesConfig, error } = await supabase
      .from("scheduling_rules_config")
      .select("*")
      .eq("term_code", termCode)
      .eq("is_active", true)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 is "no rows returned"
      console.error("Error fetching rules config:", error);
      return NextResponse.json(
        { error: "Failed to fetch rules configuration" },
        { status: 500 }
      );
    }

    // If no rules config exists, return default configuration
    if (!rulesConfig) {
      const defaultConfig = getDefaultRulesConfig(termCode);
      return NextResponse.json({
        success: true,
        data: defaultConfig,
        isDefault: true,
      });
    }

    return NextResponse.json({
      success: true,
      data: rulesConfig,
      isDefault: false,
    });
  } catch (error) {
    console.error("Rules GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/committee/scheduler/rules
 * Create or update rules configuration
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { term_code, rules, priority_weights } = body;

    if (!term_code || !rules || !priority_weights) {
      return NextResponse.json(
        { error: "term_code, rules, and priority_weights are required" },
        { status: 400 }
      );
    }

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate rules configuration
    const validation = validateRulesConfig({ rules, priority_weights });
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(", ") },
        { status: 400 }
      );
    }

    // Check if configuration exists
    const { data: existingConfig } = await supabase
      .from("scheduling_rules_config")
      .select("id")
      .eq("term_code", term_code)
      .eq("is_active", true)
      .single();

    let result;

    if (existingConfig) {
      // Update existing configuration
      result = await supabase
        .from("scheduling_rules_config")
        .update({
          rules,
          priority_weights,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingConfig.id)
        .select()
        .single();
    } else {
      // Create new configuration
      result = await supabase
        .from("scheduling_rules_config")
        .insert({
          term_code,
          rules,
          priority_weights,
          is_active: true,
          created_by: user.id,
        })
        .select()
        .single();
    }

    if (result.error) {
      console.error("Error saving rules config:", result.error);
      return NextResponse.json(
        { error: "Failed to save rules configuration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: existingConfig
        ? "Rules configuration updated successfully"
        : "Rules configuration created successfully",
    });
  } catch (error) {
    console.error("Rules POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/committee/scheduler/rules
 * Deactivate rules configuration
 */
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const termCode = searchParams.get("term_code");

    if (!termCode) {
      return NextResponse.json(
        { error: "term_code is required" },
        { status: 400 }
      );
    }

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Deactivate configuration
    const { error } = await supabase
      .from("scheduling_rules_config")
      .update({ is_active: false })
      .eq("term_code", termCode)
      .eq("is_active", true);

    if (error) {
      console.error("Error deactivating rules config:", error);
      return NextResponse.json(
        { error: "Failed to deactivate rules configuration" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Rules configuration deactivated successfully",
    });
  } catch (error) {
    console.error("Rules DELETE error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Default rules configuration
function getDefaultRulesConfig(termCode: string): SchedulingRulesConfig {
  return {
    term_code: termCode,
    rules: {
      // Time constraints
      max_daily_hours: 8,
      min_gap_between_classes: 10,
      max_gap_between_classes: 180,
      earliest_class_time: "08:00",
      latest_class_time: "18:00",

      // Weekly constraints
      max_weekly_hours: 21,
      preferred_days_off: [],
      allow_back_to_back: true,

      // Section constraints
      max_students_per_section: 35,
      min_students_per_section: 15,
      allow_section_overflow: true,
      overflow_percentage: 10,

      // Faculty constraints
      respect_faculty_availability: true,
      max_faculty_daily_hours: 8,
      min_gap_between_faculty_classes: 15,

      // Exam constraints
      min_days_between_exams: 2,
      avoid_exam_conflicts: true,
      max_exams_per_day: 2,

      // Elective preferences
      honor_elective_preferences: true,
      min_preference_rank_to_honor: 3,

      // Room constraints
      require_room_assignment: true,
      respect_room_capacity: true,
    },
    priority_weights: {
      time_preference: 0.2,
      faculty_preference: 0.2,
      elective_preference: 0.15,
      minimize_gaps: 0.15,
      room_optimization: 0.15,
      load_balancing: 0.15,
    },
    is_active: false,
    created_by: "",
  };
}

// Validate rules configuration
function validateRulesConfig(config: {
  rules: SchedulingRulesConfig["rules"];
  priority_weights: SchedulingRulesConfig["priority_weights"];
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate time constraints
  if (config.rules.max_daily_hours <= 0 || config.rules.max_daily_hours > 24) {
    errors.push("max_daily_hours must be between 1 and 24");
  }

  if (
    config.rules.min_gap_between_classes < 0 ||
    config.rules.min_gap_between_classes > 240
  ) {
    errors.push("min_gap_between_classes must be between 0 and 240 minutes");
  }

  // Validate priority weights sum to approximately 1.0
  const weightSum = Object.values(config.priority_weights).reduce(
    (sum, weight) => sum + weight,
    0
  );

  if (Math.abs(weightSum - 1.0) > 0.01) {
    errors.push("Priority weights must sum to 1.0");
  }

  // Validate each weight is between 0 and 1
  Object.entries(config.priority_weights).forEach(([key, value]) => {
    if (value < 0 || value > 1) {
      errors.push(`${key} weight must be between 0 and 1`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}
