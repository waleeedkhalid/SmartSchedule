"use client";

import { roleDefinitions } from "@/data/dashboard";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRole } from "./role-context";
import type { RoleKey } from "@/types/dashboard";

export function RoleSwitcher({ className }: { className?: string }) {
  const { role, setRole } = useRole();

  return (
    <Select value={role} onValueChange={(value) => setRole(value as RoleKey)}>
      <SelectTrigger
        className={cn("w-52 justify-between border-muted", className)}
        aria-label="Switch role"
        data-test="role-switcher"
      >
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent align="end" className="w-60">
        {roleDefinitions.map((definition) => (
          <SelectItem key={definition.key} value={definition.key} className="flex items-start gap-2">
            <div className="flex flex-col gap-0">
              <span className="text-sm font-medium">{definition.label}</span>
              <span className="text-xs text-muted-foreground">{definition.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
