"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

// Lazy load heavy password input and alert components
const PasswordInput = dynamic(
  () =>
    import("@/components/ui/password-input").then((mod) => mod.PasswordInput),
  {
    ssr: false,
    loading: () => <Input type="password" placeholder="Loading..." disabled />,
  }
);
const Alert = dynamic(
  () => import("@/components/ui/alert").then((mod) => mod.Alert),
  { ssr: false }
);
const AlertDescription = dynamic(
  () => import("@/components/ui/alert").then((mod) => mod.AlertDescription),
  { ssr: false }
);

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .min(1, "Email is required")
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password is required"),
});

interface DemoAccount {
  role: string;
  email: string;
  password: string;
  label: string;
  icon: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "student",
    email: "b5ab2a545c@webxio.pro",
    password: "b5ab2a545c@webxio.proL",
    label: "Student Demo",
    icon: "👨‍🎓",
  },
  {
    role: "faculty",
    email: "a20d4fd8b6@webxio.pro",
    password: "a20d4fd8b6@webxio.proL",
    label: "Faculty Demo",
    icon: "👨‍🏫",
  },
  {
    role: "registrar",
    email: "77d084fd11@webxio.pro",
    password: "77d084fd11@webxio.proL",
    label: "Registrar Demo",
    icon: "📋",
  },
  {
    role: "teaching_load",
    email: "02e8f16a47@webxio.pro",
    password: "02e8f16a47@webxio.proL",
    label: "Teaching Load Demo",
    icon: "📚",
  },
  {
    role: "scheduling",
    email: "26f34aa5bb@webxio.pro",
    password: "26f34aa5bb@webxio.proL",
    label: "Scheduler Demo",
    icon: "📅",
  },
];

export default function LoginForm() {
  const [isPending, setIsPending] = useState(false);
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const confirmationMessage = searchParams.get("confirmed");

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Auto-focus email field on mount
  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  // Show confirmation toast if user just confirmed email
  useEffect(() => {
    if (confirmationMessage === "true") {
      toast.success("Email confirmed! You can now sign in.");
    }
  }, [confirmationMessage]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setIsPending(true);
      try {
        const response = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const result = await response.json();

        if (!response.ok) {
          const errorMessage = result.error?.toLowerCase() || "Login failed";
          if (
            errorMessage.includes("invalid") ||
            errorMessage.includes("credentials") ||
            errorMessage.includes("password")
          ) {
            toast.error("Invalid email or password. Please try again.");
          } else if (
            errorMessage.includes("email") &&
            errorMessage.includes("confirm")
          ) {
            toast.error("Please confirm your email address before signing in.");
          } else {
            toast.error(
              "Unable to sign in. Please check your credentials and try again."
            );
          }
          return;
        }

        // Cookies are now set by the API route, no need to set them client-side
        // Invalidate queries to refresh user data
        queryClient.invalidateQueries({ queryKey: ["user"] });

        // Redirect based on role
        const role = result.data?.user?.role;
        let dashboardPath = "/dashboard";
        if (role === "student") {
          dashboardPath = "/dashboard/student";
        } else if (role === "faculty") {
          dashboardPath = "/dashboard/faculty";
        } else if (role === "scheduling") {
          dashboardPath = "/dashboard/scheduling";
        } else if (role === "teaching_load") {
          dashboardPath = "/dashboard/teaching-load";
        } else if (role === "registrar") {
          dashboardPath = "/dashboard/registrar";
        }

        toast.success("Welcome back!");

        // Use window.location for a full page reload to ensure cookies are available
        // This ensures middleware can see the cookies immediately
        const finalPath =
          redirectTo === "/dashboard" ? dashboardPath : redirectTo;
        window.location.href = finalPath;
      } catch (error) {
        console.error("Login error:", error);
        toast.error("An error occurred during login. Please try again.");
      } finally {
        setIsPending(false);
      }
    },
    [queryClient, redirectTo]
  );

  const onSubmit = useCallback(
    async (values: z.infer<typeof loginSchema>) => {
      await handleLogin(values.email, values.password);
    },
    [handleLogin]
  );

  const handleDemoAccountClick = useCallback(
    (account: DemoAccount) => {
      form.setValue("email", account.email, { shouldValidate: true });
      form.setValue("password", account.password, { shouldValidate: true });
    },
    [form]
  );

  return (
    <div className="grid gap-6">
      {confirmationMessage === "true" && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <Icons.checkCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Your email has been confirmed successfully. Please sign in to
            continue.
          </AlertDescription>
        </Alert>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your.email@example.com"
                    autoComplete="email"
                    {...field}
                    ref={(e) => {
                      field.ref(e);
                      emailInputRef.current = e;
                    }}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-muted-foreground hover:text-primary 
                      underline-offset-4 hover:underline"
                    tabIndex={-1}
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <PasswordInput
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full mt-6" disabled={isPending}>
            {isPending ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Icons.login className="mr-2 h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Demo Accounts
          </span>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {DEMO_ACCOUNTS.map((account) => (
          <button
            key={`${account.role}-${account.email}`}
            type="button"
            onClick={() => handleDemoAccountClick(account)}
            disabled={isPending}
            className="flex items-center justify-start px-3 py-2 text-sm font-medium border border-brand-blue-200 rounded-md bg-brand-blue-50 text-brand-blue-900 hover:bg-brand-blue-100 hover:border-brand-blue-300 hover:shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-brand-blue-900/20 dark:border-brand-blue-800 dark:text-brand-blue-100 dark:hover:bg-brand-blue-900/40 dark:hover:border-brand-blue-700"
          >
            <span className="mr-2">{account.icon}</span>
            <span className="flex-1 text-left">{account.label}</span>
            <span className="text-xs text-brand-blue-700 dark:text-brand-blue-300">
              {account.email}
            </span>
          </button>
        ))}
      </div>{" "}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            New to SmartSchedule?
          </span>
        </div>
      </div>
      <Button variant="outline" asChild>
        <Link href="/register">
          Create an account
          <Icons.arrowRight className="ml-2 h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}
