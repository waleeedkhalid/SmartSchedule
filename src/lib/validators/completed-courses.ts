import { z } from "zod";

export const dbCompletedCourseSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid(),
  course_code: z.string().min(1),
  grade: z.string().nullable().optional(),
  semester: z.string().nullable().optional(),
  year: z.number().int().nullable().optional(),
  created_at: z.string(),
});

export type DBCompletedCourseInput = z.infer<typeof dbCompletedCourseSchema>;
