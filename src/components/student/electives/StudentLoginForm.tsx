// Student Login Form Component
"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Eye, EyeOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  studentLoginSchema,
  type StudentLoginFormData,
} from "@/lib/validations/student.schemas";

export interface StudentLoginData {
  studentId: string;
  password: string;
  rememberMe: boolean;
}

export interface StudentSession {
  studentId: string;
  name: string;
  level: number;
  completedCourses: string[];
  email?: string;
}

interface StudentLoginFormProps {
  onLogin: (data: StudentLoginData) => Promise<StudentSession>;
  onSuccess?: (session: StudentSession) => void;
}

export function StudentLoginForm({
  onLogin,
  onSuccess,
}: StudentLoginFormProps) {
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, isValid },
  } = useForm<StudentLoginFormData>({
    resolver: zodResolver(studentLoginSchema),
    mode: "onChange",
    defaultValues: {
      studentNumber: "",
      password: "",
    },
  });

  const onSubmit = async (data: StudentLoginFormData) => {
    setError(null);
    setLoading(true);

    try {
      const session = await onLogin({
        studentId: data.studentNumber,
        password: data.password,
        rememberMe,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess?.(session);
      }, 800);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Login Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Redirecting to elective selection...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <div className="flex justify-center mb-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl">🎓</span>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">
          Welcome to SmartSchedule
        </CardTitle>
        <CardDescription className="text-center">
          Student Elective Selection Portal
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleFormSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="studentId">
              Student Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="studentId"
              placeholder="e.g. 2025-12345"
              {...register("studentNumber")}
              disabled={loading}
              autoComplete="username"
              aria-invalid={errors.studentNumber ? "true" : "false"}
            />
            {errors.studentNumber && (
              <p className="text-sm text-destructive">
                {errors.studentNumber.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                disabled={loading}
                autoComplete="current-password"
                aria-invalid={errors.password ? "true" : "false"}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm font-normal cursor-pointer"
            >
              Remember me
            </Label>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {loading ? "Logging in..." : "Login"}
          </Button>

          <div className="flex justify-between w-full text-sm">
            <button
              type="button"
              className="text-muted-foreground hover:text-primary transition-colors"
              disabled={loading}
            >
              Forgot password?
            </button>
            <button
              type="button"
              className="text-muted-foreground hover:text-primary transition-colors"
              disabled={loading}
            >
              Need help?
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
}
