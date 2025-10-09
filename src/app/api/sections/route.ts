// PRD: Feature 2 - API Layer (GET /api/sections)
// Returns flattened sections across all course offerings.

import { NextResponse } from "next/server";
import { courseOfferingService } from "@/lib/data-store";
import type { Section } from "@/lib/types";

interface ApiResponse<T> {
  readonly data: T;
  readonly meta?: Record<string, unknown>;
}

/**
 * GET /api/sections
 */
export async function GET(): Promise<Response> {
  const sections: ReadonlyArray<Section> = courseOfferingService
    .findAll()
    .flatMap((c) => c.sections);
  const body: ApiResponse<ReadonlyArray<Section>> = { data: sections };
  return NextResponse.json(body, { status: 200 });
}
