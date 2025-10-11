import { z } from "zod";

export const dbStudentFeedbackSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid(),
  feedback_text: z.string().min(1),
  category: z.string().min(1),
  submitted_at: z.string(),
  created_at: z.string(),
});

export type DBStudentFeedbackInput = z.infer<typeof dbStudentFeedbackSchema>;
