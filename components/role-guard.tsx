"use client";

import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/types/database";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
  redirectTo?: string;
}

export function RoleGuard({ allowedRoles, children, redirectTo = "/dashboard" }: RoleGuardProps) {
  const { userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && userRole && !allowedRoles.includes(userRole.role)) {
      router.push(redirectTo);
    }
  }, [userRole, loading, allowedRoles, redirectTo, router]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <p className="text-center text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 dark:text-gray-400">
              You don&apos;t have permission to access this page. Please contact an administrator if you believe this is an error.
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!allowedRoles.includes(userRole.role)) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="h-5 w-5" />
                Access Denied
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 dark:text-gray-400">
              <p>Your role ({userRole.role}) does not have permission to access this page.</p>
              <p className="mt-2">Required roles: {allowedRoles.join(", ")}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

