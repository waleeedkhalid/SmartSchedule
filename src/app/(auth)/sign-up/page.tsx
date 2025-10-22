"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Users,
  Calendar,
  Briefcase,
  ClipboardCheck,
} from "lucide-react";
import type { UserRole } from "@/lib/auth/redirect-by-role";
import {
  signUpSchema,
  type SignUpFormData,
} from "@/lib/validations/auth.schemas";

type RoleOption = {
  value: UserRole;
  label: string;
  description: string;
  icon: typeof GraduationCap;
};

const roleOptions: RoleOption[] = [
  {
    value: "student",
    label: "Student",
    description: "Track degree progress and manage course schedules.",
    icon: GraduationCap,
  },
  {
    value: "faculty",
    label: "Faculty",
    description: "Organize teaching load and collaborate on sections.",
    icon: Users,
  },
  {
    value: "scheduling_committee",
    label: "Scheduling Committee",
    description: "Coordinate course offerings and resolve conflicts.",
    icon: Calendar,
  },
  {
    value: "teaching_load_committee",
    label: "Teaching Load Committee",
    description: "Balance faculty assignments and workloads.",
    icon: Briefcase,
  },
  {
    value: "registrar",
    label: "Registrar",
    description: "Manage official academic records and approvals.",
    icon: ClipboardCheck,
  },
];

export default function SignUpPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit: handleFormSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: undefined,
    },
  });

  const roleValue = watch("role");

  const onSubmit = async (data: SignUpFormData) => {
    if (isLoading) {
      return;
    }

    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          fullName: data.fullName,
          role: data.role,
        }),
      });

      const responseData = await response.json();

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error ?? "Unable to create account");
      }

      setSuccessMessage(
        responseData.message ?? "Check your email to verify your account."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/5 to-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 space-y-6">
            <Badge variant="secondary" className="px-4 py-2 gap-2">
              <Sparkles className="h-4 w-4" />
              Create your SmartSchedule account
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Join the SmartSchedule platform
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Sign up to collaborate on timetables, manage course offerings, and
              streamline academic scheduling workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-2">
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl">Create your account</CardTitle>
                <CardDescription>
                  Enter your details to receive a verification email
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="full-name" className="text-sm font-medium">
                      Full name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="full-name"
                      placeholder="Alex Johnson"
                      {...register("fullName")}
                      disabled={isLoading}
                      className="h-11 focus-visible:ring-2"
                      aria-invalid={errors.fullName ? "true" : "false"}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      {...register("email")}
                      disabled={isLoading}
                      className="h-11 focus-visible:ring-2"
                      aria-invalid={errors.email ? "true" : "false"}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">
                      Role <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={roleValue ?? ""}
                      onValueChange={(value) => {
                        setValue("role", value as UserRole, { shouldValidate: true });
                      }}
                      disabled={isLoading}
                    >
                      <SelectTrigger id="role" className="h-11" aria-invalid={errors.role ? "true" : "false"}>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roleOptions.map((option) => {
                          const Icon = option.icon;
                          return (
                            <SelectItem key={option.value} value={option.value}>
                              <span className="flex items-center gap-2">
                                <Icon className="h-4 w-4" />
                                {option.label}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-destructive">
                        {errors.role.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter a secure password"
                        {...register("password")}
                        disabled={isLoading}
                        className="h-11 focus-visible:ring-2"
                        aria-invalid={errors.password ? "true" : "false"}
                      />
                      {errors.password ? (
                        <p className="text-sm text-destructive">
                          {errors.password.message}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground">
                          Must be 6+ characters with uppercase, lowercase, and number
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="confirm-password"
                        className="text-sm font-medium"
                      >
                        Confirm password <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Re-enter your password"
                        {...register("confirmPassword")}
                        disabled={isLoading}
                        className="h-11 focus-visible:ring-2"
                        aria-invalid={errors.confirmPassword ? "true" : "false"}
                      />
                      {errors.confirmPassword && (
                        <p className="text-sm text-destructive">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive" className="border-2">
                      <AlertDescription className="text-sm">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  {successMessage && (
                    <Alert className="border-2 border-emerald-200 dark:border-emerald-900">
                      <AlertDescription className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        {successMessage}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-11 text-base font-medium shadow-sm"
                    disabled={isLoading || !isValid || Boolean(successMessage)}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating your account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Separator />
                <div className="w-full">
                  <Button variant="outline" asChild className="w-full h-11">
                    <Link
                      href="/login"
                      className="inline-flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to login
                    </Link>
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <div className="space-y-6">
              <Card className="border-2 bg-gradient-to-br from-primary/5 via-background to-background">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Role-based access
                  </CardTitle>
                  <CardDescription>
                    Choose the workspace that matches your responsibilities.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {roleOptions.map((option) => {
                    const Icon = option.icon;
                    const isSelected = roleValue === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setValue("role", option.value, { shouldValidate: true })}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          isSelected
                            ? "border-primary bg-primary/5 shadow-sm"
                            : "border-border hover:border-primary/50"
                        }`}
                        disabled={isLoading}
                      >
                        <div className="flex items-center gap-3">
                          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-base">
                              {option.label}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {option.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6 text-primary" />
                    <div>
                      <div className="font-semibold">Verified enrollment</div>
                      <p className="text-sm text-muted-foreground">
                        Secure email verification ensures that only approved
                        users gain access to SmartSchedule dashboards.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-6 w-6 text-primary" />
                    <div>
                      <div className="font-semibold">Protected data</div>
                      <p className="text-sm text-muted-foreground">
                        Supabase row-level security keeps academic records safe
                        while enabling real-time collaboration.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
