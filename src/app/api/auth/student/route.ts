// API Route: Student Authentication (Mock)
import { NextRequest, NextResponse } from "next/server";

export interface StudentAuthRequest {
  studentId: string;
  password: string;
}

export interface StudentAuthResponse {
  success: boolean;
  session?: {
    studentId: string;
    name: string;
    level: number;
    completedCourses: string[];
    email?: string;
  };
  error?: string;
}

// Mock student database
const MOCK_STUDENTS = [
  {
    studentId: "441000001",
    password: "student123",
    name: "Ahmed Al-Rashid",
    level: 6,
    completedCourses: [
      "SWE211",
      "SWE312",
      "CSC111",
      "CSC113",
      "CEN303",
      "MATH151",
      "MATH106",
      "PHY103",
      "PHY104",
      "SWE321",
      "SWE314",
    ],
    email: "ahmed.alrashid@student.ksu.edu.sa",
  },
  {
    studentId: "441000002",
    password: "student123",
    name: "Fatimah Al-Zahrani",
    level: 7,
    completedCourses: [
      "CSC111",
      "MATH151",
      "SWE211",
      "CSC113",
      "CEN303",
      "MATH106",
      "PHY103",
      "PHY104",
      "SWE312",
      "SWE314",
      "SWE321",
      "SWE333",
      "SWE381",
    ],
    email: "fatimah.alzahrani@student.ksu.edu.sa",
  },
  {
    studentId: "test",
    password: "test",
    name: "Test Student",
    level: 6,
    completedCourses: ["SWE211", "CSC111", "CSC113", "MATH151"],
    email: "test@student.ksu.edu.sa",
  },
];

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: StudentAuthRequest = await request.json();

    // Validate input
    if (!body.studentId || !body.password) {
      return NextResponse.json(
        {
          success: false,
          error: "Student ID and password are required.",
        } as StudentAuthResponse,
        { status: 400 }
      );
    }

    // Simulate authentication delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Find student (mock authentication)
    const student = MOCK_STUDENTS.find(
      (s) => s.studentId === body.studentId && s.password === body.password
    );

    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid credentials. Please check your Student ID and password.",
        } as StudentAuthResponse,
        { status: 401 }
      );
    }

    // TODO: Replace with actual authentication (Supabase Auth or custom)
    /*
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: body.studentId + '@university.edu.sa',
      password: body.password,
    });

    if (authError) {
      throw authError;
    }

    // Fetch student profile
    const { data: profile, error: profileError } = await supabase
      .from('students')
      .select('*')
      .eq('student_id', body.studentId)
      .single();

    if (profileError) {
      throw profileError;
    }
    */

    console.log("✅ Student authenticated:", student.studentId, student.name);

    return NextResponse.json(
      {
        success: true,
        session: {
          studentId: student.studentId,
          name: student.name,
          level: student.level,
          completedCourses: student.completedCourses,
          email: student.email,
        },
      } as StudentAuthResponse,
      { status: 200 }
    );
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during authentication. Please try again.",
      } as StudentAuthResponse,
      { status: 500 }
    );
  }
}
