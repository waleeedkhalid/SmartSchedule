import { createClient } from "@/supabase/server";

export interface ElectiveCommentStat {
  course_code: string;
  total_comments: number;
  unresolved_comments: number;
}

/**
 * Get aggregated statistics for elective comments grouped by course
 * @returns Array of comment statistics per course
 */
export async function getElectiveCommentStats(): Promise<ElectiveCommentStat[]> {
  const supabase = await createClient();

  // Get all elective comments
  const { data: comments, error: commentError } = await supabase
    .from("elective_comment")
    .select("course_code, is_resolved");

  if (commentError) {
    throw new Error(`Failed to fetch elective comments: ${commentError.message}`);
  }

  // Group comments by course_code
  const statsMap = new Map<string, ElectiveCommentStat>();

  comments?.forEach((comment) => {
    const courseCode = comment.course_code;

    if (!statsMap.has(courseCode)) {
      statsMap.set(courseCode, {
        course_code: courseCode,
        total_comments: 0,
        unresolved_comments: 0,
      });
    }

    const stat = statsMap.get(courseCode)!;
    stat.total_comments++;

    if (!comment.is_resolved) {
      stat.unresolved_comments++;
    }
  });

  // Convert map to array and sort by course_code
  return Array.from(statsMap.values()).sort((a, b) =>
    a.course_code.localeCompare(b.course_code)
  );
}

