"use client";

import { useState } from "react";
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
  Eye,
  EyeOff,
  AlertCircle,
  UserPlus,
} from "lucide-react";

type UserRole =
  | "student"
  | "faculty"
  | "scheduling_committee"
  | "teaching_load_committee"
  | "registrar";

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
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const validateFullName = (name: string) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 3)
      return "Full name must be at least 3 characters";
    return "";
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return "Email is required";
    if (!emailRegex.test(email)) return "Invalid email format";
    return "";
  };

  // when password is filling and role is not selected then the user skipped the role selection
  const validateRole = (role: UserRole | null) => {
    if (!role) return "Please select a role before typing a password";
    return "";
  };

  const roleError = touchedFields.has("password") ? validateRole(role) : "";

  const validatePassword = (pwd: string) => {
    if (pwd.length < 8) return "Password must be at least 8 characters";
    if (!/[A-Z]/.test(pwd)) return "Include an uppercase letter";
    if (!/[a-z]/.test(pwd)) return "Include a lowercase letter";
    if (!/[0-9]/.test(pwd)) return "Include a number";
    return "";
  };

  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.length >= 12) strength++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) strength++;
    if (/[0-9]/.test(pwd)) strength++;
    if (/[^A-Za-z0-9]/.test(pwd)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength <= 3)
      return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength <= 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const handleBlur = (field: string) => {
    setTouchedFields((prev) => new Set(prev).add(field));
  };

  const fullNameError = touchedFields.has("fullName")
    ? validateFullName(fullName)
    : "";

  const emailError = touchedFields.has("email") ? validateEmail(email) : "";

  const passwordStrength = getPasswordStrength(password);
  const passwordError = touchedFields.has("password")
    ? validatePassword(password)
    : "";
  const confirmPasswordError =
    touchedFields.has("confirmPassword") &&
    confirmPassword &&
    password !== confirmPassword
      ? "Passwords do not match"
      : "";

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isLoading) return;

    setError(null);
    setSuccessMessage(null);

    const fullNameError = validateFullName(fullName);
    if (fullNameError) {
      setError(fullNameError);
      return;
    }

    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    if (!role) {
      setError("Please select a role before continuing.");
      return;
    }

    const pwdValidation = validatePassword(password);
    if (pwdValidation) {
      setError(pwdValidation);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error ?? "Unable to create account");
      }

      setSuccessMessage(
        data.message ?? "Check your email to verify your account."
      );

      // Reset form
      setFullName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setRole(null);
      setTouchedFields(new Set());
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 space-y-6">
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

          <Card className="border-2 bg-gradient-to-br from-primary/5 via-background to-background shadow-md h-fit">
            <CardHeader className="space-y-2">
              <CardTitle className="text-2xl flex items-center gap-2">
                <UserPlus className="h-6 w-6" />
                Create your account
              </CardTitle>
              <CardDescription>
                Enter your details to receive a verification email
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={onSubmit} className="space-y-5">
                {/* Full name */}
                <div className="space-y-2">
                  <Label htmlFor="full-name" className="text-sm font-medium">
                    Full name
                  </Label>
                  <Input
                    id="full-name"
                    placeholder="Alex Johnson"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={() => handleBlur("fullName")}
                    required
                    disabled={isLoading}
                    className={`h-11 focus-visible:ring-2 transition-all ${
                      fullNameError
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  <p className="text-sm text-red-500">{fullNameError}</p>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => handleBlur("email")}
                    required
                    disabled={isLoading}
                    className={`h-11 focus-visible:ring-2 transition-all ${
                      emailError
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }`}
                  />
                  <p className="text-sm text-red-500">{emailError}</p>
                </div>

                {/* Role selection */}
                <div className="space-y-2">
                  <Label
                    htmlFor="role"
                    className={`text-sm font-medium flex items-center gap-2`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    Select your role
                    {roleError && (
                      <span className="text-sm text-red-500">{roleError}</span>
                    )}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {roleOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = role === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => setRole(option.value)}
                          className={`text-left p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-in-out ${
                            isSelected
                              ? "border-primary bg-primary/5 shadow-sm scale-[1.01]"
                              : "border-border hover:border-primary/50 hover:bg-muted/50"
                          }`}
                          disabled={isLoading}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg transition-colors ${
                                isSelected ? "bg-primary/20" : "bg-primary/10"
                              }`}
                            >
                              <Icon
                                className={`h-5 w-5 ${
                                  isSelected
                                    ? "text-primary"
                                    : "text-primary/70"
                                }`}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-base mb-0.5">
                                {option.label}
                              </div>
                              <div className="text-sm text-muted-foreground leading-snug">
                                {option.description}
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Password fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter a secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={() => handleBlur("password")}
                        required
                        disabled={isLoading}
                        className={`h-11 pr-10 focus-visible:ring-2 transition-all ${
                          passwordError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {password && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                              style={{
                                width: `${
                                  (passwordStrength.strength / 5) * 100
                                }%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-muted-foreground min-w-[45px]">
                            {passwordStrength.label}
                          </span>
                        </div>
                      </div>
                    )}
                    {passwordError && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {passwordError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="confirm-password"
                      className="text-sm font-medium"
                    >
                      Confirm password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        onBlur={() => handleBlur("confirmPassword")}
                        required
                        disabled={isLoading}
                        className={`h-11 pr-10 focus-visible:ring-2 transition-all ${
                          confirmPasswordError
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {confirmPasswordError && (
                      <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {confirmPasswordError}
                      </p>
                    )}
                  </div>
                </div>

                {/* Alerts */}
                {error && (
                  <Alert
                    variant="destructive"
                    className="border-2 animate-in fade-in slide-in-from-top-2 duration-300"
                  >
                    <AlertDescription className="text-sm font-medium">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                {successMessage && (
                  <Alert className="border-2 border-emerald-200 dark:border-emerald-900 bg-emerald-50 dark:bg-emerald-950 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertDescription className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium shadow-sm hover:shadow-md transition-all"
                  disabled={isLoading || !role || Boolean(successMessage)}
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

            <CardFooter className="flex flex-col pt-0 pb-2 gap-4">
              <Separator />
              <Button
                variant="outline"
                className="w-full h-11 hover:bg-muted transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
