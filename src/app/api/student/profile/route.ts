import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/utils/supabase/server";

// /api/student/profile?userId=...
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "userId parameter is required" },
      { status: 400 }
    );
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  // Verify the requesting user is authenticated
  const {
    data: { user: authUser },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !authUser) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Verify the requesting user can access this profile
  // Users can only access their own profile unless they're admin/committee
  const { data: requestingUserProfile } = await supabase
    .from("users")
    .select("role")
    .eq("id", authUser.id)
    .maybeSingle();

  const requestingRole = requestingUserProfile?.role;
  const isAdminOrCommittee = [
    "scheduling_committee",
    "teaching_load_committee",
    "registrar",
  ].includes(requestingRole);

  if (!isAdminOrCommittee && authUser.id !== userId) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  // Fetch student profile
  const { data: student, error: studentError } = await supabase
    .from("students")
    .select(
      `
      id,
      student_number,
      level,
      status
    `
    )
    .eq("id", userId)
    .maybeSingle();

  if (studentError) {
    return NextResponse.json(
      { success: false, error: studentError.message },
      { status: 500 }
    );
  }

  if (!student) {
    return NextResponse.json(
      { success: false, error: "Student profile not found" },
      { status: 404 }
    );
  }

  // Fetch user data for name and email
  const { data: userProfile } = await supabase
    .from("users")
    .select("id, full_name, email, role")
    .eq("id", userId)
    .maybeSingle();

  // Combine student and user data
  const studentProfile = {
    user_id: userProfile?.id,
    name: userProfile?.full_name ?? authUser.user_metadata?.full_name ?? "",
    email: userProfile?.email ?? authUser.email ?? "",
    student_number: student.student_number,
    student_id: student.student_number, // Alias for backward compatibility
    level: student.level,
    status: student.status,
    // gpa: student.gpa,
    // completed_credits: student.completed_credits,
    // total_credits: student.total_credits,
    // academic_status: student.academic_status,
    // enrollment_date: student.enrollment_date,
    // expected_graduation_date: student.expected_graduation_date,
    // advisor_id: student.advisor_id,
  };

  return NextResponse.json({
    success: true,
    student: studentProfile,
  });
}
