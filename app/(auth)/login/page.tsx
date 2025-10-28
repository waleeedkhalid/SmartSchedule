import type { Metadata } from "next";
import LoginForm from "./login-form";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Sign In - SmartSchedule",
  description: "Sign in to your SmartSchedule account to manage schedules, courses, and more",
};

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md shadow-lg border-2">
      <CardHeader className="space-y-3 text-center pb-6">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Icons.login className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-base">
          Sign in to access your SmartSchedule dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <Suspense fallback={<div className="flex justify-center py-8">
          <Icons.spinner className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>}>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
