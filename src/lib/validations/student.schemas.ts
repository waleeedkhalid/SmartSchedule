import { z } from "zod";

/**
 * Student-specific validation schemas
 */

// Student number validation
// Format: YYYGXXXXX (Y=year, G=gender [1=male, 0=female], X=digit, total 9 chars)
export const studentNumberSchema = z
  .string()
  .length(9, "Student number must be exactly 9 characters")
  .regex(
    /^\d{3}[01]\d{5}$/,
    "Student number must be in format YYYGXXXXX (Y=year, G=gender, X=digit)"
  )
  .refine(
    (val: string) => {
      const year = parseInt(val.slice(0, 3), 10);
      return year >= 100 && year <= 999; // Accept any 3-digit year for now
    },
    {
      message: "Student number year must be a valid 3-digit year (YYYGXXXXX)",
    }
  );

// Level validation (4-8 for senior students)
export const studentLevelSchema = z
  .number({
    message: "Level is required",
  })
  .int("Level must be a whole number")
  .min(4, "Level must be between 4 and 8")
  .max(8, "Level must be between 4 and 8");

// String version for form inputs
export const studentLevelStringSchema = z
  .string()
  .min(1, "Please select your level")
  .refine((val: string) => !isNaN(Number(val)), "Level must be a number")
  .transform((val: string) => Number(val))
  .pipe(studentLevelSchema);

// Student setup form schema (input with string level)
export const studentSetupFormSchema = z.object({
  studentNumber: studentNumberSchema,
  level: studentLevelStringSchema,
});

// Output type (after transformation)
export type StudentSetupFormData = z.infer<typeof studentSetupFormSchema>;

// Input type (before transformation, for form state)
export type StudentSetupFormInput = z.input<typeof studentSetupFormSchema>;

// Student login schema (for electives page)
export const studentLoginSchema = z.object({
  studentNumber: studentNumberSchema,
  password: z.string().min(1, "Password is required"),
});

export type StudentLoginFormData = z.infer<typeof studentLoginSchema>;

// Student feedback schema
export const studentFeedbackSchema = z.object({
  courseCode: z.string().min(1, "Course code is required"),
  rating: z.number().min(1).max(5),
  feedback: z
    .string()
    .min(10, "Feedback must be at least 10 characters")
    .max(1000, "Feedback is too long (max 1000 characters)"),
});

export type StudentFeedbackFormData = z.infer<typeof studentFeedbackSchema>;
