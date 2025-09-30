// GET /api/preferences - Get current user's preferences
// POST /api/preferences - Save/update preferences

import { NextResponse } from "next/server";
import {
  preferenceService,
  courseOfferingService,
  configService,
} from "@/lib/data-store";

// Mock current user ID (replace with real auth in Phase 4)
const MOCK_STUDENT_ID = "student-1";

export async function GET() {
  try {
    const preferences = preferenceService.findByStudent(MOCK_STUDENT_ID);

    // Enrich with course data
    const enrichedPreferences = preferences
      .map((pref) => ({
        ...pref,
        course: courseOfferingService.findByCode(pref.courseCode),
      }))
      .sort((a, b) => a.priority - b.priority);

    return NextResponse.json(enrichedPreferences);
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return NextResponse.json(
      { error: "Failed to fetch preferences" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { preferences } = body; // Array of { courseId, priority }

    if (!Array.isArray(preferences)) {
      return NextResponse.json(
        { error: "Preferences must be an array" },
        { status: 400 }
      );
    }

    const config = configService.get();
    const maxPreferences = config.maxElectivePreferences;

    // Validation
    if (preferences.length > maxPreferences) {
      return NextResponse.json(
        { error: `Maximum ${maxPreferences} preferences allowed` },
        { status: 400 }
      );
    }

    // Check for duplicate courses
    const courseIds = preferences.map((p) => p.courseId);
    if (new Set(courseIds).size !== courseIds.length) {
      return NextResponse.json(
        { error: "Cannot select the same course multiple times" },
        { status: 400 }
      );
    }

    // Validate all courses exist and are electives
    for (const pref of preferences) {
      const course = courseOfferingService.findByCode(pref.courseCode);
      if (!course) {
        return NextResponse.json(
          { error: `Course not found: ${pref.courseCode}` },
          { status: 404 }
        );
      }
      if (course.type !== "ELECTIVE") {
        return NextResponse.json(
          { error: `Course ${course.code} is not an elective` },
          { status: 400 }
        );
      }
    }

    // Delete existing preferences for this student
    preferenceService.deleteByStudent(MOCK_STUDENT_ID);

    // Create new preferences
    const createdPreferences = preferences.map((pref) =>
      preferenceService.create({
        studentId: MOCK_STUDENT_ID,
        courseCode: pref.courseCode,
        priority: pref.priority,
      })
    );

    console.log("Preferences saved:", createdPreferences);

    return NextResponse.json(createdPreferences, { status: 201 });
  } catch (error) {
    console.error("Error saving preferences:", error);
    return NextResponse.json(
      { error: "Failed to save preferences" },
      { status: 500 }
    );
  }
}
