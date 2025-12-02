/**
 * Student Exams Endpoint
 *
 * GET /api/v1/exams/me
 *
 * Returns exams for courses the authenticated student is enrolled in.
 * Only returns exams if the schedule is released.
 */

import { NextRequest } from "next/server";
import { authenticateRequest, requireRole } from "@/lib/api/auth-utils";
import { createSuccessResponse, handleApiError } from "@/lib/api/error-handler";
import { createClient } from "@/supabase/server";
import { extractJoinedRelation } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    requireRole(user, ["student"]);

    const supabase = await createClient();

    // Check for active academic term (draft or released)
    const { data: currentTerm, error: termError } = await supabase
      .from("academic_term")
      .select("id, status, code, name")
      .in("status", ["draft", "released"])
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (termError || !currentTerm) {
      return createSuccessResponse(
        {
          exams: [],
          total_exams: 0,
          has_conflicts: false,
          is_empty: true,
          message: "No active academic term found.",
        },
        200
      );
    }

    // Get all course codes the student is enrolled in
    const { data: enrollments, error: enrollError } = await supabase
      .from("student_enrollment")
      .select(
        `
        section:section_id (
          course_code,
          section_no
        )
      `
      )
      .eq("student_id", user.id)
      .eq("status", "registered");

    if (enrollError) {
      throw enrollError;
    }

    // Extract course codes and section numbers from enrollments
    interface EnrollmentWithSection {
      section?: {
        course_code?: string;
        section_no?: string;
      };
    }

    let courseCodes: string[] = [];
    const courseSectionMap = new Map<string, string[]>();

    if (enrollments && enrollments.length > 0) {
      courseCodes = (enrollments as EnrollmentWithSection[])
        .map((e) => e.section?.course_code)
        .filter((code): code is string => !!code);

      // Build section map for enrolled courses
      (enrollments as EnrollmentWithSection[]).forEach((e) => {
        const courseCode = e.section?.course_code;
        const sectionNo = e.section?.section_no;
        if (courseCode && sectionNo) {
          if (!courseSectionMap.has(courseCode)) {
            courseSectionMap.set(courseCode, []);
          }
          courseSectionMap.get(courseCode)!.push(sectionNo);
        }
      });
    }

    // If no enrollments, try to get courses for the student's level from their academic plan
    if (courseCodes.length === 0) {
      // Fallback: Get courses based on student's level from course table
      const studentLevel = user.level || 1;
      const levelPrefix = studentLevel.toString();

      // Try to get courses at student's level (course codes typically have level in them like SWE 3xx for level 3)
      const { data: levelCourses } = await supabase
        .from("course")
        .select("code")
        .like("code", `SWE ${levelPrefix}%`);

      if (levelCourses && levelCourses.length > 0) {
        courseCodes = levelCourses.map((c: { code: string }) => c.code);
      }
    }

    // If still no course codes, return empty
    if (courseCodes.length === 0) {
      return createSuccessResponse(
        {
          exams: [],
          total_exams: 0,
          has_conflicts: false,
          is_empty: true,
          message:
            "No courses found for your current enrollment or academic level.",
        },
        200
      );
    }

    // Get exams for these courses
    const { data: exams, error: examsError } = await supabase
      .from("exam")
      .select(
        `
        id,
        course_code,
        date,
        start_time,
        duration_minutes,
        room_codes,
        course:course_code (
          code,
          title
        )
      `
      )
      .in("course_code", courseCodes)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (examsError) {
      throw examsError;
    }

    if (!exams || exams.length === 0) {
      return createSuccessResponse(
        {
          exams: [],
          total_exams: 0,
          has_conflicts: false,
          is_empty: true,
          message:
            "No exams have been scheduled for your enrolled courses yet.",
        },
        200
      );
    }

    // Transform exams and detect conflicts
    interface ExamWithCourse {
      id: string;
      course_code: string;
      date: string;
      start_time: string;
      duration_minutes: number;
      room_codes: string[] | null;
      course?:
        | {
            code: string;
            title: string;
          }
        | Array<{
            code: string;
            title: string;
          }>;
    }
    const examData = (exams as ExamWithCourse[]).map((exam) => {
      const courseCode = exam.course_code;
      const sectionNos = courseSectionMap.get(courseCode) || [];

      // Safely extract joined relation (can be array from Supabase)
      const course = extractJoinedRelation(exam.course);

      // Calculate end time
      exam.start_time.split(":").map(Number);
      const startDate = new Date(`${exam.date}T${exam.start_time}`);
      const endDate = new Date(
        startDate.getTime() + exam.duration_minutes * 60000
      );
      const endTime = `${endDate
        .getHours()
        .toString()
        .padStart(2, "0")}:${endDate
        .getMinutes()
        .toString()
        .padStart(2, "0")}:00`;

      return {
        id: exam.id,
        course_code: courseCode,
        course_title: course?.title || "",
        section_no: sectionNos.length > 0 ? sectionNos.join(", ") : null,
        date: exam.date,
        start_time: exam.start_time,
        duration_minutes: exam.duration_minutes,
        end_time: endTime,
        room_codes: exam.room_codes || [],
        has_conflict: false, // Will be calculated below
        conflicting_exams: [],
      };
    });

    // Detect conflicts (exams on same date with overlapping times)
    const conflicts: { [key: string]: boolean } = {};
    const conflictingExams: {
      [key: string]: Array<{ course_code: string; course_title: string }>;
    } = {};

    for (let i = 0; i < examData.length; i++) {
      const exam1 = examData[i];
      for (let j = i + 1; j < examData.length; j++) {
        const exam2 = examData[j];

        // Check if same date
        if (exam1.date === exam2.date) {
          // Parse times to minutes for comparison
          const parseTime = (time: string): number => {
            const [hours, minutes] = time.split(":").map(Number);
            return hours * 60 + minutes;
          };

          const exam1Start = parseTime(exam1.start_time);
          const exam1End = exam1Start + exam1.duration_minutes;
          const exam2Start = parseTime(exam2.start_time);
          const exam2End = exam2Start + exam2.duration_minutes;

          // Check for overlap
          if (exam1Start < exam2End && exam2Start < exam1End) {
            conflicts[exam1.id] = true;
            conflicts[exam2.id] = true;

            if (!conflictingExams[exam1.id]) {
              conflictingExams[exam1.id] = [];
            }
            if (!conflictingExams[exam2.id]) {
              conflictingExams[exam2.id] = [];
            }

            conflictingExams[exam1.id].push({
              course_code: exam2.course_code,
              course_title: exam2.course_title,
            });
            conflictingExams[exam2.id].push({
              course_code: exam1.course_code,
              course_title: exam1.course_title,
            });
          }
        }
      }
    }

    // Update exam data with conflict information
    const finalExams = examData.map((exam) => ({
      ...exam,
      has_conflict: conflicts[exam.id] || false,
      conflicting_exams: conflictingExams[exam.id] || [],
    }));

    const hasConflicts = Object.keys(conflicts).length > 0;

    return createSuccessResponse(
      {
        exams: finalExams,
        total_exams: finalExams.length,
        has_conflicts: hasConflicts,
        is_empty: false,
      },
      200
    );
  } catch (error) {
    return handleApiError(error);
  }
}
