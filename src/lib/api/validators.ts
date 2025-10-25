/**
 * API Request Validators
 * Zod schemas for API request validation
 */

import { z } from "zod";

// =====================================================
// FEEDBACK VALIDATORS
// =====================================================

export const feedbackSchema = z.object({
  scheduleId: z.string().uuid().optional(),
  feedbackText: z.string().min(10).max(1000),
  rating: z.number().int().min(1).max(5),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

// =====================================================
// ELECTIVE PREFERENCE VALIDATORS
// =====================================================

export const electivePreferenceSchema = z.object({
  electiveId: z.string().uuid(),
  preferenceOrder: z.number().int().min(1),
});

export const electivePreferencesSchema = z.array(electivePreferenceSchema);

export type ElectivePreferenceInput = z.infer<typeof electivePreferenceSchema>;

// =====================================================
// PROFILE VALIDATORS
// =====================================================

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

