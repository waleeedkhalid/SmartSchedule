import type { LucideIcon } from "lucide-react";

export type RoleKey =
  | "student"
  | "faculty"
  | "scheduler"
  | "registrar"
  | "committee";

export type RoleDefinition = {
  key: RoleKey;
  label: string;
  description: string;
  defaultPage: string;
  pages: RolePageDefinition[];
};

export type RolePageDefinition = {
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  badge?: string;
  testId?: string;
};

export type PageIdentifier = {
  role: RoleKey;
  page: string;
};

export function isRoleKey(value: string | undefined | null): value is RoleKey {
  if (!value) return false;
  return ["student", "faculty", "scheduler", "registrar", "committee"].includes(
    value as RoleKey,
  );
}
