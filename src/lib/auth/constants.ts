/**
 * Authentication Constants
 * Centralized auth-related constants and types used across the application
 */

/**
 * User role type definition
 */
export type UserRole =
  | "student"
  | "faculty"
  | "scheduling_committee"
  | "teaching_load_committee"
  | "registrar";

/**
 * All available user roles
 */
export const USER_ROLES: readonly UserRole[] = [
  "student",
  "faculty",
  "scheduling_committee",
  "teaching_load_committee",
  "registrar",
] as const;

/**
 * Role display names for UI
 */
export const ROLE_LABELS: Record<UserRole, string> = {
  student: "Student",
  faculty: "Faculty",
  scheduling_committee: "Scheduling Committee",
  teaching_load_committee: "Teaching Load Committee",
  registrar: "Registrar",
} as const;

/**
 * Default role for new users or when role cannot be determined
 */
export const DEFAULT_ROLE: UserRole = "student";

/**
 * Check if a string is a valid user role
 */
export function isValidRole(role: unknown): role is UserRole {
  return typeof role === "string" && USER_ROLES.includes(role as UserRole);
}

/**
 * Ensure a role value is valid, returning default if not
 */
export function ensureValidRole(role?: string | null): UserRole {
  return isValidRole(role) ? role : DEFAULT_ROLE;
}

