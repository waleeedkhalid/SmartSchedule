"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Mail,
  Lock,
  CheckCircle2,
  Users,
  Calendar,
  Briefcase,
  ClipboardCheck,
  GraduationCap,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";

type DemoAccount = {
  full_name: string;
  email: string;
  role: string;
};

const roleIcons = {
  student: GraduationCap,
  faculty: Users,
  scheduling_committee: Calendar,
  teaching_load_committee: Briefcase,
  registrar: ClipboardCheck,
};

const roleConfig = {
  student: {
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-500/5 hover:bg-blue-500/10",
    border: "border-blue-200 dark:border-blue-900",
    text: "text-blue-700 dark:text-blue-300",
  },
  faculty: {
    gradient: "from-purple-500 to-pink-500",
    bg: "bg-purple-500/5 hover:bg-purple-500/10",
    border: "border-purple-200 dark:border-purple-900",
    text: "text-purple-700 dark:text-purple-300",
  },
  scheduling_committee: {
    gradient: "from-emerald-500 to-teal-500",
    bg: "bg-emerald-500/5 hover:bg-emerald-500/10",
    border: "border-emerald-200 dark:border-emerald-900",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  teaching_load_committee: {
    gradient: "from-amber-500 to-orange-500",
    bg: "bg-amber-500/5 hover:bg-amber-500/10",
    border: "border-amber-200 dark:border-amber-900",
    text: "text-amber-700 dark:text-amber-300",
  },
  registrar: {
    gradient: "from-rose-500 to-red-500",
    bg: "bg-rose-500/5 hover:bg-rose-500/10",
    border: "border-rose-200 dark:border-rose-900",
    text: "text-rose-700 dark:text-rose-300",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [loadingDemoAccounts, setLoadingDemoAccounts] = useState(true);

  useEffect(() => {
    const fetchDemoAccounts = async () => {
      try {
        const res = await fetch("/api/demo-accounts", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data)) setDemoAccounts(data);
      } catch (err) {
        console.error("Failed to fetch demo accounts:", err);
      } finally {
        setLoadingDemoAccounts(false);
      }
    };
    fetchDemoAccounts();
  }, []);

  const handleDemoAccountClick = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword(account.email);
    setSelectedRole(account.role);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const signInResponse = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role: selectedRole ?? undefined,
        }),
      });

      const signInData = await signInResponse.json();

      if (!signInResponse.ok || !signInData.success) {
        throw new Error(signInData.error ?? "Unable to sign in");
      }

      try {
        await fetch("/api/auth/bootstrap", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: selectedRole ?? undefined }),
        });
      } catch (bootstrapError) {
        console.warn("Bootstrap onboarding error", bootstrapError);
      }

      router.replace(signInData.redirect ?? "/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  console.log(demoAccounts);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/5 to-background">
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 space-y-6">
            <Badge variant="secondary" className="px-4 py-2 gap-2">
              <Sparkles className="h-4 w-4" />
              Demo accounts ready to explore
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Welcome back
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Sign in to access your personalized dashboard with real-time
              scheduling and collaboration tools.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-20">
            <div className="order-2 lg:order-1">
              <Card className="border-2">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-2xl">
                    Sign in to your account
                  </CardTitle>
                  <CardDescription>
                    Enter your credentials or choose a demo account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">
                        Email address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setSelectedRole(null);
                          }}
                          className="pl-10 h-11 focus-visible:ring-2"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setSelectedRole(null);
                          }}
                          className="pl-10 h-11 focus-visible:ring-2"
                          required
                          disabled={isLoading}
                          minLength={6}
                        />
                      </div>
                    </div>

                    {error && (
                      <Alert variant="destructive" className="border-2">
                        <AlertDescription className="text-sm">
                          {error}
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-medium shadow-sm"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing you in...
                        </>
                      ) : (
                        <>
                          Sign In
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <Separator />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        or
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" asChild className="w-full h-11">
                    <Link href="/">Return to homepage</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="order-1 lg:order-2">
              <Card className="border-2 bg-gradient-to-br from-primary/5 via-background to-background">
                <CardHeader className="space-y-2">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Quick access
                  </CardTitle>
                  <CardDescription>
                    Try the platform instantly with pre-configured demo accounts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {loadingDemoAccounts ? (
                    <div className="flex flex-col items-center justify-center py-12 space-y-3">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Loading accounts...
                      </span>
                    </div>
                  ) : (
                    demoAccounts.map((account) => {
                      console.log(account);
                      const Icon =
                        roleIcons[account.role as keyof typeof roleIcons];
                      const config =
                        roleConfig[account.role as keyof typeof roleConfig];

                      return (
                        <button
                          key={account.email}
                          onClick={() => handleDemoAccountClick(account)}
                          className={`w-full p-4 rounded-lg border-2 ${config.border} ${config.bg} transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98] text-left group`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${config.gradient} shadow-sm`}
                            >
                              <Icon className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div
                                className={`font-semibold ${config.text} truncate`}
                              >
                                {account.full_name}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {account.role
                                  .split("_")
                                  .map(
                                    (w) =>
                                      w.charAt(0).toUpperCase() + w.slice(1)
                                  )
                                  .join(" ")}
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform shrink-0" />
                          </div>
                        </button>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="border-t pt-16">
            <div className="text-center mb-12 space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">
                Everything you need, instantly available
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Real-time data synchronization and intelligent automation built
                for academic scheduling
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-2 hover:border-primary/40 transition-colors">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg">
                    <CheckCircle2 className="h-7 w-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">Real-time sync</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Live data updates from Supabase ensure everyone sees the
                      latest schedules and changes
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/40 transition-colors">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                    <ShieldCheck className="h-7 w-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">Role-based security</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Granular permissions and access controls keep sensitive
                      data secure and organized
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/40 transition-colors">
                <CardContent className="pt-6 text-center space-y-4">
                  <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg">
                    <Zap className="h-7 w-7 text-white" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">
                      Intelligent automation
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      AI-powered conflict detection and schedule generation save
                      hours of manual work
                    </p>
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
