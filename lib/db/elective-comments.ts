import { createClient } from "@/supabase/server";

export interface ElectiveCommentStat {
  course_code: string;
  total_comments: number;
}

export interface ElectiveComment {
  id: string;
  student_id: string;
  course_code: string;
  comment: string;
  created_at: string;
  course: {
    title: string;
  } | null;
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
    .select("course_code");

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
      });
    }

    const stat = statsMap.get(courseCode)!;
    stat.total_comments++;
  });

  // Convert map to array and sort by course_code
  return Array.from(statsMap.values()).sort((a, b) =>
    a.course_code.localeCompare(b.course_code)
  );
}

/**
 * Get all elective comments with course details
 */
export async function getElectiveComments(): Promise<ElectiveComment[]> {
  const supabase = await createClient();

  const { data: comments, error } = await supabase
    .from("elective_comment")
    .select(`
      id,
      student_id,
      course_code,
      comment,
      created_at,
      course:course_code(title)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch elective comments: ${error.message}`);
  }

  return (comments || []).map((c) => ({
    ...c,
    course: Array.isArray(c.course) ? c.course[0] : c.course,
  }));
}

