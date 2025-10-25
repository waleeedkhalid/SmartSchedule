import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import type { Course } from "@/types";

export const dynamic = "force-dynamic";

/**
 * GET /api/student/electives
 * Fetches all active elective packages with their courses for preference survey
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(cookieStore);

    // Get the current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all active elective packages
    const { data: packages, error: packagesError } = await supabase
      .from("elective_package")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (packagesError) {
      console.error("Error fetching packages:", packagesError);
      return NextResponse.json(
        { error: "Failed to fetch elective packages" },
        { status: 500 }
      );
    }

    // Fetch all elective courses with their package mappings
    const { data: packageCourses, error: packageCoursesError } = await supabase
      .from("package_course")
      .select(`
        package_id,
        course_code,
        course:course!inner(
          code,
          name,
          description,
          credits,
          level,
          prerequisites,
          type
        )
      `)
      .eq("course.type", "ELECTIVE");

    if (packageCoursesError) {
      console.error("Error fetching package courses:", packageCoursesError);
      return NextResponse.json(
        { error: "Failed to fetch courses" },
        { status: 500 }
      );
    }

    // Transform the data into the expected format
    const electivePackages = packages?.map((pkg) => {
      // Filter courses for this package
      const pkgCourses = packageCourses
        ?.filter((pc) => pc.package_id === pkg.id)
        .map((pc) => {
          const course = pc.course as unknown as Course;
          return {
            code: course.code,
            name: course.name,
            credits: course.credits,
            description: course.description || "",
            prerequisites: course.prerequisites || [],
            level: course.level,
          };
        }) || [];

      return {
        id: pkg.id,
        label: pkg.name,
        description: pkg.description,
        minHours: pkg.min_credits,
        maxHours: pkg.max_credits,
        courses: pkgCourses,
      };
    }) || [];

    // Timeline-based feature gate: Check for active elective survey event
    const now = new Date().toISOString();
    const { data: electiveSurveyEvent } = await supabase
      .from("term_events")
      .select("term_code, title, start_date, end_date")
      .eq("event_type", "elective_survey")
      .lte("start_date", now)
      .gte("end_date", now)
      .maybeSingle();
    
    // Get term info if survey is active
    let activeTerm = null;
    if (electiveSurveyEvent) {
      const { data: termData } = await supabase
        .from("academic_term")
        .select("code, name")
        .eq("code", electiveSurveyEvent.term_code)
        .single();
      
      if (termData) {
        activeTerm = {
          code: termData.code,
          name: termData.name,
          electives_survey_open: true,
        };
      }
    }

    // Get student's existing preferences for the active survey term (including status)
    let currentPreferences: { code: string; priority: number }[] = [];
    let preferenceStatus: "DRAFT" | "SUBMITTED" | null = null;
    let submittedAt: string | null = null;
    
    if (activeTerm) {
      const { data: preferences } = await supabase
        .from("elective_preferences")
        .select("course_code, preference_order, status, submitted_at")
        .eq("student_id", user.id)
        .eq("term_code", activeTerm.code)
        .order("preference_order", { ascending: true });

      if (preferences && preferences.length > 0) {
        currentPreferences = preferences.map((p) => ({
          code: p.course_code,
          priority: p.preference_order,
        }));
        // All preferences should have same status, take first one
        preferenceStatus = preferences[0].status as "DRAFT" | "SUBMITTED";
        submittedAt = preferences[0].submitted_at;
      }
    }

    // Completed courses - commented out for now to show all electives
    // const { data: enrollments, error: enrollmentError } = await supabase
    //   .from("enrollment")
    //   .select("course_code")
    //   .eq("student_id", user.id)
    //   .eq("status", "COMPLETED");
    // const completedCourses = enrollments?.map((e) => e.course_code) || [];

    return NextResponse.json({
      electivePackages,
      completedCourses: [], // Empty for now - all electives will appear as eligible
      currentPreferences,
      preferenceStatus,
      submittedAt,
      surveyTerm: activeTerm || null,
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
