import { z } from "zod";
import type { DBStudentProfile } from "@/lib/types";

export const dbStudentSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  student_id: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  level: z.number().int().nonnegative(),
  major: z.string().min(1),
  gpa: z.string().regex(/^\d(?:\.\d{1,2})?$/), // DECIMAL(3,2) as string like "3.75"
  completed_credits: z.number().int().nonnegative(),
  total_credits: z.number().int().nonnegative(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type DBStudentInput = z.infer<typeof dbStudentSchema>;

export function assertDBStudent(value: unknown): asserts value is DBStudentProfile {
  dbStudentSchema.parse(value);
}

// Schema for student profile API response (no longer a DB view; derived from students table)
export const studentProfileSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  student_id: z.string(),
  name: z.string(),
  email: z.string().email(),
  level: z.number().int(),
  major: z.string(),
  gpa: z.string(),
  completed_credits: z.number().int(),
  total_credits: z.number().int(),
  // Note: completed_courses removed from DB schema; derive from registration/transcript if needed
});

export type StudentProfileInput = z.infer<typeof studentProfileSchema>;
