/**
 * API Validation Schemas
 * Zod schemas for input validation
 */

import { z } from "zod";

// ============================================================================
// Query Parameter Schemas
// ============================================================================

export const termCodeSchema = z.object({
  term_code: z.string().min(1, "Term code is required"),
});

export const courseCodeSchema = z.object({
  course_code: z.string().min(1, "Course code is required"),
});

// ============================================================================
// Student Management Schemas
// ============================================================================

export const studentQuerySchema = z.object({
  term_code: z.string().min(1),
  level: z.number().int().min(1).max(8).optional(),
  department: z.string().optional(),
});

// ============================================================================
// Course Management Schemas
// ============================================================================

export const courseToggleSchema = z.object({
  course_code: z.string().min(1).max(10),
  is_active: z.boolean(),
  term_code: z.string().min(1),
});

export const courseCreateSchema = z.object({
  code: z.string().min(1).max(10),
  name: z.string().min(1).max(200),
  credits: z.number().int().min(1).max(6),
  level: z.number().int().min(1).max(8),
  type: z.enum(["REQUIRED", "ELECTIVE"]),
  department: z.string().min(1),
  is_swe_managed: z.boolean().default(false),
});

export const courseUpdateSchema = courseCreateSchema.partial().extend({
  code: z.string().min(1).max(10), // code is required for update
});

// ============================================================================
// Elective Survey Schemas
// ============================================================================

export const surveySettingsSchema = z.object({
  is_open: z.boolean(),
  term_code: z.string().min(1),
  open_date: z.string().optional(),
  close_date: z.string().optional(),
});

export const surveyResponseSchema = z.object({
  student_id: z.string().uuid(),
  term_code: z.string().min(1),
  preferences: z.array(
    z.object({
      course_code: z.string(),
      priority: z.number().int().min(1).max(10),
    })
  ).min(1).max(10),
});

// ============================================================================
// Section Management Schemas
// ============================================================================

export const sectionCreateSchema = z.object({
  course_code: z.string().min(1),
  term_code: z.string().min(1),
  capacity: z.number().int().min(1).max(300),
  room_id: z.string().uuid().optional(),
  section_type: z.enum(["LECTURE", "LAB", "TUTORIAL"]),
  instructor_id: z.string().uuid().optional(),
});

export const sectionUpdateSchema = sectionCreateSchema.partial().extend({
  id: z.string().uuid(), // id is required for update
  status: z.enum(["DRAFT", "PUBLISHED", "CANCELLED"]).optional(),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate and parse data with a Zod schema
 * Throws ValidationError on failure
 */
export function validateSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    
    throw {
      statusCode: 400,
      message: "Validation failed",
      code: "VALIDATION_ERROR",
      details: errors,
    };
  }
  
  return result.data;
}

