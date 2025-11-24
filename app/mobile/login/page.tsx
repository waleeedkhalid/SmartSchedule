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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DEMO_ACCOUNTS } from "@/lib/demo-data";

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
      router.push("/mobile/schedule");
    } catch (err) {
      // Error is handled by store
      console.error("Login failed:", err);
    }
  };

  const handleDemoLogin = async (role: keyof typeof DEMO_ACCOUNTS) => {
    clearError();
    const account = DEMO_ACCOUNTS[role];
    
    try {
      await login({ email: account.email, password: account.password });
      router.push("/mobile/schedule");
    } catch (err) {
      console.error("Demo login failed:", err);
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

          {/* Demo Account Quick Login */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground mb-3 text-center">
              Demo Accounts (Password: demo123)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("student")}
                disabled={isLoading}
                className="text-xs"
              >
                Student
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("faculty")}
                disabled={isLoading}
                className="text-xs"
              >
                Faculty
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("scheduling")}
                disabled={isLoading}
                className="text-xs"
              >
                Scheduling
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("teaching_load")}
                disabled={isLoading}
                className="text-xs"
              >
                Load
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleDemoLogin("registrar")}
                disabled={isLoading}
                className="text-xs col-span-2"
              >
                Registrar
              </Button>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mt-4 text-center">
            This is a PWA demonstration of platform-agnostic API integration.
            The same APIs work for React Native, iOS, and Android clients.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

