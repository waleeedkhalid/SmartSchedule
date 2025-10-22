import { z } from "zod";

/**
 * Authentication validation schemas
 */

// Email validation
export const emailSchema = z
  .string()
  .min(1, "Email is required")
  .email("Invalid email address")
  .max(255, "Email is too long");

// Password validation
export const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters")
  .max(128, "Password is too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  );

// Simple password (for login)
export const loginPasswordSchema = z
  .string()
  .min(1, "Password is required")
  .max(128, "Password is too long");

// Full name validation
export const fullNameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(120, "Name is too long")
  .regex(/^[a-zA-Z\s'-]+$/, "Name can only contain letters, spaces, hyphens, and apostrophes");

// Sign in schema
export const signInSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export type SignInFormData = z.infer<typeof signInSchema>;

// Sign up schema
export const signUpSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, "Please confirm your password"),
  fullName: fullNameSchema,
  role: z.enum([
    "student",
    "faculty",
    "scheduling_committee",
    "teaching_load_committee",
    "registrar",
  ], {
    message: "Please select a role",
  }),
}).refine(
  (data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }
);

export type SignUpFormData = z.infer<typeof signUpSchema>;
