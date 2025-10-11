import { z } from "zod";
// Note: student submission views removed; validators reflect current schema

export const dbElectiveSubmissionSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid(),
  submission_id: z.string().min(1),
  submitted_at: z.string(),
  status: z.string().min(1),
  created_at: z.string(),
  updated_at: z.string(),
});
export type DBElectiveSubmissionInput = z.infer<
  typeof dbElectiveSubmissionSchema
>;

export const dbElectivePreferenceSchema = z.object({
  id: z.string().uuid(),
  submission_id: z.string().uuid(),
  student_id: z.string().uuid(),
  course_code: z.string().min(1),
  priority: z.number().int().positive(),
  package_id: z.string().min(1),
  created_at: z.string(),
});
export type DBElectivePreferenceInput = z.infer<
  typeof dbElectivePreferenceSchema
>;

// Removed: studentSubmissionDetailsView schemas (no longer present)
// Payload validation for POST /api/electives/submit
export const electiveSubmissionPayloadSchema = z.object({
  studentId: z.string().min(1), // email or student number depending on API contract
  selections: z
    .array(
      z.object({
        packageId: z.string().min(1),
        courseCode: z.string().min(1),
        priority: z.number().int().positive(),
      })
    )
    .min(1),
});
