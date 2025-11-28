/**
 * Login Screen
 * 
 * PWA login page that demonstrates authentication flow.
 * This screen uses the repository pattern, so it works identically
 * whether the backend is called from PWA, React Native, or native apps.
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/mobile/lib/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/mobile/schedule");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login({ email, password });
      // Check onboarding status after login
      // The onboarding page will handle the redirect logic
      router.push("/mobile/onboarding");
    } catch (err) {
      // Error is handled by store
      // Silently handle - error state is managed by auth store
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            SmartSchedule Mobile
          </CardTitle>
          <CardDescription className="text-center">
            Sign in to access your schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 pt-4 border-t">
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Create one
            </Link>
          </p>
          <Link
            href="/mobile"
            className="text-center text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to home
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}

