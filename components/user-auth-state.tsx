"use client";

import { useAuth } from "@/lib/auth-context";
import React, { useTransition } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { logOut } from "@/app/(auth)/actions";
import { Icons } from "@/components/ui/icons";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { UserRole } from "@/lib/types/database";
import { cn } from "@/lib/utils";

const roleLabels: Record<UserRole, string> = {
  scheduling: "Scheduling",
  teaching_load: "Teaching Load",
  faculty: "Faculty",
  student: "Student",
  registrar: "Registrar",
};

const roleBadgeColors: Record<UserRole, string> = {
  scheduling: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  teaching_load: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  faculty: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  student: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  registrar: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default function UserAuthState() {
  const { user, userRole } = useAuth();
  const [isPending, startTransision] = useTransition();
  const queryClient = useQueryClient();

  async function removeUser() {
    startTransision(async () => {
      const response = await logOut();
      if (response?.error) {
        toast.error("Oops Something went wrong!");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["user", "userRole"] });
      toast.success("you're Logged Out!");
    });
  }

  return (
    <div className="flex items-center gap-4">
      {user ? (
        <DropdownMenu>
          <DropdownMenuTrigger disabled={isPending}>
            <Avatar className="relative">
              {isPending && (
                <div className="absolute top-0 right-0 w-full h-full flex items-center justify-center bg-slate-400">
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                </div>
              )}
              <AvatarImage
                src={user?.user_metadata?.avatar_url || ""}
                alt="User Avatar"
              />
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userRole?.name || "User"}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                {userRole && (
                  <Badge className={cn("mt-1 w-fit", roleBadgeColors[userRole.role])}>
                    {roleLabels[userRole.role]}
                  </Badge>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={"/dashboard"}>Dashboard</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <button 
                onClick={removeUser} 
                disabled={isPending}
                className="w-full cursor-pointer"
              >
                {isPending ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Log Out"
                )}
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button disabled={isPending} asChild>
          <Link href={"/login"}>
            {isPending ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Verify Now"
            )}
          </Link>
        </Button>
      )}
    </div>
  );
}
