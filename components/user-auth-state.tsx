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
  const { user, userRole, loading } = useAuth();
  const [isPending, startTransision] = useTransition();
  const queryClient = useQueryClient();

  async function removeUser() {
      startTransision(async () => {
        try {
          // Get token from cookie or localStorage
          const token = document.cookie
            .split('; ')
            .find(row => row.startsWith('auth_token='))
            ?.split('=')[1] || 
            (typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null);
          
          // Use the unified logout API route
          const response = await fetch('/api/v1/auth/logout', {
            method: 'POST',
            headers: {
              'Authorization': token ? `Bearer ${token}` : '',
            },
          });
          
          // Clear all cookies and localStorage using utility
          const { performClientLogoutCleanup } = await import('@/lib/utils/cookie-utils');
          performClientLogoutCleanup();
          
          if (response.ok) {
            queryClient.invalidateQueries({ queryKey: ["user", "userRole"] });
            toast.success("You're logged out!");
            window.location.href = '/login';
          } else {
            // Even if API fails, clear local storage and redirect
            queryClient.invalidateQueries({ queryKey: ["user", "userRole"] });
            toast.success("You're logged out!");
            window.location.href = '/login';
          }
        } catch (error) {
          console.error('Logout error:', error);
          // Clear all cookies and localStorage even on error
          const { performClientLogoutCleanup } = await import('@/lib/utils/cookie-utils');
          performClientLogoutCleanup();
          queryClient.invalidateQueries({ queryKey: ["user", "userRole"] });
          toast.success("You're logged out!");
          window.location.href = '/login';
        }
      });
  }

  return (
    <div className="flex items-center gap-4">
      {loading ? (
        // Show loading state while checking authentication
        <div className="flex items-center gap-2">
          <Icons.spinner className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Loading...</span>
        </div>
      ) : user ? (
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
        <>
          <Button 
            variant="ghost" 
            disabled={isPending} 
            asChild
            className="hover:bg-brand-blue-50 hover:text-brand-blue-700 dark:hover:bg-brand-blue-950/30 dark:hover:text-brand-blue-400"
          >
            <Link href="/login">
              {isPending ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Sign In"
              )}
            </Link>
          </Button>
          <Button 
            disabled={isPending} 
            asChild
            className="bg-brand-blue-600 text-white hover:bg-brand-blue-700 dark:bg-brand-blue-500 dark:hover:bg-brand-blue-600"
          >
            <Link href="/register">
              {isPending ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Get Started"
              )}
            </Link>
          </Button>
        </>
      )}
    </div>
  );
}
