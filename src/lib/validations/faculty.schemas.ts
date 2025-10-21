import { z } from "zod";

/**
 * Faculty-specific validation schemas
 */

// Faculty titles enum
export const facultyTitles = [
  "Dr.",
  "Prof.",
  "Mr.",
  "Ms.",
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Teaching Assistant",
] as const;

// Faculty ID validation
export const facultyIdSchema = z
  .string()
  .min(1, "Faculty ID is required")
  .max(16, "Faculty ID must be at most 16 characters")
  .regex(/^[A-Za-z]+$/, "Faculty ID must contain only letters (no numbers or special characters)");

// Faculty title validation
export const facultyTitleSchema = z.enum(facultyTitles, {
  message: "Please select your title",
});

// Faculty setup form schema
export const facultySetupFormSchema = z.object({
  facultyId: facultyIdSchema,
  title: facultyTitleSchema,
});

export type FacultySetupFormData = z.infer<typeof facultySetupFormSchema>;

// Faculty availability schema (for time slots)
export const timeSlotSchema = z.object({
  day: z.enum(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"], {
    message: "Please select a day",
  }),
  startTime: z
    .string()
    .min(1, "Start time is required")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
  endTime: z
    .string()
    .min(1, "End time is required")
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
}).refine(
  (data: { startTime: string; endTime: string }) => {
    const start = new Date(`2000-01-01T${data.startTime}`);
    const end = new Date(`2000-01-01T${data.endTime}`);
    return end > start;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export type TimeSlotFormData = z.infer<typeof timeSlotSchema>;

// Faculty availability form schema
export const facultyAvailabilitySchema = z.object({
  timeSlots: z.array(timeSlotSchema).min(1, "At least one time slot is required"),
});

export type FacultyAvailabilityFormData = z.infer<typeof facultyAvailabilitySchema>;
