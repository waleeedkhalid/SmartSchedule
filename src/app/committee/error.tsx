"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function CommitteeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Committee portal error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="flex justify-center">
          <AlertCircle className="h-16 w-16 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">
            Committee Portal Error
          </h1>
          <p className="text-muted-foreground">
            {error.message || "An error occurred in the committee portal"}
          </p>
        </div>

        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={reset}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/committee">
              <Home className="mr-2 h-4 w-4" />
              Committee Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

