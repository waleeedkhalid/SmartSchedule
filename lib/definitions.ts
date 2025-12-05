/**
 * Authentication Form Definitions
 *
 * Zod schemas and types for authentication forms.
 * These are used for server-side validation in Server Actions.
 *
 * @see https://nextjs.org/docs/app/guides/authentication
 */

import { z } from "zod";

// ============================================================================
// User Roles
// ============================================================================

export const userRoles = [
  "student",
  "faculty",
  "scheduling",
  "teaching_load",
  "registrar",
] as const;

export type UserRole = (typeof userRoles)[number];

// ============================================================================
// Login Schema
// ============================================================================

export const LoginFormSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .trim(),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .max(128, { message: "Password is too long" }),
});

export type LoginFormData = z.infer<typeof LoginFormSchema>;

// ============================================================================
// Signup Schema
// ============================================================================

export const SignupFormSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long" })
    .max(120, { message: "Name is too long" })
    .trim(),
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Please enter a valid email address" })
    .trim(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .max(128, { message: "Password is too long" })
    .regex(/[a-zA-Z]/, { message: "Password must contain at least one letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^a-zA-Z0-9]/, {
      message: "Password must contain at least one special character",
    }),
  role: z.enum(userRoles, {
    errorMap: () => ({ message: "Please select a valid role" }),
  }),
});

export type SignupFormData = z.infer<typeof SignupFormSchema>;

// ============================================================================
// Form State Types (for useActionState)
// ============================================================================

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type SignupFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        role?: string[];
      };
      message?: string;
    }
  | undefined;
