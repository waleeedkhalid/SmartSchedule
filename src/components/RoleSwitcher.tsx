"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

type Role = "SCHEDULING" | "TEACHING_LOAD" | "FACULTY" | "STUDENT" | "REGISTRAR";

const roleLabels: Record<Role, string> = {
  SCHEDULING: "Scheduling Committee",
  TEACHING_LOAD: "Teaching Load Committee",
  FACULTY: "Faculty",
  STUDENT: "Student",
  REGISTRAR: "Registrar"
};

export function RoleSwitcher() {
  const [currentRole, setCurrentRole] = useState<Role>("SCHEDULING");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserCircle className="h-4 w-4" />
          <span>{roleLabels[currentRole]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.entries(roleLabels).map(([role, label]) => (
          <DropdownMenuItem
            key={role}
            onClick={() => setCurrentRole(role as Role)}
            className="flex items-center gap-2"
          >
            <span>{label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
