"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/lib/supabase-client";
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
  Sparkles
} from "lucide-react";

interface DemoAccount {
  email: string;
  password: string;
  role: string;
  name: string;
}

const roleIcons = {
  student: GraduationCap,
  faculty: Users,
  scheduling_committee: Calendar,
  teaching_load_committee: Briefcase,
  registrar: ClipboardCheck,
};

const roleColors = {
  student: "from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-600",
  faculty: "from-purple-500/10 to-pink-500/10 border-purple-500/20 text-purple-600",
  scheduling_committee: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-emerald-600",
  teaching_load_committee: "from-amber-500/10 to-orange-500/10 border-amber-500/20 text-amber-600",
  registrar: "from-rose-500/10 to-red-500/10 border-rose-500/20 text-rose-600",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [demoAccounts, setDemoAccounts] = useState<DemoAccount[]>([]);
  const [loadingDemoAccounts, setLoadingDemoAccounts] = useState(true);

  // Fetch demo accounts on component mount
  useEffect(() => {
    const fetchDemoAccounts = async () => {
      try {
        const response = await fetch('/api/demo-accounts');
        const data = await response.json();
        if (data.success) {
          setDemoAccounts(data.accounts);
        }
      } catch (err) {
        console.error('Failed to fetch demo accounts:', err);
      } finally {
        setLoadingDemoAccounts(false);
      }
    };

    fetchDemoAccounts();
  }, []);

  const handleDemoAccountClick = (account: DemoAccount) => {
    setEmail(account.email);
    setPassword(account.password);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      try {
        const bootstrapResponse = await fetch("/api/auth/bootstrap", {
          method: "POST",
        });

        if (!bootstrapResponse.ok) {
          console.warn("Bootstrap onboarding failed", bootstrapResponse.statusText);
        }
      } catch (bootstrapError) {
        console.warn("Bootstrap onboarding error", bootstrapError);
      }

      // Get user role and redirect accordingly
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('user')
          .select('role')
          .eq('id', user.id)
          .single();

        if (userData) {
          // Redirect based on role
          switch (userData.role) {
            case 'student':
              router.push('/student');
              break;
            case 'faculty':
              router.push('/faculty');
              break;
            case 'scheduling_committee':
              router.push('/committee/scheduler');
              break;
            case 'teaching_load_committee':
              router.push('/committee/teaching-load');
              break;
            case 'registrar':
              router.push('/committee/registrar');
              break;
            default:
              router.push('/dashboard');
          }
        } else {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="SmartSchedule"
              width={32}
              height={32}
            />
            <span className="text-xl font-bold">SmartSchedule</span>
          </Link>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Demo Accounts Available
              </span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight mb-4">
              Sign in to <span className="text-primary">SmartSchedule</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Access your role-based dashboard with live Supabase data and automated scheduling capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Demo Accounts Panel */}
            <Card className="border-2 border-dashed border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Demo Accounts
                </CardTitle>
                <CardDescription>
                  Click any role to auto-fill credentials and sign in instantly
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingDemoAccounts ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading demo accounts...</span>
                  </div>
                ) : (
                  demoAccounts.map((account) => {
                    const Icon = roleIcons[account.role as keyof typeof roleIcons];
                    const colors = roleColors[account.role as keyof typeof roleColors];
                    
                    return (
                      <Button
                        key={account.email}
                        variant="outline"
                        className={`w-full justify-start h-auto p-4 border-2 ${colors} hover:scale-[1.02] transition-all`}
                        onClick={() => handleDemoAccountClick(account)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${colors}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium">{account.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {account.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </div>
                          </div>
                          <ArrowRight className="h-4 w-4 opacity-50" />
                        </div>
                      </Button>
                    );
                  })
                )}
              </CardContent>
            </Card>

            {/* Sign In Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Sign In
                </CardTitle>
                <CardDescription>
                  Use your credentials or demo account to access the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={isLoading}
                        minLength={6}
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </form>

                <Separator className="my-6" />

                <div className="text-center space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Don&apos;t have an account?
                  </p>
                  <Button variant="outline" asChild className="w-full">
                    <Link href="/">Back to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Section */}
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Live Data Integration</h2>
              <p className="text-muted-foreground">
                All data is fetched from Supabase in real-time
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="text-center p-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Real-time Data</h3>
                <p className="text-sm text-muted-foreground">
                  All information is fetched live from Supabase
                </p>
              </Card>
              
              <Card className="text-center p-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Role-based Access</h3>
                <p className="text-sm text-muted-foreground">
                  Secure access based on user roles and permissions
                </p>
              </Card>
              
              <Card className="text-center p-6">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 mb-4">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Automated Scheduling</h3>
                <p className="text-sm text-muted-foreground">
                  AI-powered schedule generation with conflict detection
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
