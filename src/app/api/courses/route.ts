// PRD: Feature 2 - API Layer (GET /api/courses)
// Returns course offerings. Phase 1: in-memory store; Phase 2: Supabase persistence.

import { NextResponse } from "next/server";
import { courseOfferingService } from "@/lib/data-store";
import type { CourseOffering } from "@/lib/types";

interface ApiResponse<T> {
  readonly data: T;
  readonly meta?: Record<string, unknown>;
}

/**
 * GET /api/courses
 */
export async function GET(): Promise<Response> {
  const items: ReadonlyArray<CourseOffering> = courseOfferingService.findAll();
  const body: ApiResponse<ReadonlyArray<CourseOffering>> = {
    data: items,
  };
  return NextResponse.json(body, { status: 200 });
}
