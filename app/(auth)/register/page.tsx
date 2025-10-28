import type { Metadata } from "next";
import RegisterForm from "./register-form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";

export const metadata: Metadata = {
  title: "Create Account - SmartSchedule",
  description: "Create your SmartSchedule account to get started with intelligent schedule management",
};

export default function SignupPage() {
  return (
    <Card className="w-full max-w-md shadow-lg border-2">
      <CardHeader className="space-y-3 text-center pb-6">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Icons.userPlus className="h-6 w-6 text-primary" />
        </div>
        <CardTitle className="text-3xl font-bold tracking-tight">
          Create Your Account
        </CardTitle>
        <CardDescription className="text-base">
          Join SmartSchedule to streamline your scheduling experience
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <RegisterForm />
      </CardContent>
      <CardFooter className="flex flex-col pt-4 border-t">
        <p className="text-center text-xs text-muted-foreground">
          By creating an account, you agree to our{" "}
          <a href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </a>
          .
        </p>
      </CardFooter>
    </Card>
  );
}
