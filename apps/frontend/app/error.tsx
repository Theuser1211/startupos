"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Terminal, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Global Error Boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-lg w-full border border-border bg-card rounded p-8 text-center">
        <Terminal className="h-8 w-8 text-destructive mx-auto mb-4" />
        <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-6 font-mono">
          {error.message || "The application encountered an unexpected error."}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <Home className="h-4 w-4" />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
