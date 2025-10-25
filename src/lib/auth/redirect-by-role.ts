import { type UserRole, ensureValidRole } from "./constants";

/**
 * Map roles to their corresponding dashboard paths
 */
const roleToPath: Record<UserRole, string> = {
  student: "/student",
  faculty: "/faculty",
  scheduling_committee: "/committee/scheduler",
  teaching_load_committee: "/committee/teaching-load",
  registrar: "/committee/registrar",
} as const;

/**
 * Get the redirect path for a given user role
 * @param role - The user's role
 * @returns The dashboard path for the role, or /dashboard if invalid
 */
export function redirectByRole(role?: string | null): string {
  if (!role) {
    return "/dashboard";
  }

  const validRole = ensureValidRole(role);
  return roleToPath[validRole] ?? "/dashboard";
}

/**
 * Determine which role is required for a given path
 * @param pathname - The path to check
 * @returns The required role, or null if no specific role is required
 */
export function pathRequiresRole(pathname: string): UserRole | null {
  if (pathname.startsWith("/student")) {
    return "student";
  }

  if (pathname.startsWith("/faculty")) {
    return "faculty";
  }

  if (pathname.startsWith("/committee/scheduler")) {
    return "scheduling_committee";
  }

  if (pathname.startsWith("/committee/teaching-load")) {
    return "teaching_load_committee";
  }

  if (pathname.startsWith("/committee/registrar")) {
    return "registrar";
  }

  return null;
}

/**
 * Check if a path requires authentication
 * @param pathname - The path to check
 * @returns true if the path is protected and requires auth
 */
export function isProtectedPath(pathname: string): boolean {
  if (pathname === "/login") {
    return false;
  }

  return (
    pathname.startsWith("/student") ||
    pathname.startsWith("/faculty") ||
    pathname.startsWith("/committee") ||
    pathname.startsWith("/dashboard")
  );
}

// Re-export UserRole type for convenience
export type { UserRole };
