import { studentProfileSchema } from "@/lib/validators/students";

export type StudentProfileApi = {
  userId: string;
  studentId: string;
  name: string;
  email: string;
  level: number;
  major: string;
  gpa: number;
  completedCredits: number;
  totalCredits: number;
  // Note: completedCourses removed from DB; derive from registration/transcript when needed
};

export function toStudentProfileApi(row: unknown): StudentProfileApi {
  const parsed = studentProfileSchema.parse(row);
  return {
    userId: parsed.user_id,
    studentId: parsed.student_id,
    name: parsed.name,
    email: parsed.email,
    level: parsed.level,
    major: parsed.major,
    gpa: Number(parsed.gpa) || 0,
    completedCredits: parsed.completed_credits,
    totalCredits: parsed.total_credits,
  };
}
