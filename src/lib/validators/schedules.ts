import { z } from "zod";

export const normalizedTimeSlotSchema = z.object({
  day: z.number().int().min(1).max(5),
  startMinutes: z.number().int().min(0),
  endMinutes: z.number().int().min(0),
  room: z.string().optional(),
});

export const scheduleDataSchema = z.object({
  id: z.string(),
  sections: z.array(
    z.object({
      course: z.object({
        courseId: z.number(),
        courseCode: z.string(),
        courseName: z.string(),
        section: z.string(),
        activity: z.string(),
        hours: z.string(),
        status: z.string(),
        sectionMeetings: z.array(
          z.object({
            day: z.number().int().min(1).max(5),
            startMinutes: z.number().int().min(0),
            endMinutes: z.number().int().min(0),
            room: z.string().optional(),
          })
        ),
        instructor: z.string(),
        examDay: z.string(),
        examTime: z.string(),
        examDate: z.string(),
        sectionAllocations: z.string(),
        parentLectureId: z.number().optional(),
        linkedSectionId: z.number().optional(),
      }),
      normalizedSlots: z.array(normalizedTimeSlotSchema),
      examSlot: z
        .object({
          day: z.number().int().min(1).max(5),
          startMinutes: z.number().int().min(0),
          endMinutes: z.number().int().min(0),
          date: z.string(),
        })
        .optional(),
    })
  ),
  score: z.number(),
  conflicts: z.array(z.string()),
  metadata: z.object({
    totalHours: z.number(),
    daysUsed: z.array(z.number().int()),
    earliestStart: z.number().int(),
    latestEnd: z.number().int(),
    totalGaps: z.number().int(),
  }),
});

export const dbStudentScheduleSchema = z.object({
  id: z.string().uuid(),
  student_id: z.string().uuid(),
  semester: z.string(),
  schedule_data: z.unknown(), // validated separately when needed
  generated_at: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type DBStudentScheduleInput = z.infer<typeof dbStudentScheduleSchema>;

export function isValidScheduleData(value: unknown): boolean {
  const result = scheduleDataSchema.safeParse(value);
  return result.success;
}
