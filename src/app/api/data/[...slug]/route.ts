import { NextResponse } from "next/server";
import { join } from "path";
import { readFile } from "fs/promises";

const ALLOWED_FILES = new Set([
  "users.json",
  "courses.json",
  "sections.json",
  "schedules.json",
  "feedback.json",
  "irregularStudents.json",
]);

export async function GET(
  _request: Request,
  context: { params: { slug?: string[] } }
) {
  const { slug = [] } = context.params;

  if (slug.length === 0) {
    return NextResponse.json(
      { error: "Missing data resource." },
      { status: 400 }
    );
  }

  const requested = slug.join("/");
  const fileName = requested.endsWith(".json")
    ? requested
    : `${requested}.json`;

  if (!ALLOWED_FILES.has(fileName)) {
    return NextResponse.json(
      { error: "Resource not found." },
      { status: 404 }
    );
  }

  const filePath = join(process.cwd(), "data", fileName);

  try {
    const fileContents = await readFile(filePath, "utf8");

    return new Response(fileContents, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error(`Failed to read mock data file ${fileName}`, error);
    return NextResponse.json(
      { error: "Failed to load mock data." },
      { status: 500 }
    );
  }
}
