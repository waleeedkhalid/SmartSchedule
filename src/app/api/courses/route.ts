// PRD: Feature 2 - API Layer (GET /api/courses)
// Returns course offerings. Phase 1: in-memory store; Phase 2: Supabase persistence.

import { NextResponse } from "next/server";
import { fetchCourseOfferingsFromDB } from "@/lib/course-queries";
import type { CourseOffering } from "@/lib/types";

interface ApiResponse<T> {
  readonly data: T;
  readonly meta?: Record<string, unknown>;
}

/**
 * GET /api/courses
 */
export async function GET(): Promise<Response> {
  const items: ReadonlyArray<CourseOffering> =
    await fetchCourseOfferingsFromDB();
  const body: ApiResponse<ReadonlyArray<CourseOffering>> = {
    data: items,
    meta: { source: "supabase" },
  };
  return NextResponse.json(body, { status: 200 });
}
