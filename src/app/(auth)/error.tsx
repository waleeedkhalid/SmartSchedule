"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import Link from "next/link";

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Authentication error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            Authentication Error
          </h1>
          <p className="text-muted-foreground">
            {error.message || "An error occurred during authentication"}
          </p>
        </div>

        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/login">
              <Home className="mr-2 h-4 w-4" />
              Back to Login
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

