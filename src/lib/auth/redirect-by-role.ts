export type UserRole =
  | "student"
  | "faculty"
  | "scheduling_committee"
  | "teaching_load_committee"
  | "registrar";

const roleToPath: Record<UserRole, string> = {
  student: "/student",
  faculty: "/faculty",
  scheduling_committee: "/committee/scheduler",
  teaching_load_committee: "/committee/teaching-load",
  registrar: "/committee/registrar",
};

export function redirectByRole(role?: string | null) {
  if (!role) {
    return "/dashboard";
  }

  return roleToPath[role as UserRole] ?? "/dashboard";
}

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

export function isProtectedPath(pathname: string) {
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
