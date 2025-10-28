import { NextResponse } from "next/server";
import { getExamConflicts } from "@/lib/db/exams";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const conflicts = await getExamConflicts(params.id);
    return NextResponse.json(conflicts);
  } catch (error) {
    console.error("Error fetching exam conflicts:", error);
    return NextResponse.json(
      { error: "Failed to fetch exam conflicts" },
      { status: 500 }
    );
  }
}

