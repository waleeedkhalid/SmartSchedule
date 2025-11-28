"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import RegisterForm from "@/app/(auth)/register/register-form";
import Link from "next/link";

export default function MobileRegisterPage() {

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Icons.userPlus className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create Your Account
          </CardTitle>
          <CardDescription className="text-base">
            Join SmartSchedule to streamline your scheduling experience
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-4">
          <RegisterForm />
        </CardContent>
        <CardFooter className="flex flex-col space-y-3 pt-4 border-t">
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
          <Link
            href="/mobile/login"
            className="text-center text-sm text-muted-foreground hover:text-foreground"
          >
            Already have an account? Sign in
          </Link>
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

